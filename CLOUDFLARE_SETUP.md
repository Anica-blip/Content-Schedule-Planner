# Cloudflare Setup Documentation

**Project:** 3C Content Schedule Planner  
**Date:** January 2026  
**Domain:** planner.3c-public-library.org

---

## 📋 Cloudflare Pages Configuration

### **Page Details**
- **Project Name:** `content-schedule-planner`
- **Primary URL:** https://planner.3c-public-library.org
- **Alternate URL:** https://www.planner.3c-public-library.org (Active)
- **Default URL:** https://content-schedule-planner.pages.dev

### **Custom Domain Setup**
1. Navigate to: Cloudflare Dashboard → Pages → `content-schedule-planner`
2. Click: **Custom Domains**
3. Add: `planner.3c-public-library.org`
4. Add: `www.planner.3c-public-library.org`
5. Cloudflare automatically creates DNS records

---

## ⚙️ Worker Configuration

### **Worker Details**
- **Worker Name:** `content-schedule-planner`
- **Main File:** `_worker.js`
- **Route:** `planner.3c-public-library.org/*`

### **Worker Route Setup**
1. Navigate to: Cloudflare Dashboard → Workers & Pages
2. Select: `content-schedule-planner`
3. Go to: **Settings** → **Triggers**
4. Add Route: `planner.3c-public-library.org/*`
5. This connects the Worker to the subdomain for R2 uploads

### **Worker Functionality**
- Handles file uploads to R2 bucket
- Manages file deletion from R2
- Provides CORS headers for browser requests
- Serves as API layer between frontend and R2

---

## 🗄️ R2 Bucket Configuration

### **Bucket Details**
- **Bucket Name:** `schedule-planner`
- **Binding Name:** `R2_BUCKET`
- **Public URL:** `https://planner.3c-public-library.org`

### **Bucket Setup**
1. Navigate to: Cloudflare Dashboard → R2
2. Create bucket: `schedule-planner`
3. Bind to Worker: `R2_BUCKET`
4. Configure public access via Worker routes

---

## 🔐 Environment Variables

### **Set in Cloudflare Dashboard**
Location: Workers & Pages → `content-schedule-planner` → Settings → Variables

#### **Public Variables (vars)**
```
R2_PUBLIC_URL = "https://planner.3c-public-library.org"
```

#### **Secret Variables (encrypted)**
```
SUPABASE_URL = "your-supabase-project-url"
SUPABASE_ANON_KEY = "your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY = "your-supabase-service-role-key"
```

**Important:** Never commit secrets to Git. Always manage via Cloudflare Dashboard.

---

## 🚀 Deployment Process

### **Manual Deployment via Wrangler CLI**
```bash
# Navigate to project directory
cd Content-Schedule-Planner-main

# Deploy to Cloudflare Pages
npx wrangler pages deploy . --project-name=content-schedule-planner

# Verify deployment
# Visit: https://planner.3c-public-library.org
```

### **Deployment Notes**
- GitHub stores code for version control only
- Deployment is manual via Wrangler CLI
- Avoids build quota issues
- Better secret management

---

## 🌐 DNS Configuration

### **DNS Records (Auto-created by Cloudflare)**
```
Type: CNAME
Name: planner
Target: content-schedule-planner.pages.dev
Proxied: Yes

Type: CNAME
Name: www.planner
Target: content-schedule-planner.pages.dev
Proxied: Yes
```

---

## 🔄 CORS Configuration

### **Worker CORS Headers**
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

**Note:** CORS is configured in `_worker.js` and handles:
- Preflight OPTIONS requests
- All API responses include CORS headers
- Allows cross-origin requests from frontend

---

## 📊 API Endpoints

### **Worker API Routes**
- `POST /api/upload` - Upload image to R2
- `DELETE /api/delete` - Delete image from R2

### **Request Examples**

#### Upload Image
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'schedule-planner');

const response = await fetch('https://planner.3c-public-library.org/api/upload', {
  method: 'POST',
  body: formData
});
```

#### Delete Image
```javascript
const response = await fetch('https://planner.3c-public-library.org/api/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'schedule-planner/image.jpg' })
});
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### Worker not responding
- Verify route is configured: `planner.3c-public-library.org/*`
- Check Worker is deployed and active
- Verify R2 bucket binding is correct

#### CORS errors
- Ensure CORS headers are in `_worker.js`
- Check Worker route includes `/*` wildcard
- Verify OPTIONS preflight handling

#### R2 upload failures
- Check R2 bucket name matches binding
- Verify `R2_PUBLIC_URL` environment variable
- Ensure Worker has R2 permissions

#### Custom domain not working
- Wait 5-10 minutes for DNS propagation
- Verify DNS records are proxied (orange cloud)
- Check custom domain is added in Pages settings

---

## 📝 Maintenance Notes

### **Updating Environment Variables**
1. Go to: Cloudflare Dashboard → Workers & Pages
2. Select: `content-schedule-planner`
3. Navigate to: Settings → Variables
4. Update or add variables
5. Redeploy if necessary

### **Updating Worker Code**
1. Modify `_worker.js` locally
2. Commit to GitHub
3. Deploy via Wrangler CLI
4. Verify changes at live URL

---

## 🔗 Related Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

---

**Last Updated:** January 23, 2026  
**Maintained by:** Chef Anica-blip  
**For:** 3C Thread To Success
