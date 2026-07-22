# orchestra.ai — Product Requirements Document (PRD)

**Version:** 1.0
**Status:** MVP Planning
**Type:** Open-source visual node-based AI workflow automation tool

---

## 1. Project Overview & Vision

orchestra.ai ek open-source, visual node-based developer tool hai jo users ko bina code likhe complex AI Automations aur Multi-Agent Workflows banane deta hai. Drag-and-drop canvas ke zariye inputs, LLMs, databases, aur external APIs (Email, Web Search, Webhooks) ko connect kiya ja sakta hai.

**Core value proposition:** "Zapier + n8n ka simplicity, LLM/AI-agent orchestration ke liye purpose-built."

---

## 2. User Roles & Permissions

| Role | Access Level | Description |
|---|---|---|
| **Guest** | Read-only demo canvas | Login ke bagair sample workflow dekh/try kar sakta hai (no save) |
| **Free User** | Full canvas + limited runs/month | Apna account, limited workflows (e.g. 3 active), limited monthly execution runs |
| **Pro User** | Unlimited workflows + higher run quota | Paid tier — unlimited workflows, higher execution limits, priority queue |
| **Admin** | Platform-wide access | User management, usage monitoring, global settings (internal only, not customer-facing in MVP) |

> MVP mein sirf **Free User** role fully build hoga. Pro/Admin roles schema-ready rakhenge (future Stripe/billing integration ke liye) lekin gate logic MVP mein enforce nahi karenge.

---

## 3. Functional Requirements

### A. Visual Workflow Canvas
- Drag-and-drop node creation, edit, delete
- Node handles ko drag karke edge (connection) banana
- Zoom in/out, pan, minimap
- Undo/redo (canvas history)

### B. Node Library (5 core types)
1. **Trigger Node** — Manual click ya Webhook URL se workflow start
2. **AI Engine Node** — LLM select (OpenAI / Anthropic / Gemini) + system prompt + temperature config
3. **Data Processor Node** — Chhota JS/Python code block run karke text/data manipulate karna (sandboxed)
4. **Integration Node** — External API call (SendGrid, WhatsApp Webhook, generic REST)
5. **Output Node** — Final result screen par display

### C. Graph Execution Engine
- "Run Workflow" par visual diagram → Graph Data Structure conversion
- Topological Sort se circular dependency (loop) detect karna aur correct execution order nikalna
- Node output → next node input automatic pass-through
- Per-node execution isolation (ek node fail ho to poora run crash na ho, error us node tak contained rahe)

### D. Real-Time Tracking & Logs
- Live execution ke dauran active node par green "running" state
- Error par node red + sidebar mein error log
- Run history per workflow (past runs, status, duration)

### E. User & Project Management (SaaS Layer)
- Auth: email/password (MVP), OAuth-ready schema (Google/GitHub — post-MVP)
- Workflow CRUD: save, update, duplicate, delete, reload
- API key management (user apni OpenAI/Gemini key add kare, encrypted)

---

## 4. Non-Functional Requirements

| Quality Metric | Target Requirement | Engineering Technique |
|---|---|---|
| **Performance** | Heavy canvas data par bhi UI frame-rate drop na ho | React Flow optimization + Zustand state slices (selective re-render) |
| **Type Safety** | Zero runtime data-mismatch errors | 100% strict TypeScript, Zod for runtime validation on API boundaries |
| **Security** | API keys clear-text leak na hon | AES-256 encryption at rest; sandboxed code execution (`isolated-vm`) |
| **Scalability** | Heavy AI responses se app freeze na ho | Streaming responses (Vercel AI SDK) + async background job pattern |
| **Reliability** | Failed run se data corrupt na ho | Idempotent execution steps, per-node try/catch isolation, run status persisted at every step |
| **Availability** | MVP uptime target 99% | Vercel/Railway managed hosting, DB connection pooling |

---

## 5. Features List

### MVP (Minimum Viable Product) — Phase 1
- [ ] Email/password auth (signup/login/logout)
- [ ] Visual canvas: create/connect/delete nodes
- [ ] 5 node types (Trigger, AI Engine, Data Processor, Integration, Output)
- [ ] Manual trigger execution only (webhook trigger deferred)
- [ ] DAG executor with topological sort + cycle detection
- [ ] Real-time node status (running/success/failed) via polling or WebSocket
- [ ] Save/load workflows per user
- [ ] BYO API key (OpenAI only, encrypted storage)
- [ ] Basic run history log (list + node-level errors)

