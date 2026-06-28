/* ============================================================
   record-card.css — Card 1/2/3 popup styling for the Planner
   3C Content Schedule Planner · 3C Thread To Success™
   ------------------------------------------------------------
   Extracted from Record Centre's style.css (received 2026-06-28),
   NOT the whole file. Deliberately left out: the page-wide reset
   (*{margin:0;padding:0}), body background, bare h1–h4/p/a/label
   tag rules, .container, all .btn variants, and the global
   input/textarea/select styling — every one of those would have
   applied to the Planner's existing header, modal, and calendar UI
   too, not just this card, since they're written as global/tag
   selectors in the source file rather than scoped to the card.
   Everything below is either already record-card__-prefixed in the
   original, or has been scoped here so it can only ever affect
   what's inside .record-card.
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');

:root {
  --rc-bg-card:        #312e2d;

  --rc-violet:         #5e17eb;
  --rc-violet-dim:     #4a11bd;
  --rc-orange:         #ffbc66;
  --rc-orange-dim:     #e6a64f;
  --rc-turquoise:      #03e493;

  --rc-writing-bg:     #f1f1cb;
  --rc-writing-font:   #233dff;

  --rc-text-white:     #f4f4f4;
  --rc-text-muted:     #9a9a9a;
  --rc-text-faint:     #6a6a6a;

  --rc-border:         rgba(255, 255, 255, 0.08);
  --rc-border-strong:  rgba(255, 255, 255, 0.18);

  --rc-danger:         #ef4444;

  --rc-radius-sm:      8px;
  --rc-radius-md:      14px;
  --rc-radius-lg:      22px;

  --rc-shadow-card:    0 10px 36px rgba(0, 0, 0, 0.55);

  --rc-font:           'Montserrat', 'Open Sans', system-ui, -apple-system, sans-serif;
  --rc-transition:     0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Overlay + card shell ────────────────────────────────── */
.card-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.card-overlay.active { display: flex; }

.record-card {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  background: var(--rc-bg-card);
  border-radius: var(--rc-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--rc-shadow-card);
  font-family: var(--rc-font);
}

@media (max-width: 720px) {
  .record-card { max-height: 95vh; border-radius: var(--rc-radius-md); }
}

.record-card__header {
  background: var(--rc-violet);
  padding: 18px 24px 30px;
  border-radius: 0 0 50% 50% / 0 0 60px 60px;
  text-align: center;
}
.record-card__id {
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
}

.record-card__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 26px;
}
.record-card__year {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--rc-text-white);
  margin-bottom: 18px;
}
.record-card__field {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  font-size: 0.92rem;
}
.record-card__field-label {
  min-width: 84px;
  font-weight: 700;
  color: var(--rc-text-white);
  flex-shrink: 0;
}
.record-card__field-value {
  color: var(--rc-text-white);
  font-weight: 400;
  overflow-wrap: break-word;
  word-break: break-word;
}

.record-card__footer {
  background: var(--rc-violet);
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.record-card__footer .icon-btn { background: #fff; color: var(--rc-violet); }
.record-card__footer .icon-btn:hover { background: #f0f0f0; }

/* ── Icon buttons — only used inside the card, name doesn't
   collide with the Planner's own .btn-icon-svg header buttons ── */
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--rc-text-white);
  transition: all var(--rc-transition);
  flex-shrink: 0;
}
.icon-btn:hover { background: rgba(94, 23, 235, 0.5); transform: scale(1.08); }
.icon-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }
.icon-btn--rc-danger:hover { background: rgba(239, 68, 68, 0.4); }

/* ── Platform letters (fixed TG/YT/TK/PI row) ───────────────── */
.platform-letter-row { display: flex; gap: 8px; flex: 1; }
.platform-letter {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--rc-border-strong);
  color: var(--rc-text-faint);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all var(--rc-transition);
}
.platform-letter:hover { border-color: var(--rc-orange); color: var(--rc-text-white); }
.platform-letter.active {
  background: var(--rc-orange);
  border-color: var(--rc-orange-dim);
  color: #1a1a1a;
}

/* ── Card 2/3 writing-area variant — staged, not wired up yet ── */
.record-card__body--writing {
  background: var(--rc-writing-bg);
  margin: 18px;
  border-radius: var(--rc-radius-md);
  padding: 24px 22px;
  color: #1a1a1a;
  max-height: 50vh;
  overflow-y: auto;
}
.record-card__body--writing h2 { color: #1a1a1a; font-size: 1.5rem; margin-bottom: 18px; }
.record-card__body--writing .field-block { margin-bottom: 18px; }
.record-card__body--writing .field-block label {
  color: var(--rc-writing-font);
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: none;
  letter-spacing: 0;
  margin-bottom: 6px;
  display: block;
}
.record-card__body--writing textarea,
.record-card__body--writing input[type="text"] {
  background: rgba(255, 255, 255, 0.5);
  color: var(--rc-writing-font);
  font-weight: 600;
  border: 1px solid rgba(35, 61, 255, 0.25);
  overflow-wrap: break-word;
  word-break: break-word;
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--rc-radius-sm);
  font-family: var(--rc-font);
  font-size: 0.92rem;
}
.record-card__body--writing hr {
  border: none;
  border-top: 2px solid var(--rc-writing-font);
  margin: 16px 0;
  opacity: 0.6;
}
.record-card__purpose-note {
  text-align: center;
  font-size: 0.82rem;
  color: var(--rc-text-muted);
  padding: 14px 22px 4px;
  font-style: italic;
}
.record-card .char-counter {
  font-size: 0.74rem;
  color: var(--rc-text-faint);
  text-align: right;
  margin-top: 4px;
}
.record-card .char-counter.over-limit { color: var(--rc-danger); font-weight: 700; }

/* ── Record link row (Card 3 — copyable API URL) — staged ───── */
.record-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(35, 61, 255, 0.06);
  border: 1px solid rgba(35, 61, 255, 0.2);
  border-radius: var(--rc-radius-sm);
  padding: 8px 10px;
  margin-bottom: 16px;
}
.record-link-row__url {
  flex: 1;
  font-size: 0.74rem;
  color: var(--rc-writing-font);
  overflow-wrap: break-word;
  word-break: break-all;
}
.record-link-row button {
  background: var(--rc-writing-font);
  color: #fff;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.record-link-row button svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; }

/* ── Form-field font fix ─────────────────────────────────────
   Inputs/textareas/selects don't inherit font-family by default in
   any browser — Record Centre's real style.css fixes this globally;
   scoped here to .record-card only, so it can't touch the Planner's
   own modal form fields elsewhere on the page. */
.record-card input[type="text"],
.record-card textarea,
.record-card select {
  font-family: var(--rc-font);
}
