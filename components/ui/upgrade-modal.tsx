"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck, Crown, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  "10 studies per day",
  "Normal + Deep Dive depth",
  "Full library with search",
  "PDF export for print & share",
  "Priority generation speed",
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleUpgrade = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/signin"; return; }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: isYearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-md"
        style={{
          background: "#111",
          border: "1px solid rgba(196,147,78,0.25)",
          boxShadow: "0 0 60px rgba(196,147,78,0.08), 0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4" style={{ color: "rgba(196,147,78,0.9)" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(196,147,78,0.7)" }}>
              Premium
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: "rgba(255,255,255,0.92)" }}>
            Unlock the full experience
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Go deeper into Scripture with every study.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Billing toggle */}
          <div
            className="flex items-center mb-6 p-1 gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <button
              onClick={() => setIsYearly(false)}
              className="flex-1 py-1.5 text-xs font-medium transition-all"
              style={{
                background: !isYearly ? "rgba(255,255,255,0.08)" : "transparent",
                color: !isYearly ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className="flex-1 py-1.5 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              style={{
                background: isYearly ? "rgba(196,147,78,0.1)" : "transparent",
                color: isYearly ? "rgba(196,147,78,0.95)" : "rgba(255,255,255,0.4)",
              }}
            >
              Yearly
              <span
                className="text-[9px] font-bold px-1.5 py-0.5"
                style={{
                  background: "rgba(196,147,78,0.15)",
                  color: "rgba(196,147,78,0.85)",
                  border: "1px solid rgba(196,147,78,0.2)",
                }}
              >
                SAVE 16%
              </span>
            </button>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>
              {isYearly ? "$199" : "$19.90"}
            </span>
            <span className="text-sm ml-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {isYearly ? "/yr · billed yearly" : "/mo"}
            </span>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                <CircleCheck className="w-4 h-4 shrink-0" style={{ color: "#7EB89A" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{
              background: "rgba(196,147,78,0.9)",
              color: "#000",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "Redirecting…" : (
              <>
                {isYearly ? "Start Yearly Premium" : "Start Monthly Premium"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
            Cancel anytime · Secure checkout via Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
