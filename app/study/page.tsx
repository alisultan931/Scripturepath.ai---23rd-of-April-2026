"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AiLoader from "@/components/ui/ai-loader";
import { Navigation } from "@/components/ui/particle-effect-for-hero";

interface KeyFacts {
  book_date: string;
  book_date_confidence: "high" | "medium" | "cautious";
  traditional_attribution: string;
  tradition_note: string | null;
  key_figure: string;
  genre: string;
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

function KeyFactsBadge({ confidence }: { confidence: "high" | "medium" | "cautious" }) {
  const colors = {
    high: "bg-emerald-900/40 text-emerald-400 border-emerald-800/50",
    medium: "bg-amber-900/40 text-amber-400 border-amber-800/50",
    cautious: "bg-red-900/40 text-red-400 border-red-800/50",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${colors[confidence]}`}>
      {confidence}
    </span>
  );
}

function Section01({ data }: { data: StudyData["section_01"] }) {
  const { key_facts: kf, html_content } = data;
  return (
    <div className="space-y-6">
      <div
        className="study-html"
        dangerouslySetInnerHTML={{ __html: html_content }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-white/10 rounded-xl p-4 bg-white/2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Date</span>
          <span className="text-sm text-white/80">{kf.book_date}</span>
          <KeyFactsBadge confidence={kf.book_date_confidence} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Authorship</span>
          <span className="text-sm text-white/80">{kf.traditional_attribution}</span>
          {kf.tradition_note && (
            <span className="text-xs text-white/40 italic">{kf.tradition_note}</span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Key Figure</span>
          <span className="text-sm text-white/80">{kf.key_figure}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Genre</span>
          <span className="text-sm text-white/80">{kf.genre}</span>
        </div>
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Source</span>
          <a
            href={kf.passage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#D6A85F] hover:underline break-all"
          >
            {kf.passage_url}
          </a>
        </div>
      </div>
    </div>
  );
}

function HtmlSection({ html }: { html: string }) {
  return (
    <div
      className="study-html"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function StudyContent({ study, title, depth }: { study: StudyData; title: string; depth: string }) {
  const router = useRouter();
  const sections = [
    { label: SECTION_LABELS[0], content: <Section01 data={study.section_01} /> },
    { label: SECTION_LABELS[1], content: <HtmlSection html={study.section_02} /> },
    { label: SECTION_LABELS[2], content: <HtmlSection html={study.section_03} /> },
    { label: SECTION_LABELS[3], content: <HtmlSection html={study.section_04} /> },
    { label: SECTION_LABELS[4], content: <HtmlSection html={study.section_05} /> },
    { label: SECTION_LABELS[5], content: <HtmlSection html={study.section_06} /> },
    { label: SECTION_LABELS[6], content: <HtmlSection html={study.section_07} /> },
    { label: SECTION_LABELS[7], content: <HtmlSection html={study.section_08} /> },
    { label: SECTION_LABELS[8], content: <HtmlSection html={study.section_09} /> },
    { label: SECTION_LABELS[9], content: <HtmlSection html={study.section_10} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation showNavLinks={false} />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="text-white/40 hover:text-white/70 text-sm transition-colors mb-6 flex items-center gap-1.5"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border"
              style={
                depth === "deep_dive"
                  ? { color: "#D6A85F", background: "rgba(214,168,95,0.1)", borderColor: "rgba(214,168,95,0.3)" }
                  : { color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" }
              }
            >
              {depth === "deep_dive" ? "Deep Dive" : "Normal"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight tracking-tight">
            {title}
          </h1>
        </div>

        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={i} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{ color: "#D6A85F", background: "rgba(214,168,95,0.1)", border: "1px solid rgba(214,168,95,0.2)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-semibold text-white/90 tracking-tight">{s.label}</h2>
              </div>
              <div className="border-l-2 pl-6" style={{ borderColor: "rgba(214,168,95,0.2)" }}>
                {s.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudyPageInner() {
  const searchParams = useSearchParams();
  const [study, setStudy] = useState<StudyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = searchParams.get("title") ?? "";
  const passage = searchParams.get("passage") ?? "";
  const description = searchParams.get("description") ?? "";
  const theme = searchParams.get("theme") ?? "";
  const audience = searchParams.get("audience") ?? "";
  const tone = searchParams.get("tone") ?? "";
  const depth = searchParams.get("depth") ?? "normal";

  useEffect(() => {
    if (!passage) return;
    fetch("/api/generate-study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, passage, description, theme, audience, tone, depth }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudy(data as StudyData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to generate study"));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-[#D6A85F] hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!study) return <AiLoader />;

  return <StudyContent study={study} title={title} depth={depth} />;
}

export default function StudyPage() {
  return (
    <Suspense fallback={<AiLoader />}>
      <StudyPageInner />
    </Suspense>
  );
}
