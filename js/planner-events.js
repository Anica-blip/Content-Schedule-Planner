/**
 * planner-events.js — calendar-only items entered directly in the Planner
 * 3C Content Schedule Planner · 3C Thread To Success™
 *
 * For one-off content that is NOT a Record Centre record: category, date,
 * time and platform(s) only — exactly what a calendar block shows. Saved
 * through the same Worker and the same login as the Record Centre, as one
 * small JSON file per item in the bucket's planner-events/ folder.
 *
 * Plain global script, not an ES module — matches app.js and auth.js.
 * Everything here is prefixed pe / PE_ so it can never collide with a
 * global name in another script. Relies on getRecordCentreToken() from
 * auth.js (called at use-time, so script order doesn't matter) and
 * optionally on refreshCalendarItems() from app.js.
 *
 * Public hooks used by the rest of the page:
 *   openPlannerEventModal()      — "+" toolbar button: add a new item
 *   openPlannerEventModal(id)    — click on a calendar card: edit / delete
 *   peFetchEvents()              — app.js: all items, ready to draw
 */

const PE_API_BASE = 'https://recordmanagement.threadcommand.center';

// Same four platforms, abbreviations and colours as the Planner's own
// PLATFORMS map in app.js. Names match the Record Centre's spelling.
const PE_PLATFORMS = [
    { name: 'YouTube',   abbr: 'YT', color: '#ffffff', font: '#1a1a1a' },
    { name: 'Telegram',  abbr: 'TG', color: '#0088cc', font: '#ffffff' },
    { name: 'Pinterest', abbr: 'PI', color: '#bd081c', font: '#ffffff' },
    { name: 'TikTok',    abbr: 'TK', color: '#000000', font: '#ffffff' }
];

const PE_WEEKDAYS    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PE_MINUTE_STEP = 5;

let peCache     = {};          // id → item, as last loaded from the Worker
let peEditingId = null;        // null = adding a new item
let peSelected  = new Set();   // platform names currently ticked
let peBusy      = false;       // true while a save / delete is in flight

// ── Small helpers ───────────────────────────────────────────────────────

function pePad(n) {
    return String(n).padStart(2, '0');
}

// Text coming back from storage is escaped before app.js drops it into
// card HTML — the edit form always uses the raw value from peCache.
function peEscape(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function peTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${pePad(d.getMonth() + 1)}-${pePad(d.getDate())}`;
}

// "2026-11-11" → "Wed 11.11" — day name + DD.MM, no year.
function peDayLabel(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return '';
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return `${PE_WEEKDAYS[d.getDay()]} ${m[3]}.${m[2]}`;
}

function peEl(id) {
    return document.getElementById(id);
}

// ── Worker API ──────────────────────────────────────────────────────────

async function peRequest(path, options = {}) {
    const token = getRecordCentreToken();
    if (!token) throw new Error('Not signed in — please sign in again.');

    const headers = { Authorization: `Bearer ${token}` };
    if (options.body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${PE_API_BASE}${path}`, { ...options, headers });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            if (body?.error) message = body.error;
        } catch {
            // ignore — keep the default message
        }
        throw new Error(message);
    }
    if (res.status === 204) return null;
    return res.json();
}

// Loads every item and refreshes the cache. Returns items ready for the
// calendar (category escaped, flagged isPlannerEvent). If the fetch fails
// the calendar simply shows no extra items — the rest of the Planner is
// never affected — and the cache from the last good load is kept.
async function peFetchEvents() {
    try {
        const list = await peRequest('/api/events');
        const fresh = {};
        (Array.isArray(list) ? list : []).forEach(e => { if (e && e.id) fresh[e.id] = e; });
        peCache = fresh;
        return Object.values(peCache).map(e => ({
            ...e,
            category: peEscape(e.category),
            platforms: Array.isArray(e.platforms) ? e.platforms : [],
            isPlannerEvent: true
        }));
    } catch (err) {
        console.warn('⚠️ Planner items fetch failed:', err.message);
        return [];
    }
}

// ── Styles (injected once, scoped to #pe-modal) ─────────────────────────

