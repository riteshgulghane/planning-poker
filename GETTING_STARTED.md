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

### 3. Start the Development Servers

You can start both frontend and backend concurrently:

```bash
# Start both frontend and backend
npm run dev

# Or start them individually
npm run dev:backend  # Starts backend on port 3001
npm run dev:frontend # Starts frontend on port 3000
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend WebSocket server: http://localhost:3001

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
