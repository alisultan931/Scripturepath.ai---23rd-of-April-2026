"use client";

import React from "react";

type StepType = "user" | "ai" | "result";

interface Step {
  number: string;
  type: StepType;
  title: string;
  description: string;
  bullets: string[];
}

const steps: Step[] = [
  {
    number: "01",
    type: "user",
    title: "Describe your study",
    description:
      "Enter a passage, verse, topic, or theological question. Choose your audience and tone.",
    bullets: [],
  },
  {
    number: "02",
    type: "ai",
    title: "Context analysis & proposal",
    description:
      "Before writing a single word, the AI performs deep contextual research.",
    bullets: [
      "Scripture genre identification (narrative, epistle, prophecy...)",
      "Historical & cultural background research",
      "Author, audience, and literary structure analysis",
      "Cross-passage harmony and key verse selection",
      "Theological tradition mapping for balanced interpretation",
    ],
  },
  {
    number: "03",
    type: "user",
    title: "Review the proposal",
    description:
      "You receive a structured study outline before generation begins. Inspect the title, passage, theme, audience, and key verses. Edit or approve — you are always in control.",
    bullets: [],
  },
  {
    number: "04",
    type: "ai",
    title: "Deep research & generation",
    description:
      "Multi-step extended reasoning builds each section sequentially with strict quality gates.",
    bullets: [
      "Theological claim verification against Scripture",
      "Word study cross-referencing (original language context)",
      "Doctrinal guardrails enforced at every step",
      "Christ-centered framework applied across all 10 sections",
      "Confidence markers on all historical claims",
      "Each section validated before the next begins",
    ],
  },
  {
    number: "05",
    type: "result",
    title: "Your complete study — ready to teach",
    description:
      "A thorough, structured 10-section study. Export as PDF, save to your library, or start immediately.",
    bullets: [],
  },
];

const typeConfig: Record<
  StepType,
  { label: string; badgeClass: string; dotBorder: string; dotBg: string }
> = {
  user: {
    label: "Your action",
    badgeClass: "text-white/40",
    dotBorder: "border border-white/20",
    dotBg: "bg-transparent",
  },
  ai: {
    label: "AI pipeline",
    badgeClass: "text-white/55",
    dotBorder: "border border-white/25",
    dotBg: "bg-white/[0.08]",
  },
  result: {
    label: "Result",
    badgeClass: "text-white/70",
    dotBorder: "border border-white/30",
    dotBg: "bg-white/[0.15]",
  },
};

const legendItems: { type: StepType; label: string }[] = [
  { type: "user", label: "Your action" },
  { type: "ai", label: "AI pipeline — extended reasoning" },
  { type: "result", label: "Final output" },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-black border-t border-white/10 py-24 md:py-32 px-4 selection:bg-white/15 selection:text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 lg:gap-24">

        {/* Left column — sticky */}
        <div className="lg:sticky lg:top-32 lg:self-start space-y-10">
          <div className="space-y-5">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
              How It Works
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white">
              This is not a chatbot.{" "}
              <span className="italic text-white/60">
                It&rsquo;s a research pipeline.
              </span>
            </h2>

            <div className="space-y-3 max-w-sm">
              <p className="text-base md:text-lg text-white/60 font-light leading-relaxed">
                Most AI tools are single-step. You ask, they answer.
                ScripturePath runs a multi-phase reasoning pipeline — analysis,
                proposal, verification, generation — before you see a single
                word.
              </p>
              <p className="text-sm text-white/40 font-light leading-relaxed">
                You have a review checkpoint before full generation. You are
                always in control.
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 pt-2">
            {legendItems.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeConfig[item.type].dotBorder} ${typeConfig[item.type].dotBg}`}
                />
                <span className="text-xs font-light text-white/35 leading-none">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — steps */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            aria-hidden="true"
            className="absolute left-[13px] top-6 bottom-6 w-px bg-white/[0.07]"
          />

          <div>
            {steps.map((step, index) => {
              const config = typeConfig[step.type];
              const isLast = index === steps.length - 1;
              const isAi = step.type === "ai";

              return (
                <div
                  key={step.number}
                  className={`relative flex gap-5 ${isLast ? "" : "pb-8"}`}
                >
                  {/* Dot indicator */}
                  <div
                    className={`relative z-10 flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-black flex items-center justify-center ${config.dotBorder} ${config.dotBg}`}
                  >
                    <span className="text-[9px] font-mono text-white/35 leading-none">
                      {step.number}
                    </span>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    {isAi ? (
                      /* AI pipeline — card treatment */
                      <div className="group relative">

  {/* OUTER GLOW (STRICTLY OUTSIDE) */}
  <div
    aria-hidden="true"
    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"
    style={{
      boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)",
    }}
  />

  {/* CARD */}
  <div className="relative rounded-xl border border-white/[0.08] bg-black p-5 space-y-3 transition-all duration-300 group-hover:border-white/20">

    <span className={`text-[10px] font-mono uppercase tracking-widest ${config.badgeClass}`}>
      {config.label}
    </span>

    <h3 className="text-lg md:text-xl font-medium text-white/90 tracking-tight leading-snug">
      {step.title}
    </h3>

    <p className="text-sm text-white/55 font-light leading-relaxed">
      {step.description}
    </p>

    {step.bullets.length > 0 && (
      <ul className="pt-1 space-y-2">
        {step.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5">
            <span className="mt-[3px] text-white/20 flex-shrink-0 text-xs leading-none">
              →
            </span>
            <span className="text-sm text-white/40 font-light leading-relaxed">
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    )}

  </div>
</div>
                    ) : (
                      /* User action / Result — plain treatment */
                      <div className="space-y-2 pt-0.5 pb-1">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-widest ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>
                        <h3 className="text-lg md:text-xl font-medium text-white/90 tracking-tight leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-sm text-white/55 font-light leading-relaxed max-w-sm">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
