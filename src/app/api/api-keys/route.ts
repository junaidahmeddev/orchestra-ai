import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, maskApiKey } from "@/lib/encryption";
import * as z from "zod";

export const dynamic = "force-dynamic";

const createApiKeySchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI"], {
    required_error: "Provider is required",
  }),
  key: z.string().min(1, "API Key is required"),
  label: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await db.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return masked representations only — NEVER return decrypted keys or ciphertext
    const maskedKeys = apiKeys.map((item) => ({
      id: item.id,
      provider: item.provider,
      label: item.label || "Default Key",
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error("GET /api/api-keys error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createApiKeySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { provider, key, label } = result.data;
    const cleanLabel = label?.trim() || "Default Key";

    // Encrypt the API key before saving to DB
    const { ciphertext, iv } = encrypt(key.trim());

    // Upsert key record for this user + provider + label combination
    const savedKey = await db.apiKey.upsert({
      where: {
        userId_provider_label: {
          userId: session.user.id,
          provider,
          label: cleanLabel,
        },
      },
      update: {
        encryptedKey: ciphertext,
        iv,
      },
      create: {
        userId: session.user.id,
        provider,
        encryptedKey: ciphertext,
        iv,
        label: cleanLabel,
      },
    });

    return NextResponse.json(
      {
        id: savedKey.id,
        provider: savedKey.provider,
        label: savedKey.label,
        maskedKey: maskApiKey(key.trim()),
        createdAt: savedKey.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/api-keys error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
