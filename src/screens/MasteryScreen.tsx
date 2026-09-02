import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor, masteryBg, masteryLevelLabel, MasteryLevel } from "../tokens";
import { MasteryBadge, MasteryPill, MasteryBar, CitationChip, SectionHeading, DifficultyTag, StatTile } from "../components/SharedUI";
import { IconWarning, IconInfo, IconTutor, IconDiagnostic } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

interface Topic {
  id: string;
  label: string;
  labelAr: string;
  pct: number;
  evidence: number;
  avgScore: number;
  gaps: { text: string; textAr: string; severity: "critical" | "major" | "minor"; blocksTopicId?: string; citation: string }[];
  subSkills: { label: string; labelAr: string; pct: number; ev: number }[];
}

const TOPICS: Topic[] = [
  {
    id: "arrays", label: "Arrays & Linked Lists", labelAr: "المصفوفات والقوائم المرتبطة",
    pct: 91, evidence: 12, avgScore: 88,
    gaps: [],
    subSkills: [
      { label: "Random Access O(1)", labelAr: "الوصول العشوائي", pct: 95, ev: 5 },
      { label: "Insertion & Deletion", labelAr: "الإدخال والحذف", pct: 87, ev: 4 },
      { label: "Memory Layout", labelAr: "تخطيط الذاكرة", pct: 91, ev: 3 },
    ],
  },
  {
    id: "bfs", label: "BFS / Graph Traversal", labelAr: "بحث العرض أولاً — BFS",
    pct: 74, evidence: 8, avgScore: 71,
    gaps: [
      { text: "Occasionally uses stack instead of queue for BFS", textAr: "أحياناً يستخدم مكدساً بدلاً من قائمة انتظار في BFS", severity: "minor", citation: "CS301 · Lec 6 §2" },
    ],
    subSkills: [
      { label: "Queue-based traversal", labelAr: "الاجتياز بقائمة الانتظار", pct: 68, ev: 4 },
      { label: "Shortest unweighted path", labelAr: "أقصر مسار غير مرجّح", pct: 82, ev: 3 },
      { label: "Complexity O(V+E)", labelAr: "التعقيد O(V+E)", pct: 77, ev: 3 },
    ],
  },
  {
    id: "dfs", label: "DFS & Cycle Detection", labelAr: "بحث العمق وكشف الدورات",
    pct: 55, evidence: 6, avgScore: 52,
    gaps: [
      { text: "Confusion between DFS tree edges and back edges in cycle detection", textAr: "الخلط بين حواف شجرة DFS والحواف الخلفية في كشف الدورات", severity: "major", citation: "CS301 · Lec 6 §4" },
    ],
    subSkills: [
      { label: "Recursive DFS", labelAr: "DFS التكراري", pct: 65, ev: 3 },
      { label: "Cycle detection", labelAr: "كشف الدورات", pct: 40, ev: 2 },
      { label: "Topological sort", labelAr: "الترتيب التوبولوجي", pct: 55, ev: 2 },
    ],
  },
  {
    id: "bst", label: "Binary Trees & BST", labelAr: "الأشجار الثنائية وBST",
    pct: 38, evidence: 4, avgScore: 35,
    gaps: [
      { text: "Conflates BST ordering property with heap ordering invariant", textAr: "يخلط بين خاصية ترتيب BST وخاصية الكومة", severity: "critical", citation: "CS301 · Lec 5 §1" },
      { text: "Incorrect in-order traversal for non-balanced trees", textAr: "اجتياز in-order خاطئ للأشجار غير المتوازنة", severity: "major", citation: "CS301 · Lec 5 §3" },
    ],
    subSkills: [
      { label: "BST insertion/search", labelAr: "إدخال وبحث BST", pct: 48, ev: 2 },
      { label: "Tree traversals", labelAr: "اجتيازات الشجرة", pct: 32, ev: 2 },
      { label: "Height balancing (AVL)", labelAr: "AVL والتوازن", pct: 22, ev: 1 },
    ],
  },
  {
    id: "hash", label: "Hash Tables", labelAr: "جداول التجزئة",
    pct: 22, evidence: 2, avgScore: 20,
    gaps: [
      { text: "Believes linear probing and chaining have identical worst-case performance", textAr: "يعتقد أن Linear Probing وChaining لهما نفس أداء الحالة الأسوأ", severity: "critical", blocksTopicId: "shortest", citation: "CS301 · Lec 7 §4" },
      { text: "No understanding of load factor threshold for resizing", textAr: "لا يفهم عتبة Load Factor للتوسع", severity: "major", citation: "CS301 · Lec 7 §5" },
    ],
    subSkills: [
      { label: "Hash functions", labelAr: "دوال التجزئة", pct: 34, ev: 1 },
      { label: "Collision resolution", labelAr: "حل التعارض", pct: 14, ev: 1 },
      { label: "Load factor & resize", labelAr: "Load Factor والتوسع", pct: 10, ev: 1 },
    ],
  },
  {
    id: "shortest", label: "Dijkstra / Shortest Path", labelAr: "أقصر مسار — ديكسترا",
    pct: 0, evidence: 0, avgScore: 0,
    gaps: [],
    subSkills: [
      { label: "Dijkstra's algorithm", labelAr: "خوارزمية ديكسترا", pct: 0, ev: 0 },
      { label: "Priority queue usage", labelAr: "قائمة الأولوية", pct: 0, ev: 0 },
      { label: "Bellman-Ford", labelAr: "بيلمان-فورد", pct: 0, ev: 0 },
    ],
  },
];

