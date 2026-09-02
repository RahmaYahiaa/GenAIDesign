import { Tokens, masteryColor, masteryBg, masteryLevel, masteryLevelLabel, MasteryLevel, MONO } from "../tokens";
import { IconAnchor } from "./Icons";

// ─── Citation Chip ─────────────────────────────────────────────────────────────
interface CitationChipProps {
  label: string;
  tokens: Tokens;
}
export function CitationChip({ label, tokens }: CitationChipProps) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        background: tokens.citationBg,
        color: tokens.citation,
        border: `1px solid ${tokens.citationBorder}`,
        borderRadius: 6,
        padding: "2px 8px",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        lineHeight: "18px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <IconAnchor size={10} color={tokens.citation} />
      {label}
    </span>
  );
}

// ─── Mastery Badge ─────────────────────────────────────────────────────────────
interface MasteryBadgeProps {
  pct: number;
  evidence: number;
  tokens: Tokens;
  lang?: "en" | "ar";
}
export function MasteryBadge({ pct, evidence, tokens, lang = "en" }: MasteryBadgeProps) {
  const hasEvidence = evidence > 0;
  const level = masteryLevel(pct, hasEvidence);
  const color = masteryColor(level, tokens);
  const bg = masteryBg(level, tokens);
  const label = masteryLevelLabel(level, lang);
  const evidenceLabel = lang === "ar" ? "نقاط" : "Evidence Pts";
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        background: bg,
        color,
        border: `1px solid ${color}33`,
        borderRadius: 6,
        padding: "3px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {pct}% {label} · {evidence} {evidenceLabel}
    </span>
  );
}

// ─── Mastery Level Pill ────────────────────────────────────────────────────────
interface MasteryPillProps {
  level: MasteryLevel;
  tokens: Tokens;
  lang?: "en" | "ar";
}
export function MasteryPill({ level, tokens, lang = "en" }: MasteryPillProps) {
  const color = masteryColor(level, tokens);
  const bg = masteryBg(level, tokens);
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 10,
        background: bg,
        color,
        border: `1px solid ${color}44`,
        borderRadius: 20,
        padding: "2px 8px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {masteryLevelLabel(level, lang)}
    </span>
  );
}

// ─── Mastery Bar ───────────────────────────────────────────────────────────────
interface MasteryBarProps {
  pct: number;
  evidence?: number;
  thin?: boolean;
  tokens: Tokens;
}
export function MasteryBar({ pct, evidence = 1, thin = false, tokens }: MasteryBarProps) {
  const level = masteryLevel(pct, evidence > 0);
  const color = masteryColor(level, tokens);
  return (
    <div
      style={{
        height: thin ? 5 : 8,
        background: tokens.inset,
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${tokens.insetBorder}`,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.8s ease-out",
        }}
      />
    </div>
  );
}

// ─── Difficulty Tag ────────────────────────────────────────────────────────────
interface DifficultyTagProps {
  level: "easy" | "medium" | "hard";
  tokens: Tokens;
  lang?: "en" | "ar";
}
export function DifficultyTag({ level, tokens, lang = "en" }: DifficultyTagProps) {
  const map = {
    easy: { color: tokens.mastered, bg: tokens.masteredBg, label: { en: "Easy", ar: "سهل" } },
    medium: { color: tokens.developing, bg: tokens.developingBg, label: { en: "Medium", ar: "متوسط" } },
    hard: { color: tokens.gap, bg: tokens.gapBg, label: { en: "Hard", ar: "صعب" } },
  };
  const m = map[level];
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 10,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.color}44`,
        borderRadius: 4,
        padding: "2px 8px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {m.label[lang]}
    </span>
  );
}

// ─── Section Heading ───────────────────────────────────────────────────────────
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  tokens: Tokens;
  headFont: string;
  bodyFont: string;
  rtl?: boolean;
  action?: React.ReactNode;
}
export function SectionHeading({ title, subtitle, tokens, headFont, bodyFont, rtl, action }: SectionHeadingProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: action ? "center" : "flex-start",
        marginBottom: 20,
        flexDirection: rtl ? "row-reverse" : "row",
      }}
    >
      <div style={{ textAlign: rtl ? "right" : "left" }}>
        <h2
          style={{
            fontFamily: headFont,
            fontWeight: 700,
            fontSize: 22,
            color: tokens.textPrimary,
            letterSpacing: "-0.025em",
            margin: "0 0 4px",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bodyFont }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Stat Tile ─────────────────────────────────────────────────────────────────
interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  accent?: string;
  tokens: Tokens;
  headFont: string;
  bodyFont: string;
}
export function StatTile({ label, value, sub, mono, accent, tokens, headFont, bodyFont }: StatTileProps) {
  return (
    <div
      style={{
        background: tokens.card,
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 11, color: tokens.textFaint, marginBottom: 6, fontFamily: bodyFont, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          fontFamily: mono ? MONO : headFont,
          color: accent || tokens.textPrimary,
          letterSpacing: mono ? 0 : "-0.03em",
          marginBottom: sub ? 2 : 0,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bodyFont }}>{sub}</div>}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  tokens: Tokens;
  headFont: string;
  bodyFont: string;
}
export function EmptyState({ icon, title, description, ctaLabel, onCta, tokens, headFont, bodyFont }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: tokens.inset,
          border: `1px solid ${tokens.cardBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.textFaint,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: headFont, fontWeight: 600, fontSize: 16, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: tokens.textMuted, fontFamily: bodyFont, lineHeight: 1.6, maxWidth: 320 }}>
        {description}
      </div>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          style={{
            marginTop: 8,
            padding: "9px 20px",
            borderRadius: 8,
            border: "none",
            background: tokens.primary,
            color: "white",
            fontFamily: headFont,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: "-0.01em",
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
