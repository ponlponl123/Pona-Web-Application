# ========================
# Stage 1: Dependencies
# ========================
FROM oven/bun:1.3.1-alpine AS deps
WORKDIR /app

# Copy dependency definition files
COPY package.json package-lock.json* bun.lock* bun.lockb* ./

# Install dependencies using Bun for ultra-fast resolution
RUN bun install --frozen-lockfile || bun install

# ========================
# Stage 2: Builder
# ========================
FROM oven/bun:1.3.1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time Public ARGs (for CI/CD pipelines & local baking)
ARG NEXT_PUBLIC_DISCORD_CLIENT_ID
ARG NEXT_PUBLIC_DISCORD_OWNER_ID
ARG NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT
ARG NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT
ARG NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS

ENV NEXT_PUBLIC_DISCORD_CLIENT_ID=$NEXT_PUBLIC_DISCORD_CLIENT_ID \
    NEXT_PUBLIC_DISCORD_OWNER_ID=$NEXT_PUBLIC_DISCORD_OWNER_ID \
    NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT=$NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT \
    NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT=$NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT \
    NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT=$NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT \
    NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION \
    NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS=$NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build optimized Next.js standalone bundle (supports build-args and optional .env secret mount)
RUN --mount=type=secret,id=env,target=.env.production.local,required=false bun run build

# ========================
# Stage 3: Minimal Production Runner
# ========================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root dedicated application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
