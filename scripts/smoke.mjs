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
  ["CourseWorkspace materials", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: false, lang: "en", courseId: "CS301", tab: "materials" }],
  ["CourseWorkspace materials(dark/ar)", "/src/screens/instructor/CourseWorkspaceScreen.tsx", { screen: "course-workspace", dark: true, lang: "ar", courseId: "CS401", tab: "materials" }],
  ["AssignmentCreate", "/src/screens/instructor/AssignmentCreateScreen.tsx", { screen: "assignment-create", dark: false, lang: "en", courseId: "CS301" }],
  ["AssignmentReview", "/src/screens/instructor/AssignmentReviewScreen.tsx", { screen: "assignment-review", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-hash" }],
  ["AssignmentReview(closed)", "/src/screens/instructor/AssignmentReviewScreen.tsx", { screen: "assignment-review", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-quiz" }],
  ["StudentAssignments", "/src/screens/student/StudentAssignmentsScreen.tsx", { screen: "student-assignments", dark: false, lang: "en" }],
  ["StudentAssignments(personal)", "/src/screens/student/StudentAssignmentsScreen.tsx", { screen: "student-assignments", dark: false, lang: "en", personalOnly: true }],
  ["StudentAssignment(draft)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-bst" }],
  ["StudentAssignment(resubmit)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-hash" }],
  ["StudentAssignment(closed)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-quiz" }],
  ["StudentAssignment(submitted/d9)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: false, lang: "en", courseId: "CS401", assignmentId: "as-sched" }],
  ["StudentAssignment(resubmit/dark/ar)", "/src/screens/student/StudentAssignmentScreen.tsx", { screen: "student-assignment", dark: true, lang: "ar", courseId: "CS301", assignmentId: "as-hash" }],
  ["StudentAssignments(dark/ar)", "/src/screens/student/StudentAssignmentsScreen.tsx", { screen: "student-assignments", dark: true, lang: "ar" }],
  ["ContentStudio", "/src/screens/instructor/ContentStudioScreen.tsx", { screen: "content-studio", dark: false, lang: "en", courseId: "CS301" }],
  ["ContentStudio(dark/ar)", "/src/screens/instructor/ContentStudioScreen.tsx", { screen: "content-studio", dark: true, lang: "ar", courseId: "CS401" }],
  ["Students roster", "/src/screens/instructor/StudentsScreen.tsx", { screen: "students", dark: false, lang: "en", courseId: "CS301" }],
  ["Students roster(dark/ar)", "/src/screens/instructor/StudentsScreen.tsx", { screen: "students", dark: true, lang: "ar", courseId: "CS301" }],
  ["Student file", "/src/screens/instructor/StudentsScreen.tsx", { screen: "students", dark: false, lang: "en", courseId: "CS301", studentId: "st-moh" }],
  ["Student file(dark/ar)", "/src/screens/instructor/StudentsScreen.tsx", { screen: "students", dark: true, lang: "ar", courseId: "CS401", studentId: "st-lina" }],
  ["AuditorHome", "/src/screens/instructor/AuditorHomeScreen.tsx", { screen: "auditor-home", dark: false, lang: "en", courseId: "CS301" }],
  ["AuditorHome(dark/ar)", "/src/screens/instructor/AuditorHomeScreen.tsx", { screen: "auditor-home", dark: true, lang: "ar", courseId: "CS401" }],
];

const { AdminStoreProvider } = await load("/src/store/AdminStore.tsx");

const adminCases = [
  ["AdminHealth", "/src/screens/admin/AdminHealthScreen.tsx", { screen: "admin-health", dark: false, lang: "en" }],
  ["AdminHealth(dark/ar)", "/src/screens/admin/AdminHealthScreen.tsx", { screen: "admin-health", dark: true, lang: "ar" }],
  ["AdminUsers", "/src/screens/admin/AdminUsersScreen.tsx", { screen: "admin-users", dark: false, lang: "en" }],
  ["AdminUsers(dark/ar)", "/src/screens/admin/AdminUsersScreen.tsx", { screen: "admin-users", dark: true, lang: "ar" }],
  ["AdminOfficers", "/src/screens/admin/AdminOfficersScreen.tsx", { screen: "admin-officers", dark: false, lang: "en" }],
  ["AdminOfficers(dark/ar)", "/src/screens/admin/AdminOfficersScreen.tsx", { screen: "admin-officers", dark: true, lang: "ar" }],
  ["AdminBulkImport", "/src/screens/admin/AdminBulkImportScreen.tsx", { screen: "admin-bulk-import", dark: false, lang: "en" }],
  ["AdminBulkImport(dark/ar)", "/src/screens/admin/AdminBulkImportScreen.tsx", { screen: "admin-bulk-import", dark: true, lang: "ar" }],
  ["AdminRequests", "/src/screens/admin/AdminRequestsScreen.tsx", { screen: "admin-requests", dark: false, lang: "en" }],
  ["AdminRequests(dark/ar)", "/src/screens/admin/AdminRequestsScreen.tsx", { screen: "admin-requests", dark: true, lang: "ar" }],
  ["AdminLinkAccounts", "/src/screens/admin/AdminLinkAccountsScreen.tsx", { screen: "admin-link-accounts", dark: false, lang: "en" }],
  ["AdminLinkAccounts(dark/ar)", "/src/screens/admin/AdminLinkAccountsScreen.tsx", { screen: "admin-link-accounts", dark: true, lang: "ar" }],
  ["AdminSettings", "/src/screens/admin/AdminSettingsScreen.tsx", { screen: "admin-settings", dark: false, lang: "en" }],
  ["AdminSettings(dark/ar)", "/src/screens/admin/AdminSettingsScreen.tsx", { screen: "admin-settings", dark: true, lang: "ar" }],
  ["AdminAudit", "/src/screens/admin/AdminAuditScreen.tsx", { screen: "admin-audit", dark: false, lang: "en" }],
  ["AdminAudit(dark/ar)", "/src/screens/admin/AdminAuditScreen.tsx", { screen: "admin-audit", dark: true, lang: "ar" }],
  ["AdminAnalytics", "/src/screens/admin/AdminAnalyticsScreen.tsx", { screen: "admin-analytics", dark: false, lang: "en" }],
  ["AdminAnalytics(dark/ar)", "/src/screens/admin/AdminAnalyticsScreen.tsx", { screen: "admin-analytics", dark: true, lang: "ar" }],
  ["StudentBrowseCourses", "/src/screens/student/StudentBrowseCoursesScreen.tsx", { screen: "student-browse-courses", dark: false, lang: "en" }],
  ["StudentBrowseCourses(dark/ar)", "/src/screens/student/StudentBrowseCoursesScreen.tsx", { screen: "student-browse-courses", dark: true, lang: "ar" }],
  ["StudentBrowseCourses(personal)", "/src/screens/student/StudentBrowseCoursesScreen.tsx", { screen: "student-browse-courses", dark: false, lang: "en", personalOnly: true }],
];

let failed = 0;
for (const [name, path, state] of cases) {
  try {
    const mod = await load(path);
    const Screen = mod.default;
    const html = renderToString(
      React.createElement(InstructorModuleProvider, null,
        React.createElement(AdminStoreProvider, null,
          React.createElement(Screen, { state, setState: () => {} }))),
    );
    console.log(`OK   ${name} (${html.length} bytes)`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${name}: ${err && err.message}`);
  }
}
for (const [name, path, state] of adminCases) {
  try {
    const mod = await load(path);
    const Screen = mod.default;
    const html = renderToString(
      React.createElement(AdminStoreProvider, null,
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