function peInjectStyles() {
    if (peEl('pe-styles')) return;
    const style = document.createElement('style');
    style.id = 'pe-styles';
    style.textContent = `
        /* Sits above the sticky header (z-index 9998) */
        #pe-modal { z-index: 10000; }
        #pe-modal .pe-note { font-size: 0.8rem; opacity: 0.65; margin: -0.75rem 0 1.25rem; }
        #pe-modal .form-input,
        #pe-modal .form-select { color-scheme: dark; }
        #pe-modal .form-select { width: auto; flex: 1; }
        #pe-modal .pe-time { display: flex; align-items: center; gap: 0.5rem; }
        #pe-modal .pe-time span { font-weight: 700; }
        #pe-modal #pe-date-label {
            font-weight: 700; color: #ffffff; margin-left: 0.4rem;
        }
        #pe-modal .pe-chips { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        #pe-modal .pe-chip {
            min-width: 56px; padding: 0.5rem 0.9rem; border-radius: 6px;
            font-weight: 700; font-size: 0.95rem; cursor: pointer;
            background: transparent; color: rgba(255,255,255,0.6);
            border: 2px solid rgba(255,255,255,0.35);
            transition: all 0.15s ease;
        }
        #pe-modal .pe-chip.on {
            background: var(--pe-bg); color: var(--pe-fg);
            border-color: var(--pe-bg);
            box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
        }
        #pe-modal .pe-error {
            min-height: 1.2rem; margin-bottom: 0.75rem;
            color: #ff8a80; font-size: 0.9rem; font-weight: 600;
        }
        #pe-modal .pe-actions { display: flex; align-items: center; gap: 0.75rem; }
        #pe-modal .pe-spacer { flex: 1; }
        #pe-modal .pe-btn {
            padding: 0.7rem 1.4rem; border: none; border-radius: 8px;
            font-weight: 600; font-size: 0.95rem; cursor: pointer; color: #ffffff;
        }
        #pe-modal .pe-btn:disabled { opacity: 0.5; cursor: default; }
        #pe-modal .pe-btn-save   { background: var(--orange, #ff6b35); }
        #pe-modal .pe-btn-cancel { background: rgba(255,255,255,0.12); }
        #pe-modal .pe-btn-delete { background: #b3261e; }
    `;
    document.head.appendChild(style);
}

// ── Modal ───────────────────────────────────────────────────────────────

function peBuildModal() {
    if (peEl('pe-modal')) return;
    peInjectStyles();

    const hours = Array.from({ length: 24 }, (_, h) => `<option value="${pePad(h)}">${pePad(h)}</option>`).join('');
    const minutes = Array.from({ length: 60 / PE_MINUTE_STEP }, (_, i) => {
        const m = pePad(i * PE_MINUTE_STEP);
        return `<option value="${m}">${m}</option>`;
    }).join('');
    const chips = PE_PLATFORMS.map(p => `
        <button type="button" class="pe-chip" data-platform="${p.name}" aria-pressed="false"
                style="--pe-bg:${p.color}; --pe-fg:${p.font};">${p.abbr}</button>`).join('');

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'pe-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'pe-title');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="pe-title">Add calendar item</h2>
                <button type="button" class="close-btn" id="pe-close" aria-label="Close">✕</button>
            </div>
            <p class="pe-note">Calendar-only item — it is not a Record Centre record.</p>

            <div class="form-group">
                <label class="form-label" for="pe-category">Category</label>
                <input class="form-input" id="pe-category" type="text" maxlength="60"
                       placeholder="e.g. Anica Chat" autocomplete="off">
            </div>

            <div class="form-row">
                <div class="form-group" style="flex:1;">
                    <label class="form-label" for="pe-date">Date<span id="pe-date-label"></span></label>
                    <input class="form-input" id="pe-date" type="date">
                </div>
                <div class="form-group" style="flex:1;">
                    <label class="form-label" for="pe-hour">Time (24h)</label>
                    <div class="pe-time">
                        <select class="form-select" id="pe-hour" aria-label="Hour"><option value="">--</option>${hours}</select>
                        <span>:</span>
                        <select class="form-select" id="pe-minute" aria-label="Minute"><option value="">--</option>${minutes}</select>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Platforms</label>
                <div class="pe-chips" id="pe-chips">${chips}</div>
            </div>

            <div class="pe-error" id="pe-error" role="alert"></div>

            <div class="pe-actions">
                <button type="button" class="pe-btn pe-btn-delete" id="pe-delete">Delete</button>
                <span class="pe-spacer"></span>
                <button type="button" class="pe-btn pe-btn-cancel" id="pe-cancel">Cancel</button>
                <button type="button" class="pe-btn pe-btn-save" id="pe-save">Save</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    peEl('pe-close').addEventListener('click', peCloseModal);
    peEl('pe-cancel').addEventListener('click', peCloseModal);
    peEl('pe-save').addEventListener('click', peSave);
    peEl('pe-delete').addEventListener('click', peDelete);
    peEl('pe-date').addEventListener('input', () => {
        const label = peDayLabel(peEl('pe-date').value);
        peEl('pe-date-label').textContent = label ? `· ${label}` : '';
    });
    peEl('pe-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.pe-chip');
        if (chip) peToggleChip(chip.dataset.platform);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && peEl('pe-modal')?.classList.contains('active')) peCloseModal();
    });
}

