import type { PlayerProfile, BugReport } from "../types";
import { RANKS } from "../types";
import { cn } from "../utils/cn";

interface Props {
  profile: PlayerProfile;
  totalXP: number;
  reports: BugReport[];
  onBack: () => void;
}

export default function Dashboard({ profile, totalXP, reports, onBack }: Props) {
  const rank = RANKS.filter(r => totalXP >= r.minXP).pop() || RANKS[0];
  const nextRank = RANKS.find(r => totalXP < r.minXP);
  const pctToNext = nextRank ? ((totalXP - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100 : 100;

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-4 py-8">
      <h2 className="font-mono text-2xl font-bold text-sky-300 sm:text-3xl">📊 QA Dashboard</h2>

      {/* Rank Card */}
      <div className="mt-6 w-full max-w-md rounded-2xl border border-sky-500/30 bg-slate-900/80 p-6 ring-1 ring-sky-400/20">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{rank.emoji}</span>
          <div>
            <p className="font-mono text-sm text-slate-400">Current Rank</p>
            <p className="font-mono text-xl font-bold text-white">{rank.name}</p>
          </div>
        </div>
        {nextRank && (
          <div className="mt-4">
            <div className="flex justify-between font-mono text-xs text-slate-400">
              <span>{totalXP} XP</span>
              <span>Next: {nextRank.name} ({nextRank.minXP} XP)</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all" style={{ width: `${pctToNext}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3">
        {[
          { label: "Bugs Found", value: profile.bugsFound, color: "text-emerald-300" },
          { label: "Total XP", value: totalXP, color: "text-amber-300" },
          { label: "Accuracy", value: `${profile.accuracy}%`, color: "text-sky-300" },
          { label: "Test Cases", value: profile.testCases, color: "text-violet-300" },
          { label: "Critical", value: profile.bugsCritical, color: "text-rose-300" },
          { label: "False Positives", value: profile.falsePositives, color: "text-slate-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-slate-900/60 p-4 ring-1 ring-slate-700/40">
            <p className={cn("font-mono text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="font-mono text-sm font-bold text-slate-300">Recent Reports</h3>
          <div className="mt-2 space-y-2">
            {reports.slice(-5).reverse().map((r, i) => (
              <div key={i} className="rounded-lg bg-slate-900/60 p-3 ring-1 ring-slate-700/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white">{r.title}</span>
                  <span className={cn("font-mono text-xs font-bold", r.valid ? "text-emerald-400" : "text-rose-400")}>
                    {r.valid ? `+${r.score} XP` : "Rejected"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-500">{r.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onBack} className="mt-8 font-mono text-sm text-slate-400 transition-colors hover:text-sky-300">
        ← Back to home
      </button>
    </div>
  );
}
