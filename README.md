# 3C Content Schedule Planner

**Built by:** Chef Anica-blip for 3C Thread To Success  
**AI Assistant:** Claude Sonnet 4.5 (Anthropic)  
**Live URL:** https://planner.3c-public-library.org

A modern social media content calendar for scheduling posts across multiple platforms with Cloudflare R2 image storage and Supabase database.

---

## ✨ Features

- 📅 **Interactive Calendar** - FullCalendar.js integration with month/week views
- ✏️ **Post Management** - Create, edit, delete, and schedule social media posts
- 🖼️ **Image Uploads** - Cloudflare R2 storage for post images
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Dark Purple Theme** - Custom 3C branding with gradient backgrounds
- 🗄️ **Supabase Database** - PostgreSQL with Row Level Security
- 🔄 **Drag & Drop** - Reschedule posts by dragging on calendar
- 🌐 **Multi-Platform** - Support for Facebook, Twitter, Instagram, LinkedIn, TikTok, YouTube, Telegram, Pinterest

---

## 🚀 Tech Stack

### **Frontend**
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- FullCalendar.js for calendar interface
- Supabase JS Client for database operations

### **Backend**
- Supabase (PostgreSQL with Row Level Security)
- Cloudflare R2 (Object storage for images)
- Cloudflare Workers (Serverless API)

### **Infrastructure**
- Cloudflare Pages (Static hosting with global CDN)
- Custom Domain: `planner.3c-public-library.org`
- Worker Route: `planner.3c-public-library.org/*`

---

## 🎨 Design System

**Color Palette:**
- Dark Purple: `#1a0b2e` (Background)
- Medium Purple: `#2d1b4e` (Cards)
- Light Purple: `#9b59b6` (Primary buttons)
- Lighter Purple: `#b19cd9` (Titles)
- Orange: `#ff6b35` (Create actions)
- Blue: `#4a90e2` (Edit actions)
- Green: `#27ae60` (Success actions)

---

## 📁 Project Structure

```
Content-Schedule-Planner/
├── index.html              # Main application page
├── css/
│   └── styles.css         # Dark purple theme styles
├── js/
│   ├── supabaseAPI.js     # Database operations
│   └── app.js             # Calendar and post management
├── public/
│   ├── logo.png           # 3C logo
│   └── favicon.png        # Site favicon
├── _worker.js             # Cloudflare Worker for R2 uploads
├── wrangler.toml          # Cloudflare configuration
├── package.json           # Dependencies
└── README.md              # This file
```

---

## ⚙️ Cloudflare Configuration

### **Page Subdomain**
- **URL:** https://planner.3c-public-library.org
- **Alternate:** www.planner.3c-public-library.org (Active)

### **Worker Route**
- **Route:** `planner.3c-public-library.org/*`
- **Purpose:** Connects Worker to subdomain for R2 uploads

### **R2 Bucket**
- **Bucket Name:** `schedule-planner`
- **Binding:** `R2_BUCKET`
- **Public URL:** `https://planner.3c-public-library.org`

### **Environment Variables**
Set in Cloudflare Dashboard → Workers → Settings → Variables:
- `R2_PUBLIC_URL` - Public URL for R2 objects
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin)

---

## 🗄️ Database Schema (Supabase)

### **Tables**

#### `platforms`
Stores social media platform information.
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Platform identifier
- `display_name` (VARCHAR) - Display name
- `icon_emoji` (VARCHAR) - Emoji icon
- `color` (VARCHAR) - Hex color code
- `enabled` (BOOLEAN) - Active status

#### `posts`
Stores scheduled social media posts.
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `title` (VARCHAR) - Post title
- `content` (TEXT) - Post content
- `platform` (VARCHAR) - Platform name
- `scheduled_date` (DATE) - Scheduled date
- `scheduled_time` (TIME) - Scheduled time
- `status` (VARCHAR) - 'draft', 'scheduled', 'published', 'failed'
- `image_url` (TEXT) - Public image URL
- `image_r2_key` (TEXT) - R2 object key
- `hashtags` (TEXT[]) - Array of hashtags
- `link_url` (TEXT) - External link
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

---

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only view/edit their own posts
- Environment variables managed in Cloudflare Dashboard
- Secrets never committed to Git
- CORS properly configured in Worker

---

## 🛠️ Development

### **Local Development**
```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Deploy to Cloudflare
npm run deploy
```

### **Manual Deployment**
```bash
# Deploy via Wrangler CLI
npx wrangler pages deploy . --project-name=content-schedule-planner
```

---

## 📝 Usage

1. **Create Post** - Click "New Post" button or select date on calendar
2. **Select Platform** - Choose from 8 supported platforms
3. **Add Content** - Write post content and add hashtags
4. **Upload Image** - Optional image upload to Cloudflare R2
5. **Schedule** - Set date and time for posting
6. **Save** - Post appears on calendar
7. **Edit/Delete** - Click post on calendar to modify or remove

---

## 🌐 Domain Structure

**Main Domain:** `3c-public-library.org`
- `/admin` - Admin panel
- `/library.html` - Library page

**Subdomains:**
- `builder.3c-public-library.org` - Interactive PDF builder
- `planner.3c-public-library.org` - Content Schedule Planner (this project)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

**Created by:** Chef Anica-blip  
**Organization:** 3C Thread To Success  
**AI Assistant:** Claude Sonnet 4.5 by Anthropic  
**Infrastructure:** Cloudflare Pages, Supabase  
**Calendar Library:** FullCalendar.js  

---

## 📞 Support

**Email:** 3c.innertherapy@gmail.com  
**GitHub:** https://github.com/Anica-blip/Content-Schedule-Planner  
**Website:** https://3c-public-library.org  

---

**Built with 💎 by 3C Thread To Success**  
**Powered by Claude Sonnet 4.5 (Anthropic)**
