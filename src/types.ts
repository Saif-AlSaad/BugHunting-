export type Screen =
  | "home"
  | "dashboard"
  | "missions"
  | "testing"
  | "bugReport"
  | "missionComplete"
  | "achievements";

export type Severity = "critical" | "high" | "medium" | "low";
export type Priority = "P1" | "P2" | "P3" | "P4";
export type Status = "open" | "fixed" | "rejected";

export interface TestEnvState {
  username: string;
  password: string;
  loggedIn: boolean;
  otp: string;
  resetEmail: string;
  otpUsed: boolean;
  loginAttempts: number;
  // E-commerce
  searchQuery: string;
  cart: { id: string; name: string; price: number; qty: number }[];
  coupon: string;
  couponApplied: boolean;
  address: string;
  paymentMethod: string;
  orderPlaced: boolean;
  wishlist: string[];
  // Banking
  balance: number;
  transferTo: string;
  transferAmount: number;
  depositAmount: number;
  withdrawAmount: number;
  transactions: { id: number; type: string; amount: number; desc: string }[];
  txIdCounter: number;
  // Booking
  selectedSeat: string | null;
  bookedSeats: string[];
  cancelledSeat: string | null;
  // General
  viewport: "desktop" | "tablet" | "mobile";
  consoleOpen: boolean;
  consoleInput: string;
  consoleOutput: string[];
  networkLog: { method: string; url: string; status: number; response: string }[];
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  priority: Priority;
  category: string;
  technique: string;
  hints: string[];
  xpReward: number;
}

export interface BugReport {
  bugId: string;
  title: string;
  severity: Severity;
  steps: string;
  expected: string;
  actual: string;
  submittedAt: string;
  evaluated: boolean;
  score: number;
  valid: boolean;
  feedback: string;
}

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

export interface PlayerProfile {
  xp: number;
  rank: string;
  bugsFound: number;
  bugsCritical: number;
  bugsHigh: number;
  bugsMedium: number;
  bugsLow: number;
  falsePositives: number;
  totalReports: number;
  testCases: number;
  accuracy: number;
  achievements: Achievement[];
  hintsUsed: number;
  level: number;
}

export interface Mission {
  id: string;
  title: string;
  icon: string;
  difficulty: number;
  description: string;
  clientName: string;
  sprintName: string;
  timeLimit: number;
  bugs: Bug[];
  requirements: string[];
}

export type DifficultyTier =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "elite";

export interface DifficultyConfig {
  tier: DifficultyTier;
  label: string;
  minLevel: number;
  maxLevel: number;

  timeMultiplier: number;
  maxHints: number;
  hintPenalty: number;

  bugComplexity: number;
  xpMultiplier: number;
}

export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  {
    tier: "beginner",
    label: "Beginner",
    minLevel: 1,
    maxLevel: 20,
    timeMultiplier: 1.0,
    maxHints: 3,
    hintPenalty: 0.10,
    bugComplexity: 1,
    xpMultiplier: 1.0,
  },

  {
    tier: "intermediate",
    label: "Intermediate",
    minLevel: 21,
    maxLevel: 40,
    timeMultiplier: 0.90,
    maxHints: 3,
    hintPenalty: 0.15,
    bugComplexity: 2,
    xpMultiplier: 1.20,
  },

  {
    tier: "advanced",
    label: "Advanced",
    minLevel: 41,
    maxLevel: 60,
    timeMultiplier: 0.80,
    maxHints: 2,
    hintPenalty: 0.20,
    bugComplexity: 3,
    xpMultiplier: 1.40,
  },

  {
    tier: "expert",
    label: "Expert",
    minLevel: 61,
    maxLevel: 80,
    timeMultiplier: 0.70,
    maxHints: 2,
    hintPenalty: 0.25,
    bugComplexity: 4,
    xpMultiplier: 1.70,
  },

  {
    tier: "elite",
    label: "Elite",
    minLevel: 81,
    maxLevel: 100,
    timeMultiplier: 0.60,
    maxHints: 1,
    hintPenalty: 0.35,
    bugComplexity: 5,
    xpMultiplier: 2.00,
  },
];

export function getDifficultyConfig(
  level: number
): DifficultyConfig {

  const safeLevel = Math.max(
    1,
    Math.min(100, level)
  );

  return (
    DIFFICULTY_CONFIGS.find(
      config =>
        safeLevel >= config.minLevel &&
        safeLevel <= config.maxLevel
    ) || DIFFICULTY_CONFIGS[0]
  );
}

export const RANKS = [
  { name: "QA Intern", emoji: "🥉", minXP: 0 },
  { name: "Junior Tester", emoji: "🥈", minXP: 200 },
  { name: "QA Engineer", emoji: "🥇", minXP: 600 },
  { name: "Senior QA Engineer", emoji: "💎", minXP: 1500 },
  { name: "QA Architect", emoji: "🔥", minXP: 3000 },
  { name: "Bug Hunter Legend", emoji: "👑", minXP: 5000 },
];

export const ACHIEVEMENT_TEMPLATES: Achievement[] = [
  { id: "first_bug", title: "First Bug", emoji: "🐛", description: "Find your first bug", unlocked: false },
  { id: "bug_magnet", title: "Bug Magnet", emoji: "🧲", description: "Find 10 valid bugs", unlocked: false },
  { id: "critical_hunter", title: "Critical Hunter", emoji: "💀", description: "Find a critical bug", unlocked: false },
  { id: "perfect_tester", title: "Perfect Tester", emoji: "🎯", description: "Complete a mission with 100% accuracy", unlocked: false },
  { id: "speed_demon", title: "Speed Demon", emoji: "⚡", description: "Find 3 bugs within 2 minutes", unlocked: false },
  { id: "edge_case_master", title: "Edge Case Master", emoji: "🧠", description: "Find a boundary-value bug", unlocked: false },
  { id: "full_stack", title: "Full Stack", emoji: "🌐", description: "Test all 3 applications", unlocked: false },
  { id: "xp_1000", title: "Rising Star", emoji: "⭐", description: "Reach 1,000 XP", unlocked: false },
  { id: "no_hints", title: "Independent Investigator", emoji: "🕵️", description: "Complete a mission without using a single hint", unlocked: false },
  { id: "level_50", title: "Halfway Hunter", emoji: "🎚️", description: "Complete a mission at level 50 or higher", unlocked: false },
  { id: "level_100", title: "Max Difficulty", emoji: "🏆", description: "Complete a mission at level 100", unlocked: false },
];