### Post-MVP — Phase 2
- Webhook-triggered + Cron-scheduled runs (`TriggerSource` already in schema)
- OAuth login (Google/GitHub) — `Account` table already schema-ready
- Multi-provider AI nodes (Anthropic, Gemini) fully wired
- Team/workspace sharing (multi-user per workflow)
- Node marketplace / custom node plugin system
- Workflow templates gallery
- Usage-based billing (Pro tier, Stripe)

### Phase 3 (Scale)
- Self-hosted deployment option (Docker Compose / Helm chart) — open-source positioning
- Dedicated sandbox microservice for Data Processor node (isolate from main server)
- Observability dashboard (execution analytics, cost tracking per LLM call)

---

## 6. Tech Stack (Finalized)

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + React Flow + Zustand + Tailwind CSS + Shadcn UI |
| Backend | Next.js API Routes / Server Actions (Node.js/TypeScript DAG executor) |
| Database | PostgreSQL + Prisma ORM |
| AI Layer | Vercel AI SDK + LangChain (multi-LLM abstraction) |
| Auth | NextAuth.js (Auth.js) — credentials provider MVP, OAuth providers later |
| Sandbox | Node.js `vm` module → `isolated-vm` (MVP), dedicated microservice (later) |
| Realtime | Polling (MVP) → WebSockets/Server-Sent Events (Phase 2) |
| Hosting | Vercel (frontend + API) + **Neon** (managed serverless Postgres) |

---

## 7. Database Schema (Summary)

Full schema locked in `schema.prisma` (shared earlier). Core models:

- **User** — auth identity, owns workflows & API keys
- **Account** — OAuth linking (NextAuth-style), blank in MVP
- **ApiKey** — AES-256 encrypted LLM provider keys per user
- **Workflow** — saved canvas (`canvasJson` blob + normalized nodes/edges)
- **WorkflowNode** / **WorkflowEdge** — normalized DAG structure for execution engine
- **WorkflowRun** — execution instance, `status`, `triggeredBy` (MANUAL/WEBHOOK/CRON)
- **NodeRun** — per-node execution record (input, output, status, error) → powers real-time tracking UI

---

## 8. API Endpoints (MVP)

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login              (NextAuth credentials)
  POST   /api/auth/logout
  GET    /api/auth/session

Workflows
  GET    /api/workflows               list user's workflows
  POST   /api/workflows               create new workflow
  GET    /api/workflows/:id           load single workflow (canvasJson)
  PUT    /api/workflows/:id           update/save workflow
  DELETE /api/workflows/:id           delete workflow

Execution
  POST   /api/workflows/:id/run       trigger a run (returns runId)
  GET    /api/runs/:runId             get run status + all nodeRuns
  GET    /api/runs/:runId/stream      SSE/polling endpoint for live node status

API Keys
  GET    /api/api-keys                list user's stored keys (masked)
  POST   /api/api-keys                add new encrypted key
  DELETE /api/api-keys/:id            remove key

Nodes (config helpers)
  GET    /api/node-types              return available node type schemas (for canvas palette)
