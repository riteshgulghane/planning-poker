# Render Deployment Guide for Planning Poker

This guide explains how to deploy the Planning Poker application to Render using the provided Docker configurations.

## Prerequisites

- A [Render](https://render.com) account
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Options

### Option 1: Automated Deployment with render.yaml (Recommended)

1. **Push the render.yaml file** to your repository root
2. **Connect your repository** to Render:
   - Go to your [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub/GitLab repository
   - Select the repository containing your Planning Poker app
   - Render will automatically detect the `render.yaml` file

3. **Deploy**: Render will automatically deploy both services according to the blueprint configuration

### Option 2: Manual Service Creation

#### Backend Deployment

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Backend Service**:
   - **Name**: `planning-poker-backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./apps/backend/Dockerfile.render`
   - **Docker Context Directory**: `.` (root)
   - **Instance Type**: `Starter` (or higher based on needs)

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   ```

4. **Health Check Path**: `/health`

#### Frontend Deployment

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Frontend Service**:
   - **Name**: `planning-poker-frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./apps/frontend/Dockerfile.render`
   - **Docker Context Directory**: `.` (root)
   - **Instance Type**: `Starter` (or higher based on needs)

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-service-url.onrender.com
   ```

   Replace `your-backend-service-url` with your actual backend service URL from step 1.

## Important Configuration Notes

### Monorepo Handling
- Both Dockerfiles are optimized for the monorepo structure
- They build the shared package first, then the specific application
- Docker context is set to the repository root to access all necessary files

### Environment Variables
- **Backend**: Uses Render's automatic `PORT` assignment
- **Frontend**: Requires `NEXT_PUBLIC_BACKEND_URL` pointing to your backend service

### Health Checks
- Both services include health check endpoints
- Backend: `/health`
- Frontend: `/api/health` (you may need to create this endpoint)

## Post-Deployment Steps

1. **Update Backend URL**: Once backend is deployed, update the frontend's `NEXT_PUBLIC_BACKEND_URL` environment variable with the backend's Render URL

2. **Test WebSocket Connection**: Ensure the WebSocket connection works between frontend and backend

3. **Configure CORS**: Update backend CORS settings to allow requests from your frontend domain

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure all dependencies are properly listed in package.json files
   - Check that the shared package builds successfully first

2. **Connection Issues**:
   - Verify `NEXT_PUBLIC_BACKEND_URL` points to the correct backend URL
   - Check CORS configuration in the backend

3. **WebSocket Issues**:
   - Render supports WebSockets, but ensure your backend properly handles WebSocket connections
   - Check that the Socket.IO configuration allows connections from your frontend domain

### Logs and Monitoring

- Access logs through the Render dashboard
- Monitor resource usage and scale instances as needed
- Set up alerts for service downtime

## Scaling Considerations

- **Starter Plan**: Good for development and light usage
- **Standard Plan**: Better for production with higher traffic
- **Pro Plan**: For high-traffic applications with advanced features

## Cost Optimization

- Use Render's free tier for development/testing
- Consider using a shared database service if you plan to add persistence
- Monitor usage and scale appropriately

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NestJS Production Guidelines](https://docs.nestjs.com/deployment)
