import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleAIEngine } from "./aiEngine";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { GoogleGenerativeAI } from "@google/generative-ai";

vi.mock("@/lib/db", () => ({
  db: {
    apiKey: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@google/generative-ai", () => {
  const generateContentMock = vi.fn().mockResolvedValue({
    response: {
      text: () => "AI Generated Response Content",
    },
  });
  const getGenerativeModelMock = vi.fn().mockReturnValue({
    generateContent: generateContentMock,
  });
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel = getGenerativeModelMock;
    },
  };
});

describe("handleAIEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("should throw error if userId is missing", async () => {
    await expect(
      handleAIEngine({
        nodeId: "node-1",
        config: {},
        data: {},
        userId: "",
      })
    ).rejects.toThrow("Execution context missing user ID");
  });

  it("should throw error if no API key is found for user", async () => {
    vi.mocked(db.apiKey.findFirst).mockResolvedValue(null);

    await expect(
      handleAIEngine({
        nodeId: "node-1",
        config: { provider: "GEMINI" },
        data: {},
        userId: "user-123",
      })
    ).rejects.toThrow("No Google Gemini API key found");
  });

  it("should successfully decrypt key and execute Gemini generation with variable substitution", async () => {
    const { ciphertext, iv } = encrypt("test-gemini-key");

    vi.mocked(db.apiKey.findFirst).mockResolvedValue({
      id: "key-1",
      userId: "user-123",
      provider: "GEMINI",
      encryptedKey: ciphertext,
      iv: iv,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await handleAIEngine({
      nodeId: "node-1",
      config: {
        provider: "GEMINI",
        model: "gemini-3.6-flash",
        systemPrompt: "You are an assistant for {{user.name}}",
        userPrompt: "Process topic: {{topic}}",
      },
      data: {
        user: { name: "Alice" },
        topic: "AI Workflows",
      },
      userId: "user-123",
    });

    expect(result.output.result).toBe("AI Generated Response Content");
    expect(result.output.provider).toBe("GEMINI");
    expect(result.output.systemPrompt).toBe("You are an assistant for Alice");
  });
});
