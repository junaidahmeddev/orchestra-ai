# orchestra.ai

Open-source, visual node-based tool for building AI automations and multi-agent workflows without code.

> **Status:** Phase 0 (Project Scaffold) complete. See `/docs` (project root PRD) for full roadmap.

## Tech Stack

Next.js 14 (App Router) · TypeScript · React Flow · Zustand · Tailwind CSS · PostgreSQL (Neon) · Prisma · NextAuth.js · Inngest · isolated-vm

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `DATABASE_URL` (from Neon), `NEXTAUTH_SECRET`, and `ENCRYPTION_KEY`. See comments in `.env.example` for how to generate each one.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/            # Next.js routes (pages + API routes)
├── components/     # UI components (canvas nodes, shadcn primitives)
├── lib/            # Business logic: db client, encryption, DAG engine, validators
├── store/          # Zustand state stores
└── types/          # Shared TypeScript types
prisma/
└── schema.prisma   # Database schema (source of truth for all models)
```

## Development Roadmap

Full phase-by-phase plan lives in the project PRD. Current phase: **Phase 0 — Project Scaffold**.
