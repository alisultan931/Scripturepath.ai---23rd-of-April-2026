"use client";

import { useEffect, useState } from "react";
import { AntiGravityCanvas } from "@/components/ui/particle-effect-for-hero";

const LETTERS = ["A","n","a","l","y","z","i","n","g"," ","y","o","u","r"," ","q","u","e","r","y"];

const STATUS_LINES = [
  "Identifying passages, themes, and context…",
  "Scanning canonical and deuterocanonical texts…",
  "Cross-referencing parallel scriptures…",
  "Mapping theological connections…",
  "Tracing historical and cultural context…",
  "Analyzing linguistic patterns in original languages…",
  "Surfacing related commentary and doctrine…",
  "Reconciling variant manuscript traditions…",
  "Synthesizing insights across traditions…",
  "Preparing your personalized study path…",
];

const STEP  = 0.15;   // gap between each letter's peak (s)
const CYCLE = 6.0;    // full cycle: 20 × 0.15 = 3s sweep + 3s rest

const STATUS_INTERVAL = 2200; // ms per status line

export default function AiLoader() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
        setVisible(true);
      }, 350);
    }, STATUS_INTERVAL);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <AntiGravityCanvas />
      <style>{`
        .loader {
          width: 360px;
          height: 360px;
          border-radius: 50%;
          animation: loader-rotate 2s linear infinite;
          background: #000000;
          flex-shrink: 0;
        }

        @keyframes loader-rotate {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 10px 0 #d60a47 inset,
              0 40px 60px 0 #311e80 inset;
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
        }

        .loader-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .loader-letter {
          font-size: 1.1rem;
          font-weight: 400;
          color: #ffffff;
          opacity: 0.2;
          animation: letter-wave ${CYCLE}s ease-in-out infinite;
        }

        @keyframes letter-wave {
          0%        { opacity: 0.2; text-shadow: none; }
          15%       { opacity: 1;   text-shadow: 0 0 16px rgba(255,255,255,0.35); }
          32%       { opacity: 0.2; text-shadow: none; }
          100%      { opacity: 0.2; text-shadow: none; }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="loader" />
          <div className="loader-text">
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className="loader-letter"
                style={{ animationDelay: `${i * STEP}s` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
        </div>

        <p
          className="text-white/40 text-sm font-light tracking-wide transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {STATUS_LINES[statusIndex]}
        </p>
      </div>
    </div>
  );
}
