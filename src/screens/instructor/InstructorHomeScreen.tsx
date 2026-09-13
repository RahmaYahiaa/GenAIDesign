import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { bFontFor, hFontFor } from "../../components/ModuleUI";
import { IconWarning, IconClipboard } from "../../components/Icons";
import { MISCONCEPTIONS, latestAttempt, approvedMaterials, INSTRUCTOR_COURSE_IDS } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Instructor Home — cross-course action center (FR-HOME-01..05).
// Orders courses by volume of pending work, never alphabetically, and only
// directs attention: no grading action of any kind exists on this screen.
// ─────────────────────────────────────────────────────────────────────────────

export default function InstructorHomeScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const courses = mod.courses.filter((c) => INSTRUCTOR_COURSE_IDS.includes(c.id));

  const rows = courses
    .map((course) => {
      const units = mod.units.filter((u) => u.courseId === course.id);
      const pending = units.filter((u) => u.status === "awaiting_review");
      const quick = pending.filter((u) => {
        const ev = latestAttempt(u).eval;
        return ev.confidence === "high" && ev.aiScore !== null;
      });
      const pendingMisIds = new Set(pending.flatMap((u) => latestAttempt(u).eval.misconceptions));
      const publishedFor = new Set(mod.remedial.filter((r) => r.status === "published" && r.misconceptionId).map((r) => r.misconceptionId));
      const unaddressed = MISCONCEPTIONS.filter((m) => pendingMisIds.has(m.id) && !publishedFor.has(m.id));
      const coverage = course.topics.filter((t) => approvedMaterials(t) === 0);
      return { course, pending: pending.length, quick: quick.length, unaddressed: unaddressed.length, coverage: coverage.length };
    })
    .sort((a, b) => b.pending - a.pending || b.quick - a.quick);   // FR-HOME-01

  const totalPending = rows.reduce((s, r) => s + r.pending, 0);
  const totalQuick = rows.reduce((s, r) => s + r.quick, 0);
  const mostUrgent = rows[0];

  const openWorkspace = (courseId: string) =>
    setState({ ...state, screen: "course-workspace", courseId, tab: "assignments" });

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: isRtl ? "right" : "left" }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
          {lang === "ar" ? "مساحة المدرّس" : "Instructor Workspace"}
        </h1>
        <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
          {lang === "ar" ? "كل مقرراتك في عرض واحد، مرتّبة حسب الإلحاح." : "All your courses in one view, ordered by urgency."}
        </p>
      </div>

      {/* Attention banner — directs only, never approves (FR-HOME-02/03) */}
      {mostUrgent && (
        <div
          style={{
            background: tokens.primaryLight,
            border: `1px solid ${tokens.primary}33`,
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>
              {lang === "ar" ? "يحتاج انتباهك" : "NEEDS YOUR ATTENTION"}
            </div>
            <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 24, color: tokens.textPrimary, letterSpacing: "-0.03em", marginBottom: 4 }}>
              {totalPending} {lang === "ar" ? "تسليماً بانتظار المراجعة" : "pending submissions"}
            </div>
            <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary }}>
              {totalQuick} {lang === "ar" ? "جاهز للاعتماد السريع" : "ready for quick approval"}
            </div>
          </div>
          <button
            onClick={() => openWorkspace(mostUrgent.course.id)}
            className="genai-cta"
            style={{
              padding: "11px 18px", borderRadius: 9, border: "none",
              background: tokens.primaryBtn, color: "#fff",
              fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer",
              boxShadow: tokens.primaryShadow, flexShrink: 0,
            }}
          >
            {lang === "ar" ? `افتح مساحة ${mostUrgent.course.id}` : `Open ${mostUrgent.course.id} workspace`}
          </button>
        </div>
      )}

      {/* Course cards — most urgent first */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {rows.map((row) => (
          <div
            key={row.course.id}
            style={{
              background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12,
              padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: tokens.primary, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, borderRadius: 6, padding: "3px 9px" }}>
                {row.course.id}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: bFont, fontSize: 12, fontWeight: 600, color: tokens.primary }}>
                <IconClipboard size={13} color={tokens.primary} />
                {row.pending} {lang === "ar" ? "بانتظار المراجعة" : "pending"}
              </span>
            </div>

            <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 3 }}>
                {lang === "ar" ? row.course.title.ar : row.course.title.en}
              </div>
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted }}>
                {row.course.enrolled} {lang === "ar" ? "طالباً" : "students"} · {row.quick} {lang === "ar" ? "جاهز سريعاً" : "quick-ready"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: isRtl ? "right" : "left" }}>
              {row.unaddressed > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: bFont, fontSize: 12, color: tokens.gap, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <IconWarning size={13} color={tokens.gap} />
                  {lang === "ar" ? "نمط خطأ شائع لم يُعالج بعد" : "Common error pattern not addressed yet"}
                </div>
              ) : (
                <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>
                  {lang === "ar" ? "لا أنماط خطأ غير معالجة" : "No unaddressed error patterns"}
                </div>
              )}
              {row.coverage > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: bFont, fontSize: 12, color: tokens.gap, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <IconWarning size={13} color={tokens.gap} />
                  {row.coverage} {lang === "ar" ? "موضوع بلا مواد معتمدة" : "topic with zero approved materials"}
                </div>
              ) : (
                <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>
                  {lang === "ar" ? "كل المواضيع لها مواد معتمدة" : "All topics have approved materials"}
                </div>
              )}
            </div>

            <button
              onClick={() => openWorkspace(row.course.id)}
              style={{
                marginTop: "auto", width: "100%", padding: "9px 0", borderRadius: 8,
                border: `1px solid ${tokens.primary}44`, background: tokens.primaryLight,
                color: tokens.primary, fontFamily: bFont, fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              }}
            >
              {lang === "ar" ? "افتح مساحة العمل" : "Open workspace"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
