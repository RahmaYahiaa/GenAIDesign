import { useMemo, useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, AlertStrip, inputStyle, bFontFor, hFontFor } from "../../components/ModuleUI";
import { IconShield, IconLock } from "../../components/Icons";
import AuditTrailTab from "./AuditTrailTab";
import { INSTRUCTOR_COURSE_IDS, COURSES } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Auditor home — read-only oversight persona (quality assurance / dept chair).
// The auditor sees the audit trail and decision-mix evidence across courses but
// holds NO grading powers: no approve, edit, reject, publish, visibility or
// remedial actions exist anywhere in this role (spec: audit is oversight only
// and is never shown to students; ratification power stays with instructors).
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditorHomeScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const [courseId, setCourseId] = useState(state.courseId && INSTRUCTOR_COURSE_IDS.includes(state.courseId) ? state.courseId : "CS301");
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];

  const entries = useMemo(() => mod.audit.filter((e) => e.courseId === courseId), [mod.audit, courseId]);
  const mix = useMemo(() => {
    const m: Record<string, number> = { approve: 0, edit: 0, reject: 0, resubmit: 0, visibility: 0, reopen: 0 };
    entries.forEach((e) => { m[e.action] = (m[e.action] ?? 0) + 1; });
    return m;
  }, [entries]);
  const scored = mix.approve + mix.edit + mix.reject + mix.resubmit;
  const ratifyPct = scored ? Math.round((mix.approve / scored) * 100) : 0;

  return (
    <div className="genai-pad" style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 16, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px", display: "flex", gap: 10, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconShield size={18} color={tokens.primary} />
            {lang === "ar" ? "الرقابة والتدقيق" : "Audit Oversight"}
          </h1>
          <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
            {lang === "ar"
              ? "إشراف للقراءة فقط على قرارات التقييم — اعتماد الذكاء الاصطناعي وتدخل المدرس."
              : "Read-only oversight of grading decisions — AI ratification vs instructor intervention."}
          </p>
        </div>
        <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setState({ ...state, courseId: e.target.value }); }} style={{ ...inputStyle(tokens, bFont), cursor: "pointer", width: 250 }} className="genai-input">
          {COURSES.filter((c) => INSTRUCTOR_COURSE_IDS.includes(c.id)).map((c) => (
            <option key={c.id} value={c.id}>{c.id} · {lang === "ar" ? c.title.ar : c.title.en}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          icon={<IconLock size={14} />}
          tokens={tokens}
          lang={lang}
          tone="slate"
          title={lang === "ar" ? "دور للقراءة فقط" : "Read-only role"}
          body={lang === "ar"
            ? "المدقق لا يعتمد ولا يعدل ولا يرفض ولا ينشر أي محتوى أو درجات — سلطة القرار تبقى للمدرس. وسجل التدقيق لا يظهر للطلاب أبداً."
            : "An auditor cannot approve, edit, reject, publish content or change visibility — decision power stays with the instructor. Students never see the audit trail."}
        />
      </div>

      {/* oversight tiles */}
      <div className="genai-tiles-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { l: lang === "ar" ? "إجمالي القرارات" : "DECISIONS", v: `${scored}`, c: tokens.textPrimary },
          { l: lang === "ar" ? "أُقرّت كما هي" : "AI RATIFIED", v: `${ratifyPct}%`, c: tokens.mastered },
          { l: lang === "ar" ? "تعديلات" : "EDITS", v: `${mix.edit}`, c: tokens.textPrimary },
          { l: lang === "ar" ? "رفض" : "REJECTS", v: `${mix.reject}`, c: tokens.gap },
          { l: lang === "ar" ? "طلب إعادة تسليم" : "RESUBMITS", v: `${mix.resubmit}`, c: tokens.developing },
        ].map((t) => (
          <div key={t.l} style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.09em", color: tokens.textMuted, marginBottom: 6 }}>{t.l}</div>
            <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: t.c, letterSpacing: "-0.03em" }}>{t.v}</div>
          </div>
        ))}
      </div>

      {/* full audit trail (already read-only: filters + entries + decision-mix insight) */}
      <Card tokens={tokens} style={{ padding: "20px 22px" }}>
        <AuditTrailTab state={state} courseId={course.id} />
      </Card>

      <p style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginTop: 14, textAlign: isRtl ? "right" : "left" }}>
        {lang === "ar"
          ? `المدقق: د. هالة زيدان · ضمان الجودة — ${course.id} · كل الطوابع الزمنية بالتوقيت المحلي`
          : `Auditor: Dr. Hala Zaydan · Quality Assurance — ${course.id} · all timestamps local`}
      </p>
    </div>
  );
}
