// Dev-only SSR smoke test: renders every Instructor Workspace screen once to
// catch render-time crashes. Run: node scripts/smoke.mjs
import { createServer } from "vite";
import { renderToString } from "react-dom/server";
import React from "react";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const load = (p) => server.ssrLoadModule(p);

const { InstructorModuleProvider } = await load("/src/store/InstructorStore.tsx");

const cases = [
  ["InstructorHome", "/src/screens/instructor/InstructorHomeScreen.tsx", { screen: "instructor-home", dark: false, lang: "en" }],
  ["InstructorHome(dark/ar)", "/src/screens/instructor/InstructorHomeScreen.tsx", { screen: "instructor-home", dark: true, lang: "ar" }],
  ["LegacyAnalytics", "/src/screens/InstructorScreen.tsx", { screen: "instructor", dark: false, lang: "en", courseId: "CS301" }],
  ["LegacyAnalytics(dark)", "/src/screens/InstructorScreen.tsx", { screen: "instructor", dark: true, lang: "ar", courseId: "CS301" }],
  ["CourseWorkspace assignments", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: false, lang: "en", courseId: "CS301", tab: "assignments" }],
  ["CourseWorkspace assignments(dark/ar)", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: true, lang: "ar", courseId: "CS401", tab: "assignments" }],
  ["AssignmentCreate(dark)", "/src/screens/instructor/AssignmentCreateScreen.tsx", { screen: "assignment-create", dark: true, lang: "en", courseId: "CS301" }],
  ["CourseWorkspace analytics", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: false, lang: "en", courseId: "CS401", tab: "analytics" }],
  ["CourseWorkspace analytics(dark/CS301)", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: true, lang: "en", courseId: "CS301", tab: "analytics" }],
  ["CourseWorkspace audit(dark/ar)", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: true, lang: "ar", courseId: "CS301", tab: "audit" }],
  ["CourseWorkspace audit", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: false, lang: "en", courseId: "CS301", tab: "audit" }],
  ["AssignmentCreate", "/src/screens/instructor/AssignmentCreateScreen.tsx", { screen: "assignment-create", dark: false, lang: "en", courseId: "CS301" }],
  ["AssignmentReview", "/src/screens/instructor/AssignmentReviewScreen.tsx", { screen: "assignment-review", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-hash" }],
  ["AssignmentReview(closed)", "/src/screens/instructor/AssignmentReviewScreen.tsx", { screen: "assignment-review", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-quiz" }],
  ["StudentAssignments", "/src/screens/student/StudentAssignmentsScreen.tsx", { screen: "student-assignments", dark: false, lang: "en" }],
  ["StudentAssignments(personal)", "/src/screens/student/StudentAssignmentsScreen.tsx", { screen: "student-assignments", dark: false, lang: "en", personalOnly: true }],
  ["StudentAssignment(draft)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-bst" }],
  ["StudentAssignment(resubmit)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-hash" }],
  ["StudentAssignment(closed)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-quiz" }],
];

let failed = 0;
for (const [name, path, state] of cases) {
  try {
    const mod = await load(path);
    const Screen = mod.default;
    const html = renderToString(
      React.createElement(InstructorModuleProvider, null,
        React.createElement(Screen, { state, setState: () => {} })),
    );
    console.log(`OK   ${name} (${html.length} bytes)`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${name}: ${err && err.message}`);
  }
}
await server.close();
process.exit(failed ? 1 : 0);
