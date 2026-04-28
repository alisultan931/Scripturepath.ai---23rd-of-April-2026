"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AntiGravityCanvas, Navigation } from "@/components/ui/particle-effect-for-hero";
import AiLoader from "@/components/ui/ai-loader";
import ProposalPage, { type Proposal } from "@/components/ui/proposal";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ChevronDown } from "lucide-react";
import UpgradeModal from "@/components/ui/upgrade-modal";

// --- Auto-resize textarea hook ---

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${minHeight}px`;
    const newHeight = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight ?? Infinity));
    el.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

// --- Data ---

const AUDIENCE_OPTIONS = [
  "Auto-detect — AI picks based on topic",
  "Adult Sunday School — structured teaching format",
  "Small Group — discussion & reflection",
  "Sermon / Pulpit — proclamation-style delivery",
  "Youth Group — accessible & energetic",
  "Women's Ministry — relational depth",
  "Men's Ministry — practical & direct",
  "New Believers — clear & foundational",
  "Personal Devotion — quiet & intimate",
];

const TONE_OPTIONS = [
  "Auto-detect — AI picks based on topic",
  "Devotional — personal & reflective",
  "Expository — verse-by-verse depth",
  "Topical — theme traced through Scripture",
  "Evangelistic — gospel-centered invitation",
  "Academic — scholarly & rigorous",
];

const TRANSLATION_OPTIONS: { label: string; value: string; available: boolean }[] = [
  { label: "KJV (recommended)", value: "KJV (recommended)", available: true },
  { label: "ESV — coming soon", value: "ESV", available: false },
  { label: "NIV — coming soon", value: "NIV", available: false },
  { label: "NKJV — coming soon", value: "NKJV", available: false },
  { label: "NASB — coming soon", value: "NASB", available: false },
  { label: "NLT — coming soon", value: "NLT", available: false },
  { label: "CSB — coming soon", value: "CSB", available: false },
];

const EXPLORE_TOPICS = {
  PASSAGES: [
    "Psalm 23 — The Good Shepherd",
    "John 11 — Lazarus raised",
    "Romans 8:29-30",
    "The Sermon on the Mount",
  ],
  "PEOPLE & FIGURES": [
    "Moses",
    "The disciples",
    "Angels",
    "Who is Satan in the Bible?",
  ],
  "CORE DOCTRINE": [
    "The Holy Spirit",
    "Baptism",
    "The Ten Commandments",
    "The Sabbath",
    "Unclean and clean",
  ],
  "QUESTIONS & TOPICS": [
    "How to pray",
    "Forgiveness and reconciliation",
    "What is sin?",
    "Fear",
    "End times",
  ],
};

// --- Translation select component ---

function TranslationSelectField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#D6A85F" }}>
        Translation
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-lg",
            "px-3 py-2.5 pr-8 text-sm text-white/90 font-light",
            "focus:outline-none cursor-pointer transition-all duration-200",
            "backdrop-blur-sm",
            "border border-white/15 bg-white/5",
            "hover:border-white/30 focus:border-white/40",
          )}
          style={{ background: "rgba(10,10,10,0.7)" }}
        >
          {TRANSLATION_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={!opt.available}
              className={cn(
                "bg-neutral-900",
                opt.available ? "text-white" : "text-white/30",
              )}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}

// --- Select component ---

interface SelectFieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

function SelectField({ label, options, value, onChange, hint }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#D6A85F" }}>
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-lg",
            "px-3 py-2.5 pr-8 text-sm text-white/90 font-light",
            "focus:outline-none cursor-pointer transition-all duration-200",
            "backdrop-blur-sm",
            "border border-white/15 bg-white/5",
            "hover:border-white/30 focus:border-white/40",
          )}
          style={{ background: "rgba(10,10,10,0.7)" }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-neutral-900 text-white">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
      </div>
      {hint && (
        <span className="text-[10px] text-white/35 italic">{hint}</span>
      )}
    </div>
  );
}

// --- Main component ---

export default function ScripturePathChat() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [credits, setCredits] = useState<number>(1);
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [translation, setTranslation] = useState(TRANSLATION_OPTIONS[0].value);
  const [limitReached, setLimitReached] = useState(false);
  const [limitResetAt, setLimitResetAt] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (!user) return;
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",").map((e) => e.trim()).filter(Boolean);
      if (adminEmails.includes(user.email ?? "")) {
        setIsPro(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status, credits")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status === "active" || data?.subscription_status === "canceling") {
        setIsPro(true);
      }
      if (data?.subscription_status === "trialing") {
        setIsTrial(true);
      }
      if (typeof data?.credits === "number") {
        setCredits(data.credits);
      }
    });
  }, []);

  useEffect(() => {
    if (isLoggedIn !== true) return;
    const raw = sessionStorage.getItem("sp_pending_study");
    if (!raw) return;
    sessionStorage.removeItem("sp_pending_study");
    try {
      const { proposal: saved } = JSON.parse(raw) as { proposal: Proposal; depth: string };
      setProposal(saved);
    } catch {
      // ignore
    }
  }, [isLoggedIn]);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 110,
    maxHeight: 220,
  });

  const DAILY_LIMIT = isTrial ? 20 : 10;
  const DAILY_KEY = "proposal_daily_limit";

  const tryConsumeLimit = (): boolean => {
    if (isPro) return true;
    const now = Date.now();
    const raw = localStorage.getItem(DAILY_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    if (stored && now < stored.resetAt) {
      if (stored.count >= DAILY_LIMIT) {
        setLimitReached(true);
        setLimitResetAt(stored.resetAt);
        return false;
      }
      localStorage.setItem(DAILY_KEY, JSON.stringify({ count: stored.count + 1, resetAt: stored.resetAt }));
    } else {
      localStorage.setItem(DAILY_KEY, JSON.stringify({ count: 1, resetAt: now + 24 * 60 * 60 * 1000 }));
      setLimitReached(false);
      setLimitResetAt(null);
    }
    return true;
  };

  const handleGenerate = async (skipLimitCheck = false) => {
    if (!query.trim()) {
      setInputError(true);
      textareaRef.current?.focus();
      return;
    }
    if (!skipLimitCheck && !tryConsumeLimit()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, audience, tone, translation }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setProposal(data);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuery = (text: string) => {
    setQuery(text);
    setInputError(false);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "110px";
      const newHeight = Math.max(110, Math.min(el.scrollHeight, 220));
      el.style.height = `${newHeight}px`;
    });
  };

  const handleRetry = async () => {
    if (!tryConsumeLimit()) return;
    setProposal(null);
    await handleGenerate(true);
  };

  const handleGenerateStudy = (depth: "normal" | "deep_dive", edited: Proposal) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("sp_pending_study", JSON.stringify({ proposal: edited, depth }));
      router.push("/signin?next=/chat");
      return;
    }
    const params = new URLSearchParams({
      title: edited.title,
      passage: edited.scripture_ref,
      description: edited.summary,
      theme: edited.theme,
      audience: edited.audience,
      tone: edited.tone,
      depth,
    });
    router.push(`/study?${params.toString()}`);
  };

  if (proposal) {
    return (
      <ProposalPage
        proposal={proposal}
        isPro={isPro}
        isTrial={isTrial}
        credits={credits}
        onRetry={handleRetry}
        onStartFromScratch={() => setProposal(null)}
        onGenerate={handleGenerateStudy}
        onConsumeLimit={tryConsumeLimit}
        retryLimitReached={limitReached}
        retryResetAt={limitResetAt ?? undefined}
        dailyLimit={DAILY_LIMIT}
      />
    );
  }

  return (
    <>
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden flex flex-col">
      {loading && <AiLoader />}
      <AntiGravityCanvas disableMouseInteraction />
      <Navigation showNavLinks={false} />

      {/* Ambient glow behind the form */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 52%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Page content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pt-28 pb-16">

        {/* Heading */}
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-semibold text-white leading-tight tracking-tight">
            What would you
            <br />
            like to{" "}
            <em
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              study?
            </em>
          </h1>
          <p className="mt-4 text-white/60 text-base md:text-lg font-light leading-relaxed">
            Enter a passage, topic, or question —{" "}
            <span className="font-normal" style={{ color: "#D6A85F" }}>ScripturePath</span> handles the rest.
          </p>
        </div>

        {/* Input card */}
        <div className="w-full max-w-2xl">
          <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              border: inputError
                ? "1px solid rgba(239,68,68,0.6)"
                : focused
                ? "1px solid rgba(255,255,255,0.35)"
                : "1px solid rgba(255,255,255,0.12)",
              background: "rgba(12,12,12,0.75)",
              backdropFilter: "blur(16px)",
              boxShadow: focused
                ? "0 0 0 3px rgba(255,255,255,0.04), 0 0 60px rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.6)"
                : "0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                adjustHeight();
                if (inputError) setInputError(false);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. The Sermon on the Mount, forgiveness, John 3:16..."
              className={cn(
                "w-full px-6 py-5 resize-none bg-transparent",
                "text-white text-[15px] leading-relaxed font-light",
                "placeholder:text-white/30",
                "focus:outline-none border-none"
              )}
              style={{ minHeight: 110, maxHeight: 220, overflow: "hidden" }}
            />
          </div>

          {inputError && (
            <p className="mt-2 text-sm text-red-400/80 font-light">
              Please enter a passage, topic, or question before generating.
            </p>
          )}

          {/* Pickers row */}
          <div className="flex gap-3 mt-4">
            <SelectField
              label="Audience"
              options={AUDIENCE_OPTIONS}
              value={audience}
              onChange={setAudience}
              hint="AI picks based on your topic"
            />
            <SelectField
              label="Tone"
              options={TONE_OPTIONS}
              value={tone}
              onChange={setTone}
              hint="AI picks based on your topic"
            />
            <TranslationSelectField
              value={translation}
              onChange={setTranslation}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-400/80 font-light">{error}</p>
          )}

          {limitReached && (
            <p className="mt-4 text-center text-sm font-light" style={{ color: "rgba(255,160,80,0.85)" }}>
              You&rsquo;ve reached the 10 free proposals for today.{" "}
              {limitResetAt
                ? `Try again in ${Math.ceil((limitResetAt - Date.now()) / 3600000)} hour${Math.ceil((limitResetAt - Date.now()) / 3600000) === 1 ? "" : "s"}.`
                : "Try again in 24 hours."}{" "}
              <button
                onClick={() => setShowUpgradeModal(true)}
                style={{ color: "rgba(196,147,78,0.9)", textDecoration: "underline", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
              >
                Upgrade to Premium
              </button>{" "}
              for unlimited access.
            </p>
          )}

          {/* Generate button */}
          <style>{`
            @keyframes border-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div className="flex justify-center mt-8">
            <div className="group relative inline-flex transition-all hover:scale-105 active:scale-95">
              <div
                className="relative inline-flex rounded-full overflow-hidden"
                style={{ padding: "1.5px", boxShadow: "0 0 20px rgba(255,255,255,0.08)" }}
              >
                {/* Rotating sharp border line */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "-100%",
                    width: "300%",
                    height: "300%",
                    background: "conic-gradient(from 0deg, transparent 72%, rgba(255,255,255,0.95) 79%, transparent 86%)",
                    animation: "border-spin 3s linear infinite",
                  }}
                />
                {/* Rotating blurred glow copy */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "-100%",
                    width: "300%",
                    height: "300%",
                    background: "conic-gradient(from 0deg, transparent 72%, rgba(255,255,255,0.5) 79%, transparent 86%)",
                    animation: "border-spin 3s linear infinite",
                    filter: "blur(10px)",
                  }}
                />
                <button
                  onClick={() => handleGenerate()}
                  className="relative inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold tracking-wide overflow-hidden transition-all hover:bg-neutral-900"
                >
                  <span className="relative z-10">Generate Study</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Explore a Topic */}
        <div className="w-full max-w-2xl mt-14">
          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-white/15" />
            <p className="text-[10px] tracking-[0.2em] font-bold uppercase" style={{ color: "#D6A85F" }}>
              Explore a Topic
            </p>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
            {Object.entries(EXPLORE_TOPICS).map(([category, items]) => (
              <div key={category}>
                <p className="text-[9px] tracking-[0.18em] font-bold uppercase mb-3" style={{ color: "#E8C992" }}>
                  {category}
                </p>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => fillQuery(item)}
                        className="text-left text-[13px] text-white/50 hover:text-white/80 transition-colors duration-150 leading-snug group/item"
                      >
                        <span className="group-hover/item:underline decoration-white/20 underline-offset-2">
                          {item}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}
