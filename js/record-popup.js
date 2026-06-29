// record-popup.js — Planner's live, read-only Card 1/2/3 view
// 3C Content Schedule Planner · 3C Thread To Success™
//
// Rebuilt from scratch — deliberately NOT a clone of Record Centre's
// card-1/2/3.js. Those are editable-form components; this view never
// edits anything, so it has no need for <input>/<textarea> elements,
// icons.js, numbering.js, or api.js at all. One self-contained file,
// fully independent of files this view never actually needed.
//
// Plain script (not a module) — matches app.js's own style, and removes
// any need to coordinate module-loading order with it.

const RC_API = 'https://recordmanagement.threadcommand.center';

const RC_PLATFORM_ABBR = { Telegram: 'TG', YouTube: 'YT', TikTok: 'TK', Pinterest: 'PI' };
const RC_ALL_PLATFORMS = ['Telegram', 'YouTube', 'TikTok', 'Pinterest'];
const RC_FORMAT_ABBR   = { 'short video': 'SV', 'long video': 'LV', 'post card': 'PC' };
const RC_PERSONA_ABBR  = { Falcon: 'FL', Panther: 'PT', Wolf: 'WF', Lion: 'LN', All: 'AL' };

function rcLookupPersona(persona) {
    const key = Object.keys(RC_PERSONA_ABBR).find(
        k => k.toLowerCase() === String(persona || '').toLowerCase()
    );
    return key ? RC_PERSONA_ABBR[key] : (persona || '');
}

// Same robust parsing as Record Centre's numbering.js — never trust
// fixed character positions on a free-typed date string.
function rcParseDateParts(dateStr) {
    const match = /(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '');
    if (match) return { year: match[1], month: match[2] };
    const now = new Date();
    return { year: String(now.getFullYear()), month: String(now.getMonth() + 1).padStart(2, '0') };
}

function rcFormatHeader(record, platform) {
    const abbr = RC_PLATFORM_ABBR[platform] || platform;
    const f    = RC_FORMAT_ABBR[record.format] || record.format || '';
    const pr   = rcLookupPersona(record.persona);
    const { year, month } = rcParseDateParts(record.date);
    const yy   = year.slice(-2);
    const seq  = record.sequences?.[platform];
    const seqStr = seq != null ? String(seq).padStart(3, '0') : '---';
    return `${abbr}-${f}-${pr}-${month}.${yy}-${seqStr}`;
}

function rcEsc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const RC_ICONS = {
    close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    back:  '<svg viewBox="0 0 24 24"><path d="M9 7l-5 5 5 5M4 12h11a5 5 0 0 0 0-10"/></svg>',
    next:  '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
};

window.openRecordCentreCardView = async function (recordId) {
    let record;
    try {
        const token = typeof getRecordCentreToken === 'function' ? getRecordCentreToken() : null;
        if (!token) { alert('Not signed in to Record Centre.'); return; }
        const res = await fetch(`${RC_API}/api/records/${encodeURIComponent(recordId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Record Centre returned ${res.status}`);
        record = await res.json();
    } catch (err) {
        alert('Could not load this record: ' + err.message);
        return;
    }
    showRecordPopup(record);
};

