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

# Build the Next.js application (static export)
# API URL is set at build time - use ARG for flexibility
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run nx build vehicle-watchlist-ui

# Stage 3: Production nginx server
FROM nginx:alpine AS runner

# Copy static export output
COPY --from=builder /app/dist/apps/vehicle-watchlist-ui /usr/share/nginx/html

# Copy nginx config
COPY docker/frontent/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 4200

# Start nginx
CMD ["nginx", "-g", "daemon off;"]