import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor } from "../tokens";
import { MasteryBadge, CitationChip, MasteryPill } from "../components/SharedUI";
import { IconCheck, IconTrendUp, IconReassessment } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

const SUBSKILLS = [
  { label: "Core BFS Algorithm", labelAr: "خوارزمية BFS الأساسية", before: 28, after: 90 },
  { label: "Time Complexity O(V+E)", labelAr: "التعقيد الزمني O(V+E)", before: 41, after: 86 },
  { label: "Queue Implementation", labelAr: "تطبيق قائمة الانتظار", before: 55, after: 92 },
  { label: "Adjacency Matrix vs List", labelAr: "مصفوفة مقابل قائمة مجاورة", before: 20, after: 76 },
  { label: "BFS Applications", labelAr: "تطبيقات BFS", before: 15, after: 72 },
];

const GAPS_BEFORE = [
  { text: "Uses stack instead of queue in BFS traversal", textAr: "يستخدم مكدساً بدلاً من قائمة انتظار في BFS", resolved: true, citation: "CS301 · Lec 6 §2" },
  { text: "Confused time complexity for adjacency matrix representation", textAr: "خلط في التعقيد الزمني لتمثيل المصفوفة المجاورة", resolved: true, citation: "CS301 · Lec 6 §3" },
  { text: "Could not apply BFS to detect shortest unweighted path", textAr: "لم يتمكن من تطبيق BFS لأقصر مسار غير مرجّح", resolved: false, citation: "CS301 · Lec 6 §4" },
];

const TIMELINE = [
  { date: "Oct 14", dateAr: "14 أكتوبر", event: "Initial Diagnostic Assessment", eventAr: "التقييم التشخيصي الأولي", pct: 34, type: "assess" as const },
  { date: "Oct 15", dateAr: "15 أكتوبر", event: "AI Tutor — Core BFS Concepts", eventAr: "المعلم الذكي — مفاهيم BFS الأساسية", pct: null, type: "session" as const },
  { date: "Oct 19", dateAr: "19 أكتوبر", event: "AI Tutor — Complexity Analysis", eventAr: "المعلم الذكي — تحليل التعقيد", pct: null, type: "session" as const },
  { date: "Oct 24", dateAr: "24 أكتوبر", event: "Practice — 12 BFS Questions", eventAr: "التدريب — 12 سؤالاً عن BFS", pct: null, type: "practice" as const },
  { date: "Oct 28", dateAr: "28 أكتوبر", event: "Reassessment", eventAr: "إعادة التقييم", pct: 84, type: "assess" as const },
];

