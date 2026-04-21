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

// ── HTML escape (shared) ──────────────────────────────────────────────────────

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

// ── Direct PDF builder (no Claude — renders study HTML as-is) ─────────────────

interface KeyFacts {
  book_date: string;
  traditional_attribution: string;
  tradition_note: string | null;
  key_figure: string;
  genre: string;
  key_theme: string;
  read_time: string;
  passage_url?: string;
}

interface StudyDataForPdf {
  section_01: { key_facts: KeyFacts; html_content: string };
  section_02: string;
  section_03: string;
  section_04: string;
  section_05: string;
  section_06: string;
  section_07: string;
  section_08: string;
  section_09: string;
  section_10: string;
}

const PG = "#C4934E";

const SECTION_LABELS = [
  "At a Glance",
  "Opening Prayer",
  "Context & Background",
  "Read the Passage",
  "Key Observations",
  "Key Takeaways & Interpretation",
  "Christ Connection",
  "Life Application",
  "Discussion Questions",
  "Summary & Closing Prayer",
];

function buildSection01(data: StudyDataForPdf["section_01"], passage: string): string {
  const { key_facts: kf, html_content } = data;
  const genres = kf.genre.split(/[|,/]/).map((g) => g.trim()).filter(Boolean);
  const genreChips = genres.map((g) => `<span class="genre-chip">${esc(g)}</span>`).join("");
  const facts = [
    { label: "Author", value: kf.traditional_attribution + (kf.tradition_note ? ` — ${kf.tradition_note}` : "") },
    { label: "Date", value: kf.book_date },
    { label: "Key Figures", value: kf.key_figure },
    { label: "Key Theme", value: kf.key_theme },
    { label: "Read Time", value: kf.read_time },
  ];
  const factsHtml = facts.map((f, i) => `
    <div class="kf-row${i < facts.length - 1 ? " kf-row-border" : ""}">
      <div class="kf-label">${esc(f.label)}</div>
      <div class="kf-value">${esc(f.value)}</div>
    </div>`).join("");
  return `
    <div class="s01-badges">
      <span class="passage-chip">${esc(passage)}</span>
      ${genreChips}
    </div>
    <p class="subsection-label">The Big Story</p>
    <div class="study-html s01-story">${html_content}</div>
    <div class="kf-table">${factsHtml}</div>`;
}

function buildSection10(html: string): string {
  const ulMatch   = html.match(/(<ul>[\s\S]*?<\/ul>)/i);
  const bqMatch   = html.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
  const summaryHtml  = ulMatch  ? ulMatch[1]  : "";
  const takeawayText = bqMatch  ? bqMatch[1]  : "";
  const prayerHtml   = html
    .replace(/<ul>[\s\S]*?<\/ul>/i, "")
    .replace(/<blockquote>[\s\S]*?<\/blockquote>/i, "")
    .trim();
  return `
    ${summaryHtml ? `<div class="s10-summary">${summaryHtml}</div>` : ""}
    ${takeawayText ? `
      <div class="s10-takeaway">
        <span class="takeaway-icon">✦</span>
        <p>${takeawayText}</p>
      </div>` : ""}
    ${prayerHtml ? `<div class="section-divider" style="margin:1.75rem 0"></div>
      <div class="prayer-html">${prayerHtml}</div>` : ""}`;
}

function buildTocPage(title: string, passage: string): string {
  const items = SECTION_LABELS.map((label, i) => `
    <a href="#section-${i}" class="toc-item">
      <span class="toc-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="toc-label">${esc(label)}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${i + 2}</span>
    </a>`).join("");
  return `
    <div class="toc-page" id="toc">
      <div class="toc-brand">ScripturePath Bible Study</div>
      <h1 class="toc-title">${esc(title)}</h1>
      <div class="toc-passage-row">
        <span class="toc-passage">${esc(passage)}</span>
      </div>
      <div class="toc-rule"></div>
      <nav class="toc-list">${items}</nav>
      <div class="toc-footer">
        <span>Contents</span>
        <span>1</span>
      </div>
    </div>`;
}

