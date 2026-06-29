# Contributing

Thank you for contributing to this template. Follow these guidelines to keep the codebase clean and consistent.

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/your-fork/ts-react-fullstack-template
cd ts-react-fullstack-template

# 2. Install dependencies
bun install

# 3. Copy environment
cp .env.example .env.local

# 4. Verify setup
bun run typecheck
bun run check
bun run test:unit
```

## Branch Naming

All branches must follow this pattern:

```
<type>/<short-description>
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`

Examples:
- `feat/add-oauth-provider`
- `fix/cve-scanner-batch-error`
- `docs/update-readme-setup`

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `perf`

Examples:
```
feat(ui): add Tooltip component
fix(cve-lite): handle empty dependency list
chore(deps): bump bun to 1.2.0
```

## Code Standards

- All TypeScript — no `any`, `as unknown`, or type suppressions without a comment
- File length ≤ 1000 lines — split into modules if exceeded
- Named exports preferred over default exports
- No unused imports or variables (Biome enforces this)
- Wrap lines at 100 characters
- Accessibility: use semantic HTML, ARIA roles/labels where needed

## Before Submitting a PR

Run the full check locally:

```bash
bun run typecheck
bun run check           # Biome lint + format
bun run test:unit       # Jest unit tests
bun run cve             # Check for new CVEs
bun run index-check -- --path packages   # Validate barrel files
```

All checks must pass. PRs with failing CI will not be merged.

## Pull Request Template

When opening a PR, include:

1. **Summary**: What changed and why
2. **Testing**: How you verified the change
3. **Breaking changes**: Any API or configuration changes
4. **Checklist**:
   - [ ] `bun run typecheck` passes
   - [ ] `bun run check` passes
   - [ ] Tests added / updated
   - [ ] Documentation updated if needed
   - [ ] `docs/ACTIVITY_LOG.md` updated

## File Placement

| Code type | Location |
|---|---|
| Shared React components | `packages/ui/src/components/` |
| Shared utilities | `packages/utils/src/` |
| Next.js pages/API routes | `apps/web/src/app/` |
| SPA pages | `apps/spa/src/pages/` |
| CLI tools | `tools/<tool-name>/src/` |
| Unit tests | `tests/unit/` |
| Integration tests | `tests/integration/` |
| E2E tests | `tests/e2e/` |
| Docs / ADRs | `docs/` |
| Automation scripts | `scripts/` |
