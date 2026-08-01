# Contributing to orchestra.ai

Thank you for your interest in contributing to **orchestra.ai**! We welcome contributions from developers of all skill levels to help make AI workflow automation open, accessible, and resilient.

---

## 📜 Code of Conduct

Please treat everyone in the community with respect, empathy, and constructive feedback.

---

## 🛠️ How to Contribute

### 1. Reporting Issues & Requesting Features
- Before creating a new issue, search existing [GitHub Issues](https://github.com/junaidahmeddev/orchestra-ai/issues) to ensure it hasn't already been reported.
- When submitting a bug report, please include:
  - Clear steps to reproduce the bug
  - Node.js version, OS, and browser environment
  - Error logs or visual screenshots (if canvas-related)

### 2. Local Development Workflow
1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/orchestra-ai.git
   cd orchestra-ai
   ```
3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Set up local environment variables**:
   Copy `.env.example` to `.env.local` and populate required local secrets (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, etc.).
5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
6. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-new-node
   ```

### 3. Testing & Code Quality Guidelines
Before opening a Pull Request, ensure that all checks pass locally:

```bash
# 1. Run type checking
npx tsc --noEmit

# 2. Run unit and integration tests (Vitest)
npm test

# 3. Verify production build succeeds
npm run build
```

---

## 🚀 Submitting a Pull Request (PR)

- Ensure PRs are focused on a single feature or bug fix.
- Write clear, self-explanatory commit messages.
- Provide a summary of changes and visual screenshots for UI/canvas modifications.
- Reference any relevant GitHub Issue IDs in your PR description (e.g. `Fixes #42`).

Thank you for helping build **orchestra.ai**!
