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

function UserCard({ step }: { step: Step }) {
  return (
    <div className="group relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
        style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
      />
      <div className="relative rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2.5 transition-colors duration-300 group-hover:border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/25">{step.number}</span>
          <span className="text-white/15 text-[9px]">·</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
            Your action
          </span>
        </div>
        <h3 className="text-base md:text-lg font-medium text-white/90 tracking-tight leading-snug">
          {step.title}
        </h3>
        <p className="text-sm text-white/50 font-light leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

function AiCard({ step }: { step: Step }) {
  return (
    <div className="group relative">
      {/* Hover glow */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
        style={{ boxShadow: "0 0 25px 2px rgba(214,168,95,0.45)" }}
      />
      <div
        className="relative rounded-xl border bg-black p-5 space-y-3 transition-colors duration-300 group-hover:border-[rgba(214,168,95,0.3)]"
        style={{ borderColor: "rgba(214,168,95,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/25">{step.number}</span>
          <span className="text-white/15 text-[9px]">·</span>
          <span
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: "#D6A85F", opacity: 0.65 }}
          >
            AI pipeline
          </span>
        </div>
        <h3 className="text-base md:text-lg font-medium text-white/90 tracking-tight leading-snug">
          {step.title}
        </h3>
        <p className="text-sm text-white/50 font-light leading-relaxed">
          {step.description}
        </p>
        {step.bullets.length > 0 && (
          <ul className="pt-1 space-y-2">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5">
                <span
                  className="mt-[3px] flex-shrink-0 text-xs leading-none"
                  style={{ color: "#D6A85F", opacity: 0.35 }}
                >
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
  );
}

const mainSteps = steps.filter((s) => s.type !== "result");
const resultStep = steps.find((s) => s.type === "result")!;

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-black border-t border-white/10 py-24 md:py-32 px-4 selection:bg-white/15 selection:text-white"
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Section header ── */}
        <div className="mb-16 md:mb-20 space-y-5 max-w-2xl mx-auto text-center">
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "#D6A85F" }}
          >
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white">
            This is not a chatbot.{" "}
            <span className="italic text-white/60">
              It&rsquo;s a research pipeline.
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/55 font-light leading-relaxed">
            Most AI tools are single-step. You ask, they answer. ScripturePath
            runs a multi-phase reasoning pipeline — analysis, proposal,
            verification, generation — before you see a single word.
          </p>
        </div>

        {/* ── Desktop: Two-lane timeline ── */}
        <div className="hidden lg:block">

          {/* Lane labels */}
          <div
            className="grid mb-5"
            style={{ gridTemplateColumns: "1fr 72px 1fr" }}
          >
            <div className="flex justify-end pr-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/30">
                  You
                </span>
              </div>
            </div>
            <div />
            <div className="pl-8">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#D6A85F", opacity: 0.6 }}
                />
                <span
                  className="text-[11px] font-mono uppercase tracking-widest"
                  style={{ color: "#D6A85F", opacity: 0.6 }}
                >
                  Scripture Path
                </span>
              </div>
            </div>
          </div>

          {/* Lane separator lines */}
          <div
            className="grid mb-10"
            style={{ gridTemplateColumns: "1fr 72px 1fr" }}
          >
            <div className="border-t border-white/[0.06] mr-8" />
            <div />
            <div
              className="border-t ml-8"
              style={{ borderColor: "rgba(214,168,95,0.1)" }}
            />
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Center vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white/[0.07]"
              style={{ left: "calc(50%)" }}
            />

            {mainSteps.map((step, index) => {
              const isUser = step.type === "user";
              const isLast = index === mainSteps.length - 1;

              return (
                <div key={step.number}>
                  {/* Step row */}
                  <div
                    className="grid items-start"
                    style={{ gridTemplateColumns: "1fr 72px 1fr" }}
                  >
                    {/* Left column — user steps */}
                    <div className="pr-8 flex justify-end">
                      {isUser ? (
                        <div className="w-full max-w-[340px]">
                          <UserCard step={step} />
                        </div>
                      ) : null}
                    </div>

                    {/* Center dot */}
                    <div className="flex justify-center">
                      <div
                        className="relative z-10 w-8 h-8 rounded-full bg-black flex items-center justify-center"
                        style={{
                          border: `1px solid ${
                            isUser
                              ? "rgba(255,255,255,0.15)"
                              : "rgba(214,168,95,0.25)"
                          }`,
                          backgroundColor: isUser
                            ? "black"
                            : "rgba(214,168,95,0.04)",
                        }}
                      >
                        <span className="text-[9px] font-mono text-white/30">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Right column — AI steps */}
                    <div className="pl-8">
                      {!isUser ? (
                        <div className="w-full max-w-[340px]">
                          <AiCard step={step} />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Inter-step connector */}
                  {!isLast && (
                    <div
                      className="grid"
                      style={{ gridTemplateColumns: "1fr 72px 1fr" }}
                    >
                      <div />
                      <div className="flex justify-center py-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-px h-3 bg-white/[0.07]" />
                          <span className="text-[10px] text-white/15 font-mono leading-none select-none">
                            {isUser ? "→" : "←"}
                          </span>
                          <div className="w-px h-3 bg-white/[0.07]" />
                        </div>
                      </div>
                      <div />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Result step */}
            <div className="flex flex-col items-center mt-1">
              <div className="w-px h-5 bg-white/[0.07]" />
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  border: "1px solid rgba(74,222,128,0.2)",
                  backgroundColor: "rgba(74,222,128,0.04)",
                }}
              >
                <span className="text-[9px] font-mono text-green-400/50">
                  {resultStep.number}
                </span>
              </div>
              <div className="w-px h-5 bg-white/[0.07]" />
              <div className="w-full max-w-sm">
                <div className="group relative">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
                    style={{ boxShadow: "0 0 25px 2px rgba(74,222,128,0.4)" }}
                  />
                  <div
                    className="relative rounded-xl border p-6 text-center transition-colors duration-300"
                    style={{
                      borderColor: "rgba(74,222,128,0.15)",
                      backgroundColor: "rgba(74,222,128,0.03)",
                    }}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-green-400/50">
                      Result
                    </span>
                    <h3 className="mt-2 text-xl font-medium text-white/90 tracking-tight">
                      {resultStep.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/50 font-light leading-relaxed">
                      {resultStep.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: Single column with color-coded lanes ── */}
        <div className="lg:hidden space-y-3">
          {steps.map((step) => {
            const isUser = step.type === "user";
            const isAi = step.type === "ai";
            const isResult = step.type === "result";

            const borderColor = isUser
              ? "rgba(255,255,255,0.08)"
              : isAi
              ? "rgba(214,168,95,0.15)"
              : "rgba(74,222,128,0.15)";

            const accentColor = isUser
              ? "rgba(255,255,255,0.2)"
              : isAi
              ? "#D6A85F"
              : "rgb(74,222,128)";

            const bgColor = isAi
              ? "rgba(214,168,95,0.02)"
              : isResult
              ? "rgba(74,222,128,0.03)"
              : "transparent";

            const badgeText = isUser
              ? "Your action"
              : isAi
              ? "AI pipeline"
              : "Result";

            const badgeStyle = isUser
              ? "text-white/30"
              : isResult
              ? "text-green-400/50"
              : undefined;

            return (
              <div
                key={step.number}
                className="rounded-xl border p-5 relative overflow-hidden"
                style={{ borderColor, backgroundColor: bgColor }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
                  style={{ backgroundColor: accentColor, opacity: 0.5 }}
                />

                <div className="pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-white/25">
                      {step.number}
                    </span>
                    <span className="text-white/15 text-[9px]">·</span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest ${badgeStyle ?? ""}`}
                      style={
                        !badgeStyle
                          ? { color: "#D6A85F", opacity: 0.6 }
                          : undefined
                      }
                    >
                      {badgeText}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-white/90 tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50 font-light leading-relaxed">
                    {step.description}
                  </p>
                  {step.bullets.length > 0 && (
                    <ul className="pt-1 space-y-1.5">
                      {step.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="mt-[3px] text-white/20 flex-shrink-0 text-xs leading-none">
                            →
                          </span>
                          <span className="text-xs text-white/35 font-light leading-relaxed">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
