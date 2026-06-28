/**
 * 3C Content Schedule Planner - Main Application
 */

let calendar;
let currentPost = null;
let selectedImageFile = null;

// ── datesSet debounce timer ────────────────────────────────────────────────────
// datesSet fires multiple times rapidly when switching views (FullCalendar
// internal re-renders). Without debouncing, each fire calls removeAllEvents()
// and re-fetches, causing a race condition where the last fire "wins" and
// wipes events loaded by a prior fire. 150ms settles all view-switch bursts.
let _datesSetTimer = null;

// Platform configuration with abbreviations and colors (matching dashboard)
const PLATFORMS = {
    instagram: { name: 'Instagram', abbr: 'IS', icon: '📸', color: '#e4405f' },
    facebook:  { name: 'Facebook',  abbr: 'FB', icon: '📘', color: '#1877f2' },
    linkedin:  { name: 'LinkedIn',  abbr: 'LK', icon: '💼', color: '#0077b5' },
    twitter:   { name: 'Twitter/X', abbr: 'TX', icon: '🐦', color: '#1da1f2' },
    youtube:   { name: 'YouTube',   abbr: 'YT', icon: '📺', color: '#ff0000' },
    tiktok:    { name: 'TikTok',    abbr: 'TK', icon: '🎵', color: '#000000' },
    telegram:  { name: 'Telegram',  abbr: 'TG', icon: '✈️', color: '#0088cc' },
    pinterest: { name: 'Pinterest', abbr: 'PI', icon: '📌', color: '#bd081c' },
    whatsapp:  { name: 'WhatsApp Business', abbr: 'WB', icon: '💬', color: '#25d366' },
    discord:   { name: 'Discord',   abbr: 'DC', icon: '🎮', color: '#5865f2' },
    forum:     { name: 'Forum',     abbr: 'FM', icon: '💭', color: '#ff6b35' }
};

// ── Mirrors Record Centre's numbering.js exactly (file confirmed 2026-06-28).
// Copied rather than imported: app.js is a plain script, not an ES module,
// and the inline onsubmit="..." handlers in index.html need these functions
// to stay on window — switching to modules would break those. Keep this
// block in sync if numbering.js ever changes.
const PLATFORM_ABBR = { Telegram: 'TG', YouTube: 'YT', TikTok: 'TK', Pinterest: 'PI' };
const ALL_PLATFORMS = Object.keys(PLATFORM_ABBR);
const FORMAT_ABBR_LOOKUP = { 'short video': 'SV', 'long video': 'LV', 'post card': 'PC' };

// Per-format colour AND correct text contrast — SV's violet needs white
// text, LV's pastel orange and PC's turquoise need dark text to stay
// readable. Matches numbering.js's FORMAT_META exactly, not a blanket
// white as originally assumed.
const FORMAT_META = {
    SV: { colour: '#5e17eb', font: '#ffffff' },
    LV: { colour: '#ffbc66', font: '#1a1a1a' },
    PC: { colour: '#03e493', font: '#1a1a1a' }
};

const PERSONA_ABBR = { Falcon: 'FL', Panther: 'PT', Wolf: 'WF', Lion: 'LN', All: 'AL' };

function lookupPersonaAbbr(persona) {
    const key = Object.keys(PERSONA_ABBR).find(k => k.toLowerCase() === String(persona || '').toLowerCase());
    return key ? PERSONA_ABBR[key] : persona;
}

// Year/month only — mirrors numbering.js's parseDateParts() exactly,
// including its today-fallback. Built for card-header display, NOT for
// placing an event on the calendar — see parseRecordCalendarDate() further
// down for that, which is a genuinely different job numbering.js doesn't do.
function parseRecordYearMonth(dateStr) {
    const match = /(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '');
    if (match) return { year: match[1], month: match[2] };
    const now = new Date();
    return { year: String(now.getFullYear()), month: String(now.getMonth() + 1).padStart(2, '0') };
}

