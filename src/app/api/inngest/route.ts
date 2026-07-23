// ============================================================
// Inngest API Route — /api/inngest
//
// This is the endpoint Inngest calls to run registered functions.
// Inngest sends HTTP requests to this route to invoke functions
// when events are received. The `serve` helper handles all the
// protocol details (signature verification, function discovery).
// ============================================================

import { serve } from "inngest/next";
import { inngest } from "@/lib/jobs/inngestClient";
import { runWorkflow } from "@/lib/jobs/runWorkflow";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runWorkflow],
});
