import { AppState } from "../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor } from "../tokens";
import { CitationChip, StatTile, MasteryBar, DifficultyTag } from "../components/SharedUI";
import { IconWarning, IconTrendUp, IconArrowRight } from "../components/Icons";

interface Props { state: AppState; setState: (s: AppState) => void; }

const TOPIC_GAPS = [
  { name: "Dijkstra / Shortest Path", avgPct: 22, students: 38, critical: true },
  { name: "Hash Table Internals", avgPct: 29, students: 31, critical: true },
  { name: "Binary Tree Balancing (AVL)", avgPct: 36, students: 24, critical: true },
  { name: "DFS Cycle Detection", avgPct: 44, students: 17, critical: false },
  { name: "Dynamic Programming", avgPct: 51, students: 11, critical: false },
  { name: "Graph Representation", avgPct: 63, students: 6, critical: false },
];

const MISCONCEPTIONS = [
  { text: "Belief that BFS uses a stack rather than a queue", count: 24, topic: "BFS", citation: "CS301 · Lec 6 §2" },
  { text: "Dijkstra's algorithm works correctly with negative edge weights", count: 19, topic: "Dijkstra", citation: "CS301 · Lec 9 §3" },
  { text: "Worst-case of separate chaining is O(1)", count: 17, topic: "Hash Tables", citation: "CS301 · Lec 7 §4" },
  { text: "Confusing AVL and BST height invariants", count: 11, topic: "BST", citation: "CS301 · Lec 5 §3" },
  { text: "All graph traversals are O(V²) regardless of representation", count: 9, topic: "Graphs", citation: "CS301 · Lec 6 §1" },
];

const STUDENTS = [
  { name: "Mohammed Al-Rashidi", id: "202341872", avg: 27, gap: "Dijkstra, Hash Tables", sessions: 2, trend: "stable" },
  { name: "Lina Hassan", id: "202338021", avg: 31, gap: "Binary Trees, BFS", sessions: 4, trend: "improving" },
  { name: "Tariq Al-Nasser", id: "202340155", avg: 34, gap: "Shortest Path, DFS", sessions: 1, trend: "declining" },
  { name: "Nour Al-Qahtani", id: "202341003", avg: 36, gap: "Hash Tables, Graphs", sessions: 3, trend: "stable" },
  { name: "Faris Ibrahim", id: "202342210", avg: 38, gap: "Dynamic Programming", sessions: 5, trend: "improving" },
];

