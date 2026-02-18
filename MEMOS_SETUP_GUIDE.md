# Memos Setup Guide - Railway Deployment

## 📝 What is Memos?

Memos is a privacy-first, lightweight note-taking service. Perfect for:
- Quick content ideas and brainstorming
- Daily journaling and thoughts
- Task lists and reminders
- Knowledge base building
- Markdown support with tags

**Official Repo**: https://github.com/usememos/memos

---

## 🚀 Deployment on Railway

### Prerequisites
- Railway account (you already have this)
- GitHub account
- Domain (optional): `memos.3c-public-library.org`

---

## Method 1: Railway One-Click Deploy (Easiest)

### Step 1: Deploy from Railway Template

1. Go to Railway dashboard: https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from Template"**
4. Search for "Memos" or use this URL:
   ```
   https://railway.app/template/memos
   ```
5. Click **"Deploy Now"**

### Step 2: Configure Environment Variables

Railway will auto-configure most settings, but verify these:

```env
# Database (Railway auto-provisions PostgreSQL)
DATABASE_URL=${DATABASE_URL}

# Server Settings
PORT=5230
MEMOS_MODE=prod
MEMOS_ADDR=0.0.0.0
MEMOS_PORT=5230

# Optional: Custom Domain
MEMOS_PUBLIC_URL=https://memos.3c-public-library.org
```

### Step 3: Generate Domain

1. In Railway project, go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. You'll get: `your-app.up.railway.app`
4. Or add custom domain: `memos.3c-public-library.org`

### Step 4: Access Memos

1. Visit your Railway domain
2. Create admin account (first user becomes admin)
3. Start taking notes!

---

## Method 2: Deploy from Docker (More Control)

### Step 1: Create New Railway Project

1. Railway Dashboard → **"New Project"**
2. Select **"Empty Project"**
3. Click **"Add Service"** → **"Docker Image"**

### Step 2: Configure Docker Deployment

In Railway, set these variables:

```env
# Docker Image
RAILWAY_DOCKERFILE_PATH=Dockerfile

# Or use pre-built image
DOCKER_IMAGE=neosmemo/memos:latest

# Database
DATABASE_URL=postgresql://user:pass@host:5432/memos

# Server
PORT=5230
MEMOS_MODE=prod
MEMOS_DATA=/var/opt/memos
```

### Step 3: Add PostgreSQL Database

1. In same Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-links it via `DATABASE_URL`
3. Memos will auto-create tables on first run

### Step 4: Deploy

1. Railway auto-deploys on save
2. Check **"Deployments"** tab for status
3. View logs for any errors

---

## Method 3: Deploy from GitHub (Best for Updates)

### Step 1: Fork Memos Repository

1. Go to: https://github.com/usememos/memos
2. Click **"Fork"** to your GitHub account

### Step 2: Connect to Railway

1. Railway Dashboard → **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your forked `memos` repository
4. Railway detects Dockerfile automatically

### Step 3: Add Database

1. Add PostgreSQL as in Method 2
2. Railway sets `DATABASE_URL` automatically

### Step 4: Configure Build

Railway auto-detects settings, but verify:

```yaml
# railway.toml (optional, Railway auto-generates)
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "./memos"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

---

## 🔐 Security & Authentication

### Enable GitHub OAuth (Recommended)

1. **Create GitHub OAuth App**:
   - Go to: https://github.com/settings/developers
   - Click **"New OAuth App"**
   - Application name: `3C Memos`
   - Homepage URL: `https://memos.your-domain.com`
   - Authorization callback URL: `https://memos.your-domain.com/auth/callback/github`
   - Click **"Register application"**
   - Copy **Client ID** and **Client Secret**

2. **Configure in Railway**:
   ```env
   MEMOS_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
   MEMOS_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

3. **Restart Railway service**

### Password Protection

Memos has built-in user authentication:
- First user = admin
- Admin can create additional users
- Each user has private workspace
- Optional: Make instance private (admin-only signup)

---

## 🌐 Custom Domain Setup (Cloudflare)

### Step 1: Get Railway Domain

1. Railway project → **Settings** → **Networking**
2. Note the Railway domain: `memos-production-xxxx.up.railway.app`

### Step 2: Configure Cloudflare DNS

1. Cloudflare Dashboard → Your domain → **DNS**
2. Add CNAME record:
   ```
   Type: CNAME
   Name: memos
   Target: memos-production-xxxx.up.railway.app
   Proxy: ON (orange cloud)
   ```

### Step 3: Add Domain in Railway

1. Railway → **Settings** → **Networking** → **Custom Domain**
2. Enter: `memos.3c-public-library.org`
3. Railway verifies DNS automatically
4. SSL certificate auto-provisions (1-5 minutes)

### Step 4: Update Memos Config

```env
MEMOS_PUBLIC_URL=https://memos.3c-public-library.org
```

---

## 📊 Database Options

### Option A: Railway PostgreSQL (Recommended)
- **Cost**: Included in Railway plan
- **Setup**: One-click add
- **Backup**: Railway auto-backups
- **Size**: Scales with plan

### Option B: Supabase PostgreSQL (Your Existing)
- **Cost**: Included in Supabase Pro
- **Setup**: Manual connection string
- **Backup**: Supabase handles it
- **Benefit**: Centralized data

**To use Supabase**:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.cgxjqsbrditbteqhdyus.supabase.co:5432/postgres
```

