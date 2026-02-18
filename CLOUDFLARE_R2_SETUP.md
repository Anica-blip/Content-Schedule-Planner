# Cloudflare R2 Image Upload Setup Guide

## Overview

This guide explains how to set up Cloudflare R2 for image uploads in the Content Schedule Planner.

---

## Current Status

**Image URL Input**: ✅ Working
- Users can paste Cloudflare R2 URLs directly into the "Image URL" field
- URLs are saved to Supabase `posts.image_url` column
- Thumbnails display in calendar events

**Image Upload API**: ⏳ Pending Cloudflare Plan
- The `/api/upload.js` endpoint is created but needs Cloudflare R2 credentials
- Once you have R2 access, follow the setup steps below

---

## Prerequisites

1. **Cloudflare Account** with R2 enabled
2. **R2 Bucket** created for storing images
3. **API Credentials** (Account ID, Access Key, Secret Key)

---

## Step 1: Create R2 Bucket

1. Log in to Cloudflare Dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name: `content-schedule-planner` (or your preferred name)
5. Click **Create bucket**

---

## Step 2: Configure Public Access

1. Go to your bucket settings
2. Enable **Public Access** (if you want direct URLs)
3. Note your public bucket URL: `https://pub-<account-id>.r2.dev`

Alternatively, set up a custom domain:
1. Go to **R2** → **Your Bucket** → **Settings**
2. Add custom domain (e.g., `images.yourdomain.com`)
3. Update DNS records as instructed

---

## Step 3: Get API Credentials

1. In Cloudflare Dashboard, go to **R2**
2. Click **Manage R2 API Tokens**
3. Click **Create API Token**
4. Permissions: **Object Read & Write**
5. Save these credentials:
   - **Account ID**: Found in dashboard URL or overview
   - **Access Key ID**: Provided when creating token
   - **Secret Access Key**: Provided when creating token (save immediately!)

---

## Step 4: Deploy Upload API

### Option A: Vercel Deployment

1. Install dependencies:
```bash
npm install @aws-sdk/client-s3 formidable
```

2. Create `vercel.json`:
```json
{
  "functions": {
    "api/upload.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

3. Set environment variables in Vercel:
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=content-schedule-planner
```

4. Deploy:
```bash
vercel --prod
```

### Option B: Netlify Deployment

1. Install dependencies:
```bash
npm install @aws-sdk/client-s3 @netlify/functions formidable
```

2. Move `api/upload.js` to `netlify/functions/upload.js`

3. Set environment variables in Netlify dashboard

4. Deploy:
```bash
netlify deploy --prod
```

---

## Step 5: Update Frontend

Once API is deployed, update `js/app.js` to enable file uploads:

```javascript
// Replace handleImageUrlInput with both URL input AND file upload
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// In handlePostSubmit, upload file if selected
if (selectedImageFile) {
    const uploadResult = await uploadImage(selectedImageFile);
    if (uploadResult.success) {
        imageUrl = uploadResult.url;
    }
}

async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'schedule-planner');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}
```

---

## Step 6: Update HTML

Add file input back to `index.html`:

```html
<div class="form-group">
    <label class="form-label">Image</label>
    <div style="display: flex; gap: 10px; align-items: center;">
        <input type="file" id="imageInput" accept="image/*" onchange="handleImageSelect(event)" style="flex: 1;">
        <span>OR</span>
        <input type="url" id="imageUrlInput" class="form-input" placeholder="Paste URL..." onchange="handleImageUrlInput(event)" style="flex: 1;">
    </div>
    <img id="imagePreview" style="display:none; max-width:100%; margin-top:10px; border-radius:8px;">
</div>
```

---

## Current Workaround (Until R2 is Set Up)

**Manual Upload Process**:
1. Upload images to Cloudflare R2 manually via dashboard
2. Copy the public URL
3. Paste URL into "Image URL" field in Content Schedule Planner
4. Save post

The URL will be stored in Supabase and thumbnails will display correctly.

---

## Testing

Once API is deployed:

1. Create a new post
2. Select an image file
3. Should see preview
4. Save post
5. Check Supabase `posts` table - `image_url` should have R2 URL
6. Check calendar - thumbnail should display

---

## Troubleshooting

**CORS Issues**:
- Add CORS headers to R2 bucket
- In bucket settings, add allowed origins: `https://anica-blip.github.io`

**Upload Fails**:
- Check API credentials are correct
- Verify bucket name matches
- Check file size limits (R2 default: 5GB per object)

**Images Don't Display**:
- Verify bucket has public access enabled
- Check image URLs are accessible in browser
- Verify CORS headers allow cross-origin requests

---

## Cost Estimate

Cloudflare R2 Pricing:
- **Storage**: $0.015/GB per month
- **Class A Operations** (writes): $4.50 per million requests
- **Class B Operations** (reads): $0.36 per million requests
- **Egress**: FREE (no bandwidth charges!)

**Estimated Monthly Cost** (for typical usage):
- 1GB storage: $0.015
- 1,000 uploads: ~$0.005
- 10,000 views: ~$0.004
- **Total**: ~$0.02/month

Much cheaper than AWS S3!

---

## Security Best Practices

1. **Use API Token with Minimal Permissions**
   - Only grant Object Read & Write
   - Restrict to specific bucket

2. **Validate File Types**
   - Only allow image files
   - Check MIME types server-side

3. **Limit File Sizes**
   - Set max file size (e.g., 5MB)
   - Prevent abuse

4. **Use Environment Variables**
   - Never commit credentials to Git
   - Use `.env` files locally
   - Use platform environment variables in production

---

## Next Steps

1. Wait for Cloudflare plan to be resolved
2. Create R2 bucket
3. Get API credentials
4. Deploy upload API to Vercel/Netlify
5. Test file uploads
6. Update frontend to support both file upload and URL input

---

**Current Status**: URL input working, file upload pending R2 setup.
