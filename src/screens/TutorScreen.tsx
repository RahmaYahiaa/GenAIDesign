import { useState } from "react";
import { AppState } from "../components/AppShell";
import { tk, MONO } from "../tokens";
import { CitationChip, MasteryBadge } from "../components/SharedUI";
import { IconSend, IconSendRtl, IconSparkle, IconInfo, IconWarning, IconFilter } from "../components/Icons";

interface Props { state: AppState; }

type ResponseMode = "explanation" | "worked-example" | "summary" | "guided";
type GroundStatus = "grounded" | "partial" | "insufficient";

interface Message {
  role: "user" | "ai" | "system";
  content: string;
  citations?: string[];
  code?: { lang: string; snippet: string };
  groundStatus?: GroundStatus;
  mode?: ResponseMode;
}

const MODE_LABELS: Record<ResponseMode, { en: string; ar: string }> = {
  "explanation": { en: "Explanation", ar: "شرح" },
  "worked-example": { en: "Worked Example", ar: "مثال محلول" },
  "summary": { en: "Summary", ar: "ملخص" },
  "guided": { en: "Guided Questioning", ar: "أسئلة توجيهية" },
};

export default function TutorScreen({ state }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const [inputVal, setInputVal] = useState("");
  const [mode, setMode] = useState<ResponseMode>("explanation");

  const groundStatusColor = (s: GroundStatus) =>
    s === "grounded" ? tokens.mastered : s === "partial" ? tokens.developing : tokens.gap;
  const groundStatusBg = (s: GroundStatus) =>
    s === "grounded" ? tokens.masteredBg : s === "partial" ? tokens.developingBg : tokens.gapBg;
  const groundStatusLabel = (s: GroundStatus): string =>
    s === "grounded"
      ? lang === "ar" ? "مستند إلى المادة" : "Grounded Response"
      : s === "partial"
      ? lang === "ar" ? "أدلة جزئية" : "Partial Evidence"
      : lang === "ar" ? "أدلة غير كافية" : "Insufficient Evidence";

  const messages: Message[] = [
    {
      role: "system",
      content: lang === "ar" ? "بدأت جلسة إتقان: جداول التجزئة · CS301 · المحاضرة 7" : "Mastery session started: Hash Tables · CS301 · Lecture 7",
    },
    {
      role: "user",
      content: lang === "ar"
        ? "ما الفرق بين Linear Probing وChaining في حل التعارض؟"
        : "What's the difference between linear probing and chaining for collision resolution?",
    },
    {
      role: "ai",
      groundStatus: "grounded",
      citations: ["CS301 · Lec 7 §3", "CS301 · Lec 7 §4"],
      mode: "explanation",
      content: lang === "ar"
        ? "كلاهما استراتيجيتان لحل التعارض لكنهما تختلفان في نموذج التخزين والأداء:\n\n**Chaining:** كل خانة تحتوي على قائمة مرتبطة. عند التعارض يُضاف العنصر إلى القائمة. البحث في أسوأ حالة O(n) إذا كانت كل العناصر في خانة واحدة.\n\n**Linear Probing:** عند التعارض نبحث عن الخانة التالية الفارغة تسلسلياً. هذا يُبقي البيانات متلاصقة في الذاكرة (cache-friendly) لكنه يُسبب 'تجمعاً أولياً'."
        : "Both resolve collisions but differ fundamentally in their storage model and performance:\n\n**Chaining:** Each slot holds a linked list. On collision the new element is appended. Worst-case search is O(n) if all keys hash to one slot, but average-case with a good hash function remains O(1).\n\n**Linear Probing:** On collision, scan forward for the next empty slot. This keeps data contiguous in memory (cache-friendly) but causes *primary clustering* — long runs of occupied slots that degrade performance as load factor rises.",
      code: {
        lang: "python",
        snippet: lang === "ar"
          ? `# Linear Probing — الإدخال
def insert(table, key, value, size):
    idx = hash(key) % size
    while table[idx] is not None:      # البحث عن خانة فارغة
        idx = (idx + 1) % size         # التحقق الخطي (circular)
    table[idx] = (key, value)`
          : `# Linear Probing — insert
def insert(table, key, value, size):
    idx = hash(key) % size
    while table[idx] is not None:      # find empty slot
        idx = (idx + 1) % size         # wrap around
    table[idx] = (key, value)`,
      },
    },
    {
      role: "user",
      content: lang === "ar" ? "متى يصبح Load Factor مشكلة في Linear Probing؟" : "At what load factor does linear probing start to perform badly?",
    },
    {
      role: "ai",
      groundStatus: "grounded",
      citations: ["CS301 · Lec 7 §5", "CS301 · PS3 Q4"],
      mode: "explanation",
      content: lang === "ar"
        ? "القاعدة العملية: عند **α > 0.7** يبدأ التجمع الأولي في التأثير الملحوظ على الأداء. معظم التطبيقات تُعيد بناء الجدول (resize) عند α ≈ 0.75 بمضاعفة الحجم وإعادة إدخال كل العناصر.\n\nفي Chaining التدهور أكثر تدرجاً — لا توجد نقطة حرجة واضحة لكن متوسط طول السلسلة يزيد بنسبة α."
        : "Rule of thumb: at **α > 0.7** (load factor above 70%), primary clustering causes measurably worse search performance. Most implementations trigger a **resize (rehash)** at α ≈ 0.75 — doubling table size and reinserting all entries.\n\nWith chaining the degradation is more gradual — no sharp threshold, but average chain length grows proportionally with α.",
    },
    {
      role: "user",
      content: lang === "ar" ? "هل يمكنك مساعدتي في خوارزمية Bellman-Ford؟" : "Can you explain Bellman-Ford algorithm?",
    },
    {
      role: "ai",
      groundStatus: "insufficient",
      citations: [],
      mode: "explanation",
      content: lang === "ar"
        ? "⚠ تحذير: موضوع Bellman-Ford (CS301 · Topic 9) لم يُغطَّ بعد في مواد المقرر المتاحة حتى الآن. لا يمكنني تقديم إجابة موثوقة من المواد المعتمدة.\n\nالمحاضرة 9 مجدولة للأسبوع القادم. يمكنني مساعدتك بمفاهيم أقصر مسار الأساسية إذا كانت موضوع Dijkstra متاحاً."
        : "⚠ Insufficient Evidence: Bellman-Ford (CS301 · Topic 9) has not yet been covered in available course materials. I cannot provide a grounded answer from approved content.\n\nLecture 9 is scheduled for next week. I can assist with foundational shortest-path concepts using Dijkstra if that topic is available in your materials.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Context header */}
      <div
        style={{
          background: tokens.card,
          borderBottom: `1px solid ${tokens.cardBorder}`,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRtl ? "row-reverse" : "row",
          flexShrink: 0,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconSparkle size={17} color={tokens.primary} />
          </div>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
              {lang === "ar" ? "المعلم الذكي — CS301" : "AI Academic Tutor — CS301"}
            </div>
            <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont }}>
              {lang === "ar" ? "الموضوع: جداول التجزئة · الأسبوع 9 · المحاضرة 7" : "Topic: Hash Tables · Week 9 · Lecture 7"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <MasteryBadge pct={22} evidence={2} tokens={tokens} lang={lang} />

          {/* RAG mode indicator */}
          <div style={{ padding: "4px 10px", borderRadius: 6, background: tokens.masteredBg, border: `1px solid ${tokens.mastered}44`, display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.mastered }} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.mastered, fontWeight: 600, letterSpacing: "0.03em" }}>
              {lang === "ar" ? "وضع RAG" : "RAG MODE"}
            </span>
          </div>
        </div>
      </div>

      {/* Response mode selector */}
      <div
        style={{
          background: tokens.inset,
          borderBottom: `1px solid ${tokens.cardBorder}`,
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: isRtl ? 0 : 8, marginLeft: isRtl ? 8 : 0, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <IconFilter size={13} color={tokens.textFaint} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {lang === "ar" ? "نمط الإجابة" : "Response Mode"}
          </span>
        </div>
        {(["explanation", "worked-example", "summary", "guided"] as ResponseMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: `1px solid ${mode === m ? tokens.primary : tokens.cardBorder}`,
              background: mode === m ? tokens.primaryLight : tokens.card,
              color: mode === m ? tokens.primary : tokens.textMuted,
              fontFamily: bFont,
              fontWeight: mode === m ? 600 : 400,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {MODE_LABELS[m][lang]}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => {
          if (msg.role === "system") {
            return (
              <div key={i} style={{ textAlign: "center", padding: "5px 14px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 20, alignSelf: "center", fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>
                {msg.content}
              </div>
            );
          }

          if (msg.role === "user") {
            return (
              <div key={i} style={{ display: "flex", justifyContent: isRtl ? "flex-start" : "flex-end" }}>
                <div
                  style={{
                    maxWidth: "65%",
                    background: tokens.primary,
                    borderRadius: isRtl ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                    padding: "11px 15px",
                    color: "white",
                    fontSize: 13,
                    fontFamily: bFont,
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          // AI message
          const gs = msg.groundStatus || "grounded";
          const gsColor = groundStatusColor(gs);
          const gsBg = groundStatusBg(gs);
          const parts = (msg.content || "").split("\n\n");

          return (
            <div key={i} style={{ display: "flex", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              {/* Avatar */}
              <div style={{ width: 30, height: 30, borderRadius: 8, background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <IconSparkle size={14} color={tokens.primary} />
              </div>

              <div style={{ flex: 1, maxWidth: "82%" }}>
                {/* Ground status bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                    flexDirection: isRtl ? "row-reverse" : "row",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", background: gsBg, border: `1px solid ${gsColor}44`, borderRadius: 5 }}>
                    {gs === "insufficient" ? <IconWarning size={11} color={gsColor} /> : <div style={{ width: 5, height: 5, borderRadius: "50%", background: gsColor }} />}
                    <span style={{ fontFamily: MONO, fontSize: 9, color: gsColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {groundStatusLabel(gs)}
                    </span>
                  </div>
                  {msg.mode && (
                    <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.textFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {MODE_LABELS[msg.mode][lang]}
                    </span>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  style={{
                    background: tokens.card,
                    border: gs === "insufficient" ? `1px solid ${tokens.gap}44` : `1px solid ${tokens.cardBorder}`,
                    borderRadius: isRtl ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    padding: "14px 16px",
                  }}
                >
                  {parts.map((part, pi) => (
                    <p
                      key={pi}
                      style={{ fontSize: 13, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.7, margin: pi === 0 ? 0 : "10px 0 0", textAlign: isRtl ? "right" : "left" }}
                      dangerouslySetInnerHTML={{
                        __html: part.replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight:600">$1</strong>`)
                          .replace(/\*(.*?)\*/g, `<em>$1</em>`),
                      }}
                    />
                  ))}

                  {/* Code block */}
                  {msg.code && (
                    <div style={{ marginTop: 12, background: state.dark ? "#0A0E23" : "#EEF1F7", border: `1px solid ${tokens.cardBorder}`, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ padding: "5px 12px", borderBottom: `1px solid ${tokens.cardBorder}`, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{msg.code.lang}</span>
                      </div>
                      <pre style={{ padding: "12px 14px", margin: 0, fontFamily: MONO, fontSize: 12, color: tokens.textPrimary, lineHeight: 1.7, overflowX: "auto", direction: "ltr" }}>
                        {msg.code.snippet}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap", justifyContent: isRtl ? "flex-end" : "flex-start" }}>
                    {msg.citations.map((c, ci) => <CitationChip key={ci} label={c} tokens={tokens} />)}
                  </div>
                )}
                {msg.groundStatus === "insufficient" && (
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <IconInfo size={11} color={tokens.developing} />
                    <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.developing }}>
                      {lang === "ar" ? "لا توجد مصادر مرتبطة بالمادة المتاحة" : "No course-material source available for this query"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${tokens.cardBorder}`, padding: "12px 24px", background: tokens.card, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div
            style={{
              flex: 1,
              background: tokens.inset,
              border: `1px solid ${tokens.cardBorder}`,
              borderRadius: 10,
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={lang === "ar" ? "اسأل عن جداول التجزئة... (مستند إلى CS301)" : "Ask about Hash Tables... (grounded in CS301)"}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: bFont, fontSize: 13, color: tokens.textPrimary, direction: isRtl ? "rtl" : "ltr" }}
            />
          </div>
          <button
            style={{ width: 38, height: 38, borderRadius: 9, border: "none", background: tokens.primary, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            {isRtl ? <IconSendRtl size={16} color="white" /> : <IconSend size={16} color="white" />}
          </button>
        </div>

        {/* Suggestion chips */}
        <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap", justifyContent: isRtl ? "flex-end" : "flex-start" }}>
          {(lang === "ar"
            ? ["اشرح Primary Clustering", "أعطني مثالاً محلولاً", "قارن مع Chaining", "كيف أختار بينهما؟"]
            : ["Explain primary clustering", "Give me a worked example", "Compare with chaining", "How to choose between them?"]
          ).map((s) => (
            <button
              key={s}
              onClick={() => setInputVal(s)}
              style={{ padding: "3px 10px", borderRadius: 20, border: `1px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textMuted, fontFamily: bFont, fontSize: 11, cursor: "pointer" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
