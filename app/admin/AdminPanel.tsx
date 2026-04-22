"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Gift, CheckCircle2, AlertCircle, Shield } from "lucide-react";

const H   = "rgba(255,255,255,0.92)";
const B   = "rgba(255,255,255,0.62)";
const M   = "rgba(255,255,255,0.35)";
const G   = "#C4934E";
const GB  = "rgba(196,147,78,0.12)";
const GBD = "rgba(196,147,78,0.22)";
const DIV = "rgba(255,255,255,0.07)";
const CBG = "#161616";
const PBG = "#0D0D0D";

type Status = "idle" | "loading" | "success" | "error";

interface Result {
  email: string;
  credited: number;
  newBalance: number;
}

export default function AdminPanel() {
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    const amount = parseInt(credits, 10);
    if (!email.trim() || isNaN(amount) || amount < 1) {
      setErrorMsg("Please enter a valid email and a positive credit amount.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/admin/gift-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), credits: amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? `Request failed (${res.status})`);
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("success");
      setEmail("");
      setCredits("");
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: PBG }}>
      {/* Navbar */}
      <nav className="border-b" style={{ borderColor: DIV }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div
              className="w-6 h-6 rounded-sm flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                boxShadow: "0 0 8px rgba(214,168,95,0.55)",
              }}
            >
              <BookOpen className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm" style={{ color: "#D6A85F" }}>ScripturePath</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="text-sm transition-colors"
              style={{ color: M }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = B)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = M)}
            >
              ← Back to app
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ color: G, background: GB, border: `1px solid ${GBD}` }}>
              <Shield className="w-3 h-3" />
              Admin
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-28">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${G}99` }}>
            Admin Panel
          </p>
          <h1 className="text-[2rem] font-semibold tracking-tight" style={{ color: H }}>
            Gift Credits
          </h1>
          <p className="mt-2 text-sm" style={{ color: M }}>
            Add credits to any user account by email.
          </p>
        </div>

        {/* Success banner */}
        {status === "success" && result && (
          <div
            className="flex items-start gap-3 rounded-xl px-5 py-4 mb-6"
            style={{ background: "rgba(126,184,154,0.1)", border: "1px solid rgba(126,184,154,0.25)" }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#7EB89A" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#7EB89A" }}>Credits gifted successfully</p>
              <p className="text-xs mt-1" style={{ color: "rgba(126,184,154,0.75)" }}>
                <span style={{ color: B }}>{result.email}</span> received{" "}
                <span style={{ color: H }}>{result.credited} credits</span>.
                New balance: <span style={{ color: H }}>{result.newBalance}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {status === "error" && errorMsg && (
          <div
            className="flex items-start gap-3 rounded-xl px-5 py-4 mb-6"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(248,113,113,0.9)" }} />
            <p className="text-sm font-medium" style={{ color: "rgba(248,113,113,0.9)" }}>{errorMsg}</p>
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl p-8" style={{ background: CBG, border: `1px solid ${DIV}` }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GB, border: `1px solid ${GBD}` }}>
              <Gift className="w-4 h-4" style={{ color: G }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: H }}>Gift Credits to User</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: M }}>
                User Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${DIV}`,
                  color: H,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${G}55`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = DIV)}
              />
            </div>

            {/* Credits */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: M }}>
                Credits to Add
              </label>
              <input
                type="number"
                required
                min={1}
                max={10000}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="e.g. 10"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${DIV}`,
                  color: H,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${G}55`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = DIV)}
              />
              <p className="mt-1.5 text-[11px]" style={{ color: M }}>
                Credits are added on top of the user's current balance.
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !email.trim() || !credits}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                color: "#000",
                boxShadow: "0 0 16px rgba(214,168,95,0.3)",
              }}
            >
              {status === "loading" ? "Gifting…" : "Gift Credits"}
            </button>
          </form>
        </div>

        {/* Info footer */}
        <p className="mt-6 text-xs text-center" style={{ color: M }}>
          Credits are added atomically and take effect immediately.
          Normal studies cost 1 credit · Deep Dive studies cost 2 credits.
        </p>
      </div>
    </div>
  );
}
