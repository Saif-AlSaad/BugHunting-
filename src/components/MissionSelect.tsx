import type { Mission } from "../types";
import { cn } from "../utils/cn";

interface Props {
  missions: Mission[];
  completedMissions: string[];
  onSelect: (m: Mission) => void;
  onBack: () => void;
}

const DIFFICULTY_LABELS = ["Beginner", "Intermediate", "Advanced"];
const DIFFICULTY_COLORS = ["text-emerald-400", "text-amber-400", "text-rose-400"];

export default function MissionSelect({ missions, completedMissions, onSelect, onBack }: Props) {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-4 py-8">
      <h2 className="font-mono text-2xl font-bold text-sky-300 sm:text-3xl">
        📋 Select Testing Assignment
      </h2>
      <p className="mt-2 font-mono text-sm text-slate-400">Choose an application to investigate for bugs.</p>

      <div className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {missions.map((m, i) => {
          const done = completedMissions.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              disabled={done}
              className={cn(
                "group flex flex-col rounded-2xl border p-5 text-left transition-all duration-300",
                done
                  ? "cursor-not-allowed border-emerald-500/30 bg-emerald-500/5 opacity-60"
                  : "border-slate-700/50 bg-slate-900/60 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_10px_40px_rgba(56,189,248,0.15)] hover:bg-slate-800/80"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{m.icon}</span>
                {done && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">DONE</span>}
              </div>
              <h3 className="mt-3 font-mono text-base font-bold text-white">{m.title}</h3>
              <span className={cn("mt-1 font-mono text-xs font-bold", DIFFICULTY_COLORS[m.difficulty - 1])}>
                {DIFFICULTY_LABELS[m.difficulty - 1]}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{m.description.slice(0, 120)}...</p>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-700/50 pt-3">
                <span className="text-[10px] text-slate-500">🏢 {m.clientName}</span>
                <span className="text-[10px] text-slate-500">📌 {m.sprintName}</span>
                <span className="text-[10px] text-slate-500 ml-auto">🐛 {m.bugs.length} hidden bugs</span>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={onBack} className="mt-8 font-mono text-sm text-slate-400 transition-colors hover:text-sky-300">
        ← Back to home
      </button>
    </div>
  );
}