function peToggleChip(name) {
    if (peSelected.has(name)) peSelected.delete(name); else peSelected.add(name);
    peRenderChips();
}

function peRenderChips() {
    document.querySelectorAll('#pe-chips .pe-chip').forEach(chip => {
        const on = peSelected.has(chip.dataset.platform);
        chip.classList.toggle('on', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

// Sets a <select> to a value, adding the option first if a stored time
// (e.g. one typed by hand into a file) isn't on the 5-minute list.
function peSetSelect(select, value) {
    if (value && ![...select.options].some(o => o.value === value)) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        select.appendChild(opt);
    }
    select.value = value || '';
}

function peShowError(message) {
    peEl('pe-error').textContent = message || '';
}

function peSetBusy(busy) {
    peBusy = busy;
    ['pe-save', 'pe-delete', 'pe-cancel'].forEach(id => { peEl(id).disabled = busy; });
}

function peCloseModal() {
    if (peBusy) return;
    peEl('pe-modal')?.classList.remove('active');
    peEditingId = null;
}

// No id → add a new item. With an id → edit that item (Delete shown).
window.openPlannerEventModal = function (id) {
    peBuildModal();

    let item = null;
    if (id) {
        item = peCache[id] || null;
        if (!item) console.warn('⚠️ Planner item not found in cache:', id);
    }

    peEditingId = item ? item.id : null;
    peEl('pe-title').textContent = item ? 'Edit calendar item' : 'Add calendar item';
    peEl('pe-delete').style.display = item ? '' : 'none';
    peShowError('');

    peEl('pe-category').value = item ? item.category : '';
    peEl('pe-date').value     = item ? item.date : peTodayIso();
    const [hh, mm] = item && item.time ? item.time.split(':') : ['', ''];
    peSetSelect(peEl('pe-hour'), hh);
    peSetSelect(peEl('pe-minute'), mm);
    peSelected = new Set(item && Array.isArray(item.platforms) ? item.platforms : []);
    peRenderChips();

    const label = peDayLabel(peEl('pe-date').value);
    peEl('pe-date-label').textContent = label ? `· ${label}` : '';

    peSetBusy(false);
    peEl('pe-modal').classList.add('active');
    peEl('pe-category').focus();
};

async function peAfterChange() {
    if (typeof refreshCalendarItems === 'function') await refreshCalendarItems();
}

async function peSave() {
    if (peBusy) return;

    const category  = peEl('pe-category').value.trim();
    const date      = peEl('pe-date').value;
    const hour      = peEl('pe-hour').value;
    const minute    = peEl('pe-minute').value;
    const platforms = PE_PLATFORMS.map(p => p.name).filter(n => peSelected.has(n));

    if (!category)           return peShowError('Add a category.');
    if (!date)               return peShowError('Choose a date.');
    if (!hour || !minute)    return peShowError('Choose a time (hour and minute).');
    if (!platforms.length)   return peShowError('Choose at least one platform.');

    const payload = { category, date, time: `${hour}:${minute}`, platforms };

    peShowError('');
    peSetBusy(true);
    try {
        if (peEditingId) {
            await peRequest(`/api/events/${encodeURIComponent(peEditingId)}`, {
                method: 'PUT', body: JSON.stringify(payload)
            });
        } else {
            await peRequest('/api/events', { method: 'POST', body: JSON.stringify(payload) });
        }
        peSetBusy(false);
        peCloseModal();
        await peAfterChange();
    } catch (err) {
        peSetBusy(false);
        peShowError(`Save failed: ${err.message} — your entry is still open, try again.`);
    }
}

async function peDelete() {
    if (peBusy || !peEditingId) return;

    const item  = peCache[peEditingId];
    const label = item ? `${item.category} · ${peDayLabel(item.date)} · ${item.time}` : 'this item';
    if (!confirm(`Delete "${label}" from the calendar?`)) return;

    peShowError('');
    peSetBusy(true);
    try {
        await peRequest(`/api/events/${encodeURIComponent(peEditingId)}`, { method: 'DELETE' });
        peSetBusy(false);
        peCloseModal();
        await peAfterChange();
    } catch (err) {
        peSetBusy(false);
        peShowError(`Delete failed: ${err.message}`);
    }
}
