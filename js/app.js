/**
 * 3C Content Schedule Planner - Main Application
 */

let calendar;

// ── datesSet debounce timer ────────────────────────────────────────────────────
// datesSet fires multiple times rapidly when switching views (FullCalendar
// internal re-renders). Without debouncing, each fire calls removeAllEvents()
// and re-fetches, causing a race condition where the last fire "wins" and
// wipes events loaded by a prior fire. 150ms settles all view-switch bursts.
let _datesSetTimer = null;

// Tracks whether we've already snapped to today on entering day view —
// without this, calendar.today() was firing on every remount, which
// likely includes navigating via prev/next WHILE staying in day view,
// snapping straight back to today before any other date could ever
// actually be seen. Only the first entry into day view should jump;
// navigating within it afterwards must be left alone.
let _enteredDayView = false;

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

// Per-format colour AND correct text contrast — SV's violet needs white
// text, LV's pastel orange and PC's turquoise need dark text to stay
// readable. Mirrors numbering.js's FORMAT_META, used here only for the
// mini calendar chip — app.js is a plain script and can't import the
// real numbering.js directly. The popup itself now uses the real file.
const FORMAT_META = {
    SV: { colour: '#5e17eb', font: '#ffffff' },
    LV: { colour: '#ffbc66', font: '#1a1a1a' },
    PC: { colour: '#03e493', font: '#1a1a1a' }
};

// Real records likely store the full word ("short video"), not the code —
// numbering.js's own formatCardHeaderForPlatform() converts before lookup
// for exactly this reason. Without this, every record fell through to the
// fallback colour below, which is why they all looked identical.
const FORMAT_ABBR_LOOKUP = { 'short video': 'SV', 'long video': 'LV', 'post card': 'PC' };
function resolveFormatCode(format) {
    return FORMAT_ABBR_LOOKUP[format] || format;
}

const RECORD_CENTRE_API = 'https://recordmanagement.threadcommand.center';

