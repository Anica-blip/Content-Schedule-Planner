# Dashboard Integration Guide

## 🎯 Adding Content Schedule Planner to Your Dashboard

This guide shows you how to link this app to your main dashboard (like the 3C Library).

---

## 📋 Option 1: Use the Launcher HTML

The simplest way - use the included `launcher.html` file.

### Step 1: Copy launcher.html
```bash
cp launcher.html /path/to/your/dashboard/content-planner.html
```

### Step 2: Add Link to Your Dashboard
In your dashboard HTML, add:
```html
<a href="content-planner.html" target="_blank" 
   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          text-decoration: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          font-weight: 600;">
    📅 Content Planner
</a>
```

### Step 3: Start the App
```bash
cd Content-Schedule-Planner-main
./start.sh
```

### Step 4: Click the Link
Opens launcher → Click "Open App" → App opens!

---

## 📋 Option 2: Direct Link (Simpler)

If the app is already running, link directly to it.

### Add to Your Dashboard:
```html
<a href="http://localhost:3000" target="_blank" 
   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          text-decoration: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;"
   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'">
    📅 Content Schedule Planner
</a>
```

**Note:** App must be running for this to work!

---

## 📋 Option 3: iFrame Embed (Advanced)

Embed the app directly in your dashboard.

### Add to Your Dashboard:
```html
<div style="width: 100%; height: 800px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <iframe 
        src="http://localhost:3000" 
        style="width: 100%; height: 100%; border: none;"
        title="Content Schedule Planner">
    </iframe>
</div>
```

**Pros:** Seamless integration  
**Cons:** Takes up space, app must be running

---

## 🎨 Example: 3C Library Integration

If you want to add it to your 3C Library admin dashboard:

### Edit admin.html:
```html
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
    <h1 style="margin-bottom: 0;">3C Dashboard Library - Admin Panel</h1>
    <div>
        <a href="library.html" target="_blank" 
           style="background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%); 
                  color: white; 
                  text-decoration: none; 
                  padding: 12px 24px; 
                  border-radius: 6px; 
                  font-weight: 600;
                  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
                  transition: transform 0.2s, box-shadow 0.2s;"
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(147, 51, 234, 0.4)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(147, 51, 234, 0.3)'">
            📚 3C Public Library
        </a>
        
        <!-- ADD THIS: -->
        <a href="http://localhost:3000" target="_blank" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  text-decoration: none; 
                  padding: 12px 24px; 
                  border-radius: 6px; 
                  font-weight: 600;
                  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                  transition: transform 0.2s, box-shadow 0.2s;
                  margin-left: 10px;"
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'">
            📅 Content Planner
        </a>
    </div>
</div>
```

---

## 🚀 Auto-Start Setup

To make the app start automatically when you boot your computer:

### Linux (systemd):

1. **Create service file:**
```bash
sudo nano /etc/systemd/system/content-planner.service
```

2. **Add this content:**
```ini
[Unit]
Description=Content Schedule Planner
After=network.target

[Service]
Type=simple
User=acer
WorkingDirectory=/home/acer/CascadeProjects/Content-Schedule-Planner-main/Content-Schedule-Planner-main
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

3. **Enable and start:**
```bash
sudo systemctl enable content-planner
sudo systemctl start content-planner
```

4. **Check status:**
```bash
sudo systemctl status content-planner
```

---

## 🔧 Port Management

### Run Multiple Apps:

**3C Library:** Port 8000
```bash
cd Dashboard-library
./start-server.sh
```

**Content Planner:** Port 3000
```bash
cd Content-Schedule-Planner-main
./start.sh
```

**Both running simultaneously!**

### Custom Ports:

**Content Planner on 5000:**
```bash
PORT=5000 ./start.sh
```

**3C Library on 8000:**
```bash
# Already configured in start-server.sh
```

---

## 📱 Mobile Access

### Access from Phone/Tablet:

1. **Find your computer's IP:**
```bash
hostname -I | awk '{print $1}'
```

2. **Start the app:**
```bash
./start.sh
```

3. **On mobile, go to:**
```
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

---

## 🎯 Production Deployment

For a permanent setup (not localhost):

### Option 1: Build and Serve Locally

```bash
# Build the app
npm run build

# Install serve
npm install -g serve

# Serve on port 8000
serve -s build -l 8000
```

Now accessible at: `http://localhost:8000`

### Option 2: Deploy to Netlify/Vercel

1. **Build the app:**
```bash
npm run build
```

2. **Deploy the `build/` folder** to:
   - Netlify: https://netlify.com
   - Vercel: https://vercel.com
   - GitHub Pages: https://pages.github.com

3. **Get permanent URL:**
```
https://your-content-planner.netlify.app
```

4. **Link from dashboard:**
```html
<a href="https://your-content-planner.netlify.app" target="_blank">
    📅 Content Planner
</a>
```

---

## 🎨 Customization

### Change App Colors:

Edit `src/theme.ts` or `src/App.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea', // Change this
    },
    secondary: {
      main: '#764ba2', // Change this
    },
  },
});
```

### Change App Title:

Edit `public/index.html`:
```html
<title>Your Custom Title</title>
```

---

## 📋 Quick Reference

### Start Commands:
```bash
# Simple start
./start.sh

# Custom port
PORT=8000 ./start.sh

# Or manually
npm start
PORT=8000 npm start
```

### Dashboard Links:
```html
<!-- Direct link -->
<a href="http://localhost:3000">Content Planner</a>

<!-- Launcher -->
<a href="launcher.html">Content Planner</a>

<!-- Production -->
<a href="https://your-app.netlify.app">Content Planner</a>
```

### Ports:
- **Default:** 3000
- **Custom:** Any available port
- **3C Library:** 8000 (recommended)
- **Content Planner:** 3000 (recommended)

---

## ✅ Testing Checklist

Before adding to dashboard:
- [ ] App runs successfully (`npm start`)
- [ ] Opens in browser at localhost:3000
- [ ] All features work
- [ ] Link from dashboard works
- [ ] Launcher HTML works (if using)
- [ ] Can run alongside other apps

---

## 🎉 You're Done!

Your Content Schedule Planner is now integrated with your dashboard!

**Quick Start:**
1. Run: `./start.sh`
2. Add link to dashboard
3. Click and use!

**For permanent setup:**
1. Build: `npm run build`
2. Deploy to Netlify/Vercel
3. Update dashboard link

---

**Need help? Check:**
- `QUICK-START.md` - How to run the app
- `README.md` - Project overview
- `package.json` - Available scripts
