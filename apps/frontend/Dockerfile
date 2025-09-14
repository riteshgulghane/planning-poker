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
# Set the backend URL for production builds
ARG BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL
RUN npm run build

# Production image
FROM node:18-alpine AS production
WORKDIR /app

# Copy necessary files for production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json .

# Expose the frontend port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Start the application
CMD ["npm", "start"]
