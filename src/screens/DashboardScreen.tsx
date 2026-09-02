import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor } from "../tokens";
import { MasteryBar, MasteryBadge, CitationChip, StatTile, SectionHeading, EmptyState } from "../components/SharedUI";
import { IconTutor, IconDiagnostic, IconTrendUp, IconArrowRight, IconArrowLeft, IconBookOpen } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

const COURSES = [
  { code: "CS301", name: "Data Structures & Algorithms", nameAr: "هياكل البيانات والخوارزميات", instructor: "Dr. Nadia Al-Manea", week: 9, mastery: 58, evidence: 22, topics: 12 },
  { code: "CS302", name: "Operating Systems", nameAr: "نظم التشغيل", instructor: "Dr. Khalid Al-Shahrani", week: 7, mastery: 81, evidence: 18, topics: 10 },
  { code: "MATH201", name: "Probability & Statistics", nameAr: "الاحتمال والإحصاء", instructor: "Dr. Fatima Al-Ghamdi", week: 9, mastery: 33, evidence: 7, topics: 10 },
];

export default function DashboardScreen({ state, setState }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const ArrowIcon = isRtl ? IconArrowLeft : IconArrowRight;

  const csTopics = [
    { label: lang === "ar" ? "المصفوفات والقوائم" : "Arrays & Linked Lists", pct: 91, ev: 12 },
    { label: lang === "ar" ? "بحث العرض أولاً BFS" : "BFS / Graph Traversal", pct: 74, ev: 8 },
    { label: lang === "ar" ? "بحث العمق DFS" : "DFS & Cycle Detection", pct: 55, ev: 6 },
    { label: lang === "ar" ? "جداول التجزئة" : "Hash Tables", pct: 22, ev: 2 },
  ];

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 24, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            {lang === "ar" ? "مرحباً، سارة" : "Good morning, Sarah"}
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {lang === "ar" ? "الأسبوع 9 · CS301 — هياكل البيانات" : "Week 9 · CS301 — Data Structures · Prof. Dr. Al-Manea"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatTile label={lang === "ar" ? "المقررات" : "Enrolled Courses"} value="3" sub={lang === "ar" ? "نشطة" : "Active"} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "متوسط الإتقان" : "Avg. Mastery"} value="57%" sub={lang === "ar" ? "عبر الكل" : "Across all topics"} mono tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "الجلسات" : "AI Tutor Sessions"} value="23" sub={lang === "ar" ? "هذا الفصل" : "This semester"} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "نقاط الأدلة" : "Evidence Points"} value="47" sub={lang === "ar" ? "تم التحقق" : "Verified"} mono accent={tokens.mastered} tokens={tokens} headFont={hFont} bodyFont={bFont} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Courses */}
          <div>
            <SectionHeading title={lang === "ar" ? "مقرراتي" : "My Courses"} tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COURSES.map((c) => {
                const level = masteryLevel(c.mastery, c.evidence > 0);
                const color = masteryColor(level, tokens);
                return (
                  <div
                    key={c.code}
                    onClick={() => setState({ ...state, screen: "mastery" })}
                    style={{
                      background: tokens.card, border: `1px solid ${tokens.cardBorder}`,
                      borderRadius: 12, padding: "16px 18px",
                      display: "flex", alignItems: "center", gap: 14,
                      flexDirection: isRtl ? "row-reverse" : "row",
                      cursor: "pointer", transition: "box-shadow 150ms ease",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, fontWeight: 700, color: tokens.primary, flexShrink: 0 }}>
                      {c.code}
                    </div>
                    <div style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>
                      <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 2 }}>
                        {lang === "ar" ? c.nameAr : c.name}
                      </div>
                      <div style={{ fontSize: 12, color: tokens.textMuted, fontFamily: bFont }}>
                        {c.instructor} · {lang === "ar" ? `الأسبوع ${c.week}` : `Week ${c.week}`} · {c.topics} {lang === "ar" ? "موضوع" : "topics"}
                      </div>
                    </div>
                    <div style={{ textAlign: isRtl ? "left" : "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color, marginBottom: 1 }}>{c.mastery}%</div>
                      <div style={{ fontSize: 10, color: tokens.textFaint, fontFamily: bFont }}>{c.evidence} {lang === "ar" ? "أدلة" : "evidence pts"}</div>
                    </div>
                    <ArrowIcon size={16} color={tokens.textFaint} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* CS301 Topic Snapshot */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                {lang === "ar" ? "CS301 — الإتقان الحالي" : "CS301 — Current Mastery Snapshot"}
              </div>
              <MasteryBadge pct={58} evidence={22} tokens={tokens} lang={lang} />
            </div>
            {csTopics.map((t) => (
              <div key={t.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>{t.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: masteryColor(masteryLevel(t.pct, t.ev > 0), tokens) }}>{t.pct}%</span>
                </div>
                <MasteryBar pct={t.pct} evidence={t.ev} tokens={tokens} />
              </div>
            ))}
            <button
              onClick={() => setState({ ...state, screen: "mastery" })}
              style={{ marginTop: 8, fontSize: 12, color: tokens.accent, background: "none", border: "none", cursor: "pointer", fontFamily: bFont, fontWeight: 500, padding: 0, textAlign: isRtl ? "right" : "left", display: "block", width: "100%" }}
            >
              {lang === "ar" ? "عرض جميع المواضيع ←" : "View all 12 topics →"}
            </button>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Recommended action */}
          <div
            style={{
              background: state.dark
                ? `linear-gradient(135deg, ${tokens.primaryLight}, ${tokens.inset})`
                : "linear-gradient(135deg, #EBF1FB, #F4F6F9)",
              border: `1.5px solid ${tokens.citationBorder}`,
              borderRadius: 14, padding: "20px 18px",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 9, color: tokens.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "▶ الخطوة التالية المنصوحة" : "▶ RECOMMENDED NEXT"}
            </div>
            <h3 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em", margin: "0 0 8px", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "سد ثغرة جداول التجزئة" : "Close Hash Tables Gap"}
            </h3>
            <p style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.6, margin: "0 0 12px", fontFamily: bFont, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar"
                ? "جداول التجزئة عند 22% — أدنى مستوى في CS301. المعلم الذكي جاهز بجلسة مبنية على المحاضرة 7."
                : "Hash Tables is at 22% — your lowest topic in CS301. An AI Tutor session is ready, grounded in Lecture 7 §3."}
            </p>
            <CitationChip label="CS301 · Lec 7 §3" tokens={tokens} />
            <button
              onClick={() => setState({ ...state, screen: "tutor" })}
              style={{ display: "block", width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 8, border: "none", background: tokens.primary, color: "white", fontFamily: hFont, fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em", cursor: "pointer" }}
            >
              {lang === "ar" ? "ابدأ الجلسة" : "Start Tutor Session"}
            </button>
          </div>

          {/* Diagnostic nudge */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 16px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: tokens.developingBg, border: `1px solid ${tokens.developingBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconDiagnostic size={17} color={tokens.developing} />
              </div>
              <div style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, marginBottom: 3 }}>
                  {lang === "ar" ? "التشخيص متاح" : "Diagnostic Ready"}
                </div>
                <div style={{ fontSize: 12, color: tokens.textMuted, fontFamily: bFont, lineHeight: 1.5 }}>
                  {lang === "ar" ? "أشجار ثنائية لم تُقيَّم بعد." : "Binary Trees hasn't been assessed yet — 0 evidence."}
                </div>
                <button
                  onClick={() => setState({ ...state, screen: "diagnostic" })}
                  style={{ marginTop: 8, fontSize: 12, color: tokens.developing, background: "none", border: "none", cursor: "pointer", fontFamily: bFont, fontWeight: 600, padding: 0, textAlign: isRtl ? "right" : "left" }}
                >
                  {lang === "ar" ? "ابدأ التشخيص ←" : "Start Diagnostic →"}
                </button>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 16px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, marginBottom: 12, letterSpacing: "-0.01em", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "النشاط الأخير" : "Recent Activity"}
            </div>
            {[
              { what: lang === "ar" ? "جلسة BFS — تقدم ملحوظ" : "BFS Tutor Session — Progress", time: lang === "ar" ? "اليوم" : "Today", delta: "+23%" },
              { what: lang === "ar" ? "تقييم DFS" : "DFS Diagnostic", time: lang === "ar" ? "أمس" : "Yesterday", delta: "55%" },
              { what: lang === "ar" ? "مراجعة الأشجار" : "BST Practice", time: lang === "ar" ? "الأربعاء" : "Wed", delta: "38%" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${tokens.cardBorder}` : "none", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ textAlign: isRtl ? "right" : "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>{a.what}</div>
                  <div style={{ fontSize: 11, color: tokens.textFaint, fontFamily: bFont }}>{a.time}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: tokens.developing }}>{a.delta}</span>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 16px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, marginBottom: 10, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "قادم" : "Upcoming"}
            </div>
            {[
              { label: lang === "ar" ? "تقييم — الثلاثاء" : "Assessment — Tue", sub: lang === "ar" ? "رسوم البيانات" : "Graphs & Traversal", urgency: "high" },
              { label: lang === "ar" ? "محاضرة — الأربعاء" : "Lecture — Wed", sub: lang === "ar" ? "الجشعة" : "Greedy Algorithms", urgency: "medium" },
            ].map((u, i) => (
              <div key={i} style={{ padding: "9px 11px", background: u.urgency === "high" ? tokens.gapBg : tokens.developingBg, border: `1px solid ${u.urgency === "high" ? tokens.gapBorder : tokens.developingBorder}`, borderRadius: 8, marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: u.urgency === "high" ? tokens.gap : tokens.developing, fontFamily: bFont, textAlign: isRtl ? "right" : "left" }}>{u.label}</div>
                <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont, textAlign: isRtl ? "right" : "left" }}>{u.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
