import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import {
  Card, Chip, ScoreValue, AlertStrip, BackCircle, ConfirmBtn,
  bFontFor, hFontFor, textareaStyle, toast,
} from "../../components/ModuleUI";
import { IconCheck, IconImageAttach, IconReply, IconBan, IconTrash } from "../../components/Icons";
import { DEMO_STUDENT_ID, latestAttempt, fmtAgo } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Student submission experience (FR-SUB-*, FR-RESUB-04, FR-VIS-03) —
// reference d9: every question stacked on one page (no navigator chips),
// read-only answer blocks once submitted, and a single submit action.
// Drafts auto-save continuously; nothing is graded until the instructor
// decides, and no score appears before then regardless of visibility.
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentAssignmentScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, saveDraft, submitAssignment } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const assignment = mod.assignments.find((a) => a.id === state.assignmentId);

  const units = useMemo(
    () => (assignment ? mod.units.filter((u) => u.assignmentId === assignment.id && u.studentId === DEMO_STUDENT_ID) : []),
    [mod.units, assignment],
  );

  const isEditable = (qid: string): boolean => {
    if (!assignment || assignment.status !== "open") return false;
    const u = units.find((x) => x.questionId === qid);
    if (!u) return true;                                   // not submitted yet → draft
    return u.status === "resubmission_requested";          // instructor sent it back
  };

  const initial = useMemo(() => {
    const map: Record<string, { text: string; image?: string }> = {};
    if (!assignment) return map;
    for (const q of assignment.questions) {
      const u = units.find((x) => x.questionId === q.id);
      const d = mod.drafts[`${assignment.id}|${q.id}`];
      if (u) {
        const last = latestAttempt(u);
        map[q.id] = { text: last.text, image: last.image };   // FR-RESUB-04 pre-fill on resubmission
      } else if (d) {
        map[q.id] = { text: d.text, image: d.image };
      } else {
        map[q.id] = { text: "", image: undefined };
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id]);

  const [answers, setAnswers] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setAnswers(initial); }, [initial]);

  // Continuous auto-save (FR-SUB-02) — debounced, never submits.
  const first = useRef(true);
  useEffect(() => {
    if (!assignment) return;
    if (first.current) { first.current = false; return; }
    setSaving(true);
    const t = window.setTimeout(() => {
      for (const q of assignment.questions) {
        if (isEditable(q.id)) saveDraft(assignment.id, q.id, answers[q.id]?.text ?? "", answers[q.id]?.image);
      }
      setSaving(false);
    }, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  if (!assignment) {
    return <div style={{ padding: 40, fontFamily: bFont, color: tokens.textMuted }}>{lang === "ar" ? "التكليف غير موجود." : "Assignment not found."}</div>;
  }

  const course = mod.courses.find((c) => c.id === assignment.courseId);
  const anyEditable = assignment.questions.some((qq) => isEditable(qq.id));
  const anyResub = units.some((u) => u.status === "resubmission_requested");
  const submittedCount = units.filter((u) => u.status === "awaiting_review" || u.status === "final").length;
  const allFinal = units.length === assignment.questions.length && units.every((u) => u.status === "final");
  const allSubmitted = submittedCount === assignment.questions.length && !anyEditable;
  const closedBlocked = assignment.status !== "open" && submittedCount === 0;
  const resubReason = units.find((u) => u.status === "resubmission_requested") ? latestAttempt(units.find((u) => u.status === "resubmission_requested")!).resubmitReason : undefined;

  const attemptsDone = units.length ? Math.max(...units.map((u) => u.attempts.length)) : 0;
  const attemptLabel = anyResub ? attemptsDone + 1 : Math.max(1, attemptsDone);

  const doSubmit = () => {
    for (const qq of assignment.questions) {
      if (isEditable(qq.id)) saveDraft(assignment.id, qq.id, answers[qq.id]?.text ?? "", answers[qq.id]?.image);
    }
    submitAssignment(assignment.id);
    toast(lang === "ar" ? "أُرسل التكليف — إجاباتك قيد المراجعة." : "Assignment submitted — your answers are under review.");
  };

  const onPickImage = (qid: string, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setAnswers((a) => ({ ...a, [qid]: { text: a[qid]?.text ?? "", image: url } }));
      saveDraft(assignment.id, qid, answers[qid]?.text ?? "", url);
    };
    reader.readAsDataURL(file);
  };

  const mono = (t: string) => (
    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted, margin: "0 0 7px" }}>{t}</div>
  );

  const lastSaved = assignment.questions.map((q) => mod.drafts[`${assignment.id}|${q.id}`]?.savedAt).filter(Boolean).sort().pop();

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr", maxWidth: 880, margin: "0 auto" }}>
      {/* Header — d9 */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <BackCircle tokens={tokens} rtl={isRtl} onClick={() => setState({ ...state, screen: "student-assignments", assignmentId: undefined })} />
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: 0 }}>
              {lang === "ar" ? assignment.title.ar : assignment.title.en}
            </h1>
            <Chip tokens={tokens} tone={assignment.status === "open" ? "primary" : "slate"}>
              {assignment.status === "open" ? (lang === "ar" ? "مفتوح" : "Open") : (lang === "ar" ? "مغلق" : "Closed")}
            </Chip>
          </div>
          <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
            {assignment.courseId} · {assignment.questions.length} {lang === "ar" ? "أسئلة" : "questions"} · {lang === "ar" ? `محاولة ${attemptLabel}` : `Attempt ${attemptLabel}`}
          </p>
        </div>
      </div>

      {/* State banners */}
      {closedBlocked && (
        <div style={{ marginBottom: 16 }}>
          <AlertStrip tokens={tokens} lang={lang} tone="slate" icon={<IconBan size={14} color={tokens.noEvidence} />}
            title={lang === "ar" ? "أُغلق التكليف — التسليم معطّل." : "Assignment closed — submission disabled."}
            body={lang === "ar" ? "لم تسلّم قبل الإغلاق، لذا لا يمكن التسليم الآن." : "You had not submitted before it was closed, so submitting is no longer possible."} />
        </div>
      )}
      {anyResub && (
        <div style={{ marginBottom: 16 }}>
          <AlertStrip tokens={tokens} lang={lang} tone="violet" icon={<IconReply size={14} color={tokens.gap} />}
            title={lang === "ar" ? "طلب مدرّسك إعادة التسليم." : "Your instructor requested a resubmission."}
            body={resubReason} />
        </div>
      )}
      {!anyResub && !closedBlocked && allSubmitted && !allFinal && (
        <div style={{ marginBottom: 16 }}>
          <AlertStrip tokens={tokens} lang={lang} tone="peri" icon={<IconCheck size={14} color={tokens.primary} />}
            title={lang === "ar"
              ? "تم التسليم. إجاباتك قيد المراجعة — لا تُعرض أي درجة حتى يقيّمها مدرّسك."
              : "Submitted. Your answers are under review — no score is shown until your instructor grades them."} />
        </div>
      )}
      {allFinal && (
        <div style={{ marginBottom: 16 }}>
          <AlertStrip tokens={tokens} lang={lang} tone={assignment.showScoreToStudent ? "peri" : "slate"} icon={<IconCheck size={14} color={assignment.showScoreToStudent ? tokens.primary : tokens.noEvidence} />}
            title={assignment.showScoreToStudent
              ? (lang === "ar" ? "قُيّم تكليفك — درجاتك النهائية معروضة أسفل كل سؤال." : "Graded — your final scores are shown under each question.")
              : (lang === "ar" ? "قُيّم تكليفك — الدرجات مخفية في إعداد هذا التكليف." : "Graded — scores are hidden in this assignment's setting.")} />
        </div>
      )}

      {/* Stacked questions — d9 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {assignment.questions.map((q, i) => {
          const u = units.find((x) => x.questionId === q.id);
          const editable = isEditable(q.id);
          const topic = course?.topics.find((t) => t.id === q.topicId);
          const a = answers[q.id] ?? { text: "", image: undefined };
          const last = u ? latestAttempt(u) : null;
          return (
            <Card tokens={tokens} key={q.id} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                  {lang === "ar" ? `السؤال ${i + 1} · ${topic?.label.ar ?? ""}` : `Question ${i + 1} · ${topic?.label.en ?? ""}`}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, flexShrink: 0 }}>
                  {lang === "ar" ? `الحد ${q.maxScore}` : `max ${q.maxScore}`}
                </span>
              </div>
              <p style={{ fontFamily: bFont, fontSize: 13.5, color: tokens.textSecondary, lineHeight: 1.7, margin: "0 0 14px" }}>
                {lang === "ar" ? q.prompt.ar : q.prompt.en}
              </p>

              {mono(lang === "ar" ? "إجابتك" : "Your answer")}
              {editable ? (
                <>
                  <textarea
                    value={a.text}
                    onChange={(e) => setAnswers((xs) => ({ ...xs, [q.id]: { ...a, text: e.target.value } }))}
                    rows={4}
                    placeholder={lang === "ar" ? "اكتب إجابتك هنا — تُحفظ مسودة تلقائياً." : "Write your answer here — drafts save automatically."}
                    style={textareaStyle(tokens, bFont)}
                    className="genai-input"
                  />
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <label style={{ display: "inline-flex", gap: 7, alignItems: "center", cursor: "pointer", fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted }}>
                      <IconImageAttach size={14} color={tokens.textMuted} />
                      {lang === "ar" ? "إرفاق صورة (اختياري)" : "Attach image (optional)"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPickImage(q.id, e.target.files?.[0])} />
                    </label>
                    {a.image && (
                      <button onClick={() => setAnswers((xs) => ({ ...xs, [q.id]: { ...a, image: undefined } }))}
                        style={{ display: "inline-flex", gap: 5, alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: bFont, fontSize: 11, color: tokens.textFaint }}>
                        <IconTrash size={12} color={tokens.textFaint} /> {lang === "ar" ? "إزالة" : "remove"}
                      </button>
                    )}
                  </div>
                  {a.image && <img src={a.image} alt="attachment" style={{ maxWidth: "100%", borderRadius: 10, marginTop: 10, border: `1px solid ${tokens.cardBorder}` }} />}
                </>
              ) : (
                <>
                  <div style={{ background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, padding: "12px 14px", fontFamily: bFont, fontSize: 13, color: tokens.textPrimary, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                    {last?.text || a.text || (lang === "ar" ? "(لا نص)" : "(no text)")}
                  </div>
                  {(last?.image || a.image) && <img src={last?.image ?? a.image} alt="attachment" style={{ maxWidth: "100%", borderRadius: 10, marginTop: 10, border: `1px solid ${tokens.cardBorder}` }} />}
                  {u?.status === "final" && u && assignment.showScoreToStudent && last?.decision && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <ScoreValue kind="final" score={last.decision.finalScore} max={q.maxScore} tokens={tokens} lang={lang} />
                      {last.decision.finalFeedback && (
                        <span style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, lineHeight: 1.5 }}>{last.decision.finalFeedback}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Single submit action (FR-SUB-03) */}
      {anyEditable && !closedBlocked && (
        <Card tokens={tokens} style={{ marginTop: 16, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 10.5, color: saving ? tokens.developing : tokens.textFaint }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: saving ? tokens.developing : tokens.mastered }} />
            {saving
              ? (lang === "ar" ? "جارٍ حفظ المسودة…" : "saving draft…")
              : lastSaved
              ? `${lang === "ar" ? "محفوظ" : "saved"} ${fmtAgo(lastSaved, lang)}`
              : (lang === "ar" ? "الحفظ التلقائي مفعّل" : "auto-save on")}
          </div>
          <ConfirmBtn
            tokens={tokens} lang={lang} variant="solid"
            label={anyResub ? (lang === "ar" ? "إعادة التسليم" : "Resubmit assignment") : (lang === "ar" ? "تسليم التكليف" : "Submit assignment")}
            confirmLabel={lang === "ar" ? "اضغط للتأكيد — إرسال للمراجعة" : "Click again to confirm — send for review"}
            onConfirm={doSubmit}
            style={{ padding: "10px 20px", fontSize: 13 }}
          />
        </Card>
      )}
    </div>
  );
}
