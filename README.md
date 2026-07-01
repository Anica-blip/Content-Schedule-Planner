# 3C Content Schedule Planner

> ⚖️ This repository is protected under a binding [Legal Disclaimer](./LEGAL_DISCLAIMER.md) that governs all use, cloning, and forking from the date of inception. Please read before use.

This project is part of the 3C Thread To Success™ ecosystem — a growing digital platform that combines creativity, structure, and real-world application.

The 3C Thread To Success™ brand, including its name, structure, characters (Aurion 3C Mascot), and overall system design, remains the intellectual property of the creator and is not included in this license.

Commercial use of the brand or replication of the ecosystem identity is not permitted without permission.

---

**Live URL:** (https://anica-blip.github.io/Content-Schedule-Planner/index.html)

A FullCalendar-based content calendar that displays scheduled 3C content — pulled live from the [3C Content Record Centre](https://anica-blip.github.io/3c-content-record-centre/) — across month, week, and day views.

---

## ✨ Features

- 📅 **Month / Week / Day views** — FullCalendar.js, each view sized and laid out for what it actually needs to show (week/day are deliberately more compact and detail-dense than month)
- 🔗 **Live Record Centre bridge** — the Planner never stores a copy of real content. Each calendar entry is a lightweight reference (category, format, date, time, platform); the actual content (Card 1/2/3) is fetched live from Record Centre's Worker only when opened
- 👁️ **Read-only content popup** — clicking a card's eye icon opens a live, view-only rendering of that record's Card 1 (details), Card 2 (production notes), and Card 3 (distribution panel), styled independently from Record Centre's own editable cards
- 🧩 **Grouped same-time cards** — every calendar slot (one per day in month view, one per day+time in week/day) is a single grouped entry, even when it holds multiple records, so same-time content never has to fight for layout space
- 📱 **Responsive design** — works across desktop, tablet, and mobile
- 🎨 **Dark purple theme** — custom 3C branding with gradient backgrounds; the card popup uses its own scoped palette (violet / orange / turquoise), matching Record Centre's real format colours (SV / LV / PC)
- 🌐 **Platform badges** — Telegram, YouTube, TikTok, Pinterest, colour-coded to match Record Centre

**Not currently in this repo** (removed, pending a proper rebuild): manual post creation/editing, and drag-to-reschedule. Both belonged to an older, standalone scheduling system that predated the Record Centre bridge and was actively conflicting with it. The plan is to rebuild manual/"random" post support later, matching the current card visual style, running independently of the Record Centre Worker — see `SETUP.md`.

---

## 🚀 Tech Stack

### **Frontend**
- HTML5, CSS3, Vanilla JavaScript (ES6+, no build step)
- FullCalendar.js v6.1.19
- Supabase JS Client

### **Backend / Integration**
- Cloudflare Worker + R2 (Record Centre's content storage — the Planner reads from it live, never writes)
- GitHub OAuth (shared auth app with Record Centre)
- Supabase (PostgreSQL) — retained for a legacy `posts`/`platforms` schema from the removed manual-post system; currently unused by anything live, kept for the future rebuild rather than deleted outright

---

## 🎨 Design System

**Calendar / shell theme:**
- Dark Purple: `#1a0b2e` (Background)
- Medium Purple: `#2d1b4e` (Cards)
- Light Purple: `#9b59b6` (Primary buttons)
- Lighter Purple: `#b19cd9` (Titles)

**Header icons:** `#4ECDC4` (cyan), inline SVG — Record Centre link, Manage Navigation Links, Sign Out

**Record card popup** (`record-card.css`, scoped independently):
- Violet: `#5e17eb` — SV format / card header & footer
- Orange: `#ffbc66` — LV format
- Turquoise: `#03e493` — PC format
- Writing panel (Card 2/3): cream `#f1f1cb` background, blue `#233dff` text

---

## 📁 Project Structure

```
Content-Schedule-Planner/
├── index.html                 # Main application shell
├── links-manager.html         # Navigation links management page
├── config.js                  # Supabase config (anon key — safe to be public)
├── css/
│   ├── styles.css             # Main theme + FullCalendar overrides (month/week/day)
│   ├── record-card.css        # Read-only Card 1/2/3 popup styling (scoped, independent)
│   ├── navigation.css         # Slide-out nav panel
│   └── nav-toggle.css         # Nav panel toggle button
├── js/
│   ├── auth.js                # GitHub OAuth / Record Centre session handling
│   ├── supabaseAPI.js         # Legacy posts/platforms table access (dormant)
│   ├── app.js                 # Calendar init, Record Centre fetch + render, card layout
│   ├── navigation.js          # Slide-out nav panel behaviour
│   └── record-popup.js        # Read-only Card 1/2/3 popup (self-contained, no imports)
├── public/
│   ├── logo.png
│   ├── favicon.png
│   └── none.webp              # Nav toggle background-image asset
├── LEGAL_DISCLAIMER.md
├── SETUP.md                    # Architecture reference — read this before making changes
└── README.md
```

---

## 🔗 How Content Gets to the Calendar

This is the core architecture — see `SETUP.md` for full detail:

1. Content is created and edited entirely in **3C Content Record Centre**.
2. The Planner stores only a lightweight reference per calendar slot — category, format, date, time, platform. <!-- ⚠️ exact storage mechanism for this reference unconfirmed this session — table/schema not verified, described at the architecture level only -->
3. Clicking a card's eye icon calls Record Centre's Worker live and renders that record's Card 1/2/3 — nothing is cached in the Planner.
4. Auth is shared with Record Centre via the same GitHub OAuth App, so the Planner doesn't run a second auth system for this.

---

## 🔐 Security

- Supabase anon key in `config.js` — public/client-side by design, not a leaked secret
- Record Centre content access requires a valid Bearer token from the shared GitHub OAuth App
- Secrets never committed to Git

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

**Infrastructure:** GitHub Pages, Cloudflare Workers + R2, Supabase
**Calendar Library:** FullCalendar.js

---

## 📞 Support

**Email:** 3c.innertherapy@gmail.com
**GitHub:** https://github.com/Anica-blip/Content-Schedule-Planner

---

*Designed and Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success™ Cooking Lab* 🧪👨‍🍳

"Think Smarter, Not Harder - Zero Shortcuts"

---

## 👤 Creator

Anica-blip ("Chef")
Founder of 3C Thread To Success™
Independent Creator | Community Builder

---

## 🧠 Philosophy

"Think it. Do it. Own it."

This project was built from vision, persistence, and a commitment to creating meaningful and structured experiences — even with minimal resources.
