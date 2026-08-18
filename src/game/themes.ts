export type TabStyle = "pill" | "underline" | "box";

export interface LevelTheme {
  accent: string;
  soft: string;
  headerText: string;
  version: string;
  tabStyle: TabStyle;
}

interface PaletteEntry {
  accent: string;
  soft: string;
  headerText: string;
}

const PALETTE: PaletteEntry[] = [
  { accent: "#38bdf8", soft: "rgba(56,189,248,0.16)", headerText: "#7dd3fc" },
  { accent: "#a78bfa", soft: "rgba(167,139,250,0.16)", headerText: "#c4b5fd" },
  { accent: "#34d399", soft: "rgba(52,211,153,0.16)", headerText: "#6ee7b7" },
  { accent: "#fbbf24", soft: "rgba(251,191,36,0.16)", headerText: "#fcd34d" },
  { accent: "#fb7185", soft: "rgba(251,113,133,0.16)", headerText: "#fda4af" },
  { accent: "#22d3ee", soft: "rgba(34,211,238,0.16)", headerText: "#67e8f9" },
  { accent: "#f472b6", soft: "rgba(244,114,182,0.16)", headerText: "#f9a8d4" },
  { accent: "#f97316", soft: "rgba(249,115,22,0.16)", headerText: "#fdba74" },
];

const TAB_STYLES: TabStyle[] = ["pill", "underline", "box"];

/**
 * Produces a per-level interface theme so no two consecutive levels look the
 * same: accent color cycles through a palette, the tab UI shape rotates, and
 * every level gets a unique build version string (v1.1, v1.2, …, v10.10).
 */
export function getLevelTheme(level: number): LevelTheme {
  const safe = Math.max(1, Math.min(100, Math.round(level)));
  const palette = PALETTE[safe % PALETTE.length];
  const tabStyle = TAB_STYLES[safe % TAB_STYLES.length];
  const version = `v${Math.ceil(safe / 10)}.${((safe - 1) % 10) + 1}.0`;
  return {
    accent: palette.accent,
    soft: palette.soft,
    headerText: palette.headerText,
    version,
    tabStyle,
  };
}