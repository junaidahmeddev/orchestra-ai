import crypto from "crypto";

// Ensure ENCRYPTION_KEY is set in environment for testing
if (!process.env.ENCRYPTION_KEY) {
  // Set test key (32-byte hex string) if running in standalone script environment
  process.env.ENCRYPTION_KEY =
    "e6ebd18ca565b850e998e0b7a73f97b331cb7b82324c18a5027e925b3504dea8";
}

import { encrypt, decrypt, maskApiKey } from "../src/lib/encryption";

function runEncryptionTests() {
  console.log("==================================================");
  console.log("  Running AES-256 Encryption & Security Verification");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // ── Test 1: Basic Encrypt & Decrypt Round-Trip ──
  try {
    const rawApiKey = "AIzaSyTestKey_9876543210_GeminiSecret";
    const { ciphertext, iv } = encrypt(rawApiKey);

    assert(
      typeof ciphertext === "string" && ciphertext.length > 0,
      "Ciphertext generated successfully"
    );
    assert(
      typeof iv === "string" && iv.length === 32, // 16 bytes = 32 hex chars
      "Initialization Vector (IV) generated (16 bytes hex)"
    );
    assert(
      ciphertext !== rawApiKey,
      "Ciphertext does not leak plain text string"
    );

    const decrypted = decrypt(ciphertext, iv);
    assert(
      decrypted === rawApiKey,
      "Decrypted text matches original plaintext key exactly"
    );
  } catch (err) {
    assert(false, `Round-trip test threw error: ${err}`);
  }

  // ── Test 2: Random IV Uniqueness ──
  try {
    const sample = "same_secret_key_value";
    const enc1 = encrypt(sample);
    const enc2 = encrypt(sample);

    assert(
      enc1.iv !== enc2.iv,
      "Two encryptions of same text generate unique IVs"
    );
    assert(
      enc1.ciphertext !== enc2.ciphertext,
      "Two encryptions of same text generate different ciphertexts"
    );
    assert(
      decrypt(enc1.ciphertext, enc1.iv) === sample &&
        decrypt(enc2.ciphertext, enc2.iv) === sample,
      "Both unique ciphertexts decrypt back to the same original text"
    );
  } catch (err) {
    assert(false, `Random IV test threw error: ${err}`);
  }

  // ── Test 3: Security - Wrong Key Rejection ──
  try {
    const text = "super_secret_payload";
    const { ciphertext, iv } = encrypt(text);

    // Temporarily swap key
    const originalKey = process.env.ENCRYPTION_KEY;
    const wrongKey = crypto.randomBytes(32).toString("hex");
    process.env.ENCRYPTION_KEY = wrongKey;

    let decryptFailedWithWrongKey = false;
    try {
      const wrongDecryption = decrypt(ciphertext, iv);
      // If by astronomical coincidence decipher doesn't throw, check mismatch
      if (wrongDecryption !== text) {
        decryptFailedWithWrongKey = true;
      }
    } catch {
      decryptFailedWithWrongKey = true;
    }

    // Restore original key
    process.env.ENCRYPTION_KEY = originalKey;

    assert(
      decryptFailedWithWrongKey,
      "Decryption fails or returns corrupted data when wrong ENCRYPTION_KEY is used"
    );
  } catch (err) {
    assert(false, `Wrong key test error: ${err}`);
  }

  // ── Test 4: Masking Helper ──
  const masked = maskApiKey("AIzaSyAbc123XyZ987");
  assert(
    masked === "AIza...Z987",
    `Masking utility masks middle characters (got: "${masked}")`
  );

  console.log("--------------------------------------------------");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runEncryptionTests();
