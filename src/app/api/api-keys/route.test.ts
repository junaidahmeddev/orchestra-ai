import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as listApiKeys, POST as createApiKey } from "./route";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import crypto from "crypto";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    apiKey: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("API Keys API Route (Integration Tests)", () => {
  const TEST_KEY = crypto.randomBytes(32).toString("hex");

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENCRYPTION_KEY = TEST_KEY;
  });

  it("should return 401 Unauthorized for GET /api/api-keys when user is not logged in", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await listApiKeys();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return list of masked API keys for GET /api/api-keys when authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@orchestra.ai" },
      expires: "2099-01-01",
    });

    const rawKey = "AIzaSy1234567890abcdef";
    const { ciphertext, iv } = encrypt(rawKey);

    vi.mocked(db.apiKey.findMany).mockResolvedValueOnce([
      {
        id: "key-1",
        userId: "user-123",
        provider: "GEMINI",
        encryptedKey: ciphertext,
        iv,
        label: "My Gemini Key",
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    const res = await listApiKeys();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("key-1");
    expect(data[0].provider).toBe("GEMINI");
    expect(data[0].label).toBe("My Gemini Key");
    expect(data[0].maskedKey).toBe("AIza...cdef");
  });

  it("should save and return masked key on POST /api/api-keys", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-123", email: "user@orchestra.ai" },
      expires: "2099-01-01",
    });

    vi.mocked(db.apiKey.upsert).mockResolvedValueOnce({
      id: "key-saved-1",
      userId: "user-123",
      provider: "GEMINI",
      encryptedKey: "encrypted_hex",
      iv: "iv_hex",
      label: "New Gemini Key",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    const req = new Request("http://localhost:3000/api/api-keys", {
      method: "POST",
      body: JSON.stringify({
        provider: "GEMINI",
        key: "AIzaSy1234567890abcdef",
        label: "New Gemini Key",
      }),
    });

    const res = await createApiKey(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.id).toBe("key-saved-1");
    expect(data.maskedKey).toBe("AIza...cdef");
  });
});
