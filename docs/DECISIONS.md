# Architecture Decision Records

> **Template note**: These ADRs document the template's own design decisions. After running `scripts/init.sh`, replace or extend them with your project's own decisions.

---

## ADR-001 — Use Bun as package manager and runtime

**Status**: Accepted  
**Date**: 2026-06-28

**Context**: The template needs a fast, modern JavaScript runtime and package manager. Options considered: npm, pnpm, Yarn Berry, Bun.

**Decision**: Bun provides the fastest install times, built-in workspace support, and a Jest-compatible test runner. The `bun.lockb` binary lockfile ensures reproducible installs.

**Consequences**: Developers must have Bun ≥ 1.1 installed. Node.js is still required for Jest (ts-jest) and Playwright.

---

## ADR-002 — Use Biome instead of ESLint + Prettier

**Status**: Accepted  
**Date**: 2026-06-28

**Context**: ESLint + Prettier requires separate configuration, plugin management, and slower execution.

**Decision**: Biome is a single Rust-based tool covering both linting and formatting at ~10–30× the speed. It supports TypeScript, JSX, and JSON natively.

**Consequences**: Biome does not support all ESLint plugins. Teams requiring specific ESLint plugins (e.g., `eslint-plugin-i18n`) must add ESLint alongside Biome.

---

## ADR-003 — Two app targets: Next.js and Vite

**Status**: Accepted  
**Date**: 2026-06-28

**Context**: Some projects need server-side rendering and a backend API (Next.js). Others are pure SPAs deployed to a CDN (Vite).

**Decision**: The template ships both `apps/web` (Next.js) and `apps/spa` (Vite). Teams can delete whichever they don't need. Both share `@template/ui` and `@template/utils`.

**Consequences**: Slightly larger template. The sharing of packages is the primary benefit — teams adopting only one app still get value from the shared packages.

---

## ADR-004 — Jest with ts-jest (not Vitest)

**Status**: Accepted  
**Date**: 2026-06-28

**Context**: Vitest integrates better with Vite but adds another dependency and a different config API. Jest is more widely known and works with both the Next.js app and the CLI tools.

**Decision**: Use Jest 29 + ts-jest for all unit and integration tests. Bun's built-in test runner (which is Jest-compatible) can be used for tool-level tests.

**Consequences**: Slightly slower test startup than Vitest. `@jest/globals` must be imported explicitly for type safety.

---

## ADR-005 — CVE Lite uses OSV.dev batch API

**Status**: Accepted  
**Date**: 2026-06-28

**Context**: `npm audit` requires internet access to the npm registry and is npm-specific. The GitHub Advisory Database requires auth for batch queries.

**Decision**: [OSV.dev](https://osv.dev) provides a free, unauthenticated batch query API that supports multiple ecosystems (npm, PyPI, Go, Maven, etc.).

**Consequences**: Requires internet access. Results may lag behind NVD by hours. No CVE CVSS v2 data — only v3 and ecosystem-specific severity.

---

## ADR-006 — Ports default to 9000+

**Status**: Accepted  
**Date**: 2026-06-28

**Context**: Common development ports (3000, 5173, 8080) are frequently occupied by other projects.

**Decision**: `apps/web` defaults to port 9000, `apps/spa` to port 9001. These are configurable via `APP_PORT` / `VITE_PORT` environment variables.

**Consequences**: Less likely to conflict with other projects on the same machine.