// Mirrors numbering.js's formatCardHeaderForPlatform() exactly — the
// header shown at the top of Card 1 itself, e.g. "YT-SV-FL-06.26-0055".
function formatCardHeaderForPlatform(record, platform) {
    const abbr = PLATFORM_ABBR[platform] || platform;
    const f    = FORMAT_ABBR_LOOKUP[record.format] || record.format;
    const pr   = lookupPersonaAbbr(record.persona);
    const { year, month } = parseRecordYearMonth(record.date);
    const yy   = year.slice(-2);
    const seq  = record.sequences?.[platform];
    const seqStr = seq != null ? String(seq).padStart(3, '0') : '---';
    return `${abbr}-${f}-${pr}-${month}.${yy}-${seqStr}`;
}

const RECORD_CENTRE_API = 'https://recordmanagement.threadcommand.center';

async function initApp() {
    console.log('🚀 Initializing 3C Content Schedule Planner...');
    
    const supabaseInit = await supabaseAPI.init();
    if (!supabaseInit) {
        console.warn('⚠️ Supabase not configured, using localStorage fallback');
    }

    // ── Session guard — runs after client is ready ─────────────────────────
    if (supabaseAPI.client) {
        const { data: { session } } = await supabaseAPI.client.auth.getSession();
        if (!session) {
            console.warn('⚠️ No session — redirecting to login');
            window.location.href = 'login.html';
            return;
        }
    }
    
    injectCalendarStyles();
    initCalendar();
    // NOTE: loadPosts() is no longer called here directly.
    // The calendar's datesSet callback fires immediately on render and
    // handles the initial load automatically.
    console.log('✅ App initialized');
}

