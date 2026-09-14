import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import {
  Card, Btn, Chip, inputStyle, textareaStyle, Toggle,
  ConfidencePill, ScoreValue, BackCircle, bFontFor, hFontFor, toast,
} from "../../components/ModuleUI";
import { IconPlus, IconTrash, IconSparkle } from "../../components/Icons";
import { QuestionDef, evaluateAnswer, COURSE_BY_ID, MISCONCEPTIONS } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Assignment builder (FR-AC-01..10) — reference d8: authoring column on the
// start side, sticky "Preview grading" rail on the other. Preview runs the
// exact evaluation pipeline real submissions use (FR-AC-09). A form, never a
// file upload.
// ─────────────────────────────────────────────────────────────────────────────

interface QDraft {
  key: number;
  prompt: string;
  topicId: string;
  maxScore: string;
  referenceAnswer: string;
  rubric: string;
}

let qSeq = 0;
const newQ = (): QDraft => ({ key: ++qSeq, prompt: "", topicId: "", maxScore: "10", referenceAnswer: "", rubric: "" });

export default function AssignmentCreateScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { publishAssignment } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const courseId = state.courseId ?? "CS301";
  const course = COURSE_BY_ID(courseId);

  const [title, setTitle] = useState("");
  const [showScore, setShowScore] = useState(false);        // FR-VIS-05 — default hidden
  const [questions, setQuestions] = useState<QDraft[]>([newQ()]);
  const [previewQ, setPreviewQ] = useState(0);
  const [previewText, setPreviewText] = useState("");
  const [previewResult, setPreviewResult] = useState<ReturnType<typeof evaluateAnswer> | null>(null);
  const [touched, setTouched] = useState(false);

  const patchQ = (key: number, patch: Partial<QDraft>) =>
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));

  const toQuestionDef = (q: QDraft, index: number): QuestionDef => ({
    id: `q${index + 1}`,
    prompt: { en: q.prompt, ar: q.prompt },
    topicId: q.topicId,
    maxScore: Math.max(1, Number(q.maxScore) || 10),
    referenceAnswer: q.referenceAnswer.trim() || undefined,
    rubric: q.rubric.trim() || undefined,
    keyTerms: [
      ...new Set(
        [...q.referenceAnswer.toLowerCase().matchAll(/[a-z][a-z\-]{3,}/g)].map((m) => m[0])
          .filter((w) => !["that", "with", "from", "this", "have", "will", "each", "when", "than", "into", "over", "such", "they", "their", "which", "because", "order", "vertices", "vertex"].includes(w))
          .slice(0, 6),
      ),
    ],
  });

  const titleValid = title.trim().length > 0;
  const questionsValid = questions.every((q) => q.prompt.trim().length > 0 && q.topicId && Number(q.maxScore) > 0);
  const canPublish = titleValid && questionsValid;

  const publish = () => {
    setTouched(true);
    if (!canPublish) return;
    const id = publishAssignment(courseId, {
      titleEn: title.trim(),
      titleAr: title.trim(),
      showScore,
      questions: questions.map(toQuestionDef),
    });
    toast(lang === "ar" ? "نُشر التكليف — الحالة: مفتوح." : "Assignment published — status Open.");
    setState({ ...state, screen: "assignment-review", assignmentId: id, tab: "assignments" });
  };

  const previewDefs = questions.map(toQuestionDef);
  const runPreview = () => {
    const def = previewDefs[previewQ];
    if (!def || !def.topicId || !previewText.trim()) return;
    setPreviewResult(evaluateAnswer(def, previewText, course));   // FR-AC-09 — same pipeline
  };

  const monoLabel = (text: string) => (
    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted, marginBottom: 7 }}>
      {text}
    </div>
  );
  const caption = (text: string) => (
    <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 6 }}>{text}</div>
  );

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <BackCircle tokens={tokens} rtl={isRtl} onClick={() => setState({ ...state, screen: "course-workspace", tab: "assignments" })} />
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
            {lang === "ar" ? `تكليف جديد · ${course.id}` : `New assignment · ${course.id}`}
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {lang === "ar"
              ? "التكليفات المنشورة تبدأ مفتوحة وتبقى مفتوحة حتى تغلقها."
              : "Published assignments start Open and stay open until you close them."}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 440px", gap: 24, alignItems: "start" }}>
        {/* ── Authoring column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card tokens={tokens} style={{ padding: "18px 20px" }}>
            {monoLabel(lang === "ar" ? "عنوان التكليف" : "ASSIGNMENT TITLE")}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === "ar" ? "مثال: ثوابت الشجرة الثنائية والاجتياز" : "e.g. BST Invariants & Traversal"}
              style={inputStyle(tokens, bFont)}
              className="genai-input"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, padding: "12px 14px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Toggle on={showScore} onChange={() => setShowScore(!showScore)} tokens={tokens} />
              <div style={{ textAlign: isRtl ? "right" : "left" }}>
                <div style={{ fontFamily: bFont, fontSize: 13, fontWeight: 600, color: tokens.textPrimary }}>
                  {lang === "ar" ? "إظهار الدرجة للطالب" : "Show score to student"}
                </div>
                <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 2 }}>
                  {lang === "ar" ? "مغلقة افتراضياً. يمكنك تغيير هذا لاحقاً في أي وقت." : "Off by default. You can change this later at any time."}
                </div>
              </div>
            </div>
          </Card>

          {questions.map((q, i) => (
            <Card tokens={tokens} key={q.key} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                  {lang === "ar" ? `السؤال ${i + 1}` : `Question ${i + 1}`}
                </div>
                {questions.length > 1 && (
                  <button
                    onClick={() => { setQuestions((qs) => qs.filter((x) => x.key !== q.key)); setPreviewResult(null); }}
                    title={lang === "ar" ? "حذف السؤال" : "Remove question"}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: tokens.textFaint }}
                  >
                    <IconTrash size={14} color={tokens.textFaint} />
                  </button>
                )}
              </div>

              {monoLabel(lang === "ar" ? "نص السؤال" : "PROMPT")}
              <textarea
                value={q.prompt}
                onChange={(e) => patchQ(q.key, { prompt: e.target.value })}
                rows={3}
                style={textareaStyle(tokens, bFont)}
                className="genai-input"
              />

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 14, marginTop: 14 }}>
                <div>
                  {monoLabel(lang === "ar" ? "الموضوع (إجباري)" : "TOPIC (REQUIRED)")}
                  <select
                    value={q.topicId}
                    onChange={(e) => patchQ(q.key, { topicId: e.target.value })}
                    style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}
                    className="genai-input"
                  >
                    <option value="">{lang === "ar" ? "اختر موضوعاً..." : "Choose a topic..."}</option>
                    {course.topics.map((t) => (
                      <option key={t.id} value={t.id}>{lang === "ar" ? t.label.ar : t.label.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  {monoLabel(lang === "ar" ? "الدرجة العظمى" : "MAX SCORE")}
                  <input
                    type="number"
                    min={1}
                    value={q.maxScore}
                    onChange={(e) => patchQ(q.key, { maxScore: e.target.value })}
                    style={inputStyle(tokens, bFont)}
                    className="genai-input"
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                {monoLabel(lang === "ar" ? "الإجابة المرجعية (اختياري)" : "REFERENCE ANSWER (OPTIONAL)")}
                <textarea
                  value={q.referenceAnswer}
                  onChange={(e) => patchQ(q.key, { referenceAnswer: e.target.value })}
                  rows={2}
                  style={textareaStyle(tokens, bFont)}
                  className="genai-input"
                />
                {caption(lang === "ar" ? "مخفية عن الطلاب. تُستخدم فقط لتحسين دقة تقييم الذكاء الاصطناعي." : "Hidden from students. Used only to improve AI grading accuracy.")}
              </div>

              <div style={{ marginTop: 14 }}>
                {monoLabel(lang === "ar" ? "معايير التصحيح / روبرك (اختياري)" : "GRADING CRITERIA / RUBRIC (OPTIONAL)")}
                <textarea
                  value={q.rubric}
                  onChange={(e) => patchQ(q.key, { rubric: e.target.value })}
                  rows={2}
                  style={textareaStyle(tokens, bFont)}
                  className="genai-input"
                />
                {caption(lang === "ar" ? "نص حر في هذه المرحلة." : "Free text in this phase.")}
              </div>
            </Card>
          ))}

          <button
            onClick={() => setQuestions((qs) => [...qs, newQ()])}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 0", borderRadius: 12, cursor: "pointer",
              background: tokens.card, border: `1px solid ${tokens.cardBorder}`,
              color: tokens.textSecondary, fontFamily: bFont, fontWeight: 500, fontSize: 13,
            }}
          >
            <IconPlus size={14} color={tokens.textSecondary} />
            {lang === "ar" ? "إضافة سؤال" : "Add question"}
          </button>

          <div>
            <Btn tokens={tokens} lang={lang} onClick={publish} style={{ width: "100%", padding: "12px 0", fontSize: 13.5 }}>
              {lang === "ar" ? "نشر التكليف" : "Publish assignment"}
            </Btn>
            {touched && !canPublish && (
              <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.gap, marginTop: 8, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar"
                  ? "العنوان إجباري، وكل سؤال يحتاج نصاً وموضوعاً ودرجة عظمى صالحة."
                  : "A title is required, and every question needs a prompt, a topic, and a valid max score."}
              </div>
            )}
          </div>
        </div>

        {/* ── Preview rail (FR-AC-09) ── */}
        <Card tokens={tokens} style={{ padding: "18px 20px", position: "sticky", top: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconSparkle size={15} color={tokens.primary} />
            <span style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
              {lang === "ar" ? "معاينة التقييم" : "Preview grading"}
            </span>
          </div>
          <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textMuted, margin: "0 0 16px", lineHeight: 1.55 }}>
            {lang === "ar"
              ? "اكتب إجابة تجريبية وشاهد بالضبط ما سيفعله الذكاء الاصطناعي للطلاب الحقيقيين."
              : "Type a trial answer and see exactly what the AI will do for real students."}
          </p>

          {monoLabel(lang === "ar" ? "السؤال للمعاينة" : "QUESTION TO PREVIEW")}
          <select
            value={previewQ}
            onChange={(e) => { setPreviewQ(Number(e.target.value)); setPreviewResult(null); }}
            style={{ ...inputStyle(tokens, bFont), cursor: "pointer", marginBottom: 14 }}
            className="genai-input"
          >
            {questions.map((_, i) => (
              <option key={i} value={i}>{lang === "ar" ? `السؤال ${i + 1}` : `Question ${i + 1}`}</option>
            ))}
          </select>

          {monoLabel(lang === "ar" ? "الإجابة التجريبية" : "TRIAL ANSWER")}
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            rows={5}
            style={textareaStyle(tokens, bFont)}
            className="genai-input"
          />

          <Btn
            tokens={tokens}
            lang={lang}
            variant="soft"
            disabled={!previewText.trim() || !previewDefs[previewQ]?.topicId}
            onClick={runPreview}
            style={{ width: "100%", padding: "10px 0", fontSize: 12.5, marginTop: 12 }}
          >
            {lang === "ar" ? "تقييم الإجابة التجريبية" : "Grade trial answer"}
          </Btn>

          {previewResult && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${tokens.cardBorder}`, textAlign: isRtl ? "right" : "left" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <ScoreValue kind="ai" score={previewResult.aiScore} max={previewDefs[previewQ].maxScore} tokens={tokens} lang={lang} />
                <ConfidencePill confidence={previewResult.confidence} tokens={tokens} lang={lang} />
              </div>
              <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.6, margin: "0 0 10px" }}>
                {previewResult.feedback}
              </p>
              {previewResult.misconceptions.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  {previewResult.misconceptions.map((id) => (
                    <Chip key={id} tokens={tokens} tone="violet">
                      {MISCONCEPTIONS.find((m) => m.id === id)?.text ?? id}
                    </Chip>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: bFont, fontSize: 10.5, color: tokens.textFaint, marginTop: 10 }}>
                {lang === "ar" ? "معاينة فقط — لا يُحفظ شيء." : "Preview only — nothing is saved."}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
