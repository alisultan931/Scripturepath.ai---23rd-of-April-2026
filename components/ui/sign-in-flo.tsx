"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Star {
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

const STAR_DENSITY = 0.00012;
const MOUSE_RADIUS = 160;
const REPULSION = 5;

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative group">
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all duration-300 ease-in-out"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-200 group-focus-within:text-white">
          {icon}
        </div>
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent pl-10 pr-12 py-3 text-white placeholder:text-white/30 focus:outline-none"
          placeholder=""
        />

        <label className={`absolute left-10 pointer-events-none top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 ${
          value
            ? 'hidden'
            : isFocused
              ? 'text-white/60'
              : 'text-white/40'
        }`}>
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  );
};


const FloatingParticles: React.FC<{ mouseRef: React.RefObject<{ x: number; y: number; active: boolean }> }> = ({ mouseRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
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
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [initStars, mouseRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

type AuthMode = "signin" | "signup" | "forgot" | "forgot-sent" | "verify-sent";

export const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const router = useRouter();
  const supabase = createClient();

  const isSignUp = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) {
        if (error.status === 429 || error.message?.toLowerCase().includes("rate limit")) {
          setError("Too many requests. Please wait a few minutes before trying again.");
        } else {
          setError(error.message);
        }
        setIsSubmitting(false);
        return;
      }
      setMode("forgot-sent");
      setIsSubmitting(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setIsSubmitting(false);
        return;
      }
      setMode("verify-sent");
      setIsSubmitting(false);
      return;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setIsSubmitting(false);
        return;
      }
      router.push("/chat");
    }

    setIsSubmitting(false);
  };

  const handleResendVerification = async () => {
    setIsSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      if (error.status === 429 || error.message?.toLowerCase().includes("rate limit")) {
        setError("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setError(error.message);
      }
    } else {
      setError("Verification email resent. Check your inbox.");
    }
    setIsSubmitting(false);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
    setError(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  const headingMap: Record<AuthMode, string> = {
    signin: "Welcome Back",
    signup: "Create Account",
    forgot: "Reset Password",
    "forgot-sent": "Check Your Email",
    "verify-sent": "Verify Your Email",
  };

  const subheadingMap: Record<AuthMode, string> = {
    signin: "Sign in to continue",
    signup: "Sign up to get started",
    forgot: "Enter your email to receive a reset link",
    "forgot-sent": `We've sent a reset link to ${email}`,
    "verify-sent": `We've sent a confirmation link to ${email}`,
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <FloatingParticles mouseRef={mouseRef} />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {headingMap[mode]}
            </h1>
            <p className="text-white/60">
              {subheadingMap[mode]}
            </p>
          </div>

          {error && (
            <p className={`text-sm text-center mb-4 ${error === "Check your email to confirm your account." ? "text-yellow-400" : "text-red-400"}`}>{error}</p>
          )}

          {mode === "verify-sent" ? (
            <div className="space-y-4">
              <p className="text-sm text-white/60 text-center">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isSubmitting}
                  className="text-white hover:underline disabled:opacity-50"
                >
                  {isSubmitting ? "Sending…" : "resend the email"}
                </button>
                .
              </p>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : mode === "forgot-sent" ? (
            <div className="space-y-4">
              <p className="text-sm text-white/60 text-center">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-white hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <AnimatedFormField
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={18} />}
                />
              )}

              <AnimatedFormField
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />

              {mode !== "forgot" && (
                <AnimatedFormField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                />
              )}

              {mode === "signin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-sm text-white/60 hover:text-white hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group bg-white text-black py-3 px-4 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className={`transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                  {mode === "forgot" ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
                </span>

                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </button>

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="w-full text-sm text-white/60 hover:text-white transition-colors"
                >
                  Back to Sign In
                </button>
              )}
            </form>
          )}

          {(mode === "signin" || mode === "signup") && (
            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isSignUp ? "signin" : "signup")}
                  className="text-white hover:underline font-medium"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signin;
