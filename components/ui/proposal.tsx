"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Crown, Loader2, Pencil, RefreshCw, RotateCcw, Sparkles, X } from "lucide-react";
import { Navigation } from "@/components/ui/particle-effect-for-hero";
import UpgradeModal from "@/components/ui/upgrade-modal";

const STAR_DENSITY = 0.00012;
const MOUSE_RADIUS = 160;
const REPULSION = 5;

interface Star {
  x: number; y: number;
  driftX: number; driftY: number;
  vx: number; vy: number;
  size: number; alpha: number; phase: number;
}

export interface Proposal {
  title: string;
  scripture_ref: string;
  summary: string;
  theme: string;
  audience: string;
  tone: string;
  key_verses: string[];
}

interface ProposalPageProps {
  proposal: Proposal;
  isPro?: boolean;
  isTrial?: boolean;
  credits?: number;
  onRetry: () => void;
  onStartFromScratch: () => void;
  onGenerate: (depth: "normal" | "deep_dive", edited: Proposal) => void;
  retryLimitReached?: boolean;
  retryResetAt?: number;
  dailyLimit?: number;
}

const DEEP_DIVE_ROWS = [
  { label: "Observations",     normal: "5–8",     deep: "8–12" },
  { label: "Key Takeaways",    normal: "3–5",     deep: "5–7" },
  { label: "Cross References", normal: "2–4",     deep: "4–6" },
  { label: "Applications",     normal: "3–5",     deep: "5–7 + 3-day plan" },
  { label: "Discussion Qs",    normal: "5–8",     deep: "8–10 + Deep Dive Qs" },
  { label: "Study Time",       normal: "~15 min", deep: "~45 min" },
];

const DEEP_DIVE_ONLY = [
  { icon: "✦", text: "Scholarly framing & authorship notes" },
  { icon: "◎", text: "Fresh angles that challenge shallow readings" },
  { icon: "⊟", text: "3-day mini action plan with daily prayer focus" },
];

