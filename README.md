<div align="center">

# orchestra.ai

**Open-Source Visual Node-Based Engine for Building AI Automations & Multi-Agent Workflows**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-v14.2+-black?logo=next.js)](https://nextjs.org/)
[![Phase Status](https://img.shields.io/badge/Phase-Phase%2010%20Active-emerald)](#-development-roadmap)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen?logo=vitest)](#-testing-suite)
[![CI/CD](https://img.shields.io/badge/CI-GitHub%20Actions-blue?logo=githubactions)](#-ci-workflow)

<br />

<img src="public/screenshot.png" alt="orchestra.ai Visual Node Engine Canvas Screenshot" width="100%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />

---

</div>

## 🌐 Live Demo

Try **orchestra.ai** live on Vercel: **[https://orchestra-ai.vercel.app](https://orchestra-ai.vercel.app)**
> **Note:** Shared demo environment. Register a free account to create, test, and save your own custom workflows.

---

## 📌 Overview

**orchestra.ai** is an open-source, visual workflow automation platform purpose-built for AI agents and multi-node orchestration. It combines the drag-and-drop simplicity of tools like Zapier and n8n with an execution engine designed from the ground up for LLMs, sandboxed code evaluation, and real-time DAG tracking.

Connect user inputs, AI models, custom scripts, external webhooks, and structured outputs seamlessly on a unified interactive canvas — with zero per-task billing by using your own API keys.

---

## ✨ Feature Highlights

| Feature | Description |
| :--- | :--- |
| 🎨 **Visual Canvas Editor** | Interactive drag-and-drop workflow builder powered by **React Flow**, with custom dynamic nodes, snap-to-grid edge connectors, zoom/pan controls, and minimap navigation. |
| 🧩 **5 Core Node Types** | ⚡ **Trigger** — manual invocation (webhook/cron planned). 🧠 **AI Engine** — Google Gemini (`gemini-2.0-flash`) with BYOK AES-256-CBC encryption; OpenAI & Anthropic schema-ready. 💻 **Data Processor** — user JavaScript inside an `isolated-vm` sandbox. 🌐 **Integration** — real HTTP calls (GET/POST/PUT/DELETE) with `{{variable}}` substitution & HMAC-SHA256 signing. 🖥️ **Output** — formats the final payload as JSON, Markdown, or plain text. |
| 🔐 **BYOK Architecture** | "Bring Your Own Key" — LLM API keys encrypted with **AES-256-CBC** (unique IV per key) before database storage. Decrypted strictly in-memory at execution time; never logged. |
| ⚡ **Background Orchestration** | Asynchronous, resilient job queue powered by **Inngest** — prevents serverless timeout issues during multi-node LLM chaining. |
| 🛡️ **Sandboxed Code Execution** | `isolated-vm` with 128 MB memory cap, 5-second hard timeout, and zero access to Node.js host globals. |
| 📊 **Live Execution Tracking** | Real-time per-node status (Pending → Running → Success / Failed / Skipped), topological DAG sort, cycle detection, and output badges on each canvas node. |
| 🔄 **Robust Error Handling** | Node failure automatically marks all downstream pending nodes as `SKIPPED` and transitions the run to `FAILED` — no silent hangs. |

---

## ⚖️ Comparison Matrix

| Feature / Capability | orchestra.ai | n8n | Zapier |
| :--- | :---: | :---: | :---: |
| **AI-Native DAG Chaining** | 🟢 Purpose-built LLM context flow | 🟡 Added via AI node extensions | 🔴 Basic linear step actions |
| **Open Source** | 🟢 [MIT License](LICENSE) | 🟡 Fair-code / Sustainable License | 🔴 Proprietary |
| **BYOK Pricing Model** | 🟢 Bring Your Own Key (Zero Markup) | 🟡 Self-host or Tiered Cloud | 🔴 Task-based Tiered Billing |
| **Background Execution Queue** | 🟢 Inngest Async Queues | 🟢 Bull / Redis Workers | 🟢 Proprietary Task Queue |
| **Sandboxed Code Execution** | 🟢 `isolated-vm` (Memory & Time Capped) | 🟢 Standard Node VM | 🟡 Limited Code By Zapier |

---

## 🛡️ Security Architecture

- **BYOK API Key Encryption**: User LLM provider keys are encrypted at rest with **AES-256-CBC** using unique per-key initialization vectors (`iv`). Keys are decrypted only in-memory during node execution and are never logged or returned over the API.
- **Sandboxed Code Execution**: JavaScript inside Data Processor nodes runs in a dedicated **V8 `isolated-vm`** isolate — 128 MB memory ceiling, 5-second timeout, and no access to `fs`, `http`, `process`, `require`, or any host-environment API.
- **HMAC Payload Signing**: Integration nodes optionally sign outbound HTTP request bodies with **HMAC-SHA256** for zero-trust webhook delivery verification.
- **Responsible Disclosure**: Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/junaidahmeddev/orchestra-ai/security/advisories).

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework & Language** | [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **Workflow & Canvas** | [React Flow 11](https://reactflow.dev/), [Zustand](https://zustand-demo.pmnd.rs/) (State Management) |
| **Database & ORM** | [PostgreSQL (Neon)](https://neon.tech/), [Prisma ORM 5](https://www.prisma.io/) |
| **Async & Security** | [Inngest](https://www.inngest.com/) (Background Queue), [`isolated-vm`](https://github.com/laverdet/isolated-vm) (Sandbox), **AES-256-CBC** Encryption |
| **AI Provider** | [Google Gemini](https://ai.google.dev/) (`gemini-2.0-flash`) via `@google/generative-ai` SDK |
| **Testing** | [Vitest](https://vitest.dev/) (Unit & Integration), [Playwright](https://playwright.dev/) (End-to-End) |

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/junaidahmeddev/orchestra-ai.git
cd orchestra-ai
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

```env
# ── Database (Neon PostgreSQL) ────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require"

# ── NextAuth Authentication ───────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# ── AES-256 Encryption Key (must be 64-char hex / 32 bytes) ──
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="your-64-char-hex-encryption-key"

# ── Inngest (Background Job Queue) ────────────────────────────
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

### 3. Database Migration

```bash
npx prisma db push

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Run the Development Server

**Two terminals are required for workflow execution:**

```bash
# Terminal 1 — Next.js application
npm run dev

# Terminal 2 — Inngest local dev server (background job queue)
npx inngest-cli@latest dev
```

| URL | Purpose |
| :--- | :--- |
| http://localhost:3000 | orchestra.ai application |
| http://127.0.0.1:8288 | Inngest developer dashboard |

> **Important:** Without the Inngest dev server running, workflow executions fail immediately with a 503 error.

---

## 🧪 Testing Suite

| Layer | Tool | Coverage |
| :--- | :--- | :--- |
| **Unit Tests** | Vitest | Topological sort, cycle detection, AES-256 encrypt/decrypt, `isolated-vm` sandbox, `substituteVariables` template engine |
| **Integration Tests** | Vitest + Prisma mocks | Auth registration, workflow CRUD, API key management, run polling |
| **End-to-End Tests** | Playwright | Login, canvas creation, node addition, edge connections, run trigger, state persistence |

```bash
npm test            # all unit & integration tests
npm run test:watch  # watch mode
npm run test:e2e    # Playwright E2E tests
```

---

## 📁 Project Structure

```
orchestra-ai/
├── prisma/
│   └── schema.prisma              # PostgreSQL schema & Prisma models
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/                # Login & Registration pages
│   │   ├── (dashboard)/           # Workflow list & canvas editor
│   │   └── api/                   # REST API route handlers
│   │       ├── auth/              # Registration & NextAuth handlers
│   │       ├── api-keys/          # Encrypted LLM key CRUD
│   │       ├── inngest/           # Inngest background queue webhook
│   │       ├── runs/              # Run status polling endpoint
│   │       └── workflows/         # Workflow CRUD & execution trigger
│   ├── components/
│   │   ├── canvas/                # React Flow canvas, sidebar & node palette
│   │   │   └── nodes/             # 5 custom node React components
│   │   └── ui/                    # Shadcn reusable UI components
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── encryption.ts          # AES-256-CBC encrypt/decrypt/mask helpers
│   │   ├── templates.ts           # 1-click pre-built workflow templates
│   │   ├── engine/
│   │   │   ├── topologicalSort.ts # Kahn's algorithm + cycle detection
│   │   │   ├── types.ts           # Shared engine TypeScript types
│   │   │   └── nodeHandlers/
│   │   │       ├── trigger.ts
│   │   │       ├── aiEngine.ts    # Gemini SDK integration (BYOK)
│   │   │       ├── dataProcessor.ts  # isolated-vm sandbox
│   │   │       ├── integration.ts # HTTP webhook engine + HMAC signing
│   │   │       └── output.ts
│   │   └── jobs/
│   │       ├── inngestClient.ts   # Inngest SDK client
│   │       └── runWorkflow.ts     # Main Inngest job function
│   ├── store/
│   │   └── canvasStore.ts         # Zustand canvas & workflow state
│   └── middleware.ts              # NextAuth route protection
├── e2e/                           # Playwright end-to-end specs
├── package.json
└── README.md
```

---

## 🗺️ Development Roadmap

- [x] **Phase 0** — Project Scaffold & Next.js Setup
- [x] **Phase 1** — Database Design & Prisma Schema (Neon PostgreSQL)
- [x] **Phase 2** — Authentication System (NextAuth.js Credentials Provider)
- [x] **Phase 3** — Workflow CRUD Engine (API Routes & Security Guards)
- [x] **Phase 4** — Visual Canvas Editor (React Flow + Zustand)
- [x] **Phase 5** — DAG Execution Engine (Topological Sort & Cycle Detection)
- [x] **Phase 6** — Inngest Background Execution & `isolated-vm` Sandbox
- [x] **Phase 7** — Encrypted API Key Storage (AES-256-CBC) & Gemini Integration
- [x] **Phase 8** — Comprehensive Testing Suite (Vitest Unit/Integration + Playwright E2E)
- [x] **Phase 9** — Production Deployment & Documentation (Vercel + Neon + Inngest)
- [ ] **Phase 10** — Templates, Multi-LLM & Triggers
  - [x] 1-Click Pre-Built Canvas Workflow Templates (Customer Complaint Auto-Responder & Meeting Notes Extractor)
  - [ ] Multi-Provider LLM Wrappers (OpenAI GPT-4o & Anthropic Claude 3.5)
  - [ ] Inbound Webhook Trigger Endpoints & Cron Scheduler

---

## 🐛 Recent Bug Fixes

| Commit | Fix |
| :--- | :--- |
| `8ee5e2d` | Sort `nodeRuns` by stable `id` instead of nullable `startedAt` — prevents PENDING nodes floating to the top during live polling |
| `24171c1` | Replace non-existent `gemini-3.6-flash` with `gemini-2.0-flash` across all 9 references (runtime, UI, templates, tests) |
| `3250091` | Transition downstream PENDING nodes to `SKIPPED` on workflow failure so runs never hang in an ambiguous state |
| `6d90984` | Guard against `null`/`undefined` input data in Integration and Output node handlers |
| `04f4852` | Roll back optimistic workflow name update in canvas store on HTTP error |
| `765ed95` | Normalize and trim email whitespace during login and registration |
| `1fbc4ba` | Sanitize workflow title whitespace; enforce deterministic `nodeRun` ordering |
| `1ffaf47` | Scope upstream parent outputs by node ID for correct variable substitution in multi-parent DAGs |

---

## 📄 License & Contributing

- **License**: Released under the [MIT License](LICENSE).
- **Contributing**: Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

<div align="center">

Made with ❤️ by the **orchestra.ai** open-source team.

</div>
