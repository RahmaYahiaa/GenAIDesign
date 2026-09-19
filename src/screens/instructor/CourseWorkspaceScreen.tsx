import { AppState, WorkspaceTab } from "../../components/AppShell";
import { tk } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { PillTabs, BackCircle, bFontFor, hFontFor } from "../../components/ModuleUI";
import { IconWarning } from "../../components/Icons";
import { approvedMaterials } from "../../data/instructorModule";
import AssignmentsTab from "./AssignmentsTab";
import MaterialsTab from "./MaterialsTab";
import CourseAnalyticsTab from "./CourseAnalyticsTab";
import AuditTrailTab from "./AuditTrailTab";

// ─────────────────────────────────────────────────────────────────────────────
// Course Workspace shell — reference d3/d6/d7: circular back button, course
// title header, and four segmented pill tabs (Assignments · Materials ·
// Analytics · Audit). Reached only from the course cards — it has no
// sidebar entry.
// ─────────────────────────────────────────────────────────────────────────────

export default function CourseWorkspaceScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const courseId = state.courseId ?? "CS301";
  const course = mod.courses.find((c) => c.id === courseId) ?? mod.courses[0];
  const tab: WorkspaceTab = state.tab === "materials" || state.tab === "analytics" || state.tab === "audit" ? state.tab : "assignments";
  const coverageGaps = course.topics.filter((t) => approvedMaterials(t) === 0).length;
  const setTab = (t: WorkspaceTab) => setState({ ...state, tab: t });

  return (
    <div className="genai-pad" style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <BackCircle tokens={tokens} rtl={isRtl} onClick={() => setState({ ...state, screen: "instructor-home", tab: undefined })} />
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
            {course.id} · {lang === "ar" ? course.title.ar : course.title.en}
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span>{course.instructor} · {course.enrolled} {lang === "ar" ? "طالباً" : "students"}</span>
            {coverageGaps > 0 && (
              <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: bFont, fontSize: 11, fontWeight: 600, color: tokens.gap, background: tokens.gapBg, border: `1px solid ${tokens.gap}44`, borderRadius: 6, padding: "2px 8px" }}>
                <IconWarning size={11} color={tokens.gap} />
                {coverageGaps} {lang === "ar" ? "فجوة تغطية" : "coverage gap"}{coverageGaps > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Pill tabs — exactly three */}
      <PillTabs
        tokens={tokens}
        lang={lang}
        active={tab}
        onSelect={(id) => setTab(id as WorkspaceTab)}
        tabs={[
          { id: "assignments", label: lang === "ar" ? "التكليفات" : "Assignments" },
          { id: "materials", label: lang === "ar" ? "المواد" : "Materials" },
          { id: "analytics", label: lang === "ar" ? "التحليلات" : "Analytics" },
          { id: "audit", label: lang === "ar" ? "سجل التدقيق" : "Audit Trail" },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        {tab === "assignments" && <AssignmentsTab state={state} setState={setState} courseId={course.id} />}
        {tab === "materials" && <MaterialsTab state={state} setState={setState} courseId={course.id} />}
        {tab === "analytics" && <CourseAnalyticsTab state={state} setState={setState} courseId={course.id} />}
        {tab === "audit" && <AuditTrailTab state={state} courseId={course.id} />}
      </div>
    </div>
  );
}
