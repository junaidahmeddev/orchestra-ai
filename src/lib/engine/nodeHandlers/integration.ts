// ============================================================
// Integration Node Handler — REAL WEBHOOK & HTTP ENGINE
//
// Makes real HTTP requests (POST, GET, PUT, DELETE) to external
// webhooks and APIs (e.g. Discord, Slack, SendGrid, custom REST APIs).
//
// Variable Substitution:
// Supports template placeholders like:
//   - {{previous_output}} or {{previousOutput}}
//   - {{result}}
//   - {{text}}
//   - {{output}}
//   - Any {{key}} present in the upstream data object
// ============================================================

import { NodeHandlerInput, NodeHandlerOutput } from "../types";

/**
 * Replaces placeholders like {{previous_output}} or {{result}} with upstream data.
 */
export function substituteVariables(
  template: string,
  data: Record<string, unknown>
): string {
  if (!template) return "";

  // Derive "previous_output" from common upstream output fields
  const previousOutput =
    typeof data.result === "string"
      ? data.result
      : typeof data.output === "string"
      ? data.output
      : typeof data.text === "string"
      ? data.text
      : typeof data.result === "object" && data.result !== null
      ? JSON.stringify(data.result)
      : Object.keys(data).length > 0
      ? JSON.stringify(data)
      : "";

  const lookupValue = (key: string): unknown => {
    if (
      key === "previous_output" ||
      key === "previousOutput" ||
      key === "upstream" ||
      key === "upstream_output"
    ) {
      return previousOutput;
    }

    // Resolve dot-notation nested properties (e.g. data.user.name)
    const val = key.split(".").reduce((acc: unknown, k: string) => {
      if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[k];
      }
      return undefined;
    }, data);

    return val;
  };

  const isJsonContext =
    template.trim().startsWith("{") || template.trim().startsWith("[");

  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const val = lookupValue(key);
    if (val === undefined || val === null) {
      return match; // Leave unreplaced if key not found
    }

    const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);

    // If template is JSON, escape string values for safe inclusion inside JSON quotes
    if (isJsonContext && typeof val === "string") {
      return JSON.stringify(strVal).slice(1, -1);
    }

    return strVal;
  });
}

export async function handleIntegration(
  input: NodeHandlerInput
): Promise<NodeHandlerOutput> {
  const method = String(input.config.method || "POST").toUpperCase();
  const endpoint = String(input.config.endpoint || "").trim();
  const rawBody = String(input.config.body || "").trim();

  if (!endpoint) {
    throw new Error(
      "Integration node requires an Endpoint URL. Please configure a Webhook/API URL in the properties panel."
    );
  }

  // Substitute variable placeholders in endpoint URL and body template
  const processedEndpoint = substituteVariables(endpoint, input.data);
  let processedBody = rawBody ? substituteVariables(rawBody, input.data) : "";

  // If no body provided for POST/PUT/PATCH, construct default payload with previous output
  if (!processedBody && ["POST", "PUT", "PATCH"].includes(method)) {
    const previousOutput =
      typeof input.data.result === "string"
        ? input.data.result
        : typeof input.data.output === "string"
        ? input.data.output
        : typeof input.data.text === "string"
        ? input.data.text
        : JSON.stringify(input.data);

    // Default payload compatible with Discord/Slack webhooks ({ content: "..." })
    processedBody = JSON.stringify({
      content: previousOutput || "Orchestra-AI Workflow Event",
      output: input.data,
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Orchestra-AI/1.0",
  };

  try {
    const response = await fetch(processedEndpoint, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : processedBody,
    });

    const responseText = await response.text();
    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText}: ${
          typeof responseData === "string"
            ? responseData
            : JSON.stringify(responseData)
        }`
      );
    }

    let parsedSentBody: unknown = null;
    if (processedBody) {
      try {
        parsedSentBody = JSON.parse(processedBody);
      } catch {
        parsedSentBody = processedBody;
      }
    }

    return {
      output: {
        status: response.status,
        statusText: response.statusText,
        result: responseData,
        endpoint: processedEndpoint,
        method,
        sentBody: parsedSentBody,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Integration webhook dispatch failed: ${errorMessage}`);
  }
}
