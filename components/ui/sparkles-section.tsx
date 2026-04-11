"use client";

import { SparklesCore } from "@/components/sparkles-parts/sparkles";

export default function SparklesSection() {
  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden bg-black pb-20">

      <p className="text-xs uppercase tracking-widest text-white/60 mb-6 relative z-20 pt-16">
        What&apos;s inside every study
      </p>

      <h1 className="md:text-6xl text-3xl lg:text-7xl font-bold text-white relative z-20 text-center leading-tight">
        Weeks of research.
        <br />
        <span className="italic text-white/60">Minutes of reading.</span>
      </h1>

      <p className="mt-6 max-w-md text-center text-white/60 text-sm leading-relaxed relative z-20 px-4">
        Imagine a research assistant who has read every commentary, lexicon, and
        theological text — and synthesized it for your specific passage, in seconds.
      </p>

      <div
        className="w-160 h-64 relative"
        style={{
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 0%, black 40%, transparent 100%)",
        }}
      >
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Glow line */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
      </div>

      {/* Cards */}
      <div className="relative z-20 w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* Card 1 */}
        <div className="group relative">
          {/* Outer glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
          />
          {/* Card */}
          <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md p-6 transition-all duration-300 group-hover:border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white/40 text-lg">✦</span>
              <h3 className="text-white/90 font-semibold text-base">What your AI assistant prepares</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Cross-references biblical commentaries and scholarly sources",
                "Analyzes original Hebrew and Greek word meanings",
                "Maps historical and cultural context of the passage",
                "Traces the theological theme across the full canon",
                "Identifies Christ-typologies and redemptive connections",
                "Structures verse-by-verse exposition with doctrinal accuracy",
                "Generates discussion questions at multiple depth levels",
                "Applies strict guardrails — no speculation as Scripture",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-white/50 text-sm">
                  <span className="mt-0.5 text-white/25 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative">
          {/* Outer glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
          />
          {/* Card */}
          <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md p-6 transition-all duration-300 group-hover:border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/40 text-lg">⚇</span>
              <h3 className="text-white/90 font-semibold text-base">What only you can bring</h3>
            </div>
            <p className="text-white/50 text-sm mb-4">
              ScripturePath handles the scholarship. You bring what no AI can replace.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "Your theological conviction and pastoral voice",
                "Deep knowledge of your congregation's needs",
                "The Holy Spirit's guidance in your study",
                "Years of lived faith and ministry experience",
                "The discernment to apply truth to real lives",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-white/50 text-sm">
                  <span className="mt-0.5 text-white/25 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/30 text-sm italic border-t border-white/10 pt-4">
              &ldquo;ScripturePath doesn&apos;t replace the pastor. It gives the pastor hours back — to pray, to counsel, to be present with their people.&rdquo;
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}