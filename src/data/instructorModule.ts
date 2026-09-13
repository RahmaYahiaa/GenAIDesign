// ─────────────────────────────────────────────────────────────────────────────
// Instructor Workspace module — data model, seed data and the AI evaluation
// pipeline used by BOTH the creation "Preview" action and real student
// submissions (FR-AC-09: identical logic, never a simplified mock).
// ─────────────────────────────────────────────────────────────────────────────

export type Confidence = "high" | "medium" | "low" | "insufficient_evidence";
export type AssignmentStatus = "open" | "closed";
export type Lang = "en" | "ar";
export interface L { en: string; ar: string }

// ── Course / topic ───────────────────────────────────────────────────────────
export interface MaterialItem {
  id: string;
  title: string;
  status: "approved" | "pending";
  addedAt: string;
}

export interface TopicInfo {
  id: string;
  label: L;
  pct: number;            // class mastery on this topic (precomputed)
  evidence: number;
  materials: MaterialItem[];
}

export interface CourseInfo {
  id: string;
  title: L;
  isPersonal: boolean;    // FR-SCOPE-01 — personal courses never get this module
  week: number;
  enrolled: number;
  instructor: string;
  overall: number;        // class average mastery (precomputed)
  topics: TopicInfo[];
}

export function approvedMaterials(topic: TopicInfo): number {
  return topic.materials.filter((m) => m.status === "approved").length;
}
export function pendingMaterials(topic: TopicInfo): number {
  return topic.materials.filter((m) => m.status === "pending").length;
}
/** FR-COVERAGE-01 — a topic with zero approved materials. */
export function coverageGap(topic: TopicInfo): boolean {
  return approvedMaterials(topic) === 0;
}

// ── Assignment ───────────────────────────────────────────────────────────────
export interface QuestionDef {
  id: string;
  prompt: L;
  topicId: string;
  maxScore: number;
  referenceAnswer?: string;   // FR-AC-03 — always hidden from students
  rubric?: string;            // FR-AC-04 — free text in this phase
  keyTerms: string[];         // retrieval anchors the evaluation grounds on
}

export interface AssignmentDef {
  id: string;
  courseId: string;
  title: L;
  status: AssignmentStatus;      // FR-AC-05 — only Open / Closed, no deadlines
  showScoreToStudent: boolean;   // FR-VIS-01 — live per-assignment setting
  createdAt: string;
  questions: QuestionDef[];
}

// ── Evaluation / decision ────────────────────────────────────────────────────
export interface AnswerEval {
  aiScore: number | null;        // null when insufficient_evidence (FR-EVAL-04)
  confidence: Confidence;
  feedback: string;
  misconceptions: string[];      // misconception ids
  sources: string[];             // course-material references
}

export interface AnswerDecision {
  action: "approve" | "edit" | "reject";
  finalScore: number;
  finalFeedback: string;
  decidedBy: string;
  decidedAt: string;
}

export interface AnswerAttempt {
  n: number;                                  // Attempt 1, 2, … (FR-RESUB-02)
  text: string;
  image?: string;
  submittedAt: string;
  eval: AnswerEval;
  decision?: AnswerDecision;
  resubmitReason?: string;                    // instructor's stated reason
}

export type UnitStatus = "awaiting_review" | "resubmission_requested" | "final";

/** One (student × question) answer lineage — the unit of instructor review. */
export interface ReviewUnit {
  id: string;
  assignmentId: string;
  courseId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  attempts: AnswerAttempt[];
  status: UnitStatus;
}

export const latestAttempt = (u: ReviewUnit): AnswerAttempt => u.attempts[u.attempts.length - 1];
export const finalScoreOf = (u: ReviewUnit): number | null => {
  const d = latestAttempt(u).decision;
  return u.status === "final" && d ? d.finalScore : null;
};

// ── Misconceptions / students / audit / remedial ─────────────────────────────
export interface MisconceptionDef {
  id: string;
  text: string;
  topicId: string;
  markers: string[];      // phrases the evaluation scans student answers for
}

export interface StudentInfo {
  id: string;
  name: string;
  avg: number;
  trend: "improving" | "stable" | "declining";
  gaps: string[];
  sessions: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  courseId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  questionLabel: string;
  action: "approve" | "edit" | "reject" | "resubmit" | "visibility" | "reopen";
  aiScore: number | null;
  finalScore: number | null;
  instructor: string;
  note?: string;
  visibilityBefore?: boolean;
  visibilityAfter?: boolean;
}

export interface RemedialDraft {
  id: string;
  courseId: string;
  topicId: string;
  misconceptionId?: string;
  type: "explanation" | "practice";
  title: string;
  body: string;
  audience: "all" | "affected" | "manual";
  manualIds: string[];
  status: "draft" | "published";
  createdAt: string;
}

// ── Time helpers ─────────────────────────────────────────────────────────────
const NOW = Date.now();
export const ago = (hours: number) => new Date(NOW - hours * 3600_000).toISOString();

export function fmtWhen(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}
export function fmtAgo(iso: string, lang: Lang): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return lang === "ar" ? `منذ ${mins} د` : `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return lang === "ar" ? `منذ ${h} س` : `${h}h ago`;
  const d = Math.round(h / 24);
  return lang === "ar" ? `منذ ${d} يوم` : `${d}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────
export const INSTRUCTOR_NAME = "Dr. Nadia Al-Manea";
export const DEMO_STUDENT_ID = "st-sarah";

