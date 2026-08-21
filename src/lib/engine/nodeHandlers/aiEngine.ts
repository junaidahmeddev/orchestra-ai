// ============================================================
// AI Engine Node Handler (Google Gemini Integration)
//
// Fetches the user's stored AES-256 encrypted Gemini API key,
// decrypts it in memory, and makes a live call to Google's
// Generative AI API using @google/generative-ai SDK.
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { NodeHandlerInput, NodeHandlerOutput } from "../types";
import { substituteVariables } from "./integration";

export async function handleAIEngine(
  input: NodeHandlerInput
): Promise<NodeHandlerOutput> {
  const provider = input.config.provider || "GEMINI";
  const modelName = input.config.model || "gemini-3.6-flash";
  const rawSystemPrompt = (input.config.systemPrompt || "") as string;
  const rawUserPrompt = ((input.config.userPrompt || input.config.prompt || "") as string);
  const temperature = (input.config.temperature as number) ?? 0.7;

  // Validate user session context
  if (!input.userId) {
    throw new Error(
      "Execution context missing user ID. Cannot retrieve stored API keys."
    );
  }

  // Substitute template variables (e.g. {{previous_output}}, {{key}})
  const systemPrompt = rawSystemPrompt
    ? substituteVariables(rawSystemPrompt, input.data)
    : "";
  const configuredUserPrompt = rawUserPrompt
    ? substituteVariables(rawUserPrompt, input.data)
    : "";

  // Phase 7 currently implements Google Gemini
  if (provider === "GEMINI" || provider === "OPENAI" || provider === "ANTHROPIC") {
    // Look up user's saved Gemini API key
    const apiKeyRecord = await db.apiKey.findFirst({
      where: {
        userId: input.userId,
        provider: "GEMINI",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!apiKeyRecord) {
      throw new Error(
        "No Google Gemini API key found for your account. Please add your key in Settings -> API Keys before executing this workflow."
      );
    }

    // Decrypt API key in-memory
    let rawApiKey = "";
    try {
      rawApiKey = decrypt(apiKeyRecord.encryptedKey, apiKeyRecord.iv);
    } catch (decryptErr) {
      throw new Error(
        "Failed to decrypt stored Gemini API key. Decryption key may have changed or key payload is corrupted."
      );
    }

    if (!rawApiKey) {
      throw new Error("Decrypted Gemini API key is empty.");
    }

    // Extract prompt from upstream input data if present
    let promptText = "";
    if (configuredUserPrompt.trim()) {
      promptText = configuredUserPrompt;
    } else if (typeof input.data?.result === "string" && input.data.result.trim()) {
      promptText = input.data.result;
    } else if (
      typeof input.data?.output === "string" &&
      input.data.output.trim()
    ) {
      promptText = input.data.output;
    } else if (
      typeof input.data?.text === "string" &&
      input.data.text.trim()
    ) {
      promptText = input.data.text;
    } else if (
      typeof input.data?.prompt === "string" &&
      input.data.prompt.trim()
    ) {
      promptText = input.data.prompt;
    } else if (input.data && Object.keys(input.data).length > 0) {
      promptText = JSON.stringify(input.data, null, 2);
    }

    // Determine content prompt to send to Gemini
    const finalPrompt = promptText.trim()
      ? promptText.trim()
      : systemPrompt.trim()
      ? systemPrompt.trim()
      : "Hello! Summarize the status of this AI Engine node workflow step.";

    try {
      const genAI = new GoogleGenerativeAI(rawApiKey);
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt.trim() ? systemPrompt.trim() : undefined,
        generationConfig: {
          temperature,
        },
      });

      const response = await geminiModel.generateContent(finalPrompt);
      const responseText = response.response.text();

      return {
        output: {
          result: responseText,
          text: responseText,
          provider: "GEMINI",
          model: modelName,
          temperature,
          systemPrompt,
          upstreamData: input.data,
        },
      };
    } catch (geminiErr: unknown) {
      const errorMsg =
        geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      throw new Error(`Gemini API Error (${modelName}): ${errorMsg}`);
    }
  }

  throw new Error(`Unsupported AI Provider: ${provider}`);
}
