// Builds a full standalone HTML document from the slide spec returned by /api/export-pdf.
// Open in a new window and auto-trigger window.print() to produce the PDF.

const BG = "#08080A";
const TEXT = "#F5F2EE";
const GOLD = "#C4956A";
const GOLD_DIM = "rgba(196,149,106,0.18)";
const GOLD_BORDER = "rgba(196,149,106,0.35)";
const DIM = "rgba(245,242,238,0.45)";
const CARD_BG = "#111113";

// ── Layout renderers ──────────────────────────────────────────────────────────

function coverSlide(d: Record<string, unknown>): string {
  const metaRow = (d.meta_row as string[] | undefined) ?? [];
  const chips = metaRow
    .map((m) => `<span class="chip">${esc(m)}</span>`)
    .join("");
  return `
    <div class="slide cover">
      <div class="cover-inner">
        <p class="cover-label">${esc(d.label as string)}</p>
        <h1 class="cover-title">${esc(d.title as string)}</h1>
        <p class="cover-subtitle">${esc(d.subtitle as string)}</p>
        <div class="chip-row">${chips}</div>
        <p class="cover-theme">${esc(d.theme_brief as string)}</p>
      </div>
      <div class="cover-figure">
        <p class="figure-label">Key Figure</p>
        <p class="figure-name">${esc(d.key_figure as string)}</p>
      </div>
      <div class="slide-num">01</div>
    </div>`;
}

