import { useEffect, useRef, useState } from "react";
import type {
  Bug, BugReport, Mission, PlayerProfile, Screen, Severity, TestEnvState,
} from "./types";
import { RANKS, ACHIEVEMENT_TEMPLATES } from "./types";
import { ALL_MISSIONS, INITIAL_ENV, getLevelModifiers, getLevelMission, MAX_LEVEL } from "./game/apps";
import { cn } from "./utils/cn";
import HomeScreen from "./components/HomeScreen";
import MissionSelect from "./components/MissionSelect";
import TestEnvironment from "./components/TestEnvironment";
import BugReportForm from "./components/BugReportForm";
import MissionComplete from "./components/MissionComplete";
import Dashboard from "./components/Dashboard";

const loadProfile = (): PlayerProfile => {
  try {
    const d = localStorage.getItem("bh_profile");
    if (d) {
      const p = JSON.parse(d);
      return { hintsUsed: 0, highestUnlockedLevel: 1, ...p };
    }
  } catch { /* ignore */ }
  return {
    xp: 0, rank: "QA Intern", bugsFound: 0, bugsCritical: 0, bugsHigh: 0,
    bugsMedium: 0, bugsLow: 0, falsePositives: 0, totalReports: 0,
    testCases: 3, accuracy: 100, achievements: ACHIEVEMENT_TEMPLATES.map(a => ({ ...a })),
    hintsUsed: 0, highestUnlockedLevel: 1,
  };
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [mission, setMission] = useState<Mission | null>(null);
  const [env, setEnv] = useState<TestEnvState>(INITIAL_ENV());
  const [discoveredBugs, setDiscoveredBugs] = useState<string[]>([]);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [reportBug, setReportBug] = useState<Bug | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeUsed, setTimeUsed] = useState(0);
  const [missionReports, setMissionReports] = useState<BugReport[]>([]);
  const [missionXP, setMissionXP] = useState(0);
  const [hintText, setHintText] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // The level currently being played (1-100). Must be <= profile.highestUnlockedLevel.
  const [level, setLevel] = useState<number>(1);
  const levelMods = getLevelModifiers(level);

  // Result of the most recently finished level, shown on the MissionComplete screen.
  const [lastResult, setLastResult] = useState<{ cleared: boolean; leveledUp: boolean }>({ cleared: false, leveledUp: false });

  // Hint tracking for the level in progress
  const [hintsUsedThisMission, setHintsUsedThisMission] = useState(0);
  const [hintBugId, setHintBugId] = useState<string | null>(null);
  const [hintStepForBug, setHintStepForBug] = useState(0);

  // Consecutive valid, no-hint-since-last-report streak (grants a small XP bonus)
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist profile
  useEffect(() => {
    try { localStorage.setItem("bh_profile", JSON.stringify(profile)); } catch { /* */ }
  }, [profile]);

  // Timer
  useEffect(() => {
    if (screen !== "testing" || !mission) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) return 0;
        return t - 1;
      });
      setTimeUsed(u => u + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, mission]);

  // Check time up
  useEffect(() => {
    if (timeLeft <= 0 && screen === "testing" && mission) {
      finishMission();
    }
  }, [timeLeft]);

  function notify(text: string) {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  }

  function streakMultiplier(s: number) {
    if (s >= 8) return 2;
    if (s >= 5) return 1.5;
    if (s >= 3) return 1.2;
    return 1;
  }

  function startLevel(lvl: number) {
    const clamped = Math.min(Math.max(lvl, 1), MAX_LEVEL);
    const scaled = getLevelMission(clamped, ALL_MISSIONS);
    setLevel(clamped);
    setMission(scaled);
    setEnv(INITIAL_ENV());
    setDiscoveredBugs([]);
    setReports([]);
    setMissionReports([]);
    setMissionXP(0);
    setTimeLeft(scaled.timeLimit);
    setTimeUsed(0);
    setHintsUsedThisMission(0);
    setHintBugId(null);
    setHintStepForBug(0);
    setHintText(null);
    setStreak(0);
    setBestStreak(0);
    setScreen("testing");
  }

  function handleBugFound(bug: Bug) {
    setDiscoveredBugs(prev => [...prev, bug.id]);
    notify(`🐛 Bug Discovered! ${bug.title} (${bug.severity.toUpperCase()} — ${bug.xpReward} XP potential)`);
    if (hintBugId === bug.id) {
      setHintBugId(null);
      setHintStepForBug(0);
    }
    setHintText(null);
  }

  // Player explicitly asks for a clue when they're stuck.
  function useHint() {
    if (!mission) return;
    const undiscovered = mission.bugs.filter(b => !discoveredBugs.includes(b.id));
    if (undiscovered.length === 0) {
      notify("🎉 No bugs left to hint about — you found them all!");
      return;
    }
    // Stick with the same bug across repeated hint requests so clues build on each other.
    const bug = (hintBugId && undiscovered.find(b => b.id === hintBugId)) || undiscovered[0];
    const step = bug.id === hintBugId ? hintStepForBug : 0;
    const hint = bug.hints[Math.min(step, bug.hints.length - 1)];

    const isFree = hintsUsedThisMission < levelMods.freeHints;
    const cost = isFree ? 0 : levelMods.hintPenalty;

    setHintBugId(bug.id);
    setHintStepForBug(step + 1);
    setHintsUsedThisMission(prev => prev + 1);
    setStreak(0); // asking for help breaks the no-hint streak
    setProfile(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp - cost),
      hintsUsed: prev.hintsUsed + 1,
    }));
    setHintText(cost > 0 ? `💡 AI Mentor (-${cost} XP): "${hint}"` : `💡 AI Mentor (free hint): "${hint}"`);
  }

  function handleEnvChange(fn: (s: TestEnvState) => TestEnvState) {
    setEnv(prev => fn(prev));
  }

  function evaluateReport(title: string, severity: Severity, steps: string, expected: string, actual: string) {
    if (!reportBug) return;
    const bug = reportBug;
    const correctSeverity = severity === bug.severity;
    const hasDetails = steps.length > 10 && expected.length > 5 && actual.length > 5;
    let score = 0;
    let valid = false;
    let feedback = "";

    if (hasDetails) {
      valid = true;
      score += bug.xpReward;
      if (!correctSeverity) {
        score = Math.round(score * 0.6);
        feedback = `Valid bug, but severity was wrong (you said ${severity}, should be ${bug.severity}). Penalized to 60%.`;
      } else {
        feedback = `Excellent report! Correct severity (${bug.severity}) and detailed description.`;
      }
      // Streak bonus for consecutive valid, no-hint reports
      const mult = streakMultiplier(streak);
      if (mult > 1) {
        score = Math.round(score * mult);
        feedback += ` 🔥 Streak bonus x${mult}!`;
      }
    } else {
      valid = false;
      score = -30;
      feedback = "Report rejected. Please provide detailed steps, expected and actual results.";
    }

    const report: BugReport = {
      bugId: bug.id, title, severity, steps, expected, actual,
      submittedAt: new Date().toISOString(), evaluated: true, score, valid, feedback,
    };

    setMissionReports(prev => [...prev, report]);
    setMissionXP(prev => prev + Math.max(0, score));
    setStreak(prev => {
      const next = valid ? prev + 1 : 0;
      setBestStreak(b => Math.max(b, next));
      return next;
    });

    if (valid) {
      setProfile(prev => {
        const newBugs = prev.bugsFound + 1;
        const newTotal = prev.totalReports + 1;
        const newFP = prev.falsePositives;
        const newAcc = Math.round((newBugs / newTotal) * 100);
        const newAchievements = [...prev.achievements];
        const unlock = (id: string) => {
          const idx = newAchievements.findIndex(a => a.id === id);
          if (idx >= 0) newAchievements[idx] = { ...newAchievements[idx], unlocked: true };
        };
        if (newBugs === 1) unlock("first_bug");
        if (newBugs >= 10) unlock("bug_magnet");
        if (bug.severity === "critical") unlock("critical_hunter");
        if (bug.technique.includes("Boundary")) unlock("edge_case_master");
        const totalXP = prev.xp + Math.max(0, score);
        if (totalXP >= 1000) unlock("xp_1000");
        return {
          ...prev,
          xp: totalXP,
          rank: RANKS.filter(r => totalXP >= r.minXP).pop()?.name || "QA Intern",
          bugsFound: newBugs,
          bugsCritical: prev.bugsCritical + (bug.severity === "critical" ? 1 : 0),
          bugsHigh: prev.bugsHigh + (bug.severity === "high" ? 1 : 0),
          bugsMedium: prev.bugsMedium + (bug.severity === "medium" ? 1 : 0),
          bugsLow: prev.bugsLow + (bug.severity === "low" ? 1 : 0),
          totalReports: newTotal,
          falsePositives: newFP,
          accuracy: newAcc,
          testCases: prev.testCases + 1,
          achievements: newAchievements,
        };
      });
      notify(`✅ Report accepted! +${Math.max(0, score)} XP`);
    } else {
      setProfile(prev => ({
        ...prev,
        totalReports: prev.totalReports + 1,
        falsePositives: prev.falsePositives + 1,
        accuracy: prev.bugsFound > 0 ? Math.round((prev.bugsFound / (prev.totalReports + 1)) * 100) : 100,
        xp: Math.max(0, prev.xp + score),
      }));
      notify(`❌ Report rejected. ${feedback}`);
    }

    setReportBug(null);
  }

  function finishMission() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!mission) return;

    // Clearing a level requires a VALID report for every bug the level threw at you.
    const cleared = mission.bugs.every(b => missionReports.some(r => r.bugId === b.id && r.valid));
    let leveledUp = false;

    // Check achievements
    const accuracy = missionReports.filter(r => r.valid).length > 0
      ? Math.round((missionReports.filter(r => r.valid).length / missionReports.length) * 100)
      : 0;
    if (missionReports.length > 0 && accuracy === 100) {
      setProfile(prev => {
        const na = [...prev.achievements];
        const idx = na.findIndex(a => a.id === "perfect_tester");
        if (idx >= 0) na[idx] = { ...na[idx], unlocked: true };
        return { ...prev, achievements: na };
      });
    }
    if (timeUsed <= 120 && missionReports.filter(r => r.valid).length >= 3) {
      setProfile(prev => {
        const na = [...prev.achievements];
        const idx = na.findIndex(a => a.id === "speed_demon");
        if (idx >= 0) na[idx] = { ...na[idx], unlocked: true };
        return { ...prev, achievements: na };
      });
    }
    if (hintsUsedThisMission === 0 && discoveredBugs.length === mission.bugs.length) {
      setProfile(prev => {
        const na = [...prev.achievements];
        const idx = na.findIndex(a => a.id === "no_hints");
        if (idx >= 0) na[idx] = { ...na[idx], unlocked: true };
        return { ...prev, achievements: na };
      });
    }

    // Advance the ladder if this cleared the frontier level
    if (cleared && level === profile.highestUnlockedLevel && level < MAX_LEVEL) {
      leveledUp = true;
      setProfile(prev => {
        const nextLevel = Math.min(MAX_LEVEL, prev.highestUnlockedLevel + 1);
        const na = [...prev.achievements];
        const unlock = (id: string) => {
          const idx = na.findIndex(a => a.id === id);
          if (idx >= 0) na[idx] = { ...na[idx], unlocked: true };
        };
        if (nextLevel >= 50) unlock("level_50");
        return { ...prev, highestUnlockedLevel: nextLevel, achievements: na };
      });
    } else if (cleared && level === MAX_LEVEL) {
      setProfile(prev => {
        const na = [...prev.achievements];
        const idx = na.findIndex(a => a.id === "level_100");
        if (idx >= 0) na[idx] = { ...na[idx], unlocked: true };
        return { ...prev, achievements: na };
      });
    }

    setLastResult({ cleared, leveledUp });
    setScreen("missionComplete");
  }

  function retryOrAdvance() {
    if (lastResult.cleared) {
      setScreen("missions");
    } else {
      startLevel(level);
    }
  }

  // ---- Render ----
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e1a] text-slate-100">
      {/* Subtle grid bg */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Notification */}
      {notification && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <div className={cn(
            "animate-fade-in-up rounded-xl px-5 py-3 font-mono text-sm font-semibold shadow-2xl ring-1 backdrop-blur-md",
            notification.startsWith("✅")
              ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
              : notification.startsWith("❌")
                ? "bg-rose-500/15 text-rose-200 ring-rose-400/30"
                : "bg-sky-500/15 text-sky-200 ring-sky-400/30"
          )}>
            {notification}
          </div>
        </div>
      )}

      {/* AI Mentor hint */}
      {hintText && screen === "testing" && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs animate-fade-in-up">
          <div className="rounded-xl bg-violet-500/10 p-3 font-mono text-xs text-violet-200 ring-1 ring-violet-400/30 backdrop-blur-md">
            {hintText}
          </div>
        </div>
      )}

      {screen === "home" && (
        <HomeScreen
          profile={profile}
          totalXP={profile.xp}
          onStart={() => setScreen("missions")}
          onDashboard={() => setScreen("dashboard")}
          onAchievements={() => setScreen("achievements")}
        />
      )}

      {screen === "missions" && (
        <MissionSelect
          highestUnlockedLevel={profile.highestUnlockedLevel}
          onSelectLevel={startLevel}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "testing" && mission && (
        <TestEnvironment
          mission={mission}
          env={env}
          discoveredBugs={discoveredBugs}
          timeLeft={timeLeft}
          level={level}
          levelLabel={levelMods.label}
          hintsUsed={hintsUsedThisMission}
          freeHints={levelMods.freeHints}
          hintPenalty={levelMods.hintPenalty}
          streak={streak}
          onStateChange={handleEnvChange}
          onBugFound={handleBugFound}
          onReport={setReportBug}
          onRequestHint={useHint}
          onFinish={finishMission}
          onOpenConsole={() => {}}
          onQuit={() => { if (timerRef.current) clearInterval(timerRef.current); setScreen("home"); }}
        />
      )}

      {reportBug && (
        <BugReportForm
          bug={reportBug}
          onSubmit={evaluateReport}
          onCancel={() => setReportBug(null)}
        />
      )}

      {screen === "missionComplete" && mission && (
        <MissionComplete
          mission={mission}
          discoveredCount={discoveredBugs.length}
          totalBugs={mission.bugs.length}
          reports={missionReports}
          timeUsed={timeUsed}
          xpEarned={missionXP}
          accuracy={missionReports.length > 0 ? Math.round((missionReports.filter(r => r.valid).length / missionReports.length) * 100) : 0}
          level={level}
          hintsUsed={hintsUsedThisMission}
          bestStreak={bestStreak}
          levelCleared={lastResult.cleared}
          leveledUp={lastResult.leveledUp}
          onContinue={retryOrAdvance}
          onHome={() => setScreen("home")}
        />
      )}

      {screen === "dashboard" && (
        <Dashboard
          profile={profile}
          totalXP={profile.xp}
          reports={reports}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "achievements" && (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center px-4 py-8">
          <h2 className="font-mono text-2xl font-bold text-amber-300 sm:text-3xl">🏆 Achievements</h2>
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.achievements.map(a => (
              <div key={a.id} className={cn(
                "flex items-start gap-3 rounded-xl border p-4 transition-all",
                a.unlocked
                  ? "border-amber-400/30 bg-amber-500/5"
                  : "border-slate-700/40 bg-slate-900/40 opacity-50"
              )}>
                <span className="text-3xl">{a.unlocked ? a.emoji : "🔒"}</span>
                <div>
                  <p className={cn("font-mono text-sm font-bold", a.unlocked ? "text-amber-200" : "text-slate-500")}>{a.title}</p>
                  <p className="font-mono text-xs text-slate-400">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setScreen("home")} className="mt-8 font-mono text-sm text-slate-400 transition-colors hover:text-sky-300">
            ← Back to home
          </button>
        </div>
      )}
    </div>
  );
}