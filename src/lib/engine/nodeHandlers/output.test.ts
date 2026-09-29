import { describe, it, expect } from "vitest";
import { handleOutput } from "./output";

describe("handleOutput", () => {
  it("should return raw json data when format is json", async () => {
    const inputData = { result: "Hello World", count: 42 };
    const res = await handleOutput({
      nodeId: "out-1",
      config: { format: "json" },
      data: inputData,
    });

    expect(res.output.result).toEqual(inputData);
    expect(res.output.format).toBe("json");
    expect(res.output.isFinalOutput).toBe(true);
  });

  it("should extract main text when format is plain_text", async () => {
    const res = await handleOutput({
      nodeId: "out-1",
      config: { format: "plain_text" },
      data: { result: "Direct text result" },
    });

    expect(res.output.result).toBe("Direct text result");
  });

  it("should preserve markdown string directly when format is markdown", async () => {
    const markdownContent = "# Title\n- Item 1\n- Item 2";
    const res = await handleOutput({
      nodeId: "out-1",
      config: { format: "markdown" },
      data: { text: markdownContent },
    });

    expect(res.output.result).toBe(markdownContent);
  });

  it("should fallback to stringified json code block for markdown when no main text exists", async () => {
    const res = await handleOutput({
      nodeId: "out-1",
      config: { format: "markdown" },
      data: { foo: "bar" },
    });

    expect(res.output.result).toContain("## Workflow Output");
    expect(res.output.result).toContain('"foo": "bar"');
  });

  it("should correctly format numeric and boolean result values when format is plain_text", async () => {
    const resNumber = await handleOutput({
      nodeId: "out-num",
      config: { format: "plain_text" },
      data: { result: 42 },
    });
    expect(resNumber.output.result).toBe("42");

    const resZero = await handleOutput({
      nodeId: "out-zero",
      config: { format: "plain_text" },
      data: { result: 0 },
    });
    expect(resZero.output.result).toBe("0");

    const resBool = await handleOutput({
      nodeId: "out-bool",
      config: { format: "plain_text" },
      data: { result: false },
    });
    expect(resBool.output.result).toBe("false");
  });
});