```

---

## 9. Folder Structure

```
orchestra.ai/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── workflows/page.tsx           # list view
│   │   │   └── workflows/[id]/page.tsx      # canvas editor
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── workflows/route.ts
│   │   │   ├── workflows/[id]/route.ts
│   │   │   ├── workflows/[id]/run/route.ts
│   │   │   ├── runs/[runId]/route.ts
│   │   │   └── api-keys/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── canvas/                          # React Flow canvas + custom nodes
│   │   │   ├── nodes/ (TriggerNode.tsx, AIEngineNode.tsx, ...)
│   │   │   ├── FlowCanvas.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                              # Shadcn components
│   ├── lib/
│   │   ├── db.ts                            # Prisma client singleton
│   │   ├── encryption.ts                    # AES-256 helpers
│   │   ├── engine/
│   │   │   ├── topologicalSort.ts
│   │   │   ├── executor.ts                  # DAG executor core
│   │   │   └── nodeHandlers/ (aiEngine.ts, dataProcessor.ts, integration.ts)
│   │   └── validators/ (zod schemas)
│   ├── store/
│   │   └── canvasStore.ts                   # Zustand store
│   └── types/
│       └── node-configs.ts
├── .env.example
├── package.json
└── README.md
```

---

## 10. UI/UX Pages

| Page | Purpose |
|---|---|
| `/login`, `/register` | Auth screens |
| `/workflows` | Dashboard — list of user's saved workflows, "New Workflow" CTA |
| `/workflows/[id]` | Main canvas editor — node palette (left), canvas (center), config panel (right), run/log panel (bottom) |
| `/workflows/[id]/runs` | Run history table for a workflow |
| `/settings/api-keys` | Manage encrypted LLM provider keys |
| `/settings/profile` | Basic account settings |

> Wireframing: Figma ya Excalidraw mein pehle low-fidelity layout banayenge canvas editor page ka (sabse complex page hai — palette + canvas + config panel + logs), phir baaki pages simple form-based hone ki wajah se directly code mein design ho sakte hain.

---

## 11. Development Roadmap (Phase-by-Phase)

```
Phase 0 — Project Scaffold           (Next.js + folder structure + config, no logic)  ← STARTING NOW
Phase 1 — Database                   (Prisma schema + migrations, Neon Postgres connected)
Phase 2 — Authentication             (NextAuth credentials — depends on User table existing)
Phase 3 — Workflow CRUD (Backend)    (API routes: create/list/load/update/delete workflow)
Phase 4 — Canvas (Frontend)          (React Flow + Zustand, node palette, save/load UI)
Phase 5 — DAG Executor (Core Engine) (topological sort, cycle detection, node handlers)
Phase 6 — Execution Engine           (Inngest background job + sandbox + NodeRun tracking)
Phase 7 — API Key Management         (encrypted storage UI + backend)
Phase 8 — Testing                    (unit + integration + E2E)
Phase 9 — Deployment & Documentation (Vercel + Neon, CI/CD, README, API docs)
```

> **Order rationale:** Database Phase 1 mein Auth (Phase 2) se pehle aata hai kyunke NextAuth khud `User`/`Account` tables ko query karta hai — wo tables migrate ho kar exist karni chahiye auth wire karne se pehle.

### Database Provider Decision
**Neon PostgreSQL** MVP ke liye default database provider hai (unless koi strong architectural reason kisi aur provider ki taraf le jaye). Neon serverless Postgres hai, Prisma ke saath first-class compatibility rakhta hai, aur Vercel deployment ke saath integration smooth hai (connection pooling built-in) — beginners ke liye setup sabse kam friction wala hai.

---

## 12. Architecture Decisions Log

### AD-1: Background Job Queue for Execution (Inngest/Trigger.dev)
**Decision:** Vercel hosting ke saath production-ready background job queue use karenge (Inngest ya Trigger.dev), lekin MVP mein simplified/incremental version se shuru karenge jo naturally evolve ho sake.

**Why:** Vercel serverless functions ki timeout limit hoti hai (10s free / 60s pro tier). Ek AI workflow run mein multiple LLM calls chain ho sakte hain — agar poora run ek hi HTTP request ke andar synchronously chale, to lambe workflows timeout ho jayenge aur user ko error milega, chahe workflow logically sahi ho.

**MVP Approach:** Job queue library integrate karenge shuru se (Inngest recommended — Vercel ke saath first-class support, local dev mein bhi easy), lekin sirf ek simple "run this DAG" job function likhenge. Retry/scheduling jaisi advanced features Phase 2 mein add karenge. Isse code architecture shuru se hi async-job-shaped rahega, baad mein migrate nahi karna padega.

### AD-2: Sandbox Security for Data Processor Node
**Decision:** MVP se hi essential sandbox restrictions enforce karenge: execution timeout, memory limit, no filesystem access, no network access.

**Why:** User-submitted code (JS snippets) run karna inherently risky hai — bina restrictions ke ek malicious ya buggy script (infinite loop, `require('fs')`, external network call) server crash ya data leak kar sakta hai.

**MVP Approach:** `isolated-vm` library use karenge (V8 isolate — same engine Node khud use karta hai, lekin completely separate memory heap aur no access to Node's global APIs by default). Teen restrictions:
- **Timeout** (e.g. 5 seconds) — infinite loop ko forcibly kill karta hai
- **Memory limit** (e.g. 128MB) — memory-bomb attack se bachata hai
- **No `require`/filesystem/network** — isolate ke andar sirf pure JS globals available hain (no `fs`, `http`, `process`), isliye code sirf data transform kar sakta hai, system ko touch nahi kar sakta

---

## 13. Where We Currently Stand

✅ Idea, Requirements, Research — done
✅ Database Design — `schema.prisma` locked and approved
✅ Architecture Decisions — job queue (Inngest) + sandbox security + Neon DB locked
🔄 **Phase 0 — Project Scaffold — IN PROGRESS**
⬜ Phase 1–9 — pending
