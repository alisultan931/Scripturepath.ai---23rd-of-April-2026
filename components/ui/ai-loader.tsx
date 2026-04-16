"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LETTERS = ["A","n","a","l","y","z","i","n","g"," ","y","o","u","r"," ","q","u","e","r","y"];

const STATUS_LINES = [
  "Identifying passages, themes, and context…",
  "Scanning canonical and deuterocanonical texts…",
  "Cross-referencing parallel scriptures…",
  "Mapping theological connections…",
  "Tracing historical and cultural context…",
  "Analyzing linguistic patterns in original languages…",
  "Surfacing related commentary and doctrine…",
  "Reconciling variant manuscript traditions…",
  "Synthesizing insights across traditions…",
  "Preparing your personalized study path…",
];

const STEP  = 0.15;   // gap between each letter's peak (s)
const CYCLE = 6.0;    // full cycle: 20 × 0.15 = 3s sweep + 3s rest

const STATUS_INTERVAL = 2200; // ms per status line

const STAR_DENSITY = 0.00012;
const MOUSE_RADIUS = 160;
const REPULSION = 5;

interface Star {
  x: number; y: number;
  driftX: number; driftY: number;
  vx: number; vy: number;
  size: number; alpha: number; phase: number;
}

export default function AiLoader() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [initStars]);

  useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
        setVisible(true);
      }, 350);
    }, STATUS_INTERVAL);
    return () => clearInterval(tick);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  };

  const handleMouseLeave = () => { mouseRef.current.active = false; };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_15%,rgba(255,255,255,0.06),transparent_60%)]" />
      <style>{`
        .loader {
          width: 360px;
          height: 360px;
          border-radius: 50%;
          animation: loader-rotate 2s linear infinite;
          background: #000000;
          flex-shrink: 0;
        }

        @keyframes loader-rotate {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 10px 0 #d60a47 inset,
              0 40px 60px 0 #311e80 inset;
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
        }

        .loader-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .loader-letter {
          font-size: 1.1rem;
          font-weight: 400;
          color: #ffffff;
          opacity: 0.2;
          animation: letter-wave ${CYCLE}s ease-in-out infinite;
        }

        @keyframes letter-wave {
          0%        { opacity: 0.2; text-shadow: none; }
          15%       { opacity: 1;   text-shadow: 0 0 16px rgba(255,255,255,0.35); }
          32%       { opacity: 0.2; text-shadow: none; }
          100%      { opacity: 0.2; text-shadow: none; }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="loader" />
          <div className="loader-text">
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className="loader-letter"
                style={{ animationDelay: `${i * STEP}s` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
        </div>

        <p
          className="text-white/40 text-sm font-light tracking-wide transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {STATUS_LINES[statusIndex]}
        </p>
      </div>
    </div>
  );
}
