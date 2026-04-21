"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  canceling: boolean;
  periodEnd: string | null;
  error: string | null;
  isTrial?: boolean;
}

export default function CancelModal({ open, onClose, onConfirm, canceling, periodEnd, error, isTrial }: CancelModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !canceling) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, canceling]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === overlayRef.current && !canceling) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm"
        style={{
          background: "#111",
          border: "1px solid rgba(248,113,113,0.2)",
          boxShadow: "0 0 60px rgba(0,0,0,0.6), 0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          disabled={canceling}
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" style={{ color: "rgba(248,113,113,0.8)" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(248,113,113,0.6)" }}>
              {isTrial ? "Cancel Free Trial" : "Cancel Subscription"}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: "rgba(255,255,255,0.92)" }}>
            Are you sure?
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {isTrial
              ? "Your free trial will end immediately and you won't be charged. Your account will revert to the free plan."
              : periodEnd
                ? `You'll keep full Premium access until ${periodEnd}. After that, your account will revert to the free plan.`
                : "You'll keep full Premium access until the end of your current billing period."}
          </p>
        </div>

        <div className="px-8 py-6 space-y-3">
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm mb-2"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "rgba(248,113,113,0.9)" }}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={onConfirm}
            disabled={canceling}
            className="w-full py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "rgba(248,113,113,0.9)",
            }}
          >
            {canceling
              ? "Canceling…"
              : isTrial
                ? "Yes, cancel my free trial"
                : "Yes, cancel my subscription"}
          </button>

          <button
            onClick={onClose}
            disabled={canceling}
            className="w-full py-3 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {isTrial ? "Keep my free trial" : "Keep my plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
