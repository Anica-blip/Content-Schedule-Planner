# Vaultwarden Setup Guide - Railway Deployment

## 🔐 What is Vaultwarden?

Vaultwarden is a lightweight, self-hosted password manager compatible with Bitwarden clients. Perfect for:
- Secure password storage with zero-knowledge encryption
- Cross-platform access (web, mobile, desktop, browser extensions)
- Password generation and auto-fill
- Secure notes and file attachments
- Two-factor authentication (2FA)
- Organization/team password sharing

**Official Repo**: https://github.com/dani-garcia/vaultwarden

**Why Vaultwarden vs Bitwarden**:
- Much lighter resource usage (perfect for Railway)
- Same client apps and features
- Free for all features (no premium needed)
- Self-hosted = full control

---

## 🚀 Deployment on Railway

### Prerequisites
- Railway account (you already have this)
- Domain (recommended): `vault.3c-public-library.org`
- SMTP email service (for account verification - optional)

---

## Method 1: Railway Docker Deploy (Recommended)

### Step 1: Create New Railway Project

1. Go to Railway dashboard: https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Empty Project"**
4. Name it: `vaultwarden-3c`

### Step 2: Add Docker Service

1. Click **"New"** → **"Docker Image"**
2. In the service settings, add environment variables (see Step 3)

### Step 3: Configure Environment Variables

```env
# Docker Image
RAILWAY_DOCKERFILE_PATH=Dockerfile

# Or use pre-built image (recommended)
DOCKER_IMAGE=vaultwarden/server:latest

# Server Configuration
DOMAIN=https://vault.3c-public-library.org
ROCKET_PORT=8080
PORT=8080

# Security
SIGNUPS_ALLOWED=true              # Set to false after creating your account
INVITATIONS_ALLOWED=true          # Allow inviting users
SHOW_PASSWORD_HINT=false          # Security best practice
ADMIN_TOKEN=                      # Generate with: openssl rand -base64 48

# Database (Railway PostgreSQL - recommended)
DATABASE_URL=${DATABASE_URL}

# Email (optional but recommended for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_FROM=noreply@3c-public-library.org
SMTP_PORT=587
SMTP_SECURITY=starttls
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Attachments
ATTACHMENTS_FOLDER=/data/attachments
ICON_CACHE_FOLDER=/data/icon_cache

# Advanced Security
WEBSOCKET_ENABLED=true
EXTENDED_LOGGING=true
LOG_LEVEL=info
```

### Step 4: Add PostgreSQL Database

1. In same Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically links it via `DATABASE_URL`
3. Vaultwarden will create tables on first run

### Step 5: Generate Domain

1. In Railway service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. You'll get: `vaultwarden-production-xxxx.up.railway.app`
4. Update `DOMAIN` env var to match

### Step 6: Deploy

1. Railway auto-deploys
2. Check **"Deployments"** tab for status
3. Wait for "Success" status (1-3 minutes)

### Step 7: Create Admin Account

1. Visit your Railway domain
2. Click **"Create Account"**
3. Enter email and master password
4. **IMPORTANT**: Save master password securely!
5. After creating account, set `SIGNUPS_ALLOWED=false`

---

## Method 2: Deploy from GitHub (For Custom Builds)

### Step 1: Fork Vaultwarden (Optional)

Only needed if you want custom modifications:
```bash
# Fork: https://github.com/dani-garcia/vaultwarden
```

### Step 2: Deploy to Railway

1. Railway → **"New Project"** → **"Deploy from GitHub repo"**
2. Select vaultwarden repo
3. Railway detects Dockerfile
4. Add environment variables from Method 1

---

## 🔐 Security Hardening

### Generate Admin Token

The admin panel should be protected:

```bash
# On your local machine:
openssl rand -base64 48

# Copy output and set as ADMIN_TOKEN in Railway
```

**Admin panel URL**: `https://vault.your-domain.com/admin`

### Disable Signups After Setup

After creating your account:
```env
SIGNUPS_ALLOWED=false
INVITATIONS_ALLOWED=true  # Only you can invite users
```

