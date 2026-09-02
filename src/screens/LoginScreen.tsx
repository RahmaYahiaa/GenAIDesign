import { useState } from "react";
import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryLevelLabel, MasteryLevel } from "../tokens";
import { IconLogoBrand, IconLock, IconEye, IconEyeOff } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

const LADDER_TOPICS: { label: string; labelAr: string; pct: number; evidence: number }[] = [
  { label: "Arrays & Linked Lists", labelAr: "المصفوفات والقوائم", pct: 91, evidence: 12 },
  { label: "BFS / Graph Traversal", labelAr: "بحث العرض أولاً BFS", pct: 74, evidence: 8 },
  { label: "DFS & Recursion", labelAr: "بحث العمق والتكرار", pct: 55, evidence: 6 },
  { label: "Binary Trees & BST", labelAr: "الأشجار الثنائية", pct: 38, evidence: 4 },
  { label: "Hash Tables", labelAr: "جداول التجزئة", pct: 22, evidence: 2 },
  { label: "Dijkstra / Shortest Path", labelAr: "أقصر مسار — ديكسترا", pct: 0, evidence: 0 },
];

const LEVEL_STEPS: { level: MasteryLevel; en: string; ar: string }[] = [
  { level: "no-evidence", en: "No Evidence", ar: "لا توجد أدلة" },
  { level: "beginner", en: "Beginner", ar: "مبتدئ" },
  { level: "intermediate", en: "Intermediate", ar: "متوسط" },
  { level: "advanced", en: "Advanced", ar: "متقدم" },
  { level: "mastered", en: "Mastered", ar: "متقن" },
];

// Hero ladder colors — luminous blue/violet variants that contrast on the
// cobalt gradient (kept in the same identity, no traffic-light colors).
const HERO_LEVEL_COLORS: Record<MasteryLevel, string> = {
  "no-evidence": "#93A0B8",
  "beginner": "#B9A6F5",
  "intermediate": "#A9BAF1",
  "advanced": "#90A9F2",
  "mastered": "#7FB2FF",
};

