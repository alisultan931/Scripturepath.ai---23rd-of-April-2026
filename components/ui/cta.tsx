"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const ripples = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const { width, height } = section.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      ripples.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        alpha: 0.8,
      });
    };

    section.addEventListener("mousemove", handleMove);

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ripples.current.forEach((r) => {
        r.radius += 1.5;
        r.alpha -= 0.01;

        if (r.alpha > 0) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      ripples.current = ripples.current.filter((r) => r.alpha > 0);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-32 px-4 flex flex-col items-center justify-center text-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="max-w-2xl text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-white mb-6">
          Ready to preach with confidence?
        </h2>

        <p className="max-w-xl text-lg text-white/60 font-light leading-relaxed mb-12">
          Join hundreds of pastors who spend less time in research — and more time
          with their people.
        </p>

        <style>{`
          @keyframes border-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div className="group relative inline-flex transition-all hover:scale-105 active:scale-95">
          <div
            className="relative inline-flex rounded-full overflow-hidden"
            style={{ padding: "1.5px", boxShadow: "0 0 20px rgba(255,255,255,0.08)" }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-100%",
                width: "300%",
                height: "300%",
                background:
                  "conic-gradient(from 0deg, transparent 72%, rgba(255,255,255,0.95) 79%, transparent 86%)",
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
                background:
                  "conic-gradient(from 0deg, transparent 72%, rgba(255,255,255,0.5) 79%, transparent 86%)",
                animation: "border-spin 3s linear infinite",
                filter: "blur(10px)",
              }}
            />
            <Link
              href={isLoggedIn ? "/chat" : "/signin"}
              className="relative inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold tracking-wide overflow-hidden transition-all hover:bg-neutral-900"
            >
              <span className="relative z-10">Generate Your First Study</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-5" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/40 font-medium">
          No credit card required. Scripture-first guarantee.
        </p>
      </div>
    </section>
  );
};

export default Component;
