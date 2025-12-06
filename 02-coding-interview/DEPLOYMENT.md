# Deploying to Railway

This guide will help you deploy the Coding Interview Platform to Railway's free tier.

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Your code pushed to a GitHub repository

## Deployment Steps

### 1. Push Your Code to GitHub
```bash
git push origin main
```

### 2. Deploy to Railway

#### Option A: Using Railway Dashboard (Recommended)
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `02-coding-interview`
5. Railway will automatically detect the Dockerfile
6. Click **"Deploy"**

#### Option B: Using Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3. Configure Environment (Optional)
Railway will automatically:
- Build using your `Dockerfile`
- Expose port 8000
- Provide a public URL

No additional environment variables are needed for basic deployment.

### 4. Access Your Application
After deployment completes (2-3 minutes):
1. Go to your Railway project dashboard
2. Click on your service
3. Find the **"Deployment URL"** (e.g., `https://your-app.railway.app`)
4. Open the URL to access your application

## Important Notes

### Free Tier Limits
- **$5 free credit per month**
- **500 hours of usage** (sufficient for hobby projects)
- Application sleeps after inactivity (cold starts ~10-30 seconds)

### WebSocket Support
Railway fully supports WebSockets, so your real-time collaboration features will work out of the box.

### Custom Domain (Optional)
You can add a custom domain in Railway settings:
1. Go to your service settings
2. Click **"Domains"**
3. Add your custom domain

## Monitoring
- View logs in Railway dashboard
- Monitor usage and costs
- Set up alerts for credit usage

## Troubleshooting

### Build Fails
- Check Railway build logs
- Ensure all dependencies are in `package.json` and `pyproject.toml`

### Application Won't Start
- Verify port configuration (Railway sets `$PORT` automatically)
- Check application logs in Railway dashboard

### Out of Credits
- Upgrade to Railway Pro ($5/month minimum)
- Or wait for monthly credit reset

## Cost Optimization
- Railway charges based on:
  - CPU usage
  - Memory usage
  - Network egress
- Free tier is sufficient for development and small-scale testing
- Monitor your usage in the Railway dashboard

## Next Steps
- Set up GitHub auto-deployments (enabled by default)
- Configure custom domain
- Add monitoring/analytics
- Consider upgrading for production use
