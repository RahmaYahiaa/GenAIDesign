# Instructor Workspace — FRD traceability

> **Rebuild status (reference-screenshot pass):** COMPLETE — Parts 1–7.
> Home = d1/d2 · Workspace shell + Assignments + Builder = d3/d8 · Review +
> submission modal = d4/d5/d12 · Remedial **modal** (was a drawer) = d10/d11 ·
> Analytics = d6/d13 (materials modal lives under "Open materials") ·
> Audit = d7 (five columns, no filters) · Student side = d9 (all questions
> stacked, read-only after submit, single submit action) + inbox cards.
> UX pass: toast bus, two-step confirms (no window.confirm), Esc/X/scroll on
> modals, focus-visible rings. Scope rule intact: personal courses expose no
> assignment affordance at all; the student sidebar keeps its FRD-compliant
> "Assignments" item (reference build entered it elsewhere).
>
> **Spec-gap pass (full brief §4–§8):** shared `AIGradingResultCard` (score +
> correctness + confidence + feedback + misconceptions + rubric breakdown +
> sources) used by builder preview AND submission review; correctness badge;
> builder gains edit mode, Save-as-draft (assignment status `draft`, hidden
> from students), Open/Closed toggle in edit, "Improve AI grading accuracy"
> section with never-visible note, low-confidence hint, loading skeleton for
> the preview call; review gains filters (name/confidence/reviewed),
> misconception share bars, attempt timeline, collapsible model answer &
> rubric, zoomable attachments, auto-advance to next submission; remedial
> gains Draft badge + two-step publish; audit gains filters (assignment /
> type / date range) + decision-mix insight bar; home gains the calm
> empty state; workspace header gains the coverage-gap badge; analytics
> shows a brief precomputed-snapshot skeleton; mobile media queries stack
> the builder/analytics grids and full-width modals.

Build note for the module specified in `GenAI-Instructor-Module-FRD.pdf`. Everything below is
implemented on top of the existing design system **as-is**: same `tokens.ts` cobalt ladder, same
`SharedUI`/`Icons` language, same `AppShell` icon sidebar, EN/AR + RTL, light/dark. No traffic-light
colours, no emojis, no new visual vocabulary for confidence or mastery.

Run: `npm install && npm run dev` (port 8443 by default, or `PORT=3000 npm run dev`).
Smoke test (SSR render of every screen/state): `node scripts/smoke.mjs`.

## Where things live

| Path | Purpose |
| --- | --- |
| `src/data/instructorModule.ts` | Types, seed data, and `evaluateAnswer()` — the single AI evaluation pipeline used by Preview **and** real submissions (FR-AC-09) |
| `src/store/InstructorStore.tsx` | Module store: every action writes audit entries (FR-AUDIT-01/02) and refreshes the precomputed analytics stamp (FR-ANALYTICS-02) |
| `src/components/ModuleUI.tsx` | Module primitives: `Card/Btn/Chip/Tabs/Modal/Drawer/Field/Th`, `ConfidencePill`, `ScoreValue`, `Toggle`, `VisibilityControl`, `StatusPill`, `AlertStrip` |
| `src/components/RemedialPanel.tsx` | Remedial content generation — one panel, two entry points (FR-CONTENT-01) |
| `src/screens/instructor/*` | Home, Course Workspace (tabs), Create, Review, Remedial studio |
| `src/screens/student/*` | Student inbox + submission/resubmission experience |

## Screen → requirement map

| Screen / state | FRD |
| --- | --- |
| `InstructorHomeScreen` — urgency-ordered courses, attention-only banner, per-card pending count + unaddressed-pattern alert + coverage alert | FR-HOME-01…05 |
| `CourseWorkspaceScreen` → **Assignments** tab — list w/ status, received, pending, topic count; manual Close/Reopen; New assignment | FR-AC-05/06/07 |
| `AssignmentCreateScreen` — form, repeatable questions, hidden reference answer, free-text rubric, visibility toggle (default off, "changeable later" caption), Preview drawer on the real pipeline, Publish → Open | FR-AC-01…04, 08, 09, 10; FR-VIS-05 |
| `AssignmentReviewScreen` — Common Errors Summary first (count + %, remedial action, plain "no pattern" statement), Ready-for-quick-approval + Bulk Approve (one confirmation, still reopenable), Needs-your-review, finalized history; detail view with attempt switcher (latest-only actions) and Approve / Edit / Reject / Request-resubmission | FR-ERR-01…03; FR-REV-01…08; FR-RESUB-01/02 |
| Score visibility — live toggle on create + review headers; off-confirmation names affected students; student sees a score only when final **and** currently visible | FR-VIS-01…05 |
| `RemedialPanel` / `RemedialStudioScreen` — misconception-seeded or standalone; explanation+worked-example or practice; editable draft; audience all / affected (default when applicable) / manual | FR-CONTENT-01…06 |
| `CourseAnalyticsTab` — "as of" stamp, class mastery distribution in the student-view ladder language, topics ranked most→least problematic with remedial action, bounded attention list behind course-scoped authorization, coverage alerts linking straight to upload | FR-ANALYTICS-01…05; FR-COVERAGE-01/02 |
| `AuditTrailTab` — date/time, action type, original AI score, final score, instructor; visibility before→after; resubmission reasons | FR-AUDIT-01…04 |
| `StudentAssignmentsScreen` / `StudentAssignmentScreen` — free question navigation, text + optional image, continuous draft auto-save, single submit, "Under review" with no score, closed ⇒ submit disabled, resubmission pre-fills the prior answer beside the instructor's reason and creates Attempt 2+ | FR-SUB-01…06; FR-RESUB-04/05/06 |
| Scope rule — personal-only accounts get **no** Assignments nav item, no tab, nothing (Profile carries a demo account-type switch) | FR-SCOPE-01…03 |

