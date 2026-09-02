// Design tokens — GenAI Academic Intelligence Platform
// Refined semantic color system: teal / warm gold / dusty rose — no traffic-light colors

export const MONO = "'JetBrains Mono', monospace";
export const HEAD_EN = "'Plus Jakarta Sans', sans-serif";
export const HEAD_AR = "'Cairo', sans-serif";
export const BODY_EN = "'Inter', sans-serif";
export const BODY_AR = "'Cairo', sans-serif";

export const LIGHT = {
  bg: "#F4F6F9",
  bgAlt: "#EEF1F6",
  card: "#FFFFFF",
  cardBorder: "#DDE3ED",
  inset: "#EEF1F7",
  insetBorder: "#D8DFEC",

  primary: "#1B4DA8",
  primaryMid: "#1E5BB5",
  primaryLight: "#EBF1FB",
  accent: "#0E7A9E",

  textPrimary: "#0D1A2E",
  textSecondary: "#374151",
  textMuted: "#5C697E",
  textFaint: "#8A96A8",

  // Refined semantic — teal / gold / rose (NOT traffic-light red/yellow/green)
  mastered: "#0D9488",        // Teal
  masteredMid: "#0F9E92",
  masteredBg: "#F0FDFA",
  masteredBorder: "#CCFBF1",

  advanced: "#1D7A6B",        // Deeper teal for 'advanced near mastery'
  advancedBg: "#E8FAF6",

  developing: "#92680B",      // Warm muted gold
  developingBg: "#FDF7EB",
  developingBorder: "#F5DFA0",

  gap: "#A0435A",             // Dusty rose — learning gap
  gapBg: "#FEF1F4",
  gapBorder: "#F9CAD5",

  noEvidence: "#5C697E",      // Slate — no data yet
  noEvidenceBg: "#F1F3F7",

  citation: "#1B4DA8",        // Cobalt — same as primary
  citationBg: "#EBF1FB",
  citationBorder: "#C3D4F5",

  grounded: "#0D9488",        // Grounded AI response
  groundedBg: "#F0FDFA",
  insufficient: "#92680B",    // Insufficient evidence
  insufficientBg: "#FDF7EB",

  sidebar: "#FFFFFF",
  sidebarBorder: "#DDE3ED",
  sidebarActive: "#EBF1FB",
  sidebarHover: "#F4F6F9",
};

export const DARK = {
  bg: "#0C1220",              // Deep navy — not pure black
  bgAlt: "#101828",
  card: "#131E30",
  cardBorder: "#1E2D45",
  inset: "#172035",
  insetBorder: "#1E2D45",

  primary: "#4B8CF5",
  primaryMid: "#5C9BF7",
  primaryLight: "#172035",
  accent: "#38BDF8",

  textPrimary: "#EDF0F5",
  textSecondary: "#B8C4D6",
  textMuted: "#7A8DA8",
  textFaint: "#4A5A72",

  mastered: "#2DD4BF",
  masteredMid: "#2ECFC0",
  masteredBg: "#0C2420",
  masteredBorder: "#134034",

  advanced: "#26B5A3",
  advancedBg: "#0D2220",

  developing: "#C8963A",
  developingBg: "#1E1A0C",
  developingBorder: "#3D3010",

  gap: "#D07090",
  gapBg: "#1E0C14",
  gapBorder: "#3D1824",

  noEvidence: "#4A5A72",
  noEvidenceBg: "#131E30",

  citation: "#4B8CF5",
  citationBg: "#172035",
  citationBorder: "#1E3558",

  grounded: "#2DD4BF",
  groundedBg: "#0C2420",
  insufficient: "#C8963A",
  insufficientBg: "#1E1A0C",

  sidebar: "#101828",
  sidebarBorder: "#1E2D45",
  sidebarActive: "#172035",
  sidebarHover: "#131E30",
};

export type Tokens = typeof LIGHT;

export function tk(dark: boolean): Tokens {
  return dark ? DARK : LIGHT;
}

// Mastery level system
export type MasteryLevel = "no-evidence" | "beginner" | "intermediate" | "advanced" | "mastered";

export function masteryLevel(pct: number, hasEvidence: boolean): MasteryLevel {
  if (!hasEvidence || pct === 0) return "no-evidence";
  if (pct <= 30) return "beginner";
  if (pct <= 60) return "intermediate";
  if (pct <= 85) return "advanced";
  return "mastered";
}

export function masteryLevelLabel(level: MasteryLevel, lang: "en" | "ar"): string {
  const labels: Record<MasteryLevel, Record<"en" | "ar", string>> = {
    "no-evidence": { en: "No Evidence", ar: "لا توجد أدلة" },
    "beginner": { en: "Beginner", ar: "مبتدئ" },
    "intermediate": { en: "Intermediate", ar: "متوسط" },
    "advanced": { en: "Advanced", ar: "متقدم" },
    "mastered": { en: "Mastered", ar: "متقن" },
  };
  return labels[level][lang];
}

export function masteryColor(level: MasteryLevel, tokens: Tokens): string {
  switch (level) {
    case "no-evidence": return tokens.noEvidence;
    case "beginner": return tokens.gap;
    case "intermediate": return tokens.developing;
    case "advanced": return tokens.advanced;
    case "mastered": return tokens.mastered;
  }
}

export function masteryBg(level: MasteryLevel, tokens: Tokens): string {
  switch (level) {
    case "no-evidence": return tokens.noEvidenceBg;
    case "beginner": return tokens.gapBg;
    case "intermediate": return tokens.developingBg;
    case "advanced": return tokens.advancedBg;
    case "mastered": return tokens.masteredBg;
  }
}
