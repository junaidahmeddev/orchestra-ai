# orchestra.ai

Open-source, visual node-based tool for building AI automations and multi-agent workflows without code.

> **Status:** Phase 8 (Testing & Quality Assurance) complete. 25 automated unit & integration tests passing. See PRD for full roadmap.

## Tech Stack

Next.js 14 (App Router) · TypeScript · React Flow · Zustand · Tailwind CSS · PostgreSQL (Neon) · Prisma · NextAuth.js · Inngest · isolated-vm · Vitest · Playwright

## Getting Started

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `DATABASE_URL` (from Neon), `NEXTAUTH_SECRET`, and `ENCRYPTION_KEY`.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Testing Suite (Phase 8)

We maintain a 3-layer automated testing strategy:

- **Unit Tests (Vitest):** Pure logic verification (DAG Topological Sort, AES-256 Encryption/Decryption, isolated-vm Data Processor Sandbox).
- **Integration Tests (Vitest + Prisma Mocks):** API routes verification (Auth Register/Login flows, Workflow CRUD authorization & 401/403 security).
- **End-to-End Tests (Playwright):** Full browser workflow testing (Login, create workflow, add nodes, save, reload & confirm persistence).

### Running Tests

- **Run all Unit & Integration Tests:**
  ```bash
  npm run test
  ```
- **Run Unit Tests in Watch Mode:**
  ```bash
  npm run test:watch
  ```
- **Run Playwright E2E Tests:**
  ```bash
  npm run test:e2e
  ```

## Project Structure

```
src/
├── app/            # Next.js routes (pages + API routes)
│   └── api/        # Auth & Workflow CRUD API routes & integration tests
├── components/     # Canvas components (React Flow custom nodes & sidebars)
├── lib/            # Core logic: db, encryption, DAG engine, isolated-vm handlers & unit tests
├── store/          # Zustand state stores
└── types/          # Shared TypeScript types
e2e/                # Playwright End-to-End browser specs
prisma/
└── schema.prisma   # Database schema
```

## Development Roadmap

- [x] Phase 0 — Project Scaffold
- [x] Phase 1 — Database & Prisma Models
- [x] Phase 2 — Authentication (NextAuth Credentials)
- [x] Phase 3 — Workflow CRUD (API Routes)
- [x] Phase 4 — Visual Canvas Editor (React Flow + Zustand)
- [x] Phase 5 — DAG Executor Core (Topological Sort & Cycle Detection)
- [x] Phase 6 — Inngest Execution Engine & Sandbox
- [x] Phase 7 — Encrypted API Key Storage & Gemini Integration
- [x] Phase 8 — Testing (Unit, Integration, E2E)
