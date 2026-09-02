import { useState } from "react";
import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor } from "../tokens";
import { DifficultyTag, MasteryBar, CitationChip, SectionHeading } from "../components/SharedUI";
import { IconCheck, IconArrowRight, IconArrowLeft, IconDiagnostic, IconTrendUp } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

interface Question {
  id: string;
  topic: string;
  topicAr: string;
  skill: string;
  skillAr: string;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  textAr: string;
  options: string[];
  optionsAr: string[];
  correctIndex: number;
  explanation: string;
  explanationAr: string;
  citation: string;
}

const QUESTIONS: Question[] = [
  {
    id: "q1", topic: "BFS / Graph Traversal", topicAr: "بحث العرض أولاً", skill: "Queue-based traversal", skillAr: "الاجتياز بقائمة الانتظار",
    difficulty: "easy",
    text: "Which data structure is used to implement Breadth-First Search (BFS)?",
    textAr: "ما هيكل البيانات المستخدم في تنفيذ البحث بالعرض أولاً (BFS)؟",
    options: ["Stack (LIFO)", "Queue (FIFO)", "Priority Queue", "Deque"],
    optionsAr: ["مكدس (LIFO)", "قائمة انتظار (FIFO)", "قائمة أولوية", "Deque"],
    correctIndex: 1,
    explanation: "BFS uses a FIFO Queue. Vertices are enqueued when discovered and dequeued to explore their neighbours, ensuring level-by-level traversal.",
    explanationAr: "BFS يستخدم قائمة انتظار FIFO. تُضاف الرؤوس عند اكتشافها وتُزال لاستكشاف جيرانها، مما يضمن الاجتياز مستوىً مستوى.",
    citation: "CS301 · Lec 6 §2",
  },
  {
    id: "q2", topic: "BFS / Graph Traversal", topicAr: "بحث العرض أولاً", skill: "Complexity Analysis", skillAr: "تحليل التعقيد",
    difficulty: "medium",
    text: "What is the time complexity of BFS on a graph represented as an adjacency list with V vertices and E edges?",
    textAr: "ما التعقيد الزمني لـ BFS على رسم بياني يُمثَّل بقائمة مجاورة مع V رأس و E حافة؟",
    options: ["O(V²)", "O(V + E)", "O(E log V)", "O(V · E)"],
    optionsAr: ["O(V²)", "O(V + E)", "O(E log V)", "O(V · E)"],
    correctIndex: 1,
    explanation: "BFS visits each vertex once (O(V)) and examines each edge once (O(E)), giving a total time complexity of O(V + E) with an adjacency list.",
    explanationAr: "BFS يزور كل رأس مرة واحدة O(V) ويفحص كل حافة مرة واحدة O(E)، مما يُعطي تعقيداً O(V + E) مع قائمة المجاورة.",
    citation: "CS301 · Lec 6 §3",
  },
  {
    id: "q3", topic: "Hash Tables", topicAr: "جداول التجزئة", skill: "Collision Resolution", skillAr: "حل التعارض",
    difficulty: "hard",
    text: "In open addressing with linear probing, what happens when the load factor α exceeds 0.7?",
    textAr: "في العنونة المفتوحة مع Linear Probing، ماذا يحدث عندما يتجاوز Load Factor α القيمة 0.7؟",
    options: [
      "Performance improves due to better cache locality",
      "Primary clustering causes significant lookup degradation",
      "Chaining automatically takes over",
      "The table doubles in size automatically",
    ],
    optionsAr: [
      "يتحسن الأداء بسبب أفضلية ذاكرة التخزين المؤقت",
      "التجمع الأولي يُسبب تدهوراً ملحوظاً في البحث",
      "تنتقل تلقائياً إلى Chaining",
      "يتضاعف حجم الجدول تلقائياً",
    ],
    correctIndex: 1,
    explanation: "When α > 0.7 in linear probing, primary clustering creates long probe sequences, causing average lookup time to grow significantly. Most implementations trigger a rehash at α ≈ 0.75.",
    explanationAr: "عند α > 0.7 في Linear Probing، يُنتج التجمع الأولي تسلسلات بحث طويلة، مما يُسبب زيادة ملحوظة في وقت البحث. معظم التطبيقات تُعيد البناء عند α ≈ 0.75.",
    citation: "CS301 · Lec 7 §5",
  },
];