export default function ReassessmentScreen({ state, setState }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const before = { pct: 34, evidence: 2, level: masteryLevel(34, true) };
  const after = { pct: 84, evidence: 8, level: masteryLevel(84, true) };
  const gain = after.pct - before.pct;
  const gapsResolved = GAPS_BEFORE.filter((g) => g.resolved).length;
  const gapsRemaining = GAPS_BEFORE.filter((g) => !g.resolved).length;

  const timelineDotColor = (ev: typeof TIMELINE[0]) => {
    if (ev.type === "assess") return ev.pct && ev.pct > 70 ? tokens.mastered : tokens.gap;
    if (ev.type === "session") return tokens.primary;
    return tokens.developing;
  };

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <CitationChip label="CS301 · Topic 6" tokens={tokens} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.mastered, background: tokens.masteredBg, border: `1px solid ${tokens.mastered}44`, borderRadius: 5, padding: "2px 8px", fontWeight: 600 }}>
            {lang === "ar" ? "مكتمل" : "COMPLETE"}
          </span>
        </div>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 24, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px", textAlign: isRtl ? "right" : "left" }}>
          {lang === "ar" ? "رسم البيانات — بحث العرض أولاً (BFS)" : "Graph Traversal — Breadth-First Search"}
        </h1>
        <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont, textAlign: isRtl ? "right" : "left" }}>
          {lang === "ar" ? "14 أكتوبر ← 28 أكتوبر · 3 جلسات تعليمية · 12 سؤال تدريبي" : "Oct 14 → Oct 28 · 3 AI Tutor Sessions · 12 Practice Questions"}
        </p>
      </div>

      {/* Hero comparison */}
      <div
        style={{
          background: state.dark ? "linear-gradient(135deg, #101828, #131E30)" : "linear-gradient(135deg, #EEF1F7, #F0FDFA)",
          border: `1.5px solid ${tokens.cardBorder}`,
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 22,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Before */}
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.gap, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            {lang === "ar" ? "قبل التعلم · 14 أكتوبر" : "PRE-ASSESSMENT · Oct 14"}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 700, color: tokens.gap, lineHeight: 1, marginBottom: 10 }}>
            {before.pct}%
          </div>
          <MasteryBadge pct={before.pct} evidence={before.evidence} tokens={tokens} lang={lang} />
          <div style={{ marginTop: 14, height: 7, background: tokens.inset, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${before.pct}%`, background: tokens.gap, borderRadius: 4 }} />
          </div>
        </div>

        {/* Gain */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ background: tokens.masteredBg, border: `1px solid ${tokens.mastered}44`, borderRadius: 12, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: tokens.mastered, lineHeight: 1 }}>
              +{gain}%
            </div>
            <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.mastered, marginTop: 3 }}>
              {lang === "ar" ? "مكتسب" : "Learning Gain"}
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 22, color: tokens.textFaint }}>
            {isRtl ? "←" : "→"}
          </div>
          <div style={{ display: "flex", gap: 12, flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.mastered, textAlign: "center" }}>
              {gapsResolved}/{GAPS_BEFORE.length} {lang === "ar" ? "ثغرات محلولة" : "gaps resolved"}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: gapsRemaining > 0 ? tokens.gap : tokens.mastered, textAlign: "center" }}>
              {gapsRemaining} {lang === "ar" ? "ثغرات متبقية" : "remaining"}
            </div>
          </div>
        </div>

        {/* After */}
        <div style={{ textAlign: isRtl ? "left" : "right" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.mastered, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            {lang === "ar" ? "بعد التعلم · 28 أكتوبر" : "POST-REASSESSMENT · Oct 28"}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 700, color: tokens.mastered, lineHeight: 1, marginBottom: 10 }}>
            {after.pct}%
          </div>
          <MasteryBadge pct={after.pct} evidence={after.evidence} tokens={tokens} lang={lang} />
          <div style={{ marginTop: 14, height: 7, background: tokens.inset, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${after.pct}%`, background: tokens.mastered, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Sub-skill breakdown */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 18, textAlign: isRtl ? "right" : "left" }}>
            {lang === "ar" ? "تحسين المهارات الفرعية" : "Sub-Skill Improvement"}
          </div>
          {SUBSKILLS.map((sk) => (
            <div key={sk.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>
                  {lang === "ar" ? sk.labelAr : sk.label}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.gap }}>{sk.before}%</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textFaint }}>→</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.mastered, fontWeight: 700 }}>{sk.after}%</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.mastered, background: tokens.masteredBg, border: `1px solid ${tokens.mastered}44`, borderRadius: 3, padding: "1px 5px" }}>
                    +{sk.after - sk.before}%
                  </span>
                </div>
              </div>
              {/* Stacked bar: ghost (after) behind (before) */}
              <div style={{ position: "relative", height: 7 }}>
                <div style={{ position: "absolute", inset: 0, background: tokens.inset, borderRadius: 4, overflow: "hidden", border: `1px solid ${tokens.insetBorder}` }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${sk.after}%`, background: `${tokens.mastered}30`, borderRadius: 4 }} />
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${sk.before}%`, background: tokens.gap, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: gaps resolved + timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Gaps status */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 18px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 14, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "حالة الثغرات" : "Gap Resolution Status"}
            </div>
            {GAPS_BEFORE.map((gap, i) => (
              <div key={i} style={{ padding: "10px 12px", background: gap.resolved ? tokens.masteredBg : tokens.gapBg, border: `1px solid ${gap.resolved ? tokens.mastered : tokens.gap}44`, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: gap.resolved ? tokens.mastered : tokens.gap, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {gap.resolved
                      ? <IconCheck size={11} color="white" />
                      : <span style={{ fontFamily: MONO, fontSize: 9, color: "white", fontWeight: 700 }}>!</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.5, margin: "0 0 5px", textAlign: isRtl ? "right" : "left" }}>
                      {lang === "ar" ? gap.textAr : gap.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <CitationChip label={gap.citation} tokens={tokens} />
                      {gap.resolved && (
                        <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.mastered, fontWeight: 600 }}>
                          {lang === "ar" ? "محلول" : "Resolved"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 18px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 14, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "مسار التعلم" : "Learning Timeline"}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", [isRtl ? "right" : "left"]: 10, top: 8, bottom: 8, width: 1.5, background: tokens.cardBorder }} />
              {TIMELINE.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start", flexDirection: isRtl ? "row-reverse" : "row", position: "relative" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: timelineDotColor(ev), border: `2px solid ${tokens.card}`, flexShrink: 0, zIndex: 1 }} />
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: tokens.textFaint, marginBottom: 2 }}>{lang === "ar" ? ev.dateAr : ev.date}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>{lang === "ar" ? ev.eventAr : ev.event}</div>
                    {ev.pct && (
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: ev.pct > 70 ? tokens.mastered : tokens.gap, marginTop: 2 }}>
                        {ev.pct}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "10px 12px", background: tokens.masteredBg, border: `1px solid ${tokens.mastered}44`, borderRadius: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: tokens.mastered, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar" ? "ملخص الأدلة" : "EVIDENCE SUMMARY"}
              </div>
              <div style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar"
                  ? "8 نقاط أدلة · 3 جلسات · 12 سؤال تدريبي · تقييمان"
                  : "8 Evidence Points · 3 Tutor Sessions · 12 Practice Questions · 2 Assessments"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next topic CTA */}
      <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginBottom: 4 }}>
            {lang === "ar" ? "الموضوع التالي المنصوح به" : "RECOMMENDED NEXT TOPIC"}
          </div>
          <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary }}>
            {lang === "ar" ? "جداول التجزئة — 22% إتقان" : "Hash Tables — 22% mastery"}
          </div>
          <div style={{ fontSize: 12, color: tokens.textMuted, fontFamily: bFont }}>
            {lang === "ar" ? "ثغرتان حرجتان محددتان" : "2 critical gaps diagnosed"}
          </div>
        </div>
        <button
          onClick={() => setState({ ...state, screen: "diagnostic" })}
          style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: tokens.primary, color: "white", fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
        >
          <IconReassessment size={15} color="white" />
          {lang === "ar" ? "بدء تشخيص Hash Tables" : "Start Hash Tables Diagnostic"}
        </button>
      </div>
    </div>
  );
}
