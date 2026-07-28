import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { encrypt, decrypt, maskApiKey } from "./encryption";
import crypto from "crypto";

describe("encryption (AES-256 Unit Tests)", () => {
  const TEST_KEY = crypto.randomBytes(32).toString("hex"); // 64-char hex
  const ORIGINAL_KEY = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    process.env.ENCRYPTION_KEY = ORIGINAL_KEY;
  });

  it("should encrypt and decrypt a plaintext string successfully (round-trip)", () => {
    const plaintext = "sk-proj-secret-openai-api-key-12345";
    const encrypted = encrypt(plaintext);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);

    const decrypted = decrypt(encrypted.ciphertext, encrypted.iv);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertexts for the same plaintext due to random IVs", () => {
    const plaintext = "AIzaSy-gemini-secret-key-9999";
    const run1 = encrypt(plaintext);
    const run2 = encrypt(plaintext);

    expect(run1.iv).not.toBe(run2.iv);
    expect(run1.ciphertext).not.toBe(run2.ciphertext);

    // Both should decrypt back to the same plaintext
    expect(decrypt(run1.ciphertext, run1.iv)).toBe(plaintext);
    expect(decrypt(run2.ciphertext, run2.iv)).toBe(plaintext);
  });

  it("should fail safely when attempting to decrypt with an incorrect key", () => {
    const plaintext = "super-secret-password";
    const encrypted = encrypt(plaintext);

    // Switch to a different key
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");

    expect(() => decrypt(encrypted.ciphertext, encrypted.iv)).toThrow();
  });

  it("should correctly mask sensitive API keys for display", () => {
    expect(maskApiKey("AIzaSy1234567890abcdef")).toBe("AIza...cdef");
    expect(maskApiKey("short")).toBe("••••••••");
    expect(maskApiKey("")).toBe("");
  });
});