export default function ProposalPage({
  proposal,
  isPro = false,
  isTrial = false,
  credits = 1,
  onRetry,
  onStartFromScratch,
  onGenerate,
  retryLimitReached = false,
  retryResetAt,
  dailyLimit = 10,
}: ProposalPageProps) {
  const canDeepDive = isPro || isTrial;

  // ── Proposal state (updated after a successful re-generate) ──
  const [displayedProposal, setDisplayedProposal] = useState<Proposal>(proposal);

  // ── UI state ──
  const [deepDive, setDeepDive] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // ── Edit modal state ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineWarning, setRefineWarning] = useState<string | null>(null);

  // ── Star canvas ──
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef(0);

  const initStars = useCallback((w: number, h: number) => {
    const count = Math.floor(w * h * STAR_DENSITY);
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.3,
      vx: 0, vy: 0,
      size: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.35 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setup = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars(w, h);
    };

    setup();

    const animate = (time: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const mouse = mouseRef.current;
      for (const s of starsRef.current) {
        if (mouse.active) {
          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0.1) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            s.vx -= (dx / dist) * force * REPULSION;
            s.vy -= (dy / dist) * force * REPULSION;
          }
        }
        s.vx += (s.driftX - s.vx) * 0.03;
        s.vy += (s.driftY - s.vy) * 0.03;
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
        const twinkle = Math.sin(time * 0.0018 + s.phase) * 0.5 + 0.5;
        ctx.globalAlpha = s.alpha * (0.3 + 0.7 * twinkle);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    const ro = new ResizeObserver(setup);
    ro.observe(wrapperRef.current || document.body);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [initStars]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  };
  const handleMouseLeave = () => { mouseRef.current.active = false; };

  // ── Re-generate proposal via Claude ──
  const handleRefineProposal = async () => {
    if (!changeRequest.trim() || refineLoading) return;
    setRefineWarning(null);
    setRefineLoading(true);
    try {
      const res = await fetch("/api/refine-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalProposal: displayedProposal, changeRequest }),
      });
      const data = await res.json();
      if (data.warning) {
        setRefineWarning(data.warning);
        return;
      }
      if (data.error) {
        setRefineWarning(data.error);
        return;
      }
      if (data.proposal) {
        setDisplayedProposal(data.proposal);
        setShowEditModal(false);
        setChangeRequest("");
      }
    } catch {
      setRefineWarning("Could not reach the server. Please check your connection and try again.");
    } finally {
      setRefineLoading(false);
    }
  };

  const openEditModal = () => {
    setChangeRequest("");
    setRefineWarning(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (refineLoading) return;
    setShowEditModal(false);
    setChangeRequest("");
    setRefineWarning(null);
  };

  return (
    <>
    <div
      ref={wrapperRef}
      className="relative w-full min-h-screen bg-zinc-950 overflow-x-hidden flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <Navigation />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 [background:radial-gradient(80%_60%_at_50%_15%,rgba(255,255,255,0.06),transparent_60%)]"
      />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-3 sm:px-6 pt-20 sm:pt-28 pb-20">
        <div className="w-full max-w-2xl bg-zinc-900/70 backdrop-blur supports-backdrop-filter:bg-zinc-900/60 shadow-[0_0_28px_6px_rgba(255,255,255,0.05)] border border-zinc-800 p-5 sm:p-8">

          {/* ── Section marker + Edit button ── */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <div style={{ height: "1px", width: "32px", background: "rgba(214,168,95,0.6)" }} />
              <span
                className="text-[10px] font-bold tracking-[0.28em] uppercase"
                style={{ color: "rgba(214,168,95,0.7)" }}
              >
                Study Proposal
              </span>
            </div>
            <button
              onClick={openEditModal}
              className="edit-toggle-btn flex items-center gap-1.5 px-2.5 py-1.5 transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.35)",
                background: "transparent",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
              }}
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          </div>

          {/* ── Title ── */}
          <h1
            className="mb-4 leading-[1.1] tracking-tight"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(1.65rem, 7vw, 3.6rem)",
              color: "rgba(255,255,255,0.95)",
            }}
          >
            {displayedProposal.title}
          </h1>

          {/* ── Scripture ref ── */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(214,168,95,0.7)" }} />
            <span
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "0.9rem",
                color: "rgba(214,168,95,0.8)",
                letterSpacing: "0.02em",
              }}
            >
              {displayedProposal.scripture_ref}
            </span>
          </div>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />

          {/* ── Summary ── */}
          <p
            className="mb-4 sm:mb-6 leading-[1.7] sm:leading-[1.8]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            &ldquo;{displayedProposal.summary}&rdquo;
          </p>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

          {/* ── Metadata ── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-8 mb-6">
            {[
              { label: "Theme",    value: displayedProposal.theme },
              { label: "Audience", value: displayedProposal.audience },
              { label: "Tone",     value: displayedProposal.tone },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="mb-1.5"
                  style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(214,168,95,0.6)" }}
                >
                  {label}
                </p>
                <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "0.85rem", fontWeight: 400, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

          {/* ── Key verses ── */}
          <p
            className="mb-6"
            style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "rgba(214,168,95,0.55)", fontWeight: 400 }}
          >
            {(displayedProposal.key_verses ?? []).join("  ·  ")}
          </p>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

          {/* ── Mode buttons ── */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setDeepDive(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-all hover:opacity-90"
              style={{
                border: deepDive ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.35)",
                color: deepDive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                background: deepDive ? "transparent" : "rgba(255,255,255,0.06)",
                letterSpacing: "0.04em",
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Normal
            </button>
            <button
              onClick={() => canDeepDive ? setDeepDive(true) : setShowUpgradeModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-all deep-dive-btn"
              style={{
                border: deepDive ? "1px solid rgba(214,168,95,0.6)" : "1px solid rgba(255,255,255,0.12)",
                color: deepDive ? "rgba(214,168,95,0.95)" : "rgba(255,255,255,0.5)",
                background: deepDive ? "rgba(214,168,95,0.07)" : "transparent",
                letterSpacing: "0.04em",
                boxShadow: deepDive ? "0 0 18px rgba(214,168,95,0.25), inset 0 0 12px rgba(214,168,95,0.05)" : "none",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deep Dive
              {!canDeepDive && <Crown className="w-3 h-3 opacity-50" />}
            </button>
          </div>

          {/* ── Deep Dive info panel ── */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: deepDive ? "600px" : "0px", opacity: deepDive ? 1 : 0, marginBottom: deepDive ? "24px" : "0px" }}
          >
            <div style={{ border: "1px solid rgba(214,168,95,0.18)", background: "rgba(214,168,95,0.04)", padding: "16px 20px" }}>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(214,168,95,0.55)", marginBottom: "14px" }}>
                Deep Dive gives you more
              </p>
              <div style={{ marginBottom: "16px" }}>
                {DEEP_DIVE_ROWS.map(({ label, normal, deep }) => (
                  <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", minWidth: 0 }}>{label}</span>
                    <div className="flex items-center gap-4 shrink-0 ml-3">
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", minWidth: "36px", textAlign: "right" }}>{normal}</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(214,168,95,0.9)", textAlign: "right" }}>{deep}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(214,168,95,0.4)", marginBottom: "10px" }}>
                Only in Deep Dive
              </p>
              <div className="flex flex-col gap-2">
                {DEEP_DIVE_ONLY.map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <span style={{ fontSize: "0.72rem", color: "rgba(214,168,95,0.5)", marginTop: "1px", width: "14px", textAlign: "center", flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={retryLimitReached ? undefined : onRetry}
                disabled={retryLimitReached}
                className="action-secondary-btn flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-light transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", background: "transparent", letterSpacing: "0.04em" }}
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                Try again
              </button>
              <button
                onClick={onStartFromScratch}
                className="action-secondary-btn flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-light transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", background: "transparent", letterSpacing: "0.04em" }}
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                Start Over
              </button>
            </div>

            {retryLimitReached && (
              <p className="text-center text-xs mt-1" style={{ color: "rgba(255,160,80,0.8)" }}>
                You&rsquo;ve reached the {dailyLimit} free retries for today.{" "}
                {retryResetAt
                  ? `Try again in ${Math.ceil((retryResetAt - Date.now()) / 3600000)} hour${Math.ceil((retryResetAt - Date.now()) / 3600000) === 1 ? "" : "s"}.`
                  : "Try again in 24 hours."}{" "}
                <button onClick={() => setShowUpgradeModal(true)} style={{ color: "rgba(196,147,78,0.9)", textDecoration: "underline", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}>
                  Upgrade to Premium
                </button>{" "}
                for unlimited retries.
              </p>
            )}

            <style>{`
              @keyframes border-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              @media (hover: hover) {
                .edit-toggle-btn:hover {
                  border-color: rgba(214,168,95,0.5) !important;
                  color: rgba(214,168,95,0.9) !important;
                  background: rgba(214,168,95,0.07) !important;
                }
                .deep-dive-btn:hover {
                  border-color: rgba(214,168,95,0.5) !important;
                  color: rgba(214,168,95,0.85) !important;
                  box-shadow: 0 0 22px rgba(214,168,95,0.3), inset 0 0 14px rgba(214,168,95,0.06) !important;
                }
                .action-secondary-btn:hover {
                  border-color: rgba(255,255,255,0.35) !important;
                  color: rgba(255,255,255,0.85) !important;
                  background: rgba(255,255,255,0.05) !important;
                }
              }
            `}</style>

            <div className={`group relative inline-flex w-full transition-all ${credits > 0 && !generating ? "hover:scale-[1.02] active:scale-95" : "opacity-50 cursor-not-allowed"}`}>
              <div
                className="relative inline-flex w-full overflow-hidden"
                style={{ padding: "1px", boxShadow: credits > 0 && !generating ? "0 0 28px rgba(214,168,95,0.1)" : "none" }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", inset: "-100%", width: "300%", height: "300%",
                    background: "conic-gradient(from 0deg, transparent 70%, rgba(214,168,95,0.9) 78%, transparent 86%)",
                    animation: credits > 0 && !generating ? "border-spin 4s linear infinite" : "none",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", inset: "-100%", width: "300%", height: "300%",
                    background: "conic-gradient(from 0deg, transparent 70%, rgba(214,168,95,0.35) 78%, transparent 86%)",
                    animation: credits > 0 && !generating ? "border-spin 4s linear infinite" : "none",
                    filter: "blur(12px)",
                  }}
                />
                <button
                  disabled={credits <= 0 || generating}
                  onClick={() => {
                    if (credits <= 0 || generating) return;
                    setGenerating(true);
                    onGenerate(deepDive ? "deep_dive" : "normal", displayedProposal);
                  }}
                  className="relative inline-flex items-center justify-center gap-2 w-full px-8 py-3 bg-black text-white overflow-hidden transition-all hover:bg-neutral-900 disabled:pointer-events-none"
                  style={{ fontWeight: 500, letterSpacing: "0.08em", fontSize: "0.85rem" }}
                >
                  <span className="relative z-10">{deepDive ? "Generate Deep Dive" : "Generate Study"}</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-[0.04]" />
                </button>
              </div>
            </div>

            {credits <= 0 && (
              <p className="text-center text-xs mt-2" style={{ color: "rgba(255,100,100,0.75)" }}>
                You have no credits remaining.{" "}
                <button onClick={() => setShowUpgradeModal(true)} style={{ color: "rgba(196,147,78,0.9)", textDecoration: "underline", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}>
                  Upgrade to Premium
                </button>{" "}
                or purchase more credits to generate a study.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* ── Edit modal ── */}
    {showEditModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
      >
        <div
          className="w-full max-w-lg"
          style={{
            background: "rgba(18,18,20,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 40px rgba(0,0,0,0.6)",
            padding: "28px",
          }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div style={{ height: "1px", width: "24px", background: "rgba(214,168,95,0.6)" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(214,168,95,0.7)" }}>
                Request Changes
              </span>
            </div>
            <button
              onClick={closeEditModal}
              disabled={refineLoading}
              className="transition-opacity hover:opacity-60 disabled:opacity-30"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Instruction */}
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: "16px" }}>
            Describe what you&rsquo;d like to change about the proposal — Claude will re-generate it based on your request.
          </p>

          {/* Textarea */}
          <textarea
            autoFocus
            rows={4}
            value={changeRequest}
            onChange={e => { setChangeRequest(e.target.value); setRefineWarning(null); }}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRefineProposal(); }}
            placeholder={'e.g. "Make the tone more devotional" or "Focus on grace rather than judgment"'}
            disabled={refineLoading}
            className="w-full resize-none outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.88rem",
              lineHeight: 1.65,
              padding: "12px 14px",
              marginBottom: "12px",
              fontFamily: "inherit",
            }}
          />

          {/* Warning */}
          {refineWarning && (
            <div
              className="mb-4 px-3 py-2.5"
              style={{ background: "rgba(255,140,60,0.07)", border: "1px solid rgba(255,140,60,0.2)" }}
            >
              <p style={{ fontSize: "0.8rem", color: "rgba(255,160,80,0.95)", lineHeight: 1.6 }}>
                {refineWarning}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={closeEditModal}
              disabled={refineLoading}
              className="action-secondary-btn flex-1 py-2.5 text-sm transition-all disabled:opacity-40"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", background: "transparent", letterSpacing: "0.04em" }}
            >
              Cancel
            </button>
            <button
              onClick={handleRefineProposal}
              disabled={refineLoading || !changeRequest.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: "1px solid rgba(214,168,95,0.45)",
                color: refineLoading || !changeRequest.trim() ? "rgba(214,168,95,0.4)" : "rgba(214,168,95,0.9)",
                background: "rgba(214,168,95,0.06)",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              {refineLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Re-generating…
                </>
              ) : (
                "Re-generate Proposal"
              )}
            </button>
          </div>

          <p style={{ marginTop: "10px", fontSize: "10px", color: "rgba(255,255,255,0.18)", textAlign: "center", letterSpacing: "0.04em" }}>
            Cmd/Ctrl + Enter to submit
          </p>
        </div>
      </div>
    )}

    <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}
