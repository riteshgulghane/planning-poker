FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json* .

# Install dependencies
FROM base AS dependencies
RUN npm ci

# Build the app
FROM dependencies AS build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production
WORKDIR /app

# Copy node_modules and build output
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json .

# Expose the backend port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV production
ENV PORT 3001

# Start the application
CMD ["node", "dist/main"]
