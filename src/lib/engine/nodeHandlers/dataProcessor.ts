// ============================================================
// Data Processor Node Handler — REAL SANDBOX (AD-2)
//
// This is the one handler that is NOT a stub. It runs user-
// submitted JavaScript inside an isolated-vm sandbox with:
//   - 128 MB memory limit
//   - 5 second execution timeout
//   - No access to Node.js APIs (fs, http, process, require)
//
// HOW IT WORKS:
// 1. We create an Isolate — a completely separate V8 engine
//    instance with its own memory heap.
// 2. Inside the Isolate, we create a Context — like a fresh
//    browser tab with no global objects (no `window`, no
//    `require`, no `process`).
// 3. We inject the user's `input` data as a JSON string into
//    a global variable inside the isolate.
// 4. We compile and run the user's code. The code must produce
//    a return value (we wrap it in an IIFE).
// 5. We extract the result as a JSON string and parse it back
//    into a JavaScript object on our side.
//
// If the code runs an infinite loop, the 5-second timeout
// forcibly terminates the isolate. If it tries to allocate
// too much memory, the 128 MB limit kills it. If it tries
// `require('fs')` or `fetch(...)`, those simply don't exist
// inside the isolate — they'll get a ReferenceError.
// ============================================================

import ivm from "isolated-vm";
import { NodeHandlerInput, NodeHandlerOutput } from "../types";

const MEMORY_LIMIT_MB = 128;
const TIMEOUT_MS = 5000;

export async function handleDataProcessor(
  input: NodeHandlerInput
): Promise<NodeHandlerOutput> {
  const { config, data } = input;

  // Python is not supported via isolated-vm (it only runs V8/JS).
  // A separate microservice would be needed for Python sandboxing.
  if (config.language === "python") {
    throw new Error(
      "Python execution is not yet supported. " +
      "The Data Processor sandbox currently supports JavaScript only. " +
      "Python sandboxing requires a dedicated microservice (planned for Phase 3 scale)."
    );
  }

  const userCode = config.code || "return input;";

  // Create a fresh V8 isolate with a memory ceiling
  const isolate = new ivm.Isolate({ memoryLimit: MEMORY_LIMIT_MB });

  try {
    // Create a clean execution context (no Node.js globals)
    const context = await isolate.createContext();

    // Inject the input data as a JSON string global variable.
    // We use JSON serialization as the "bridge" because isolated-vm
    // cannot share complex JS objects across the isolation boundary.
    const jail = context.global;
    await jail.set(
      "__inputJSON",
      JSON.stringify(data),
      { copy: true }
    );

    // Wrap the user's code in an IIFE that:
    // 1. Parses the input JSON into a local `input` variable
    // 2. Runs their code (which should `return` something)
    // 3. Converts the result back to JSON for extraction
    const wrappedCode = `
      (function() {
        const input = JSON.parse(__inputJSON);
        const __result = (function() {
          ${userCode}
        })();
        return JSON.stringify(__result);
      })()
    `;

    // Compile the script inside the isolate
    const script = await isolate.compileScript(wrappedCode);

    // Run with a timeout — if it takes longer than 5 seconds,
    // isolated-vm throws an error and kills the execution.
    const resultJSON = await script.run(context, {
      timeout: TIMEOUT_MS,
    });

    // Parse the result back on our (trusted) side
    const result = JSON.parse(resultJSON as string);

    return {
      output: {
        result,
        language: "javascript",
        executedSuccessfully: true,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Provide clear error messages for common sandbox failures
    if (errorMessage.includes("Script execution timed out")) {
      throw new Error(
        `Data Processor timed out after ${TIMEOUT_MS / 1000} seconds. ` +
        `This usually means the code has an infinite loop. ` +
        `Please check your script logic.`
      );
    }

    if (errorMessage.includes("memory")) {
      throw new Error(
        `Data Processor exceeded the ${MEMORY_LIMIT_MB}MB memory limit. ` +
        `Please reduce the amount of data your script processes.`
      );
    }

    throw new Error(`Data Processor execution failed: ${errorMessage}`);
  } finally {
    // Always dispose the isolate to free the V8 memory heap
    isolate.dispose();
  }
}
