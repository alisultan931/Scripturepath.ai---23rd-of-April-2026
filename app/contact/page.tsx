"use client";

import { useState } from "react";
import { Navigation } from "@/components/ui/particle-effect-for-hero";
import Footer from "@/components/ui/footer";
import { Mail, MessageSquare, ArrowRight } from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-16">
        <Navigation showNavLinks={false} />
      </div>

      <main className="mx-auto max-w-2xl px-6 py-20">
        {/* Header */}
        <div className="mb-16 text-center">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
              boxShadow: "0 0 24px rgba(214,168,95,0.3)",
            }}
          >
            <MessageSquare className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <p
            className="mb-3 text-xs font-mono uppercase tracking-widest"
            style={{ color: "#D6A85F" }}
          >
            Get in touch
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Have a question, found a bug, or want to share feedback?
            <br />
            We read every message.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(214,168,95,0.12)" }}
            >
              <Mail className="h-5 w-5" style={{ color: "#D6A85F" }} />
            </div>
            <h2 className="text-xl font-semibold">Message received</h2>
            <p className="mt-3 text-sm text-white/50">
              Thanks for reaching out. We'll get back to you within 1–2 business
              days.
            </p>
            <button
              onClick={() => {
                setForm({ name: "", email: "", message: "" });
                setStatus("idle");
              }}
              className="mt-8 text-sm text-white/40 underline underline-offset-4 hover:text-white/70 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6"
          >
            {/* Name + Email row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Calvin"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.07]"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.07]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
                boxShadow: "0 0 20px rgba(214,168,95,0.25)",
              }}
            >
              {status === "sending" ? (
                "Sending..."
              ) : (
                <>
                  Send Message <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Direct email fallback */}
        <p className="mt-8 text-center text-xs text-white/30">
          Or email us directly at{" "}
          <a
            href="mailto:hello@stellaflo.com"
            className="text-white/50 underline underline-offset-4 hover:text-white/70 transition-colors"
          >
            hello@stellaflo.com
          </a>
        </p>
      </main>

      <Footer />
    </div>
  );
}