async function initApp() {
    console.log('🚀 Initializing 3C Content Schedule Planner...');
    
    const supabaseInit = await supabaseAPI.init();
    if (!supabaseInit) {
        console.warn('⚠️ Supabase not configured, using localStorage fallback');
    }

    // ── Session guard — now via Record Centre's GitHub OAuth, not Supabase
    // Auth. requireRecordCentreSession() redirects to login.html itself if
    // there's no valid token — same pattern Record Centre's own auth.js uses.
    const rcUser = await requireRecordCentreSession();
    if (!rcUser) return;
    
    injectCalendarStyles();
    initCalendar();
    // Record Centre cards load via the calendar's datesSet callback, which
    // fires immediately on render — no manual initial-load call needed here.
    // supabaseAPI.init() above stays as-is: it's not tied to the removed
    // manual-post system specifically, so it's left untouched rather than
    // guessed at without seeing supabaseAPI.js itself.
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

        /* Record Centre month-view square sizing override now lives in
         * record-card.css (.fc-daygrid-event.rc-group-event) — kept in one
         * place only, not duplicated here, to avoid two files quietly
         * fighting over the same selector with different values. */

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
        // editable/selectable disabled — both only ever served the old
        // manual-post modal (drag-to-reschedule via eventDrop, click-to-
        // create via select). Record-centre cards are read-only by
        // design (see SETUP.md — "never written back from the Planner"),
        // so neither applies to what's on this calendar now.
        editable:    false,
        selectable:  false,
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
                await loadAndRenderRecordCentreCards(info.startStr, info.endStr);
            }, 150);
        },

        viewDidMount: function(info) {
            if (info.view.type === 'timeGridDay') {
                if (!_enteredDayView) {
                    _enteredDayView = true;
                    calendar.today();
                }
            } else {
                _enteredDayView = false;
            }
        },
        eventClick: function(info) {
            // Record Centre chips are the only events on this calendar now —
            // the manual-post editor branch that used to sit here has been
            // removed along with its modal (see SETUP.md, "old schedule").
            if (info.event.extendedProps.isRecordCentreGroup) {
                const card = info.jsEvent.target.closest('.rc-card');
                if (card?.dataset.recordId) openRecordCentreCardView(card.dataset.recordId);
            }
        },
        eventContent: function(arg) {
            // ── Record Centre cards — the only event type on this calendar
            // now. The old manual-post rendering branch that used to sit
            // below this (title/time/platform badge glassmorphism card)
            // has been removed along with its modal — see SETUP.md,
            // "old schedule". Unified: every Record Centre slot (one per
            // day in month, one per day+time in week/day) is always a
            // GROUP, even if it only holds one record — this is what
            // removes the need to position multiple competing events at
            // the same time slot at all.
            if (arg.event.extendedProps.isRecordCentreGroup) {
                const { records, viewMode } = arg.event.extendedProps;
                return { html: viewMode === 'month'
                    ? renderMonthGroup(records)
                    : renderTimedGroup(records, viewMode) };
            }

            // Should be unreachable — every event added to this calendar
            // is a Record Centre group (see addRecordCentreCardsToCalendar).
            // Safe empty fallback rather than a hard crash if that ever
            // changes without this function being updated too.
            return { html: '' };
        },

        // ── 2B: Our container placement — runs AFTER FC's own layout pass ────────
        // Week: 1-min offset (loadPosts) keeps events in correct day column.
        //       rAF then sizes each to half-column so they sit side by side.
        // Day:  Full row divided equally. Uses .fc-timegrid-col-events width
        //       which is always painted before eventDidMount fires — gives a
        //       reliable non-zero offsetWidth unlike harness.parentElement.
        eventDidMount: function(info) {
            // Every event on this calendar is a Record Centre group now —
            // one per slot, always filling its full column width via
            // record-card.css (.fc-timegrid-event.rc-group-event). No
            // positioning math needed: that's what removes the old
            // same-time stacking problem at the source. The manual-post
            // harness-width/left calculation that used to live below this
            // has been removed along with the manual-post system itself.
            if (info.event.extendedProps.isRecordCentreGroup) {
                info.el.querySelectorAll('.rc-eye-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const card = btn.closest('.rc-card');
                        if (card?.dataset.recordId) openRecordCentreCardView(card.dataset.recordId);
                    });
                });
            }
        }
    });
    calendar.render();
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
    const token = typeof getRecordCentreToken === 'function' ? getRecordCentreToken() : null;
    if (!token) {
        console.warn('⚠️ No Record Centre token — skipping live fetch');
        return [];
    }

    try {
        const res = await fetch(`${RECORD_CENTRE_API}/api/records`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            console.warn('⚠️ Record Centre fetch failed:', res.status);
            return [];
        }
        const records  = await res.json();
        console.log('✅ Record Centre returned', records.length, 'total record(s)');

        const startDate = startStr.split('T')[0];
        const endDate   = endStr.split('T')[0];
        const inRange = records.filter(r => {
            const day = parseRecordCalendarDate(r.date);
            return day && day >= startDate && day <= endDate;
        });
        console.log('✅', inRange.length, 'fall within', startDate, '→', endDate);
        return inRange;
    } catch (err) {
        console.warn('⚠️ Record Centre fetch error:', err);
        return [];
    }
}

