import { AppState, WorkspaceTab } from "../../components/AppShell";
import { tk } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { PillTabs, BackCircle, bFontFor, hFontFor } from "../../components/ModuleUI";
import AssignmentsTab from "./AssignmentsTab";
import CourseAnalyticsTab from "./CourseAnalyticsTab";
import AuditTrailTab from "./AuditTrailTab";

// ─────────────────────────────────────────────────────────────────────────────
// Course Workspace shell — reference d3/d6/d7: circular back button, course
// title header, and exactly three segmented pill tabs. No overview tab: the
// course view starts at its assignments.
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
  const tab: WorkspaceTab = state.tab === "analytics" || state.tab === "audit" ? state.tab : "assignments";
  const setTab = (t: WorkspaceTab) => setState({ ...state, tab: t });

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <BackCircle tokens={tokens} rtl={isRtl} onClick={() => setState({ ...state, screen: "instructor-home", tab: undefined })} />
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
            {course.id} · {lang === "ar" ? course.title.ar : course.title.en}
          </h1>
          <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {course.instructor} · {course.enrolled} {lang === "ar" ? "طالباً" : "students"}
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
          { id: "analytics", label: lang === "ar" ? "التحليلات" : "Analytics" },
          { id: "audit", label: lang === "ar" ? "سجل التدقيق" : "Audit Trail" },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        {tab === "assignments" && <AssignmentsTab state={state} setState={setState} courseId={course.id} />}
        {tab === "analytics" && <CourseAnalyticsTab state={state} courseId={course.id} />}
        {tab === "audit" && <AuditTrailTab state={state} courseId={course.id} />}
      </div>
    </div>
  );
}
