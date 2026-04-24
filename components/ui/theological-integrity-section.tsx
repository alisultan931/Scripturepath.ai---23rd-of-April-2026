import { Check } from "lucide-react";


const features = [
  {
    title: "Only verified Bible translations",
    description:
      "ESV default, NIV, NASB, CSB available. No paraphrases presented as Scripture.",
  },
  {
    title: "Transparent interpretation",
    description:
      "Multiple theological traditions shown side by side. No hidden doctrinal agents.",
  },
  {
    title: "Christ-centered framework",
    description:
      "Every study points to the redemptive work of Christ. The gospel is never optional.",
  },
  {
    title: "Confidence markers",
    description:
      "All historical and speculative claims are clearly labeled — never presented as biblical fact.",
  },
  {
    title: "Jesus addressed by name",
    description:
      "Christ is never abstracted into vague spiritual language. The person of Jesus remains central.",
  },
];

const stats = [
  { value: "10", label: "structured sessions per study" },
  { value: "7", label: "verified Bible translations" },
  { value: "0", label: "hallucinated Scripture verses" },
  { value: "∞", label: "depth of theological care" },
];

export default function TheologicalIntegritySection() {
  return (
    <section id="theological-integrity" className="bg-black border-t border-white/10 py-24 md:py-32 px-4 selection:bg-white/15 selection:text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

        {/* Left column — features */}
        <div className="space-y-10">
          <div className="space-y-5">
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#D6A85F' }}>
              Theological Integrity
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white">
              Theologically safe.{" "}
              <span className="italic text-white/60">
                Rigorously verified.
              </span>
            </h2>

            <p className="text-base md:text-lg text-white/60 font-light leading-relaxed max-w-md">
              ScripturePath isn't a general AI. It was purpose-built for
              biblical content with hard constraints that cannot be overridden —
              not even by a user prompt.
            </p>
          </div>

          <ul className="space-y-6">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-4">
                <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_0_12px_rgba(255,255,255,0.08)]">
  
                  {/* subtle inner glow */}
                  <div className="absolute inset-0 rounded-full bg-white/5 blur-[2px] opacity-40" />
                  
                  <Check className="w-3.5 h-3.5 relative z-10" style={{ color: '#7EB89A' }} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-white/90 font-medium text-sm">
                    {feature.title}
                  </p>
                  <p className="text-white/50 text-sm font-light leading-relaxed mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — testimonial + stats */}
        <div className="space-y-5">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white">
            Built on Non&#8209;Negotiables
          </h2>

          {/* Statement card */}
          <div className="group relative">

            {/* Outer glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
              style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
            />

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-5 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20">
            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed">
              ScripturePath is new. We&rsquo;re not going to pretend otherwise with borrowed authority or stock testimonials.
            </p>

            <p className="text-white/80 text-sm md:text-base font-light leading-relaxed">
              What we can promise is this:
            </p>

            <ul className="space-y-3 text-white/70 text-sm md:text-base font-light leading-relaxed">
              <li>Every verse of Scripture in your study is pulled from a verified translation — never paraphrased, never generated.</li>
              <li>Every theological claim is constrained by guardrails that cannot be overridden, even by the founder.</li>
              <li>Every study points to Christ — because that&rsquo;s what Scripture does.</li>
            </ul>

            <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed">
              Try it.
            </p>

            <p className="text-white/50 text-sm font-light leading-relaxed italic">
              If you find one hallucinated verse or one doctrinal overreach, tell us. We&rsquo;ll fix it.
            </p>
          </div>
          </div>{/* end group */}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="group relative">

                {/* Outer glow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"
                  style={{ boxShadow: "0 0 25px 2px rgba(255,255,255,0.25)" }}
                />

                <div className="relative rounded-xl border border-white/10 bg-white/2 p-5 space-y-1 transition-all duration-300 group-hover:border-white/20">
                  <p className="text-3xl font-medium text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-xs font-light leading-snug">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
