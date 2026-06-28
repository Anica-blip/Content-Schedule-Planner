# ⚙️ SETUP.md
### 3C Content Schedule Planner — Infrastructure & Setup Reference

This file exists so a fresh chat (or anyone else picking this up) has full context immediately — what's decided, what's built, and what's still open. Companion to the `3c-content-record-centre` repo's own SETUP.md, since the two are now being connected.

---

## 1. What This Repo Is

A social media content calendar (FullCalendar.js + Supabase + GitHub Pages). Existed before the 3C Content Record Centre did. Now being connected to it as a **second, smaller project layered on top** — not a rewrite of what already works here.

**Stays exactly as it is, not part of this work:**
- The slide-out navigation panel (`#nav-panel`, the 📮🎤👥💡💺🔋🔏 emoji links) and its toggle button's panel-sliding behaviour
- `navigation.css` — untouched, not part of any of this

---

## 2. The Bridge to Content Record Centre — Core Architecture

**Decided:** the Planner never stores a copy of real content. It stores only the lightweight calendar button info — category, format, day, date, time, platform. Small, cheap records. The actual Card 1/2/3 content always lives in exactly one place: Content Record Centre's R2 storage.

**Why:** avoids duplicate data, avoids ballooning Supabase table costs (a real, stated budget constraint), and means there's only ever one true copy of any piece of content to keep consistent.

**How the eye icon works:** clicking it on a calendar event calls Content Record Centre's Worker **live** and shows Card 1 in a popup — same visual/interaction as Record Centre's own view action. Nothing about the card's content is ever cached in the Planner; every click is a fresh pull.

**Auth — decided: Option 1.** The Planner authenticates against the **same GitHub OAuth App** as Record Centre (Client ID `Ov23ligayj6Dj10S7kx8`), so it already holds a Bearer token Record Centre's Worker accepts, rather than building a second auth system.

**Still genuinely open, not yet decided:**
- Exact mechanism for *how* the Planner obtains that token — whether it fully adopts Record Centre's OAuth flow for its own login, or layers it alongside the existing Supabase Auth specifically for calls to Record Centre's Worker. Needs deciding before the eye-icon feature can actually be built.
- Exact bridge mechanism for *sending* a card from Record Centre to the Planner when "Schedule" is pressed there — push from Record Centre's Worker vs. Planner polling vs. something else. Still open.

**Both directions already have a UI button, neither is wired up yet:**
- Record Centre's index list has a Schedule icon per row (clock/orbit glyph) — currently shows a "not connected yet" toast, no real logic behind it
- Planner's header now has a matching clock/orbit icon button linking back to Record Centre (`https://anica-blip.github.io/3c-content-record-centre/`) — this one **does** work, it's just a plain link, not part of the data bridge

---

## 3. Calendar Event Card — Agreed Spec

Per Chef's mockup, for cards originating from Content Record Centre:

- Button title = `category`
- Button colour = format colour (matches Record Centre exactly: SV `#5e17eb`, LV `#ffbc66`, PC `#03e493`)
- Shows: day, date, time, platform abbreviation (colour-coded)
- Eye icon = the only link back to the real content (see above)

**Not yet built:** the actual calendar event rendering for any of this. Today's work was the toolbar only — the event-card styling and the SV/LV/PC format badges (without a circular background, unlike Record Centre's circular ones — transparent if a circle currently exists) still need building once the bridge mechanism is settled.

---

## 4. Manual / "Random" Posts — Deferred, Leaning Decided

Content that isn't part of the 3C ecosystem must still be addable manually — that freedom stays, not a regression.

**Not yet decided, but the clear leaning:** avoid a Supabase table for this too, for the same cost reason as the bridge decision above — most likely mirroring Record Centre's own pattern (plain JSON, no traditional database) rather than defaulting to Supabase out of habit. `supabaseAPI.js` already has a working `posts`/`platforms` table implementation from earlier — whether that continues to be used, or gets replaced, is explicitly still open. Chef paused this decision once before specifically to think it through properly — don't assume Supabase is the final answer here.

**One open complication, flagged but not being solved yet:** once Record-Centre-mirrored cards and manually-added cards sit on the same calendar, the manual ones may need separate handling so the two don't conflict. Acknowledged, deliberately parked.

---

## 5. Today's Work — Toolbar Icon Swap (Done)

Replaced two emoji with inline SVG icons, colour `#4ECDC4` (clean cyan, reads well against the dark purple theme):

| Was | Now | Used for |
|---|---|---|
| 🔊 | Megaphone icon | Create New Post (manual) |
| 🔗 | Compass icon | Manage Navigation Links |
| 🚪 | Door + arrow icon | Sign Out |

**The floating diamond toggle button (`#nav-toggle-btn`, opens the slide-out nav panel) was never part of this and stays exactly as it was — plain 💎 emoji, original `nav-toggle.css` background-image setup untouched.** An earlier draft of this work mistakenly swapped this button's icon too; reverted in full. If this button's icon is ever genuinely meant to change, note for next time: `nav-toggle.css` hides text/emoji via `font-size: 0 !important` and shows the real icon as a `background-image: url('../public/none.webp')` — not emoji, not inline content. Any future icon change here needs that background-image approach removed first, or the new icon will silently never show.

Icons were hand-drawn as SVG from Chef's reference image, not pulled directly from the Canva file — Claude's sandbox can't fetch files from Canva's domain. Visually close, not pixel-identical to the original Canva assets.

**Versioning note — this repo uses a different convention than Record Centre's.** Here it's semantic-style strings (`?v=1.1.5`), not Record Centre's incrementing integer (`?v=11`). Don't mix the two conventions across repos — follow whichever pattern is already in the file being edited.

**Files still not seen by Claude, referenced in `index.html` but never uploaded:** `js/app.js`, `js/navigation.js`. Needed before touching any actual calendar/event logic.

---

## 6. Existing Supabase Setup (Pre-existing, Unrelated to the Bridge)

- Project URL: `https://cgxjqsbrditbteqhdyus.supabase.co`
- Uses the **anon key** (in `config.js`) — this is designed to be public/client-side safe, not a leaked secret, no rotation needed
- Currently powers the existing `posts` and `platforms` tables (manual post scheduling) via `supabaseAPI.js`
- Whether this continues to be used long-term is the open question in Section 4 above

---

## 7. Goal — Stated Plainly

Both repos need to be usable by someone without much technical background, beyond changing their own content/details. Keep that bar in mind for anything built here — not just "it works for Chef," but "it works for anyone who clones it."

---

**3C Thread To Success™**
*Think Smarter, Not Harder — Zero Shortcuts*
