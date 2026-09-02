import { useState } from "react";
import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor } from "../tokens";
import { DifficultyTag, CitationChip, MasteryBar } from "../components/SharedUI";
import { IconCheck, IconFilter, IconTrendUp, IconArrowRight, IconArrowLeft } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

interface PracticeQ {
  id: string;
  topic: string;
  topicAr: string;
  skill: string;
  skillAr: string;
  difficulty: "easy" | "medium" | "hard";
  gapTag?: string;
  gapTagAr?: string;
  text: string;
  textAr: string;
  options: string[];
  optionsAr: string[];
  correctIndex: number;
  explanation: string;
  explanationAr: string;
  citation: string;
}

const PRACTICE_QS: PracticeQ[] = [
  {
    id: "p1", topic: "Hash Tables", topicAr: "جداول التجزئة", skill: "Collision Resolution", skillAr: "حل التعارض",
    difficulty: "medium", gapTag: "Your gap · 22% mastery", gapTagAr: "ثغرتك · 22% إتقان",
    text: "You are inserting keys into a hash table of size 7 using linear probing. After inserting keys that hash to slots [0, 1, 1, 3], what is the state of slot 2?",
    textAr: "تقوم بإدخال مفاتيح في جدول تجزئة بحجم 7 باستخدام Linear Probing. بعد إدخال مفاتيح تجزئ إلى الخانات [0, 1, 1, 3]، ما حالة الخانة 2؟",
    options: ["Empty", "Occupied by the 3rd key (collision from slot 1)", "Occupied by the 2nd key", "Impossible to determine"],
    optionsAr: ["فارغة", "مشغولة بالمفتاح الثالث (تعارض من الخانة 1)", "مشغولة بالمفتاح الثاني", "لا يمكن التحديد"],
    correctIndex: 1,
    explanation: "The 3rd key hashes to slot 1 (occupied by key 2), so linear probing moves to slot 2 (next empty), placing key 3 there. Slot 2 is occupied by the 3rd key.",
    explanationAr: "المفتاح الثالث يجزئ إلى الخانة 1 (مشغولة بالمفتاح 2)، فيتحرك Linear Probing إلى الخانة 2 (التالية الفارغة)، ويضع المفتاح الثالث هناك.",
    citation: "CS301 · Lec 7 §3",
  },
  {
    id: "p2", topic: "Hash Tables", topicAr: "جداول التجزئة", skill: "Load Factor", skillAr: "معامل الحمل",
    difficulty: "easy", gapTag: "Your gap · 22% mastery", gapTagAr: "ثغرتك · 22% إتقان",
    text: "A hash table has 12 elements stored in 16 slots. What is the load factor α, and should we rehash?",
    textAr: "جدول تجزئة يحتوي على 12 عنصراً في 16 خانة. ما معامل الحمل α، وهل يجب إعادة البناء؟",
    options: [
      "α = 0.75 — borderline, rehash recommended at next insertion",
      "α = 0.75 — no action needed, performance is still fine",
      "α = 1.33 — already overloaded",
      "α = 0.57 — well below threshold",
    ],
    optionsAr: [
      "α = 0.75 — حدّي، يُنصح بإعادة البناء عند الإدخال التالي",
      "α = 0.75 — لا إجراء مطلوب، الأداء لا يزال جيداً",
      "α = 1.33 — مثقل بالفعل",
      "α = 0.57 — أقل من الحد",
    ],
    correctIndex: 0,
    explanation: "α = 12/16 = 0.75 — exactly at the rehash threshold. Most implementations trigger rehash at or above α = 0.75 to prevent clustering degradation. Next insertion would push it over.",
    explanationAr: "α = 12/16 = 0.75 — عند عتبة إعادة البناء بالضبط. معظم التطبيقات تُعيد البناء عند α ≥ 0.75 لمنع تدهور التجمع.",
    citation: "CS301 · Lec 7 §5",
  },
  {
    id: "p3", topic: "BFS / Graph Traversal", topicAr: "بحث العرض أولاً", skill: "BFS Order", skillAr: "ترتيب BFS",
    difficulty: "medium",
    text: "In BFS starting from vertex A in a graph {A-B, A-C, B-D, C-D, D-E}, which vertex is visited 4th?",
    textAr: "في BFS ابتداءً من الرأس A في الرسم {A-B, A-C, B-D, C-D, D-E}، ما الرأس الذي يُزار رابعاً؟",
    options: ["B", "C", "D", "E"],
    optionsAr: ["B", "C", "D", "E"],
    correctIndex: 2,
    explanation: "BFS order from A: A (1st), B (2nd), C (3rd), D (4th — enqueued via B and C, dequeued after C), E (5th). D is the 4th visited.",
    explanationAr: "ترتيب BFS من A: A (أولاً)، B (ثانياً)، C (ثالثاً)، D (رابعاً — مُضاف عبر B وC)، E (خامساً). D هو الرابع.",
    citation: "CS301 · Lec 6 §2",
  },
];

