import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from "react";
import {
  AssignmentDef, AnswerDecision, AuditEntry, CourseInfo, QuestionDef, ReviewUnit,
  RemedialDraft, COURSES, ASSIGNMENTS, SEED_UNITS, SEED_AUDIT, SEED_DRAFTS,
  DEMO_STUDENT_ID, INSTRUCTOR_NAME, evaluateAnswer, latestAttempt, approvedMaterials,
} from "@/data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Module store — the single source of truth for every instructor/student
// workflow in this module. All review actions write to the audit trail
// (FR-AUDIT-01/02) and refresh the precomputed analytics stamp (FR-ANALYTICS-02).
// ─────────────────────────────────────────────────────────────────────────────

export interface ModuleState {
  courses: CourseInfo[];
  assignments: AssignmentDef[];
  units: ReviewUnit[];
  audit: AuditEntry[];
  drafts: Record<string, { text: string; image?: string; savedAt: string }>;
  remedial: RemedialDraft[];
  analyticsAsOf: string;
}

let seq = 1000;
const nextId = (p: string) => `${p}-${++seq}`;
const nowIso = () => new Date().toISOString();

function initialState(): ModuleState {
  return {
    courses: structuredClone(COURSES),
    assignments: structuredClone(ASSIGNMENTS),
    units: structuredClone(SEED_UNITS),
    audit: structuredClone(SEED_AUDIT),
    drafts: structuredClone(SEED_DRAFTS),
    remedial: [],
    analyticsAsOf: nowIso(),
  };
}

interface Ctx {
  state: ModuleState;
  // assignments
  publishAssignment: (courseId: string, draft: { titleEn: string; titleAr: string; showScore: boolean; questions: QuestionDef[] }) => string;
  setAssignmentStatus: (assignmentId: string, status: "open" | "closed") => void;
  setScoreVisibility: (assignmentId: string, next: boolean) => void;
  // review
  decide: (unitId: string, action: "approve" | "edit" | "reject", payload: { score?: number; feedback?: string }) => void;
  requestResubmission: (unitId: string, reason: string) => void;
  reopenUnit: (unitId: string) => void;
  bulkApprove: (unitIds: string[]) => void;
  // student
  saveDraft: (assignmentId: string, questionId: string, text: string, image?: string) => void;
  submitAssignment: (assignmentId: string) => void;
  resubmitUnit: (unitId: string, text: string, image?: string) => void;
  // materials
  addMaterial: (courseId: string, topicId: string, title: string) => void;
  approveMaterial: (courseId: string, topicId: string, materialId: string) => void;
  // remedial
  saveRemedial: (d: RemedialDraft) => void;
  publishRemedial: (id: string) => void;
  discardRemedial: (id: string) => void;
  reset: () => void;
}

const ModuleContext = createContext<Ctx | null>(null);

export function useInstructorModule(): Ctx {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useInstructorModule must be used inside <InstructorModuleProvider>");
  return ctx;
}