function injectCalendarStyles() {
    const style = document.createElement('style');
    style.id = '3c-calendar-styles';
    style.textContent = `
        /* ── WEEK/DAY VIEW: compact event cards ──────────────────────────────── */
        .fc-timegrid-event {
            border-radius: 6px !important;
            min-height: 20px !important;
            overflow: visible !important;
        }
        .fc-timegrid-event .fc-event-main {
            padding: 0 !important;
            overflow: visible !important;
        }

        /* ── ALL VIEWS: remove default FC event chrome ───────────────────────── */
        .fc-event {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }
        .fc-event-main {
            overflow: visible !important;
        }
        .fc-daygrid-event {
            white-space: normal !important;
            overflow: visible !important;
        }

        /*
         * 2B: FC renders the grid background only.
         * Container placement for week/day is handled entirely by our
         * requestAnimationFrame logic in eventDidMount below.
         * No harness CSS rules here — rAF+setProperty('important') wins.
         */
    `;
    document.head.appendChild(style);
}

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        editable:    true,
        selectable:  true,
        height:      'auto',
        initialDate: new Date(),
        nowIndicator: true,
        defaultTimedEventDuration: '00:30',
        eventMaxStack: 10,
        dayMaxEventRows: false,
        eventOrder: 'start',
        eventOverlap: true,

        // slotEventOverlap: true (default) — MUST remain true.
        // false tells FC "don't allow same-time events in the same slot" which
        // causes it to physically push the 2nd event into the next day column.
        // We handle visual separation manually via eventDidMount instead.
        slotEventOverlap: true,

        displayEventTime: true,

        // ── datesSet: debounced to prevent race conditions ─────────────────────
        // FullCalendar fires datesSet multiple times in rapid succession when
        // switching views (month→week→day). Without debounce each fire calls
        // removeAllEvents() then re-fetches — the last fire wins and wipes
        // events from a prior fire. clearTimeout+setTimeout ensures only ONE
        // fetch runs after the burst settles (150ms covers all FC internal fires).
        datesSet: function(info) {
            clearTimeout(_datesSetTimer);
            _datesSetTimer = setTimeout(async () => {
                await loadPosts(info.startStr, info.endStr);
                await loadAndRenderRecordCentreCards(info.startStr, info.endStr);
            }, 150);
        },

        viewDidMount: function(info) {
            if (info.view.type === 'timeGridDay') {
                calendar.today();
            }
        },
        select: function(info) {
            openCreatePostModal(info.startStr);
        },
        eventClick: function(info) {
            openEditPostModal(info.event.id);
        },
        eventDrop: async function(info) {
            const postId   = info.event.id;
            const startStr = info.event.startStr;
            const newDate  = startStr.split('T')[0];
            const newTime  = startStr.includes('T') ? startStr.split('T')[1].substring(0, 5) : null;
            await updatePostDateTime(postId, newDate, newTime);
        },
        eventContent: function(arg) {
            // ── Record Centre cards — separate render path. Manual-post
            // logic below this block is completely unchanged. ──────────────
            if (arg.event.extendedProps.isRecordCentreGroup) {
                return { html: renderRecordCentreGroup(arg.event.extendedProps.records) };
            }

            const post     = arg.event.extendedProps;
            const platform = PLATFORMS[post.platform] || { abbr: 'XX', color: '#9b59b6' };
            const view     = calendar.view.type;

            // ── Per-view sizing ────────────────────────────────────────────────
            const isMonth = view === 'dayGridMonth';
            const isWeek  = view === 'timeGridWeek';

            let fontSize, timeFontSize, badgeFontSize, padding, showTime;

            if (isMonth) {
                fontSize      = '9px';
                timeFontSize  = '8px';
                badgeFontSize = '7px';
                padding       = '3px 4px';
                showTime      = !!post.time;
            } else if (isWeek) {
                fontSize      = '9px';
                timeFontSize  = '8px';
                badgeFontSize = '7px';
                padding       = '3px 4px';
                showTime      = !!post.time;
            } else {
                // Day view
                fontSize      = '10px';
                timeFontSize  = '9px';
                badgeFontSize = '8px';
                padding       = '4px 6px';
                showTime      = !!post.time;
            }

            // ── Dark purple transparent glassmorphism card ─────────────────────
            const bg          = 'rgba(45, 27, 78, 0.72)';
            const leftBorder  = platform.color;

            let html = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: ${padding};
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    background: ${bg};
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    border-radius: 6px;
                    border-left: 3px solid ${leftBorder};
                    border: 1px solid rgba(155, 89, 182, 0.25);
                    border-left: 3px solid ${leftBorder};
                    overflow: hidden;
                ">
                    <div style="
                        font-size: ${fontSize};
                        font-weight: 600;
                        line-height: 1.2;
                        color: #e8d5ff;
                        white-space: normal;
                        word-break: break-word;
                    ">${post.title || 'Untitled'}</div>`;

            if (showTime) {
                html += `
                    <div style="
                        font-size: ${timeFontSize};
                        color: rgba(232, 213, 255, 0.8);
                        line-height: 1.2;
                    ">🕐 ${post.time}</div>`;
            }

            html += `
                    <div style="display: inline-block; width: fit-content; margin-top: 1px;">
                        <span style="
                            background: ${platform.color};
                            color: #fff;
                            padding: 1px 5px;
                            border-radius: 3px;
                            font-size: ${badgeFontSize};
                            font-weight: 700;
                            letter-spacing: 0.5px;
                            white-space: nowrap;
                            display: inline-block;
                        ">${platform.abbr}</span>
                    </div>
                </div>`;

            return { html };
        },

        // ── 2B: Our container placement — runs AFTER FC's own layout pass ────────
        // Week: 1-min offset (loadPosts) keeps events in correct day column.
        //       rAF then sizes each to half-column so they sit side by side.
        // Day:  Full row divided equally. Uses .fc-timegrid-col-events width
        //       which is always painted before eventDidMount fires — gives a
        //       reliable non-zero offsetWidth unlike harness.parentElement.
        eventDidMount: function(info) {
            // ── Record Centre cards — wire up eye-icon clicks, then stop.
            // The timeGrid side-by-side positioning hack below is for the
            // manual-post path only and never runs for these. ───────────────
            if (info.event.extendedProps.isRecordCentreGroup) {
                info.el.querySelectorAll('.rc-eye-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const card = btn.closest('.rc-card');
                        if (card?.dataset.recordId) openRecordCentreCardView(card.dataset.recordId);
                    });
                });
                return;
            }

            const view = info.view.type;
            if (view !== 'timeGridWeek' && view !== 'timeGridDay') return;

            const harness = info.el.closest('.fc-timegrid-event-harness');
            if (!harness) return;

            const { colIndex, colTotal } = info.event.extendedProps;
            const total = colTotal || 1;
            const idx   = colIndex ?? 0;

            requestAnimationFrame(() => {
                // Walk up to the reliably-painted column events container
                const colEvents = harness.closest('.fc-timegrid-col-events');
                if (!colEvents) return;

                const parentPx = colEvents.offsetWidth;
                if (!parentPx) return;

                const gapPx   = 4;
                const widthPx = (parentPx - gapPx * (total - 1)) / total;
                const leftPx  = idx * (widthPx + gapPx);

                harness.style.setProperty('width', `${widthPx.toFixed(1)}px`, 'important');
                harness.style.setProperty('left',  `${leftPx.toFixed(1)}px`,  'important');
                harness.style.setProperty('right', 'auto',                     'important');
                harness.style.setProperty('inset-inline-start', `${leftPx.toFixed(1)}px`, 'important');
                harness.style.setProperty('inset-inline-end',   'auto',                   'important');
                harness.style.setProperty('margin-top', '0px',                 'important');
            });
        }
    });
    calendar.render();
}