## Visual conventions introduced (consistent with existing language)

- **Provisional vs final score**: AI suggestions render as a *dashed* periwinkle chip labelled
  `AI SUGGESTED`; finalized scores render as a *solid* cobalt chip labelled `FINAL`. Never ambiguous.
- **Confidence**: same pill treatment as the Tutor's grounded/insufficient bar —
  high→cobalt, medium→periwinkle, low→violet, insufficient_evidence→slate + warning glyph.
- **Mastery**: untouched `masteryLevel/masteryColor/MasteryBar/MasteryPill` from `tokens.ts`.

## Round: Content Studio, Students section, Export/Intervene fixes (post-spec-gap)

| Addition | Notes |
| --- | --- |
| `ContentStudioScreen` (sidebar: **Content Studio**, sparkle icon) | AI-tutor-style generation for the instructor: course + topic select **or free-form topic**; 8 modalities — text explanation, worked examples, diagrams & images, video script, audio narration, practice quiz, slide deck outline, flashcards; length/tone/extra-instruction controls; deterministic draft after a brief generation state; editable before use. **Nothing is auto-published** — "Add to course materials" only works for course-mapped topics; free-form output stays a saveable draft. |
| `StudentsScreen` (sidebar: **Students**, per course) | Roster with search (name/number) + filters: **cohort/year**, mastery band, trend, open-work state. Row → **Open file**: snapshot tiles, per-topic mastery bars (`studentTopicMastery`), submission history in this course (AI vs final score, status, date), remedial content received, Intervene button. Roster & cohort membership are **registrar/admin-owned** — the instructor view is read-only by design and says so in the header. |
| `StudentInfo.cohort` + `studentTopicMastery()` | Seed cohorts 2022–2024; per-topic mastery derived from the student's gap list + averages (deterministic, demo-only). |
| Export Report fix | The old flow fired a silent `a.click()` blob download — invisible inside the sandboxed preview iframe, so the button looked dead. Export now opens a modal with the full report text + explicit **Copy** and **Download .txt** buttons (clipboard/anchor failures fall back to a guidance toast). |
| Intervene fix | Was a toast only. Now opens `StudentInterventionModal`: snapshot tiles, primary gaps with mastery %, shortcut to generate remedial content for the top gap (→ `RemedialModal`, still draft-then-publish), "Open student file" navigation, and an outreach note that queues visibly. Used from both Analytics and the Students screen. |

Governance decision: enrolment/cohort changes each academic year are an **admin/registrar** responsibility; the instructor module exposes only a read-only cohort filter (surfaced as a note in the Students header).

## Round: Auditor persona + selective bulk approve

| Addition | Notes |
| --- | --- |
| Auditor role (4th login pill) | Read-only oversight persona (Dr. Hala Zaydan — Quality Assurance). Login: Student / Instructor / Admin / **Auditor** (2×2 grid); auditor signs into `AuditorHomeScreen` — course selector, oversight tiles (decisions, AI-ratified %, edits, rejects, resubmits) and the full embedded audit trail with its filters + decision-mix insight. A permanent read-only strip states the contract: no approve/edit/reject/publish/visibility powers anywhere; the audit trail is never shown to students. AppShell gains an `auditor` role (own nav, "AUDITOR" chip, QA identity in the top bar). |
| Selective bulk approve | Quick-approval rows now carry checkboxes. Absent = selected, so the default flow stays "approve all high-confidence items" with one confirmation; untick to exclude. Select-all/clear header row, dimmed excluded rows, and the CTA counts the selection (`Bulk approve selected N`, disabled at 0). Still one confirmation, still reopenable via the audit trail. |
