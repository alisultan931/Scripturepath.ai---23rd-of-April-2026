"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, User, Calendar, Users, Sparkles, Clock } from "lucide-react";
import AiLoader from "@/components/ui/ai-loader";
import { Navigation } from "@/components/ui/particle-effect-for-hero";

// ── Types ──────────────────────────────────────────────────────────────────────
interface KeyFacts {
  book_date: string;
  book_date_confidence: "high" | "medium" | "cautious";
  traditional_attribution: string;
  tradition_note: string | null;
  key_figure: string;
  genre: string;
  book_display: string;
  key_theme: string;
  read_time: string;
  source_label: string;
  passage_url: string;
}
interface StudyData {
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

// ── Design tokens ──────────────────────────────────────────────────────────────
const H   = "rgba(255,255,255,0.92)";   // all headings — one color
const B   = "rgba(255,255,255,0.62)";   // body text
const M   = "rgba(255,255,255,0.35)";   // muted / labels
const G   = "#C4934E";                  // gold accent
const GB  = "rgba(196,147,78,0.12)";    // gold bg tint
const GBD = "rgba(196,147,78,0.22)";    // gold border
const DIV = "rgba(255,255,255,0.07)";   // divider / card border
const CBG = "#161616";                  // card background
const PBG = "#0D0D0D";                  // page background

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

// ── Shared card shell ──────────────────────────────────────────────────────────
function SectionCard({
  index, label, children, cardRef, dataAttr,
}: {
  index: number;
  label: string;
  children: React.ReactNode;
  cardRef?: (el: HTMLDivElement | null) => void;
  dataAttr?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      id={`section-${index}`}
      data-section-index={dataAttr}
      ref={cardRef}
      className="rounded-2xl scroll-mt-24"
      style={{
        background: CBG,
        border: `1px solid ${hovered ? "rgba(196,147,78,0.45)" : DIV}`,
        boxShadow: hovered ? "0 0 28px 4px rgba(196,147,78,0.15), 0 0 8px 1px rgba(196,147,78,0.1)" : "none",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card header */}
      <div className="px-8 pt-7 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${G}99` }}>
          {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="text-[1.1rem] font-semibold tracking-tight leading-snug" style={{ color: H }}>
          {label}
        </h2>
      </div>
      {/* Divider */}
      <div style={{ height: "1px", background: DIV }} />
      {/* Content */}
      <div className="px-8 py-7">
        {children}
      </div>
    </div>
  );
}

// ── Section 01: At a Glance ────────────────────────────────────────────────────
// Purpose: instant orientation — passage, big story, key facts.
function Section01({ data, passage }: { data: StudyData["section_01"]; passage: string }) {
  const { key_facts: kf, html_content } = data;
  const genres = kf.genre.split(/[|,/]/).map((g) => g.trim()).filter(Boolean);

  return (
    <div>
      {/* Passage + genre row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ color: G, background: GB, border: `1px solid ${GBD}` }}>
          <BookOpen size={12} />
          {passage}
        </span>
        {genres.map((g) => (
          <span key={g} className="text-xs px-2.5 py-1 rounded-lg"
            style={{ color: M, background: "rgba(255,255,255,0.04)", border: `1px solid ${DIV}` }}>
            {g}
          </span>
        ))}
      </div>

      {/* Big Story */}
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2.5" style={{ color: M }}>
          The Big Story
        </p>
        <div className="[&>p]:m-0 text-[0.9375rem] leading-[1.85]" style={{ color: B }}
          dangerouslySetInnerHTML={{ __html: html_content }} />
      </div>

      {/* Key facts — label / value rows */}
      <div style={{ borderTop: `1px solid ${DIV}` }}>
        {[
          { icon: <User size={12} />, label: "Author", value: (
            <>{kf.traditional_attribution}
              {kf.tradition_note && <span className="italic ml-1" style={{ color: M }}>— {kf.tradition_note}</span>}
            </>
          )},
          { icon: <Calendar size={12} />, label: "Date", value: kf.book_date },
          { icon: <Users size={12} />, label: "Key Figures", value: kf.key_figure },
          { icon: <Sparkles size={12} />, label: "Key Theme", value: kf.key_theme },
          { icon: <Clock size={12} />, label: "Read Time", value: kf.read_time },
        ].map(({ icon, label, value }, i, arr) => (
          <div key={label} className="flex gap-5 py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? `1px solid ${DIV}` : undefined }}>
            <div className="flex items-center gap-2 w-28 shrink-0">
              <span style={{ color: `${G}66` }}>{icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: M }}>
                {label}
              </span>
            </div>
            <div className="flex-1 text-[0.9375rem]" style={{ color: B }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section 02 & 10: Prayer ────────────────────────────────────────────────────
// Purpose: set heart posture. Centered, italic — intimate reading experience.
function PrayerSection({ html, label }: { html: string; label?: string }) {
  return (
    <div>
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-5" style={{ color: M }}>
          {label}
        </p>
      )}
      {/* Centered prayer text in a constrained column */}
      <div className="max-w-md mx-auto">
        <div className="prayer-html" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

// ── Section 10: Summary & Closing Prayer ──────────────────────────────────────
function Section10({ html }: { html: string }) {
  const ulMatch   = html.match(/(<ul>[\s\S]*?<\/ul>)/i);
  const bqMatch   = html.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
  const summaryHtml  = ulMatch  ? ulMatch[1]  : "";
  const takeawayText = bqMatch  ? bqMatch[1]  : "";
  const prayerHtml   = html
    .replace(/<ul>[\s\S]*?<\/ul>/i, "")
    .replace(/<blockquote>[\s\S]*?<\/blockquote>/i, "")
    .trim();

  return (
    <div>
      {/* Summary bullets */}
      {summaryHtml && (
        <div className="s10-summary" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      )}

      {/* "If you remember one thing…" callout */}
      {takeawayText && (
        <div className="flex gap-3 rounded-xl px-5 py-4 my-7"
          style={{ background: GB, border: `1px solid ${GBD}` }}>
          <span className="text-lg leading-none mt-0.5 shrink-0" style={{ color: G }}>✦</span>
          <p className="text-[0.9375rem] leading-relaxed italic m-0" style={{ color: H }}>
            {takeawayText}
          </p>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: "1px", background: DIV, margin: "1.75rem 0" }} />

      {/* Closing prayer */}
      {prayerHtml && (
        <div className="max-w-md mx-auto">
          <div className="prayer-html" dangerouslySetInnerHTML={{ __html: prayerHtml }} />
        </div>
      )}
    </div>
  );
}

// ── Section 03, 06, 07, 08: Standard prose ────────────────────────────────────
// Purpose: informational or reflective prose with h3 subheadings.
function ProseSection({ html, className }: { html: string; className?: string }) {
  return <div className={`study-html${className ? ` ${className}` : ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Section 04: Read the Passage ──────────────────────────────────────────────
// Purpose: guided reading plan. Has passage reference, 3-pass approach, key verses.
// The API returns h3 for the passage name, ol for the 3-pass plan, p for intros.
function PassageSection({ html }: { html: string }) {
  return (
    <div>
      {/* Prompt banner */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 mb-6"
        style={{ background: GB, border: `1px solid ${GBD}` }}>
        <BookOpen size={14} style={{ color: G }} className="shrink-0" />
        <p className="text-[0.8125rem] leading-snug" style={{ color: B }}>
          Read the passage in your Bible before beginning. Links are provided in the guide below.
        </p>
      </div>
      <div className="passage-html" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ── Section 05: Key Observations ──────────────────────────────────────────────
// Purpose: what the text says — pure observation, no interpretation.
// Uses amber numbered badges (obs-section CSS class).
function ObservationsSection({ html }: { html: string }) {
  return (
    <div>
      <p className="text-[0.8125rem] mb-5 leading-relaxed" style={{ color: M }}>
        What does the text actually say? These observations are drawn directly from the passage — no interpretation yet.
      </p>
      <div className="study-html obs-section" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ── Section 09: Discussion Questions ──────────────────────────────────────────
// Purpose: group or personal reflection. Each question is clearly numbered.
function QuestionsSection({ html }: { html: string }) {
  return (
    <div>
      <p className="text-[0.8125rem] mb-6 leading-relaxed" style={{ color: M }}>
        Use these questions for personal reflection or group discussion.
      </p>
      <div className="questions-html" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ── TOC ────────────────────────────────────────────────────────────────────────
function TableOfContents({ active }: { active: number }) {
  const go = (i: number) =>
    document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const progress = Math.round(((active + 1) / SECTION_LABELS.length) * 100);

  return (
    <nav className="sticky top-24 w-52 shrink-0 hidden xl:block self-start">

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: M }}>
          In This Study
        </span>
        <span className="text-[9px] font-semibold tabular-nums" style={{ color: G }}>
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-px w-full mb-5 rounded-full overflow-hidden" style={{ background: DIV }}>
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${G}66, ${G})` }}
        />
      </div>

      {/* Track + items */}
      <div className="relative">
        {/* Vertical track */}
        <div
          className="absolute top-[9px] bottom-[9px] w-px"
          style={{ left: "5px", background: `linear-gradient(to bottom, ${G}50 0%, ${G}50 ${progress}%, ${DIV} ${progress}%, ${DIV} 100%)`, transition: "background 0.5s ease-out" }}
        />

        <ul>
          {SECTION_LABELS.map((label, i) => {
            const on = active === i;
            const done = i < active;

            return (
              <li key={i}>
                <button
                  onClick={() => go(i)}
                  className="flex items-start gap-3 w-full text-left py-[7px] group"
                >
                  {/* Dot */}
                  <div className="relative shrink-0 flex items-center justify-center" style={{ width: 11, height: 11, marginTop: 3 }}>
                    {on && (
                      <div
                        className="absolute rounded-full"
                        style={{ inset: -4, background: `${G}18`, boxShadow: `0 0 8px ${G}40` }}
                      />
                    )}
                    <div
                      className="rounded-full relative z-10 transition-all duration-300"
                      style={{
                        width: on ? 7 : done ? 5 : 5,
                        height: on ? 7 : done ? 5 : 5,
                        background: on ? G : done ? `${G}70` : `rgba(255,255,255,0.13)`,
                        boxShadow: on ? `0 0 5px ${G}90` : "none",
                        outline: on ? `none` : done ? `none` : `1.5px solid rgba(255,255,255,0.12)`,
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <span
                      className="text-[9px] font-bold tabular-nums shrink-0 transition-colors duration-200"
                      style={{ color: on ? `${G}99` : done ? `${G}55` : "rgba(255,255,255,0.15)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[0.71rem] leading-snug transition-all duration-200"
                      style={{
                        color: on ? H : done ? B : M,
                        fontWeight: on ? 500 : 400,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

// ── Study layout ───────────────────────────────────────────────────────────────
function StudyContent({ study, title, passage, description, depth }: {
  study: StudyData; title: string; passage: string; description: string; depth: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = e.target.getAttribute("data-section-index");
            if (i !== null) setActive(parseInt(i, 10));
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    refs.current.forEach((r) => { if (r) obs.observe(r); });
    return () => obs.disconnect();
  }, []);

  // Each entry: [section component]
  const sections: React.ReactNode[] = [
    <Section01 data={study.section_01} passage={passage} />,
    <PrayerSection html={study.section_02} />,
    <ProseSection html={study.section_03} className="context-section" />,
    <PassageSection html={study.section_04} />,
    <ObservationsSection html={study.section_05} />,
    <ProseSection html={study.section_06
      .replace(/(<h3>)(Takeaway\s+\d+:)/gi, `$1<span style="color:${G}">$2</span>`)
      .replace(/(<h3>)(Cross-References)(<\/h3>)/gi, `$1<span style="color:${G}">$2</span>$3`)
      .replace(/(<h3>(?:<span[^>]*>)?Cross-References(?:<\/span>)?<\/h3>)\s*(<ul>)/gi, `$1<ul class="cross-refs-list">`)
    } />,
    <ProseSection html={study.section_07} />,
    <ProseSection html={study.section_08
      .replace(/(<h3>)(Application\s+\d+:)/gi, `$1<span style="color:${G}">$2</span>`)
      .replace(/(<h3>)(Accountability Suggestion)(<\/h3>)/gi, `$1<span style="color:${G}">$2</span>$3`)} />,
    <QuestionsSection html={study.section_09} />,
    <Section10 html={study.section_10} />,
  ];

  return (
    <div className="min-h-screen" style={{ background: PBG }}>
      <Navigation showNavLinks={false} />

      <div className="max-w-245 mx-auto px-6 pt-24 pb-28 flex gap-14 items-start">

        {/* ── Main column ── */}
        <div className="flex-1 min-w-0">

          {/* Page header — NOT a card, lives above the cards */}
          <div className="mb-10">
            <button
              onClick={() => router.back()}
              className="text-xs font-medium mb-8 flex items-center gap-1.5 transition-colors duration-150"
              style={{ color: M }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = B)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = M)}
            >
              ← Back
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={depth === "deep_dive"
                  ? { color: G, background: GB, border: `1px solid ${GBD}` }
                  : { color: M, background: "rgba(255,255,255,0.04)", border: `1px solid ${DIV}` }}>
                {depth === "deep_dive" ? "Deep Dive" : "Normal"}
              </span>
              {passage && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ color: `${G}CC`, background: GB, border: `1px solid ${GBD}` }}>
                  <BookOpen size={10} />
                  {passage}
                </span>
              )}
            </div>

            <h1 className="text-[2.25rem] md:text-[2.6rem] font-semibold leading-[1.1] tracking-tight mb-3"
              style={{ color: H }}>
              {title}
            </h1>

            {description && (
              <p className="text-sm italic leading-relaxed" style={{ color: M }}>
                {description}
              </p>
            )}
          </div>

          {/* Section cards */}
          <div className="space-y-4">
            {sections.map((content, i) => (
              <SectionCard
                key={i}
                index={i}
                label={SECTION_LABELS[i]}
                dataAttr={String(i)}
                cardRef={(el) => { refs.current[i] = el; }}
              >
                {content}
              </SectionCard>
            ))}
          </div>
        </div>

        {/* ── TOC ── */}
        <TableOfContents active={active} />
      </div>
    </div>
  );
}

// ── Page shell ─────────────────────────────────────────────────────────────────
function StudyPageInner() {
  const searchParams = useSearchParams();
  const [study, setStudy] = useState<StudyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title       = searchParams.get("title")       ?? "";
  const passage     = searchParams.get("passage")     ?? "";
  const description = searchParams.get("description") ?? "";
  const theme       = searchParams.get("theme")       ?? "";
  const audience    = searchParams.get("audience")    ?? "";
  const tone        = searchParams.get("tone")        ?? "";
  const depth       = searchParams.get("depth")       ?? "normal";

  useEffect(() => {
    if (!passage) return;
    const controller = new AbortController();
    fetch("/api/generate-study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, passage, description, theme, audience, tone, depth }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudy(data as StudyData);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to generate study");
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PBG }}>
        <div className="text-center space-y-4">
          <p style={{ color: M }}>{error}</p>
          <button onClick={() => window.history.back()} className="text-sm hover:underline" style={{ color: G }}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!study) return <AiLoader />;
  return <StudyContent study={study} title={title} passage={passage} description={description} depth={depth} />;
}

export default function StudyPage() {
  return (
    <Suspense fallback={<AiLoader />}>
      <StudyPageInner />
    </Suspense>
  );
}
