// record-popup.js — Planner's live Card 1/2/3 view
// 3C Content Schedule Planner · 3C Thread To Success™
//
// card-1.js, card-2.js, card-3.js, icons.js, numbering.js, api.js, and
// record-card.css are all cloned from Record Centre. This file is the
// only genuinely new code: it opens the cloned cards in a popup and
// wires Next/Back between them, since the Planner triggers the view
// from a calendar event's eye icon, not from an index-list row.
//
// ES module, unlike app.js (a plain script) — needed to import the real
// card files as-is. Bridges to window.openRecordCentreCardView so the
// existing eye-icon click handler in app.js doesn't need to change.
//
// Read-only throughout: Save and Add Platform show an explanatory alert
// instead of writing anything back, since editing/creating still
// belongs to Record Centre, not the Planner.

import { renderCard1, bindCard1Events } from './card-1.js?v=14';
import { renderCard2, bindCard2Events } from './card-2.js?v=14';
import { renderCard3, bindCard3Events } from './card-3.js?v=14';
import { getRecord } from './api.js?v=13';

window.openRecordCentreCardView = async function (recordId) {
    let record;
    try {
        record = await getRecord(recordId);
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

    function showStep1() {
        card.innerHTML = renderCard1(record, viewingPlatform);
        bindCard1Events(card, record, {
            onClose: () => overlay.remove(),
            onNext: () => showStep2(),
            onChange: () => showStep1(),
            onAddPlatform: () => alert('Platforms are managed in Record Centre — this view is read-only.')
        });
    }

    function showStep2() {
        card.innerHTML = renderCard2(record, viewingPlatform);
        bindCard2Events(card, record, {
            onBack: () => showStep1(),
            onNext: () => showStep3()
        });
    }

    function showStep3() {
        card.innerHTML = renderCard3(record);
        bindCard3Events(card, record, {
            onBack: () => showStep2(),
            onSave: () => alert('Saving is managed in Record Centre — this view is read-only.'),
            rerender: () => showStep3()
        });
    }

    showStep1();
    overlay.appendChild(card);
    document.body.appendChild(overlay);
}
