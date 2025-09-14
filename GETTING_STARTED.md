# Getting Started with Planning Poker

This guide will help you run the Planning Poker application locally and prepare it for deployment.

## Prerequisites

- Node.js v18+ (recommended)
- npm v8+
- Git

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if you haven't already)
git clone <your-repository-url>
cd planning-poker

# Install dependencies
npm install
```

### 2. Build the Shared Package

The shared package contains TypeScript types used by both frontend and backend:

```bash
cd shared
npm run build
cd ..
```

### Quick Start

### Prerequisites
- Node.js (v18 or later)
- npm

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Build frontend static files: `npm run build --workspace=frontend`
4. Start unified server: `npm run dev --workspace=backend` (runs on port 3000)

### Development URLs
- Application: http://localhost:3000
- API Health: http://localhost:3000/api/health
- WebSocket: ws://localhost:3000

## Architecture (Unified SSR)

The application now uses a single server architecture:
- **Backend**: Express.js server that serves both static frontend files and WebSocket API
- **Frontend**: Next.js built as static files, served by the Express backend
- **Real-time**: Socket.IO WebSocket integration for live planning poker sessions

## Running Tests

### Unit Tests

```bash
# Run all tests
npm run test

# Run frontend tests only
cd apps/frontend
npm run test

# Run backend tests only
cd apps/backend
npm run test
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
cd apps/frontend
npx playwright install

# Run E2E tests (make sure backend is running)
npm run test:e2e
```

## Deployment

### 1. Backend (Render)

Deploy the backend to Render following the instructions in `apps/backend/README.md`. Make sure to:

- Set the root directory to `apps/backend`
- Configure environment variables (`PORT`, `NODE_ENV`)

### 2. Frontend (Vercel)

Deploy the frontend to Vercel following the instructions in `apps/frontend/README.md`. Make sure to:

- Set the root directory to `apps/frontend`
- Set `NEXT_PUBLIC_BACKEND_URL` environment variable to your deployed backend URL

## Application Structure

- `apps/frontend`: Next.js frontend application
- `apps/backend`: Nest.js backend application
- `shared`: Shared TypeScript types and interfaces

## Features

- Create and join planning poker rooms
- Add, edit, and manage user stories
- Vote using Fibonacci sequence
- Real-time updates via WebSockets
- Responsive UI with Tailwind CSS

For more details, see the main `README.md` file.
