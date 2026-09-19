// ─────────────────────────────────────────────────────────────────────────────
// Institution Admin Module — types, seed and rules mirror the spec appendix
// "ملحق وحدة إدارة المؤسسة" item by item (FR-ADM-xx). Design-stage data only.
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = "en" | "ar";

// ─── 1. Delegated-permissions model (FR-ADM-01) ─────────────────────────────
// The backend role enum keeps its single "institution_admin" value; scopes
// live in a separate permissions table so templates never touch the core role.
export type PermissionKey =
  | "users.view"
  | "users.manage"
  | "bulk.import"
  | "requests.review"
  | "accounts.link"
  | "settings.manage"
  | "audit.view"
  | "analytics.view";

export const PERMISSION_LABELS: Record<PermissionKey, { en: string; ar: string }> = {
  "users.view": { en: "View institution users", ar: "عرض مستخدمي المؤسسة" },
  "users.manage": { en: "Activate / deactivate & change roles", ar: "تفعيل وتعطيل وتغيير الأدوار" },
  "bulk.import": { en: "Run bulk invitation imports", ar: "تشغيل الإدخال الجماعي" },
  "requests.review": { en: "Decide out-of-year enrollment requests", ar: "البت في طلبات التسجيل خارج السنة" },
  "accounts.link": { en: "Send individual-account link invitations", ar: "إرسال دعوات ربط الحسابات الفردية" },
  "settings.manage": { en: "Edit institution settings", ar: "تعديل إعدادات المؤسسة" },
  "audit.view": { en: "View audit events within own scope", ar: "عرض أحداث التدقيق داخل النطاق" },
  "analytics.view": { en: "View platform-wide analytics", ar: "عرض تحليلات المنصة" },
};

export interface OfficerTemplate {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  permissions: PermissionKey[];
}

export const OFFICER_TEMPLATES: OfficerTemplate[] = [
  {
    id: "tpl-admissions",
    name: { en: "Admissions officer", ar: "مسؤول قبول" },
    description: {
      en: "Approves out-of-year enrollment requests, runs bulk invitations and links individual accounts.",
      ar: "يوافق على طلبات التسجيل خارج السنة ويشغّل الإدخال الجماعي ويربط الحسابات الفردية.",
    },
    permissions: ["users.view", "bulk.import", "requests.review", "accounts.link", "audit.view"],
  },
  {
    id: "tpl-content",
    name: { en: "Content officer", ar: "مسؤول محتوى" },
    description: {
      en: "Watches coverage gaps and AI-grounding policy across the whole academic structure.",
      ar: "يتابع فجوات التغطية وسياسة المصادر على مستوى الهيكل الأكاديمي كله.",
    },
    permissions: ["users.view", "settings.manage", "analytics.view", "audit.view"],
  },
];

// ─── Users (FR-ADM-02) ──────────────────────────────────────────────────────
export type AdminUserKind = "student" | "doctor" | "officer";
export type AccountType = "institutional" | "individual";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kind: AdminUserKind;
  accountType: AccountType;
  isActive: boolean;
  /** FR-ADM-04 — optional; academic number for students, employee number for doctors. */
  academicNumber?: string;
  isSuperAdmin?: boolean;
  officerTemplateId?: string;
  /** Customised permission set (template edited manually by the super admin). */
  officerPermissions?: PermissionKey[];
  faculty?: string;
  department?: string;
  year?: number;
  lastActiveAt: string;
  personalCourses?: number;
}

// ─── 3. Bulk import (FR-ADM-03) — invitations, never live accounts ─────────
export type ImportRole = "student" | "doctor";
export type RowVerdict = "new" | "existing" | "error";

export interface ImportRowPreview {
  row: number;
  firstName: string;
  lastName: string;
  email: string;
  role: ImportRole | "";
  courseCodes: string[];
  academicNumber?: string;
  verdict: RowVerdict;
  errorReason?: { en: string; ar: string };
}

export interface ImportBatch {
  id: string;
  fileName: string;
  uploadedAt: string;
  rows: ImportRowPreview[];
  confirmed: boolean;
}

export type InvitationStatus = "pending" | "accepted" | "revoked";
export interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: ImportRole;
  courseCode: string;
  status: InvitationStatus;
  sentAt: string;
  acceptedAt?: string;
}