// ── FIX #4: now accepts startStr / endStr from datesSet callback ──────────────
// For localStorage fallback the date params are ignored (no range filtering needed
// since localStorage volumes are small). Supabase uses the exact visible range.
async function loadPosts(startStr, endStr) {
    console.log('Loading posts...', startStr, '→', endStr);
    let posts = [];
    
    if (supabaseAPI.initialized) {
        console.log('Supabase initialized, fetching from database');

        // FullCalendar's datesSet gives ISO strings with time component —
        // we only need the date portion for the Supabase query.
        const startDate = startStr ? startStr.split('T')[0] : null;
        const endDate   = endStr   ? endStr.split('T')[0]   : null;

        if (!startDate || !endDate) {
            console.warn('⚠️ No date range provided to loadPosts');
            return;
        }

        posts = await supabaseAPI.getPosts(startDate, endDate);
        console.log('Fetched', posts.length, 'posts from Supabase:', posts);
    } else {
        console.log('Supabase not initialized, using localStorage');
        posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        console.log('Loaded', posts.length, 'posts from localStorage:', posts);
    }
    
    calendar.removeAllEvents();
    console.log('Cleared all existing events');
    
    if (posts.length === 0) {
        console.warn('⚠️ No posts to display for this range');
        return;
    }

    // ── 1-minute display offset for same-timestamp events ─────────────────────
    // FC cannot place two events at identical timestamps in the same day column
    // without pushing one to the next day (slotEventOverlap behaviour).
    // Solution: offset each duplicate by exactly 1 minute per position.
    // This is DISPLAY ONLY — extendedProps.time always holds the original stored
    // time so the card label (🕐 20:00:00) is always accurate.
    // Result in week: containers sit side by side within the correct day column.
    const slotGroups = {};

    posts.forEach(post => {
        let dateOnly = post.scheduled_date;
        if (dateOnly && dateOnly.includes('T')) dateOnly = dateOnly.split('T')[0];
        const timeKey = post.scheduled_time ? post.scheduled_time.substring(0, 5) : 'allday';
        const slotKey = `${dateOnly}_${timeKey}`;
        if (!slotGroups[slotKey]) slotGroups[slotKey] = [];
        slotGroups[slotKey].push(post.id);
    });

    posts.forEach(post => {
        const platform = PLATFORMS[post.platform] || { color: '#9b59b6' };

        let dateOnly = post.scheduled_date;
        if (dateOnly && dateOnly.includes('T')) dateOnly = dateOnly.split('T')[0];

        const timeKey  = post.scheduled_time ? post.scheduled_time.substring(0, 5) : 'allday';
        const slotKey  = `${dateOnly}_${timeKey}`;
        const group    = slotGroups[slotKey];
        const colIndex = group.indexOf(post.id);
        const colTotal = group.length;

        let startDateTime = dateOnly;
        if (post.scheduled_time) {
            if (colIndex === 0) {
                // First event — exact stored time, no offset
                startDateTime = `${dateOnly}T${post.scheduled_time}`;
            } else {
                // Subsequent events — offset by 1 min × position (display only)
                const [hh, mm] = post.scheduled_time.substring(0, 5).split(':').map(Number);
                const totalMins = hh * 60 + mm + colIndex;
                const offsetHH  = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
                const offsetMM  = String(totalMins % 60).padStart(2, '0');
                startDateTime   = `${dateOnly}T${offsetHH}:${offsetMM}:00`;
            }
        }

        calendar.addEvent({
            id:              post.id,
            title:           post.title || (post.content?.substring(0, 30) + '...'),
            start:           startDateTime,
            backgroundColor: platform.color,
            borderColor:     platform.color,
            extendedProps: {
                platform: post.platform,
                title:    post.title,
                content:  post.content,
                time:     post.scheduled_time, // always original stored time
                colIndex,
                colTotal
            }
        });
    });
    
    console.log('✅ Finished loading', posts.length, 'posts to calendar');
}