const SEVERITY_LABELS: Record<"critical" | "major" | "minor", { en: string; ar: string }> = {
  critical: { en: "Critical", ar: "حرج" },
  major: { en: "Major", ar: "رئيسي" },
  minor: { en: "Minor", ar: "ثانوي" },
};

export default function MasteryScreen({ state, setState }: Props) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const allGaps = TOPICS.flatMap((t) => t.gaps.map((g) => ({ ...g, topicLabel: lang === "ar" ? t.labelAr : t.label, topicId: t.id })));
  const criticalGaps = allGaps.filter((g) => g.severity === "critical");
  const majorGaps = allGaps.filter((g) => g.severity === "major");

  const severityColor = (s: "critical" | "major" | "minor") =>
    s === "critical" ? tokens.gap : s === "major" ? tokens.developing : tokens.advanced;
  const severityBg = (s: "critical" | "major" | "minor") =>
    s === "critical" ? tokens.gapBg : s === "major" ? tokens.developingBg : tokens.advancedBg;

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      <SectionHeading
        title={lang === "ar" ? "المواضيع والإتقان" : "Topics & Mastery"}
        subtitle={lang === "ar" ? "CS301 · هياكل البيانات · الفصل الثاني 2025–2026" : "CS301 · Data Structures & Algorithms · Semester 2 · 2025–2026"}
        tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
      />

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatTile label={lang === "ar" ? "متقن" : "Mastered"} value="1" sub=">85%" accent={tokens.mastered} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "متقدم" : "Advanced"} value="1" sub="61–85%" accent={tokens.advanced} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "قيد التطوير" : "Developing"} value="2" sub="31–60%" accent={tokens.developing} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "ثغرات" : "Learning Gaps"} value={`${criticalGaps.length + majorGaps.length}`} sub={lang === "ar" ? "تحتاج اهتماماً" : "Need attention"} accent={tokens.gap} tokens={tokens} headFont={hFont} bodyFont={bFont} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Topic cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TOPICS.map((topic) => {
            const level = masteryLevel(topic.pct, topic.evidence > 0);
            const color = masteryColor(level, tokens);
            const label = lang === "ar" ? topic.labelAr : topic.label;
            const noData = topic.evidence === 0;
            return (
              <div
                key={topic.id}
                style={{
                  background: tokens.card,
                  border: `1px solid ${tokens.cardBorder}`,
                  borderRadius: 12,
                  padding: "18px 20px",
                  borderLeft: isRtl ? undefined : `3px solid ${color}`,
                  borderRight: isRtl ? `3px solid ${color}` : undefined,
                }}
              >
                {/* Row 1: title + badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 3 }}>{label}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <MasteryPill level={level} tokens={tokens} lang={lang} />
                      {!noData && (
                        <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>
                          {lang === "ar" ? `متوسط ${topic.avgScore}%` : `Avg Score ${topic.avgScore}%`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: isRtl ? "left" : "right" }}>
                    {noData ? (
                      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: tokens.noEvidence }}>—</div>
                    ) : (
                      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color }}>{topic.pct}%</div>
                    )}
                    <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{topic.evidence} {lang === "ar" ? "أدلة" : "evidence pts"}</div>
                  </div>
                </div>

                {/* Bar */}
                {noData ? (
                  <div style={{ padding: "10px 12px", background: tokens.noEvidenceBg, border: `1px solid ${tokens.cardBorder}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <IconInfo size={14} color={tokens.noEvidence} />
                    <span style={{ fontSize: 12, color: tokens.noEvidence, fontFamily: bFont }}>
                      {lang === "ar" ? "لم يتم التقييم بعد — لا توجد أدلة" : "Not yet assessed — no evidence collected"}
                    </span>
                    <button
                      onClick={() => setState({ ...state, screen: "diagnostic" })}
                      style={{ marginLeft: isRtl ? 0 : "auto", marginRight: isRtl ? "auto" : 0, fontSize: 11, color: tokens.primary, background: "none", border: "none", cursor: "pointer", fontFamily: bFont, fontWeight: 600, padding: 0 }}
                    >
                      {lang === "ar" ? "ابدأ تشخيص ←" : "Start Diagnostic →"}
                    </button>
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <MasteryBar pct={topic.pct} evidence={topic.evidence} tokens={tokens} />
                  </div>
                )}

                {/* Sub-skills */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: topic.gaps.length > 0 ? 12 : 0 }}>
                  {topic.subSkills.map((sk) => {
                    const skLevel = masteryLevel(sk.pct, sk.ev > 0);
                    const skColor = masteryColor(skLevel, tokens);
                    return (
                      <div key={sk.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <span style={{ fontSize: 10, color: tokens.textMuted, fontFamily: bFont }}>{lang === "ar" ? sk.labelAr : sk.label}</span>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: skColor, fontWeight: 600 }}>{sk.ev > 0 ? `${sk.pct}%` : "—"}</span>
                        </div>
                        <div style={{ height: 3, background: tokens.inset, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${sk.pct}%`, background: skColor, borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gaps */}
                {topic.gaps.map((gap, gi) => (
                  <div
                    key={gi}
                    style={{
                      padding: "10px 12px",
                      background: severityBg(gap.severity),
                      border: `1px solid ${severityColor(gap.severity)}33`,
                      borderLeft: isRtl ? undefined : `2px solid ${severityColor(gap.severity)}`,
                      borderRight: isRtl ? `2px solid ${severityColor(gap.severity)}` : undefined,
                      borderRadius: 7,
                      marginBottom: gi < topic.gaps.length - 1 ? 6 : 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <IconWarning size={12} color={severityColor(gap.severity)} />
                          <span style={{ fontFamily: MONO, fontSize: 9, color: severityColor(gap.severity), textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                            {SEVERITY_LABELS[gap.severity][lang]}
                          </span>
                          {gap.blocksTopicId && (
                            <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.gap, background: tokens.gapBg, border: `1px solid ${tokens.gapBorder}`, borderRadius: 3, padding: "1px 5px" }}>
                              {lang === "ar" ? "يعيق تقدم موضوع" : "blocks topic progress"}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.55, margin: 0, textAlign: isRtl ? "right" : "left" }}>
                          {lang === "ar" ? gap.textAr : gap.text}
                        </p>
                        <div style={{ marginTop: 6 }}>
                          <CitationChip label={gap.citation} tokens={tokens} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right: Gap summary + Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Gap priority list */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 18px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 14, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "أولويات ثغرات التعلم" : "Learning Gap Priority"}
            </div>
            {TOPICS.filter((t) => t.gaps.length > 0 || t.pct <= 60)
              .sort((a, b) => a.pct - b.pct)
              .map((topic, i) => {
                const level = masteryLevel(topic.pct, topic.evidence > 0);
                const color = masteryColor(level, tokens);
                return (
                  <div key={topic.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 3 ? `1px solid ${tokens.cardBorder}` : "none", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: tokens.inset, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>{lang === "ar" ? topic.labelAr : topic.label}</div>
                      <div style={{ height: 3, background: tokens.inset, borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${topic.pct}%`, background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                      {topic.evidence > 0 ? `${topic.pct}%` : "—"}
                    </span>
                  </div>
                );
              })}
          </div>

          {/* Level legend */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "سلّم الإتقان" : "Mastery Ladder"}
            </div>
            {([
              { level: "no-evidence" as MasteryLevel, pctRange: lang === "ar" ? "لا أدلة" : "No data" },
              { level: "beginner" as MasteryLevel, pctRange: "0 – 30%" },
              { level: "intermediate" as MasteryLevel, pctRange: "31 – 60%" },
              { level: "advanced" as MasteryLevel, pctRange: "61 – 85%" },
              { level: "mastered" as MasteryLevel, pctRange: "86 – 100%" },
            ]).map((row) => (
              <div key={row.level} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: masteryColor(row.level, tokens) }} />
                  <span style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont }}>{masteryLevelLabel(row.level, lang)}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{row.pctRange}</span>
              </div>
            ))}
          </div>

          {/* Gap severity legend */}
          <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>
              {lang === "ar" ? "درجات خطورة الثغرات" : "Gap Severity Levels"}
            </div>
            {(["critical", "major", "minor"] as const).map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: severityColor(s), flexShrink: 0, marginTop: 2 }} />
                <div style={{ textAlign: isRtl ? "right" : "left" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: severityColor(s), textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 2 }}>
                    {SEVERITY_LABELS[s][lang]}
                  </div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont, lineHeight: 1.4 }}>
                    {lang === "ar"
                      ? s === "critical" ? "يعيق الفهم الأساسي" : s === "major" ? "يضعف أداء الموضوع" : "خطأ بسيط في التطبيق"
                      : s === "critical" ? "Blocks foundational understanding" : s === "major" ? "Weakens topic performance" : "Minor application error"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => setState({ ...state, screen: "tutor" })}
              style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: tokens.primary, color: "white", fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "-0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <IconTutor size={15} color="white" />
              {lang === "ar" ? "بدء جلسة مع المعلم الذكي" : "Start AI Tutor Session"}
            </button>
            <button
              onClick={() => setState({ ...state, screen: "diagnostic" })}
              style={{ padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textPrimary, fontFamily: hFont, fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "-0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <IconDiagnostic size={15} color={tokens.textMuted} />
              {lang === "ar" ? "تشخيص موضوع جديد" : "Diagnose a New Topic"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