function addRecordCentreCardsToCalendar(records) {
    const view = calendar.view.type;

    // Defensive cleanup — without this, every datesSet refresh ADDS new
    // Record Centre events on top of whatever's already there, rather
    // than replacing them.
    calendar.getEvents()
        .filter(e => e.extendedProps.isRecordCentreGroup)
        .forEach(e => e.remove());

    // "First come first" — order is decided by actual Record Centre
    // registration order (the `created` timestamp), never by whatever
    // order the fetch happened to return them in, and never left to
    // FullCalendar's own same-time collision handling.
    const sorted = [...records].sort((a, b) => (a.created || '').localeCompare(b.created || ''));

    if (view !== 'timeGridWeek' && view !== 'timeGridDay') {
        // Month — one event per day. Simple 2-row card now (Category tab /
        // Time+Platform) — the day is already obvious from the grid
        // position, so it doesn't need repeating inside the card too.
        const byDay = {};
        sorted.forEach(r => {
            const day = parseRecordCalendarDate(r.date);
            if (!day) return;
            (byDay[day] = byDay[day] || []).push(r);
        });

        console.log('✅ Adding', Object.keys(byDay).length, 'day-group(s) to month view:', Object.keys(byDay));

        Object.entries(byDay).forEach(([day, dayRecords]) => {
            calendar.addEvent({
                id: `rc-group-${day}`,
                start: day,
                allDay: true,
                classNames: ['rc-group-event'],
                extendedProps: { isRecordCentreGroup: true, records: dayRecords, viewMode: 'month' }
            });
        });
        return;
    }

    // Week/Day — one event per day+time slot, holding EVERY record that
    // shares that exact slot together. This is what actually fixes the
    // old same-time stacking problem: there's only ever one FullCalendar
    // event per slot now, so there's nothing left for FullCalendar to
    // collide-resolve or stack. Multiple records at the same slot flex-wrap
    // inside that one event's own HTML instead — sorted "first come first"
    // from the sort above, not by position-juggling after the fact.
    const slotGroups = {};
    sorted.forEach(r => {
        const day = parseRecordCalendarDate(r.date);
        if (!day) return;
        const slotKey = `${day}_${r.time || 'allday'}`;
        (slotGroups[slotKey] = slotGroups[slotKey] || []).push(r);
    });

    Object.entries(slotGroups).forEach(([slotKey, slotRecords]) => {
        const sepIdx = slotKey.lastIndexOf('_');
        const day     = slotKey.slice(0, sepIdx);
        const timeKey = slotKey.slice(sepIdx + 1);

        let start = day;
        let end   = undefined;
        if (timeKey !== 'allday') {
            start = `${day}T${timeKey}:00`;
            const [hh, mm]  = timeKey.split(':').map(Number);
            const endTotal  = hh * 60 + mm + 90; // 90 min — enough box height for the full card
            const eh = String(Math.floor(endTotal / 60) % 24).padStart(2, '0');
            const em = String(endTotal % 60).padStart(2, '0');
            end = `${day}T${eh}:${em}:00`;
        }

        calendar.addEvent({
            id: `rc-group-${slotKey}`,
            start, end,
            allDay: timeKey === 'allday',
            classNames: ['rc-group-event'],
            extendedProps: { isRecordCentreGroup: true, records: slotRecords, viewMode: view }
        });
    });
    console.log('✅ Placed', Object.keys(slotGroups).length, 'Record Centre slot-group(s) in', view);
}

// ── MONTH — simple 2-row card ────────────────────────────────────────
// Row 1: category, in the format colour. Row 2: time + platform. The
// day/date isn't repeated here — the calendar grid already shows it.
function renderMonthCard(r) {
    const meta = FORMAT_META[resolveFormatCode(r.format)] || { colour: '#9b59b6', font: '#ffffff' };
    const platformBadges = (r.platforms || []).map(p => {
        const info = PLATFORMS[p.toLowerCase()] || { abbr: '??', color: '#9b59b6' };
        return `<span style="background:${info.color}; color:#fff; font-weight:700; font-size:8px; padding:1px 3px; border-radius:2px; margin-right:2px; white-space:nowrap;">${info.abbr}</span>`;
    }).join('');

    return `
        <div class="rc-card" data-record-id="${r.id}" style="
            flex: 1 1 calc(50% - 2px);
            box-sizing: border-box;
            background: rgba(45, 27, 78, 0.85);
            border: 1px solid rgba(155, 89, 182, 0.3);
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        ">
            <div style="background:${meta.colour}; color:${meta.font}; font-weight:700; font-size:8px; padding:2px 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.category || 'Untitled'}</div>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:2px 4px; gap:3px;">
                <span style="font-size:7px; color:rgba(232,213,255,0.9); white-space:nowrap;">${r.time || ''}</span>
                <span style="display:flex; align-items:center; gap:2px;">${platformBadges}</span>
            </div>
        </div>`;
}

