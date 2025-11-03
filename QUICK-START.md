# Content Schedule Planner - Quick Start Guide

## 🚀 How to Run This Project

This is a **React application** that needs to be built before it can run in the browser.

---

## 📋 Prerequisites

Make sure you have Node.js installed:
```bash
node --version
# Should show v18 or higher
```

If not installed, Node.js is already available on your system (you have it for Windsurf).

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd /home/acer/CascadeProjects/Content-Schedule-Planner-main/Content-Schedule-Planner-main
npm install
```
**What this does:** Downloads all required packages (React, Material-UI, etc.)  
**Time:** 2-3 minutes first time

### Step 2: Start Development Server
```bash
npm start
```
**What this does:** Starts the app on port 3000  
**Opens automatically:** http://localhost:3000

### Step 3: Use the App!
The browser will open automatically. If not, go to:
```
http://localhost:3000
```

---

## 🎯 Using Different Ports

### Default Port (3000):
```bash
npm start
```

### Custom Port (8000):
```bash
PORT=8000 npm start
```
Then access at: http://localhost:8000

### Custom Port (Any):
```bash
PORT=5000 npm start
```

---

## 🛑 Stop the Server

Press **Ctrl + C** in the terminal

---

## 🏗️ Build for Production

To create a production-ready version:

```bash
npm run build
```

This creates a `build/` folder with optimized files.

### Serve the Built Version:
```bash
# Install serve globally (one time)
npm install -g serve

# Serve the build folder
serve -s build -l 8000
```

Access at: http://localhost:8000

---

## 📁 Project Structure

```
Content-Schedule-Planner/
├── public/              - Static files
│   └── index.html       - Main HTML file
├── src/                 - React source code
│   ├── components/      - React components
│   ├── App.tsx          - Main app component
│   └── index.tsx        - Entry point
├── package.json         - Dependencies and scripts
└── README.md            - Documentation
```

---

## 🔧 Available Commands

```bash
# Start development server (port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test

# Check code quality
npm run lint

# Fix code issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

---

## 🌐 Accessing from Other Devices

### On Same Network:

1. Find your local IP:
```bash
hostname -I | awk '{print $1}'
```

2. Start server:
```bash
npm start
```

3. Access from other device:
```
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

---

## 🐛 Troubleshooting

### "Port 3000 is already in use"
**Solution 1:** Use different port
```bash
PORT=8000 npm start
```

**Solution 2:** Kill process on port 3000
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

### "npm: command not found"
**Solution:** Node.js not installed properly
```bash
# Check if node is installed
which node

# If not found, reinstall Node.js
```

### "Module not found"
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
**Solution:** Clear cache and rebuild
```bash
npm run build -- --reset-cache
```

---

## 💡 Pro Tips

1. **Development Mode:**
   - Hot reload enabled (changes appear instantly)
   - Shows detailed errors
   - Slower performance

2. **Production Mode:**
   - Optimized and minified
   - Faster performance
   - Use `npm run build` then serve

3. **Keep Terminal Open:**
   - Server runs in terminal
   - Don't close it while using the app
   - Open new terminal for other commands

4. **Browser Auto-Opens:**
   - npm start opens browser automatically
   - If not, manually go to localhost:3000

---

## 🎨 Customization

### Change Default Port:
Edit `package.json`:
```json
"scripts": {
  "start": "PORT=8000 react-scripts start"
}
```

### Change App Title:
Edit `public/index.html`:
```html
<title>Your Custom Title</title>
```

---

## 📦 What Gets Installed

When you run `npm install`, these are installed:
- **React** - UI framework
- **Material-UI** - Component library
- **TypeScript** - Type safety
- **date-fns** - Date utilities
- **react-scripts** - Build tools

Total size: ~300-400MB (normal for React apps)

---

## 🚀 Next Steps

1. **Run the app:** `npm start`
2. **Explore features:** Content planning, scheduling
3. **Customize:** Edit files in `src/`
4. **Build:** `npm run build` when ready
5. **Deploy:** Upload `build/` folder to hosting

---

## 📞 Quick Reference

| Command | Purpose | Port |
|---------|---------|------|
| `npm start` | Development server | 3000 |
| `PORT=8000 npm start` | Custom port | 8000 |
| `npm run build` | Production build | - |
| `serve -s build -l 8000` | Serve build | 8000 |

---

**Ready to start? Run:**
```bash
npm install
npm start
```

**That's it! Your app will open at http://localhost:3000** 🎉
