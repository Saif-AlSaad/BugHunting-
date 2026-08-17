import type { Mission, BugReport } from "../types";
import { cn } from "../utils/cn";

interface Props {
  mission: Mission;
  discoveredCount: number;
  totalBugs: number;
  reports: BugReport[];
  timeUsed: number;
  xpEarned: number;
  accuracy: number;
  onContinue: () => void;
  onHome: () => void;
}

export default function MissionComplete({ mission, discoveredCount, totalBugs, reports, timeUsed, xpEarned, accuracy, onContinue, onHome }: Props) {
  const validCount = reports.filter(r => r.valid).length;
  const falseCount = reports.filter(r => !r.valid).length;
  const mins = Math.floor(timeUsed / 60);
  const secs = timeUsed % 60;

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-emerald-400/20 sm:p-8">
        <div className="text-center">
          <p className="text-5xl">🏁</p>
          <h2 className="mt-3 font-mono text-2xl font-bold text-emerald-300 sm:text-3xl">Sprint Complete!</h2>
          <p className="mt-1 font-mono text-sm text-slate-400">{mission.title} · {mission.sprintName}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Bugs Found", value: `${discoveredCount}/${totalBugs}`, color: "text-emerald-300" },
            { label: "Valid Reports", value: validCount, color: "text-sky-300" },
            { label: "False Positives", value: falseCount, color: "text-rose-300" },
            { label: "Accuracy", value: `${accuracy}%`, color: "text-amber-300" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-slate-800/60 p-3 ring-1 ring-slate-700/40 text-center">
              <p className={cn("font-mono text-xl font-bold", s.color)}>{s.value}</p>
              <p className="mt-1 font-mono text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-amber-300">⏱ Time Used</span>
            <span className="font-mono text-lg font-bold text-amber-200">{mins}m {secs}s</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-sm text-emerald-300">XP Earned</span>
            <span className="font-mono text-2xl font-bold text-emerald-200">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Report details */}
        {reports.length > 0 && (
          <div className="mt-4">
            <h4 className="font-mono text-sm font-bold text-slate-300">Reports Submitted</h4>
            <div className="mt-2 space-y-1">
              {reports.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono text-xs", r.valid ? "text-emerald-300" : "text-rose-300")}>
                      {r.valid ? "✅" : "❌"}
                    </span>
                    <span className="font-mono text-xs text-slate-200">{r.title}</span>
                  </div>
                  <span className={cn("font-mono text-xs", r.valid ? "text-emerald-300" : "text-rose-300")}>
                    {r.valid ? `+${r.score}` : "−30"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={onContinue}
            className="rounded-xl bg-gradient-to-b from-sky-500/20 to-sky-800/30 px-6 py-3 font-mono text-sm font-bold text-sky-200 ring-2 ring-sky-400/50 transition-all hover:from-sky-400/30 active:scale-95">
            Continue Testing
          </button>
          <button onClick={onHome}
            className="rounded-xl bg-slate-800/50 px-6 py-3 font-mono text-sm font-semibold text-slate-300 ring-1 ring-slate-600/40 transition-all hover:bg-slate-700/50 active:scale-95">
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
