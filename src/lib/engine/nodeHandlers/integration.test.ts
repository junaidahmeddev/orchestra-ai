import { describe, it, expect, vi, beforeEach } from "vitest";
import { substituteVariables, handleIntegration } from "./integration";

describe("Integration Node Variable Substitution (substituteVariables)", () => {
  it("should replace {{previous_output}} with upstream result string", () => {
    const template = '{"content": "AI generated message: {{previous_output}}"}';
    const data = { result: "Hello World from Gemini AI" };

    const output = substituteVariables(template, data);
    expect(output).toBe('{"content": "AI generated message: Hello World from Gemini AI"}');
  });

  it("should replace {{result}} and {{custom_key}} placeholders", () => {
    const template = '{"title": "{{title}}", "body": "{{result}}"}';
    const data = { title: "Daily Summary", result: "All systems operational" };

    const output = substituteVariables(template, data);
    expect(output).toBe('{"title": "Daily Summary", "body": "All systems operational"}');
  });

  it("should safely escape newlines and quotes inside JSON strings", () => {
    const template = '{"content": "{{previous_output}}"}';
    const data = { result: 'Line 1\nLine 2 with "quotes"' };

    const output = substituteVariables(template, data);
    // Should be valid JSON
    const parsed = JSON.parse(output);
    expect(parsed.content).toBe('Line 1\nLine 2 with "quotes"');
  });

  it("should safely escape nested object values when substituted inside JSON string templates", () => {
    const template = '{"payload": "{{meta}}"}';
    const data = { meta: { status: "active", count: 42 } };

    const output = substituteVariables(template, data);
    const parsed = JSON.parse(output);
    expect(JSON.parse(parsed.payload)).toEqual({ status: "active", count: 42 });
  });
});

describe("Integration Node Handler (handleIntegration)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw error if endpoint URL is missing", async () => {
    await expect(
      handleIntegration({
        nodeId: "node-integration-1",
        config: { method: "POST" },
        data: {},
      })
    ).rejects.toThrow(/requires an Endpoint URL/i);
  });

  it("should dispatch real POST request to endpoint with substituted body template", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: "No Content",
      text: async () => "",
    } as Response);

    const result = await handleIntegration({
      nodeId: "node-webhook-1",
      config: {
        method: "POST",
        endpoint: "https://discord.com/api/webhooks/123/abc",
        body: '{"content": "AI Answer: {{previous_output}}"}',
      },
      data: { result: "Gemini AI response text" },
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/123/abc",
      expect.objectContaining({
        method: "POST",
        body: '{"content": "AI Answer: Gemini AI response text"}',
      })
    );

    expect(result.output.status).toBe(204);
    expect(result.output.sentBody).toEqual({
      content: "AI Answer: Gemini AI response text",
    });
  });

  it("should attach X-Orchestra-Signature HMAC-SHA256 headers when signingSecret is configured", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => '{"received": true}',
    } as Response);

    const result = await handleIntegration({
      nodeId: "node-hmac-1",
      config: {
        method: "POST",
        endpoint: "https://api.example.com/webhook",
        body: '{"event": "workflow_complete"}',
        signingSecret: "whsec_test_secret_key_123",
      },
      data: {},
    });

    expect(fetchSpy).toHaveBeenCalled();
    const fetchCallArgs = fetchSpy.mock.calls[0]?.[1];
    const headers = (fetchCallArgs?.headers || {}) as Record<string, string>;

    expect(headers["X-Orchestra-Timestamp"]).toBeDefined();
    expect(headers["X-Orchestra-Signature"]).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
    expect(result.output?.signature).toBe(headers["X-Orchestra-Signature"]);
    expect(result.output?.signedTimestamp).toBeDefined();
  });
});
