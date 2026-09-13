import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, StatusPill, bFontFor, hFontFor } from "../../components/ModuleUI";
import { EmptyState } from "../../components/SharedUI";
import { IconClipboard, IconArrowRight, IconArrowLeft, IconLock, IconReply, IconClock } from "../../components/Icons";
import { DEMO_STUDENT_ID, STUDENT_INSTITUTIONAL_IDS, STUDENT_PERSONAL_IDS, fmtAgo } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Student assignment inbox. Only exists for institutional enrolment
// (FR-SCOPE-03) — a personal-only account never reaches this screen.
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentAssignmentsScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

  const enrolment = state.personalOnly ? STUDENT_PERSONAL_IDS : STUDENT_INSTITUTIONAL_IDS;
  const assignments = mod.assignments.filter((a) => enrolment.includes(a.courseId));

  const myStatus = (assignmentId: string): { id: string; en: string; ar: string; tone: "default" | "primary" | "peri" | "violet" | "slate" } => {
    const units = mod.units.filter((u) => u.assignmentId === assignmentId && u.studentId === DEMO_STUDENT_ID);
    const draft = mod.drafts && Object.keys(mod.drafts).some((k) => k.startsWith(`${assignmentId}|`) && (mod.drafts[k].text || mod.drafts[k].image));
    if (units.some((u) => u.status === "resubmission_requested")) return { id: "resub", en: "Resubmission requested", ar: "طُلبت إعادة التسليم", tone: "violet" };
    if (units.length && units.every((u) => u.status === "final")) return { id: "graded", en: "Graded", ar: "مُقيّم", tone: "primary" };
    if (units.some((u) => u.status === "awaiting_review")) return { id: "review", en: "Under review", ar: "قيد المراجعة", tone: "peri" };
    if (draft) return { id: "draft", en: "Draft saved", ar: "مسودة محفوظة", tone: "default" };
    return { id: "none", en: "Not started", ar: "لم يبدأ", tone: "slate" };
  };

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 20, textAlign: isRtl ? "right" : "left" }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
          {lang === "ar" ? "التكليفات" : "Assignments"}
        </h1>
        <p style={{ fontSize: 12.5, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
          {lang === "ar"
            ? "مسوداتك تُحفظ تلقائياً. لا يُرسَل شيء للتقييم إلا بزر «تسليم التكليف» الواحد."
            : "Your drafts auto-save continuously. Nothing is sent for grading until the single “Submit assignment” action."}
        </p>
      </div>

      {state.personalOnly ? (
        <Card tokens={tokens}>
          <EmptyState
            tokens={tokens}
            headFont={hFont}
            bodyFont={bFont}
            icon={<IconLock size={22} color={tokens.textFaint} />}
            title={lang === "ar" ? "لا تكليفات في المقررات الشخصية" : "No assignments on personal courses"}
            description={lang === "ar"
              ? "وحدة التكليفات والتصحيح مؤسسة فقط: المقرر الشخصي لا مدرّس له، فلا بوابة اعتماد. تعلّمك الذاتي يستمر كالمعتاد."
              : "The assignment and grading module is institution-only: a personal course has no instructor, so there is no approval gate. Your self-directed loop continues as usual."}
          />
        </Card>
      ) : assignments.length === 0 ? (
        <Card tokens={tokens}>
          <EmptyState
            tokens={tokens}
            headFont={hFont}
            bodyFont={bFont}
            icon={<IconClipboard size={22} color={tokens.textFaint} />}
            title={lang === "ar" ? "لا تكليفات منشورة بعد" : "No published assignments yet"}
            description={lang === "ar" ? "سيظهر التكليف هنا فور نشره من مدرّس المقرر." : "An assignment appears here as soon as your instructor publishes it."}
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assignments.map((a) => {
            const st = myStatus(a.id);
            const course = mod.courses.find((c) => c.id === a.courseId);
            const pendingEdit = mod.units.some((u) => u.assignmentId === a.id && u.studentId === DEMO_STUDENT_ID && u.status === "resubmission_requested");
            return (
              <Card key={a.id} tokens={tokens} onClick={() => setState({ ...state, screen: "student-assignment", courseId: a.courseId, assignmentId: a.id })} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 7, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <Chip tokens={tokens} tone="primary">{a.courseId}</Chip>
                      <StatusPill status={a.status} tokens={tokens} lang={lang} />
                      <Chip tokens={tokens} tone={st.tone}>{lang === "ar" ? st.ar : st.en}</Chip>
                      {pendingEdit && <Chip tokens={tokens} tone="violet"><IconReply size={10} color={tokens.gap} />{lang === "ar" ? "سؤال قابل للتعديل" : "editable question"}</Chip>}
                    </div>
                    <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14.5, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 3 }}>
                      {lang === "ar" ? a.title.ar : a.title.en}
                    </div>
                    <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted }}>
                      {course ? (lang === "ar" ? course.title.ar : course.title.en) : a.courseId} · {a.questions.length} {lang === "ar" ? "أسئلة" : "questions"} · {course?.instructor}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: isRtl ? "flex-start" : "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <IconClock size={10} color={tokens.textFaint} />
                      {fmtAgo(a.createdAt, lang)}
                    </span>
                    <Btn tokens={tokens} lang={lang} variant="soft" style={{ padding: "6px 12px", fontSize: 11.5 }}>
                      {a.status === "open" ? (lang === "ar" ? "فتح" : "Open") : (lang === "ar" ? "اطلع" : "View")}
                      <Arrow size={12} color={tokens.primary} />
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 16, lineHeight: 1.6, textAlign: isRtl ? "right" : "left" }}>
        {lang === "ar"
          ? "بعد التسليم ترى حالة «قيد المراجعة» فقط — لا درجة قبل اعتماد المدرّس، بغض النظر عن إعداد الإظهار."
          : "After submission you see “Under review” only — no score before the instructor finalizes it, regardless of the visibility setting."}
      </p>
    </div>
  );
}