type Phase = "intro" | "question" | "feedback" | "results";

const TOPIC_RESULTS = [
  { topic: "BFS / Graph Traversal", topicAr: "بحث العرض أولاً", pct: 67, ev: 2, correct: 1, total: 2 },
  { topic: "Hash Tables", topicAr: "جداول التجزئة", pct: 0, ev: 1, correct: 0, total: 1 },
  { topic: "BFS — Complexity", topicAr: "BFS — التعقيد", pct: 100, ev: 1, correct: 1, total: 1 },
];

export default function DiagnosticScreen({ state, setState }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);

  const ArrowIcon = isRtl ? IconArrowLeft : IconArrowRight;
  const q = QUESTIONS[qIndex];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[qIndex] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      setSelected(null);
    } else {
      setPhase("results");
    }
  };

  if (phase === "intro") {
    return (
      <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
        <SectionHeading
          title={lang === "ar" ? "التشخيص" : "Diagnostic Assessment"}
          subtitle={lang === "ar" ? "CS301 · هياكل البيانات · الأسبوع 9" : "CS301 · Data Structures & Algorithms · Week 9"}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />

        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 14, padding: "28px 28px", marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "ما الذي سيُقيّم" : "WHAT THIS ASSESSES"}
            </div>
            <h2 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 18, color: tokens.textPrimary, letterSpacing: "-0.02em", margin: "0 0 10px", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "الرسوم البيانية وجداول التجزئة" : "Graph Traversal & Hash Tables"}
            </h2>
            <p style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.65, fontFamily: bFont, margin: "0 0 18px", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar"
                ? "هذا التشخيص سيُحدد مستوى إتقانك في 3 مواضيع مترابطة. كل سؤال مرتبط بموضوع ودرجة صعوبة محددة. النتائج ستُظهر نقاط قوتك وثغراتك بدقة."
                : "This diagnostic will assess your mastery across 3 related topics. Each question is tagged with a topic and difficulty level. Results show your strengths and precise learning gaps — not just an overall score."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: lang === "ar" ? "أسئلة" : "Questions", val: "3" },
                { label: lang === "ar" ? "المواضيع" : "Topics", val: "2" },
                { label: lang === "ar" ? "الوقت التقريبي" : "Est. Time", val: "8 min" },
              ].map((s) => (
                <div key={s.label} style={{ background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 9, padding: "12px 14px", textAlign: isRtl ? "right" : "left" }}>
                  <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: tokens.textPrimary, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "12px 14px", background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, borderRadius: 8, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.6, margin: 0, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar"
                  ? "الأسئلة مُنتقاة من المادة الدراسية المعتمدة. إجاباتك ستُشكّل أدلة لتحديد مستوى إتقانك — لا تخمّن، هذا ليس اختباراً."
                  : "Questions are sourced from your approved course materials. Your answers form evidence for mastery determination — there's no penalty, answer honestly."}
              </p>
            </div>

            <button
              onClick={() => setPhase("question")}
              style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: tokens.primary, color: "white", fontFamily: hFont, fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <IconDiagnostic size={16} color="white" />
              {lang === "ar" ? "ابدأ التشخيص" : "Begin Diagnostic"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const totalCorrect = answers.filter((a, i) => a === QUESTIONS[i].correctIndex).length;
    return (
      <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
        <SectionHeading
          title={lang === "ar" ? "نتائج التشخيص" : "Diagnostic Results"}
          subtitle={lang === "ar" ? "CS301 · الأسبوع 9 — اكتمل" : "CS301 · Week 9 — Completed"}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 14, padding: "22px 22px", marginBottom: 4 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar" ? "ملخص الأداء" : "PERFORMANCE SUMMARY"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: tokens.mastered }}>{totalCorrect}/{QUESTIONS.length}</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont }}>{lang === "ar" ? "إجابات صحيحة" : "Correct"}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: tokens.primary }}>{QUESTIONS.length}</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont }}>{lang === "ar" ? "نقاط أدلة" : "Evidence Points"}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: tokens.gap }}>2</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont }}>{lang === "ar" ? "ثغرات مشخّصة" : "Gaps Diagnosed"}</div>
                </div>
              </div>
            </div>

            {/* Per-topic results */}
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 10, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "الأداء حسب الموضوع" : "Performance by Topic & Skill"}
            </div>
            {TOPIC_RESULTS.map((tr) => {
              const level = masteryLevel(tr.pct, tr.ev > 0);
              const color = masteryColor(level, tokens);
              return (
                <div key={tr.topic} style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <div style={{ textAlign: isRtl ? "right" : "left" }}>
                      <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>{lang === "ar" ? tr.topicAr : tr.topic}</div>
                      <div style={{ fontSize: 11, color: tokens.textFaint, fontFamily: MONO }}>{tr.correct}/{tr.total} {lang === "ar" ? "صحيح" : "correct"} · {tr.ev} {lang === "ar" ? "أدلة" : "evidence"}</div>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color }}>{tr.pct}%</div>
                  </div>
                  <MasteryBar pct={tr.pct} evidence={tr.ev} tokens={tokens} />
                </div>
              );
            })}
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 18px" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar" ? "ماذا الآن؟" : "What's Next?"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => setState({ ...state, screen: "tutor" })} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: tokens.primary, color: "white", fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: isRtl ? "right" : "left" }}>
                  {lang === "ar" ? "بدء جلسة المعلم الذكي (Hash Tables)" : "AI Tutor Session — Hash Tables"}
                </button>
                <button onClick={() => setState({ ...state, screen: "practice" })} style={{ padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textPrimary, fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: isRtl ? "right" : "left" }}>
                  {lang === "ar" ? "التدريب على BFS" : "Practice BFS Questions"}
                </button>
                <button onClick={() => setState({ ...state, screen: "mastery" })} style={{ padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textPrimary, fontFamily: bFont, fontSize: 13, cursor: "pointer", textAlign: isRtl ? "right" : "left" }}>
                  {lang === "ar" ? "عرض خريطة الإتقان المحدّثة" : "View Updated Mastery Map"}
                </button>
              </div>
            </div>

            <div style={{ background: tokens.gapBg, border: `1px solid ${tokens.gapBorder}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.gap, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar" ? "الثغرات المشخّصة" : "DIAGNOSED GAPS"}
              </div>
              {[
                { text: lang === "ar" ? "Load Factor وتأثيره على Linear Probing" : "Load factor impact on linear probing", citation: "CS301 · Lec 7 §5" },
                { text: lang === "ar" ? "قائمة الانتظار في BFS (أحياناً مكدس)" : "BFS queue vs stack confusion", citation: "CS301 · Lec 6 §2" },
              ].map((g, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: tokens.gap, fontFamily: bFont, lineHeight: 1.5, margin: "0 0 4px", textAlign: isRtl ? "right" : "left" }}>{g.text}</p>
                  <CitationChip label={g.citation} tokens={tokens} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question phase
  const isAnswered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted }}>
          {lang === "ar" ? `سؤال ${qIndex + 1} من ${QUESTIONS.length}` : `Question ${qIndex + 1} of ${QUESTIONS.length}`}
        </div>
        <div style={{ flex: 1, display: "flex", gap: 4 }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= qIndex ? tokens.primary : tokens.cardBorder, transition: "background 300ms ease" }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Topic + difficulty tags */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.primary, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, borderRadius: 5, padding: "2px 8px" }}>
            {lang === "ar" ? q.topicAr : q.topic}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 5, padding: "2px 8px" }}>
            {lang === "ar" ? q.skillAr : q.skill}
          </span>
          <DifficultyTag level={q.difficulty} tokens={tokens} lang={lang} />
        </div>

        {/* Question */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 14, padding: "24px 24px", marginBottom: 14 }}>
          <h2 style={{ fontFamily: hFont, fontWeight: 600, fontSize: 17, color: tokens.textPrimary, letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.4, textAlign: isRtl ? "right" : "left" }}>
            {lang === "ar" ? q.textAr : q.text}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(lang === "ar" ? q.optionsAr : q.options).map((opt, oi) => {
              const isSelected = selected === oi;
              const isCorrectOpt = oi === q.correctIndex;
              let bg = tokens.card;
              let border = tokens.cardBorder;
              let color = tokens.textPrimary;
              if (isAnswered) {
                if (isCorrectOpt) { bg = tokens.masteredBg; border = tokens.mastered; color = tokens.mastered; }
                else if (isSelected && !isCorrectOpt) { bg = tokens.gapBg; border = tokens.gap; color = tokens.gap; }
              } else if (isSelected) {
                bg = tokens.primaryLight; border = tokens.primary; color = tokens.primary;
              }
              return (
                <button
                  key={oi}
                  onClick={() => handleSelect(oi)}
                  disabled={isAnswered}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 9,
                    border: `1.5px solid ${border}`,
                    background: bg,
                    color,
                    fontFamily: bFont,
                    fontWeight: isSelected || (isAnswered && isCorrectOpt) ? 600 : 400,
                    fontSize: 13,
                    textAlign: isRtl ? "right" : "left",
                    cursor: isAnswered ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexDirection: isRtl ? "row-reverse" : "row",
                    transition: "background 150ms ease, border-color 150ms ease",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, opacity: 0.6, flexShrink: 0 }}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isAnswered && isCorrectOpt && <IconCheck size={15} color={tokens.mastered} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div style={{ background: isCorrect ? tokens.masteredBg : tokens.gapBg, border: `1px solid ${isCorrect ? tokens.mastered : tokens.gap}44`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isCorrect ? tokens.mastered : tokens.gap }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: isCorrect ? tokens.mastered : tokens.gap, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
                {isCorrect ? (lang === "ar" ? "صحيح" : "Correct") : (lang === "ar" ? "غير صحيح" : "Incorrect")}
              </span>
            </div>
            <p style={{ fontSize: 13, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.65, margin: "0 0 10px", textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? q.explanationAr : q.explanation}
            </p>
            <CitationChip label={q.citation} tokens={tokens} />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", flexDirection: isRtl ? "row-reverse" : "row" }}>
          {qIndex > 0 ? (
            <button onClick={() => { setQIndex(qIndex - 1); setSelected(answers[qIndex - 1]); }} style={{ padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textMuted, fontFamily: bFont, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {lang === "ar" ? <ArrowIcon size={16} color={tokens.textMuted} /> : null}
              {lang === "ar" ? "السابق" : "Previous"}
              {lang !== "ar" ? <ArrowIcon size={16} color={tokens.textMuted} /> : null}
            </button>
          ) : <div />}
          <button
            onClick={isAnswered ? handleNext : undefined}
            disabled={!isAnswered}
            style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: isAnswered ? tokens.primary : tokens.inset, color: isAnswered ? "white" : tokens.textFaint, fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: isAnswered ? "pointer" : "not-allowed", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6 }}
          >
            {qIndex < QUESTIONS.length - 1 ? (lang === "ar" ? "التالي" : "Next") : (lang === "ar" ? "عرض النتائج" : "View Results")}
            <ArrowIcon size={15} color={isAnswered ? "white" : tokens.textFaint} />
          </button>
        </div>
      </div>
    </div>
  );
}
