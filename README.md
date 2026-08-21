<div align="center">

# orchestra.ai

**Open-Source Visual Node-Based Engine for Building AI Automations & Multi-Agent Workflows**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-v14.2+-black?logo=next.js)](https://nextjs.org/)
[![Phase Status](https://img.shields.io/badge/Phase-Phase%209%20Completed%20%28Deployment%20%26%20Docs%29-emerald)](#-development-roadmap)
[![Tests](https://img.shields.io/badge/Tests-Passed-brightgreen?logo=vitest)](#-testing-suite-phase-8-summary)
[![CI/CD](https://img.shields.io/badge/CI-GitHub%20Actions-blue?logo=githubactions)](#-ci-workflow)

<br />

<img src="public/screenshot.png" alt="orchestra.ai Visual Node Engine Canvas Screenshot" width="100%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />

---

</div>

## 📌 Overview

**orchestra.ai** is an open-source visual workflow automation platform purpose-built for AI agents and multi-node orchestration. It combines the visual drag-and-drop simplicity of tools like Zapier and n8n with an engine built specifically for LLMs, sandboxed code execution, and real-time DAG execution tracking.

Connect user inputs, AI models, custom scripts, external webhooks, and structured outputs seamlessly on a unified interactive canvas.

---

## ✨ Feature Highlights

| Feature | Description |
| :--- | :--- |
| 🎨 **Visual Canvas Editor** | Interactive drag-and-drop workflow builder powered by **React Flow**, complete with custom dynamic nodes, snap-to-grid edge connectors, zoom/pan controls, and minimap navigation. |
| 🧩 **5 Core Node Types** | <ul><li>⚡ **Trigger Node**: Initiates DAG execution via manual user invocation or automated webhooks.</li><li>🧠 **AI Engine Node**: Multi-LLM provider support (Gemini, OpenAI, Anthropic) with custom system prompts & temperature tuning.</li><li>💻 **Data Processor Node**: Executes custom JavaScript transformation snippets in a safe, sandboxed environment.</li><li>🌐 **Integration Node**: Executes HTTP REST calls (GET/POST/PUT/DELETE) with dynamic variable template substitution.</li><li>🖥️ **Output Node**: Captures and renders final structured output payloads and execution summaries.</li></ul> |
| 🔐 **BYOK Architecture** | "Bring Your Own Key" system ensuring user API keys are encrypted at rest using industry-standard **AES-256 GCM** before database storage. |
| ⚡ **Background Orchestration** | Asynchronous, resilient job queue architecture powered by **Inngest** to prevent serverless execution timeouts during multi-LLM chaining. |
| 🛡️ **Sandboxed Code Execution** | Isolated JavaScript evaluation powered by **`isolated-vm`** with strict execution timeouts, memory limits, and zero host environment access. |
| 📊 **Live Execution Tracking** | Real-time visual node status feedback (Pending, Running, Success, Failed), topological DAG sorting, and automatic cycle detection. |

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework & Language** | [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **Workflow & Canvas** | [React Flow 11](https://reactflow.dev/), [Zustand](https://zustand-demo.pmnd.rs/) (State Management) |
| **Database & ORM** | [PostgreSQL (Neon)](https://neon.tech/), [Prisma ORM 5](https://www.prisma.io/) |
| **Async Architecture & Security** | [Inngest](https://www.inngest.com/) (Background Queue), [`isolated-vm`](https://github.com/laverdet/isolated-vm) (Sandbox), **AES-256** Encryption |
| **Testing Suite** | [Vitest](https://vitest.dev/) (Unit & Integration), [Playwright](https://playwright.dev/) (End-to-End) |

---

## 🚀 Getting Started

Follow these steps to set up **orchestra.ai** locally on your machine.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/junaidahmeddev/orchestra-ai.git
cd orchestra-ai
npm install
```

### 2. Environment Variables Setup

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Configure the required environment variables inside `.env.local`:

```env
# ── Database (Neon PostgreSQL) ────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require"

# ── NextAuth Authentication ───────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# ── AES-256 Encryption Key (32-byte hex) ─────────────────────
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="your-32-byte-hex-encryption-key"

# ── Inngest (Background Job Queue) ────────────────────────────
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

### 3. Database Migration

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

*(Optional)* Launch Prisma Studio to inspect your database models:

```bash
npm run prisma:studio
```

### 4. Run Development Server

**Standard Single Terminal Command:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore orchestra.ai.

**Dual Terminal Command (Recommended for Inngest Background Jobs):**

* Terminal 1 (Next.js Application):
  ```bash
  npm run dev
  ```
* Terminal 2 (Inngest Local Dev Server):
  ```bash
  npx inngest-cli@latest dev
  ```
  Access the Inngest Developer Dashboard at `http://127.0.0.1:8288`.

---

## 🧪 Testing Suite (Phase 8 Summary)

We maintain a rigorous 3-layer automated testing architecture ensuring stability across DAG calculations, database authorization, and user workflows:

- 🔬 **Unit Tests (Vitest)**: Validates pure graph execution algorithms (`topologicalSort`), AES-256 encryption/decryption, and memory-capped `isolated-vm` sandbox evaluation.
- 🔌 **Integration Tests (Vitest + Prisma Mocks)**: Verifies backend API endpoints, credential authentication routes (`/api/auth/register`), and workflow CRUD operations.
- 🎭 **End-to-End Tests (Playwright)**: Tests real browser interactions including login, canvas creation, dynamic node addition, connector edge linking, and state persistence.

### Test Runner Commands

```bash
# Run all Unit & Integration tests (Vitest)
npm test

# Run Unit tests in interactive watch mode
npm run test:watch

# Run Playwright End-to-End tests
npm run test:e2e
```

---

## 📁 Architecture & Project Structure

```
orchestra-ai/
├── prisma/
│   └── schema.prisma             # PostgreSQL schema & Prisma models
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/               # Login & Registration pages
│   │   ├── (dashboard)/          # Workflow listing & Canvas editor
│   │   └── api/                  # REST API Endpoints & Route Handlers
│   │       ├── auth/             # Registration & NextAuth handlers
│   │       ├── api-keys/         # Encrypted LLM key endpoints
│   │       ├── inngest/          # Inngest background queue webhook
│   │       └── workflows/        # Workflow CRUD & Execution handlers
│   ├── components/               # UI & Visual Canvas Components
│   │   ├── canvas/               # React Flow canvas, node palette & sidebars
│   │   │   └── nodes/            # 5 Custom Node React components
│   │   └── ui/                   # Shadcn UI reusable components
│   ├── lib/                      # Core Engine & Utilities
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── encryption.ts         # AES-256 GCM encryption helpers
│   │   └── engine/               # DAG Execution Engine
│   │       ├── topologicalSort.ts # Cycle detection & execution ordering
│   │       ├── executor.ts       # Main graph runner logic
│   │       └── nodeHandlers/     # Individual node logic handlers
│   ├── store/                    # Zustand canvas state management
│   └── types/                    # Shared TypeScript interfaces
├── e2e/                          # Playwright End-to-End specs
├── scripts/                      # Utility & encryption test scripts
├── package.json
└── README.md
```

---

## 🗺️ Development Roadmap

- [x] **Phase 0** — Project Scaffold & Next.js Setup
- [x] **Phase 1** — Database Design & Prisma Schema (Neon PostgreSQL)
- [x] **Phase 2** — Authentication System (NextAuth.js Credentials Provider)
- [x] **Phase 3** — Workflow CRUD Engine (API Routes & Security Guards)
- [x] **Phase 4** — Visual Canvas Editor (React Flow + Zustand State Slices)
- [x] **Phase 5** — DAG Execution Engine (Topological Sorting & Cycle Detection)
- [x] **Phase 6** — Inngest Background Execution & `isolated-vm` Sandbox
- [x] **Phase 7** — Encrypted API Key Storage (AES-256) & Gemini Integration
- [x] **Phase 8** — Comprehensive Testing Suite (30 Unit/Integration Tests + Playwright E2E)
- [x] **Phase 9** — Production Deployment & Documentation (Vercel + Neon + Inngest)

---

<div align="center">

Made with ❤️ by the **orchestra.ai** Open-Source Team.

</div>