### Option C: SQLite (Simplest, File-Based)
- **Cost**: Free
- **Setup**: No database needed
- **Backup**: Manual file backup
- **Limitation**: Single file, no scaling

**To use SQLite**:
```env
# Remove DATABASE_URL
MEMOS_DATA=/var/opt/memos
# Memos auto-creates SQLite file
```

---

## 🔧 Advanced Configuration

### Environment Variables Reference

```env
# Required
PORT=5230
MEMOS_MODE=prod

# Database (choose one)
DATABASE_URL=postgresql://...  # PostgreSQL
# OR
MEMOS_DATA=/var/opt/memos      # SQLite

# Server
MEMOS_ADDR=0.0.0.0
MEMOS_PORT=5230
MEMOS_PUBLIC_URL=https://your-domain.com

# Storage (for attachments)
MEMOS_DRIVER=DATABASE          # Store in DB
# OR
MEMOS_DRIVER=S3                # Use S3-compatible storage
S3_ENDPOINT=https://...
S3_BUCKET=memos-attachments
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# OAuth (optional)
MEMOS_OAUTH_GITHUB_CLIENT_ID=...
MEMOS_OAUTH_GITHUB_CLIENT_SECRET=...

# Features
MEMOS_ALLOW_SIGNUP=false       # Disable public signup
MEMOS_MAX_UPLOAD_SIZE=32       # MB
```

### Using Cloudflare R2 for Attachments

Since you have Cloudflare:

```env
MEMOS_DRIVER=S3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=memos-attachments
S3_ACCESS_KEY=your_r2_access_key
S3_SECRET_KEY=your_r2_secret_key
S3_REGION=auto
```

**Benefits**:
- Free 10GB storage
- Fast CDN delivery
- No egress fees

---

## 🔗 Integration with Your Dashboard

### Option 1: Embed in iFrame

```html
<!-- In your dashboard -->
<iframe 
  src="https://memos.3c-public-library.org" 
  width="100%" 
  height="600px"
  frameborder="0"
></iframe>
```

### Option 2: API Integration

Memos has REST API for programmatic access:

```javascript
// Fetch recent memos
const response = await fetch('https://memos.3c-public-library.org/api/v1/memos', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});
const memos = await response.json();
```

### Option 3: Link from Navigation

Update your `links-manager.html`:
```
Memos URL: https://memos.3c-public-library.org
```

---

## 💰 Cost Breakdown

### Railway Deployment
- **Railway Plan**: Already paying
- **PostgreSQL**: Included in plan
- **Bandwidth**: Included (generous limits)
- **Custom Domain**: Free
- **SSL Certificate**: Free (auto)

**Total Additional Cost**: **$0/month**

### Storage Costs (if using R2)
- **Cloudflare R2**: Free tier (10GB)
- **Beyond 10GB**: $0.015/GB/month

**Estimated**: **$0-2/month** depending on usage

---

## 🐛 Troubleshooting

### Issue: Railway deployment fails

**Solution**: Check logs in Railway dashboard
```bash
# Common issues:
- Missing DATABASE_URL
- Port conflict (ensure PORT=5230)
- Docker build errors (check Dockerfile)
```

### Issue: Can't access after deployment

**Solution**: 
1. Check Railway domain is generated
2. Verify service is running (green status)
3. Check health check endpoint: `https://your-app.railway.app/healthz`

### Issue: Database connection errors

**Solution**:
```bash
# Verify DATABASE_URL format:
postgresql://user:password@host:port/database

# Test connection in Railway shell:
psql $DATABASE_URL
```

### Issue: OAuth not working

**Solution**:
1. Verify callback URL matches exactly
2. Check Client ID/Secret are correct
3. Ensure MEMOS_PUBLIC_URL is set
4. Restart Railway service

---

## 📱 Mobile Access

Memos has a progressive web app (PWA):
1. Visit on mobile browser
2. Click "Add to Home Screen"
3. Works like native app
4. Offline support

---

## 🔄 Backup & Restore

### Automatic Backups (Railway PostgreSQL)
- Railway auto-backs up daily
- Restore from Railway dashboard
- Point-in-time recovery available

### Manual Backup (SQLite)
```bash
# In Railway shell
cp /var/opt/memos/memos_prod.db /backup/memos_backup_$(date +%Y%m%d).db
```

### Export All Memos
1. Memos Settings → **Export**
2. Downloads JSON file with all notes
3. Import on new instance if needed

---

## 🎯 Next Steps After Deployment

1. ✅ Create admin account (first signup)
2. ✅ Configure GitHub OAuth (optional)
3. ✅ Disable public signup if private
4. ✅ Set up custom domain
5. ✅ Configure R2 storage for attachments
6. ✅ Add to your dashboard navigation
7. ✅ Start capturing content ideas!

---

## 📚 Resources

- **Official Docs**: https://usememos.com/docs
- **GitHub**: https://github.com/usememos/memos
- **Railway Docs**: https://docs.railway.app
- **API Reference**: https://usememos.com/docs/api

---

## 🆘 Need Help?

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test database connection
4. Review Memos GitHub issues
5. Ask me (the genie) for help! 🧞‍♂️

---

**Estimated Setup Time**: 10-15 minutes
**Difficulty**: Easy (Railway handles most complexity)
**Maintenance**: Minimal (auto-updates available)