// ════════════════════════════════════════════════════════════════════════
// ── Record Centre integration — live cards, separate from manual posts ──
// ════════════════════════════════════════════════════════════════════════
// Read-only here: created and edited only in Record Centre, just displayed
// on this calendar. Never written back from the Planner.

async function loadAndRenderRecordCentreCards(startStr, endStr) {
    const records = await fetchRecordCentreRecords(startStr, endStr);
    addRecordCentreCardsToCalendar(records);
}

async function fetchRecordCentreRecords(startStr, endStr) {
    // getRecordCentreToken() comes from auth.js — not built yet. Until it
    // exists this returns [] every time, which is expected, not a bug.
    const token = typeof getRecordCentreToken === 'function' ? getRecordCentreToken() : null;
    if (!token) return [];

    try {
        const res = await fetch(`${RECORD_CENTRE_API}/api/records`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            console.warn('⚠️ Record Centre fetch failed:', res.status);
            return [];
        }
        const records  = await res.json();
        const startDate = startStr.split('T')[0];
        const endDate   = endStr.split('T')[0];
        return records.filter(r => {
            const day = parseRecordCalendarDate(r.date);
            return day && day >= startDate && day <= endDate;
        });
    } catch (err) {
        console.warn('⚠️ Record Centre fetch error:', err);
        return [];
    }
}

function addRecordCentreCardsToCalendar(records) {
    // Group by day — one FullCalendar event per day, holding every Record
    // Centre card for that day. The 2-up wrap grid lives entirely inside
    // that single event's own HTML, so FullCalendar never has to stack
    // multiple harnesses on the same day — that stacking is exactly what
    // broke before. This sidesteps it rather than re-solving it.
    const byDay = {};
    records.forEach(r => {
        const day = parseRecordCalendarDate(r.date);
        if (!day) return;
        (byDay[day] = byDay[day] || []).push(r);
    });

    Object.entries(byDay).forEach(([day, dayRecords]) => {
        dayRecords.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        calendar.addEvent({
            id: `rc-group-${day}`,
            start: day,
            allDay: true,
            extendedProps: { isRecordCentreGroup: true, records: dayRecords }
        });
    });
}

function renderRecordCentreGroup(records) {
    return `<div style="display:flex; flex-wrap:wrap; gap:3px; width:100%;">
        ${records.map(renderRecordCentreCard).join('')}
    </div>`;
}

