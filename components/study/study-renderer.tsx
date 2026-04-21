"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, User, Calendar, Users, Sparkles, Clock } from "lucide-react";
import { Navigation } from "@/components/ui/particle-effect-for-hero";

// ── Design tokens ──────────────────────────────────────────────────────────────
export const H   = "rgba(255,255,255,0.92)";
export const B   = "rgba(255,255,255,0.62)";
export const M   = "rgba(255,255,255,0.35)";
export const G   = "#C4934E";
export const GB  = "rgba(196,147,78,0.12)";
export const GBD = "rgba(196,147,78,0.22)";
export const DIV = "rgba(255,255,255,0.07)";
export const CBG = "#161616";
export const PBG = "#0D0D0D";

export const SECTION_LABELS = [
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

// ── Types ──────────────────────────────────────────────────────────────────────
export interface KeyFacts {
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

export interface StudyData {
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

// ── Shared card shell ──────────────────────────────────────────────────────────
export function SectionCard({
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
      <div className="px-8 pt-7 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${G}99` }}>
          {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="text-[1.1rem] font-semibold tracking-tight leading-snug" style={{ color: H }}>
          {label}
        </h2>
      </div>
      <div style={{ height: "1px", background: DIV }} />
      <div className="px-8 py-7">
        {children}
      </div>
    </div>
  );
}

// ── Section 01: At a Glance ────────────────────────────────────────────────────
export function Section01({ data, passage }: { data: StudyData["section_01"]; passage: string }) {
  const { key_facts: kf, html_content } = data;
  const genres = kf.genre.split(/[|,/]/).map((g) => g.trim()).filter(Boolean);

  return (
    <div>
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

      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2.5" style={{ color: M }}>
          The Big Story
        </p>
        <div className="[&>p]:m-0 text-[0.9375rem] leading-[1.85]" style={{ color: B }}
          dangerouslySetInnerHTML={{ __html: html_content }} />
      </div>

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
export function PrayerSection({ html, label }: { html: string; label?: string }) {
  return (
    <div>
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-5" style={{ color: M }}>
          {label}
        </p>
      )}
      <div className="max-w-md mx-auto">
        <div className="prayer-html" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

// ── Section 10: Summary & Closing Prayer ──────────────────────────────────────
export function Section10({ html }: { html: string }) {
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
      {summaryHtml && (
        <div className="s10-summary" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      )}
      {takeawayText && (
        <div className="flex gap-3 rounded-xl px-5 py-4 my-7"
          style={{ background: GB, border: `1px solid ${GBD}` }}>
          <span className="text-lg leading-none mt-0.5 shrink-0" style={{ color: G }}>✦</span>
          <p className="text-[0.9375rem] leading-relaxed italic m-0" style={{ color: H }}>
            {takeawayText}
          </p>
        </div>
      )}
      <div style={{ height: "1px", background: DIV, margin: "1.75rem 0" }} />
      {prayerHtml && (
        <div className="max-w-md mx-auto">
          <div className="prayer-html" dangerouslySetInnerHTML={{ __html: prayerHtml }} />
        </div>
      )}
    </div>
  );
}

// ── Section 03, 06, 07, 08: Standard prose ────────────────────────────────────
export function ProseSection({ html, className }: { html: string; className?: string }) {
  return <div className={`study-html${className ? ` ${className}` : ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Section 04: Read the Passage ──────────────────────────────────────────────
export function PassageSection({ html }: { html: string }) {
  return (
    <div>
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
export function ObservationsSection({ html }: { html: string }) {
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
export function QuestionsSection({ html }: { html: string }) {
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
export function TableOfContents({ active }: { active: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const go = (i: number) =>
    document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const progress = Math.round(((active + 1) / SECTION_LABELS.length) * 100);

  return (
    <nav className="sticky top-24 w-52 shrink-0 hidden xl:block self-start">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: M }}>
          In This Study
        </span>
        <span className="text-[9px] font-semibold tabular-nums" style={{ color: G }}>
          {progress}%
        </span>
      </div>

      <div className="h-px w-full mb-5 rounded-full overflow-hidden" style={{ background: DIV }}>
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${G}66, ${G})` }}
        />
      </div>

      <div className="relative">
        <div
          className="absolute top-[9px] bottom-[9px] w-px"
          style={{ left: "5px", background: `linear-gradient(to bottom, ${G}50 0%, ${G}50 ${progress}%, ${DIV} ${progress}%, ${DIV} 100%)`, transition: "background 0.5s ease-out" }}
        />
        <ul>
          {SECTION_LABELS.map((label, i) => {
            const on = active === i;
            const done = i < active;
            const isHovered = hovered === i;

            return (
              <li key={i}>
                <button
                  onClick={() => go(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-start gap-3 w-full text-left py-[7px] relative"
                  style={{ outline: "none" }}
                >
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      background: `radial-gradient(ellipse at 20% 50%, ${G}14 0%, transparent 70%)`,
                      boxShadow: isHovered ? `inset 0 0 0 1px ${G}20` : "none",
                      transition: "opacity 0.18s ease, box-shadow 0.18s ease",
                    }}
                  />
                  <div className="relative shrink-0 flex items-center justify-center" style={{ width: 11, height: 11, marginTop: 3 }}>
                    {on && (
                      <div className="absolute rounded-full" style={{ inset: -4, background: `${G}18`, boxShadow: `0 0 8px ${G}40` }} />
                    )}
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: -5,
                        background: `${G}00`,
                        boxShadow: isHovered ? `0 0 10px 3px ${G}35` : "none",
                        transition: "box-shadow 0.18s ease",
                      }}
                    />
                    <div
                      className="rounded-full relative z-10"
                      style={{
                        width: isHovered ? 8 : on ? 7 : 5,
                        height: isHovered ? 8 : on ? 7 : 5,
                        background: isHovered ? G : on ? G : done ? `${G}70` : `rgba(255,255,255,0.13)`,
                        boxShadow: isHovered ? `0 0 8px ${G}, 0 0 16px ${G}70` : on ? `0 0 5px ${G}90` : "none",
                        outline: isHovered || on || done ? "none" : `1.5px solid rgba(255,255,255,0.12)`,
                        transition: "width 0.18s ease, height 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
                      }}
                    />
                  </div>
                  <div
                    className="flex-1 min-w-0 flex items-baseline gap-2"
                    style={{ transform: isHovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.18s ease" }}
                  >
                    <span
                      className="text-[9px] font-bold tabular-nums shrink-0"
                      style={{ color: isHovered ? G : on ? `${G}99` : done ? `${G}55` : "rgba(255,255,255,0.15)", transition: "color 0.18s ease" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[0.71rem] leading-snug"
                      style={{
                        color: isHovered ? H : on ? H : done ? B : M,
                        fontWeight: isHovered || on ? 500 : 400,
                        textShadow: isHovered ? `0 0 12px ${G}50` : "none",
                        transition: "color 0.18s ease, font-weight 0.18s ease, text-shadow 0.18s ease",
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
export function StudyContent({ study, title, passage, description, depth, backHref }: {
  study: StudyData;
  title: string;
  passage: string;
  description: string;
  depth: string;
  backHref?: string;
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
        <div className="flex-1 min-w-0">
          <div className="mb-10">
            <button
              onClick={() => backHref ? router.push(backHref) : router.back()}
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

        <TableOfContents active={active} />
      </div>
    </div>
  );
}