function buildSectionPage(index: number, content: string, title: string, passage: string): string {
  return `
    <div class="section-page" id="section-${index}">
      <div class="section-header">
        <span class="sec-num">${String(index + 1).padStart(2, "0")}</span>
        <h2 class="sec-label">${esc(SECTION_LABELS[index])}</h2>
      </div>
      <div class="sec-rule"></div>
      <div class="section-content">${content}</div>
      <div class="page-footer">
        <a href="#toc" class="footer-back">↑ Contents</a>
        <span class="footer-meta">${esc(title)} · ${esc(passage)}</span>
        <span class="footer-page">${index + 2}</span>
      </div>
    </div>`;
}

export function buildPdfHtmlDirect(study: StudyDataForPdf, title: string, passage: string): string {
  const s06 = study.section_06
    .replace(/(<h3>)(Takeaway\s+\d+:)/gi, `$1<span style="color:${PG}">$2</span>`)
    .replace(/(<h3>)(Cross-References)(<\/h3>)/gi, `$1<span style="color:${PG}">$2</span>$3`)
    .replace(/(<h3>(?:<span[^>]*>)?Cross-References(?:<\/span>)?<\/h3>)\s*(<ul>)/gi, `$1<ul class="cross-refs-list">`);

  const s08 = study.section_08
    .replace(/(<h3>)(Application\s+\d+:)/gi, `$1<span style="color:${PG}">$2</span>`)
    .replace(/(<h3>)(Accountability Suggestion)(<\/h3>)/gi, `$1<span style="color:${PG}">$2</span>$3`);

  const sectionContents = [
    buildSection01(study.section_01, passage),
    `<div class="prayer-html">${study.section_02}</div>`,
    `<div class="study-html">${study.section_03}</div>`,
    `<div class="passage-section-notice">Read the passage in your Bible before beginning. Links are provided in the guide below.</div>
     <div class="passage-html">${study.section_04}</div>`,
    `<p class="section-pretext">What does the text actually say? These observations are drawn directly from the passage — no interpretation yet.</p>
     <div class="study-html obs-section">${study.section_05}</div>`,
    `<div class="study-html">${s06}</div>`,
    `<div class="study-html">${study.section_07}</div>`,
    `<div class="study-html">${s08}</div>`,
    `<p class="section-pretext">Use these questions for personal reflection or group discussion.</p>
     <div class="questions-html">${study.section_09}</div>`,
    buildSection10(study.section_10),
  ];

  const tocPage = buildTocPage(title, passage);
  const sectionPages = sectionContents
    .map((content, i) => buildSectionPage(i, content, title, passage))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${esc(title)} — ScripturePath</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: A4; margin: 18mm 20mm 15mm; }

  html, body {
    font-family: 'Inter', sans-serif;
    background: #0D0D0D;
    color: rgba(255,255,255,0.92);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Page shells ── */
  .toc-page, .section-page {
    position: relative;
    min-height: 100vh;
    padding: 52px 64px 72px;
    display: flex;
    flex-direction: column;
  }
  .section-page { break-before: page; }

  /* ── TOC ── */
  .toc-brand {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: ${PG};
    opacity: 0.65;
    margin-bottom: 24px;
  }
  .toc-title {
    font-family: 'Lora', serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: rgba(255,255,255,0.95);
    margin-bottom: 14px;
  }
  .toc-passage-row { margin-bottom: 36px; }
  .toc-passage {
    font-family: 'Lora', serif;
    font-style: italic;
    font-size: 15px;
    color: ${PG};
    opacity: 0.85;
  }
  .toc-rule {
    height: 1px;
    background: rgba(255,255,255,0.08);
    margin-bottom: 36px;
  }
  .toc-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .toc-item {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 11px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    text-decoration: none;
    color: inherit;
    transition: color 0.15s;
  }
  .toc-item:last-child { border-bottom: none; }
  .toc-item:hover .toc-label { color: rgba(255,255,255,0.9); }
  .toc-num {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: ${PG};
    opacity: 0.7;
    width: 22px;
    flex-shrink: 0;
  }
  .toc-label {
    font-size: 13.5px;
    color: rgba(255,255,255,0.68);
    flex: 1;
    min-width: 0;
  }
  .toc-dots {
    flex: 1;
    border-bottom: 1px dotted rgba(255,255,255,0.12);
    margin: 0 10px 4px;
    max-width: 120px;
  }
  .toc-page {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.28);
    flex-shrink: 0;
  }
  .toc-footer {
    margin-top: 36px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 12px;
  }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 10px;
  }
  .sec-num {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: ${PG};
    opacity: 0.7;
  }
  .sec-label {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: rgba(255,255,255,0.92);
  }
  .sec-rule {
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin-bottom: 28px;
  }
  .section-content { flex: 1; }

  /* ── Page footer ── */
  .page-footer {
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
  }
  .footer-back {
    color: ${PG};
    opacity: 0.5;
    text-decoration: none;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .footer-meta { flex: 1; text-align: center; }
  .footer-page { font-weight: 600; }

  /* ── Section 01 ── */
  .s01-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .passage-chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500;
    color: ${PG};
    background: rgba(196,147,78,0.1);
    border: 1px solid rgba(196,147,78,0.22);
    border-radius: 6px; padding: 4px 12px;
  }
  .genre-chip {
    display: inline-block;
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px; padding: 4px 10px;
  }
  .subsection-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
    margin-bottom: 10px;
  }
  .s01-story { margin-bottom: 28px; }
  .kf-table { border-top: 1px solid rgba(255,255,255,0.07); margin-top: 8px; }
  .kf-row { display: flex; gap: 20px; padding: 12px 0; }
  .kf-row-border { border-bottom: 1px solid rgba(255,255,255,0.06); }
  .kf-label {
    display: flex; align-items: center; gap: 6px;
    width: 110px; flex-shrink: 0;
    font-size: 9px; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
  }
  .kf-value { font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.6; }

  /* ── Passage section notice ── */
  .passage-section-notice {
    display: flex; align-items: center; gap: 10px;
    background: rgba(196,147,78,0.1);
    border: 1px solid rgba(196,147,78,0.22);
    border-radius: 10px; padding: 12px 16px;
    font-size: 12px; color: rgba(255,255,255,0.62);
    margin-bottom: 22px; line-height: 1.5;
  }

  /* ── Section pretext ── */
  .section-pretext {
    font-size: 12px; color: rgba(255,255,255,0.35);
    margin-bottom: 18px; line-height: 1.7;
  }

  /* ── Section 10 ── */
  .s10-takeaway {
    display: flex; gap: 12px; align-items: flex-start;
    background: rgba(196,147,78,0.1);
    border: 1px solid rgba(196,147,78,0.22);
    border-radius: 10px; padding: 16px 20px;
    margin: 24px 0;
  }
  .takeaway-icon { font-size: 16px; color: ${PG}; margin-top: 1px; flex-shrink: 0; }
  .s10-takeaway p { font-size: 14px; line-height: 1.7; font-style: italic; color: rgba(255,255,255,0.88); }

  /* ── Study HTML (sections 03, 06, 07, 08) ── */
  .study-html h3 {
    font-size: 14.5px; font-weight: 600;
    color: rgba(255,255,255,0.92);
    margin-top: 1.75rem; margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }
  .study-html p {
    font-size: 14px; color: rgba(255,255,255,0.62);
    line-height: 1.85; margin-bottom: 0.9rem;
  }
  .study-html ul, .study-html ol { padding-left: 1.35rem; margin-bottom: 0.9rem; }
  .study-html li {
    font-size: 14px; color: rgba(255,255,255,0.62);
    line-height: 1.85; margin-bottom: 0.45rem;
  }
  .study-html strong { color: rgba(255,255,255,0.88); font-weight: 600; }
  .study-html em {
    color: ${PG}; font-style: normal;
    font-size: 10.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
  }
  .study-html hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 1.5rem 0; }
  .study-html blockquote {
    border-left: 2px solid rgba(196,147,78,0.4);
    padding: 0.5rem 1rem; margin: 1rem 0;
    font-size: 14px; color: rgba(255,255,255,0.78);
    font-style: italic; line-height: 1.85;
  }
  .study-html a { color: ${PG}; text-underline-offset: 3px; }

  /* Observations (section 05) */
  .study-html.obs-section ol {
    list-style: none; counter-reset: obs-counter; padding-left: 0;
  }
  .study-html.obs-section ol > li {
    counter-increment: obs-counter;
    padding-left: 2.75rem; position: relative; margin-bottom: 1.1rem;
  }
  .study-html.obs-section ol > li::before {
    content: counter(obs-counter);
    position: absolute; left: 0; top: 0.2rem;
    width: 1.5rem; height: 1.5rem;
    background: rgba(196,147,78,0.08);
    border: 1px solid rgba(196,147,78,0.2);
    border-radius: 50%; color: ${PG};
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  /* Prayer sections (02, 10) */
  .prayer-html { color: rgba(255,255,255,0.68); }
  .prayer-html p {
    font-size: 14px; color: rgba(255,255,255,0.68);
    line-height: 2; margin-bottom: 0.8rem;
    text-align: center; font-style: italic;
  }
  .prayer-html strong { color: rgba(255,255,255,0.88); font-weight: 600; font-style: normal; }
  .prayer-html h3 {
    font-size: 14px; font-weight: 600;
    color: rgba(255,255,255,0.92);
    text-align: center; margin-top: 1.5rem; margin-bottom: 0.5rem;
    font-style: normal; letter-spacing: -0.01em;
  }
  .prayer-html ul, .prayer-html ol { margin-bottom: 1rem; padding-left: 1.25rem; }
  .prayer-html li {
    font-size: 14px; color: rgba(255,255,255,0.68);
    line-height: 1.85; margin-bottom: 0.4rem;
  }

  /* Passage section (04) */
  .passage-html { color: rgba(255,255,255,0.62); }
  .passage-html h3 {
    font-size: 14.5px; font-weight: 600;
    color: rgba(255,255,255,0.92);
    margin-top: 1.75rem; margin-bottom: 0.5rem; letter-spacing: -0.01em;
  }
  .passage-html p { font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.85; margin-bottom: 0.9rem; }
  .passage-html strong { color: rgba(255,255,255,0.88); font-weight: 600; }
  .passage-html a { color: ${PG}; text-underline-offset: 3px; }
  .passage-html ol {
    list-style: none; counter-reset: pass-counter; padding-left: 0; margin-bottom: 0.9rem;
  }
  .passage-html ol > li {
    counter-increment: pass-counter;
    padding-left: 2.75rem; position: relative; margin-bottom: 1.25rem;
    font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.85;
  }
  .passage-html ol > li::before {
    content: counter(pass-counter);
    position: absolute; left: 0; top: 0.2rem;
    width: 1.5rem; height: 1.5rem;
    background: rgba(196,147,78,0.08);
    border: 1px solid rgba(196,147,78,0.2);
    border-radius: 50%; color: ${PG};
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .passage-html ul { padding-left: 1.35rem; margin-bottom: 0.9rem; }
  .passage-html li { font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.85; margin-bottom: 0.4rem; }
  .passage-html blockquote {
    color: rgba(255,255,255,0.82); font-style: italic;
    border-left: 2px solid ${PG}; padding-left: 1rem; margin: 1rem 0;
  }

  /* Discussion questions (09) */
  .questions-html ol { list-style: none; counter-reset: q-counter; padding-left: 0; }
  .questions-html ol > li {
    counter-increment: q-counter;
    padding-left: 2.75rem; padding-bottom: 1.25rem; margin-bottom: 1.25rem;
    position: relative; border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.85;
  }
  .questions-html ol > li:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
  .questions-html ol > li::before {
    content: counter(q-counter);
    position: absolute; left: 0; top: 0.2rem;
    width: 1.5rem; height: 1.5rem;
    background: rgba(196,147,78,0.08);
    border: 1px solid rgba(196,147,78,0.2);
    border-radius: 50%; color: ${PG};
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .questions-html p { font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.85; margin: 0; }
  .questions-html h3 {
    font-size: 14.5px; font-weight: 600;
    color: rgba(255,255,255,0.92);
    margin-top: 0; margin-bottom: 0.35rem; letter-spacing: -0.01em;
  }

  /* Section 10 summary */
  .s10-summary { color: rgba(255,255,255,0.68); margin-bottom: 8px; }
  .s10-summary ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0; }
  .s10-summary li { font-size: 14px; color: rgba(255,255,255,0.68); line-height: 1.85; margin-bottom: 0.45rem; }
  .s10-summary li::marker { color: ${PG}; }

  /* Cross-references list */
  .cross-refs-list { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.9rem; }
  .cross-refs-list li { font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.85; margin-bottom: 0.45rem; }

  /* Section divider */
  .section-divider { height: 1px; background: rgba(255,255,255,0.07); }

  /* ── Print ── */
  @media print {
    .toc-page { break-after: page; }
    .section-page { break-before: page; }
    .footer-back { color: ${PG}; }
  }
</style>
</head>
<body>
${tocPage}
${sectionPages}
<script>
  window.addEventListener('load', function () {
    setTimeout(function () { window.print(); }, 600);
  });
</script>
</body>
</html>`;
}