function prayerSlide(d: Record<string, unknown>, num: number): string {
  const lines = (d.lines as string[] | undefined) ?? [];
  const rows = lines.map((l) => `<p class="prayer-line">${esc(l)}</p>`).join("");
  return `
    <div class="slide prayer">
      <div class="prayer-inner">
        <p class="section-label">${esc(d.heading as string)}</p>
        <div class="prayer-divider"></div>
        <div class="prayer-body">${rows}</div>
        <p class="prayer-close">${esc(d.close as string)}</p>
      </div>
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

function twoPanelSlide(d: Record<string, unknown>, num: number): string {
  type Item = { bold: string; text: string };
  const renderItems = (items: Item[]) =>
    items
      .map(
        (it) =>
          `<div class="panel-item"><span class="panel-bold">${esc(it.bold)}</span> <span class="panel-text">${esc(it.text)}</span></div>`
      )
      .join("");

  const left = d.left as { title: string; items: Item[] };
  const right = d.right as { title: string; items: Item[] };

  return `
    <div class="slide two-panel">
      <p class="slide-heading">${esc(d.heading as string)}</p>
      <div class="panels">
        <div class="panel">
          <p class="panel-title">${esc(left.title)}</p>
          <div class="panel-items">${renderItems(left.items ?? [])}</div>
        </div>
        <div class="panel-divider"></div>
        <div class="panel">
          <p class="panel-title">${esc(right.title)}</p>
          <div class="panel-items">${renderItems(right.items ?? [])}</div>
        </div>
      </div>
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

function threePanelSlide(d: Record<string, unknown>, num: number): string {
  type Panel = { title: string; badge: string; items: string[] };
  const panels = (d.panels as Panel[] | undefined) ?? [];
  const cols = panels
    .map(
      (p) => `
      <div class="t-panel">
        <p class="t-panel-title">${esc(p.title)}</p>
        <span class="t-panel-badge">${esc(p.badge)}</span>
        <ul class="t-panel-list">
          ${(p.items ?? []).map((it) => `<li>${esc(it)}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");
  return `
    <div class="slide three-panel">
      <p class="slide-heading">${esc(d.heading as string)}</p>
      <div class="t-panels">${cols}</div>
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

function cardGridSlide(d: Record<string, unknown>, num: number): string {
  type Card = { title: string; body: string; note?: string };
  const cards = (d.cards as Card[] | undefined) ?? [];
  const cardHtml = cards
    .map(
      (c) => `
      <div class="card">
        <p class="card-title">${esc(c.title)}</p>
        <p class="card-body">${esc(c.body)}</p>
        ${c.note ? `<p class="card-note">${esc(c.note)}</p>` : ""}
      </div>`
    )
    .join("");
  return `
    <div class="slide card-grid">
      <p class="slide-heading">${esc(d.heading as string)}</p>
      <div class="cards">${cardHtml}</div>
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

function quoteFeatureSlide(d: Record<string, unknown>, num: number): string {
  type Point = { bold: string; text: string };
  const points = (d.points as Point[] | undefined) ?? [];
  const pointsHtml = points
    .map(
      (p) =>
        `<div class="qf-point"><span class="panel-bold">${esc(p.bold)}</span> <span class="panel-text">${esc(p.text)}</span></div>`
    )
    .join("");
  return `
    <div class="slide quote-feature">
      <p class="slide-heading">${esc(d.heading as string)}</p>
      <div class="qf-inner">
        <div class="qf-quote-wrap">
          <p class="qf-mark">&ldquo;</p>
          <p class="qf-quote">${esc(d.quote as string)}</p>
          <p class="qf-source">${esc(d.source as string)}</p>
        </div>
        <div class="qf-points">${pointsHtml}</div>
      </div>
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

function stepsListSlide(d: Record<string, unknown>, num: number): string {
  type Step = { num: number; title: string; action: string; reflect: string };
  const steps = (d.steps as Step[] | undefined) ?? [];
  const stepsHtml = steps
    .map(
      (s) => `
      <div class="step">
        <div class="step-num">${s.num}</div>
        <div class="step-body">
          <p class="step-title">${esc(s.title)}</p>
          <p class="step-action">${esc(s.action)}</p>
          <p class="step-reflect">${esc(s.reflect)}</p>
        </div>
      </div>`
    )
    .join("");
  return `
    <div class="slide steps-list">
      <p class="slide-heading">${esc(d.heading as string)}</p>
      <div class="steps">${stepsHtml}</div>
      ${d.footer ? `<p class="steps-footer">${esc(d.footer as string)}</p>` : ""}
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

function questionsListSlide(d: Record<string, unknown>, num: number): string {
  type Group = { label: string; questions: string[] };
  const groups = (d.groups as Group[] | undefined) ?? [];
  const groupsHtml = groups
    .map(
      (g) => `
      <div class="q-group">
        <p class="q-label">${esc(g.label)}</p>
        ${(g.questions ?? []).map((q) => `<p class="q-item">→ ${esc(q)}</p>`).join("")}
      </div>`
    )
    .join("");
  return `
    <div class="slide questions-list">
      <p class="slide-heading">${esc(d.heading as string)}</p>
      <div class="q-groups">${groupsHtml}</div>
      <div class="slide-num">${String(num).padStart(2, "0")}</div>
    </div>`;
}

// ── HTML escape ───────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Slide dispatcher ──────────────────────────────────────────────────────────

function renderSlide(slide: {
  id: string;
  section: number;
  layout: string;
  data: Record<string, unknown>;
}): string {
  const { layout, data, section } = slide;
  switch (layout) {
    case "cover":          return coverSlide(data);
    case "prayer":         return prayerSlide(data, section);
    case "two_panel":      return twoPanelSlide(data, section);
    case "three_panel":    return threePanelSlide(data, section);
    case "card_grid":      return cardGridSlide(data, section);
    case "quote_feature":  return quoteFeatureSlide(data, section);
    case "steps_list":     return stepsListSlide(data, section);
    case "questions_list": return questionsListSlide(data, section);
    default:               return `<div class="slide"><p style="color:${TEXT}">${layout}</p></div>`;
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export interface SlideSpec {
  meta: { title: string; total_slides: number };
  slides: {
    id: string;
    section: number;
    section_name: string;
    layout: string;
    data: Record<string, unknown>;
  }[];
}

export function buildPdfHtml(spec: SlideSpec): string {
  const slidesHtml = spec.slides.map(renderSlide).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${esc(spec.meta.title)} — ScripturePath</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: 1280px 720px; margin: 0; }

  html, body {
    width: 1280px;
    background: ${BG};
    font-family: 'Inter', sans-serif;
    color: ${TEXT};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Slide shell ──────────────────────────────────────── */
  .slide {
    position: relative;
    width: 1280px;
    height: 720px;
    background: ${BG};
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    padding: 56px 72px 52px;
  }

  /* corner slide number */
  .slide-num {
    position: absolute;
    bottom: 28px;
    right: 40px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: ${GOLD};
    opacity: 0.55;
  }

  /* shared heading */
  .slide-heading {
    font-family: 'Lora', serif;
    font-size: 22px;
    font-weight: 600;
    color: ${TEXT};
    margin-bottom: 32px;
    border-bottom: 1px solid ${GOLD_BORDER};
    padding-bottom: 14px;
    letter-spacing: 0.01em;
  }

  /* chip */
  .chip {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    color: ${GOLD};
    background: ${GOLD_DIM};
    border: 1px solid ${GOLD_BORDER};
    border-radius: 6px;
    padding: 4px 12px;
    margin-right: 8px;
  }
  .chip-row { margin: 20px 0; }

  /* ── Cover ───────────────────────────────────────────── */
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: radial-gradient(ellipse at 20% 60%, rgba(196,149,106,0.08) 0%, transparent 60%), ${BG};
  }
  .cover::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(196,149,106,0.04) 0%, transparent 50%);
  }
  .cover-inner { position: relative; max-width: 700px; }
  .cover-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: ${GOLD};
    opacity: 0.7;
    margin-bottom: 18px;
  }
  .cover-title {
    font-family: 'Lora', serif;
    font-size: 62px;
    font-weight: 600;
    line-height: 1.05;
    color: ${TEXT};
    letter-spacing: -0.01em;
    margin-bottom: 16px;
  }
  .cover-subtitle {
    font-size: 17px;
    color: ${DIM};
    line-height: 1.5;
    max-width: 520px;
  }
  .cover-theme {
    font-size: 13px;
    font-style: italic;
    color: ${DIM};
    margin-top: 24px;
    max-width: 560px;
    line-height: 1.6;
  }
  .cover-figure {
    position: absolute;
    right: 72px;
    bottom: 72px;
    text-align: right;
  }
  .figure-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${GOLD};
    opacity: 0.55;
    margin-bottom: 4px;
  }
  .figure-name {
    font-family: 'Lora', serif;
    font-size: 18px;
    font-weight: 600;
    color: ${TEXT};
    opacity: 0.85;
  }

  /* ── Prayer ──────────────────────────────────────────── */
  .prayer {
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 50% 40%, rgba(196,149,106,0.06) 0%, transparent 65%), ${BG};
  }
  .prayer-inner { text-align: center; max-width: 680px; }
  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: ${GOLD};
    opacity: 0.65;
    margin-bottom: 24px;
  }
  .prayer-divider {
    width: 60px;
    height: 1px;
    background: ${GOLD_BORDER};
    margin: 0 auto 28px;
  }
  .prayer-line {
    font-family: 'Lora', serif;
    font-size: 17px;
    line-height: 1.85;
    color: ${TEXT};
    opacity: 0.88;
  }
  .prayer-close {
    font-family: 'Lora', serif;
    font-size: 16px;
    font-style: italic;
    color: ${GOLD};
    margin-top: 22px;
  }

  /* ── Two panel ───────────────────────────────────────── */
  .two-panel { }
  .panels {
    display: flex;
    gap: 0;
    height: calc(100% - 110px);
  }
  .panel { flex: 1; padding-right: 40px; }
  .panel-divider {
    width: 1px;
    background: ${GOLD_BORDER};
    opacity: 0.4;
    margin: 0 40px 0 0;
    flex-shrink: 0;
  }
  .panel-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${GOLD};
    margin-bottom: 18px;
  }
  .panel-items { display: flex; flex-direction: column; gap: 14px; }
  .panel-item { font-size: 14px; line-height: 1.55; color: ${TEXT}; opacity: 0.85; }
  .panel-bold { font-weight: 600; color: ${TEXT}; }
  .panel-text { color: ${DIM}; }

  /* ── Three panel ─────────────────────────────────────── */
  .three-panel { }
  .t-panels {
    display: flex;
    gap: 24px;
    height: calc(100% - 110px);
  }
  .t-panel {
    flex: 1;
    background: ${CARD_BG};
    border: 1px solid rgba(196,149,106,0.2);
    border-radius: 12px;
    padding: 24px 22px;
  }
  .t-panel-title {
    font-family: 'Lora', serif;
    font-size: 16px;
    font-weight: 600;
    color: ${TEXT};
    margin-bottom: 10px;
  }
  .t-panel-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    color: ${GOLD};
    background: ${GOLD_DIM};
    border: 1px solid ${GOLD_BORDER};
    border-radius: 4px;
    padding: 2px 8px;
    margin-bottom: 14px;
  }
  .t-panel-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .t-panel-list li {
    font-size: 13px;
    line-height: 1.5;
    color: ${DIM};
    padding-left: 14px;
    position: relative;
  }
  .t-panel-list li::before {
    content: '·';
    position: absolute;
    left: 0;
    color: ${GOLD};
    font-size: 16px;
    line-height: 1.2;
  }

  /* ── Card grid ───────────────────────────────────────── */
  .card-grid { }
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 18px;
    height: calc(100% - 110px);
  }
  .card {
    background: ${CARD_BG};
    border: 1px solid ${GOLD_BORDER};
    border-radius: 12px;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .card-title {
    font-family: 'Lora', serif;
    font-size: 15px;
    font-weight: 600;
    color: ${GOLD};
    line-height: 1.3;
  }
  .card-body {
    font-size: 13px;
    line-height: 1.6;
    color: ${DIM};
    flex: 1;
  }
  .card-note {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: ${GOLD};
    opacity: 0.6;
    margin-top: 4px;
  }

  /* ── Quote feature ───────────────────────────────────── */
  .quote-feature { }
  .qf-inner {
    display: flex;
    gap: 56px;
    align-items: flex-start;
    height: calc(100% - 100px);
  }
  .qf-quote-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }
  .qf-mark {
    font-family: 'Lora', serif;
    font-size: 80px;
    line-height: 0.6;
    color: ${GOLD};
    opacity: 0.4;
    margin-bottom: 10px;
  }
  .qf-quote {
    font-family: 'Lora', serif;
    font-size: 22px;
    line-height: 1.55;
    color: ${TEXT};
    font-style: italic;
    max-width: 480px;
  }
  .qf-source {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: ${GOLD};
    margin-top: 16px;
  }
  .qf-points {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 18px;
    justify-content: center;
    border-left: 1px solid ${GOLD_BORDER};
    padding-left: 40px;
  }
  .qf-point {
    font-size: 14px;
    line-height: 1.55;
    color: ${TEXT};
    opacity: 0.85;
  }

  /* ── Steps list ──────────────────────────────────────── */
  .steps-list { }
  .steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: calc(100% - 130px);
    overflow: hidden;
  }
  .step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${GOLD_DIM};
    border: 1px solid ${GOLD_BORDER};
    color: ${GOLD};
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .step-body { flex: 1; }
  .step-title {
    font-family: 'Lora', serif;
    font-size: 14px;
    font-weight: 600;
    color: ${TEXT};
    margin-bottom: 3px;
  }
  .step-action {
    font-size: 13px;
    color: ${DIM};
    line-height: 1.5;
    margin-bottom: 2px;
  }
  .step-reflect {
    font-size: 12px;
    font-style: italic;
    color: ${GOLD};
    opacity: 0.7;
  }
  .steps-footer {
    font-size: 13px;
    font-style: italic;
    color: ${DIM};
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(196,149,106,0.2);
  }

  /* ── Questions list ──────────────────────────────────── */
  .questions-list { }
  .q-groups {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px 48px;
    height: calc(100% - 110px);
  }
  .q-group { display: flex; flex-direction: column; gap: 10px; }
  .q-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${GOLD};
    margin-bottom: 4px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(196,149,106,0.25);
  }
  .q-item {
    font-size: 14px;
    line-height: 1.6;
    color: ${DIM};
  }

  /* ── Print optimisation ──────────────────────────────── */
  @media print {
    html, body { width: 1280px; }
    .slide { page-break-after: always; break-after: page; }
    .slide:last-child { page-break-after: avoid; break-after: avoid; }
  }
</style>
</head>
<body>
${slidesHtml}
<script>
  window.addEventListener('load', function () {
    setTimeout(function () { window.print(); }, 400);
  });
</script>
</body>
</html>`;
}
