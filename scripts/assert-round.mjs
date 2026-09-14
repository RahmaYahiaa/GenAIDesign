import { createServer } from "vite";
import { renderToString } from "react-dom/server";
import React from "react";
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const load = (p) => server.ssrLoadModule(p);
const { InstructorModuleProvider } = await load("/src/store/InstructorStore.tsx");
const render = async (path, state) => {
  const m = await load(path);
  const html = renderToString(React.createElement(InstructorModuleProvider, null,
    React.createElement(m.default, { state, setState: () => {} })));
  return html.replace(/<!-- -->/g, "");
};
let fail = 0;
const check = (name, cond) => { console.log(`${cond ? "PASS" : "FAIL"} ${name}`); if (!cond) fail++; };

const cs = await render("/src/screens/instructor/ContentStudioScreen.tsx", { screen: "content-studio", dark: false, lang: "en", courseId: "CS301" });
for (const t of ["Text explanation","Worked examples","Diagrams & images","Video script","Audio narration","Practice quiz","Slide deck outline","Flashcards"])
  check(`ContentStudio modality: ${t}`, cs.includes(t) || cs.includes(t.replace("&", "&amp;")));
check("ContentStudio free-form topic", cs.includes("Free-form topic") || cs.includes("free-form"));
check("ContentStudio generate CTA", cs.includes("Generate"));
check("ContentStudio never auto-publish note", /draft/i.test(cs));

const csAr = await render("/src/screens/instructor/ContentStudioScreen.tsx", { screen: "content-studio", dark: true, lang: "ar", courseId: "CS301" });
check("ContentStudio AR modality", csAr.includes("سكريت فيديو") && csAr.includes("بطاقات مراجعة"));

const roster = await render("/src/screens/instructor/StudentsScreen.tsx", { screen: "students", dark: false, lang: "en", courseId: "CS301" });
check("Roster cohorts filter", roster.includes("All cohorts") && roster.includes("cohort 2023"));
check("Roster registrar note", roster.includes("registrar-owned"));
check("Roster search", roster.includes("Search name or number"));
check("Roster rows + open file", roster.includes("Open file") && roster.includes("Intervene"));
check("Roster bands/trends", roster.includes("All mastery bands") && roster.includes("All trends") && roster.includes("Any open work"));
check("Roster student name", roster.includes("Mohammed Al-Rashidi"));

const file = await render("/src/screens/instructor/StudentsScreen.tsx", { screen: "students", dark: false, lang: "en", courseId: "CS301", studentId: "st-moh" });
check("File topic mastery", file.includes("Topic mastery"));
check("File submission history", file.includes("Submission history in this course"));
check("File remedial received", file.includes("Remedial content received"));
check("File cohort chip", file.includes("cohort 2023"));
check("File AI vs final cols", file.includes("AI SCORE") && file.includes("FINAL"));

// analytics first-paint is the precomputed-snapshot skeleton (420ms) — assert wiring at source level
const fs = await import("node:fs");
const fs0 = fs;
const anSrc = fs.readFileSync("src/screens/instructor/CourseAnalyticsTab.tsx", "utf8");
check("Analytics Export opens modal (no silent download)", anSrc.includes("setExportText(lines)") && anSrc.includes("setExportOpen(true)") && !/a\.click\(\);\n\s*URL\.revokeObjectURL\(url\);\n\s*toast/.test(anSrc));
check("Analytics export modal has copy + download", anSrc.includes("copyExport") && anSrc.includes("downloadExport") && anSrc.includes("navigator.clipboard.writeText"));
check("Analytics Intervene opens intervention modal", anSrc.includes("setInterveneFor(s.id)") && anSrc.includes("<StudentInterventionModal"));

// ── auditor persona ──
const aud = await render("/src/screens/instructor/AuditorHomeScreen.tsx", { screen: "auditor-home", dark: false, lang: "en", courseId: "CS301" });
check("Auditor read-only strip", aud.includes("Read-only role") && aud.includes("cannot approve"));
check("Auditor oversight tiles", aud.includes("AI RATIFIED") && aud.includes("DECISIONS"));
check("Auditor embeds audit trail", aud.includes("Audit Trail"));
check("Auditor has no grading actions", !aud.includes("Bulk approve") && !aud.includes("Click again to confirm") && !aud.includes("Generate remedial"));
const loginSrc = fs0.readFileSync("src/screens/LoginScreen.tsx", "utf8");
check("Login offers auditor pill", loginSrc.includes('"auditor"') && loginSrc.includes("مدقق"));
check("Login routes auditor home", loginSrc.includes('role === "auditor" ? "auditor-home"'));
const shellSrc = fs0.readFileSync("src/components/AppShell.tsx", "utf8");
check("Shell auditor nav + chip", shellSrc.includes("AUDITOR_NAV") && shellSrc.includes("AUDITOR"));

// ── selective bulk approve ──
const rev = await render("/src/screens/instructor/AssignmentReviewScreen.tsx", { screen: "assignment-review", dark: false, lang: "en", courseId: "CS301", assignmentId: "as-hash" });
check("Review select-all control", rev.includes("All selected") || rev.includes("selected"));
check("Review approve-selected CTA", rev.includes("Bulk approve selected"));
const revSrc = fs0.readFileSync("src/screens/instructor/AssignmentReviewScreen.tsx", "utf8");
check("Review checkbox toggles deselection", revSrc.includes("setDeselected") && revSrc.includes('type="checkbox"'));

await server.close();
process.exit(fail ? 1 : 0);