function renderRecordCentreCard(r) {
    const meta    = FORMAT_META[r.format] || { colour: '#9b59b6', font: '#ffffff' };
    const dayDate = formatDayDate(r.date);

    const platformBadges = (r.platforms || []).map(p => {
        const info = PLATFORMS[p.toLowerCase()] || { abbr: '??', color: '#9b59b6' };
        return `<span style="
            background: ${info.color};
            color: #fff;
            font-weight: 700;
            font-size: 7px;
            padding: 1px 4px;
            border-radius: 3px;
            margin-right: 2px;
            white-space: nowrap;
        ">${info.abbr}</span>`;
    }).join('');

    return `
        <div class="rc-card" data-record-id="${r.id}" style="
            flex: 0 0 calc(50% - 2px);
            box-sizing: border-box;
            background: rgba(45, 27, 78, 0.72);
            border: 1px solid rgba(155, 89, 182, 0.25);
            border-radius: 5px;
            overflow: hidden;
        ">
            <div style="
                background: ${meta.colour};
                color: ${meta.font};
                font-weight: 700;
                font-size: 8px;
                padding: 2px 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            ">${r.category || 'Untitled'}</div>
            <div style="padding: 2px 4px; color: rgba(232,213,255,0.85); line-height: 1.3;">
                <div style="font-size: 7px;">${dayDate}</div>
                ${r.time ? `<div style="font-size: 7px;">${r.time}</div>` : ''}
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:1px; flex-wrap:wrap; gap:2px;">
                    <div style="display:flex; flex-wrap:wrap;">${platformBadges}</div>
                    <span class="rc-eye-btn" style="cursor:pointer; font-size:9px;" title="View content">👁️</span>
                </div>
            </div>
        </div>`;
}

// Full calendar-day parser. numbering.js's parseDateParts() only returns
// {year, month} — enough for a card header, not enough to place an event
// on the right day. Confirmed common format (2026-06-28): day-name + DD.MM,
// e.g. "Wed 03.06" — no year typed at all, so the current year is assumed.
// Still checks for a full ISO date first, in case that's what's stored.
// Falls back to today only if neither pattern is found anywhere.
function parseRecordCalendarDate(dateStr) {
    if (typeof dateStr === 'string') {
        const iso = dateStr.match(/\d{4}-\d{2}-\d{2}/);
        if (iso) return iso[0];

        const ddmm = dateStr.match(/(\d{1,2})\.(\d{1,2})/);
        if (ddmm) {
            const day   = ddmm[1].padStart(2, '0');
            const month = ddmm[2].padStart(2, '0');
            const year  = new Date().getFullYear();
            return `${year}-${month}-${day}`;
        }
    }
    return new Date().toISOString().split('T')[0];
}

