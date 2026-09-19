import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { useAdminModule } from "../../store/AdminStore";
import { bFontFor, hFontFor, Modal, Field, Btn, inputStyle, toast } from "../../components/ModuleUI";
import { IconWarning, IconClipboard, IconPlus, IconCheck } from "../../components/Icons";
import { MISCONCEPTIONS, latestAttempt, approvedMaterials, INSTRUCTOR_COURSE_IDS } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Instructor Home — cross-course action center (FR-HOME-01..05).
// Orders courses by volume of pending work, never alphabetically, and only
// directs attention: no grading action of any kind exists on this screen.
// ─────────────────────────────────────────────────────────────────────────────

export default function InstructorHomeScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useInstructorModule();
  // FR-ADM-08 lever — the institution gates whether doctors may create
  // course shells at all; the affordance below appears only when allowed.
  const { state: adminMod } = useAdminModule();
  const canCreate = adminMod.settings.allowDoctorCourseCreation;
  const [createOpen, setCreateOpen] = useState(false);
  const [code, setCode] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [year, setYear] = useState("3");
  const [extras, setExtras] = useState<{ code: string; titleEn: string; titleAr: string; year: number }[]>([]);
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
      {totalPending === 0 && (
        <div
          style={{
            background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12,
            padding: "34px 24px", marginBottom: 20, textAlign: "center",
          }}
        >
          <div style={{ display: "inline-flex", width: 44, height: 44, borderRadius: "50%", background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <IconClipboard size={18} color={tokens.primary} />
          </div>
          <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 16, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 4 }}>
            {lang === "ar" ? "لا تسليمات تحتاج مراجعة الآن" : "No submissions need review right now"}
          </div>
          <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textMuted }}>
            {lang === "ar" ? "كل شيء معالَج — ستظهر التسليمات الجديدة هنا فور وصولها." : "Everything is handled — new submissions will surface here as they arrive."}
          </div>
        </div>
      )}
      {totalPending > 0 && mostUrgent && (
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

        {/* Courses the doctor provisioned himself (FR-ADM-08 lever ON) */}
        {extras.map((extra) => (
          <div
            key={extra.code}
            style={{
              background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12,
              padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: tokens.primary, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, borderRadius: 6, padding: "3px 9px" }}>
                {extra.code}
              </span>
              <span style={{ fontFamily: bFont, fontSize: 11, fontWeight: 600, color: tokens.textFaint }}>
                {lang === "ar" ? "جديد · 0 طالب" : "New · 0 students"}
              </span>
            </div>
            <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 3 }}>
                {lang === "ar" ? extra.titleAr : extra.titleEn}
              </div>
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted }}>
                {lang === "ar" ? `السنة ${extra.year} · أنشأته بنفسك` : `Year ${extra.year} · provisioned by you`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: bFont, fontSize: 12, color: tokens.gap, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <IconWarning size={13} color={tokens.gap} />
              {lang === "ar" ? "بلا مواد بعد — يظهر لدى الإدارة كمقرر عارٍ" : "No materials yet — the admin sees it as a bare course"}
            </div>
            <button
              onClick={() => setState({ ...state, screen: "content-studio", courseId: extra.code })}
              style={{
                marginTop: "auto", width: "100%", padding: "9px 0", borderRadius: 8,
                border: `1px solid ${tokens.cardBorder}`, background: tokens.inset,
                color: tokens.textSecondary, fontFamily: bFont, fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              }}
            >
              {lang === "ar" ? "ارفع مواده من الاستوديو" : "Upload materials in the Studio"}
            </button>
          </div>
        ))}

        {/* The lever's affordance — only rendered while the institution allows it */}
        {canCreate && (
          <button
            onClick={() => { setCode(""); setTitleEn(""); setTitleAr(""); setYear("3"); setCreateOpen(true); }}
            style={{
              minHeight: 170, borderRadius: 12, cursor: "pointer",
              border: `1.5px dashed ${tokens.cardBorder}`, background: "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 18,
            }}
          >
            <span style={{ display: "inline-flex", width: 40, height: 40, borderRadius: "50%", background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, alignItems: "center", justifyContent: "center" }}>
              <IconPlus size={18} color={tokens.primary} />
            </span>
            <span style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>
              {lang === "ar" ? "مقرر جديد" : "New course"}
            </span>
            <span style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, lineHeight: 1.6, maxWidth: 220 }}>
              {lang === "ar" ? "مؤسستك تسمح لك بإنشاء مقررات داخل قسمك — تظهر للإدارة فور إنشائها." : "Your institution lets doctors create course shells — the admin sees each one the moment it exists."}
            </span>
          </button>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? "إنشاء مقرر جديد" : "Create a new course"}
        subtitle={lang === "ar" ? "هيكل مقرر داخل قسمك — المواد تُرفع لاحقًا من استوديو المحتوى." : "A course shell inside your department — materials are uploaded from Content Studio afterwards."}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field tokens={tokens} lang={lang} label={lang === "ar" ? "كود المقرر" : "Course code"} required>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ ...inputStyle(tokens, bFont), direction: "ltr", textAlign: "left" }} placeholder="CS310" />
            </Field>
            <Field tokens={tokens} lang={lang} label={lang === "ar" ? "السنة" : "Year"} required>
              <select value={year} onChange={(e) => setYear(e.target.value)} style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}>
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{lang === "ar" ? `السنة ${y}` : `Year ${y}`}</option>)}
              </select>
            </Field>
          </div>
          <Field tokens={tokens} lang={lang} label={lang === "ar" ? "الاسم (إنجليزي)" : "Title (English)"} required>
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} style={{ ...inputStyle(tokens, bFont) }} placeholder="Mobile Application Development" />
          </Field>
          <Field tokens={tokens} lang={lang} label={lang === "ar" ? "الاسم (عربي)" : "Title (Arabic)"} required>
            <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} style={{ ...inputStyle(tokens, bFont) }} placeholder="تطوير تطبيقات المحمول" />
          </Field>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconCheck size={12} color={tokens.textFaint} />
            <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.6 }}>
              {lang === "ar"
                ? "المقرر الجديد يظهر في تحليلات المؤسسة كمقرر بلا مواد حتى ترفع أول محتوى معتمد."
                : "The new shell shows up in institution analytics as a course without materials until your first approved upload."}
            </span>
          </div>
          <Btn
            tokens={tokens}
            lang={lang}
            disabled={!(code.trim() && titleEn.trim() && titleAr.trim())}
            style={{ width: "100%", padding: "11px 0", fontSize: 13.5, justifyContent: "center" }}
            onClick={() => {
              setExtras((prev) => [...prev, { code: code.trim().toUpperCase(), titleEn: titleEn.trim(), titleAr: titleAr.trim(), year: Number(year) }]);
              setCreateOpen(false);
              toast(lang === "ar" ? "أُنشئ المقرر — يظهر لدى الإدارة الآن بانتظار مواده الأولى." : "Course created — the institution already sees it, waiting for its first materials.");
            }}
          >
            {lang === "ar" ? "إنشاء المقرر" : "Create course"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
