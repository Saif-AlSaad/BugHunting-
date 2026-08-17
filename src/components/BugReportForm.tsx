import { useState } from "react";
import type { Bug, Severity } from "../types";
import { cn } from "../utils/cn";

interface Props {
  bug: Bug;
  onSubmit: (title: string, severity: Severity, steps: string, expected: string, actual: string) => void;
  onCancel: () => void;
}

const SEVERITY_OPTIONS: { value: Severity; label: string; emoji: string; color: string }[] = [
  { value: "critical", label: "Critical", emoji: "🔴", color: "border-rose-400 bg-rose-500/10 text-rose-300" },
  { value: "high", label: "High", emoji: "🟠", color: "border-amber-400 bg-amber-500/10 text-amber-300" },
  { value: "medium", label: "Medium", emoji: "🟡", color: "border-sky-400 bg-sky-500/10 text-sky-300" },
  { value: "low", label: "Low", emoji: "🟢", color: "border-emerald-400 bg-emerald-500/10 text-emerald-300" },
];

export default function BugReportForm({ bug, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(bug.title);
  const [severity, setSeverity] = useState<Severity>(bug.severity);
  const [steps, setSteps] = useState("1. Open the application\n2. Navigate to the feature\n3. Perform the action\n4. Observe the result");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fade-in-up rounded-2xl border border-slate-700/50 bg-slate-900/95 p-6 shadow-2xl">
        <h3 className="font-mono text-lg font-bold text-sky-300">🐛 Submit Bug Report</h3>
        <p className="mt-1 font-mono text-xs text-slate-500">Discovered: {bug.title}</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="font-mono text-xs text-slate-400">Bug Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400" />
          </div>

          <div>
            <label className="font-mono text-xs text-slate-400">Severity</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {SEVERITY_OPTIONS.map(s => (
                <button key={s.value} onClick={() => setSeverity(s.value)}
                  className={cn("rounded-lg border px-2 py-2 font-mono text-center text-xs transition-all",
                    severity === s.value ? s.color : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                  <span className="block">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-xs text-slate-400">Steps to Reproduce</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-xs text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
              rows={4} />
          </div>

          <div>
            <label className="font-mono text-xs text-slate-400">Expected Result</label>
            <input value={expected} onChange={e => setExpected(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
              placeholder="What should happen?" />
          </div>

          <div>
            <label className="font-mono text-xs text-slate-400">Actual Result</label>
            <input value={actual} onChange={e => setActual(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
              placeholder="What actually happened?" />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={() => onSubmit(title, severity, steps, expected, actual)}
            className="flex-1 rounded-lg bg-emerald-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95">
            📤 Submit Report
          </button>
          <button onClick={onCancel}
            className="rounded-lg bg-slate-700 px-4 py-2 font-mono text-sm text-slate-300 transition-all hover:bg-slate-600 active:scale-95">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
