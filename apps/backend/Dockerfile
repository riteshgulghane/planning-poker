# Unified Planning Poker Server Dockerfile
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy root package files first (for monorepo setup)
COPY package*.json ./
COPY turbo.json ./

# Copy shared package
COPY shared ./shared

# Copy backend files
COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/server.js ./apps/backend/

# Copy frontend package files
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies for the entire monorepo
RUN npm ci --workspace=backend --workspace=frontend --workspace=shared

# Build the shared package first
WORKDIR /app/shared
RUN npm run build

# Build the frontend static files
WORKDIR /app/apps/frontend
COPY apps/frontend/ .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S express -u 1001

# Copy built frontend and backend
COPY --from=base --chown=express:nodejs /app/apps/frontend/out ./frontend/out
COPY --from=base --chown=express:nodejs /app/apps/backend/server.js ./
COPY --from=base --chown=express:nodejs /app/apps/backend/package*.json ./
COPY --from=base --chown=express:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER express

# Expose the unified port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start the unified server
CMD ["node", "server.js"]