function formatDayDate(isoDateStr) {
    const d = new Date(isoDateStr + 'T00:00:00');
    if (isNaN(d)) return isoDateStr || '';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

async function openRecordCentreCardView(recordId) {
    const token = typeof getRecordCentreToken === 'function' ? getRecordCentreToken() : null;
    if (!token) {
        alert('Not connected to Record Centre yet — auth.js needs to be in place first.');
        return;
    }
    try {
        const res = await fetch(`${RECORD_CENTRE_API}/api/records/${encodeURIComponent(recordId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Record not found or not authorised');
        const record = await res.json();
        showRecordCentrePopup(record);
    } catch (err) {
        alert('Could not load this record: ' + err.message);
    }
}

// Mirrors card-1.js's actual field order (Category, Title, Persona,
// Date/Time, Format, Platform, Playlist, Index) — file confirmed
// 2026-06-28. Read-only here, unlike Record Centre's editable version,
// since the Planner only views records, never edits them. Styled with
// the established dark-purple palette rather than Record Centre's own
// .record-card__* CSS classes, since that stylesheet hasn't been shared —
// the field content and order is now the real thing, the paint job isn't.
function showRecordCentrePopup(record) {
    document.getElementById('rc-popup-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'rc-popup-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    const viewingPlatform = (record.platforms || [])[0] || ALL_PLATFORMS[0];
    const headerId         = formatCardHeaderForPlatform(record, viewingPlatform);
    const { year }         = parseRecordYearMonth(record.date);
    const meta             = FORMAT_META[record.format] || { colour: '#9b59b6', font: '#ffffff' };

    // Platform-letter row — all four always shown, active ones highlighted.
    // Mirrors card-1.js's renderPlatformRow() convention (active = orange,
    // inactive = grey), not each platform's own brand colour — that
    // distinction belongs to the mini calendar chip, not this card.
    const platformLettersHtml = ALL_PLATFORMS.map(p => {
        const isActive = (record.platforms || []).includes(p);
        return `<span style="
            display: inline-block;
            padding: 3px 8px;
            margin-right: 4px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            background: ${isActive ? '#f39c12' : 'rgba(255,255,255,0.12)'};
            color: ${isActive ? '#1a1a1a' : 'rgba(255,255,255,0.4)'};
        ">${PLATFORM_ABBR[p]}</span>`;
    }).join('');

    const field = (label, value) => `
        <div style="margin-bottom: 10px;">
            <div style="font-size: 10px; color: rgba(232,213,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">${label}</div>
            <div style="font-size: 13px; color: #fff; overflow-wrap: break-word;">${value || '—'}</div>
        </div>`;

    overlay.innerHTML = `
        <div style="
            background: rgba(45, 27, 78, 0.95);
            border-radius: 16px;
            padding: 24px;
            width: 90%; max-width: 420px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            color: #fff;
            font-family: Montserrat, sans-serif;
        ">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.5px; color: rgba(232,213,255,0.9);">${headerId}</div>
                <div style="font-size: 11px; color: rgba(232,213,255,0.4);">${year}</div>
            </div>
            <div style="background:${meta.colour}; color:${meta.font}; font-weight:700; font-size:12px; padding:6px 10px; border-radius:6px; display:inline-block; margin-bottom:16px;">
                ${record.category || 'Untitled'}
            </div>
            ${field('Title', record.title)}
            ${field('Persona', record.persona)}
            ${field('Date / Time', `${record.date || '—'}${record.time ? ' · ' + record.time : ''}`)}
            ${field('Format', record.format)}
            <div style="margin-bottom: 10px;">
                <div style="font-size: 10px; color: rgba(232,213,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Platform</div>
                <div>${platformLettersHtml}</div>
            </div>
            ${field('Playlist', record.playlist)}
            ${field('Index', record.index)}
            ${field('Notes', record.content?.notes)}
            <button id="rc-popup-close" style="
                background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
                border: none; border-radius: 8px; color: #fff;
                padding: 10px 16px; font-size: 14px; font-weight: 600;
                cursor: pointer; width: 100%; margin-top: 4px;
            ">Close</button>
        </div>`;

    document.body.appendChild(overlay);
    document.getElementById('rc-popup-close').addEventListener('click', () => overlay.remove());
}

// Console-testable today, no Record Centre session needed:
// open devtools (F12) → console → type testRecordCentreCards() → enter.
// Uses the real confirmed date format ("Wed DD.MM", no year) rather than
// ISO, so this also proves the date parser handles real records, not just
// the easy case. Falls within the current month already — no need to
// navigate. Delete this whole function once live data is flowing.
window.testRecordCentreCards = function() {
    addRecordCentreCardsToCalendar([
        { id: 'test-1', category: 'Philosophy',  format: 'SV', date: 'Wed 24.06', time: '17:00', platforms: ['Telegram']  },
        { id: 'test-2', category: 'Mindset',     format: 'LV', date: 'Wed 24.06', time: '17:00', platforms: ['TikTok']    },
        { id: 'test-3', category: 'WeeklyRecap', format: 'PC', date: 'Wed 24.06', time: '19:00', platforms: ['Pinterest'] },
        { id: 'test-4', category: 'QandA',       format: 'SV', date: 'Thu 25.06', time: '12:00', platforms: ['YouTube']   }
    ]);
    console.log('✅ Test Record Centre cards added.');
};

function openCreatePostModal(date = null) {
    currentPost = null;
    document.getElementById('modalTitle').textContent = 'Create New Post';
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
    
    if (date) {
        // date may arrive as "2025-03-15T..." from a time-grid select — strip time
        document.getElementById('scheduledDate').value = date.split('T')[0];
    }
    
    // FIX #2 — imagePreview does not exist in the HTML modal; reference removed.
    document.getElementById('postModal').classList.add('active');
}

async function openEditPostModal(postId) {
    let post = null;
    
    if (supabaseAPI.initialized) {
        post = await supabaseAPI.getPost(postId);
    } else {
        const posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        post = posts.find(p => p.id === postId);
    }
    
    if (!post) {
        alert('Failed to load post');
        return;
    }
    
    currentPost = post;
    document.getElementById('modalTitle').textContent = 'Edit Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('deleteBtn').style.display = 'block';
    
    document.getElementById('platform').value      = post.platform       || '';
    document.getElementById('title').value         = post.title          || '';
    document.getElementById('content').value       = post.content        || '';
    const rawDate = post.scheduled_date || '';
    document.getElementById('scheduledDate').value = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    document.getElementById('scheduledTime').value = post.scheduled_time || '';
    
    document.getElementById('postModal').classList.add('active');
}

function closePostModal() {
    document.getElementById('postModal').classList.remove('active');
    document.getElementById('postModal').style.display = '';
}

// FIX #2 — renamed from handleImageUrlInput to match the form's onsubmit="handlePostSubmit(event)"
async function handlePostSubmit(event) {
    event.preventDefault();

    const postId        = document.getElementById('postId').value;
    const platform      = document.getElementById('platform').value;
    const title         = document.getElementById('title').value;
    const content       = document.getElementById('content').value;
    const scheduledDate = document.getElementById('scheduledDate').value;
    const scheduledTime = document.getElementById('scheduledTime').value;
    
    const postData = {
        platform,
        title,
        content,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: 'scheduled'
    };
    
    let result;
    
    if (supabaseAPI.initialized) {
        if (postId) {
            result = await supabaseAPI.updatePost(postId, postData);
        } else {
            result = await supabaseAPI.createPost(postData);
        }
        
        if (result.success) {
            closePostModal();
            // Re-fetch the current visible range so the calendar stays in sync
            const view  = calendar.view;
            await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
            alert(postId ? 'Post updated!' : 'Post created!');
        } else {
            alert('Failed to save post: ' + result.error);
        }
    } else {
        postData.id         = postId || 'post_' + Date.now();
        postData.created_at = currentPost?.created_at || new Date().toISOString();
        
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        
        if (postId) {
            posts = posts.map(p => p.id === postId ? postData : p);
        } else {
            posts.push(postData);
        }
        
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
        
        closePostModal();
        const view = calendar.view;
        await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
        alert(postId ? 'Post updated!' : 'Post created!');
    }
}

async function handleDeletePost() {
    if (!currentPost) return;
    if (!confirm('Delete this post?')) return;
    
    let result;
    
    if (supabaseAPI.initialized) {
        result = await supabaseAPI.deletePost(currentPost.id);
        
        if (result.success) {
            closePostModal();
            const view = calendar.view;
            await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
            alert('Post deleted!');
        } else {
            alert('Failed to delete post');
        }
    } else {
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.filter(p => p.id !== currentPost.id);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
        
        closePostModal();
        const view = calendar.view;
        await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
        alert('Post deleted!');
    }
}

async function updatePostDateTime(postId, newDate, newTime) {
    const update = { scheduled_date: newDate };
    if (newTime) update.scheduled_time = newTime;

    if (supabaseAPI.initialized) {
        await supabaseAPI.updatePost(postId, update);
    } else {
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.map(p => p.id === postId ? { ...p, ...update } : p);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
    }

    const view = calendar.view;
    await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
}

window.addEventListener('load', initApp);
