# 3C Content Schedule Planner

This project is part of the 3C Thread To Success™ ecosystem — a growing digital platform that combines creativity, structure, and real-world application.

The 3C Thread To Success™ brand, including its name, structure, characters (Aurion 3C Mascot), and overall system design, remains the intellectual property of the creator and is not included in this license.

Commercial use of the brand or replication of the ecosystem identity is not permitted without permission.

---

**Live URL:** (https://anica-blip.github.io/Content-Schedule-Planner/index.html)

A modern social media content calendar for scheduling posts across multiple platforms with Supabase database and GitHub Pages hosting.

---

## ✨ Features

- 📅 **Interactive Calendar** - FullCalendar.js integration with month/week views
- ✏️ **Post Management** - Create, edit, delete, and schedule social media posts
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
├── package.json           # Dependencies
└── README.md              # This file
```

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
- Environment variables managed via GitHub repository settings
- Secrets never committed to Git

---

## 📝 Usage

1. **Create Post** - Click "New Post" button or select date on calendar
2. **Select Platform** - Choose from 8 supported platforms
3. **Add Content** - Write post content and add hashtags
4. **Schedule** - Set date and time for posting
5. **Save** - Post appears on calendar
6. **Edit/Delete** - Click post on calendar to modify or remove

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

**Infrastructure:** GitHub Pages, Supabase  
**Calendar Library:** FullCalendar.js  

---

## 📞 Support

**Email:** 3c.innertherapy@gmail.com  
**GitHub:** https://github.com/Anica-blip/Content-Schedule-Planner  

---

*Designed and Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success™ Cooking Lab*  🧪👨‍🍳

"Think Smarter, Not Harder - Zero Shortcuts"

---

## 👤 Creator

Anica-blip (“Chef”)
Founder of 3C Thread To Success™ ("Cooking Lab")
Independent Creator | Community Builder

---

🧠 Philosophy

“Think it. Do it. Own it.”

This project was built from vision, persistence, and a commitment to creating meaningful and structured experiences — even with minimal resources.