export const COURSES: CourseInfo[] = [
  {
    id: "CS301",
    title: { en: "Data Structures & Algorithms", ar: "هياكل البيانات والخوارزميات" },
    isPersonal: false, week: 9, enrolled: 47, instructor: INSTRUCTOR_NAME, overall: 54,
    topics: [
      { id: "arrays", label: { en: "Arrays & Linked Lists", ar: "المصفوفات والقوائم المرتبطة" }, pct: 91, evidence: 12,
        materials: [{ id: "mat-a1", title: "Lecture 4 — Array layout", status: "approved", addedAt: ago(900) }, { id: "mat-a2", title: "Lecture 5 — Linked lists", status: "approved", addedAt: ago(880) }, { id: "mat-a3", title: "Problem set 1", status: "approved", addedAt: ago(860) }] },
      { id: "bfs", label: { en: "BFS / Graph Traversal", ar: "اجتياز الرسوم — BFS" }, pct: 74, evidence: 8,
        materials: [{ id: "mat-b1", title: "Lecture 6 §2 — Queue-based traversal", status: "approved", addedAt: ago(700) }, { id: "mat-b2", title: "Lecture 6 §1 — Graph representation", status: "approved", addedAt: ago(700) }] },
      { id: "dfs", label: { en: "DFS & Cycle Detection", ar: "DFS وكشف الدورات" }, pct: 55, evidence: 6,
        materials: [{ id: "mat-d1", title: "Lecture 6 §4 — Back edges", status: "approved", addedAt: ago(650) }, { id: "mat-d2", title: "Recitation notes — DFS", status: "pending", addedAt: ago(20) }] },
      { id: "bst", label: { en: "Binary Trees & BST", ar: "الأشجار الثنائية وBST" }, pct: 38, evidence: 4,
        materials: [{ id: "mat-t1", title: "Lecture 5 §1 — BST invariant", status: "approved", addedAt: ago(600) }, { id: "mat-t2", title: "Lecture 5 §3 — Traversals", status: "approved", addedAt: ago(600) }] },
      { id: "hash", label: { en: "Hash Tables", ar: "جداول التجزئة" }, pct: 22, evidence: 2,
        materials: [{ id: "mat-h1", title: "Lecture 7 — Collision resolution", status: "approved", addedAt: ago(500) }] },
      { id: "dijkstra", label: { en: "Dijkstra / Shortest Path", ar: "أقصر مسار — ديكسترا" }, pct: 0, evidence: 0, materials: [] },
    ],
  },
  {
    id: "CS302",
    title: { en: "Operating Systems", ar: "نظم التشغيل" },
    isPersonal: false, week: 7, enrolled: 54, instructor: INSTRUCTOR_NAME, overall: 61,
    topics: [
      { id: "processes", label: { en: "Processes & PCB", ar: "العمليات وPCB" }, pct: 78, evidence: 9,
        materials: [{ id: "mat-p1", title: "Lecture 2 — Process model", status: "approved", addedAt: ago(800) }] },
      { id: "threads", label: { en: "Threads & Concurrency", ar: "الخيوط والتزامن" }, pct: 64, evidence: 7,
        materials: [{ id: "mat-t3", title: "Lecture 3 — Threads", status: "approved", addedAt: ago(760) }] },
      { id: "scheduling", label: { en: "CPU Scheduling", ar: "جدولة المعالج" }, pct: 49, evidence: 5,
        materials: [{ id: "mat-s1", title: "Lecture 4 — Scheduling criteria", status: "approved", addedAt: ago(720) }] },
      { id: "memory", label: { en: "Memory Management", ar: "إدارة الذاكرة" }, pct: 31, evidence: 3,
        materials: [{ id: "mat-m1", title: "Lecture 5 — Paging", status: "approved", addedAt: ago(700) }] },
      { id: "deadlocks", label: { en: "Deadlocks", ar: "الجمود" }, pct: 0, evidence: 0, materials: [] },
    ],
  },
  {
    id: "MATH201",
    title: { en: "Probability & Statistics", ar: "الاحتمال والإحصاء" },
    isPersonal: false, week: 9, enrolled: 39, instructor: INSTRUCTOR_NAME, overall: 47,
    topics: [
      { id: "combinatorics", label: { en: "Combinatorics", ar: "التوافيق" }, pct: 66, evidence: 6,
        materials: [{ id: "mat-c1", title: "Lecture 3 — Counting", status: "approved", addedAt: ago(640) }] },
      { id: "randomvars", label: { en: "Random Variables", ar: "المتغيرات العشوائية" }, pct: 58, evidence: 5,
        materials: [{ id: "mat-r1", title: "Lecture 4 — RVs", status: "approved", addedAt: ago(620) }] },
      { id: "distributions", label: { en: "Distributions", ar: "التوزيعات" }, pct: 41, evidence: 4,
        materials: [{ id: "mat-d3", title: "Lecture 5 — Common distributions", status: "approved", addedAt: ago(600) }] },
      { id: "bayes", label: { en: "Bayes & Conditional Probability", ar: "بايز والاحتمال الشرطي" }, pct: 0, evidence: 0, materials: [] },
      { id: "hypothesis", label: { en: "Hypothesis Testing", ar: "اختبار الفرضيات" }, pct: 35, evidence: 3,
        materials: [{ id: "mat-h2", title: "Lecture 7 — Significance", status: "approved", addedAt: ago(560) }] },
    ],
  },
  {
    // Personal course — created by the individual learner. The whole instructor
    // module must be invisible here (FR-SCOPE-01..03).
    id: "LIN101",
    title: { en: "Self-Study · Linear Algebra Foundations", ar: "دراسة ذاتية · أساسات الجبر الخطي" },
    isPersonal: true, week: 4, enrolled: 1, instructor: "—", overall: 52,
    topics: [
      { id: "vectors", label: { en: "Vectors & Span", ar: "المتجهات والفضاء" }, pct: 61, evidence: 5, materials: [] },
      { id: "matrices", label: { en: "Matrix Operations", ar: "عمليات المصفوفات" }, pct: 44, evidence: 3, materials: [] },
    ],
  },
];

export const INSTRUCTOR_COURSE_IDS = ["CS301", "CS302", "MATH201"];
export const STUDENT_INSTITUTIONAL_IDS = ["CS301", "CS302"];
export const STUDENT_PERSONAL_IDS = ["LIN101"];

