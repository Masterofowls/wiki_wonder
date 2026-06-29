# ── Build stage ──────────────────────────────────────────────────
# Builds the Next.js web app inside a Bun container.
# Adjust ARGs below to match your project's structure.
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching.
# Add any additional workspace manifests your build depends on.
COPY package.json bunfig.toml bun.lock* ./
COPY packages/ui/package.json      ./packages/ui/
COPY packages/utils/package.json   ./packages/utils/
COPY packages/config/package.json  ./packages/config/
COPY apps/web/package.json         ./apps/web/

RUN bun install --frozen-lockfile

# Copy all source files.
COPY . .

# Build the Next.js application.
WORKDIR /app/apps/web
RUN bun run build

# ── Runtime stage ─────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Change PORT to match your preferred production port.
ENV NODE_ENV=production
ENV PORT=9000

# Non-root user — recommended for production containers.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./.next/static

USER nextjs

EXPOSE 9000

# Health check — update the path if your health endpoint differs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://0.0.0.0:9000/api/health || exit 1

CMD ["node", "server.js"]
