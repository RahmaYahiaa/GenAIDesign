import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Chip, Th, bFontFor, hFontFor } from "../../components/ModuleUI";
import { fmtWhen } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Audit Trail — reference d7: one honest table, five columns, no filters.
// Every row is a decision that changed or ratified an AI evaluation
// (FR-AUDIT-01/02), including score-visibility flips. Instructors only.
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditTrailTab({ state, courseId }: { state: AppState; courseId: string }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const rows = mod.audit
    .filter((e) => e.courseId === courseId)
    .sort((a, b) => b.at.localeCompare(a.at));

  const actionChip = (action: string) => {
    const map: Record<string, { tone: "primary" | "violet" | "slate"; en: string; ar: string }> = {
      approve: { tone: "primary", en: "Approve", ar: "اعتماد" },
      edit: { tone: "primary", en: "Edit", ar: "تعديل" },
      resubmit: { tone: "primary", en: "Request resubmission", ar: "طلب إعادة التسليم" },
      visibility: { tone: "slate", en: "Score visibility", ar: "إظهار الدرجة" },
      reject: { tone: "violet", en: "Reject", ar: "رفض" },
      reopen: { tone: "slate", en: "Reopen", ar: "إعادة فتح" },
    };
    const m = map[action] ?? map.edit;
    return <Chip tokens={tokens} tone={m.tone}>{lang === "ar" ? m.ar : m.en}</Chip>;
  };

  return (
    <div style={{ direction: isRtl ? "rtl" : "ltr" }}>
      <div style={{ marginBottom: 18, textAlign: isRtl ? "right" : "left" }}>
        <h2 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 20, color: tokens.textPrimary, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          {lang === "ar" ? "سجل التدقيق" : "Audit Trail"}
        </h2>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {lang === "ar"
            ? "كل قرار غيّر أو أقرّ تقييم الذكاء الاصطناعي. للمدرّسين فقط."
            : "Every decision that changed or ratified an AI evaluation. Instructors only."}
        </p>
      </div>

      <Card tokens={tokens} style={{ padding: "6px 20px" }}>
        {rows.length === 0 ? (
          <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textFaint, padding: "22px 0" }}>
            {lang === "ar" ? "لا قرارات مسجلة في هذا المقرر بعد." : "No recorded decisions in this course yet."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th tokens={tokens}>{lang === "ar" ? "التاريخ / الوقت" : "DATE / TIME"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "الإجراء" : "ACTION"}</Th>
                <Th tokens={tokens} align="right">{lang === "ar" ? "درجة الذكاء" : "AI SCORE"}</Th>
                <Th tokens={tokens} align="right">{lang === "ar" ? "الدرجة النهائية" : "FINAL SCORE"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "المدرّس" : "INSTRUCTOR"}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
                  <td style={{ padding: "15px 10px", fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, whiteSpace: "nowrap" }}>
                    {fmtWhen(e.at, lang)}
                  </td>
                  <td style={{ padding: "15px 10px" }}>
                    <div style={{ marginBottom: 5 }}>{actionChip(e.action)}</div>
                    <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted }}>{e.assignmentTitle}</div>
                    {e.action === "visibility" ? (
                      <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary, marginTop: 4 }}>
                        {lang === "ar"
                          ? `إظهار الدرجة ${e.visibilityBefore ? "تشغيل" : "إيقاف"} → ${e.visibilityAfter ? "تشغيل" : "إيقاف"}`
                          : `Score visibility ${e.visibilityBefore ? "ON" : "OFF"} → ${e.visibilityAfter ? "ON" : "OFF"}`}
                      </div>
                    ) : e.note ? (
                      <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary, marginTop: 4 }}>{e.note}</div>
                    ) : null}
                  </td>
                  <td style={{ padding: "15px 10px", textAlign: "right", fontFamily: MONO, fontSize: 13, fontWeight: 700, color: e.aiScore === null ? tokens.textFaint : tokens.textPrimary }}>
                    {e.aiScore === null ? "—" : e.aiScore}
                  </td>
                  <td style={{ padding: "15px 10px", textAlign: "right", fontFamily: MONO, fontSize: 13, fontWeight: 700, color: e.finalScore === null ? tokens.textFaint : tokens.primary }}>
                    {e.finalScore === null ? "—" : e.finalScore}
                  </td>
                  <td style={{ padding: "15px 10px", fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary }}>{e.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
