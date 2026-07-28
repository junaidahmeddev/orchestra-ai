import { describe, it, expect } from "vitest";
import { handleDataProcessor } from "./dataProcessor";

describe("handleDataProcessor (isolated-vm Sandbox Unit Tests)", () => {
  it("should execute a valid JavaScript snippet and return the transformed result", async () => {
    const result = await handleDataProcessor({
      nodeId: "node-dp-1",
      config: {
        language: "javascript",
        code: "return { greeting: 'Hello ' + input.name, uppercase: input.name.toUpperCase() };",
      },
      data: { name: "Antigravity" },
    });

    expect(result.output.executedSuccessfully).toBe(true);
    expect(result.output.result).toEqual({
      greeting: "Hello Antigravity",
      uppercase: "ANTIGRAVITY",
    });
  });

  it("should terminate an infinite loop script with a timeout error without hanging", async () => {
    const startTime = Date.now();

    await expect(
      handleDataProcessor({
        nodeId: "node-dp-infinite",
        config: {
          language: "javascript",
          code: "while(true) {}; return input;",
        },
        data: { test: true },
      })
    ).rejects.toThrow(/timed out/i);

    const duration = Date.now() - startTime;
    // Should take around 5 seconds (5000ms), certainly less than 10 seconds
    expect(duration).toBeLessThan(10000);
  }, 12000); // 12 second timeout for this specific vitest test

  it("should prevent access to Node.js system APIs like require, process, and fs", async () => {
    await expect(
      handleDataProcessor({
        nodeId: "node-dp-exploit",
        config: {
          language: "javascript",
          code: "const fs = require('fs'); return fs.readdirSync('/');",
        },
        data: {},
      })
    ).rejects.toThrow(/require is not defined|ReferenceError/i);
  });
});
