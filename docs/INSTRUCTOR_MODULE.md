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