export const STUDENTS: StudentInfo[] = [
  { id: "st-moh", name: "Mohammed Al-Rashidi", avg: 27, trend: "stable", gaps: ["dijkstra", "hash"], sessions: 2 },
  { id: "st-lina", name: "Lina Hassan", avg: 31, trend: "improving", gaps: ["bst", "bfs"], sessions: 4 },
  { id: "st-tariq", name: "Tariq Al-Nasser", avg: 34, trend: "declining", gaps: ["dijkstra", "dfs"], sessions: 1 },
  { id: "st-nour", name: "Nour Al-Qahtani", avg: 36, trend: "stable", gaps: ["hash", "dfs"], sessions: 3 },
  { id: "st-faris", name: "Faris Ibrahim", avg: 38, trend: "improving", gaps: ["dfs"], sessions: 5 },
  { id: "st-sara", name: "Sara Al-Otaibi", avg: 41, trend: "stable", gaps: ["hash"], sessions: 2 },
  { id: "st-omar", name: "Omar Haddad", avg: 44, trend: "improving", gaps: ["bst"], sessions: 6 },
  { id: "st-huda", name: "Huda Mansour", avg: 29, trend: "declining", gaps: ["dfs", "hash"], sessions: 1 },
  { id: DEMO_STUDENT_ID, name: "Sarah Al-Rashidi", avg: 57, trend: "improving", gaps: ["hash"], sessions: 23 },
];

export const MISCONCEPTIONS: MisconceptionDef[] = [
  { id: "mc-bfs-stack", text: "Believes BFS uses a stack rather than a queue", topicId: "bfs", markers: ["stack"] },
  { id: "mc-dfs-backedge", text: "Confuses DFS tree edges with back edges when detecting cycles", topicId: "dfs", markers: ["tree edge", "visited set is enough", "visited flag"] },
  { id: "mc-hash-sorted", text: "Believes hash tables keep keys in sorted order", topicId: "hash", markers: ["sorted"] },
  { id: "mc-bst-balanced", text: "Assumes a BST is always height-balanced", topicId: "bst", markers: ["always balanced", "balanced by definition"] },
  { id: "mc-dijkstra-negative", text: "Believes Dijkstra is correct with negative edge weights", topicId: "dijkstra", markers: ["negative"] },
  { id: "mc-sched-fifo", text: "Assumes round-robin ignores the time quantum", topicId: "scheduling", markers: ["quantum does not matter", "ignores quantum"] },
  { id: "mc-bayes-base", text: "Ignores the base rate when applying Bayes' theorem", topicId: "bayes", markers: ["ignore the prior", "prior does not matter"] },
];

export const ASSIGNMENTS: AssignmentDef[] = [
  {
    id: "as-cs301-3", courseId: "CS301",
    title: { en: "Assignment 3 — Graph Traversal & Shortest Paths", ar: "التكليف 3 — اجتياز الرسوم وأقصر المسارات" },
    status: "open", showScoreToStudent: true, createdAt: ago(96),
    questions: [
      {
        id: "q1", topicId: "bfs", maxScore: 10,
        prompt: { en: "Run BFS from vertex A on the attached graph and list the visit order. Name the data structure that makes level-order traversal possible and justify it in one sentence.", ar: "نفّذ BFS من الرأس A على الرسم المرفق واكتب ترتيب الزيارة. سمِّ بنية البيانات التي تتيح الاجتياز بالمستويات وبرّر ذلك في جملة واحدة." },
        referenceAnswer: "Visit order A, B, C, D, E, F (level order). BFS requires a FIFO queue: vertices are expanded in the order discovered, which guarantees level-by-level exploration and shortest unweighted paths.",
        rubric: "4 pts correct order · 3 pts names FIFO queue · 3 pts justification ties queue ordering to level-order guarantee.",
        keyTerms: ["queue", "fifo", "level", "visited", "order"],
      },
      {
        id: "q2", topicId: "dfs", maxScore: 10,
        prompt: { en: "Explain how DFS detects a cycle in a directed graph. State precisely which edge class proves the cycle exists.", ar: "اشرح كيف يكشف DFS دورة في رسم موجه. حدد بدقة أي صنف من الحواف يثبت وجود الدورة." },
        rubric: "5 pts identifies back edge · 3 pts explains grey/active ancestor on the recursion stack · 2 pts distinguishes tree vs back edge.",
        keyTerms: ["back edge", "cycle", "ancestor", "recursion", "dfs"],
      },
      {
        id: "q3", topicId: "dijkstra", maxScore: 15,
        prompt: { en: "Apply Dijkstra's algorithm to the weighted graph and give the shortest-path tree from source A, with final distances.", ar: "طبّق خوارزمية ديكسترا على الرسم الموزون وأعطِ شجرة أقصر المسارات من المصدر A مع المسافات النهائية." },
        keyTerms: ["priority", "relax", "distance", "extract"],
      },
    ],
  },
  {
    id: "as-cs301-2", courseId: "CS301",
    title: { en: "Assignment 2 — Hash Tables", ar: "التكليف 2 — جداول التجزئة" },
    status: "open", showScoreToStudent: false, createdAt: ago(220),
    questions: [
      {
        id: "q1", topicId: "hash", maxScore: 10,
        prompt: { en: "Compare separate chaining and open addressing under a rising load factor. When does each degrade?", ar: "قارن بين السلاسل المنفصلة والعنونة المفتوحة مع ارتفاع معامل الحمل. متى يتدهور أداء كل منهما؟" },
        referenceAnswer: "Chaining degrades gradually as average chain length grows with α; worst case O(n). Open addressing degrades sharply near α→1 due to clustering; most implementations rehash at α≈0.75.",
        rubric: "4 pts chaining behaviour · 4 pts open addressing clustering · 2 pts resize threshold.",
        keyTerms: ["load factor", "chain", "clustering", "resize", "collision"],
      },
      {
        id: "q2", topicId: "hash", maxScore: 8,
        prompt: { en: "Insert the keys 5, 15, 25 into a table of size 5 using linear probing and show the final layout.", ar: "أدرج المفاتيح 5 و15 و25 في جدول حجمه 5 باستخدام Sonding الخطي واعرض التخطيط النهائي." },
        rubric: "4 pts correct slots · 4 pts shows probe sequence.",
        keyTerms: ["probe", "slot", "mod", "collision"],
      },
    ],
  },
  {
    id: "as-cs301-1", courseId: "CS301",
    title: { en: "Assignment 1 — Arrays & Linked Lists", ar: "التكليف 1 — المصفوفات والقوائم المرتبطة" },
    status: "closed", showScoreToStudent: true, createdAt: ago(700),
    questions: [
      {
        id: "q1", topicId: "arrays", maxScore: 10,
        prompt: { en: "Why is indexed access O(1) in an array but O(n) in a singly linked list?", ar: "لماذا الوصول بالفهرس O(1) في المصفوفة لكنه O(n) في القائمة المترابطة الأحادية؟" },
        referenceAnswer: "Array elements are contiguous, so address = base + i·size is computed directly. A linked list stores no positional index, so reaching element i requires traversing i nodes.",
        rubric: "5 pts contiguity/address arithmetic · 5 pts traversal argument.",
        keyTerms: ["contiguous", "address", "traverse", "pointer"],
      },
    ],
  },
  {
    id: "as-cs302-1", courseId: "CS302",
    title: { en: "Assignment 1 — CPU Scheduling", ar: "التكليف 1 — جدولة المعالج" },
    status: "open", showScoreToStudent: false, createdAt: ago(140),
    questions: [
      {
        id: "q1", topicId: "scheduling", maxScore: 10,
        prompt: { en: "For the given arrival/burst table compute the average waiting time under RR with quantum 2.", ar: "لجدول الوصول/التنفيذ المعطى احسب متوسط زمن الانتظار باستخدام RR بكمّ 2." },
        rubric: "6 pts correct Gantt · 4 pts average waiting time.",
        keyTerms: ["quantum", "gantt", "waiting", "preempt"],
      },
      {
        id: "q2", topicId: "scheduling", maxScore: 8,
        prompt: { en: "When can SJF starve a process and what does ageing fix?", ar: "متى يمكن أن يجوّع SJF عملية وما الذي يصلحه التقادم؟" },
        rubric: "4 pts starvation condition · 4 pts ageing explanation.",
        keyTerms: ["starvation", "ageing", "priority", "wait"],
      },
    ],
  },
  {
    id: "as-math201-1", courseId: "MATH201",
    title: { en: "Assignment 1 — Conditional Probability", ar: "التكليف 1 — الاحتمال الشرطي" },
    status: "open", showScoreToStudent: true, createdAt: ago(120),
    questions: [
      {
        id: "q1", topicId: "bayes", maxScore: 10,
        prompt: { en: "A test is 95% sensitive and 90% specific; prevalence is 1%. Compute P(disease | positive).", ar: "اختبار حساسيته 95% ونوعيته 90% وانتشار المرض 1%. احسب ح(مرض | إيجابي)." },
        keyTerms: ["prior", "base rate", "likelihood", "posterior"],
      },
      {
        id: "q2", topicId: "distributions", maxScore: 10,
        prompt: { en: "State when a binomial model is appropriate and give its mean and variance.", ar: "اذكر متى يكون النموذج الثنائي مناسباً وأعطِ متوسطه وتباينه." },
        referenceAnswer: "Fixed n independent Bernoulli trials with constant p. Mean np, variance np(1−p).",
        rubric: "4 pts conditions · 3 pts mean · 3 pts variance.",
        keyTerms: ["independent", "bernoulli", "np", "variance"],
      },
    ],
  },
];