### Enable 2FA (Two-Factor Authentication)

1. Login to Vaultwarden
2. Settings → **Two-step Login**
3. Choose method:
   - Authenticator App (recommended)
   - Email
   - YubiKey (hardware key)

### Password Policy

Configure in admin panel:
- Minimum password length: 12
- Require uppercase, lowercase, numbers, symbols
- Password hint disabled

---

## 🌐 Custom Domain Setup (Cloudflare)

### Step 1: Get Railway Domain

Note your Railway domain: `vaultwarden-production-xxxx.up.railway.app`

### Step 2: Configure Cloudflare DNS

1. Cloudflare Dashboard → **DNS**
2. Add CNAME record:
   ```
   Type: CNAME
   Name: vault
   Target: vaultwarden-production-xxxx.up.railway.app
   Proxy: ON (orange cloud)
   TTL: Auto
   ```

### Step 3: Add Custom Domain in Railway

1. Railway service → **Settings** → **Networking** → **Custom Domain**
2. Enter: `vault.3c-public-library.org`
3. Railway verifies DNS (instant if Cloudflare proxy is ON)
4. SSL auto-provisions (1-5 minutes)

### Step 4: Update Environment Variables

```env
DOMAIN=https://vault.3c-public-library.org
```

Redeploy Railway service for changes to take effect.

---

## 📧 Email Configuration (Recommended)

Email is needed for:
- Password reset
- Account verification
- Security notifications
- Invitations

### Option A: Gmail SMTP

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy 16-character password

3. **Configure in Railway**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_FROM=noreply@3c-public-library.org
   SMTP_FROM_NAME=3C Vault
   SMTP_PORT=587
   SMTP_SECURITY=starttls
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

### Option B: SendGrid (Free Tier)

1. Sign up: https://sendgrid.com (100 emails/day free)
2. Create API key
3. Configure:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_FROM=noreply@3c-public-library.org
   SMTP_PORT=587
   SMTP_SECURITY=starttls
   SMTP_USERNAME=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

### Option C: Cloudflare Email Routing (Free)

Since you use Cloudflare:
1. Cloudflare → Email → Email Routing
2. Set up forwarding: `vault@3c-public-library.org` → your email
3. Use with SMTP relay service

---

## 📱 Client Apps Setup

### Browser Extensions

**Chrome/Edge/Brave**:
1. Install: https://chrome.google.com/webstore (search "Bitwarden")
2. Click extension icon
3. Settings (gear icon) → **Server URL**
4. Enter: `https://vault.3c-public-library.org`
5. Login with your credentials

**Firefox**:
1. Install: https://addons.mozilla.org/firefox (search "Bitwarden")
2. Same setup as Chrome

### Mobile Apps

**iOS**:
1. App Store → Download "Bitwarden"
2. Open app → Settings (gear) → **Self-hosted**
3. Server URL: `https://vault.3c-public-library.org`
4. Login

**Android**:
1. Google Play → Download "Bitwarden"
2. Same setup as iOS

### Desktop Apps

**Windows/Mac/Linux**:
1. Download: https://bitwarden.com/download/
2. Install and open
3. File → Settings → **Self-hosted**
4. Server URL: `https://vault.3c-public-library.org`
5. Login

---

## 🔧 Advanced Configuration

### File Attachments Storage

By default, attachments stored in container (lost on redeploy).

**Use Railway Volumes** (persistent):
1. Railway service → **Settings** → **Volumes**
2. Add volume: `/data`
3. Update env vars:
   ```env
   ATTACHMENTS_FOLDER=/data/attachments
   ICON_CACHE_FOLDER=/data/icon_cache
   ```

**Or use Cloudflare R2**:
```env
# Not natively supported, requires custom build
# Stick with Railway volumes for simplicity
```

### Database Options

#### Option A: Railway PostgreSQL (Recommended)
```env
DATABASE_URL=${DATABASE_URL}  # Auto-set by Railway
```

