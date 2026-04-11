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

      {/* 10-Section Study Format */}
      <div className="relative z-20 w-full max-w-3xl px-4 mt-24">
        <p className="text-xs uppercase tracking-widest text-white/40 text-center mb-10">
          The 10-Section Study Format
        </p>

        <div className="flex flex-col gap-1.5">
          {[
            { n: "01", title: "At a Glance",          badge: "Overview",        desc: "Passage, book, genre, key figures, and theological context summarized before you read a single verse." },
            { n: "02", title: "Opening Prayer",        badge: "Devotional",      desc: "A Christ-addressed prayer for illumination — theologically grounded, not generic spirituality." },
            { n: "03", title: "Historical Context",    badge: "Scholarship",     desc: "Author, audience, date, cultural setting, and the occasion behind the writing — sourced, not guessed." },
            { n: "04", title: "Passage Walkthrough",   badge: "Exposition",      desc: "Verse-by-verse exposition with ESV text inline. Every claim tied to the text, not imported from outside." },
            { n: "05", title: "Key Observations",      badge: "Analysis",        desc: "Theological themes, repeated motifs, literary structure, and intertextual echoes identified by the AI." },
            { n: "06", title: "Key Takeaways",         badge: "Doctrine",        desc: "Doctrinal truths that reshape belief and behavior — rooted in the passage, not in motivational culture." },
            { n: "07", title: "Christ Connection",     badge: "Gospel-Centered", desc: "Typological and redemptive threads that point to the person and work of Jesus. Always present." },
            { n: "08", title: "Life Application",      badge: "Pastoral",        desc: "Practical application grounded in the text itself — no pop psychology, no cultural import." },
            { n: "09", title: "Discussion Questions",  badge: "Community",       desc: "Four layers: ice-breaker, comprehension, interpretation, and deep theological dive — ready for groups." },
            { n: "10", title: "Closing Prayer",        badge: "Devotional",      desc: "A Trinitarian benediction giving all glory to God — closing the study as it began, in worship." },
          ].map(({ n, title, badge, desc }) => (
            <div
              key={n}
              className="group relative flex items-center gap-4 rounded-xl border border-white/5 bg-white/3 px-5 py-3.5 cursor-default transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.018] hover:border-white/20 hover:bg-white/7 hover:shadow-[0_8px_32px_-4px_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.06)]"
            >
              {/* Left accent bar */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-0.5 rounded-full bg-white/0 group-hover:bg-white/30 transition-all duration-300"
              />

              {/* Number */}
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/35 text-xs font-mono tabular-nums group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/70 transition-all duration-300">
                {n}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white/75 text-sm font-medium group-hover:text-white transition-colors duration-300">
                  {title}
                </p>
                <p className="text-white/35 text-xs leading-relaxed mt-0.5 group-hover:text-white/55 transition-colors duration-300">
                  {desc}
                </p>
              </div>

              {/* Badge */}
              <span className="shrink-0 text-[9px] uppercase tracking-widest text-white/25 border border-white/8 rounded-md px-2 py-1 group-hover:text-white/55 group-hover:border-white/25 transition-all duration-300">
                {badge}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}