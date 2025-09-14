# Planning Poker Backend

This is the backend service for the Planning Poker application built with Nest.js and WebSocket.

## Deployment to Render

### Prerequisites
- A [Render](https://render.com) account
- Git repository with this code

### Deployment Steps

1. Log in to your Render account
2. From the dashboard, select "New" and then "Web Service"
3. Connect your GitHub repository or select "Public Git repository" and enter the URL
4. Configure the service with the following settings:
   - **Name**: planning-poker-backend
   - **Root Directory**: apps/backend (important!)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

5. Add the following environment variables:
   - `PORT`: 3001
   - `NODE_ENV`: production

6. Click "Create Web Service"

### Important Notes
- The service will be built and deployed automatically
- The WebSocket server will be available at `wss://planning-poker-backend.onrender.com`
- Make sure to update the frontend's `NEXT_PUBLIC_BACKEND_URL` to point to this URL once deployed

## Local Development

```bash
# Install dependencies
npm install

# Build shared package (required first)
cd ../../shared && npm run build

# Start development server
npm run dev
```
