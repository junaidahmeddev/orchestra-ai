// ============================================================
// Engine Test Script — Phase 5 Verification
//
// Run with:  npx tsx src/lib/engine/test-engine.ts
//
// Tests:
//   1. Topological sort on a valid linear graph
//   2. Topological sort on a graph with a cycle (expects error)
//   3. Data Processor sandbox with a simple computation
//   4. Data Processor sandbox with an infinite loop (expects timeout)
// ============================================================

import { topologicalSort, CycleDetectedError } from "./topologicalSort";
import { handleDataProcessor } from "./nodeHandlers/dataProcessor";
import { EngineNode, EngineEdge } from "./types";

let passed = 0;
let failed = 0;

function reportResult(testName: string, success: boolean, detail?: string) {
  if (success) {
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
  }
}

async function runTests() {
  console.log("\n========================================");
  console.log("  Phase 5 — Engine Test Suite");
  console.log("========================================\n");

  // ────────────────────────────────────────────────
  // TEST 1: Topological sort — valid linear graph
  //   Trigger → AI Engine → Output
  // ────────────────────────────────────────────────
  console.log("Test 1: Topological sort — valid linear graph");
  try {
    const nodes: EngineNode[] = [
      { id: "trigger_1", type: "TRIGGER", label: "Start", config: { triggerType: "MANUAL" } },
      { id: "ai_1", type: "AI_ENGINE", label: "AI Chat", config: { provider: "OPENAI", model: "gpt-4o" } },
      { id: "output_1", type: "OUTPUT", label: "Result", config: { format: "json" } },
    ];
    const edges: EngineEdge[] = [
      { id: "e1", source: "trigger_1", target: "ai_1" },
      { id: "e2", source: "ai_1", target: "output_1" },
    ];

    const sorted = topologicalSort(nodes, edges);
    const ids = sorted.map((n) => n.id);

    const correctOrder =
      ids[0] === "trigger_1" &&
      ids[1] === "ai_1" &&
      ids[2] === "output_1";

    reportResult(
      "Linear graph returns correct execution order",
      correctOrder,
      correctOrder ? undefined : `Got: ${ids.join(" → ")}`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    reportResult("Linear graph returns correct execution order", false, msg);
  }

  // ────────────────────────────────────────────────
  // TEST 2: Topological sort — graph WITH a cycle
  //   A → B → C → A  (circular dependency)
  // ────────────────────────────────────────────────
  console.log("\nTest 2: Topological sort — graph with a cycle");
  try {
    const nodes: EngineNode[] = [
      { id: "a", type: "TRIGGER", label: "Node A", config: {} },
      { id: "b", type: "AI_ENGINE", label: "Node B", config: {} },
      { id: "c", type: "DATA_PROCESSOR", label: "Node C", config: {} },
    ];
    const edges: EngineEdge[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "c" },
      { id: "e3", source: "c", target: "a" }, // creates the cycle
    ];

    topologicalSort(nodes, edges);
    reportResult("Cycle is detected and rejected", false, "No error was thrown — cycle was NOT detected");
  } catch (err: unknown) {
    const isCycleError = err instanceof CycleDetectedError;
    reportResult(
      "Cycle is detected and rejected",
      isCycleError,
      isCycleError ? undefined : `Wrong error type: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ────────────────────────────────────────────────
  // TEST 3: Data Processor sandbox — simple computation
  //   Code: return input.value * 2
  //   Input: { value: 21 }
  //   Expected output: 42
  // ────────────────────────────────────────────────
  console.log("\nTest 3: Data Processor sandbox — simple computation");
  try {
    const result = await handleDataProcessor({
      nodeId: "dp_test",
      config: {
        language: "javascript",
        code: "return input.value * 2;",
      },
      data: { value: 21 },
    });

    const outputResult = result.output.result;
    const correct = outputResult === 42;

    reportResult(
      "Sandbox returns correct computation result (21 * 2 = 42)",
      correct,
      correct ? undefined : `Got: ${JSON.stringify(outputResult)}`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    reportResult("Sandbox returns correct computation result", false, msg);
  }

  // ────────────────────────────────────────────────
  // TEST 4: Data Processor sandbox — infinite loop timeout
  //   Code: while(true) {}
  //   Expected: timeout error within ~5 seconds
  // ────────────────────────────────────────────────
  console.log("\nTest 4: Data Processor sandbox — infinite loop timeout");
  const startTime = Date.now();
  try {
    await handleDataProcessor({
      nodeId: "dp_loop",
      config: {
        language: "javascript",
        code: "while(true) {}",
      },
      data: {},
    });
    reportResult("Infinite loop is killed by timeout", false, "No error was thrown — loop was NOT killed");
  } catch (err: unknown) {
    const elapsed = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeoutError = msg.toLowerCase().includes("timed out");
    const reasonableTime = elapsed < 10000; // should finish well under 10s

    reportResult(
      `Infinite loop is killed by timeout (took ${(elapsed / 1000).toFixed(1)}s)`,
      isTimeoutError && reasonableTime,
      isTimeoutError ? undefined : `Wrong error: ${msg}`
    );
  }

  // ────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────
  console.log("\n========================================");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