export default function LoginScreen({ state, setState }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = "'Plus Jakarta Sans', sans-serif";
  const bFont = "'Inter', sans-serif";
  const [role, setRole] = useState<"student" | "instructor" | "admin">("student");
  const [showPass, setShowPass] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: `1.5px solid ${tokens.cardBorder}`,
    background: tokens.inset,
    color: tokens.textPrimary,
    fontFamily: bFont,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 150ms ease",
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 44px)" }}>
      {/* ── Left: Mastery Ladder Hero ───────────────────────── */}
      <div
        style={{
          flex: "0 0 58%",
          background: state.dark
            ? "linear-gradient(160deg, #0A0E23 0%, #131A38 60%, #1F1A45 100%)"
            : "linear-gradient(160deg, #1B4DA8 0%, #1a5298 55%, #0E7A9E 100%)",
          padding: "52px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: state.dark
              ? "radial-gradient(circle at 1px 1px, rgba(75,140,245,0.07) 1px, transparent 0)"
              : "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 52 }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 8, border: "1px solid rgba(255,255,255,0.18)" }}>
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L23 8.5V19.5L14 25L5 19.5V8.5L14 3Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="3.5" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: hFont, fontWeight: 800, fontSize: 18, color: "white", letterSpacing: "-0.03em" }}>
                GenAI
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
                ACADEMIC INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Core message */}
          <h1
            style={{
              fontFamily: hFont,
              fontWeight: 700,
              fontSize: 30,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
              margin: "0 0 10px",
            }}
          >
            Mastery is built on
            <br />
            <span style={{ color: "rgba(255,255,255,0.65)" }}>real evidence, not AI guesses.</span>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.65,
              margin: "0 0 40px",
              maxWidth: 420,
            }}
          >
            GenAI tracks exactly what you know through diagnostic evidence — then personalises
            what you study next and proves improvement through rigorous reassessment.
          </p>

          {/* Mastery Ladder */}
          <div
            style={{
              background: state.dark ? "rgba(14,20,48,0.85)" : "rgba(0,0,0,0.2)",
              border: state.dark ? "1px solid #242E5C" : "1px solid rgba(255,255,255,0.18)",
              borderRadius: 16,
              padding: "22px 24px",
              backdropFilter: "blur(16px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                CS301 · Topic Mastery Ladder
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                6 topics
              </div>
            </div>

            {/* Level legend */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {LEVEL_STEPS.map((step) => {
                const color = HERO_LEVEL_COLORS[step.level];
                return (
                  <div key={step.level} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                    <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {step.en}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Topic rows */}
            {LADDER_TOPICS.map((topic) => {
              const level = masteryLevel(topic.pct, topic.evidence > 0);
              const color = HERO_LEVEL_COLORS[level];
              return (
                <div key={topic.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)", fontFamily: bFont }}>
                      {topic.label}
                    </span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                        {topic.evidence > 0 ? `${topic.evidence} evidence` : "no data"}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color }}>
                        {topic.evidence > 0 ? `${topic.pct}%` : "—"}
                      </span>
                    </div>
                  </div>
                  {/* 5-segment level bar */}
                  <div style={{ display: "flex", gap: 3, height: 5 }}>
                    {LEVEL_STEPS.map((step, si) => {
                      const stepThresholds = [0, 0, 30, 60, 85, 100];
                      const isFilled = topic.evidence === 0
                        ? false
                        : topic.pct > stepThresholds[si];
                      const isActive = masteryLevel(topic.pct, topic.evidence > 0) === step.level;
                      const c = HERO_LEVEL_COLORS[step.level];
                      return (
                        <div
                          key={step.level}
                          style={{
                            flex: 1,
                            height: "100%",
                            borderRadius: 3,
                            background: isFilled || (topic.evidence === 0 && si === 0)
                              ? c
                              : "rgba(255,255,255,0.1)",
                            opacity: isActive ? 1 : isFilled ? 0.7 : 0.25,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Overall course mastery
              </span>
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: "#8FB4FF" }}>
                46%
              </span>
            </div>
          </div>

          {/* Institution logos */}
          <div style={{ display: "flex", gap: 24, marginTop: 36, alignItems: "center", opacity: 0.35 }}>
            {["MIT", "Stanford", "Oxford", "KAUST", "AUB"].map((uni) => (
              <span key={uni} style={{ fontFamily: hFont, fontWeight: 700, fontSize: 12, color: "white", letterSpacing: "-0.01em" }}>
                {uni}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 52px",
          background: tokens.bg,
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        <div style={{ width: "100%", maxWidth: 340 }}>
          <h2
            style={{
              fontFamily: hFont,
              fontWeight: 700,
              fontSize: 22,
              color: tokens.textPrimary,
              letterSpacing: "-0.03em",
              margin: "0 0 4px",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
          </h2>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: "0 0 24px", textAlign: isRtl ? "right" : "left" }}>
            {lang === "ar" ? "ادخل إلى منصة الذكاء الأكاديمي." : "Access your academic intelligence platform."}
          </p>

          {/* Role selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "الدور" : "Role"}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {(["student", "instructor", "admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1.5px solid ${role === r ? tokens.primary : tokens.cardBorder}`,
                    background: role === r ? tokens.primaryLight : tokens.card,
                    color: role === r ? tokens.primary : tokens.textMuted,
                    fontFamily: bFont,
                    fontWeight: role === r ? 600 : 400,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {lang === "ar"
                    ? r === "student" ? "طالب" : r === "instructor" ? "مدرس" : "مدير"
                    : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "البريد المؤسسي" : "Institutional Email"}
            </label>
            <input type="email" placeholder="you@university.edu" style={inputStyle} dir="ltr" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: isRtl ? "flex-start" : "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {lang === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <button style={{ fontSize: 12, color: tokens.accent, background: "none", border: "none", cursor: "pointer", fontFamily: bFont, padding: 0 }}>
                {lang === "ar" ? "نسيت؟" : "Forgot?"}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="••••••••••••" style={{ ...inputStyle, paddingRight: 40 }} dir="ltr" />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: tokens.textMuted, padding: 0, display: "flex" }}
              >
                {showPass ? <IconEyeOff size={15} color={tokens.textMuted} /> : <IconEye size={15} color={tokens.textMuted} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setState({ ...state, screen: "student-dashboard" })}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 8,
              border: "none", background: tokens.primary, color: "white",
              fontFamily: hFont, fontWeight: 700, fontSize: 14,
              letterSpacing: "-0.01em", cursor: "pointer", marginBottom: 16,
            }}
          >
            {lang === "ar" ? "دخول" : "Sign In"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: tokens.cardBorder }} />
            <span style={{ fontSize: 12, color: tokens.textFaint }}>{lang === "ar" ? "أو" : "or"}</span>
            <div style={{ flex: 1, height: 1, background: tokens.cardBorder }} />
          </div>

          <button
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8,
              border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card,
              color: tokens.textPrimary, fontFamily: bFont, fontWeight: 500,
              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <IconLock size={14} color={tokens.textMuted} />
            {lang === "ar" ? "دخول عبر الجامعة (SSO)" : "Continue with University SSO"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: tokens.textMuted, marginTop: 22 }}>
            {lang === "ar" ? "جديد؟ " : "New to GenAI? "}
            <button
              onClick={() => setState({ ...state, screen: "register" })}
              style={{ color: tokens.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: bFont, padding: 0 }}
            >
              {lang === "ar" ? "طلب وصول" : "Request access"}
            </button>
          </p>

          {/* Demo links */}
          <div style={{ marginTop: 24, padding: "12px 14px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Preview screens
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { id: "student-dashboard", label: "Dashboard" },
                { id: "tutor", label: "AI Tutor" },
                { id: "diagnostic", label: "Diagnostic" },
                { id: "instructor", label: "Instructor" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setState({ ...state, screen: s.id as any })}
                  style={{
                    padding: "3px 8px", borderRadius: 5,
                    border: `1px solid ${tokens.cardBorder}`, background: tokens.card,
                    fontFamily: MONO, fontSize: 10, color: tokens.textMuted, cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: tokens.textFaint, marginTop: 24, lineHeight: 1.5 }}>
            FERPA-compliant · Institutional data governance<br />
            <span style={{ opacity: 0.6 }}>© 2026 GenAI Academic Intelligence</span>
          </p>
        </div>
      </div>
    </div>
  );
}
