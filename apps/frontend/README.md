# Planning Poker Frontend

This is the frontend application for Planning Poker built with Next.js, Redux Toolkit, and Tailwind CSS.

## Deployment to Vercel

### Prerequisites
- A [Vercel](https://vercel.com) account
- Git repository with this code

### Deployment Steps

1. Log in to your Vercel account
2. From the dashboard, click "New Project"
3. Import your Git repository
4. Configure the project with the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: apps/frontend (important!)
   - **Build Command**: `cd ../.. && npm install && cd shared && npm run build && cd ../apps/frontend && npm run build`

5. Add the following environment variables:
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL (e.g., `https://planning-poker-backend.onrender.com`)

6. Click "Deploy"

### Important Notes
- Vercel will automatically build and deploy your Next.js application
- Make sure your backend is deployed and accessible before deploying the frontend
- Update the `NEXT_PUBLIC_BACKEND_URL` environment variable to point to your deployed backend

## Local Development

```bash
# Install dependencies
npm install

# Build shared package (required first)
cd ../../shared && npm run build

# Start development server
npm run dev
```