function renderMonthGroup(records) {
    return `<div style="display:flex; flex-wrap:wrap; gap:4px; width:100%; align-items:flex-start; align-content:flex-start;">
        ${records.map(renderMonthCard).join('')}
    </div>`;
}

// ── WEEK/DAY — 54px square card. Category tab (coloured, small) / date
// only as DD.MM (weekday dropped — the calendar grid already shows it)
// / time / platform + eye. Fixed-size flex item: width comes from a CSS
// class (.rc-card--week / .rc-card--day, both 54px) — same card,
// different CSS, no separate render path needed per view. ────────────
function renderTimedSquareCard(r, sizeClass) {
    const meta = FORMAT_META[resolveFormatCode(r.format)] || { colour: '#9b59b6', font: '#ffffff' };
    const platformBadges = (r.platforms || []).map(p => {
        const info = PLATFORMS[p.toLowerCase()] || { abbr: '??', color: '#9b59b6' };
        return `<span style="background:${info.color}; color:#fff; font-weight:700; font-size:8px; padding:1px 3px; border-radius:2px; margin-right:2px; white-space:nowrap;">${info.abbr}</span>`;
    }).join('');

    const eyeIcon = `<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const dateLabel = formatDateOnly(parseRecordCalendarDate(r.date));

    return `
        <div class="rc-card ${sizeClass}" data-record-id="${r.id}" style="
            aspect-ratio: 1 / 1;
            align-self: flex-start;
            box-sizing: border-box;
            background: rgba(45, 27, 78, 0.85);
            border: 1px solid rgba(155, 89, 182, 0.3);
            border-radius: 5px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        ">
            <div style="background:${meta.colour}; color:${meta.font}; font-weight:700; font-size:7.5px; padding:1.5px 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:0; line-height:1.3;">${r.category || 'Untitled'}</div>
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:space-evenly; padding:1px; min-height:0;">
                <div style="font-size:9px; font-weight:700; color:rgba(232,213,255,0.95); line-height:1.15;">${dateLabel}</div>
                <div style="font-size:9px; font-weight:700; color:rgba(232,213,255,0.95); line-height:1.15;">${r.time || ''}</div>
                <div style="display:flex; align-items:center; gap:2px;">
                    ${platformBadges}
                    <span class="rc-eye-btn" style="cursor:pointer; display:inline-flex; color:#fff;" title="View content">${eyeIcon}</span>
                </div>
            </div>
        </div>`;
}

function renderTimedGroup(records, view) {
    // Week: forced exactly two per row, as specified. Day: a fixed width
    // that wraps naturally once a row runs out of space, rather than a
    // forced count — day has more room, so more can fit before wrapping.
    const sizeClass = view === 'timeGridWeek' ? 'rc-card--week' : 'rc-card--day';
    return `<div style="display:flex; flex-wrap:wrap; gap:4px; width:100%; align-items:flex-start;">
        ${records.map(r => renderTimedSquareCard(r, sizeClass)).join('')}
    </div>`;
}

// Date only, no weekday — the calendar grid already shows which day this
// slot is in, so repeating it on the card was redundant. DD.MM to match
// Chef's spec exactly (e.g. "17.06").
function formatDateOnly(isoDateStr) {
    const d = new Date(isoDateStr + 'T00:00:00');
    if (isNaN(d)) return isoDateStr || '';
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
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

window.addEventListener('load', initApp);