// ─── 5. Out-of-year enrollment requests (FR-ADM-05) ─────────────────────────
export type RequestStatus = "pending" | "accepted" | "rejected";
export interface ProofAttachment {
  id: string;
  name: string;
  kind: "image" | "file";
}

export interface OutOfYearRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentYear: number;
  courseCode: string;
  courseTitle: { en: string; ar: string };
  courseYear: number;
  reason: string;
  attachments: ProofAttachment[];
  status: RequestStatus;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNote?: string;
}

// ─── 7. Individual-account linking (FR-ADM-07) ──────────────────────────────
export interface LinkCandidate {
  userId: string;
  email: string;
  studentName: string;
  personalCourses: number;
  domain: string;
}

export type LinkInviteStatus = "awaiting-consent" | "linked" | "declined";
export interface LinkInvitation {
  id: string;
  userId: string;
  email: string;
  studentName: string;
  domain: string;
  status: LinkInviteStatus;
  sentAt: string;
  respondedAt?: string;
}

// ─── 8. Institution settings (FR-ADM-08) ────────────────────────────────────
export interface InstitutionSettings {
  institutionName: { en: string; ar: string };
  isActive: boolean;
  contractEndsAt: string;
  emailDomains: string[];
  allowSelfRegistration: boolean;
  /** Separate from the source-type policy below: this gates creating the
   *  course shell itself; the policy below governs what may be uploaded
   *  inside an existing course. */
  allowDoctorCourseCreation: boolean;
  allowedSupplementalSourceTypes: string[];
}

export const SUPPLEMENTAL_SOURCE_TYPES: { id: string; label: { en: string; ar: string } }[] = [
  { id: "pdf", label: { en: "PDF documents", ar: "ملفات PDF" } },
  { id: "link", label: { en: "External links", ar: "روابط خارجية" } },
  { id: "video", label: { en: "Video lectures", ar: "محاضرات مرئية" } },
  { id: "slides", label: { en: "Slide decks", ar: "عروض تقديمية" } },
  { id: "spreadsheet", label: { en: "Spreadsheets", ar: "جداول بيانات" } },
];

// ─── 6. Institution course catalog — what students browse (FR-ADM-06) ───────
export interface CatalogCourse {
  code: string;
  title: { en: string; ar: string };
  department: { en: string; ar: string };
  year: number;
  doctor: string;
}

