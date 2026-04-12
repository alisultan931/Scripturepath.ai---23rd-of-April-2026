"use client";

import { AntiGravityCanvas } from "@/components/ui/particle-effect-for-hero";

const LETTERS = ["A","n","a","l","y","z","i","n","g"," ","y","o","u","r"," ","q","u","e","r","y"];

// Each letter's animation duration = total sweep time + pause before repeat
// 20 letters × 0.12s step = 2.4s sweep + 1s pause = 3.4s cycle
const STEP = 0.12;       // seconds between each letter's peak
const CYCLE = 3.4;       // full cycle duration (sweep + pause)

export default function AiLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <AntiGravityCanvas />
      <style>{`
        .loader {
          width: 360px;
          height: 360px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: loader-rotate 2s linear infinite;
          position: relative;
          background: #000000;
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
          display: flex;
          align-items: center;
          gap: 0.5px;
          animation: loader-counter-rotate 2s linear infinite;
        }

        @keyframes loader-counter-rotate {
          0%   { transform: rotate(-90deg); }
          50%  { transform: rotate(-270deg); }
          100% { transform: rotate(-450deg); }
        }

        .loader-letter {
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 400;
          letter-spacing: 0.03em;
          opacity: 0.3;
          /* Each letter uses the same total cycle so the sweep restarts cleanly */
          animation: loader-letter-anim ${CYCLE}s ease-in-out infinite;
        }

        @keyframes loader-letter-anim {
          /* Active window is roughly the first 25% of the cycle */
          0%   { opacity: 0.3; transform: translateY(0) scale(1); }
          8%   { opacity: 1;   transform: translateY(-5px) scale(1.18); }
          18%  { opacity: 0.5; transform: translateY(0) scale(1); }
          25%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="loader">
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

        <p className="text-white/40 text-sm font-light tracking-wide">
          Identifying passages, themes, and context…
        </p>
      </div>
    </div>
  );
}
