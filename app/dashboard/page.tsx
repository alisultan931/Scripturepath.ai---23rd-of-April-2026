"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen, Zap, Crown, Calendar, AlertCircle, CheckCircle2,
  ArrowRight, RefreshCw, Clock, BookMarked, ChevronRight, User, Lock, Eye, EyeOff,
} from "lucide-react";
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

interface PastStudy {
  id: string;
  title: string;
  scripture_ref: string;
  depth: string;
  credits_used: number;
  created_at: string;
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

// ── Inline feedback banner ────────────────────────────────────────────────────
function Banner({ type, children }: { type: "success" | "warn" | "error"; children: React.ReactNode }) {
  const styles = {
    success: { color: "#7EB89A", bg: "rgba(126,184,154,0.1)", border: "rgba(126,184,154,0.3)", Icon: CheckCircle2 },
    warn:    { color: "#E8A83E", bg: "rgba(232,168,62,0.08)",  border: "rgba(232,168,62,0.2)",  Icon: AlertCircle  },
    error:   { color: "rgba(248,113,113,0.9)", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", Icon: AlertCircle },
  }[type];

  return (
    <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-4"
      style={{ background: styles.bg, border: `1px solid ${styles.border}` }}>
      <styles.Icon className="w-4 h-4 shrink-0" style={{ color: styles.color }} />
      <p className="text-sm font-medium" style={{ color: styles.color }}>{children}</p>
    </div>
  );
}

// ── Password input with show/hide ─────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-10"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${DIV}`,
          color: H,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = `${G}55`)}
        onBlur={(e) => (e.currentTarget.style.borderColor = DIV)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
        style={{ color: M }}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("success") === "true";
  const justStartedTrial = searchParams.get("success") === "trial";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Past studies
  const [studies, setStudies] = useState<PastStudy[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(true);

  // Username change
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Password change
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/signin"); return; }

      const fullName: string | undefined = user.user_metadata?.full_name;
      const displayName = fullName ? fullName.split(" ")[0] : user.email?.split("@")[0] ?? "";
      setFirstName(displayName);
      setNewUsername(user.user_metadata?.full_name ?? "");
      setUserEmail(user.email ?? "");

      // Detect OAuth: no email identity means no password set
      const hasEmailIdentity = user.identities?.some((i) => i.provider === "email") ?? false;
      setIsOAuthUser(!hasEmailIdentity);

      const { data } = await supabase
        .from("profiles")
        .select("credits, subscription_status, subscription_plan, current_period_end, has_used_trial, trial_ends_at")
        .eq("id", user.id)
        .single();

      setProfile(data as Profile);
      setLoading(false);
    });

    // Load past studies
    fetch("/api/studies")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStudies(data);
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setStudiesLoading(false));
  }, [router]);

  const handleCancel = async () => {
    setCanceling(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", { method: "POST" });
      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.immediate) {
          setProfile((p) => p ? { ...p, subscription_status: "canceled", trial_ends_at: null } : p);
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

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) return;
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: newUsername.trim() } });
    if (error) {
      setUsernameError(error.message);
    } else {
      setFirstName(newUsername.trim().split(" ")[0]);
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    }
    setUsernameLoading(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();

    // For email users, verify current password first
    if (!isOAuthUser && currentPassword) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInErr) {
        setPasswordError("Current password is incorrect.");
        setPasswordLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setPasswordLoading(false);
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
      {/* Navbar */}
      <nav className="border-b" style={{ borderColor: DIV }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)", boxShadow: "0 0 8px rgba(214,168,95,0.55)" }}>
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

        {/* Status banners */}
        {justUpgraded && (
          <Banner type="success">
            Welcome to Premium! Your 30 credits have been added and your subscription is now active.
          </Banner>
        )}
        {justStartedTrial && (
          <Banner type="success">
            Your 7-day free trial has started! 10 credits added — enjoy Deep Dive access.
          </Banner>
        )}
        {cancelDone && profile?.subscription_status === "canceled" && (
          <Banner type="warn">
            Your free trial has been canceled. You won't be charged.
          </Banner>
        )}
        {cancelDone && profile?.subscription_status === "canceling" && (
          <Banner type="warn">
            Your subscription has been set to cancel at the end of your billing period.
            {periodEnd ? ` You still have full access until ${periodEnd}.` : " You still have full access until then."}
          </Banner>
        )}
        {renewError && <Banner type="error">{renewError}</Banner>}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 h-52 rounded-2xl animate-pulse" style={{ background: CBG }} />
              <div className="lg:col-span-2 h-52 rounded-2xl animate-pulse" style={{ background: CBG }} />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: CBG }} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">

            {/* ── Bento top grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">

              {/* Left: Credits hero (3/5) */}
              <div className="dashboard-card lg:col-span-3 rounded-2xl p-8 flex flex-col" style={{ background: CBG, border: `1px solid ${DIV}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: M }}>
                  Credits Remaining
                </p>

                <div className="flex items-end gap-3 mb-1">
                  <span className="text-[5rem] font-bold leading-none tabular-nums" style={{
                    color: H,
                    textShadow: `0 0 40px ${G}33`,
                  }}>
                    {profile?.credits ?? 0}
                  </span>
                  <span className="text-base mb-4" style={{ color: M }}>credits</span>
                </div>

                {/* Credit bar */}
                <div className="mt-2 mb-auto">
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: DIV }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(((profile?.credits ?? 0) / creditMax) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${G}55, ${G})`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: M }}>
                    {isTrial ? "10 credits / 7-day trial" : isPremium ? "30 credits / month" : "5 credits on free plan"}
                  </p>
                </div>

                {/* Bottom row: cost guide + studies breakdown */}
                {(() => {
                  const deepCount = studiesLoading ? 0 : studies.filter(s => s.depth === "deep_dive").length;
                  const normalCount = studiesLoading ? 0 : studies.length - deepCount;
                  return (
                    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${DIV}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: M }}>Study Stats</p>
                        <p className="text-[10px]" style={{ color: M }}>Normal = 1 cr &nbsp;·&nbsp; Deep Dive = 2 cr</p>
                      </div>
                      {!studiesLoading && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${DIV}` }}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: M }}>Normal</p>
                            <p className="text-xl font-bold tabular-nums leading-none" style={{ color: B }}>{normalCount}</p>
                          </div>
                          <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: GB, border: `1px solid ${GBD}` }}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: `${G}99` }}>Deep Dive</p>
                            <p className="text-xl font-bold tabular-nums leading-none" style={{ color: G }}>{deepCount}</p>
                          </div>
                          <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DIV}` }}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: M }}>Total</p>
                            <p className="text-xl font-bold tabular-nums leading-none" style={{ color: H }}>{studies.length}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right: Subscription (2/5) */}
              <div className="dashboard-card lg:col-span-2 rounded-2xl p-8 flex flex-col" style={{ background: CBG, border: `1px solid ${DIV}` }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: M }}>
                    Subscription
                  </p>
                  <StatusBadge status={profile?.subscription_status ?? null} />
                </div>

                <div className="flex-1 flex flex-col">
                  {isTrial ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 shrink-0" style={{ color: "#7EB89A" }} />
                        <span className="font-semibold text-sm" style={{ color: H }}>7-Day Free Trial</span>
                      </div>
                      <div className="space-y-2 mb-auto">
                        {trialDaysLeft !== null && (
                          <div className="flex items-start gap-2" style={{ color: M }}>
                            <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <p className="text-sm">
                              {trialDaysLeft === 0
                                ? "Ends today — you'll be charged after midnight"
                                : `Ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}`}
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
                        className="mt-6 text-sm transition-colors self-start"
                        style={{ color: M }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.9)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = M)}
                      >
                        Cancel free trial
                      </button>
                    </>
                  ) : isPremium ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-4 h-4 shrink-0" style={{ color: G }} />
                        <span className="font-semibold text-sm" style={{ color: H }}>Premium Plan</span>
                      </div>
                      <div className="space-y-2 mb-auto">
                        {periodEnd && profile?.subscription_status === "active" && (
                          <div className="flex items-start gap-2" style={{ color: M }}>
                            <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <p className="text-sm">Next invoice on <span style={{ color: B }}>{periodEnd}</span></p>
                          </div>
                        )}
                        {periodEnd && profile?.subscription_status === "canceling" && (
                          <div className="flex items-start gap-2" style={{ color: M }}>
                            <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <p className="text-sm">Access ends on <span style={{ color: "#E8A83E" }}>{periodEnd}</span></p>
                          </div>
                        )}
                        {profile?.subscription_plan && (
                          <p className="text-xs capitalize" style={{ color: M }}>
                            {profile.subscription_plan} billing
                          </p>
                        )}
                      </div>
                      {profile?.subscription_status === "active" && (
                        <button
                          onClick={() => { setCancelError(null); setShowCancelModal(true); }}
                          className="mt-6 text-sm transition-colors self-start"
                          style={{ color: M }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.9)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = M)}
                        >
                          Cancel subscription
                        </button>
                      )}
                      {profile?.subscription_status === "canceling" && (
                        <div className="mt-6">
                          <p className="text-xs mb-3" style={{ color: M }}>
                            No further charges. Changed your mind?
                          </p>
                          <button
                            onClick={handleRenew}
                            disabled={renewing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)", color: "#000", boxShadow: "0 0 12px rgba(214,168,95,0.35)" }}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${renewing ? "animate-spin" : ""}`} />
                            {renewing ? "Renewing…" : "Renew subscription"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-auto" style={{ color: B }}>
                        You're on the free plan. Upgrade for 30 credits/month and unlimited studies.
                      </p>
                      <div className="flex flex-col gap-2.5 mt-6">
                        {!profile?.has_used_trial && (
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)", color: "#000", boxShadow: "0 0 12px rgba(214,168,95,0.35)" }}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Start 7-Day Free Trial
                          </button>
                        )}
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                          style={profile?.has_used_trial ? {
                            background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                            color: "#000",
                            boxShadow: "0 0 12px rgba(214,168,95,0.35)",
                          } : { color: M, border: `1px solid ${DIV}` }}
                        >
                          {profile?.has_used_trial ? <><Zap className="w-3.5 h-3.5" /> Upgrade to Premium</> : "Upgrade now"}
                        </button>
                        <Link
                          href="/chat"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                          style={{ color: M, border: `1px solid ${DIV}` }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = B)}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = M)}
                        >
                          Continue with free <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Past Studies card ── */}
            <div className="dashboard-card rounded-2xl p-8" style={{ background: CBG, border: `1px solid ${DIV}` }}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: M }}>
                  Past Studies
                </p>
                {studies.length > 0 && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full tabular-nums"
                    style={{ color: M, background: "rgba(255,255,255,0.05)", border: `1px solid ${DIV}` }}>
                    {studies.length}
                  </span>
                )}
              </div>

              {studiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
                  ))}
                </div>
              ) : studies.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <BookMarked className="w-8 h-8 opacity-20" style={{ color: G }} />
                  <p className="text-sm text-center" style={{ color: M }}>
                    No studies yet. Head to the app and generate your first one.
                  </p>
                  <Link
                    href="/chat"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: G }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.75")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
                  >
                    Generate a study <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {studies.map((s) => (
                    <Link
                      key={s.id}
                      href={`/study/${s.id}`}
                      className="flex items-center gap-4 rounded-xl px-4 py-3.5 group transition-colors"
                      style={{ border: `1px solid transparent` }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = DIV;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                      }}
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: GB, border: `1px solid ${GBD}` }}>
                        <BookOpen className="w-3.5 h-3.5" style={{ color: G }} />
                      </div>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: H }}>
                          {s.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px]" style={{ color: M }}>{s.scripture_ref}</span>
                          <span style={{ color: DIV }}>·</span>
                          <span className="text-[11px]" style={{ color: M }}>
                            {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {s.depth === "deep_dive" && (
                            <>
                              <span style={{ color: DIV }}>·</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ color: G, background: GB }}>
                                Deep Dive
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: M }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ── Account Settings card ── */}
            <div className="dashboard-card rounded-2xl p-8" style={{ background: CBG, border: `1px solid ${DIV}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: M }}>
                Account Settings
              </p>

              {/* Username section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-3.5 h-3.5" style={{ color: `${G}99` }} />
                  <p className="text-sm font-semibold" style={{ color: H }}>Display Name</p>
                </div>

                {usernameSuccess && <Banner type="success">Display name updated.</Banner>}
                {usernameError && <Banner type="error">{usernameError}</Banner>}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Your name"
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${DIV}`, color: H }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${G}55`)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = DIV)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleUsernameChange(); }}
                  />
                  <button
                    onClick={handleUsernameChange}
                    disabled={usernameLoading || !newUsername.trim()}
                    className="px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)", color: "#000" }}
                  >
                    {usernameLoading ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: DIV, marginBottom: "2rem" }} />

              {/* Password section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-3.5 h-3.5" style={{ color: `${G}99` }} />
                  <p className="text-sm font-semibold" style={{ color: H }}>
                    {isOAuthUser ? "Add Password" : "Change Password"}
                  </p>
                </div>

                {isOAuthUser && (
                  <p className="text-xs mb-4" style={{ color: M }}>
                    Your account uses {userEmail ? `${userEmail.split("@")[0]}'s ` : ""}OAuth sign-in. You can add a password to also sign in with email.
                  </p>
                )}

                {passwordSuccess && <Banner type="success">{isOAuthUser ? "Password added successfully." : "Password changed successfully."}</Banner>}
                {passwordError && <Banner type="error">{passwordError}</Banner>}

                <div className="space-y-3">
                  {!isOAuthUser && (
                    <PasswordInput
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      placeholder="Current password"
                    />
                  )}
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="New password (min 8 characters)"
                  />
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !newPassword || !confirmPassword || (!isOAuthUser && !currentPassword)}
                  className="mt-4 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)", color: "#000" }}
                >
                  {passwordLoading ? "Saving…" : isOAuthUser ? "Add Password" : "Update Password"}
                </button>
              </div>
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
