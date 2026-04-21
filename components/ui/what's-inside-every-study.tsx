"use client"

import { useState } from "react"

const ITEMS = [
  { n: "01", title: "At a Glance",         badge: "Overview",        desc: "Passage, book, genre, key figures, and theological context summarized before you read a single verse." },
  { n: "02", title: "Opening Prayer",       badge: "Devotional",      desc: "A Christ-addressed prayer for illumination — theologically grounded, not generic spirituality." },
  { n: "03", title: "Historical Context",   badge: "Scholarship",     desc: "Author, audience, date, cultural setting, and the occasion behind the writing — sourced, not guessed." },
  { n: "04", title: "Passage Walkthrough",  badge: "Exposition",      desc: "Verse-by-verse exposition with ESV text inline. Every claim tied to the text, not imported from outside." },
  { n: "05", title: "Key Observations",     badge: "Analysis",        desc: "Theological themes, repeated motifs, literary structure, and intertextual echoes identified by the AI." },
  { n: "06", title: "Key Takeaways",        badge: "Doctrine",        desc: "Doctrinal truths that reshape belief and behavior — rooted in the passage, not in motivational culture." },
  { n: "07", title: "Christ Connection",    badge: "Gospel-Centered", desc: "Typological and redemptive threads that point to the person and work of Jesus. Always present." },
  { n: "08", title: "Life Application",     badge: "Pastoral",        desc: "Practical application grounded in the text itself — no pop psychology, no cultural import." },
  { n: "09", title: "Discussion Questions", badge: "Community",       desc: "Four layers: ice-breaker, comprehension, interpretation, and deep theological dive — ready for groups." },
  { n: "10", title: "Closing Prayer",       badge: "Devotional",      desc: "A Trinitarian benediction giving all glory to God — closing the study as it began, in worship." },
]

export default function SparklesSection() {
  const [active, setActive] = useState(0)

  const prev = () => setActive(i => Math.max(0, i - 1))
  const next = () => setActive(i => Math.min(ITEMS.length - 1, i + 1))

  return (
    <div id="whats-inside" className="w-full flex flex-col items-center justify-center overflow-hidden bg-black pb-20">

      <p className="text-xs uppercase tracking-widest mb-6 relative z-20 pt-16" style={{ color: "#D6A85F" }}>
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

      <div className="w-160 h-16 relative">
        {/* Glow line */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent to-transparent h-0.5 w-3/4 blur-sm" style={{ backgroundImage: "linear-gradient(to right, transparent, #D6A85F, transparent)" }} />
        <div className="absolute inset-x-20 top-0 h-px w-3/4" style={{ backgroundImage: "linear-gradient(to right, transparent, #D6A85F, transparent)" }} />
      </div>

      {/* Cards */}
      <div className="relative z-20 w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* Card 1 */}
        <div className="group relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
          />
          <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md p-6 transition-all duration-300 group-hover:border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" style={{ color: "#D6A85F" }}>✦</span>
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
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
          />
          <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md p-6 transition-all duration-300 group-hover:border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" style={{ color: "#D6A85F" }}>⚇</span>
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
                  <span className="mt-0.5 shrink-0" style={{ color: "#7EB89A" }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/30 text-sm italic border-t pt-4" style={{ borderColor: "#E8C992" }}>
              &ldquo;ScripturePath doesn&apos;t replace the pastor. It gives the pastor hours back — to pray, to counsel, to be present with their people.&rdquo;
            </p>
          </div>
        </div>

      </div>

      {/* 10-Section Study Format — Carousel */}
      <div className="relative z-20 w-full max-w-3xl px-4 mt-24">
        <p className="text-xs uppercase tracking-widest text-center mb-10" style={{ color: "#D6A85F" }}>
          The 10-Section Study Format
        </p>

        {/* Viewport */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {/* Slide track */}
          <div
            className="flex"
            style={{
              transform: `translateX(-${active * 100}%)`,
              transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {ITEMS.map(({ n, title, badge, desc }) => (
              <div
                key={n}
                className="w-full shrink-0 flex flex-col sm:flex-row min-h-72"
                style={{ background: "linear-gradient(160deg, #131211 0%, #0e0d0b 100%)" }}
              >
                {/* Image section */}
                <div
                  className="relative sm:w-2/5 shrink-0 min-h-44 sm:min-h-0 overflow-hidden"
                  style={{ background: "linear-gradient(145deg, #1c160d 0%, #0c0a07 100%)" }}
                >
                  {/* Replace the div below with <img src="..." /> when you have images */}
                  <div className="absolute inset-0 flex items-center justify-center select-none">
                    <span
                      className="font-bold font-mono leading-none"
                      style={{ fontSize: "clamp(5rem, 15vw, 9rem)", color: "rgba(255,255,255,0.04)" }}
                    >
                      {n}
                    </span>
                  </div>

                  {/* Subtle gold radial glow */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 40% 55%, rgba(214,168,95,0.07) 0%, transparent 65%)" }}
                  />

                  {/* Right-edge fade into content */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 w-16 pointer-events-none hidden sm:block"
                    style={{ background: "linear-gradient(to right, transparent, #0e0d0b)" }}
                  />

                  {/* Bottom-edge fade on mobile */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-12 pointer-events-none sm:hidden"
                    style={{ background: "linear-gradient(to bottom, transparent, #0e0d0b)" }}
                  />
                </div>

                {/* Content section */}
                <div className="flex-1 flex flex-col justify-between p-7 sm:p-8">
                  <div>
                    {/* Number + badge */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[11px] font-mono text-white/20 tabular-nums">{n}</span>
                      <span
                        className="text-[9px] uppercase tracking-widest rounded px-2 py-0.5"
                        style={{
                          color: "rgba(214,168,95,0.65)",
                          border: "1px solid rgba(214,168,95,0.2)",
                          background: "rgba(214,168,95,0.05)",
                        }}
                      >
                        {badge}
                      </span>
                    </div>

                    <h3 className="text-white text-xl font-semibold mb-3 leading-snug">{title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                  </div>

                  {/* Bottom row: progress + nav */}
                  <div className="flex items-center justify-between mt-8">
                    <span className="text-white/20 text-xs font-mono tabular-nums">
                      {active + 1} <span className="text-white/10">/</span> {ITEMS.length}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prev}
                        disabled={active === 0}
                        aria-label="Previous"
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-200 hover:border-white/25 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        ←
                      </button>
                      <button
                        onClick={next}
                        disabled={active === ITEMS.length - 1}
                        aria-label="Next"
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-200 hover:border-white/25 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed"
                        style={active < ITEMS.length - 1 ? { borderColor: "rgba(214,168,95,0.3)", color: "rgba(214,168,95,0.7)" } : undefined}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? "1.25rem" : "0.375rem",
                height: "0.375rem",
                background: i === active ? "rgba(214,168,95,0.7)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

      </div>

    </div>
  )
}
