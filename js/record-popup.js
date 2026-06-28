// record-popup.js — Planner's live Card 1 view
// 3C Content Schedule Planner · 3C Thread To Success™
//
// card-1.js, icons.js, numbering.js, api.js, and record-card.css are all
// cloned from Record Centre (the CSS is a curated subset — see that
// file's header comment for exactly what was left out and why). This
// file is the only genuinely new code: it opens the cloned card in a
// popup, since the Planner triggers the view from a calendar event's eye
// icon, not from an index-list row like Record Centre does.
//
// ES module, unlike app.js (a plain script) — needed to import card-1.js
// as-is. Bridges to window.openRecordCentreCardView so the existing
// eye-icon click handler in app.js doesn't need to change at all.

import { renderCard1, bindCard1Events } from './card-1.js?v=13';
import { getRecord } from './api.js?v=13';

window.openRecordCentreCardView = async function (recordId) {
    let record;
    try {
        record = await getRecord(recordId);
    } catch (err) {
        alert('Could not load this record: ' + err.message);
        return;
    }
    showCard1Popup(record);
};

function showCard1Popup(record) {
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
    card.innerHTML = renderCard1(record, viewingPlatform);

    bindCard1Events(card, record, {
        onClose: () => overlay.remove(),
        onNext: () => {}, // Card 2/3 navigation not requested yet — staged, not wired
        onChange: () => { card.innerHTML = renderCard1(record, viewingPlatform); },
        onAddPlatform: () => alert('Platforms are managed in Record Centre — this view is read-only.')
    });

    overlay.appendChild(card);
    document.body.appendChild(overlay);
}
