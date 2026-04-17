"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Tag,
  User,
  Calendar,
  Users,
  Sparkles,
  Clock,
} from "lucide-react";
import AiLoader from "@/components/ui/ai-loader";
import { Navigation } from "@/components/ui/particle-effect-for-hero";

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

function FactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-2 w-32 flex-shrink-0 pt-0.5">
        <span className="text-white/30 flex-shrink-0 mt-px">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35 leading-tight">
          {label}
        </span>
      </div>
      <div className="flex-1 text-sm text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

function Section01({ data, passage }: { data: StudyData["section_01"]; passage: string }) {
  const { key_facts: kf, html_content } = data;
  const genres = kf.genre.split(/[|,/]/).map((g) => g.trim()).filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02] flex gap-3">
        <BookOpen size={18} className="text-[#D6A85F]/60 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[#D6A85F] font-semibold text-sm leading-snug mb-1">
            {passage}
          </p>
          <p className="text-xs text-white/35 leading-snug">
            {kf.book_display}
            {genres.length > 0 && (
              <> &middot; {genres.join(" | ")}</>
            )}
          </p>
        </div>
      </div>

      {/* Big Story */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
          The Big Story
        </p>
        <div
          className="text-sm text-white/65 leading-relaxed [&>p]:m-0"
          dangerouslySetInnerHTML={{ __html: html_content }}
        />
      </div>

      {/* Fact rows */}
      <div className="border border-white/8 rounded-xl px-4 bg-white/[0.015]">
        <FactRow icon={<BookOpen size={13} />} label="Book">
          {kf.book_display}
        </FactRow>
        <FactRow icon={<Tag size={13} />} label="Genre">
          <div className="flex flex-wrap gap-1.5">
            {genres.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded text-xs text-[#D6A85F] border"
                style={{ background: "rgba(214,168,95,0.08)", borderColor: "rgba(214,168,95,0.25)" }}
              >
                {g}
              </span>
            ))}
          </div>
        </FactRow>
        <FactRow icon={<User size={13} />} label="Author">
          {kf.traditional_attribution}
          {kf.tradition_note && (
            <span className="text-white/40 italic"> — {kf.tradition_note}</span>
          )}
        </FactRow>
        <FactRow icon={<Calendar size={13} />} label="Date">
          <span
            className="inline rounded px-1.5 py-0.5 text-white/80"
            style={{ background: "rgba(180,120,30,0.18)" }}
          >
            {kf.book_date}
          </span>
        </FactRow>
        <FactRow icon={<Users size={13} />} label="Key Figures">
          {kf.key_figure}
        </FactRow>
        <FactRow icon={<Sparkles size={13} />} label="Key Theme">
          {kf.key_theme}
        </FactRow>
        <FactRow icon={<Clock size={13} />} label="Read Time">
          {kf.read_time}
        </FactRow>
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

function StudyContent({ study, title, passage, depth }: { study: StudyData; title: string; passage: string; depth: string }) {
  const router = useRouter();
  const sections = [
    { label: SECTION_LABELS[0], content: <Section01 data={study.section_01} passage={passage} /> },
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

  return <StudyContent study={study} title={title} passage={passage} depth={depth} />;
}

export default function StudyPage() {
  return (
    <Suspense fallback={<AiLoader />}>
      <StudyPageInner />
    </Suspense>
  );
}