// ── Review units (seeded historical evaluations) ─────────────────────────────
const unit = (
  id: string, assignmentId: string, courseId: string, questionId: string,
  studentId: string, studentName: string, status: UnitStatus,
  attempts: AnswerAttempt[],
): ReviewUnit => ({ id, assignmentId, courseId, questionId, studentId, studentName, status, attempts });

const att = (n: number, text: string, submittedAt: string, ev: AnswerEval, extra?: Partial<AnswerAttempt>): AnswerAttempt =>
  ({ n, text, submittedAt, eval: ev, ...extra });

export const SEED_UNITS: ReviewUnit[] = [
  // ── CS301 · Assignment 3 · Q1 (BFS) — reference + rubric + material ⇒ mostly high
  unit("u-301-3-q1-moh", "as-cs301-3", "CS301", "q1", "st-moh", "Mohammed Al-Rashidi", "awaiting_review", [
    att(1, "Visit order: A, B, C, D, E, F. I used a queue because it expands vertices in discovery order, so everything at distance d is dequeued before distance d+1. Working on paper attached — my first attempt with a stack is crossed out because that is DFS, not BFS.", ago(40),
      { aiScore: 8, confidence: "high", feedback: "Correct level order and a sound FIFO justification; the handwritten trace confirms the queue discipline. Deducted for not stating the visited-mark timing, which risks double-enqueueing.", misconceptions: [], sources: ["CS301 · Lec 6 §2"] },
      { image: "/samples/handwritten-bfs.jpg" }),
  ]),
  unit("u-301-3-q1-lina", "as-cs301-3", "CS301", "q1", "st-lina", "Lina Hassan", "awaiting_review", [
    att(1, "Order A, B, C, D, E, F. BFS needs a FIFO queue: each dequeued vertex enqueues its unvisited neighbours, so the queue orders vertices by hop distance — that is exactly the level-order guarantee.", ago(39),
      { aiScore: 10, confidence: "high", feedback: "Complete and precise: correct order, correct structure, and the justification names the level-order guarantee explicitly.", misconceptions: [], sources: ["CS301 · Lec 6 §2", "CS301 · Lec 6 §1"] }),
  ]),
  unit("u-301-3-q1-tariq", "as-cs301-3", "CS301", "q1", "st-tariq", "Tariq Al-Nasser", "awaiting_review", [
    att(1, "Order A, B, D, C, E, F. BFS uses a stack of visited nodes so we always go deep first and then come back to the level.", ago(38),
      { aiScore: 4, confidence: "high", feedback: "The order mixes adjacency order with level order, and the structure named is a stack — that is DFS. Level-order traversal requires a FIFO queue.", misconceptions: ["mc-bfs-stack"], sources: ["CS301 · Lec 6 §2"] }),
  ]),
  unit("u-301-3-q1-nour", "as-cs301-3", "CS301", "q1", "st-nour", "Nour Al-Qahtani", "awaiting_review", [
    att(1, "A then B, C then D, E, F. A queue (FIFO) is required: vertices leave in the order they were discovered, which is what makes traversal level by level possible.", ago(37),
      { aiScore: 9, confidence: "high", feedback: "Correct order and structure with a valid justification; the visited-mark detail is implied but not stated.", misconceptions: [], sources: ["CS301 · Lec 6 §2"] }),
  ]),
  unit("u-301-3-q1-faris", "as-cs301-3", "CS301", "q1", "st-faris", "Faris Ibrahim", "awaiting_review", [
    att(1, "A, B, C, D, E, F. Queue I think.", ago(36),
      { aiScore: 6, confidence: "medium", feedback: "Order and structure are right but the required one-sentence justification is missing, so the level-order argument is unproven.", misconceptions: [], sources: ["CS301 · Lec 6 §2"] }),
  ]),
  // ── CS301 · Assignment 3 · Q2 (DFS cycles) — rubric only ⇒ medium/low
  unit("u-301-3-q2-moh", "as-cs301-3", "CS301", "q2", "st-moh", "Mohammed Al-Rashidi", "awaiting_review", [
    att(1, "DFS detects a cycle when it reaches a vertex already in the visited set. That means some tree edge closed a loop, so the cycle is proven by the tree edge.", ago(35),
      { aiScore: 4, confidence: "medium", feedback: "Reaching a visited vertex is not sufficient in a directed graph — the proving edge class is a back edge to an ancestor still active on the recursion stack.", misconceptions: ["mc-dfs-backedge"], sources: ["CS301 · Lec 6 §4"] }),
  ]),
  unit("u-301-3-q2-lina", "as-cs301-3", "CS301", "q2", "st-lina", "Lina Hassan", "awaiting_review", [
    att(1, "During DFS each vertex is active while its recursion frame is open. If we meet an edge to a vertex that is still active — a back edge — then that edge returns to an ancestor on the current path, which is exactly a cycle. Tree edges cannot prove a cycle because they build the DFS forest.", ago(34),
      { aiScore: 9, confidence: "medium", feedback: "Correct back-edge identification with the active-ancestor argument and an explicit tree/back distinction. Rubric fully satisfied; held at medium because no reference answer anchors the phrasing.", misconceptions: [], sources: ["CS301 · Lec 6 §4"] }),
  ]),
  unit("u-301-3-q2-tariq", "as-cs301-3", "CS301", "q2", "st-tariq", "Tariq Al-Nasser", "awaiting_review", [
    att(1, "If DFS visits a node twice there is a cycle.", ago(33),
      { aiScore: 3, confidence: "low", feedback: "Too thin to grade against the rubric: no edge class named, no directed/undirected distinction, no recursion-stack argument.", misconceptions: [], sources: ["CS301 · Lec 6 §4"] }),
  ]),
  unit("u-301-3-q2-sara", "as-cs301-3", "CS301", "q2", "st-sara", "Sara Al-Otaibi", "awaiting_review", [
    att(1, "A cycle exists when DFS finds an edge pointing to a vertex on the current recursion stack; that edge is a back edge. In undirected graphs the same idea needs the parent-edge exclusion.", ago(32),
      { aiScore: 8, confidence: "medium", feedback: "Strong answer: back edge named and the active-stack condition stated, plus the undirected caveat. Minor loss for not contrasting tree edges.", misconceptions: [], sources: ["CS301 · Lec 6 §4"] }),
  ]),
  // ── resubmission lineage: Huda, attempt 1 → requested → attempt 2 awaiting
  unit("u-301-3-q2-huda", "as-cs301-3", "CS301", "q2", "st-huda", "Huda Mansour", "awaiting_review", [
    att(1, "DFS finds cycles using the visited flag, which is enough for both directed and undirected graphs.", ago(31),
      { aiScore: 3, confidence: "medium", feedback: "The visited flag alone cannot distinguish a back edge from a cross edge in a directed graph.", misconceptions: ["mc-dfs-backedge"], sources: ["CS301 · Lec 6 §4"] },
      { resubmitReason: "You described the visited flag but not the edge class that proves a cycle. Re-read Lecture 6 §4 and resubmit naming back edges and the recursion-stack condition." }),
    att(2, "A back edge — an edge from a vertex to an ancestor still open on the recursion stack — proves the cycle. The visited flag alone is not enough in directed graphs because cross edges also reach visited vertices; only an active ancestor closes a path back onto itself.", ago(6),
      { aiScore: 8, confidence: "medium", feedback: "Attempt 2 resolves the earlier gap: back edge named, active-ancestor condition stated, and the visited-flag limitation explained.", misconceptions: [], sources: ["CS301 · Lec 6 §4"] }),
  ]),
  // ── CS301 · Assignment 3 · Q3 (Dijkstra) — topic has zero approved material ⇒ insufficient
  unit("u-301-3-q3-moh", "as-cs301-3", "CS301", "q3", "st-moh", "Mohammed Al-Rashidi", "awaiting_review", [
    att(1, "Distances: B 4, C 2, D 9, E 7, F 11. I relaxed edges in order of smallest known distance using a priority queue.", ago(30),
      { aiScore: null, confidence: "insufficient_evidence", feedback: "No approved course material exists for Dijkstra / Shortest Path, so this evaluation cannot be grounded. Mandatory manual review — no suggested score is issued.", misconceptions: [], sources: [] }),
  ]),
  unit("u-301-3-q3-lina", "as-cs301-3", "CS301", "q3", "st-lina", "Lina Hassan", "awaiting_review", [
    att(1, "Shortest-path tree from A: A→C (2), A→B (4), C→E (7), B→D (9), E→F (11). Extract-min from a priority queue, then relax outgoing edges.", ago(29),
      { aiScore: null, confidence: "insufficient_evidence", feedback: "Topic has zero approved materials; the pipeline returns insufficient_evidence instead of fabricating a confident score. Manual review required.", misconceptions: [], sources: [] }),
  ]),
  unit("u-301-3-q3-faris", "as-cs301-3", "CS301", "q3", "st-faris", "Faris Ibrahim", "awaiting_review", [
    att(1, "Dijkstra still works with negative edges as long as there is no negative cycle; distances B 4, C 2, D 8, E 7, F 12.", ago(28),
      { aiScore: null, confidence: "insufficient_evidence", feedback: "Ungrounded topic (no approved material) forces manual review. Note for the reviewer: the answer also asserts correctness under negative weights, which is false for Dijkstra.", misconceptions: ["mc-dijkstra-negative"], sources: [] }),
  ]),
  // ── already-finalised units on Assignment 3 (score visibility + audit demo)
  unit("u-301-3-q1-omar", "as-cs301-3", "CS301", "q1", "st-omar", "Omar Haddad", "final", [
    att(1, "A, B, C, D, E, F with a FIFO queue; the queue orders expansion by discovery time so levels complete in order.", ago(44),
      { aiScore: 9, confidence: "high", feedback: "Correct throughout.", misconceptions: [], sources: ["CS301 · Lec 6 §2"] },
      { decision: { action: "approve", finalScore: 9, finalFeedback: "Correct throughout.", decidedBy: INSTRUCTOR_NAME, decidedAt: ago(20) } }),
  ]),
  unit("u-301-3-q1-sara", "as-cs301-3", "CS301", "q1", "st-sara", "Sara Al-Otaibi", "final", [
    att(1, "Order A, B, C, D, E, F; queue based; visited marks on enqueue.", ago(43),
      { aiScore: 7, confidence: "high", feedback: "Solid, brief justification.", misconceptions: [], sources: ["CS301 · Lec 6 §2"] },
      { decision: { action: "edit", finalScore: 8, finalFeedback: "Raised to 8 — the visited-on-enqueue detail was credited after re-reading.", decidedBy: INSTRUCTOR_NAME, decidedAt: ago(19) } }),
  ]),
  // ── CS301 · Assignment 2 — reviewed; Sarah's q1 final, q2 resubmission requested
  unit("u-301-2-q1-sarah", "as-cs301-2", "CS301", "q1", DEMO_STUDENT_ID, "Sarah Al-Rashidi", "final", [
    att(1, "Chaining keeps a list per bucket so cost grows with the average chain length, roughly α. Open addressing stores everything in the table, so as α approaches 1 probing sequences cluster and searches degrade sharply; implementations rehash near α = 0.75.", ago(150),
      { aiScore: 8, confidence: "high", feedback: "Both degradation profiles correct with the resize threshold.", misconceptions: [], sources: ["CS301 · Lec 7 §4", "CS301 · Lec 7 §5"] },
      { decision: { action: "approve", finalScore: 8, finalFeedback: "Both degradation profiles correct with the resize threshold.", decidedBy: INSTRUCTOR_NAME, decidedAt: ago(120) } }),
  ]),
  unit("u-301-2-q2-sarah", "as-cs301-2", "CS301", "q2", DEMO_STUDENT_ID, "Sarah Al-Rashidi", "resubmission_requested", [
    att(1, "5 goes to slot 0, 15 also slot 0 so it goes to slot 1, 25 goes to slot 2. Final: [5, 15, 25, –, –].", ago(149),
      { aiScore: 5, confidence: "high", feedback: "Final layout is right but the probe sequence for 25 (0 → 1 → 2) is not shown, so the collision handling is unproven.", misconceptions: [], sources: ["CS301 · Lec 7 §4"] },
      { resubmitReason: "The layout is correct but I need to see your probe arithmetic for 25 (h(25)=0, then 1, then 2). Show each probe step and resubmit." }),
  ]),
  unit("u-301-2-q1-nour", "as-cs301-2", "CS301", "q1", "st-nour", "Nour Al-Qahtani", "final", [
    att(1, "Chaining degrades when chains get long; open addressing degrades near full tables because of clustering. Resize at 0.75.", ago(160),
      { aiScore: 7, confidence: "high", feedback: "Correct but terse.", misconceptions: [], sources: ["CS301 · Lec 7 §5"] },
      { decision: { action: "reject", finalScore: 6, finalFeedback: "Manual grade 6: the clustering mechanism was not explained, only named.", decidedBy: INSTRUCTOR_NAME, decidedAt: ago(118) } }),
  ]),
  // ── CS301 · Assignment 1 (closed) — historical
  unit("u-301-1-q1-sarah", "as-cs301-1", "CS301", "q1", DEMO_STUDENT_ID, "Sarah Al-Rashidi", "final", [
    att(1, "Arrays are contiguous so the address is base + i*size, computed in one step. A linked list has no index, so you must follow i pointers.", ago(690),
      { aiScore: 10, confidence: "high", feedback: "Textbook-correct.", misconceptions: [], sources: ["CS301 · Lec 4"] },
      { decision: { action: "approve", finalScore: 10, finalFeedback: "Textbook-correct.", decidedBy: INSTRUCTOR_NAME, decidedAt: ago(680) } }),
  ]),
  // ── CS302 · Assignment 1
  unit("u-302-1-q1-moh", "as-cs302-1", "CS302", "q1", "st-moh", "Mohammed Al-Rashidi", "awaiting_review", [
    att(1, "Gantt: P1(0-2) P2(2-4) P1(4-5) P3(5-7) P2(7-8). Average waiting 4.33.", ago(20),
      { aiScore: 7, confidence: "medium", feedback: "Gantt chart consistent with quantum 2; average waiting time off by one context switch — recheck P3's completion.", misconceptions: [], sources: ["CS302 · Lec 4"] }),
  ]),
  unit("u-302-1-q1-lina", "as-cs302-1", "CS302", "q1", "st-lina", "Lina Hassan", "awaiting_review", [
    att(1, "RR with quantum 2 preempts at each tick; my Gantt gives average waiting time 4.0.", ago(19),
      { aiScore: 9, confidence: "medium", feedback: "Correct Gantt and arithmetic; the quantum does matter — good that preemption points are marked.", misconceptions: [], sources: ["CS302 · Lec 4"] }),
  ]),
  unit("u-302-1-q2-tariq", "as-cs302-1", "CS302", "q2", "st-tariq", "Tariq Al-Nasser", "awaiting_review", [
    att(1, "SJF starves long jobs when short jobs keep arriving. The quantum does not matter here.", ago(18),
      { aiScore: 5, confidence: "medium", feedback: "Starvation condition is right; ageing is not addressed at all, and the quantum remark belongs to RR, not SJF.", misconceptions: ["mc-sched-fifo"], sources: ["CS302 · Lec 4"] }),
  ]),
  unit("u-302-1-q2-huda", "as-cs302-1", "CS302", "q2", "st-huda", "Huda Mansour", "awaiting_review", [
    att(1, "Starvation happens when a process waits indefinitely because shorter jobs always jump ahead; ageing raises priority with wait time so everyone eventually runs.", ago(17),
      { aiScore: 8, confidence: "medium", feedback: "Both halves answered correctly and concisely.", misconceptions: [], sources: ["CS302 · Lec 4"] }),
  ]),
  unit("u-302-1-q1-nour", "as-cs302-1", "CS302", "q1", "st-nour", "Nour Al-Qahtani", "awaiting_review", [
    att(1, "Average waiting time under RR(2) is 4.0; Gantt attached in text form.", ago(16),
      { aiScore: 8, confidence: "high", feedback: "Matches the reference Gantt; arithmetic verified.", misconceptions: [], sources: ["CS302 · Lec 4"] }),
  ]),
  // ── MATH201 · Assignment 1
  unit("u-m201-1-q1-moh", "as-math201-1", "MATH201", "q1", "st-moh", "Mohammed Al-Rashidi", "awaiting_review", [
    att(1, "P(D|+) = 0.95 / (0.95 + 0.10) ≈ 0.90.", ago(14),
      { aiScore: null, confidence: "insufficient_evidence", feedback: "Bayes & Conditional Probability has no approved material, so no grounded score can be produced. Manual review required. (Reviewer note: the base rate was dropped.)", misconceptions: ["mc-bayes-base"], sources: [] }),
  ]),
  unit("u-m201-1-q1-lina", "as-math201-1", "MATH201", "q1", "st-lina", "Lina Hassan", "awaiting_review", [
    att(1, "Using Bayes with the 1% prior: P(D|+) = (0.95·0.01) / (0.95·0.01 + 0.10·0.99) ≈ 0.0876.", ago(13),
      { aiScore: null, confidence: "insufficient_evidence", feedback: "Arithmetic and prior handling look right, but the topic has zero approved material so the pipeline withholds a score. Manual review required.", misconceptions: [], sources: [] }),
  ]),
  unit("u-m201-1-q2-sara", "as-math201-1", "MATH201", "q2", "st-sara", "Sara Al-Otaibi", "awaiting_review", [
    att(1, "Binomial applies with n fixed independent Bernoulli trials and constant p; mean np, variance np(1−p).", ago(12),
      { aiScore: 10, confidence: "high", feedback: "Conditions, mean and variance all correct against the reference answer.", misconceptions: [], sources: ["MATH201 · Lec 5"] }),
  ]),
  unit("u-m201-1-q2-tariq", "as-math201-1", "MATH201", "q2", "st-tariq", "Tariq Al-Nasser", "awaiting_review", [
    att(1, "Binomial when trials are independent; mean np.", ago(11),
      { aiScore: 5, confidence: "medium", feedback: "Conditions incomplete (constant p missing) and variance omitted.", misconceptions: [], sources: ["MATH201 · Lec 5"] }),
  ]),
  unit("u-m201-1-q2-nour", "as-math201-1", "MATH201", "q2", "st-nour", "Nour Al-Qahtani", "awaiting_review", [
    att(1, "n independent Bernoulli(p) trials; mean np and variance np(1−p).", ago(10),
      { aiScore: 9, confidence: "high", feedback: "Correct; brief but complete.", misconceptions: [], sources: ["MATH201 · Lec 5"] }),
  ]),
  unit("u-m201-1-q1-huda", "as-math201-1", "MATH201", "q1", "st-huda", "Huda Mansour", "awaiting_review", [
    att(1, "The prior does not matter much because the test is accurate, so P(D|+) ≈ 0.95.", ago(9),
      { aiScore: null, confidence: "insufficient_evidence", feedback: "Ungrounded topic forces manual review. Reviewer note: the answer dismisses the base rate, the classic Bayes error.", misconceptions: ["mc-bayes-base"], sources: [] }),
  ]),
];

