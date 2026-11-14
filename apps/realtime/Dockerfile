# syntax=docker/dockerfile:1
# COLLABO Realtime Control Plane — Multi-Stage Production Dockerfile

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Dependency installation & build stage
FROM base AS builder
WORKDIR /app

# Copy root manifests and workspace package manifests for cached layer caching
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/realtime/package.json ./apps/realtime/
COPY packages/shared/package.json ./packages/shared/
COPY packages/auth/package.json ./packages/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/whiteboard/package.json ./packages/whiteboard/
COPY packages/voice/package.json ./packages/voice/
COPY packages/ai/package.json ./packages/ai/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# Copy source trees
COPY tsconfig.base.json ./
COPY apps/realtime ./apps/realtime
COPY packages/shared ./packages/shared
COPY packages/auth ./packages/auth
COPY packages/database ./packages/database
COPY packages/whiteboard ./packages/whiteboard
COPY packages/voice ./packages/voice
COPY packages/ai ./packages/ai

# Build realtime package
RUN pnpm --filter @collabo/realtime build

# 2. Lightweight production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/realtime ./apps/realtime
COPY --from=builder /app/packages ./packages

EXPOSE 4000

# Docker healthcheck querying /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "apps/realtime/dist/index.js"]
