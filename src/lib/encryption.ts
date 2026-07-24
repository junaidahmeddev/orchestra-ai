import crypto from "crypto";

/**
 * Helper to retrieve and validate the AES-256 master key from environment variables.
 * Key must be a 64-character hex string representing a 32-byte (256-bit) secret.
 */
function getEncryptionKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY;

  if (!hexKey) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not defined in environment variables."
    );
  }

  const keyBuffer = Buffer.from(hexKey, "hex");

  if (keyBuffer.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be a 32-byte (256-bit) hex string (got ${keyBuffer.length} bytes).`
    );
  }

  return keyBuffer;
}

/**
 * Encrypts clear-text data using AES-256-CBC with a randomly generated 16-byte IV.
 * Never logs or exposes raw plaintext or the master encryption key.
 */
export function encrypt(text: string): { ciphertext: string; iv: string } {
  if (!text) {
    throw new Error("Cannot encrypt empty string");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypts AES-256-CBC ciphertext using the master key and stored IV.
 */
export function decrypt(ciphertext: string, ivHex: string): string {
  if (!ciphertext || !ivHex) {
    throw new Error("Both ciphertext and IV are required for decryption");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");

  if (iv.length !== 16) {
    throw new Error("Invalid IV length for AES-256-CBC decryption");
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Utility to safely mask sensitive API key strings for UI display and GET API responses.
 * Never returns the original key. Example: "AIza...4X9a"
 */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) {
    return "••••••••";
  }
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
