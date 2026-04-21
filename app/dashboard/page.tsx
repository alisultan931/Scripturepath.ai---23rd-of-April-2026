"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Zap, Crown, Calendar, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, Clock } from "lucide-react";
import UpgradeModal from "@/components/ui/upgrade-modal";
import CancelModal from "@/components/ui/cancel-modal";

const H   = "rgba(255,255,255,0.92)";
const B   = "rgba(255,255,255,0.62)";
const M   = "rgba(255,255,255,0.35)";
const G   = "#C4934E";
const GB  = "rgba(196,147,78,0.12)";
const GBD = "rgba(196,147,78,0.22)";
const DIV = "rgba(255,255,255,0.07)";
const CBG = "#161616";
const PBG = "#0D0D0D";

interface Profile {
  credits: number;
  subscription_status: string | null;
  subscription_plan: string | null;
  current_period_end: string | null;
  has_used_trial: boolean;
  trial_ends_at: string | null;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status || status === "canceled") {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ color: M, background: "rgba(255,255,255,0.06)", border: `1px solid ${DIV}` }}>
        Free Plan
      </span>
    );
  }
  if (status === "trialing") {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
        style={{ color: "#7EB89A", background: "rgba(126,184,154,0.1)", border: "1px solid rgba(126,184,154,0.25)" }}>
        <Clock className="w-3 h-3" /> Free Trial
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
        style={{ color: G, background: GB, border: `1px solid ${GBD}` }}>
        <Crown className="w-3 h-3" /> Premium — Active
      </span>
    );
  }
  if (status === "canceling") {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
        style={{ color: "#E8A83E", background: "rgba(232,168,62,0.12)", border: "1px solid rgba(232,168,62,0.25)" }}>
        <AlertCircle className="w-3 h-3" /> Premium — Canceling
      </span>
    );
  }
  return null;
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("success") === "true";
  const justStartedTrial = searchParams.get("success") === "trial";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/signin"); return; }

      const fullName: string | undefined = user.user_metadata?.full_name;
      setFirstName(fullName ? fullName.split(" ")[0] : user.email?.split("@")[0] ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("credits, subscription_status, subscription_plan, current_period_end, has_used_trial, trial_ends_at")
        .eq("id", user.id)
        .single();

      setProfile(data as Profile);
      setLoading(false);
    });
  }, [router]);

  const handleCancel = async () => {
    setCanceling(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", { method: "POST" });
      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.immediate) {
          // Trial canceled immediately — webhook will update DB, reflect locally now
          setProfile((p) => p ? {
            ...p,
            subscription_status: "canceled",
            trial_ends_at: null,
            stripe_subscription_id: null,
          } : p);
        } else {
          setProfile((p) => p ? {
            ...p,
            subscription_status: "canceling",
            ...(body.current_period_end ? { current_period_end: body.current_period_end } : {}),
          } : p);
        }
        setCancelDone(true);
        setShowCancelModal(false);
      } else {
        const body = await res.json().catch(() => ({}));
        setCancelError(body.error ?? `Request failed (${res.status})`);
      }
    } catch {
      setCancelError("Network error — please try again.");
    }
    setCanceling(false);
  };

  const handleRenew = async () => {
    setRenewing(true);
    setRenewError(null);
    try {
      const res = await fetch("/api/stripe/renew-subscription", { method: "POST" });
      if (res.ok) {
        setProfile((p) => p ? { ...p, subscription_status: "active" } : p);
        setCancelDone(false);
      } else {
        const body = await res.json().catch(() => ({}));
        setRenewError(body.error ?? `Request failed (${res.status})`);
      }
    } catch {
      setRenewError("Network error — please try again.");
    }
    setRenewing(false);
  };

  const isTrial = profile?.subscription_status === "trialing";
  const isPremium =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "canceling" ||
    isTrial;

  const periodEnd = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const creditMax = isTrial ? 10 : isPremium ? 30 : 5;

  return (
    <>
    <div className="min-h-screen" style={{ background: PBG }}>
      {/* Minimal navbar */}
      <nav className="border-b" style={{ borderColor: DIV }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
          <Link href="/chat" className="text-sm transition-colors" style={{ color: M }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = B)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = M)}>
            ← Back to app
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-28">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${G}99` }}>
            Dashboard
          </p>
          <h1 className="text-[2rem] font-semibold tracking-tight" style={{ color: H }}>
            {loading ? "Loading…" : `Welcome back${firstName ? `, ${firstName}` : ""}`}
          </h1>
        </div>

        {justUpgraded && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8"
            style={{ background: "rgba(126,184,154,0.1)", border: "1px solid rgba(126,184,154,0.3)" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#7EB89A" }} />
            <p className="text-sm font-medium" style={{ color: "#7EB89A" }}>
              Welcome to Premium! Your 30 credits have been added and your subscription is now active.
            </p>
          </div>
        )}

        {justStartedTrial && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8"
            style={{ background: "rgba(126,184,154,0.1)", border: "1px solid rgba(126,184,154,0.3)" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#7EB89A" }} />
            <p className="text-sm font-medium" style={{ color: "#7EB89A" }}>
              Your 7-day free trial has started! 10 credits added — enjoy Deep Dive access.
            </p>
          </div>
        )}

        {cancelDone && profile?.subscription_status === "canceled" && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8"
            style={{ background: "rgba(232,168,62,0.08)", border: "1px solid rgba(232,168,62,0.2)" }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#E8A83E" }} />
            <p className="text-sm" style={{ color: "#E8A83E" }}>
              Your free trial has been canceled. You won't be charged.
            </p>
          </div>
        )}

        {cancelDone && profile?.subscription_status === "canceling" && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8"
            style={{ background: "rgba(232,168,62,0.08)", border: "1px solid rgba(232,168,62,0.2)" }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#E8A83E" }} />
            <p className="text-sm" style={{ color: "#E8A83E" }}>
              Your subscription has been set to cancel at the end of your billing period.{periodEnd ? ` You still have full access until ${periodEnd}.` : " You still have full access until then."}
            </p>
          </div>
        )}

        {renewError && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-8"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "rgba(248,113,113,0.9)" }} />
            <p className="text-sm" style={{ color: "rgba(248,113,113,0.9)" }}>{renewError}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: CBG }} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Credits card */}
            <div className="rounded-2xl p-8" style={{ background: CBG, border: `1px solid ${DIV}` }}>
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: M }}>
                    Credits Remaining
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="text-[3.5rem] font-bold leading-none tabular-nums" style={{ color: H }}>
                      {profile?.credits ?? 0}
                    </span>
                    <span className="text-sm mb-2" style={{ color: M }}>credits</span>
                  </div>
                  <p className="text-xs mt-3" style={{ color: M }}>
                    Normal study = 1 credit &nbsp;·&nbsp; Deep Dive = 2 credits
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <StatusBadge status={profile?.subscription_status ?? null} />
                  {profile?.subscription_plan && !isTrial && (
                    <p className="text-xs capitalize" style={{ color: M }}>
                      {profile.subscription_plan} billing
                    </p>
                  )}
                  {isTrial && trialDaysLeft !== null && (
                    <p className="text-xs" style={{ color: M }}>
                      {trialDaysLeft === 0 ? "Ends today" : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} remaining`}
                    </p>
                  )}
                </div>
              </div>

              {/* Credit bar */}
              <div className="mt-6">
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: DIV }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(((profile?.credits ?? 0) / creditMax) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${G}66, ${G})`,
                    }}
                  />
                </div>
                <p className="text-[10px] mt-1.5 text-right" style={{ color: M }}>
                  {isTrial ? "10 credits / 7-day trial" : isPremium ? "30 credits / month" : "5 credits on free plan"}
                </p>
              </div>
            </div>

            {/* Subscription card */}
            <div className="rounded-2xl p-8" style={{ background: CBG, border: `1px solid ${DIV}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: M }}>
                Subscription
              </p>

              {isTrial ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-4 h-4" style={{ color: "#7EB89A" }} />
                    <span className="font-semibold text-sm" style={{ color: H }}>7-Day Free Trial</span>
                    <StatusBadge status="trialing" />
                  </div>

                  <div className="space-y-2 mb-6">
                    {trialDaysLeft !== null && (
                      <div className="flex items-center gap-2" style={{ color: M }}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-sm">
                          {trialDaysLeft === 0
                            ? "Trial ends today — you'll be charged after midnight"
                            : `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}`}
                          {periodEnd && <span> on <span style={{ color: B }}>{periodEnd}</span></span>}
                        </p>
                      </div>
                    )}
                    {profile?.subscription_plan && (
                      <p className="text-xs" style={{ color: M }}>
                        After trial: auto-renews as {profile.subscription_plan} Premium
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => { setCancelError(null); setShowCancelModal(true); }}
                    className="text-sm transition-colors"
                    style={{ color: M }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.9)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = M)}
                  >
                    Cancel free trial
                  </button>
                </div>
              ) : isPremium ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-4 h-4" style={{ color: G }} />
                    <span className="font-semibold text-sm" style={{ color: H }}>Premium Plan</span>
                    <StatusBadge status={profile?.subscription_status ?? null} />
                  </div>

                  <div className="space-y-2">
                    {periodEnd && profile?.subscription_status === "active" && (
                      <div className="flex items-center gap-2" style={{ color: M }}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-sm">Next invoice on <span style={{ color: B }}>{periodEnd}</span></p>
                      </div>
                    )}
                    {periodEnd && profile?.subscription_status === "canceling" && (
                      <div className="flex items-center gap-2" style={{ color: M }}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-sm">Access ends on <span style={{ color: "#E8A83E" }}>{periodEnd}</span></p>
                      </div>
                    )}
                  </div>

                  {profile?.subscription_status === "active" && (
                    <button
                      onClick={() => { setCancelError(null); setShowCancelModal(true); }}
                      className="mt-6 text-sm transition-colors"
                      style={{ color: M }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.9)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = M)}
                    >
                      Cancel subscription
                    </button>
                  )}

                  {profile?.subscription_status === "canceling" && (
                    <div className="mt-6">
                      <p className="text-xs mb-4" style={{ color: M }}>
                        No further charges will be made. Changed your mind?
                      </p>
                      <button
                        onClick={handleRenew}
                        disabled={renewing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                          color: "#000",
                          boxShadow: "0 0 12px rgba(214,168,95,0.35)",
                        }}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${renewing ? "animate-spin" : ""}`} />
                        {renewing ? "Renewing…" : "Renew subscription"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-5" style={{ color: B }}>
                    You're on the free plan. Upgrade to Premium for 30 credits per month and unlimited studies.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {!profile?.has_used_trial && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                        style={{
                          background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                          color: "#000",
                          boxShadow: "0 0 12px rgba(214,168,95,0.35)",
                        }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Start 7-Day Free Trial
                      </button>
                    )}
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                      style={profile?.has_used_trial ? {
                        background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                        color: "#000",
                        boxShadow: "0 0 12px rgba(214,168,95,0.35)",
                      } : {
                        color: M,
                        border: `1px solid ${DIV}`,
                      }}
                    >
                      {profile?.has_used_trial ? <><Zap className="w-3.5 h-3.5" /> Upgrade to Premium</> : "Upgrade now"}
                    </button>
                    <Link
                      href="/chat"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                      style={{ color: M, border: `1px solid ${DIV}` }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = B)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = M)}
                    >
                      Continue with free <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    <UpgradeModal
      open={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      hasUsedTrial={profile?.has_used_trial ?? false}
    />
    <CancelModal
      open={showCancelModal}
      onClose={() => setShowCancelModal(false)}
      onConfirm={handleCancel}
      canceling={canceling}
      periodEnd={periodEnd}
      error={cancelError}
      isTrial={isTrial}
    />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
