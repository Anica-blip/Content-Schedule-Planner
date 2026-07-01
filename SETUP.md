# ⚙️ SETUP.md
### 3C Content Schedule Planner — Infrastructure & Setup Reference

This file exists so a fresh chat (or anyone else picking this up) has full context immediately — what's decided, what's built, and what's still open. Companion to the `3c-content-record-centre` repo's own SETUP.md, since the two are now being connected.

---

## 1. What This Repo Is

A social media content calendar (FullCalendar.js + Supabase + GitHub Pages). Existed before the 3C Content Record Centre did. Now connected to it as a **second, smaller project layered on top** — not a rewrite of what already works here.

**Stays exactly as it is, not part of this work:**
- The slide-out navigation panel (`#nav-panel`, the 📮🎤👥💡💺🔋🔏 emoji links) and its toggle button's panel-sliding behaviour
- `navigation.css` — untouched, not part of any of this

---

## 2. The Bridge to Content Record Centre — Core Architecture

**Decided and built:** the Planner never stores a copy of real content. It stores only the lightweight calendar button info — category, format, date, time, platform. Small, cheap records. The actual Card 1/2/3 content always lives in exactly one place: Content Record Centre's R2 storage.

**Why:** avoids duplicate data, avoids ballooning Supabase table costs (a real, stated budget constraint), and means there's only ever one true copy of any piece of content to keep consistent.

**How the eye icon works — built and working:** clicking it on a calendar event calls Content Record Centre's Worker **live** and shows Card 1/2/3 in a popup (`record-popup.js` + `record-card.css`), same visual/interaction weight as Record Centre's own view action, fully read-only. Nothing about the card's content is ever cached in the Planner; every click is a fresh pull.

**Auth — decided: Option 1.** The Planner authenticates against the **same GitHub OAuth App** as Record Centre (Client ID `Ov23ligayj6Dj10S7kx8`), so it already holds a Bearer token Record Centre's Worker accepts, rather than building a second auth system.

**Still genuinely open, not yet decided:**
- Exact mechanism for *how* the Planner obtains that token — whether it fully adopts Record Centre's OAuth flow for its own login, or layers it alongside the existing Supabase Auth specifically for calls to Record Centre's Worker. Needs deciding before this is fully resolved end-to-end.
- Exact bridge mechanism for *sending* a card from Record Centre to the Planner when "Schedule" is pressed there — push from Record Centre's Worker vs. Planner polling vs. something else. Still open.

**Both directions already have a UI button, neither is wired up yet:**
- Record Centre's index list has a Schedule icon per row (clock/orbit glyph) — currently shows a "not connected yet" toast, no real logic behind it
- Planner's header has a matching clock/orbit icon button linking back to Record Centre (`https://anica-blip.github.io/3c-content-record-centre/`) — this one **does** work, it's just a plain link, not part of the data bridge

---

## 3. Calendar Event Card — Built

Per Chef's mockup, for cards originating from Content Record Centre:

- Button title = `category`
- Button colour = format colour (matches Record Centre exactly: SV `#5e17eb`, LV `#ffbc66`, PC `#03e493`)
- **Month view:** compact card, existing rendering — unchanged, working, out of scope for the week/day work below
- **Week/day view:** 52px square card — category (small, ellipsis-truncated if too long), date as `DD.MM` (weekday dropped — the calendar grid already shows it), time, platform badge(s) + eye icon
- Eye icon = the only link back to the real content (see Section 2)
- Every slot (month: one per day, week/day: one per day+time) is always a single grouped entry, even with just one record — this is what removes same-time-collision layout fights at the source, rather than positioning multiple competing FullCalendar events
- Week/day slots that need more than one row of cards (enough records to wrap) get that specific slot's height grown to fit, measured from actual rendered content — FullCalendar's timegrid rows don't natively auto-grow like month view's do, so this is handled directly rather than left broken

**Known root cause, now fixed:** `styles.css` had duplicate, contradictory FullCalendar override blocks (two separate `.fc-timegrid-event-harness` rules, two separate `.fc-timegrid-col-events` rules) plus a hard-coded 50×50px `.fc-timegrid-event` box — all fighting each other and fighting `record-card.css`. This, not the card sizing itself, was the actual cause of cards rendering at unpredictable/oversized dimensions in week/day view. Removed entirely; month view's rules were untouched throughout.

