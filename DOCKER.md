# Docker Setup for Planning Poker

This document provides instructions for running the Planning Poker application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (usually bundled with Docker Desktop)

## Building and Running with Docker

### Option 1: Using Docker Compose (Recommended)

The simplest way to run the application is using Docker Compose, which will build and run both frontend and backend services:

```bash
# Navigate to the project root
cd planning-poker

# Build and start the containers in detached mode
docker compose up -d

# To see the logs
docker compose logs -f
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001 (WebSocket server)

To stop the services:
```bash
docker compose down
```

### Option 2: Building and Running Individual Containers

You can also build and run the containers individually:

#### Backend

```bash
# Navigate to the backend directory
cd apps/backend

# Build the Docker image
docker build -t planning-poker-backend .

# Run the container
docker run -p 3001:3001 --name planning-poker-backend planning-poker-backend
```

#### Frontend

```bash
# Navigate to the frontend directory
cd apps/frontend

# Build the Docker image
docker build -t planning-poker-frontend --build-arg BACKEND_URL=http://localhost:3001 .

# Run the container
docker run -p 3000:3000 --name planning-poker-frontend planning-poker-frontend
```

## Environment Variables

### Backend

- `PORT`: The port the backend will listen on (default: 3001)
- `NODE_ENV`: The environment mode (development/production)

### Frontend

- `NEXT_PUBLIC_BACKEND_URL`: URL of the backend service
- `PORT`: The port the frontend will listen on (default: 3000)

## Development with Docker

For development purposes, you can mount your local source code into the containers to see changes in real-time:

```bash
# Example for running backend in development mode with volume mounts
docker run -p 3001:3001 \
  -v $(pwd)/apps/backend/src:/app/src \
  --name planning-poker-backend-dev \
  planning-poker-backend
```

## Troubleshooting

- If you encounter connection issues between frontend and backend, ensure that the `NEXT_PUBLIC_BACKEND_URL` is correctly set when building the frontend.
- For permission issues on Linux, you might need to use `sudo` with Docker commands.
