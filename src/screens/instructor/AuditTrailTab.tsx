import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Chip, bFontFor, hFontFor, Th } from "../../components/ModuleUI";
import { IconShield, IconEye, IconEyeOff } from "../../components/Icons";
import { AuditEntry, fmtWhen } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Audit trail (FR-AUDIT-01..04). Every decision that changed or ratified an AI
// evaluation, plus every score-visibility change. Instructor/admin only.
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_META: Record<AuditEntry["action"], { en: string; ar: string; tone: "primary" | "peri" | "violet" | "slate" | "default" }> = {
  approve: { en: "Approve", ar: "اعتماد", tone: "primary" },
  edit: { en: "Edit", ar: "تعديل", tone: "peri" },
  reject: { en: "Reject", ar: "رفض", tone: "violet" },
  resubmit: { en: "Request resubmission", ar: "طلب إعادة تسليم", tone: "violet" },
  visibility: { en: "Visibility change", ar: "تغيير الإظهار", tone: "default" },
  reopen: { en: "Reopened", ar: "إعادة فتح", tone: "slate" },
};

export default function AuditTrailTab({ state, courseId }: { state: AppState; courseId: string }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const [filter, setFilter] = useState<"all" | AuditEntry["action"]>("all");

  const entries = mod.audit
    .filter((e) => e.courseId === courseId)
    .filter((e) => filter === "all" || e.action === filter)
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconShield size={16} color={tokens.primary} />
            <h2 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 19, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: 0 }}>
              {lang === "ar" ? "سجل التدقيق" : "Audit trail"}
            </h2>
          </div>
          <p style={{ fontSize: 12.5, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {lang === "ar"
              ? "كل قرار غيّر أو أقرّ تقييماً بالذكاء الاصطناعي، وكل تغيير في إعداد إظهار الدرجات. مرئي للمدرّس والمخوّلين فقط — لا للطلاب أبداً."
              : "Every decision that changed or ratified an AI evaluation, and every score-visibility change. Visible to authorized instructors/admins only — never to students."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
          {(["all", "approve", "edit", "reject", "resubmit", "visibility"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 11px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${filter === f ? tokens.primary : tokens.cardBorder}`,
                background: filter === f ? tokens.primaryLight : tokens.card,
                color: filter === f ? tokens.primary : tokens.textMuted,
                fontFamily: bFont, fontSize: 11, fontWeight: filter === f ? 600 : 500,
              }}
            >
              {f === "all" ? (lang === "ar" ? "الكل" : "All") : lang === "ar" ? ACTION_META[f].ar : ACTION_META[f].en}
            </button>
          ))}
        </div>
      </div>

      <Card tokens={tokens} style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr>
              <Th tokens={tokens}>{lang === "ar" ? "التاريخ/الوقت" : "Date / time"}</Th>
              <Th tokens={tokens}>{lang === "ar" ? "نوع الإجراء" : "Action type"}</Th>
              <Th tokens={tokens}>{lang === "ar" ? "الطالب · السؤال" : "Student · question"}</Th>
              <Th tokens={tokens} align="right">{lang === "ar" ? "درجة الذكاء الأصلية" : "Original AI score"}</Th>
              <Th tokens={tokens} align="right">{lang === "ar" ? "الدرجة النهائية" : "Final score"}</Th>
              <Th tokens={tokens}>{lang === "ar" ? "المدرّس" : "Instructor"}</Th>
              <Th tokens={tokens}>{lang === "ar" ? "ملاحظة" : "Note"}</Th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 26, fontFamily: bFont, fontSize: 12, color: tokens.textFaint, textAlign: "center" }}>
                  {lang === "ar" ? "لا مدخلات مطابقة لهذا المرشح." : "No entries match this filter."}
                </td>
              </tr>
            )}
            {entries.map((e, i) => {
              const meta = ACTION_META[e.action];
              return (
                <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textSecondary }}>{fmtWhen(e.at, lang)}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Chip tokens={tokens} tone={meta.tone}>{lang === "ar" ? meta.ar : meta.en}</Chip>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textPrimary }}>{e.studentName}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: tokens.textFaint, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.questionLabel}</div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: e.aiScore === null ? tokens.noEvidence : tokens.developing }}>
                      {e.aiScore === null ? (lang === "ar" ? "—" : "null") : e.aiScore}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: e.finalScore === null ? tokens.textFaint : tokens.mastered }}>
                      {e.finalScore === null ? "—" : e.finalScore}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary, whiteSpace: "nowrap" }}>{e.instructor}</span>
                  </td>
                  <td style={{ padding: "10px 14px", maxWidth: 320 }}>
                    {e.action === "visibility" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: bFont, fontSize: 11, color: tokens.textSecondary }}>
                        {e.visibilityBefore ? <IconEye size={12} color={tokens.primary} /> : <IconEyeOff size={12} color={tokens.textFaint} />}
                        <span style={{ fontFamily: MONO, fontSize: 10 }}>{e.visibilityBefore ? "ON" : "OFF"} → {e.visibilityAfter ? "ON" : "OFF"}</span>
                        {e.note && <span style={{ color: tokens.textFaint }}>· {e.note}</span>}
                      </span>
                    ) : (
                      <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textMuted, lineHeight: 1.5 }}>{e.note ?? "—"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 14, lineHeight: 1.6, textAlign: isRtl ? "right" : "left" }}>
        {lang === "ar"
          ? "تُحفَظ درجة الذكاء الاصطناعي الأصلية دائماً بجانب الدرجة النهائية بغض النظر عن الإجراء، ما يتيح قياس تحسّن دقة التقييم مع الزمن."
          : "The original AI score is always stored beside the final score regardless of action, so approve-vs-edit-vs-reject ratios remain usable as a measure of improving evaluation accuracy."}
      </p>
    </>
  );
}