---

## 4. Manual / "Random" Posts — Removed, Pending Rebuild

Content that isn't part of the 3C ecosystem must still be addable manually eventually — that freedom isn't gone, just paused.

**What happened:** the old manual-post system (Create/Edit modal, `openCreatePostModal`/`handlePostSubmit`/etc. in `app.js`, drag-to-reschedule, click-to-create) was actively conflicting with the Record Centre card rendering — different visual style, competing FullCalendar config (`editable`/`selectable`), and its own now-removed harness-positioning logic. It has been **removed from the live app** (button, modal, and all wiring), not just visually hidden.

**What's retained, dormant:** `supabaseAPI.js` and its `posts`/`platforms` Supabase tables still exist and are still initialized on load, but nothing currently calls them. Kept deliberately rather than deleted, so the future rebuild has something to build from if it's still useful.

**Not yet decided, still the same open question as before:** whether that rebuild continues using Supabase's `posts`/`platforms` tables, or mirrors Record Centre's own plain-JSON pattern instead (for the same cost-avoidance reason as Section 2's architecture). Chef paused this decision once before specifically to think it through — still unresolved, don't assume Supabase is the final answer.

**Same open complication as before, still parked:** once Record-Centre-mirrored cards and manually-added cards sit on the same calendar again, the manual ones will likely need separate handling so the two don't conflict — acknowledged, not solved yet, relevant again once the rebuild starts.

---

## 5. Recent Work Log

**Week/day card sizing overhaul (this session):**
- Root-caused and removed the duplicate/contradictory FullCalendar CSS in `styles.css` (see Section 3)
- Card size: 85px → 54px → settled at 52px
- Category font increased (7.5px → 9px) now that the sizing conflict is gone
- Date label simplified to `DD.MM` (weekday dropped, redundant with the calendar grid)
- Added slot-height growth for week/day when a group wraps to 2+ rows of cards
- Removed the entire manual-post system (see Section 4)

**Card popup polish (this session):**
- `record-card.css` width: 420px → 340px (was leaving a large empty gap next to short field values)
- Platform-letter row padding tightened + `flex-wrap` safety fallback, to keep all 4 platform letters fitting at the narrower width
- Date/Time field spacing rebalanced (Time label pushed right, timestamp pulled left) to stop the timestamp wrapping
- Title/Index field min-height: flat 90px (copied from Record Centre's real editable `<textarea>`, which doesn't apply here) → 48px, calculated from this field's actual font-size (14.72px) × line-height (1.6) × 2 lines — removes the large empty gap after short titles, still fits genuine two-line titles without clipping

**Earlier — toolbar icon swap:** the two emoji header buttons (🔊 Create Post, 🔗 Manage Links) were replaced with inline SVG icons in `#4ECDC4`. The floating diamond nav-toggle button (`#nav-toggle-btn`) was deliberately left as plain 💎 emoji and was **not** part of that swap — if its icon is ever changed, note that `nav-toggle.css` hides text/emoji via `font-size: 0 !important` and shows the real icon as a `background-image: url('../public/none.webp')`, not emoji or inline content. Any future icon change there needs that background-image approach removed first, or the new icon will silently never show.

**Versioning note — this repo uses a different convention than Record Centre's.** Here it's semantic-style strings (`?v=1.1.5`), not Record Centre's incrementing integer (`?v=11`). Don't mix the two conventions across repos — follow whichever pattern is already in the file being edited.

---

## 6. Existing Supabase Setup

- Project URL: `https://cgxjqsbrditbteqhdyus.supabase.co`
- Uses the **anon key** (in `config.js`) — this is designed to be public/client-side safe, not a leaked secret, no rotation needed
- Powers the legacy `posts` and `platforms` tables via `supabaseAPI.js` — currently dormant, nothing calls them since the manual-post system was removed (Section 4)
- Whether this continues to be used long-term for the manual-post rebuild is the open question in Section 4 above

---

## 7. Goal — Stated Plainly

Both repos need to be usable by someone without much technical background, beyond changing their own content/details. Keep that bar in mind for anything built here — not just "it works for Chef," but "it works for anyone who clones it."

---

**3C Thread To Success™**
*Think Smarter, Not Harder — Zero Shortcuts*
