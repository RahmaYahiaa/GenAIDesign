import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from "react";
import {
  ADMIN_ME_ID,
  STUDENT_ME_ID,
  AdminUser,
  AdminUserKind,
  AuditEvent,
  AuditEventType,
  ImportBatch,
  ImportRowPreview,
  InstitutionSettings,
  Invitation,
  LinkCandidate,
  LinkInvitation,
  OutOfYearRequest,
  PermissionKey,
  SEED_ANALYTICS,
  SEED_AUDIT,
  SEED_INVITATIONS,
  SEED_LINK_CANDIDATES,
  SEED_LINK_INVITATIONS,
  SEED_REQUESTS,
  SEED_SETTINGS,
  SEED_USERS,
  officerPermissionsOf,
} from "@/data/adminModule";

// ─────────────────────────────────────────────────────────────────────────────
// Institution admin store — FR-ADM-xx. Every administrative action appends to
// the institution audit log (FR-ADM-10) and officers only ever observe events
// inside their own permission scope; the super admin sees everything.
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminModuleState {
  users: AdminUser[];
  invitations: Invitation[];
  batches: ImportBatch[];
  requests: OutOfYearRequest[];
  linkCandidates: LinkCandidate[];
  linkInvitations: LinkInvitation[];
  settings: InstitutionSettings;
  audit: AuditEvent[];
  analytics: typeof SEED_ANALYTICS;
}

let seq = 100;
const nextId = (p: string) => `${p}-${++seq}`;
const nowIso = () => new Date().toISOString();

function initialState(): AdminModuleState {
  return {
    users: structuredClone(SEED_USERS),
    invitations: structuredClone(SEED_INVITATIONS),
    batches: [],
    requests: structuredClone(SEED_REQUESTS),
    linkCandidates: structuredClone(SEED_LINK_CANDIDATES),
    linkInvitations: structuredClone(SEED_LINK_INVITATIONS),
    settings: structuredClone(SEED_SETTINGS),
    audit: structuredClone(SEED_AUDIT),
    analytics: structuredClone(SEED_ANALYTICS),
  };
}

export interface HealthNumbers {
  pendingRequests: number;
  unacceptedInvitations: number;
  oldestInvitationDays: number;
  coursesWithoutMaterials: number;
  totalCourses: number;
  activeOfficers: number;
  totalOfficers: number;
}

interface Ctx {
  state: AdminModuleState;
  me: AdminUser;
  myPermissions: PermissionKey[];
  /** FR-ADM-01 — officers see only events inside their own scope. */
  visibleAudit: AuditEvent[];
  health: HealthNumbers;
  can: (key: PermissionKey) => boolean;
  // users (FR-ADM-02)
  toggleUserActive: (userId: string) => void;
  changeUserKind: (userId: string, kind: AdminUserKind) => void;
  setAcademicNumber: (userId: string, value: string) => void;
  // officers (FR-ADM-01)
  addOfficer: (draft: { firstName: string; lastName: string; email: string; templateId: string }) => void;
  setOfficerTemplate: (userId: string, templateId: string) => void;
  toggleOfficerPermission: (userId: string, key: PermissionKey) => void;
  // bulk import (FR-ADM-03)
  stageImport: (fileName: string, rows: Omit<ImportRowPreview, "verdict" | "errorReason" | "row">[]) => void;
  confirmImport: (batchId: string) => void;
  discardImport: (batchId: string) => void;
  // out-of-year requests (FR-ADM-05)
  submitRequest: (draft: { courseCode: string; courseTitle: { en: string; ar: string }; courseYear: number; reason: string; attachments: { name: string; kind: "image" | "file" }[] }) => void;
  decideRequest: (requestId: string, decision: "accepted" | "rejected", note?: string) => void;
  // account linking (FR-ADM-07)
  sendLinkInvitation: (userId: string) => void;
  respondLinkInvitation: (inviteId: string, response: "linked" | "declined") => void;
  // settings (FR-ADM-08)
  updateSettings: (patch: Partial<InstitutionSettings>) => void;
}