#### Option B: Supabase PostgreSQL (Centralized)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.cgxjqsbrditbteqhdyus.supabase.co:5432/postgres?schema=vaultwarden
```

Create schema in Supabase:
```sql
CREATE SCHEMA IF NOT EXISTS vaultwarden;
```

#### Option C: SQLite (Simplest)
```env
# Remove DATABASE_URL
# Vaultwarden creates SQLite file in /data
```

### Admin Panel Features

Access: `https://vault.your-domain.com/admin`

**Features**:
- View all users
- Delete users
- Disable 2FA for users (emergency)
- View diagnostics
- Force password reset
- Backup database

### Backup Configuration

```env
# Enable automatic backups
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
```

Or use Railway's PostgreSQL backups (automatic).

---

## 🔗 Integration with Your Dashboard

### Option 1: Direct Link in Navigation

Update `links-manager.html`:
```
Password Manager URL: https://vault.3c-public-library.org
```

### Option 2: Embed in iFrame (Not Recommended)

Vaultwarden blocks iFrame embedding for security (X-Frame-Options).

### Option 3: Browser Extension Integration

Best approach - users install browser extension:
- Auto-fill passwords on your dashboard
- Generate secure passwords
- Save new credentials automatically

---

## 🔄 Migration from Other Password Managers

### From LastPass

1. LastPass → More Options → Advanced → **Export**
2. Save CSV file
3. Vaultwarden → Tools → **Import Data**
4. Select "LastPass (csv)"
5. Upload file

### From 1Password

1. 1Password → File → **Export** → All Items
2. Format: CSV
3. Import to Vaultwarden (same as LastPass)

### From Chrome/Firefox Passwords

1. Browser → Settings → Passwords → **Export**
2. Save CSV
3. Import to Vaultwarden

---

## 💰 Cost Breakdown

### Railway Deployment
- **Railway Plan**: Already paying
- **PostgreSQL**: Included
- **Storage Volume**: Free (up to 1GB)
- **Bandwidth**: Included
- **Custom Domain**: Free
- **SSL**: Free (auto)

**Total Additional Cost**: **$0/month**

### Optional Costs
- **SMTP Service**: Free (Gmail, SendGrid free tier)
- **Extra Storage**: $0.25/GB/month (if needed)

**Estimated Total**: **$0/month**

---

## 🐛 Troubleshooting

### Issue: Can't access admin panel

**Solution**:
```env
# Ensure ADMIN_TOKEN is set
ADMIN_TOKEN=your-generated-token

# Access: https://vault.your-domain.com/admin
# Enter token when prompted
```

### Issue: Email not sending

**Solution**:
1. Check SMTP credentials
2. Test SMTP in admin panel: `/admin` → Diagnostics → Test SMTP
3. Check Railway logs for errors
4. Verify Gmail app password (not regular password)

### Issue: "Invalid server URL" in clients

**Solution**:
1. Ensure DOMAIN env var matches exactly
2. Include `https://` in server URL
3. No trailing slash
4. Restart Railway service after changing DOMAIN

### Issue: Database connection errors

**Solution**:
```bash
# Verify DATABASE_URL format
postgresql://user:password@host:port/database

# Check Railway PostgreSQL is running
# View logs in Railway dashboard
```

### Issue: Lost master password

**Unfortunately**: Cannot recover (zero-knowledge encryption)
**Prevention**:
- Write down master password
- Store in physical safe
- Use password hint (but keep it vague)
- Enable emergency access for trusted person

---

## 🔒 Security Best Practices

### 1. Strong Master Password
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique (not used anywhere else)
- Memorable but complex
- Example: `Correct-Horse-Battery-Staple-2026!`

### 2. Enable 2FA
- Use authenticator app (Authy, Google Authenticator)
- Save backup codes securely
- Consider hardware key (YubiKey)

### 3. Regular Backups
- Export vault monthly
- Store encrypted backup offline
- Test restore process

### 4. Disable Signups
```env
SIGNUPS_ALLOWED=false
```

### 5. Monitor Access
- Check admin panel regularly
- Review login attempts
- Enable email notifications

