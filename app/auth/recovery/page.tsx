"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RecoveryPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Handle hash-fragment redirect (Supabase implicit flow for recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/auth/reset-password");
      } else if (event === "SIGNED_IN") {
        // SIGNED_IN fires after PASSWORD_RECOVERY in some versions;
        // only redirect if there's a hash indicating recovery
        if (window.location.hash.includes("type=recovery")) {
          router.replace("/auth/reset-password");
        }
      }
    });

    // Fallback: if no auth event fires within 5s, the link is invalid
    const timeout = setTimeout(() => {
      router.replace("/signin?error=invalid_confirmation_link");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Verifying reset link...</p>
      </div>
    </div>
  );
}
