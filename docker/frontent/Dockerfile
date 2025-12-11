# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install Bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lock ./
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install Bun
RUN npm install -g bun

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy source code
COPY . .

# Build the Next.js application - NX outputs to .next in the app folder
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run nx build vehicle-watchlist-ui

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output
# NX builds to dist/apps/vehicle-watchlist-ui
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui/.next/standalone ./
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui/.next/static ./dist/apps/vehicle-watchlist-ui/.next/static
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui/public ./dist/apps/vehicle-watchlist-ui/public

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 4200

ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

# Start Next.js server
CMD ["node", "dist/apps/vehicle-watchlist-ui/server.js"]