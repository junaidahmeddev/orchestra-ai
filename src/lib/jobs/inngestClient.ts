// ============================================================
// Inngest Client — shared across all job functions
//
// Inngest is a background job queue that decouples long-running
// work from HTTP request/response cycles. Instead of running a
// 30-second AI workflow inside a single API request (which would
// timeout on Vercel), we:
//   1. Fire an "event" from the API route (instant, <100ms)
//   2. Inngest picks up that event and runs our function in the
//      background, with retries and observability built in.
// ============================================================

import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "orchestra-ai" });
