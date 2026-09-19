# Institution Admin Module — Design Traceability (ملحق وحدة إدارة المؤسسة)

Design-stage mapping of the spec appendix items (FR-ADM-01 … FR-ADM-12) to
screens, data and store. Mirrors `docs/INSTRUCTOR_MODULE.md` conventions:
screens in `src/screens/admin/`, domain model in `src/data/adminModule.ts`,
actions in `src/store/AdminStore.tsx`. Every administrative action appends to
the institution audit log (FR-ADM-10).

Philosophy from the spec: the admin is a **rare visitor** with high
setup-density — every screen optimises for fast institution setup and a clear
read on institution state, not daily work.

## Item → screen map

| # | Spec item | Where in this design | Status |
|---|-----------|----------------------|--------|
| 1 | Delegated-permissions model (templates + custom scopes, separate permissions table) | `adminModule.ts` `PermissionKey`, `OFFICER_TEMPLATES`, `officerPermissionsOf`; `AdminOfficersScreen` + shared `OfficerScopeEditor` reused in the users drawer | **Designed** |
| 2 | User management (activate/deactivate, role change, officer permissions) | `AdminUsersScreen` + store actions `toggleUserActive`, `changeUserKind` | **Designed** |
| 3 | Bulk import (invitations not accounts, preview summary, per-row error handling) | `AdminBulkImportScreen` — real CSV parse / sample file, preview → confirm → invitations with aging | **Designed** |
| 4 | Academic / employee number (optional, manual verification, never blocks login) | `AdminUser.academicNumber`, editable in the user drawer | **Designed** |
| 5 | Out-of-year enrollment request with proofs (admin-only decision, auto-enroll on accept) | `AdminRequestsScreen` (proof drawer, rejection requires a reason) + student form in `StudentBrowseCoursesScreen` feeding the same queue via `submitRequest` | **Designed** |
| 6 | Browse all faculty courses (student side, feeds item 5) | `StudentBrowseCoursesScreen` — `COURSE_CATALOG`, instant same-year enroll, year/search filters | **Designed** |
| 7 | Retroactive individual-account linking (consent-based, personal courses untouched, personal-course creation blocked afterwards with an explanatory message) | `AdminLinkAccountsScreen` (candidates, consent-gated invitations) + consent banner & blocked personal-course card in `StudentBrowseCoursesScreen` (personal mode) | **Designed** |
| 8 | Institution settings (`emailDomains`, `allowSelfRegistration`, doctor course-creation lever, `allowedSupplementalSourceTypes`) | `AdminSettingsScreen` — save-on-the-spot toggles | **Designed** |
| 9 | Academic structure — covered by a previous design; no changes in this appendix | — | Out of scope |
| 10 | Institution audit log (separate data model, scope-limited visibility, super admin sees all) | `AdminAuditScreen` — `visibleAudit` scope filter, text search, merged scope dropdown, calendar-period dropdown | **Designed** |
| 11 | Institution health overview (pending requests, unaccepted invitations aging, zero-material courses, contract status, officer activity) | `AdminHealthScreen` + `health` selector | **Designed** |
| 12 | Platform-wide analytics (faculty comparison, active-doctor usage, coverage gaps, cost-tied usage — precomputed, not real-time) | `AdminAnalyticsScreen` — faculty bars, coverage-gap ranking, usage/cost tiles | **Designed** |

## Backend-exists vs gap (from the spec's conflict matrix)

Already implemented in the real backend (design mirrors, does not reinvent):
`user.isActive` login block · institution `isActive` contract block ·
`registrationGuidance` domain detection · rejecting individual-track emails of
an active contracted institution · blocking institutional students from
creating personal courses · the `enroll` mechanism reused by items 3 and 5.

Gaps the appendix introduces (design-first, implementation after design
sign-off): permissions table · users admin endpoints · invitations/import ·
academic/employee number field · out-of-year request flow · browse-all-courses
permission · link-consent flow · admin settings UI · institution audit model ·
platform analytics pipeline (precomputed).

## Batch status

- **Batch 1 (pushed):** module frame (`data`, `store`, nav, login entry),
  `AdminHealthScreen`, `AdminUsersScreen`, smoke coverage.
- **Batch 2 (pushed):** `AdminOfficersScreen` (add officer from template,
  shared `OfficerScopeEditor` reused in the users drawer),
  `AdminBulkImportScreen` (file/sample → preview new/existing/errors →
  confirm → invitations with aging signal; history strip).
- **Batch 3 (pushed):** `AdminRequestsScreen` (out-of-year queue with proof
  previews in a decision drawer; rejection requires a reason),
  `AdminLinkAccountsScreen` (domain-matched candidates, consent-gated
  invitations, declined stays visible),
  `AdminSettingsScreen` (email domains, self-registration, doctor
  course-creation lever, supplemental source policy — all save-on-the-spot).
- **Batch 4 (pushed):** `AdminAuditScreen` (scope-filtered event log — the
  store hands every viewer only the events his permissions cover,
  search + merged scope dropdown + calendar-period dropdown),
  `AdminAnalyticsScreen` (precomputed snapshot: faculty table with activity
  and mastery bars, coverage-gap ranking, usage/cost tiles).
- **Batch 5 (pushed):** `StudentBrowseCoursesScreen` (student side of
  FR-ADM-05/06/07 — full catalog browse, instant same-year enroll, proof
  request drawer feeding the admin queue live via `submitRequest`, "my
  requests" statuses, link-consent banner + blocked personal-course message
  for personal accounts on approved domains). Sarah Al-Rashidi unified as
  the demo student across instructor/admin/student modules.

Run the render check with `node scripts/smoke.mjs` after any change.