export default function InstructorScreen({ state }: Props) {
  const tokens = tk(state.dark);
  const hFont = "'Plus Jakarta Sans', sans-serif";
  const bFont = "'Inter', sans-serif";

  const trendColor = (t: string) => t === "improving" ? tokens.mastered : t === "declining" ? tokens.gap : tokens.developing;
  const trendLabel = (t: string) => t === "improving" ? "Improving" : t === "declining" ? "Declining" : "Stable";

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            Course Analytics
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            CS301 · Data Structures & Algorithms · Prof. Dr. Nadia Al-Manea · Week 9 of 15
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textMuted, fontFamily: bFont, fontSize: 12, cursor: "pointer" }}>
            Export Report
          </button>
          <button style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: tokens.primary, color: "white", fontFamily: hFont, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            Generate Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatTile label="Students" value="47" sub="Enrolled" tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label="Avg. Mastery" value="54%" sub="All topics" mono accent={tokens.developing} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label="Need Attention" value="11" sub="< 40% mastery" accent={tokens.gap} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label="AI Sessions" value="312" sub="This semester" tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label="Misconceptions" value="8" sub="Distinct, diagnosed" accent={tokens.gap} tokens={tokens} headFont={hFont} bodyFont={bFont} />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Topic gaps */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>Class-Wide Topic Gaps</div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>ranked by severity</span>
          </div>
          {TOPIC_GAPS.map((gap) => {
            const level = masteryLevel(gap.avgPct, true);
            const color = masteryColor(level, tokens);
            return (
              <div key={gap.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${tokens.cardBorder}` }}>
                {gap.critical && <IconWarning size={13} color={tokens.gap} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont, marginBottom: 4 }}>{gap.name}</div>
                  <div style={{ height: 4, background: tokens.inset, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${gap.avgPct}%`, background: color, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 80, flexShrink: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color }}>{gap.avgPct}%</div>
                  <div style={{ fontSize: 10, color: tokens.textFaint, fontFamily: bFont }}>{gap.students} students</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Misconceptions */}
        <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>Common Misconceptions</div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>by prevalence</span>
          </div>
          {MISCONCEPTIONS.map((m, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < MISCONCEPTIONS.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: tokens.citation, background: tokens.citationBg, border: `1px solid ${tokens.citationBorder}`, borderRadius: 3, padding: "1px 6px" }}>
                      {m.topic}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.5, marginBottom: 5 }}>{m.text}</div>
                  <CitationChip label={m.citation} tokens={tokens} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: tokens.gap }}>{m.count}</div>
                  <div style={{ fontSize: 10, color: tokens.textFaint, fontFamily: bFont }}>students</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students table */}
      <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>Students Requiring Attention</div>
          <span style={{ fontFamily: MONO, fontSize: 10, background: tokens.gapBg, color: tokens.gap, border: `1px solid ${tokens.gapBorder}`, borderRadius: 5, padding: "2px 9px" }}>
            avg. mastery &lt; 40% · {STUDENTS.length} students
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Student", "ID", "Avg. Mastery", "Primary Gaps", "Trend", "AI Sessions", "Action"].map((col) => (
                <th key={col} style={{ textAlign: "left", padding: "7px 10px", fontSize: 10, fontFamily: MONO, fontWeight: 600, color: tokens.textFaint, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${tokens.cardBorder}` }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((student, i) => {
              const level = masteryLevel(student.avg, true);
              const color = masteryColor(level, tokens);
              return (
                <tr key={i} style={{ borderBottom: i < STUDENTS.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
                  <td style={{ padding: "11px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: hFont, fontWeight: 700, fontSize: 10, color: tokens.primary }}>
                        {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: tokens.textPrimary, fontFamily: bFont }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 10px" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textFaint }}>{student.id}</span>
                  </td>
                  <td style={{ padding: "11px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 52, height: 4, background: tokens.inset, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${student.avg}%`, background: color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color }}>{student.avg}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 10px" }}>
                    <span style={{ fontSize: 11, color: tokens.textMuted, fontFamily: bFont }}>{student.gap}</span>
                  </td>
                  <td style={{ padding: "11px 10px" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: trendColor(student.trend), background: `${trendColor(student.trend)}18`, border: `1px solid ${trendColor(student.trend)}44`, borderRadius: 4, padding: "2px 7px" }}>
                      {trendLabel(student.trend)}
                    </span>
                  </td>
                  <td style={{ padding: "11px 10px" }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: tokens.textPrimary }}>{student.sessions}</span>
                  </td>
                  <td style={{ padding: "11px 10px" }}>
                    <button style={{ padding: "5px 11px", borderRadius: 6, border: `1px solid ${tokens.primary}44`, background: tokens.primaryLight, color: tokens.primary, fontFamily: bFont, fontWeight: 500, fontSize: 11, cursor: "pointer" }}>
                      Intervene
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Course-wide distribution */}
      <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em", marginBottom: 16 }}>
          Course-Wide Mastery Distribution
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {TOPIC_GAPS.map((topic) => {
            const level = masteryLevel(topic.avgPct, true);
            const color = masteryColor(level, tokens);
            const bg = level === "no-evidence" ? tokens.noEvidenceBg : level === "beginner" ? tokens.gapBg : level === "intermediate" ? tokens.developingBg : level === "advanced" ? tokens.advancedBg : tokens.masteredBg;
            return (
              <div key={topic.name} style={{ background: bg, border: `1px solid ${color}44`, borderRadius: 9, padding: "12px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color, marginBottom: 5 }}>{topic.avgPct}%</div>
                <div style={{ fontSize: 10, color: tokens.textPrimary, fontFamily: bFont, lineHeight: 1.4, fontWeight: 500 }}>{topic.name}</div>
                <div style={{ fontSize: 10, color: tokens.textFaint, fontFamily: bFont, marginTop: 3 }}>{topic.students} flagged</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
