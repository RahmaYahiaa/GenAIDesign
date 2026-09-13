import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import {
  Card, Btn, Chip, StatusPill, ScoreValue, Modal, AlertStrip, bFontFor, hFontFor, textareaStyle,
} from "../../components/ModuleUI";
import {
  IconArrowRight, IconArrowLeft, IconCheck, IconImageAttach, IconReply,
  IconEyeOff, IconClock, IconBan,
} from "../../components/Icons";
import { DEMO_STUDENT_ID, latestAttempt, fmtAgo } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Student submission experience (FR-SUB-*, FR-RESUB-04, FR-VIS-03).
// Free navigation between questions, continuous draft auto-save, one single
// submit action, "Under review" afterwards, and resubmission with the prior
// answer pre-filled beside the instructor's stated reason.
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentAssignmentScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, saveDraft, submitAssignment } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

  const assignment = mod.assignments.find((a) => a.id === state.assignmentId);
  const [index, setIndex] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [saving, setSaving] = useState(false);

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
      if (u && u.status === "resubmission_requested") {
        const last = latestAttempt(u);
        map[q.id] = { text: last.text, image: last.image };      // FR-RESUB-04 pre-fill
      } else if (u) {
        const last = latestAttempt(u);
        map[q.id] = { text: last.text, image: last.image };
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
  useEffect(() => { setAnswers(initial); setIndex(0); }, [initial]);

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
  const q = assignment.questions[index];
  const qUnit = units.find((u) => u.questionId === q.id);
  const editable = isEditable(q.id);
  const anyEditable = assignment.questions.some((qq) => isEditable(qq.id));
  const anyResub = units.some((u) => u.status === "resubmission_requested");
  const submittedCount = units.filter((u) => u.status === "awaiting_review" || u.status === "final").length;
  const allSubmitted = submittedCount === assignment.questions.length && !anyEditable;
  const closedBlocked = assignment.status !== "open" && submittedCount === 0;

  const overallStatus = anyResub
    ? { en: "Resubmission requested", ar: "طُلبت إعادة التسليم", tone: "violet" as const }
    : allSubmitted && units.every((u) => u.status === "final")
    ? { en: "Graded", ar: "مُقيّم", tone: "primary" as const }
    : submittedCount > 0
    ? { en: "Under review", ar: "قيد المراجعة", tone: "peri" as const }
    : assignment.questions.some((qq) => Boolean(mod.drafts[`${assignment.id}|${qq.id}`]?.text))
    ? { en: "Draft saving", ar: "مسودة تُحفظ", tone: "default" as const }
    : { en: "Not started", ar: "لم يبدأ", tone: "slate" as const };

  const doSubmit = () => {
    for (const qq of assignment.questions) {
      if (isEditable(qq.id)) saveDraft(assignment.id, qq.id, answers[qq.id]?.text ?? "", answers[qq.id]?.image);
    }
    submitAssignment(assignment.id);
    setConfirmSubmit(false);
  };

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setAnswers((a) => ({ ...a, [q.id]: { text: a[q.id]?.text ?? "", image: url } }));
      saveDraft(assignment.id, q.id, answers[q.id]?.text ?? "", url);
    };
    reader.readAsDataURL(file);
  };

  const lastSaved = mod.drafts[`${assignment.id}|${q.id}`]?.savedAt;

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr", maxWidth: 900, margin: "0 auto" }}>
      <button
        onClick={() => setState({ ...state, screen: "student-assignments", assignmentId: undefined })}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10.5, color: tokens.textMuted, padding: 0, marginBottom: 12 }}
      >
        <Arrow size={12} color={tokens.textMuted} />
        {lang === "ar" ? "كل التكليفات" : "ALL ASSIGNMENTS"}
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Chip tokens={tokens} tone="primary">{assignment.courseId}</Chip>
            <StatusPill status={assignment.status} tokens={tokens} lang={lang} />
            <Chip tokens={tokens} tone={overallStatus.tone}>{lang === "ar" ? overallStatus.ar : overallStatus.en}</Chip>
          </div>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 20, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: 0 }}>
            {lang === "ar" ? assignment.title.ar : assignment.title.en}
          </h1>
          <p style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted, margin: "4px 0 0" }}>
            {course?.instructor} · {assignment.questions.length} {lang === "ar" ? "أسئلة — تنقّل بحرية قبل التسليم" : "questions — move freely before submitting"}
          </p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 10, color: saving ? tokens.developing : tokens.textFaint }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: saving ? tokens.developing : tokens.mastered }} />
          {saving
            ? (lang === "ar" ? "جارٍ حفظ المسودة…" : "saving draft…")
            : lastSaved
            ? `${lang === "ar" ? "محفوظ" : "saved"} ${fmtAgo(lastSaved, lang)}`
            : (lang === "ar" ? "الحفظ التلقائي مفعّل" : "auto-save on")}
        </div>
      </div>

      {/* Under-review banner — never a score (FR-SUB-05) */}
      {submittedCount > 0 && !anyResub && (
        <div style={{ marginBottom: 14 }}>
          <AlertStrip
            tokens={tokens}
            lang={lang}
            tone="peri"
            icon={<IconClock size={13} color={tokens.developing} />}
            title={lang === "ar" ? "قيد المراجعة — لم تُعتمد درجات بعد." : "Under review — no finalized grade yet."}
            body={lang === "ar"
              ? "لا تظهر أي درجة في هذه المرحلة بغض النظر عن إعداد إظهار الدرجات."
              : "No score is shown at this stage regardless of the assignment's score-visibility setting."}
          />
        </div>
      )}
      {closedBlocked && (
        <div style={{ marginBottom: 14 }}>
          <AlertStrip
            tokens={tokens}
            lang={lang}
            tone="slate"
            icon={<IconBan size={13} color={tokens.noEvidence} />}
            title={lang === "ar" ? "أُغلق التكليف — التسليم معطّل." : "Assignment closed — submission disabled."}
            body={lang === "ar" ? "لم تسلّم قبل الإغلاق، لذا لا يمكن التسليم الآن." : "You had not submitted before it was closed, so submitting is no longer possible."}
          />
        </div>
      )}

      {/* Question navigator */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
        {assignment.questions.map((qq, i) => {
          const u = units.find((x) => x.questionId === qq.id);
          const ed = isEditable(qq.id);
          const hasContent = Boolean(answers[qq.id]?.text || answers[qq.id]?.image);
          return (
            <button
              key={qq.id}
              onClick={() => setIndex(i)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, cursor: "pointer",
                border: `1.5px solid ${index === i ? tokens.primary : tokens.cardBorder}`,
                background: index === i ? tokens.primaryLight : tokens.card,
                color: index === i ? tokens.primary : tokens.textMuted,
                fontFamily: bFont, fontSize: 12, fontWeight: index === i ? 600 : 500,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>Q{i + 1}</span>
              {u?.status === "resubmission_requested" && <IconReply size={11} color={tokens.gap} />}
              {u && u.status !== "resubmission_requested" && <IconCheck size={11} color={tokens.mastered} />}
              {!u && hasContent && <span style={{ width: 5, height: 5, borderRadius: "50%", background: tokens.developing }} />}
              {!u && !hasContent && ed && <span style={{ width: 5, height: 5, borderRadius: "50%", background: tokens.textFaint }} />}
              {ed ? (lang === "ar" ? "قابل للتحرير" : "editable") : u?.status === "final" ? (lang === "ar" ? "نهائي" : "final") : (lang === "ar" ? "مُسلّم" : "submitted")}
            </button>
          );
        })}
      </div>

      {/* Current question */}
      <Card tokens={tokens} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ fontFamily: bFont, fontSize: 14.5, fontWeight: 600, color: tokens.textPrimary, lineHeight: 1.6, textAlign: isRtl ? "right" : "left" }}>
            {lang === "ar" ? q.prompt.ar : q.prompt.en}
          </div>
          <Chip tokens={tokens} tone="primary" style={{ flexShrink: 0 }}>
            {course?.topics.find((t) => t.id === q.topicId)?.label[lang] ?? q.topicId}
          </Chip>
        </div>

        {/* Resubmission reason shown beside the pre-filled answer (FR-RESUB-04) */}
        {qUnit?.status === "resubmission_requested" && (
          <div style={{ marginBottom: 12 }}>
            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="violet"
              icon={<IconReply size={13} color={tokens.gap} />}
              title={lang === "ar" ? "طلب مدرّسك إعادة التسليم على هذا السؤال" : "Your instructor requested a resubmission on this question"}
              body={latestAttempt(qUnit).resubmitReason}
            />
          </div>
        )}

        {editable ? (
          <>
            <textarea
              value={answers[q.id]?.text ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: { text: e.target.value, image: a[q.id]?.image } }))}
              style={{ ...textareaStyle(tokens, bFont), minHeight: 150 }}
              className="genai-input"
              placeholder={lang === "ar" ? "اكتب إجابتك — تُحفظ تلقائياً كمسودة." : "Type your answer — it auto-saves as a draft."}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textSecondary, fontFamily: bFont, fontSize: 11.5, cursor: "pointer" }}>
                <IconImageAttach size={13} color={tokens.textMuted} />
                {lang === "ar" ? "إرفاق صورة عمل يدوي" : "Attach handwritten work"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPickImage(e.target.files?.[0])} />
              </label>
              {answers[q.id]?.image && (
                <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.mastered }}>{lang === "ar" ? "صورة مرفقة" : "image attached"}</span>
              )}
              <span style={{ fontFamily: bFont, fontSize: 10.5, color: tokens.textFaint }}>
                {lang === "ar" ? "لا يُرسَل شيء للتقييم قبل زر التسليم الواحد." : "Nothing is sent for grading until the single submit action."}
              </span>
            </div>
            {answers[q.id]?.image && (
              <img src={answers[q.id]?.image} alt="attached work" style={{ marginTop: 10, maxWidth: "100%", borderRadius: 10, border: `1px solid ${tokens.cardBorder}` }} />
            )}
          </>
        ) : (
          <div>
            <div style={{ padding: "12px 14px", background: tokens.inset, border: `1px solid ${tokens.insetBorder}`, borderRadius: 9, fontFamily: bFont, fontSize: 13, color: tokens.textPrimary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {answers[q.id]?.text || (lang === "ar" ? "(لا نص)" : "(no text)")}
            </div>
            {answers[q.id]?.image && <img src={answers[q.id]?.image} alt="attached work" style={{ marginTop: 10, maxWidth: "100%", borderRadius: 10, border: `1px solid ${tokens.cardBorder}` }} />}

            {/* Result — score only when final AND visibility currently on (FR-VIS-03) */}
            {qUnit?.status === "final" && latestAttempt(qUnit).decision && (
              <div style={{ marginTop: 12 }}>
                {assignment.showScoreToStudent ? (
                  <Card tokens={tokens} style={{ borderInlineStartWidth: 3, borderInlineStartColor: tokens.mastered, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>{lang === "ar" ? "درجتك النهائية" : "Your final score"}</span>
                      <ScoreValue kind="final" score={latestAttempt(qUnit).decision?.finalScore ?? null} max={q.maxScore} tokens={tokens} lang={lang} />
                    </div>
                    <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.6, margin: 0 }}>
                      {latestAttempt(qUnit).decision?.finalFeedback}
                    </p>
                  </Card>
                ) : (
                  <AlertStrip
                    tokens={tokens}
                    lang={lang}
                    tone="slate"
                    icon={<IconEyeOff size={13} color={tokens.noEvidence} />}
                    title={lang === "ar" ? "تم التصحيح — الدرحة مخفية بقرار المدرّس." : "Graded — the score is hidden by your instructor's setting."}
                    body={lang === "ar" ? "التغذية الراجعة ستتوفر عند إظهار الدرجات." : "Feedback becomes available if score visibility is turned on."}
                  />
                )}
              </div>
            )}
            {qUnit?.status === "awaiting_review" && (
              <div style={{ marginTop: 12 }}>
                <AlertStrip
                  tokens={tokens}
                  lang={lang}
                  tone="peri"
                  icon={<IconClock size={13} color={tokens.developing} />}
                  title={lang === "ar" ? "قيد المراجعة" : "Under review"}
                  body={lang === "ar" ? "إجابتك مُسلّمة وتنتظر قرار المدرّس." : "Your answer is submitted and awaiting the instructor's decision."}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Single submit action (FR-SUB-04) */}
      <Card tokens={tokens} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, lineHeight: 1.6, flex: 1, minWidth: 240 }}>
          {anyResub
            ? (lang === "ar" ? "التسليم الآن ينشئ محاولة جديدة (محاولة 2، 3…) دون حذف سجل المحاولات السابقة." : "Submitting now creates a new attempt (Attempt 2, 3, …) without discarding earlier attempt history.")
            : (lang === "ar" ? "زر واحد ينهي كل إجاباتك معاً ويطلق التقييم." : "One button finalizes all of your answers together and triggers evaluation.")}
        </div>
        <Btn
          tokens={tokens}
          lang={lang}
          disabled={!anyEditable || closedBlocked || allSubmitted}
          onClick={() => setConfirmSubmit(true)}
          style={{ padding: "11px 20px" }}
        >
          <IconCheck size={14} color="#fff" />
          {anyResub
            ? (lang === "ar" ? "تسليم المحاولة الجديدة" : "Submit new attempt")
            : (lang === "ar" ? "تسليم التكليف" : "Submit assignment")}
        </Btn>
      </Card>

      {allSubmitted && (
        <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 12, textAlign: isRtl ? "right" : "left" }}>
          {lang === "ar" ? "سلّمت كل الأسئلة — لا تعديل بعد التسليم إلا بطلب إعادة تسليم من المدرّس." : "All questions submitted — no editing after submission unless your instructor requests a resubmission."}
        </p>
      )}

      {/* Submit confirmation */}
      <Modal
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? "تسليم التكليف كاملاً" : "Submit the whole assignment"}
        subtitle={lang === "ar"
          ? `سيُنهى ${assignment.questions.length} أسئلة معاً ويُطلق تقييم الذكاء الاصطناعي لكل إجابة. لا يمكن التعديل بعد ذلك إلا بطلب إعادة تسليم.`
          : `All ${assignment.questions.length} answers will be finalized together and each triggers AI evaluation. Afterwards they are locked unless a resubmission is requested.`}
      >
        <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {assignment.questions.map((qq, i) => {
            const content = answers[qq.id]?.text || answers[qq.id]?.image;
            const ed = isEditable(qq.id);
            return (
              <div key={qq.id} style={{ display: "flex", justifyContent: "space-between", fontFamily: bFont, fontSize: 12, color: tokens.textSecondary }}>
                <span>Q{i + 1}</span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: !ed ? tokens.textFaint : content ? tokens.mastered : tokens.gap }}>
                  {!ed ? (lang === "ar" ? "مُسلّم مسبقاً" : "already submitted") : content ? (lang === "ar" ? "به إجابة" : "has answer") : (lang === "ar" ? "فارغ" : "empty")}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setConfirmSubmit(false)}>{lang === "ar" ? "متابعة التحرير" : "Keep editing"}</Btn>
          <Btn tokens={tokens} lang={lang} onClick={doSubmit}>
            <IconCheck size={13} color="#fff" />
            {lang === "ar" ? "تأكيد التسليم" : "Confirm submission"}
          </Btn>
        </div>
      </Modal>

    </div>
  );
}
