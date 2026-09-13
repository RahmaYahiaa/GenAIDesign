import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, AlertStrip, bFontFor, hFontFor, ConfidencePill } from "../../components/ModuleUI";
import { StatTile } from "../../components/SharedUI";
import { IconArrowRight, IconArrowLeft, IconWarning, IconDoubleCheck, IconClipboard, IconUpload, IconSparkle } from "../../components/Icons";
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
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

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
      const unaddressed = MISCONCEPTIONS.filter((m) => {
        if (!pendingMisIds.has(m.id)) return false;
        const count = pending.filter((u) => latestAttempt(u).eval.misconceptions.includes(m.id)).length;
        return count >= 2 && !publishedFor.has(m.id);
      });
      const coverage = course.topics.filter((t) => approvedMaterials(t) === 0);
      const urgency = pending.length * 10 + quick.length;
      return { course, pending: pending.length, quick: quick.length, unaddressed, coverage, urgency };
    })
    .sort((a, b) => b.urgency - a.urgency);   // FR-HOME-01 — most urgent first

  const totalPending = rows.reduce((s, r) => s + r.pending, 0);
  const totalQuick = rows.reduce((s, r) => s + r.quick, 0);
  const mostUrgent = rows[0];

  const openCourse = (courseId: string, tab: "assignments" | "analytics" | "overview" | "audit" = "overview") =>
    setState({ ...state, screen: "course-workspace", courseId, tab });

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            {lang === "ar" ? "مركز الإجراءات" : "Instructor action center"}
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {lang === "ar"
              ? "كل مقرراتك مرتّبة حسب حجم العمل المعلّق — الأكثر إلحاحاً أولاً."
              : "All of your courses, ordered by the volume of work awaiting you — most urgent first."}
          </p>
        </div>
        <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => setState({ ...state, screen: "remedial-studio" })}>
          <IconSparkle size={13} color={tokens.primary} />
          {lang === "ar" ? "محتوى علاجي" : "Remedial content"}
        </Btn>
      </div>

      {/* Top summary banner — attention only, never an approval surface (FR-HOME-02/03) */}
      <div
        className="hero-drift"
        onClick={() => mostUrgent && openCourse(mostUrgent.course.id, "assignments")}
        style={{
          cursor: mostUrgent ? "pointer" : "default",
          background: state.dark
            ? "linear-gradient(150deg, #101530 0%, #131D42 55%, #1A1639 100%)"
            : "linear-gradient(150deg, #163F8A 0%, #154685 55%, #0C6B8C 100%)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 20,
          border: state.dark ? "1px solid #242E5C" : "1px solid rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          gap: 22,
          flexWrap: "wrap",
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ flex: 1, minWidth: 220, textAlign: isRtl ? "right" : "left" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", marginBottom: 6 }}>
            {lang === "ar" ? "عبر كل المقررات" : "ACROSS ALL COURSES"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{totalPending}</span>
            <span style={{ fontFamily: hFont, fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              {lang === "ar" ? "تسليماً بانتظار مراجعتك" : "submissions awaiting your review"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <IconDoubleCheck size={12} color="#8FB4FF" />
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#CFE0FF", fontWeight: 700 }}>
                {totalQuick} {lang === "ar" ? "جاهزة لاعتماد سريع" : "ready for quick approval"}
              </span>
            </span>
            <span style={{ fontFamily: bFont, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              {lang === "ar" ? "ثقة عالية — تُعتمد من داخل المقرر فقط" : "high confidence — approvable only inside the course"}
            </span>
          </div>
        </div>
        {mostUrgent && (
          <div style={{ textAlign: isRtl ? "right" : "left", flexShrink: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", marginBottom: 6 }}>
              {lang === "ar" ? "الأكثر إلحاحاً" : "MOST URGENT"}
            </div>
            <div style={{ fontFamily: hFont, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em" }}>
              {mostUrgent.course.id} · {lang === "ar" ? mostUrgent.course.title.ar : mostUrgent.course.title.en}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); openCourse(mostUrgent.course.id, "assignments"); }}
              className="genai-cta"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 9, border: "none", background: "#fff", color: "#163F8A", fontFamily: hFont, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
            >
              {lang === "ar" ? "افتح مساحة المقرر" : "Open course workspace"}
              <Arrow size={14} color="#163F8A" />
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatTile label={lang === "ar" ? "بانتظار المراجعة" : "Pending review"} value={`${totalPending}`} sub={lang === "ar" ? "عبر كل المقررات" : "across all courses"} mono accent={tokens.developing} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "اعتماد سريع متاح" : "Quick-approve eligible"} value={`${totalQuick}`} sub={lang === "ar" ? "ثقة عالية" : "high confidence"} mono accent={tokens.mastered} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "أنماط خطأ غير معالجة" : "Unaddressed error patterns"} value={`${rows.reduce((s, r) => s + r.unaddressed.length, 0)}`} sub={lang === "ar" ? "تحتاج محتوى علاجياً" : "need remedial content"} accent={tokens.gap} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "فجوات تغطية المواد" : "Material coverage gaps"} value={`${rows.reduce((s, r) => s + r.coverage.length, 0)}`} sub={lang === "ar" ? "مواضيع بلا مادة معتمدة" : "topics with zero approved material"} accent={tokens.gap} tokens={tokens} headFont={hFont} bodyFont={bFont} />
      </div>

      {/* Course cards — ordered by urgency */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {rows.map((row, idx) => (
          <Card key={row.course.id} tokens={tokens} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <Chip tokens={tokens} tone="primary">{row.course.id}</Chip>
                  {idx === 0 && <Chip tokens={tokens} tone="violet">{lang === "ar" ? "الأكثر إلحاحاً" : "MOST URGENT"}</Chip>}
                </div>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                  {lang === "ar" ? row.course.title.ar : row.course.title.en}
                </div>
                <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 2 }}>
                  {lang === "ar" ? `الأسبوع ${row.course.week}` : `Week ${row.course.week}`} · {row.course.enrolled} {lang === "ar" ? "طالباً" : "students"}
                </div>
              </div>
              <div style={{ textAlign: isRtl ? "left" : "right", flexShrink: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: row.pending > 0 ? tokens.developing : tokens.noEvidence }}>{row.pending}</div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: tokens.textFaint, letterSpacing: "0.05em" }}>{lang === "ar" ? "بانتظار المراجعة" : "PENDING"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary }}>
                <IconDoubleCheck size={13} color={tokens.mastered} />
                {row.quick} {lang === "ar" ? "جاهزة لاعتماد سريع" : "quick-approve ready"}
              </span>
              <ConfidencePill confidence={row.quick > 0 ? "high" : "medium"} tokens={tokens} lang={lang} short />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {row.unaddressed.map((m) => (
                <AlertStrip
                  key={m.id}
                  tokens={tokens}
                  lang={lang}
                  tone="violet"
                  icon={<IconWarning size={13} color={tokens.gap} />}
                  title={lang === "ar" ? "نمط خطأ شائع غير معالج" : "Unaddressed common error pattern"}
                  body={m.text}
                  action={
                    <Btn tokens={tokens} lang={lang} variant="violet" onClick={() => setState({ ...state, screen: "remedial-studio", courseId: row.course.id, assignmentId: undefined, tab: undefined })} style={{ padding: "5px 10px", fontSize: 11 }}>
                      {lang === "ar" ? "عالج" : "Address"}
                    </Btn>
                  }
                />
              ))}
              {row.coverage.map((t) => (
                <AlertStrip
                  key={t.id}
                  tokens={tokens}
                  lang={lang}
                  tone="slate"
                  icon={<IconUpload size={13} color={tokens.noEvidence} />}
                  title={lang === "ar" ? `لا مادة معتمدة: ${t.label[lang]}` : `Zero approved material: ${t.label.en}`}
                  body={lang === "ar" ? "المعلم الذكي والتقييم لا يستطيعان الاستناد لهذا الموضوع." : "The tutor and the evaluation pipeline cannot ground this topic."}
                  action={
                    <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => openCourse(row.course.id, "overview")} style={{ padding: "5px 10px", fontSize: 11 }}>
                      {lang === "ar" ? "ارفع مادة" : "Upload"}
                    </Btn>
                  }
                />
              ))}
              {row.unaddressed.length === 0 && row.coverage.length === 0 && (
                <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint }}>
                  {lang === "ar" ? "لا تنبيهات مفتوحة على هذا المقرر." : "No open alerts on this course."}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: "auto", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Btn tokens={tokens} lang={lang} onClick={() => openCourse(row.course.id, "assignments")} style={{ flex: 1, justifyContent: "center" }}>
                <IconClipboard size={13} color="#fff" />
                {lang === "ar" ? "افتح مساحة المقرر" : "Open workspace"}
              </Btn>
              <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => openCourse(row.course.id, "analytics")}>
                {lang === "ar" ? "التحليلات" : "Analytics"}
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 18, lineHeight: 1.6, textAlign: isRtl ? "right" : "left" }}>
        {lang === "ar"
          ? "هذه الشاشة توجّه الانتباه فقط — لا توجد أي إجراء اعتماد هنا. كل إجراءات التصحيح متاحة داخل مساحة المقرر حيث يكتمل السياق."
          : "This screen only directs attention — no approval action exists here. All grading actions live inside a course workspace, where you have full context (materials, error patterns, enrolled students)."}
      </p>
    </div>
  );
}