function showRecordPopup(record) {
    document.getElementById('rc-popup-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'rc-popup-overlay';
    overlay.className = 'card-overlay active';
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    const card = document.createElement('div');
    card.className = 'record-card';

    const viewingPlatform = (record.platforms || [])[0];
    let activeDistPlatform = viewingPlatform;
    let step = 1;

    function render() {
        if (step === 1) card.innerHTML = renderStep1();
        else if (step === 2) card.innerHTML = renderStep2();
        else card.innerHTML = renderStep3();
        bindStepEvents();
    }

    function renderStep1() {
        const headerId = record.id ? rcFormatHeader(record, viewingPlatform) : 'NEW RECORD';
        const { year } = rcParseDateParts(record.date);

        const platformRow = RC_ALL_PLATFORMS.map(p => {
            const isActive = (record.platforms || []).includes(p);
            return `<span class="platform-letter ${isActive ? 'active' : ''}">${RC_PLATFORM_ABBR[p]}</span>`;
        }).join('');

        const field = (label, value, wrap) => `
            <div class="record-card__field">
                <div class="record-card__field-label">${label}</div>
                <div class="record-card__field-value${wrap ? ' record-card__field-value--wrap' : ''}">${rcEsc(value || '—')}</div>
            </div>`;

        return `
            <div class="record-card__header"><div class="record-card__id">${rcEsc(headerId)}</div></div>
            <div class="record-card__body">
                <div class="record-card__year">${rcEsc(year)}</div>
                ${field('Category', record.category)}
                ${field('Title', record.title, true)}
                ${field('Persona', record.persona)}
                <div class="record-card__field">
                    <div class="record-card__field-label">Date</div>
                    <div class="record-card__field-value">${rcEsc(record.date || '—')}</div>
                    <div class="record-card__field-label" style="margin-left:10px;">Time</div>
                    <div class="record-card__field-value">${rcEsc(record.time || '—')}</div>
                </div>
                ${field('Format', record.format)}
                <div class="record-card__field">
                    <div class="record-card__field-label">Platform</div>
                    <div class="platform-letter-row">${platformRow}</div>
                </div>
                ${field('Playlist', record.playlist)}
                ${field('Index', record.index, true)}
            </div>
            <div class="record-card__footer">
                <button class="icon-btn" data-action="close" title="Close">${RC_ICONS.close}</button>
                <button class="icon-btn" data-action="next" title="Next">${RC_ICONS.next}</button>
            </div>`;
    }

    function renderStep2() {
        const headerId = rcFormatHeader(record, viewingPlatform);
        const notes = record.content?.notes || '(no production notes)';
        const refs  = record.content?.references || '—';
        return `
            <div class="record-card__header"><div class="record-card__id">${rcEsc(headerId)}</div></div>
            <div class="record-card__body" style="padding:0;">
                <div class="record-card__body--writing">
                    <h2>Content Panel</h2>
                    <div class="field-block">
                        <label>Production Notes</label>
                        <div class="value-box">${rcEsc(notes)}</div>
                    </div>
                    <div class="field-block">
                        <label>References</label>
                        <div class="value-box">${rcEsc(refs)}</div>
                    </div>
                </div>
            </div>
            <p class="record-card__purpose-note">Read-only — editing happens in Record Centre.</p>
            <div class="record-card__footer">
                <button class="icon-btn" data-action="back" title="Back">${RC_ICONS.back}</button>
                <button class="icon-btn" data-action="next" title="Next">${RC_ICONS.next}</button>
            </div>`;
    }

    function renderStep3() {
        const platforms = record.platforms || [];
        if (!platforms.includes(activeDistPlatform)) activeDistPlatform = platforms[0];
        const headerId = rcFormatHeader(record, activeDistPlatform);
        const d = record.distribution?.[activeDistPlatform] || {};

        const tabs = platforms.map(p => `
            <button type="button" class="rc-platform-tab ${p === activeDistPlatform ? 'active' : ''}" data-dist-tab="${p}">${p}</button>
        `).join('');

        const fields = [
            ['Title', d.title], ['Description', d.description], ['Hashtags', d.hashtags],
            ['Tags', d.tags], ['CTA', d.cta, true], ['Keywords', d.keywords, true],
            ['Platform Notes', d.platformNotes],
        ].map(([label, value, singleLine]) => `
            <div class="field-block">
                <label>${label}</label>
                <div class="value-box${singleLine ? ' value-box--single-line' : ''}">${rcEsc(value || '—')}</div>
            </div>`).join('');

        return `
            <div class="record-card__header"><div class="record-card__id">${rcEsc(headerId)}</div></div>
            <div class="record-card__body" style="padding:0;">
                <div class="record-card__body--writing">
                    <h2>Distribution Panel</h2>
                    <div class="rc-platform-tabs">${tabs}</div>
                    ${fields}
                </div>
            </div>
            <p class="record-card__purpose-note">Read-only — editing happens in Record Centre.</p>
            <div class="record-card__footer">
                <button class="icon-btn" data-action="back" title="Back">${RC_ICONS.back}</button>
                <button class="icon-btn" data-action="close" title="Close">${RC_ICONS.close}</button>
            </div>`;
    }

    function bindStepEvents() {
        card.querySelector('[data-action="close"]')?.addEventListener('click', () => overlay.remove());
        card.querySelector('[data-action="back"]')?.addEventListener('click', () => { step--; render(); });
        card.querySelector('[data-action="next"]')?.addEventListener('click', () => { step++; render(); });
        card.querySelectorAll('[data-dist-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                activeDistPlatform = tab.dataset.distTab;
                render();
            });
        });
    }

    render();
    overlay.appendChild(card);
    document.body.appendChild(overlay);
}
