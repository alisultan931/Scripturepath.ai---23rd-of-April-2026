"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AiLoader from "@/components/ui/ai-loader";
import { StudyContent, StudyData, PBG, M, G } from "@/components/study/study-renderer";

interface SavedStudy {
  id: string;
  title: string;
  scripture_ref: string;
  depth: string;
  study_data: StudyData;
  created_at: string;
}

export default function SavedStudyPage() {
  const { id } = useParams<{ id: string }>();
  const [study, setStudy] = useState<SavedStudy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/studies/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudy(data as SavedStudy);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load study");
      });
  }, [id]);

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

  return (
    <StudyContent
      study={study.study_data}
      title={study.title}
      passage={study.scripture_ref}
      description=""
      depth={study.depth}
      backHref="/dashboard"
    />
  );
}
