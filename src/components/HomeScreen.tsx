import { useState, useEffect } from "react";
import type { PlayerProfile } from "../types";
import { cn } from "../utils/cn";

interface HomeScreenProps {
  profile: PlayerProfile;
  totalXP: number;
  onStart: () => void;
  onDashboard: () => void;
  onAchievements: () => void;
}

export default function HomeScreen({ profile, totalXP, onStart, onDashboard, onAchievements }: HomeScreenProps) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0e1a] px-4 text-center">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0e1a]/80 to-[#0a0e1a]" />

      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
      }} />

      <div className="relative z-10 max-w-2xl">
        <div className={cn("transition-all duration-700", loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
          <div className="mb-4 text-6xl sm:text-7xl">🐛</div>
          <h1 className="font-mono text-4xl font-black tracking-tight text-sky-300 sm:text-6xl">
            BUG HUNTER
          </h1>
          <p className="mt-3 font-mono text-lg italic text-emerald-400/80 sm:text-xl">
            &ldquo;Everything works perfectly.&rdquo;
          </p>
          <p className="mt-1 font-mono text-sm font-bold tracking-[0.2em] text-amber-400/70">
            ── OR DOES IT? ──
          </p>
        </div>

        <p className={cn("mt-6 max-w-lg font-mono text-sm leading-relaxed text-slate-400 transition-all duration-700 sm:text-base", loaded ? "translate-y-0 opacity-100 delay-300" : "translate-y-8 opacity-0")}>
          You are a QA tester. Investigate fictional applications, discover hidden bugs, reproduce them, document your findings, and earn your rank in the world of software testing.
        </p>

        {totalXP > 0 && (
          <div className={cn("mt-5 inline-flex items-center gap-3 rounded-xl bg-slate-900/60 px-4 py-2 ring-1 ring-sky-500/30 transition-all duration-700", loaded ? "translate-y-0 opacity-100 delay-500" : "translate-y-8 opacity-0")}>
            <span className="text-lg">{profile.rank.split(" ")[0]}</span>
            <span className="font-mono text-xs text-slate-500">|</span>
            <span className="font-mono text-sm text-amber-300">{totalXP} XP</span>
            <span className="font-mono text-xs text-slate-500">|</span>
            <span className="font-mono text-sm text-emerald-300">{profile.bugsFound} bugs</span>
          </div>
        )}

        <div className={cn("mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center transition-all duration-700", loaded ? "translate-y-0 opacity-100 delay-700" : "translate-y-8 opacity-0")}>
          <button
            onClick={onStart}
            className="group w-full max-w-xs rounded-xl bg-gradient-to-b from-sky-500/20 to-sky-800/30 px-6 py-3 font-mono text-sm font-bold tracking-wider text-sky-200 ring-2 ring-sky-400/50 transition-all hover:from-sky-400/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] active:scale-95 sm:w-auto"
          >
            ▶ Start Testing
          </button>
          {totalXP > 0 && (
            <>
              <button
                onClick={onDashboard}
                className="w-full max-w-xs rounded-xl bg-slate-800/50 px-6 py-3 font-mono text-sm font-semibold tracking-wider text-slate-300 ring-1 ring-slate-600/40 transition-all hover:bg-slate-700/50 active:scale-95 sm:w-auto"
              >
                📊 Dashboard
              </button>
              <button
                onClick={onAchievements}
                className="w-full max-w-xs rounded-xl bg-slate-800/50 px-6 py-3 font-mono text-sm font-semibold tracking-wider text-slate-300 ring-1 ring-slate-600/40 transition-all hover:bg-slate-700/50 active:scale-95 sm:w-auto"
              >
                🏆 Achievements
              </button>
            </>
          )}
        </div>

        <p className={cn("mt-6 font-mono text-[10px] text-slate-600 transition-all duration-700", loaded ? "translate-y-0 opacity-100 delay-[900ms]" : "translate-y-8 opacity-0")}>
          Test apps • Find bugs • Write reports • Level up
        </p>
      </div>
    </div>
  );
}