const AdminCtx = createContext<Ctx | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminModuleState>(initialState);

  const logEvent = useCallback((type: AuditEventType, scope: PermissionKey, summary: AuditEvent["summary"], detail?: AuditEvent["detail"]) => {
    setState((s) => ({
      ...s,
      audit: [
        { id: nextId("ev"), type, actorId: ADMIN_ME_ID, actorName: "Mona Abdelrahman", scope, at: nowIso(), summary, detail },
        ...s.audit,
      ],
    }));
  }, []);

  const toggleUserActive = useCallback((userId: string) => {
    setState((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (!user || user.isSuperAdmin) return s;
      return { ...s, users: s.users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)) };
    });
    setState((s) => {
      const user = s.users.find((u) => u.id === userId)!;
      const active = user.isActive;
      const summary = active
        ? { en: `Activated ${user.firstName} ${user.lastName}'s account — login restored`, ar: `تفعيل حساب ${user.firstName} ${user.lastName} — عاد الدخول` }
        : { en: `Deactivated ${user.firstName} ${user.lastName}'s account — login blocked immediately`, ar: `تعطيل حساب ${user.firstName} ${user.lastName} — مُنع الدخول فورًا` };
      return {
        ...s,
        audit: [
          { id: nextId("ev"), type: active ? "user.activated" : "user.deactivated", actorId: ADMIN_ME_ID, actorName: "Mona Abdelrahman", scope: "users.manage", at: nowIso(), summary },
          ...s.audit,
        ],
      };
    });
  }, []);

  const changeUserKind = useCallback((userId: string, kind: AdminUserKind) => {
    setState((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (!user || user.isSuperAdmin) return s;
      return { ...s, users: s.users.map((u) => (u.id === userId ? { ...u, kind } : u)) };
    });
    const user = state.users.find((u) => u.id === userId);
    if (user) logEvent("role.changed", "users.manage", {
      en: `Changed ${user.firstName} ${user.lastName}'s role to ${kind}`,
      ar: `تغيير دور ${user.firstName} ${user.lastName} إلى ${kind === "student" ? "طالب" : kind === "doctor" ? "دكتور" : "مسؤول"}`,
    });
  }, [state.users, logEvent]);

  const setAcademicNumber = useCallback((userId: string, value: string) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, academicNumber: value.trim() || undefined } : u)) }));
  }, []);

  const addOfficer = useCallback((draft: { firstName: string; lastName: string; email: string; templateId: string }) => {
    setState((s) => ({
      ...s,
      users: [
        ...s.users,
        {
          id: nextId("u"),
          ...draft,
          kind: "officer",
          accountType: "institutional",
          isActive: true,
          officerTemplateId: draft.templateId,
          lastActiveAt: nowIso(),
        },
      ],
    }));
    logEvent("officer.added", "users.manage", {
      en: `Added officer ${draft.firstName} ${draft.lastName} with a permission template`,
      ar: `إضافة المسؤول ${draft.firstName} ${draft.lastName} بقالب صلاحيات`,
    });
  }, [logEvent]);

  const setOfficerTemplate = useCallback((userId: string, templateId: string) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, officerTemplateId: templateId, officerPermissions: undefined } : u)) }));
    const user = state.users.find((u) => u.id === userId);
    if (user) logEvent("permissions.changed", "users.manage", {
      en: `Reassigned ${user.firstName} ${user.lastName} to a ready-made permission template`,
      ar: `إعادة تعيين ${user.firstName} ${user.lastName} إلى قالب صلاحيات جاهز`,
    });
  }, [state.users, logEvent]);

  const toggleOfficerPermission = useCallback((userId: string, key: PermissionKey) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id !== userId || u.isSuperAdmin) return u;
        const current = officerPermissionsOf(u);
        const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
        return { ...u, officerPermissions: next };
      }),
    }));
    const user = state.users.find((u) => u.id === userId);
    if (user) logEvent("permissions.changed", "users.manage", {
      en: `Customised ${user.firstName} ${user.lastName}'s permissions manually`,
      ar: `تخصيص صلاحيات ${user.firstName} ${user.lastName} يدويًا`,
    });
  }, [state.users, logEvent]);

  const stageImport = useCallback((fileName: string, draftRows: Omit<ImportRowPreview, "verdict" | "errorReason" | "row">[]) => {
    setState((s) => {
      const seen = new Set<string>();
      const rows: ImportRowPreview[] = draftRows.map((draft, index) => {
        const email = draft.email.trim().toLowerCase();
        const base = { ...draft, email, row: index + 2 };
        if (!draft.firstName.trim() || !draft.lastName.trim() || !email || !draft.role) {
          return { ...base, verdict: "error", errorReason: { en: "Missing required data or invalid role", ar: "بيانات ناقصة أو دور غير صحيح" } };
        }
        if (seen.has(email)) {
          return { ...base, verdict: "error", errorReason: { en: "Duplicated inside this same file", ar: "مكرر داخل نفس الملف" } };
        }
        seen.add(email);
        if (s.users.some((u) => u.email.toLowerCase() === email)) {
          return { ...base, verdict: "existing" };
        }
        return { ...base, verdict: "new" };
      });
      return { ...s, batches: [{ id: nextId("batch"), fileName, uploadedAt: nowIso(), rows, confirmed: false }, ...s.batches] };
    });
  }, []);

  const confirmImport = useCallback((batchId: string) => {
    let newCount = 0;
    let existingCount = 0;
    let errorCount = 0;
    let fileName = "";
    setState((s) => {
      const batch = s.batches.find((b) => b.id === batchId);
      if (!batch || batch.confirmed) return s;
      fileName = batch.fileName;
      const invitations = [...s.invitations];
      for (const row of batch.rows) {
        if (row.verdict === "error") { errorCount += 1; continue; }
        if (row.verdict === "existing") {
          existingCount += 1;
          invitations.unshift({
            id: nextId("inv"),
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role as "student" | "doctor",
            courseCode: row.courseCodes.join(" + ") || "—",
            status: "accepted",
            sentAt: nowIso(),
            acceptedAt: nowIso(),
          });
        } else {
          newCount += 1;
          invitations.unshift({
            id: nextId("inv"),
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role as "student" | "doctor",
            courseCode: row.courseCodes.join(" + ") || "—",
            status: "pending",
            sentAt: nowIso(),
          });
        }
      }
      return {
        ...s,
        invitations,
        batches: s.batches.map((b) => (b.id === batchId ? { ...b, confirmed: true } : b)),
      };
    });
    logEvent("bulk.imported", "bulk.import", {
      en: `Bulk import ${fileName} — ${newCount} invitations sent, ${existingCount} existing accounts enrolled directly, ${errorCount} rows rejected`,
      ar: `إدخال جماعي ${fileName} — أُرسلت ${newCount} دعوة، وانضم ${existingCount} حساب قائم مباشرة، ورُفض ${errorCount} صف`,
    });
  }, [logEvent]);

  const discardImport = useCallback((batchId: string) => {
    setState((s) => ({ ...s, batches: s.batches.filter((b) => b.id !== batchId || b.confirmed) }));
  }, []);

  /** Student side of FR-ADM-05 — the request lands in the admin queue instantly. */
  const submitRequest = useCallback((draft: { courseCode: string; courseTitle: { en: string; ar: string }; courseYear: number; reason: string; attachments: { name: string; kind: "image" | "file" }[] }) => {
    setState((s) => ({
      ...s,
      requests: [
        {
          id: nextId("req"),
          studentId: STUDENT_ME_ID,
          studentName: "Sarah Al-Rashidi",
          studentYear: 3,
          courseCode: draft.courseCode,
          courseTitle: draft.courseTitle,
          courseYear: draft.courseYear,
          reason: draft.reason.trim(),
          attachments: draft.attachments.map((a) => ({ id: nextId("att"), name: a.name, kind: a.kind })),
          status: "pending",
          submittedAt: nowIso(),
        },
        ...s.requests,
      ],
    }));
  }, []);

  const decideRequest = useCallback((requestId: string, decision: "accepted" | "rejected", note?: string) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.id === requestId && r.status === "pending"
          ? { ...r, status: decision, decidedAt: nowIso(), decidedBy: "Mona Abdelrahman", decisionNote: note }
          : r,
      ),
    }));
    const req = state.requests.find((r) => r.id === requestId);
    if (req) {
      const accepted = decision === "accepted";
      logEvent("request.decided", "requests.review", {
        en: `${accepted ? "Accepted" : "Rejected"} ${req.studentName} → ${req.courseCode} with proof reference ${req.attachments.map((a) => a.name).join(", ")}`,
        ar: `${accepted ? "قبول" : "رفض"} طلب ${req.studentName} ← ${req.courseCode} بمرجع إثبات ${req.attachments.map((a) => a.name).join(", ")}`,
      }, note ? { en: note, ar: note } : undefined);
    }
  }, [state.requests, logEvent]);

  const sendLinkInvitation = useCallback((userId: string) => {
    setState((s) => {
      const candidate = s.linkCandidates.find((c) => c.userId === userId);
      if (!candidate) return s;
      return {
        ...s,
        linkCandidates: s.linkCandidates.filter((c) => c.userId !== userId),
        linkInvitations: [
          { id: nextId("link-inv"), userId: candidate.userId, email: candidate.email, studentName: candidate.studentName, domain: candidate.domain, status: "awaiting-consent", sentAt: nowIso() },
          ...s.linkInvitations,
        ],
      };
    });
  }, []);

  const respondLinkInvitation = useCallback((inviteId: string, response: "linked" | "declined") => {
    setState((s) => ({
      ...s,
      linkInvitations: s.linkInvitations.map((inv) =>
        inv.id === inviteId && inv.status === "awaiting-consent" ? { ...inv, status: response, respondedAt: nowIso() } : inv,
      ),
    }));
    const invite = state.linkInvitations.find((inv) => inv.id === inviteId);
    if (invite && response === "linked") {
      logEvent("account.linked", "accounts.link", {
        en: `${invite.studentName} consented — individual account converted to institutional`,
        ar: `وافق ${invite.studentName} — تحول الحساب الفردي إلى مؤسسي`,
      });
    }
  }, [state.linkInvitations, logEvent]);

  const updateSettings = useCallback((patch: Partial<InstitutionSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    logEvent("settings.changed", "settings.manage", {
      en: "Institution settings updated",
      ar: "تم تحديث إعدادات المؤسسة",
    });
  }, [logEvent]);

  const value = useMemo<Ctx>(() => {
    const me = state.users.find((u) => u.id === ADMIN_ME_ID) ?? state.users[0];
    const myPermissions = officerPermissionsOf(me);
    const isSuper = Boolean(me?.isSuperAdmin);
    const can = (key: PermissionKey) => isSuper || myPermissions.includes(key);
    const visibleAudit = isSuper ? state.audit : state.audit.filter((event) => myPermissions.includes(event.scope));
    const pendingInvites = state.invitations.filter((i) => i.status === "pending");
    const oldest = pendingInvites.reduce((min, i) => Math.min(min, new Date(i.sentAt).getTime()), Date.now());
    const officers = state.users.filter((u) => u.kind === "officer");
    const health: HealthNumbers = {
      pendingRequests: state.requests.filter((r) => r.status === "pending").length,
      unacceptedInvitations: pendingInvites.length,
      oldestInvitationDays: pendingInvites.length ? Math.floor((Date.now() - oldest) / 864e5) : 0,
      coursesWithoutMaterials: state.analytics.faculties.reduce((sum, f) => sum + f.coursesWithoutMaterials, 0),
      totalCourses: state.analytics.faculties.reduce((sum, f) => sum + f.courses, 0),
      activeOfficers: officers.filter((u) => Date.now() - new Date(u.lastActiveAt).getTime() < 7 * 864e5).length,
      totalOfficers: officers.length,
    };
    return {
      state, me, myPermissions, visibleAudit, health, can,
      toggleUserActive, changeUserKind, setAcademicNumber,
      addOfficer, setOfficerTemplate, toggleOfficerPermission,
      stageImport, confirmImport, discardImport,
      submitRequest, decideRequest, sendLinkInvitation, respondLinkInvitation, updateSettings,
    };
  }, [
    state,
    toggleUserActive, changeUserKind, setAcademicNumber,
    addOfficer, setOfficerTemplate, toggleOfficerPermission,
    stageImport, confirmImport, discardImport,
    submitRequest, decideRequest, sendLinkInvitation, respondLinkInvitation, updateSettings,
  ]);

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdminModule(): Ctx {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdminModule must be used inside AdminStoreProvider");
  return ctx;
}
