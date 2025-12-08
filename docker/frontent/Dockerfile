# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install Bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb ./
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

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run nx build vehicle-watchlist-ui --prod

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install Bun
RUN npm install -g bun

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui/.next/standalone ./
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui/.next/static ./dist/apps/vehicle-watchlist-ui/.next/static
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui/public ./dist/apps/vehicle-watchlist-ui/public

# If the build output is different, adjust accordingly
# For standard Next.js output in Nx:
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/vehicle-watchlist-ui/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/vehicle-watchlist-ui/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/vehicle-watchlist-ui/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
