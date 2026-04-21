"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AiLoader from "@/components/ui/ai-loader";
import { StudyContent, StudyData, PBG, M, G } from "@/components/study/study-renderer";

function StudyPageInner() {
  const searchParams = useSearchParams();
  const [study, setStudy] = useState<StudyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title       = searchParams.get("title")       ?? "";
  const passage     = searchParams.get("passage")     ?? "";
  const description = searchParams.get("description") ?? "";
  const theme       = searchParams.get("theme")       ?? "";
  const audience    = searchParams.get("audience")    ?? "";
  const tone        = searchParams.get("tone")        ?? "";
  const depth       = searchParams.get("depth")       ?? "normal";

  useEffect(() => {
    if (!passage) return;
    const controller = new AbortController();
    fetch("/api/generate-study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, passage, description, theme, audience, tone, depth }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudy(data as StudyData);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to generate study");
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PBG }}>
        <div className="text-center space-y-4">
          <p style={{ color: M }}>{error}</p>
          <button onClick={() => window.history.back()} className="text-sm hover:underline" style={{ color: G }}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!study) return <AiLoader />;
  return <StudyContent study={study} title={title} passage={passage} description={description} depth={depth} />;
}

export default function StudyPage() {
  return (
    <Suspense fallback={<AiLoader />}>
      <StudyPageInner />
    </Suspense>
  );
}
