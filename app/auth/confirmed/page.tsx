"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmailConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold text-white">Thank you for confirming your email!</h1>
        <p className="text-white/60">You&apos;re all set. Redirecting you now...</p>
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
}