type Filter = "all" | "gaps" | "easy" | "medium" | "hard";

export default function PracticeScreen({ state, setState }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const [filter, setFilter] = useState<Filter>("gaps");
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const ArrowIcon = isRtl ? IconArrowLeft : IconArrowRight;

  const FILTER_LABELS: Record<Filter, { en: string; ar: string }> = {
    all: { en: "All Questions", ar: "جميع الأسئلة" },
    gaps: { en: "My Gaps First", ar: "ثغراتي أولاً" },
    easy: { en: "Easy", ar: "سهل" },
    medium: { en: "Medium", ar: "متوسط" },
    hard: { en: "Hard", ar: "صعب" },
  };

  const filtered = filter === "all" ? PRACTICE_QS
    : filter === "gaps" ? PRACTICE_QS.filter((q) => q.gapTag)
    : PRACTICE_QS.filter((q) => q.difficulty === filter);

  const answered = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(([id, sel]) => {
    const q = PRACTICE_QS.find((q) => q.id === id);
    return q && sel === q.correctIndex;
  }).length;

  const gapTopics = [
    { label: lang === "ar" ? "جداول التجزئة" : "Hash Tables", pct: 22, ev: 2 },
    { label: lang === "ar" ? "أشجار ثنائية" : "Binary Trees", pct: 38, ev: 4 },
  ];

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            {lang === "ar" ? "التدريب" : "Practice"}
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {lang === "ar" ? "مرتبط بثغراتك — CS301 · هياكل البيانات" : "Connected to your learning gaps — CS301 · Data Structures"}
          </p>
        </div>
        {answered > 0 && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: tokens.mastered }}>
            {correct}/{answered} {lang === "ar" ? "صحيح" : "correct"}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
        {/* Main practice area */}
        <div>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconFilter size={14} color={tokens.textFaint} />
            {(["all", "gaps", "easy", "medium", "hard"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: `1px solid ${filter === f ? tokens.primary : tokens.cardBorder}`,
                  background: filter === f ? tokens.primaryLight : tokens.card,
                  color: filter === f ? tokens.primary : tokens.textMuted,
                  fontFamily: bFont,
                  fontWeight: filter === f ? 600 : 400,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {FILTER_LABELS[f][lang]}
                {f === "gaps" && (
                  <span style={{ marginLeft: isRtl ? 0 : 4, marginRight: isRtl ? 4 : 0, fontFamily: MONO, fontSize: 9, background: tokens.gapBg, color: tokens.gap, border: `1px solid ${tokens.gap}44`, borderRadius: 3, padding: "1px 4px" }}>
                    {PRACTICE_QS.filter((q) => q.gapTag).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((q) => {
              const userAnswer = answers[q.id] ?? null;
              const isAnswered = userAnswer !== null;
              const isCorrect = isAnswered && userAnswer === q.correctIndex;

              return (
                <div
                  key={q.id}
                  style={{
                    background: tokens.card,
                    border: `1px solid ${isAnswered ? (isCorrect ? tokens.mastered + "66" : tokens.gap + "44") : tokens.cardBorder}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  {/* Tags */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.primary, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, borderRadius: 4, padding: "2px 7px" }}>
                      {lang === "ar" ? q.topicAr : q.topic}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 4, padding: "2px 7px" }}>
                      {lang === "ar" ? q.skillAr : q.skill}
                    </span>
                    <DifficultyTag level={q.difficulty} tokens={tokens} lang={lang} />
                    {q.gapTag && (
                      <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.gap, background: tokens.gapBg, border: `1px solid ${tokens.gapBorder}`, borderRadius: 4, padding: "2px 7px" }}>
                        {lang === "ar" ? q.gapTagAr : q.gapTag}
                      </span>
                    )}
                    {isAnswered && (
                      <span style={{ fontFamily: MONO, fontSize: 9, color: isCorrect ? tokens.mastered : tokens.gap, background: isCorrect ? tokens.masteredBg : tokens.gapBg, border: `1px solid ${isCorrect ? tokens.mastered : tokens.gap}44`, borderRadius: 4, padding: "2px 7px" }}>
                        {isCorrect ? (lang === "ar" ? "صحيح" : "Correct") : (lang === "ar" ? "غير صحيح" : "Incorrect")}
                      </span>
                    )}
                  </div>

                  {/* Question */}
                  <p style={{ fontSize: 14, fontWeight: 500, color: tokens.textPrimary, fontFamily: hFont, lineHeight: 1.5, margin: "0 0 14px", letterSpacing: "-0.01em", textAlign: isRtl ? "right" : "left" }}>
                    {lang === "ar" ? q.textAr : q.text}
                  </p>

                  {/* Options */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: isAnswered ? 12 : 0 }}>
                    {(lang === "ar" ? q.optionsAr : q.options).map((opt, oi) => {
                      const isSelected = userAnswer === oi;
                      const isCorrectOpt = oi === q.correctIndex;
                      let bg = tokens.inset;
                      let border = tokens.insetBorder;
                      let color = tokens.textSecondary;
                      if (isAnswered) {
                        if (isCorrectOpt) { bg = tokens.masteredBg; border = tokens.mastered + "66"; color = tokens.mastered; }
                        else if (isSelected) { bg = tokens.gapBg; border = tokens.gap + "44"; color = tokens.gap; }
                      } else if (isSelected) {
                        bg = tokens.primaryLight; border = tokens.primary; color = tokens.primary;
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => !isAnswered && setAnswers({ ...answers, [q.id]: oi })}
                          disabled={isAnswered}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 7,
                            border: `1.5px solid ${border}`,
                            background: bg,
                            color,
                            fontFamily: bFont,
                            fontWeight: isSelected || (isAnswered && isCorrectOpt) ? 600 : 400,
                            fontSize: 12,
                            textAlign: isRtl ? "right" : "left",
                            cursor: isAnswered ? "default" : "pointer",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                            flexDirection: isRtl ? "row-reverse" : "row",
                          }}
                        >
                          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, opacity: 0.5, flexShrink: 0, marginTop: 1 }}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span>{opt}</span>
                          {isAnswered && isCorrectOpt && <IconCheck size={13} color={tokens.mastered} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {isAnswered && (
                    <div style={{ padding: "11px 13px", background: isCorrect ? tokens.masteredBg : tokens.gapBg, border: `1px solid ${isCorrect ? tokens.mastered : tokens.gap}44`, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.65, margin: "0 0 8px", textAlign: isRtl ? "right" : "left" }}>
                        {lang === "ar" ? q.explanationAr : q.explanation}
                      </p>
                      <CitationChip label={q.citation} tokens={tokens} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: gap context */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 16px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "التدريب مرتبط بثغراتك" : "Practice Targets Your Gaps"}
            </div>
            {gapTopics.map((gt) => {
              const level = masteryLevel(gt.pct, gt.ev > 0);
              const color = masteryColor(level, tokens);
              return (
                <div key={gt.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>{gt.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color }}>{gt.pct}%</span>
                  </div>
                  <MasteryBar pct={gt.pct} evidence={gt.ev} thin tokens={tokens} />
                </div>
              );
            })}
            <p style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont, lineHeight: 1.55, margin: 0, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar"
                ? "الأسئلة مُختارة لتقوية فهمك في الجوانب الضعيفة — ليست أسئلة عشوائية."
                : "Questions are selected to strengthen your weakest sub-skills — not random."}
            </p>
          </div>

          {answered > 0 && (
            <div style={{ background: tokens.masteredBg, border: `1px solid ${tokens.mastered}44`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.mastered, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar" ? "التقدم في هذه الجلسة" : "SESSION PROGRESS"}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: tokens.mastered, marginBottom: 2 }}>{correct}/{answered}</div>
              <div style={{ fontSize: 11, color: tokens.mastered, fontFamily: bFont }}>{lang === "ar" ? "إجابات صحيحة" : "Correct answers"}</div>
            </div>
          )}

          <button
            onClick={() => setState({ ...state, screen: "reassessment" })}
            style={{ padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${tokens.primary}`, background: "transparent", color: tokens.primary, fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <IconTrendUp size={15} color={tokens.primary} />
            {lang === "ar" ? "إعادة التقييم الآن" : "Ready for Reassessment?"}
          </button>
        </div>
      </div>
    </div>
  );
}