### 6. Keep Updated
- Railway auto-updates Docker image
- Or manually: Change `DOCKER_IMAGE` to `vaultwarden/server:latest`

---

## 📊 Monitoring & Maintenance

### Health Checks

Railway auto-monitors:
- HTTP health endpoint: `/alive`
- Auto-restart on failure

### Logs

View in Railway dashboard:
```bash
# Click service → "Logs" tab
# Filter by level: info, warn, error
```

### Database Maintenance

PostgreSQL auto-maintained by Railway:
- Auto-vacuum
- Auto-analyze
- Performance optimization

### Updates

**Automatic** (recommended):
```env
DOCKER_IMAGE=vaultwarden/server:latest
```
Railway pulls latest on each deploy.

**Manual**:
1. Check releases: https://github.com/dani-garcia/vaultwarden/releases
2. Update `DOCKER_IMAGE` to specific version
3. Redeploy

---

## 🎯 Post-Deployment Checklist

- [ ] Vaultwarden deployed and accessible
- [ ] Custom domain configured (`vault.3c-public-library.org`)
- [ ] SSL certificate active (HTTPS)
- [ ] Admin account created
- [ ] Admin token set and tested
- [ ] Signups disabled (`SIGNUPS_ALLOWED=false`)
- [ ] 2FA enabled on admin account
- [ ] SMTP configured and tested
- [ ] Browser extension installed and configured
- [ ] Mobile app installed and configured
- [ ] Backup strategy in place
- [ ] Added to dashboard navigation
- [ ] Imported passwords from old manager (if any)

---

## 🆘 Emergency Procedures

### Lost Admin Token

1. Railway → Service → Variables
2. Generate new token: `openssl rand -base64 48`
3. Update `ADMIN_TOKEN`
4. Redeploy service

### Locked Out (Forgot Master Password)

**No recovery possible** - this is by design (zero-knowledge).

**Prevention**:
- Emergency access feature (set up trusted contact)
- Physical backup of master password
- Password hint (vague, not obvious)

### Database Corruption

1. Railway → PostgreSQL → Backups
2. Restore from latest backup
3. Or restore from manual export

### Service Down

1. Check Railway status page
2. View deployment logs
3. Restart service manually
4. Check environment variables
5. Verify database connection

---

## 📚 Resources

- **Official Docs**: https://github.com/dani-garcia/vaultwarden/wiki
- **Bitwarden Help**: https://bitwarden.com/help/
- **Railway Docs**: https://docs.railway.app
- **Security Audit**: https://bitwarden.com/help/is-bitwarden-audited/

---

## 🔐 Sharing Passwords with Team (Organizations)

### Create Organization

1. Vaultwarden → New Organization
2. Name: `3C Team`
3. Invite members via email

### Collections

Organize passwords by project:
- `3C Dashboard`
- `Content Planner`
- `Marketing Tools`
- `Social Media`

### Permissions

- **Admin**: Full access
- **User**: View/use passwords
- **Manager**: Manage collections

---

## 🆘 Need Help?

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test SMTP in admin panel
4. Review Vaultwarden GitHub issues
5. Check Railway community forum
6. Ask me (the genie) for help! 🧞‍♂️

---

**Estimated Setup Time**: 15-20 minutes
**Difficulty**: Easy-Medium (Railway handles complexity)
**Maintenance**: Minimal (auto-updates, auto-backups)
**Security**: Enterprise-grade with zero-knowledge encryption

---

## 🎁 Bonus: Quick Start Commands

### Generate Admin Token
```bash
openssl rand -base64 48
```

### Test SMTP (in admin panel)
```
Admin Panel → Diagnostics → Test SMTP
```

### Backup Database (Railway CLI)
```bash
railway run pg_dump $DATABASE_URL > vaultwarden_backup.sql
```

### Restore Database
```bash
railway run psql $DATABASE_URL < vaultwarden_backup.sql
```

---

**Ready to deploy?** Follow Method 1 for the quickest setup! 🚀