export const COURSE_CATALOG: CatalogCourse[] = [
  { code: "CS101", title: { en: "Structured Programming", ar: "البرمجة الهيكلية" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 1, doctor: "Dr. Hassan Farid" },
  { code: "CS120", title: { en: "Digital Logic Design", ar: "تصميم المنطق الرقمي" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 1, doctor: "Dr. Khaled Nofal" },
  { code: "IS140", title: { en: "Introduction to Databases", ar: "مدخل قواعد البيانات" }, department: { en: "Information Systems", ar: "نظم المعلومات" }, year: 1, doctor: "Dr. Nadia Al-Manea" },
  { code: "CS201", title: { en: "Discrete Mathematics", ar: "الرياضيات المتقطعة" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 2, doctor: "Dr. Hassan Farid" },
  { code: "CS202", title: { en: "Object-Oriented Programming", ar: "البرمجة كائنية التوجه" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 2, doctor: "Dr. Nadia Al-Manea" },
  { code: "CS301", title: { en: "Data Structures & Algorithms", ar: "هياكل البيانات والخوارزميات" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 3, doctor: "Dr. Nadia Al-Manea" },
  { code: "CS302", title: { en: "Operating Systems", ar: "نظم التشغيل" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 3, doctor: "Dr. Hassan Farid" },
  { code: "CS303", title: { en: "Computer Networks", ar: "شبكات الحاسب" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 3, doctor: "Dr. Khaled Nofal" },
  { code: "CS401", title: { en: "Distributed Systems", ar: "الأنظمة الموزعة" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 4, doctor: "Dr. Hassan Farid" },
  { code: "CS402", title: { en: "Software Engineering", ar: "هندسة البرمجيات" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 4, doctor: "Dr. Nadia Al-Manea" },
  { code: "CS450", title: { en: "Compiler Design", ar: "تصميم المترجمات" }, department: { en: "Computer Science", ar: "علوم الحاسب" }, year: 4, doctor: "Dr. Hassan Farid" },
];

// ─── 10. Institution audit log (FR-ADM-10) ──────────────────────────────────
export type AuditEventType =
  | "user.deactivated"
  | "user.activated"
  | "role.changed"
  | "permissions.changed"
  | "officer.added"
  | "bulk.imported"
  | "request.decided"
  | "settings.changed"
  | "structure.changed"
  | "account.linked";

export const AUDIT_TYPE_LABELS: Record<AuditEventType, { en: string; ar: string }> = {
  "user.deactivated": { en: "Account deactivated", ar: "تعطيل حساب" },
  "user.activated": { en: "Account activated", ar: "تفعيل حساب" },
  "role.changed": { en: "Role changed", ar: "تغيير دور" },
  "permissions.changed": { en: "Officer permissions edited", ar: "تعديل صلاحيات مسؤول" },
  "officer.added": { en: "Officer added", ar: "إضافة مسؤول" },
  "bulk.imported": { en: "Bulk import executed", ar: "تنفيذ إدخال جماعي" },
  "request.decided": { en: "Out-of-year request decided", ar: "البت في طلب خارج السنة" },
  "settings.changed": { en: "Institution settings changed", ar: "تعديل إعدادات المؤسسة" },
  "structure.changed": { en: "Academic structure changed", ar: "تعديل الهيكل الأكاديمي" },
  "account.linked": { en: "Individual account linked", ar: "ربط حساب فردي" },
};

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actorId: string;
  actorName: string;
  /** Scope the event belongs to — officers only see events inside their own. */
  scope: PermissionKey;
  at: string;
  summary: { en: string; ar: string };
  detail?: { en: string; ar: string };
}

// ─── 12. Platform-wide analytics (FR-ADM-12) — precomputed ─────────────────
export interface FacultyAnalyticsRow {
  id: string;
  name: { en: string; ar: string };
  doctors: number;
  activeDoctors: number;
  students: number;
  courses: number;
  coursesWithoutMaterials: number;
  aiCalls30d: number;
  masteryAvg: number;
}

export interface CoverageGapRow {
  department: { en: string; ar: string };
  missingPercent: number;
}

export interface AnalyticsSnapshot {
  asOf: string;
  faculties: FacultyAnalyticsRow[];
  coverageGaps: CoverageGapRow[];
  usage: { aiCalls30d: number; estCostUsd: number; activeDoctorsPct: number };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
export const isoDaysAgo = (days: number) => new Date(Date.now() - days * 864e5).toISOString();

export function officerPermissionsOf(user: AdminUser): PermissionKey[] {
  if (user.isSuperAdmin) return Object.keys(PERMISSION_LABELS) as PermissionKey[];
  if (user.officerPermissions) return user.officerPermissions;
  const tpl = OFFICER_TEMPLATES.find((t) => t.id === user.officerTemplateId);
  return tpl ? tpl.permissions : [];
}

export function templateOf(user: AdminUser): OfficerTemplate | null {
  return OFFICER_TEMPLATES.find((t) => t.id === user.officerTemplateId) ?? null;
}

// ─── Seed ───────────────────────────────────────────────────────────────────
export const ADMIN_ME_ID = "u-mona-admin";
/** Student-side demo persona — the same Sarah the instructor module grades. */
export const STUDENT_ME_ID = "u-sarah-rashidi";

export const SEED_USERS: AdminUser[] = [
  {
    id: ADMIN_ME_ID,
    firstName: "Mona",
    lastName: "Abdelrahman",
    email: "admin@menoufia.edu.eg",
    kind: "officer",
    accountType: "institutional",
    isActive: true,
    isSuperAdmin: true,
    academicNumber: "EMP-0001",
    faculty: "Faculty of Computers and Information",
    lastActiveAt: isoDaysAgo(0.2),
  },
  {
    id: "u-heba-adm",
    firstName: "Heba",
    lastName: "Salah",
    email: "heba.salah@menoufia.edu.eg",
    kind: "officer",
    accountType: "institutional",
    isActive: true,
    officerTemplateId: "tpl-admissions",
    academicNumber: "EMP-0117",
    lastActiveAt: isoDaysAgo(1.1),
  },
  {
    id: "u-tamer-ctn",
    firstName: "Tamer",
    lastName: "Elgendy",
    email: "tamer.elgendy@menoufia.edu.eg",
    kind: "officer",
    accountType: "institutional",
    isActive: true,
    officerTemplateId: "tpl-content",
    officerPermissions: ["users.view", "analytics.view", "audit.view"],
    academicNumber: "EMP-0124",
    lastActiveAt: isoDaysAgo(6),
  },
  {
    id: "u-hassan",
    firstName: "Hassan",
    lastName: "Farid",
    email: "hassan.farid@menoufia.edu.eg",
    kind: "doctor",
    accountType: "institutional",
    isActive: true,
    academicNumber: "EMP-0021",
    faculty: "Faculty of Computers and Information",
    department: "Computer Science",
    lastActiveAt: isoDaysAgo(0.1),
  },
  {
    id: "u-nadia-dr",
    firstName: "Nadia",
    lastName: "Al-Manea",
    email: "nadia.almanea@menoufia.edu.eg",
    kind: "doctor",
    accountType: "institutional",
    isActive: true,
    academicNumber: "EMP-0033",
    faculty: "Faculty of Computers and Information",
    department: "Information Systems",
    lastActiveAt: isoDaysAgo(2.4),
  },
  {
    id: "u-khaled-dr",
    firstName: "Khaled",
    lastName: "Nofal",
    email: "khaled.nofal@menoufia.edu.eg",
    kind: "doctor",
    accountType: "institutional",
    isActive: false,
    academicNumber: "EMP-0048",
    faculty: "Faculty of Engineering",
    department: "Electronics",
    lastActiveAt: isoDaysAgo(31),
  },
  {
    id: "u-sara",
    firstName: "Sara",
    lastName: "Mitchell",
    email: "sara.mitchell@gmail.com",
    kind: "student",
    accountType: "institutional",
    isActive: true,
    academicNumber: "20231701",
    faculty: "Faculty of Computers and Information",
    department: "Computer Science",
    year: 3,
    lastActiveAt: isoDaysAgo(0.05),
  },
  {
    id: "u-mona-st",
    firstName: "Mona",
    lastName: "Reyes",
    email: "mona.reyes@gmail.com",
    kind: "student",
    accountType: "institutional",
    isActive: true,
    academicNumber: "20231715",
    faculty: "Faculty of Computers and Information",
    department: "Computer Science",
    year: 3,
    lastActiveAt: isoDaysAgo(0.4),
  },
  {
    id: "u-omar",
    firstName: "Omar",
    lastName: "Diaz",
    email: "omar.diaz@gmail.com",
    kind: "student",
    accountType: "institutional",
    isActive: true,
    faculty: "Faculty of Computers and Information",
    department: "Computer Science",
    year: 3,
    lastActiveAt: isoDaysAgo(5),
  },
  {
    id: "u-yara",
    firstName: "Yara",
    lastName: "Hansen",
    email: "yara.hansen@gmail.com",
    kind: "student",
    accountType: "institutional",
    isActive: true,
    academicNumber: "20221288",
    faculty: "Faculty of Computers and Information",
    department: "Information Systems",
    year: 2,
    lastActiveAt: isoDaysAgo(1.2),
  },
  {
    id: "u-laila-ind",
    firstName: "Laila",
    lastName: "Mansour",
    email: "laila.mansour@menoufia.edu.eg",
    kind: "student",
    accountType: "individual",
    isActive: true,
    personalCourses: 2,
    lastActiveAt: isoDaysAgo(0.8),
  },
  {
    id: "u-ziad-ind",
    firstName: "Ziad",
    lastName: "Hamza",
    email: "ziad.hamza@menoufia.edu.eg",
    kind: "student",
    accountType: "individual",
    isActive: true,
    personalCourses: 1,
    lastActiveAt: isoDaysAgo(3),
  },
  {
    id: "u-farida",
    firstName: "Farida",
    lastName: "Mohamed",
    email: "farida@menoufia.edu.eg",
    kind: "student",
    accountType: "institutional",
    isActive: true,
    faculty: "Faculty of Computers and Information",
    department: "Computer Science",
    year: 4,
    lastActiveAt: isoDaysAgo(0.3),
  },
  {
    id: STUDENT_ME_ID,
    firstName: "Sarah",
    lastName: "Al-Rashidi",
    email: "sarah.rashidi@menoufia.edu.eg",
    kind: "student",
    accountType: "institutional",
    isActive: true,
    academicNumber: "202341872",
    faculty: "Faculty of Computers and Information",
    department: "Computer Science",
    year: 3,
    lastActiveAt: isoDaysAgo(0),
  },
];

export const SEED_INVITATIONS: Invitation[] = [
  { id: "inv-1", email: "retag.ali@menoufia.edu.eg", firstName: "Retag", lastName: "Ali", role: "student", courseCode: "CS301", status: "pending", sentAt: isoDaysAgo(12) },
  { id: "inv-2", email: "rowan.said@menoufia.edu.eg", firstName: "Rowan", lastName: "Said", role: "student", courseCode: "CS301", status: "pending", sentAt: isoDaysAgo(12) },
  { id: "inv-3", email: "eslam.fathy@menoufia.edu.eg", firstName: "Eslam", lastName: "Fathy", role: "student", courseCode: "CS201", status: "pending", sentAt: isoDaysAgo(4) },
  { id: "inv-4", email: "hager.magdy@menoufia.edu.eg", firstName: "Hager", lastName: "Magdy", role: "student", courseCode: "CS201", status: "accepted", sentAt: isoDaysAgo(9), acceptedAt: isoDaysAgo(7) },
  { id: "inv-5", email: "maram.ashraf@menoufia.edu.eg", firstName: "Maram", lastName: "Ashraf", role: "doctor", courseCode: "BIO110", status: "pending", sentAt: isoDaysAgo(16) },
];

export const SEED_REQUESTS: OutOfYearRequest[] = [
  {
    id: "req-1",
    studentId: "u-yara",
    studentName: "Yara Hansen",
    studentYear: 2,
    courseCode: "CS401",
    courseTitle: { en: "Distributed Systems", ar: "الأنظمة الموزعة" },
    courseYear: 4,
    reason: "Completed CS301 with distinction and wants to fast-track the graduation project prerequisites.",
    attachments: [
      { id: "att-1", name: "student-affairs-approval.pdf", kind: "file" },
      { id: "att-2", name: "fees-receipt.jpg", kind: "image" },
    ],
    status: "pending",
    submittedAt: isoDaysAgo(1.5),
  },
  {
    id: "req-2",
    studentId: "u-farida",
    studentName: "Farida Mohamed",
    studentYear: 4,
    courseCode: "CS201",
    courseTitle: { en: "Discrete Mathematics", ar: "الرياضيات المتقطعة" },
    courseYear: 2,
    reason: "Transferred from another faculty last year and missed the prerequisite sequence.",
    attachments: [{ id: "att-3", name: "transfer-letter.jpg", kind: "image" }],
    status: "pending",
    submittedAt: isoDaysAgo(3),
  },
  {
    id: "req-3",
    studentId: "u-omar",
    studentName: "Omar Diaz",
    studentYear: 3,
    courseCode: "CS450",
    courseTitle: { en: "Compiler Design", ar: "تصميم المترجمات" },
    courseYear: 4,
    reason: "Registered at student affairs after being granted an exception.",
    attachments: [{ id: "att-4", name: "exception-decision.pdf", kind: "file" }],
    status: "accepted",
    submittedAt: isoDaysAgo(8),
    decidedAt: isoDaysAgo(6),
    decidedBy: "Mona Abdelrahman",
    decisionNote: "Exception verified against student-affairs records.",
  },
];

export const SEED_LINK_CANDIDATES: LinkCandidate[] = [
  { userId: "u-laila-ind", email: "laila.mansour@menoufia.edu.eg", studentName: "Laila Mansour", personalCourses: 2, domain: "menoufia.edu.eg" },
  { userId: "u-ziad-ind", email: "ziad.hamza@menoufia.edu.eg", studentName: "Ziad Hamza", personalCourses: 1, domain: "menoufia.edu.eg" },
  { userId: "u-ind-3", email: "salma.ezz@menoufia.edu.eg", studentName: "Salma Ezz", personalCourses: 3, domain: "menoufia.edu.eg" },
];

export const SEED_LINK_INVITATIONS: LinkInvitation[] = [
  {
    id: "link-inv-1",
    userId: "u-ind-4",
    email: "nayera.fouda@menoufia.edu.eg",
    studentName: "Nayera Fouda",
    domain: "menoufia.edu.eg",
    status: "awaiting-consent",
    sentAt: isoDaysAgo(2),
  },
];

export const SEED_SETTINGS: InstitutionSettings = {
  institutionName: { en: "Menoufia University", ar: "جامعة المنوفية" },
  isActive: true,
  contractEndsAt: "2027-08-31",
  emailDomains: ["menoufia.edu.eg"],
  allowSelfRegistration: true,
  allowDoctorCourseCreation: true,
  allowedSupplementalSourceTypes: ["pdf", "slides", "link"],
};

export const SEED_AUDIT: AuditEvent[] = [
  {
    id: "ev-10",
    type: "request.decided",
    actorId: ADMIN_ME_ID,
    actorName: "Mona Abdelrahman",
    scope: "requests.review",
    at: isoDaysAgo(6),
    summary: { en: "Accepted Omar Diaz → CS401 with proof reference exception-decision.pdf", ar: "قبول طلب عمر دياز ← CS401 بمرجع إثبات exception-decision.pdf" },
  },
  {
    id: "ev-9",
    type: "bulk.imported",
    actorId: "u-heba-adm",
    actorName: "Heba Salah",
    scope: "bulk.import",
    at: isoDaysAgo(12),
    summary: { en: "Bulk import CS301-fall.csv — 42 invitations sent, 1 existing account enrolled directly, 2 rows rejected", ar: "إدخال جماعي CS301-fall.csv — أُرسلت 42 دعوة، وانضم حساب قائم مباشرة، ورفض صفّان" },
  },
  {
    id: "ev-8",
    type: "user.deactivated",
    actorId: ADMIN_ME_ID,
    actorName: "Mona Abdelrahman",
    scope: "users.manage",
    at: isoDaysAgo(14),
    summary: { en: "Deactivated Khaled Nofal (EMP-0048) — contract ended", ar: "تعطيل خالد نوفل (EMP-0048) — انتهى التعاقد" },
  },
  {
    id: "ev-7",
    type: "permissions.changed",
    actorId: ADMIN_ME_ID,
    actorName: "Mona Abdelrahman",
    scope: "users.manage",
    at: isoDaysAgo(16),
    summary: { en: "Edited Tamer Elgendy's permissions — removed settings management", ar: "تعديل صلاحيات تامر الجندي — أُزيلت إدارة الإعدادات" },
  },
  {
    id: "ev-6",
    type: "settings.changed",
    actorId: ADMIN_ME_ID,
    actorName: "Mona Abdelrahman",
    scope: "settings.manage",
    at: isoDaysAgo(18),
    summary: { en: "Added menoufia.edu.eg to the approved email domains", ar: "إضافة menoufia.edu.eg إلى النطاقات المعتمدة" },
  },
  {
    id: "ev-5",
    type: "structure.changed",
    actorId: ADMIN_ME_ID,
    actorName: "Mona Abdelrahman",
    scope: "settings.manage",
    at: isoDaysAgo(20),
    summary: { en: "Created program 'Cybersecurity BSc' under Computer Science department", ar: "إنشاء برنامج «الأمن السيبراني بكالوريوس» تحت قسم علوم الحاسب" },
  },
];

export const SEED_ANALYTICS: AnalyticsSnapshot = {
  asOf: isoDaysAgo(0.35),
  faculties: [
    {
      id: "fci",
      name: { en: "Computers & Information", ar: "الحاسبات والمعلومات" },
      doctors: 18,
      activeDoctors: 11,
      students: 1430,
      courses: 46,
      coursesWithoutMaterials: 5,
      aiCalls30d: 41200,
      masteryAvg: 0.62,
    },
    {
      id: "eng",
      name: { en: "Engineering", ar: "الهندسة" },
      doctors: 34,
      activeDoctors: 22,
      students: 3860,
      courses: 91,
      coursesWithoutMaterials: 12,
      aiCalls30d: 68900,
      masteryAvg: 0.58,
    },
    {
      id: "sci",
      name: { en: "Science", ar: "العلوم" },
      doctors: 27,
      activeDoctors: 8,
      students: 2210,
      courses: 64,
      coursesWithoutMaterials: 17,
      aiCalls30d: 15400,
      masteryAvg: 0.51,
    },
  ],
  coverageGaps: [
    { department: { en: "Physics", ar: "الفيزياء" }, missingPercent: 31 },
    { department: { en: "Electronics", ar: "الإلكترونيات" }, missingPercent: 22 },
    { department: { en: "Information Systems", ar: "نظم المعلومات" }, missingPercent: 9 },
  ],
  usage: { aiCalls30d: 125500, estCostUsd: 842, activeDoctorsPct: 0.52 },
};
