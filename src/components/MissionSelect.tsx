import { getLevelBandInfo, MAX_LEVEL } from "../game/apps";
import { cn } from "../utils/cn";

interface Props {
  highestUnlockedLevel: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

const BAND_ICONS = ["🔐", "🛒", "🏦"];
const BAND_NAMES = ["Authentication System", "E-Commerce System", "Banking Application"];

export default function MissionSelect({ highestUnlockedLevel, onSelectLevel, onBack }: Props) {
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-4 py-8">
      <h2 className="font-mono text-2xl font-bold text-sky-300 sm:text-3xl">
        🎚️ Level Ladder
      </h2>
      <p className="mt-2 max-w-lg text-center font-mono text-sm text-slate-400">
        Clear a level to unlock the next. Every level is a little harder than the last —
        fewer free hints, less time, bigger XP.
      </p>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-slate-900/60 px-4 py-2 ring-1 ring-slate-700/40">
        {BAND_ICONS.map((icon, i) => (
          <span key={i} className="font-mono text-xs text-slate-400">
            {icon} {BAND_NAMES[i]}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-2 ring-1 ring-emerald-400/20">
        <span className="font-mono text-xs font-bold text-emerald-300">
          🏁 Currently unlocked: Level {highestUnlockedLevel} / {MAX_LEVEL}
        </span>
      </div>

      {/* Level grid */}
      <div className="mt-6 grid w-full grid-cols-5 gap-2 sm:grid-cols-10">
        {levels.map(lvl => {
          const locked = lvl > highestUnlockedLevel;
          const cleared = lvl < highestUnlockedLevel;
          const current = lvl === highestUnlockedLevel;
          const { bandIndex } = getLevelBandInfo(lvl);
          return (
            <button
              key={lvl}
              onClick={() => !locked && onSelectLevel(lvl)}
              disabled={locked}
              title={locked ? `Locked — clear level ${lvl - 1} first` : `${BAND_NAMES[bandIndex]} · Level ${lvl}`}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg font-mono text-xs font-bold transition-all",
                locked
                  ? "cursor-not-allowed bg-slate-900/40 text-slate-700 ring-1 ring-slate-800"
                  : current
                    ? "bg-sky-500/20 text-sky-200 ring-2 ring-sky-400/70 hover:bg-sky-500/30 active:scale-95"
                    : cleared
                      ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 active:scale-95"
                      : "bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/60 active:scale-95"
              )}
            >
              {locked ? "🔒" : cleared ? "✓" : BAND_ICONS[bandIndex]}
              <span className="mt-0.5">{lvl}</span>
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