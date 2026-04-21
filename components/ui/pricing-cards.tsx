"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/pricing-parts/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/pricing-parts/card";
import { Separator } from "@/components/pricing-parts/separator";
import { Switch } from "@/components/pricing-parts/switch";

// --- Particle types ---
interface Star {
  x: number;
  y: number;
  driftX: number; // base drift velocity
  driftY: number;
  vx: number;     // current velocity (drift + repulsion)
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

interface PricingFeature {
  text: string;
  disabled?: boolean;
}
interface PricingPlan {
  id: string;
  name: string;
  priceLabel: string;
  billingNote: string;
  monthlyPrice: string;
  yearlyPrice: string;
  mostPopular?: boolean;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
    variant?: "primary" | "ghost";
  };
}
interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

const STAR_DENSITY = 0.00012;
const MOUSE_RADIUS = 160;
const REPULSION = 5;

const Pricing2 = ({
  heading = "Simple, honest pricing",
  description = "Start free. Upgrade when your ministry needs more.",
  plans = [
    {
      id: "free",
      name: "Free",
      priceLabel: "$0",
      billingNote: "forever",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        { text: "3 studies per month" },
        { text: "Normal depth" },
        { text: "Basic library" },
        { text: "Deep Dive mode", disabled: true },
        { text: "PDF export", disabled: true },
      ],
      button: {
        text: "Current plan",
        url: "#",
        variant: "ghost",
      },
    },
    {
      id: "premium",
      name: "Premium",
      priceLabel: "$19.90",
      billingNote: "Billed monthly",
      monthlyPrice: "$19.90",
      yearlyPrice: "$199",
      mostPopular: true,
      features: [
        { text: "10 studies per day" },
        { text: "Normal + Deep Dive depth" },
        { text: "Full library with search" },
        { text: "PDF export for print & share" },
        { text: "Priority generation speed" },
      ],
      button: {
        text: "Start 7-Day Free Trial",
        url: "#",
        variant: "primary",
      },
    },
  ],
}: Pricing2Props) => {
  const [isYearly, setIsYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleUpgrade = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/signin";
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: isYearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
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
      vx: 0,
      vy: 0,
      size: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.35 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setup = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
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
      const stars = starsRef.current;

      for (const s of stars) {
        // Mouse repulsion
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

        // Drift back toward base speed after repulsion
        s.vx += (s.driftX - s.vx) * 0.03;
        s.vy += (s.driftY - s.vy) * 0.03;

        s.x += s.vx;
        s.y += s.vy;

        // Wrap around edges
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        // Twinkle
        const twinkle = Math.sin(time * 0.0018 + s.phase) * 0.5 + 0.5;
        const currentAlpha = s.alpha * (0.3 + 0.7 * twinkle);

        ctx.globalAlpha = currentAlpha;
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
    ro.observe(sectionRef.current || document.body);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [initStars]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <section
      ref={sectionRef}
      data-locked
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen py-24 md:py-32 bg-zinc-950 text-zinc-50 overflow-hidden isolate"
    >
      <style>{`
        :where(html, body, #__next){
          margin:0; min-height:100%;
          background:#0b0b0c; color:#f6f7f8; color-scheme:dark;
          overflow-x:hidden; scrollbar-gutter:stable both-edges;
        }
        html{ background:#0b0b0c }
        section[data-locked]{ color:#f6f7f8; color-scheme:dark }
        .card-animate{opacity:0;transform:translateY(12px);animation:fadeUp .6s ease .25s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
        @keyframes border-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Interactive star canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_15%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Content */}
      <div className="relative container mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#D6A85F" }}>Plans</p>
          <h2 className="text-pretty text-4xl font-bold lg:text-6xl">{heading}</h2>
          <p className="text-zinc-400 lg:text-xl">{description}</p>

          <div className="flex items-center gap-3 text-lg">
            Monthly
            <Switch checked={isYearly} onCheckedChange={() => setIsYearly(!isYearly)} />
            <span className="flex items-center gap-2">
              Yearly
              <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-semibold" style={{ color: "#E8C992" }}>
                SAVE 16%
              </span>
            </span>
          </div>

          <div className="mt-2 flex flex-col items-stretch gap-6 md:flex-row md:items-stretch">
            {plans.map((plan, i) => (
              <div key={plan.id} className="relative pt-7 flex flex-col">
                {plan.mostPopular && (
                  <p className="absolute top-0 right-0 text-xs font-semibold uppercase tracking-widest" style={{ color: "#7EB89A" }}>
                    + Most Popular
                  </p>
                )}
                <Card
                  className={`card-animate flex w-80 flex-col justify-between text-left border-zinc-800 bg-zinc-900/70 backdrop-blur supports-backdrop-filter:bg-zinc-900/60 shadow-[0_0_28px_6px_rgba(255,255,255,0.05)] transition-shadow duration-300 hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.13)] h-full`}
                  style={{ animationDelay: `${0.25 + i * 0.08}s` }}
                >
                  <CardHeader>
                    <CardTitle>
                      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        {plan.name}
                      </p>
                    </CardTitle>
                    <span className="text-5xl font-bold text-white">
                      {isYearly ? plan.yearlyPrice : plan.priceLabel}
                      {plan.id !== "free" && (
                        <span className="text-lg font-normal text-zinc-400">{isYearly ? "/yr" : "/mo"}</span>
                      )}
                    </span>
                    <p className="text-sm text-zinc-500">{plan.id === "premium" ? (isYearly ? "Billed yearly" : "Billed monthly") : plan.billingNote}</p>
                  </CardHeader>

                  <CardContent>
                    <Separator className="mb-6 bg-zinc-800" />
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className={`flex items-center gap-2 ${
                            feature.disabled ? "text-zinc-600" : "text-zinc-200"
                          }`}
                        >
                          {feature.disabled ? (
                            <X className="size-4 shrink-0" />
                          ) : (
                            <CircleCheck className="size-4 shrink-0" style={{ color: "#7EB89A" }} />
                          )}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    {plan.button.variant === "primary" ? (
                      <div
                        className="relative w-full rounded-full overflow-hidden"
                        style={{ padding: "1.5px", boxShadow: "0 0 20px rgba(255,255,255,0.08)" }}
                      >
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
                          onClick={handleUpgrade}
                          disabled={checkoutLoading}
                          className="relative flex w-full items-center justify-center gap-2 px-8 py-3 bg-black text-white rounded-full font-semibold tracking-wide overflow-hidden transition-all hover:bg-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <span className="relative z-10">
                            {checkoutLoading ? "Redirecting…" : plan.button.text}
                          </span>
                          {!checkoutLoading && <ArrowRight className="w-4 h-4 relative z-10" />}
                          <div className="absolute inset-0 bg-white scale-x-0 hover:scale-x-100 origin-left transition-transform duration-300 opacity-5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        asChild
                        className="w-full rounded-lg bg-transparent text-zinc-400 hover:bg-zinc-800"
                      >
                        <a href={plan.button.url}>{plan.button.text}</a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing2 as Pricing };
