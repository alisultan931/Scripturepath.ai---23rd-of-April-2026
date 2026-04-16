"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Navigation } from "@/components/ui/particle-effect-for-hero";

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
  onRetry: () => void;
}

export default function ProposalPage({ proposal, onRetry }: ProposalPageProps) {
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

  return (
    <div
      ref={wrapperRef}
      className="relative w-full min-h-screen bg-zinc-950 overflow-x-hidden flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <Navigation />

      {/* Subtle vignette — matches pricing section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 [background:radial-gradient(80%_60%_at_50%_15%,rgba(255,255,255,0.06),transparent_60%)]"
      />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-28 pb-20">
        <div className="w-full max-w-2xl bg-zinc-900/70 backdrop-blur supports-backdrop-filter:bg-zinc-900/60 shadow-[0_0_28px_6px_rgba(255,255,255,0.05)] border border-zinc-800 p-8">

          {/* ── Section marker ── */}
          <div className="flex items-center gap-4 mb-6">
            <div style={{ height: "1px", width: "32px", background: "rgba(214,168,95,0.6)" }} />
            <span
              className="text-[10px] font-bold tracking-[0.28em] uppercase"
              style={{ color: "rgba(214,168,95,0.7)" }}
            >
              Study Proposal
            </span>
          </div>

          {/* ── Oversized serif title ── */}
          <h1
            className="mb-4 leading-[1.1] tracking-tight"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
              color: "rgba(255,255,255,0.95)",
            }}
          >
            {proposal.title}
          </h1>

          {/* ── Scripture ref ── */}
          <div className="flex items-center gap-2 mb-6">
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
              {proposal.scripture_ref}
            </span>
          </div>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />

          {/* ── Pull quote ── */}
          <p
            className="mb-6 leading-[1.8]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            &ldquo;{proposal.summary}&rdquo;
          </p>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

          {/* ── Metadata footnotes — left-aligned columns ── */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            {[
              { label: "Theme", value: proposal.theme },
              { label: "Audience", value: proposal.audience },
              { label: "Tone", value: proposal.tone },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className="mb-1.5"
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(214,168,95,0.6)",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "0.85rem",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.55,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

          {/* ── Key verses — inline with mid-dots ── */}
          <p
            className="mb-6"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "rgba(214,168,95,0.55)",
              fontWeight: 400,
            }}
          >
            {(proposal.key_verses ?? []).join("  ·  ")}
          </p>

          {/* ── Rule ── */}
          <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

          {/* ── Mode buttons ── */}
          <div className="flex gap-3 mb-4">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-opacity hover:opacity-90"
              style={{
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.06)",
                letterSpacing: "0.04em",
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Normal
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm cursor-not-allowed"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.2)",
                background: "transparent",
                letterSpacing: "0.04em",
              }}
              disabled
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deep Dive
              <span
                style={{
                  fontSize: "9px",
                  padding: "2px 5px",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.2)",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                }}
              >
                PRO
              </span>
            </button>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="py-3 px-6 text-sm font-light transition-opacity hover:opacity-70"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.3)",
                background: "transparent",
                letterSpacing: "0.04em",
              }}
            >
              Try again
            </button>

            <style>{`
              @keyframes border-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
            `}</style>

            <div className="group relative inline-flex flex-1 transition-all hover:scale-[1.02] active:scale-95">
              <div
                className="relative inline-flex w-full overflow-hidden"
                style={{ padding: "1px", boxShadow: "0 0 28px rgba(214,168,95,0.1)" }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "-100%",
                    width: "300%",
                    height: "300%",
                    background: "conic-gradient(from 0deg, transparent 70%, rgba(214,168,95,0.9) 78%, transparent 86%)",
                    animation: "border-spin 4s linear infinite",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "-100%",
                    width: "300%",
                    height: "300%",
                    background: "conic-gradient(from 0deg, transparent 70%, rgba(214,168,95,0.35) 78%, transparent 86%)",
                    animation: "border-spin 4s linear infinite",
                    filter: "blur(12px)",
                  }}
                />
                <button
                  className="relative inline-flex items-center justify-center gap-2 w-full px-8 py-3 bg-black text-white overflow-hidden transition-all hover:bg-neutral-900"
                  style={{ fontWeight: 500, letterSpacing: "0.08em", fontSize: "0.85rem" }}
                >
                  <span className="relative z-10">Generate Study</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-[0.04]" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
