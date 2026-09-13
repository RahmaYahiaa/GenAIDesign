import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import {
  Card, Btn, Chip, Field, inputStyle, textareaStyle, VisibilityControl, Drawer,
  ConfidencePill, ScoreValue, AlertStrip, bFontFor, hFontFor,
} from "../../components/ModuleUI";
import { CitationChip } from "../../components/SharedUI";
import {
  IconPlus, IconTrash, IconArrowRight, IconArrowLeft, IconSparkle, IconLock,
  IconCheck, IconWarning, IconEye,
} from "../../components/Icons";
import { QuestionDef, evaluateAnswer, COURSE_BY_ID, approvedMaterials } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Assignment creation (FR-AC-01..10). A form — not a file upload. Preview runs
// the exact evaluation pipeline real submissions use (FR-AC-09).
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
const newQ = (topicId: string): QDraft => ({ key: ++qSeq, prompt: "", topicId, maxScore: "10", referenceAnswer: "", rubric: "" });

export default function AssignmentCreateScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { publishAssignment } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

  const courseId = state.courseId ?? "CS301";
  const course = COURSE_BY_ID(courseId);

  const [title, setTitle] = useState("");
  const [showScore, setShowScore] = useState(false);        // FR-VIS-05 — default hidden
  const [questions, setQuestions] = useState<QDraft[]>([newQ(course.topics[0]?.id ?? "")]);
  const [previewOpen, setPreviewOpen] = useState(false);
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
    setState({ ...state, screen: "assignment-review", assignmentId: id, tab: "assignments" });
  };

  const previewDefs = questions.map(toQuestionDef);
  const runPreview = () => {
    const def = previewDefs[previewQ];
    if (!def) return;
    setPreviewResult(evaluateAnswer(def, previewText, course));   // FR-AC-09 — same pipeline
  };

  const selectStyle = { ...inputStyle(tokens, bFont), appearance: "none" as const, cursor: "pointer" };

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr", maxWidth: 980, margin: "0 auto" }}>
      <button
        onClick={() => setState({ ...state, screen: "course-workspace", tab: "assignments" })}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10.5, color: tokens.textMuted, padding: 0, marginBottom: 12 }}
      >
        <Arrow size={12} color={tokens.textMuted} />
        {lang === "ar" ? "رجوع إلى التكليفات" : "BACK TO ASSIGNMENTS"}
      </button>

      <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
        {lang === "ar" ? "تكليف جديد" : "New assignment"}
      </h1>
      <p style={{ fontSize: 12.5, color: tokens.textMuted, margin: "0 0 20px", fontFamily: bFont }}>
        {course.id} · {lang === "ar" ? course.title.ar : course.title.en} · {lang === "ar" ? "نموذج تأليف — لا رفع ملفات" : "authoring form — no file upload"}
      </p>

      <Card tokens={tokens} style={{ marginBottom: 16 }}>
        <Field label={lang === "ar" ? "عنوان التكليف" : "Assignment title"} tokens={tokens} lang={lang} required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={lang === "ar" ? "مثال: التكليف 4 — الأشجار المتوازنة" : "e.g. Assignment 4 — Balanced trees"} style={inputStyle(tokens, bFont)} className="genai-input" />
        </Field>

        {/* Live visibility setting, default off, explicitly changeable later */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 14px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <VisibilityControl on={showScore} onChange={() => setShowScore(!showScore)} tokens={tokens} lang={lang} />
          <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.textMuted, lineHeight: 1.55, flex: 1 }}>
            {lang === "ar"
              ? "افتراضياً مخفية. هذا ليس قراراً لمرة واحدة: يمكنك تغييره في أي وقت لاحقاً من إعدادات التكليف أو من شاشة المراجعة."
              : "Off by default. This is not a one-time decision locked at creation — you can flip it at any later time from assignment settings or the review screen."}
          </div>
        </div>
      </Card>

      {/* Repeatable questions */}
      {questions.map((q, i) => {
        const topic = course.topics.find((t) => t.id === q.topicId);
        const ungrounded = topic ? approvedMaterials(topic) === 0 : true;
        return (
          <Card key={q.key} tokens={tokens} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: tokens.primaryLight, border: `1px solid ${tokens.primary}44`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 700, color: tokens.primary }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>
                  {lang === "ar" ? `السؤال ${i + 1}` : `Question ${i + 1}`}
                </span>
              </div>
              {questions.length > 1 && (
                <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setQuestions((qs) => qs.filter((x) => x.key !== q.key))} style={{ padding: "5px 9px", fontSize: 11 }}>
                  <IconTrash size={12} color={tokens.textMuted} />
                  {lang === "ar" ? "حذف" : "Remove"}
                </Btn>
              )}
            </div>

            <Field label={lang === "ar" ? "نص السؤال" : "Prompt"} tokens={tokens} lang={lang} required>
              <textarea value={q.prompt} onChange={(e) => patchQ(q.key, { prompt: e.target.value })} style={textareaStyle(tokens, bFont)} className="genai-input" placeholder={lang === "ar" ? "اكتب نص السؤال…" : "Write the question prompt…"} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <Field label={lang === "ar" ? "الموضوع (إلزامي)" : "Topic (required)"} tokens={tokens} lang={lang} required>
                <select value={q.topicId} onChange={(e) => patchQ(q.key, { topicId: e.target.value })} style={selectStyle} className="genai-input">
                  {course.topics.map((t) => (
                    <option key={t.id} value={t.id}>{lang === "ar" ? t.label.ar : t.label.en}</option>
                  ))}
                </select>
              </Field>
              <Field label={lang === "ar" ? "الدرجة القصوى" : "Max score"} tokens={tokens} lang={lang} required>
                <input type="number" min={1} value={q.maxScore} onChange={(e) => patchQ(q.key, { maxScore: e.target.value })} style={{ ...inputStyle(tokens, bFont), fontFamily: MONO }} className="genai-input" />
              </Field>
            </div>

            {ungrounded && (
              <div style={{ marginBottom: 12 }}>
                <AlertStrip
                  tokens={tokens}
                  lang={lang}
                  tone="slate"
                  icon={<IconWarning size={12} color={tokens.noEvidence} />}
                  title={lang === "ar" ? "هذا الموضوع بلا مادة معتمدة — ستُوجَّه إجاباته لمراجعة يدوية إجبارية." : "This topic has no approved material — its answers will route to mandatory manual review."}
                />
              </div>
            )}

            {/* Reference answer — always hidden from students */}
            <Field
              label={lang === "ar" ? "الإجابة المرجعية (اختياري)" : "Reference answer (optional)"}
              tokens={tokens}
              lang={lang}
              hint={lang === "ar" ? "مخفية عن الطلاب دائماً — تُستخدم فقط لرفع دقة تقييم الذكاء الاصطناعي." : "Hidden from students at all times — used only to improve AI grading accuracy."}
            >
              <div style={{ position: "relative" }}>
                <textarea value={q.referenceAnswer} onChange={(e) => patchQ(q.key, { referenceAnswer: e.target.value })} style={{ ...textareaStyle(tokens, bFont), paddingInlineEnd: 38 }} className="genai-input" />
                <span title={lang === "ar" ? "مخفية عن الطلاب" : "Hidden from students"} style={{ position: "absolute", top: 9, insetInlineEnd: 10, display: "inline-flex" }}>
                  <IconLock size={13} color={tokens.textFaint} />
                </span>
              </div>
            </Field>

            <Field
              label={lang === "ar" ? "معايير التصحيح / Rubric (اختياري)" : "Grading criteria / rubric (optional)"}
              tokens={tokens}
              lang={lang}
              hint={lang === "ar" ? "نص حر في هذه المرحلة — لا جدول أوزان مُهيكل بعد." : "Free text in this phase — no structured weighted table yet."}
            >
              <textarea value={q.rubric} onChange={(e) => patchQ(q.key, { rubric: e.target.value })} style={textareaStyle(tokens, bFont)} className="genai-input" placeholder={lang === "ar" ? "مثال: 4 نقاط للترتيب الصحيح · 3 لتسمية الطابور · 3 للتبرير" : "e.g. 4 pts correct order · 3 pts names the queue · 3 pts justification"} />
            </Field>
          </Card>
        );
      })}

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => setQuestions((qs) => [...qs, newQ(qs[qs.length - 1]?.topicId ?? course.topics[0]?.id ?? "")])}>
          <IconPlus size={13} color={tokens.primary} />
          {lang === "ar" ? "إضافة سؤال" : "Add question"}
        </Btn>
      </div>

      {/* Publish + preview actions */}
      <Card tokens={tokens} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, lineHeight: 1.6, flex: 1, minWidth: 240 }}>
          {lang === "ar"
            ? "النشر يفتح التكليف فوراً ويبقى مفتوحاً حتى تغلقه يدوياً — لا مواعيد نهائية."
            : "Publishing opens the assignment immediately; it stays open until you close it manually — there are no deadlines."}
          {touched && !canPublish && (
            <span style={{ color: tokens.gap, fontWeight: 600 }}>
              {" "}{lang === "ar" ? "أكمل العنوان وحقول الأسئلة الإلزامية أولاً." : "Complete the title and required question fields first."}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => { setPreviewQ(0); setPreviewText(""); setPreviewResult(null); setPreviewOpen(true); }}>
            <IconEye size={13} color={tokens.textMuted} />
            {lang === "ar" ? "معاينة التقييم" : "Preview evaluation"}
          </Btn>
          <Btn tokens={tokens} lang={lang} onClick={publish}>
            <IconCheck size={13} color="#fff" />
            {lang === "ar" ? "نشر التكليف" : "Publish assignment"}
          </Btn>
        </div>
      </Card>

      {/* ── Preview drawer: real evaluation pipeline on a trial answer ── */}
      <Drawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        tokens={tokens}
        lang={lang}
        width={620}
        title={lang === "ar" ? "معاينة التقييم — وضع التجربة" : "Preview mode — trial evaluation"}
        subtitle={lang === "ar"
          ? "يستخدم نفس خط التقييم المستخدم للتسليمات الحقيقية تماماً — ما تراه هنا هو ما سيحدث للطلاب."
          : "Runs the exact evaluation pipeline used for real student submissions — what you see here is exactly what real students will get."}
      >
        <Field label={lang === "ar" ? "اختر سؤالاً للتجربة" : "Pick a question to trial"} tokens={tokens} lang={lang}>
          <select value={previewQ} onChange={(e) => { setPreviewQ(Number(e.target.value)); setPreviewResult(null); }} style={selectStyle} className="genai-input">
            {questions.map((q, i) => (
              <option key={q.key} value={i}>
                {lang === "ar" ? `س${i + 1}` : `Q${i + 1}`} — {(q.prompt || (lang === "ar" ? "(بلا نص)" : "(no prompt)")).slice(0, 60)}
              </option>
            ))}
          </select>
        </Field>

        {previewDefs[previewQ] && (
          <div style={{ marginBottom: 12, padding: "10px 12px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 9 }}>
            <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>
              {previewDefs[previewQ].prompt.en || (lang === "ar" ? "(بلا نص بعد)" : "(no prompt yet)")}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Chip tokens={tokens} tone="primary">{course.topics.find((t) => t.id === previewDefs[previewQ].topicId)?.label[lang]}</Chip>
              <Chip tokens={tokens}>{lang === "ar" ? `القصوى ${previewDefs[previewQ].maxScore}` : `max ${previewDefs[previewQ].maxScore}`}</Chip>
              {previewDefs[previewQ].referenceAnswer && <Chip tokens={tokens} tone="peri"><IconLock size={9} color={tokens.developing} />{lang === "ar" ? "مرجع مُدخل" : "ref set"}</Chip>}
              {previewDefs[previewQ].rubric && <Chip tokens={tokens} tone="peri">{lang === "ar" ? "rubric مُدخل" : "rubric set"}</Chip>}
            </div>
          </div>
        )}

        <Field label={lang === "ar" ? "إجابة تجريبية" : "Trial answer"} tokens={tokens} lang={lang}>
          <textarea value={previewText} onChange={(e) => setPreviewText(e.target.value)} style={{ ...textareaStyle(tokens, bFont), minHeight: 120 }} className="genai-input" placeholder={lang === "ar" ? "اكتب إجابة كما لو كنت طالباً…" : "Type an answer as if you were a student…"} />
        </Field>

        <Btn tokens={tokens} lang={lang} onClick={runPreview} disabled={!previewText.trim()} style={{ width: "100%", justifyContent: "center", padding: "11px 0" }}>
          <IconSparkle size={14} color="#fff" />
          {lang === "ar" ? "شغّل التقييم" : "Run evaluation"}
        </Btn>

        {previewResult && (
          <Card tokens={tokens} style={{ marginTop: 14, borderInlineStartWidth: 3, borderInlineStartColor: tokens.developing }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <ConfidencePill confidence={previewResult.confidence} tokens={tokens} lang={lang} />
              <ScoreValue kind="ai" score={previewResult.aiScore} max={previewDefs[previewQ]?.maxScore ?? 10} tokens={tokens} lang={lang} />
            </div>
            <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.65, margin: "0 0 10px" }}>{previewResult.feedback}</p>
            {previewResult.sources.length > 0 ? (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {previewResult.sources.map((s, i) => <CitationChip key={i} label={s} tokens={tokens} />)}
              </div>
            ) : (
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.noEvidence }}>{lang === "ar" ? "بلا مصادر موثّقة" : "NO GROUNDED SOURCES"}</div>
            )}
            <div style={{ marginTop: 12, fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.6 }}>
              {lang === "ar"
                ? "عدّل السؤال أو المرجع أو الـ rubric ثم أعد التشغيل — التغيير ينعكس فوراً على سلوك التسليمات الحقيقية."
                : "Adjust the prompt, reference answer or rubric and re-run — the change carries over to real submissions identically."}
            </div>
          </Card>
        )}
      </Drawer>
    </div>
  );
}