// Sarah's in-progress draft on Assignment 3 (auto-saved, not submitted)
export const SEED_DRAFTS: Record<string, { text: string; image?: string; savedAt: string }> = {
  "as-cs301-3|q1": { text: "Starting from A I enqueue neighbours as I discover them… order so far A, B, C then D, E, F. Queue because FIFO keeps levels in order.", savedAt: ago(0.4) },
};

// ── Seeded audit trail (historical decisions) ────────────────────────────────
export const SEED_AUDIT: AuditEntry[] = [
  { id: "au-1", at: ago(20), courseId: "CS301", assignmentId: "as-cs301-3", assignmentTitle: "Assignment 3 — Graph Traversal & Shortest Paths", studentName: "Omar Haddad", questionLabel: "Q1 · BFS run & justification", action: "approve", aiScore: 9, finalScore: 9, instructor: INSTRUCTOR_NAME },
  { id: "au-2", at: ago(19), courseId: "CS301", assignmentId: "as-cs301-3", assignmentTitle: "Assignment 3 — Graph Traversal & Shortest Paths", studentName: "Sara Al-Otaibi", questionLabel: "Q1 · BFS run & justification", action: "edit", aiScore: 7, finalScore: 8, instructor: INSTRUCTOR_NAME, note: "Raised after re-reading: visited-on-enqueue credited." },
  { id: "au-3", at: ago(31), courseId: "CS301", assignmentId: "as-cs301-3", assignmentTitle: "Assignment 3 — Graph Traversal & Shortest Paths", studentName: "Huda Mansour", questionLabel: "Q2 · DFS cycle detection", action: "resubmit", aiScore: 3, finalScore: null, instructor: INSTRUCTOR_NAME, note: "Named the visited flag but not the proving edge class; asked to name back edges." },
  { id: "au-4", at: ago(118), courseId: "CS301", assignmentId: "as-cs301-2", assignmentTitle: "Assignment 2 — Hash Tables", studentName: "Nour Al-Qahtani", questionLabel: "Q1 · Chaining vs open addressing", action: "reject", aiScore: 7, finalScore: 6, instructor: INSTRUCTOR_NAME, note: "Manual grade: clustering named but not explained." },
  { id: "au-5", at: ago(120), courseId: "CS301", assignmentId: "as-cs301-2", assignmentTitle: "Assignment 2 — Hash Tables", studentName: "Sarah Al-Rashidi", questionLabel: "Q1 · Chaining vs open addressing", action: "approve", aiScore: 8, finalScore: 8, instructor: INSTRUCTOR_NAME },
  { id: "au-6", at: ago(121), courseId: "CS301", assignmentId: "as-cs301-2", assignmentTitle: "Assignment 2 — Hash Tables", studentName: "Sarah Al-Rashidi", questionLabel: "Q2 · Linear probing insert", action: "resubmit", aiScore: 5, finalScore: null, instructor: INSTRUCTOR_NAME, note: "Probe arithmetic for key 25 not shown." },
  { id: "au-7", at: ago(122), courseId: "CS301", assignmentId: "as-cs301-2", assignmentTitle: "Assignment 2 — Hash Tables", studentName: "—", questionLabel: "—", action: "visibility", aiScore: null, finalScore: null, instructor: INSTRUCTOR_NAME, visibilityBefore: true, visibilityAfter: false, note: "Hidden while re-checking Q2 grades." },
  { id: "au-8", at: ago(680), courseId: "CS301", assignmentId: "as-cs301-1", assignmentTitle: "Assignment 1 — Arrays & Linked Lists", studentName: "Sarah Al-Rashidi", questionLabel: "Q1 · O(1) vs O(n) access", action: "approve", aiScore: 10, finalScore: 10, instructor: INSTRUCTOR_NAME },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI EVALUATION PIPELINE — single implementation used by Preview (FR-AC-08/09)
// and by real submissions (FR-EVAL-01..06).
// ─────────────────────────────────────────────────────────────────────────────
export function evaluateAnswer(question: QuestionDef, answerText: string, course: CourseInfo): AnswerEval {
  const topic = course.topics.find((t) => t.id === question.topicId);
  const text = (answerText || "").trim();

  // FR-EVAL-04 — no reference, no rubric, and no sufficient course material.
  if (!topic || approvedMaterials(topic) === 0) {
    return {
      aiScore: null,
      confidence: "insufficient_evidence",
      feedback: `No approved course material exists for ${topic ? topic.label.en : question.topicId}, so this evaluation cannot be grounded. Mandatory manual review — no suggested score is issued.`,
      misconceptions: [],
      sources: [],
    };
  }

  const words = text.toLowerCase();
  const misconceptions = MISCONCEPTIONS.filter((m) => m.topicId === question.topicId && m.markers.some((k) => words.includes(k))).map((m) => m.id);

  if (text.length === 0) {
    return { aiScore: 0, confidence: "low", feedback: "Empty answer — nothing to evaluate.", misconceptions, sources: [] };
  }

  const matched = question.keyTerms.filter((k) => words.includes(k));
  const coverage = question.keyTerms.length ? matched.length / question.keyTerms.length : Math.min(1, text.length / 400);
  const structured = /(first|then|step|\d\s*[\).]|because|therefore|so that)/.test(words) ? 1 : 0.45;
  const lengthFactor = Math.min(1, text.length / 600);
  const raw = 0.55 * coverage + 0.25 * structured + 0.2 * lengthFactor;
  const aiScore = Math.max(0, Math.min(question.maxScore, Math.round(raw * question.maxScore)));

  let confidence: Confidence;
  const hasRef = Boolean(question.referenceAnswer);
  const hasRubric = Boolean(question.rubric);
  if (hasRef && hasRubric) confidence = coverage >= 0.5 ? "high" : "medium";
  else if (hasRubric) confidence = coverage >= 0.75 ? "high" : coverage >= 0.4 ? "medium" : "low";
  else confidence = text.length > 240 ? "medium" : "low";

  const missing = question.keyTerms.filter((k) => !words.includes(k));
  const parts: string[] = [];
  parts.push(
    matched.length
      ? `Grounded on ${matched.length}/${question.keyTerms.length} expected concepts (${matched.join(", ")}).`
      : "None of the expected key concepts for this topic appear in the answer.",
  );
  if (missing.length) parts.push(`Not addressed: ${missing.join(", ")}.`);
  if (misconceptions.length) parts.push("Detected misconception(s) consistent with a known class-wide error pattern.");
  if (!hasRef && !hasRubric) parts.push("No reference answer or rubric was provided, so confidence is capped.");
  parts.push(`Suggested score ${aiScore}/${question.maxScore}.`);

  return {
    aiScore,
    confidence,
    feedback: parts.join(" "),
    misconceptions,
    sources: topic.materials.filter((m) => m.status === "approved").slice(0, 2).map((m) => `${course.id} · ${m.title}`),
  };
}

// ── Derived helpers used across screens ──────────────────────────────────────
export const COURSE_BY_ID = (id: string): CourseInfo => COURSES.find((c) => c.id === id) ?? COURSES[0];

export function misconceptionText(id: string, lang: Lang): string {
  const m = MISCONCEPTIONS.find((x) => x.id === id);
  return m ? m.text : id;
}