export function InstructorModuleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModuleState>(initialState);

  const mutate = useCallback((fn: (s: ModuleState) => ModuleState) => {
    setState((s) => fn(structuredClone(s)));
  }, []);

  const auditFor = (s: ModuleState, u: ReviewUnit, e: Omit<AuditEntry, "id" | "at" | "instructor">) => {
    s.audit.unshift({ ...e, id: nextId("au"), at: nowIso(), instructor: INSTRUCTOR_NAME });
  };

  const questionMeta = (s: ModuleState, u: ReviewUnit) => {
    const a = s.assignments.find((x) => x.id === u.assignmentId);
    const qi = a ? a.questions.findIndex((q) => q.id === u.questionId) : -1;
    const q = qi >= 0 && a ? a.questions[qi] : null;
    const short = q ? (q.prompt.en.length > 46 ? `${q.prompt.en.slice(0, 46)}…` : q.prompt.en) : "";
    return { assignmentTitle: a ? a.title.en : "", questionLabel: `Q${qi + 1} · ${short}` };
  };

  // ── assignments ────────────────────────────────────────────────────────────
  const publishAssignment: Ctx["publishAssignment"] = (courseId, draft) => {
    const id = nextId("as");
    mutate((s) => {
      s.assignments.unshift({
        id, courseId,
        title: { en: draft.titleEn, ar: draft.titleAr || draft.titleEn },
        status: "open",                       // FR-AC-05 — publish ⇒ Open
        showScoreToStudent: draft.showScore,  // FR-VIS-05 default handled by caller (false)
        createdAt: nowIso(),
        questions: draft.questions,
      });
      s.analyticsAsOf = nowIso();
      return s;
    });
    return id;
  };

  const setAssignmentStatus: Ctx["setAssignmentStatus"] = (assignmentId, status) =>
    mutate((s) => {
      const a = s.assignments.find((x) => x.id === assignmentId);
      if (a) a.status = status;
      return s;
    });

  const setScoreVisibility: Ctx["setScoreVisibility"] = (assignmentId, next) =>
    mutate((s) => {
      const a = s.assignments.find((x) => x.id === assignmentId);
      if (!a || a.showScoreToStudent === next) return s;
      const before = a.showScoreToStudent;
      a.showScoreToStudent = next;
      s.audit.unshift({
        id: nextId("au"), at: nowIso(), courseId: a.courseId, assignmentId,
        assignmentTitle: a.title.en, studentName: "—", questionLabel: "—",
        action: "visibility", aiScore: null, finalScore: null, instructor: INSTRUCTOR_NAME,
        visibilityBefore: before, visibilityAfter: next,
        note: next ? "Scores made visible to students." : "Score visibility withdrawn from students.",
      });
      return s;
    });

  // ── review decisions ───────────────────────────────────────────────────────
  const applyDecision = (s: ModuleState, unitId: string, decision: AnswerDecision, auditAction: AuditEntry["action"], note?: string) => {
    const u = s.units.find((x) => x.id === unitId);
    if (!u) return;
    const last = latestAttempt(u);
    last.decision = decision;
    u.status = "final";
    const meta = questionMeta(s, u);
    auditFor(s, u, {
      courseId: u.courseId, assignmentId: u.assignmentId, assignmentTitle: meta.assignmentTitle,
      studentName: u.studentName, questionLabel: meta.questionLabel,
      action: auditAction, aiScore: last.eval.aiScore, finalScore: decision.finalScore, note,
    });
    s.analyticsAsOf = nowIso();
  };

  const decide: Ctx["decide"] = (unitId, action, payload) =>
    mutate((s) => {
      const u = s.units.find((x) => x.id === unitId);
      if (!u) return s;
      const last = latestAttempt(u);
      const score = action === "approve" ? (last.eval.aiScore ?? 0) : (payload.score ?? last.eval.aiScore ?? 0);
      const feedback = action === "approve" ? last.eval.feedback : (payload.feedback ?? last.eval.feedback);
      const note = action === "edit" ? "Instructor adjusted the AI suggestion." : action === "reject" ? "AI suggestion replaced by a full manual evaluation." : undefined;
      applyDecision(s, unitId, { action, finalScore: score, finalFeedback: feedback, decidedBy: INSTRUCTOR_NAME, decidedAt: nowIso() }, action, note);
      return s;
    });

  const requestResubmission: Ctx["requestResubmission"] = (unitId, reason) =>
    mutate((s) => {
      const u = s.units.find((x) => x.id === unitId);
      if (!u) return s;
      const last = latestAttempt(u);
      last.resubmitReason = reason;
      last.decision = undefined;
      u.status = "resubmission_requested";
      const meta = questionMeta(s, u);
      auditFor(s, u, {
        courseId: u.courseId, assignmentId: u.assignmentId, assignmentTitle: meta.assignmentTitle,
        studentName: u.studentName, questionLabel: meta.questionLabel, action: "resubmit",
        aiScore: last.eval.aiScore, finalScore: null, note: reason,
      });
      return s;
    });

  const reopenUnit: Ctx["reopenUnit"] = (unitId) =>
    mutate((s) => {
      const u = s.units.find((x) => x.id === unitId);
      if (!u || u.status !== "final") return s;
      const last = latestAttempt(u);
      const prev = last.decision;
      last.decision = undefined;
      u.status = "awaiting_review";
      const meta = questionMeta(s, u);
      auditFor(s, u, {
        courseId: u.courseId, assignmentId: u.assignmentId, assignmentTitle: meta.assignmentTitle,
        studentName: u.studentName, questionLabel: meta.questionLabel, action: "reopen",
        aiScore: last.eval.aiScore, finalScore: null,
        note: `Reopened after ${prev?.action ?? "a"} decision — returned to pending review.`,
      });
      s.analyticsAsOf = nowIso();
      return s;
    });

  const bulkApprove: Ctx["bulkApprove"] = (unitIds) =>
    mutate((s) => {
      for (const id of unitIds) {
        const u = s.units.find((x) => x.id === id);
        if (!u || u.status !== "awaiting_review") continue;
        const last = latestAttempt(u);
        if (last.eval.confidence !== "high" || last.eval.aiScore === null) continue;
        applyDecision(s, id, {
          action: "approve", finalScore: last.eval.aiScore, finalFeedback: last.eval.feedback,
          decidedBy: INSTRUCTOR_NAME, decidedAt: nowIso(),
        }, "approve", `Bulk approve (${unitIds.length} high-confidence submissions in one confirmed action).`);
      }
      return s;
    });

  // ── student side ───────────────────────────────────────────────────────────
  const saveDraft: Ctx["saveDraft"] = (assignmentId, questionId, text, image) =>
    mutate((s) => {
      s.drafts[`${assignmentId}|${questionId}`] = { text, image, savedAt: nowIso() };
      return s;
    });

  const submitAssignment: Ctx["submitAssignment"] = (assignmentId) =>
    mutate((s) => {
      const a = s.assignments.find((x) => x.id === assignmentId);
      if (!a || a.status !== "open") return s;              // FR-SUB-06 / FR-AC-06
      const course = s.courses.find((c) => c.id === a.courseId);
      if (!course) return s;
      const student = { id: DEMO_STUDENT_ID, name: "Sarah Al-Rashidi" };
      for (const q of a.questions) {
        const existing = s.units.find((u) => u.assignmentId === assignmentId && u.questionId === q.id && u.studentId === student.id);
        const draft = s.drafts[`${assignmentId}|${q.id}`];
        const text = draft?.text ?? "";
        const image = draft?.image;
        const ev = evaluateAnswer(q, text, course);          // FR-EVAL — same pipeline as Preview
        if (existing && existing.status === "resubmission_requested") {
          existing.attempts.push({ n: existing.attempts.length + 1, text, image, submittedAt: nowIso(), eval: ev });
          existing.status = "awaiting_review";
        } else if (!existing) {
          s.units.push({
            id: nextId("u"), assignmentId, courseId: a.courseId, questionId: q.id,
            studentId: student.id, studentName: student.name, status: "awaiting_review",
            attempts: [{ n: 1, text, image, submittedAt: nowIso(), eval: ev }],
          });
        }
        delete s.drafts[`${assignmentId}|${q.id}`];
      }
      return s;
    });

  const resubmitUnit: Ctx["resubmitUnit"] = (unitId, text, image) =>
    mutate((s) => {
      const u = s.units.find((x) => x.id === unitId);
      if (!u || u.status !== "resubmission_requested") return s;
      const a = s.assignments.find((x) => x.id === u.assignmentId);
      if (!a || a.status !== "open") return s;              // FR-RESUB-06
      const course = s.courses.find((c) => c.id === u.courseId);
      const q = a?.questions.find((x) => x.id === u.questionId);
      if (!course || !q) return s;
      u.attempts.push({ n: u.attempts.length + 1, text, image, submittedAt: nowIso(), eval: evaluateAnswer(q, text, course) });
      u.status = "awaiting_review";
      return s;
    });

  // ── materials ──────────────────────────────────────────────────────────────
  const addMaterial: Ctx["addMaterial"] = (courseId, topicId, title) =>
    mutate((s) => {
      const t = s.courses.find((c) => c.id === courseId)?.topics.find((x) => x.id === topicId);
      if (t) t.materials.push({ id: nextId("mat"), title, status: "pending", addedAt: nowIso() });
      return s;
    });

  const approveMaterial: Ctx["approveMaterial"] = (courseId, topicId, materialId) =>
    mutate((s) => {
      const t = s.courses.find((c) => c.id === courseId)?.topics.find((x) => x.id === topicId);
      const m = t?.materials.find((x) => x.id === materialId);
      if (m) m.status = "approved";
      if (t && approvedMaterials(t) > 0) s.analyticsAsOf = nowIso();
      return s;
    });

  // ── remedial content ───────────────────────────────────────────────────────
  const saveRemedial: Ctx["saveRemedial"] = (d) =>
    mutate((s) => {
      const i = s.remedial.findIndex((x) => x.id === d.id);
      if (i >= 0) s.remedial[i] = d;
      else s.remedial.unshift(d);
      return s;
    });

  const publishRemedial: Ctx["publishRemedial"] = (id) =>
    mutate((s) => {
      const d = s.remedial.find((x) => x.id === id);
      if (d) d.status = "published";
      s.analyticsAsOf = nowIso();   // FR-ANALYTICS-02
      return s;
    });

  const discardRemedial: Ctx["discardRemedial"] = (id) =>
    mutate((s) => {
      s.remedial = s.remedial.filter((x) => x.id !== id);
      return s;
    });

  const reset = useCallback(() => { seq = 1000; setState(initialState()); }, []);

  const value = useMemo<Ctx>(() => ({
    state, publishAssignment, setAssignmentStatus, setScoreVisibility,
    decide, requestResubmission, reopenUnit, bulkApprove,
    saveDraft, submitAssignment, resubmitUnit,
    addMaterial, approveMaterial, saveRemedial, publishRemedial, discardRemedial, reset,
  }), [state]);

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}
