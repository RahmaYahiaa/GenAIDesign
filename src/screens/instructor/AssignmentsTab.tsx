import { AppState } from "../../components/AppShell";
import { tk } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, bFontFor, hFontFor } from "../../components/ModuleUI";
import { EmptyState } from "../../components/SharedUI";
import { IconPlus, IconClipboard } from "../../components/Icons";

// ─────────────────────────────────────────────────────────────────────────────
// Assignments tab — reference d3: a stacked list of assignment cards (not a
// table). Each card shows its status chip, a one-line meta summary with the
// pending-review count emphasised, and Close / Open controls.
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignmentsTab({ state, setState, courseId }: { state: AppState; setState: (s: AppState) => void; courseId: string }) {
  const { state: mod, setAssignmentStatus } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const assignments = mod.assignments.filter((a) => a.courseId === courseId);

  const openReview = (id: string) =>
    setState({ ...state, screen: "assignment-review", courseId, assignmentId: id, tab: "assignments" });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 14, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h2 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 20, color: tokens.textPrimary, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
            {lang === "ar" ? "التكليفات" : "Assignments"}
          </h2>
          <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
            {lang === "ar"
              ? "كل تكليف في هذا المقرر. المفتوح يبقى مفتوحاً حتى تغلقه بنفسك."
              : "Every assignment in this course. Open stays open until you close it."}
          </p>
        </div>
        <Btn tokens={tokens} lang={lang} onClick={() => setState({ ...state, screen: "assignment-create", courseId, assignmentId: undefined })}>
          <IconPlus size={13} color="#fff" />
          {lang === "ar" ? "تكليف جديد" : "New assignment"}
        </Btn>
      </div>

      {assignments.length === 0 ? (
        <Card tokens={tokens}>
          <EmptyState
            tokens={tokens}
            headFont={hFont}
            bodyFont={bFont}
            icon={<IconClipboard size={22} color={tokens.textFaint} />}
            title={lang === "ar" ? "لا تكليفات في هذا المقرر بعد" : "No assignments in this course yet"}
            description={lang === "ar" ? "أنشئ أول تكليف ليبدأ التسليم والتقييم المساعد بالذكاء الاصطناعي." : "Create the first assignment to open submission and AI-assisted evaluation."}
            ctaLabel={lang === "ar" ? "تكليف جديد" : "New assignment"}
            onCta={() => setState({ ...state, screen: "assignment-create", courseId, assignmentId: undefined })}
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {assignments.map((a) => {
            const units = mod.units.filter((u) => u.assignmentId === a.id);
            const received = units.length;
            const pending = units.filter((u) => u.status === "awaiting_review").length;
            const topics = new Set(a.questions.map((q) => q.topicId)).size;
            const open = a.status === "open";
            return (
              <Card tokens={tokens} key={a.id} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ textAlign: isRtl ? "right" : "left", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                        {lang === "ar" ? a.title.ar : a.title.en}
                      </span>
                      <Chip tokens={tokens} tone={open ? "primary" : "slate"}>
                        {open ? (lang === "ar" ? "مفتوح" : "Open") : (lang === "ar" ? "مغلق" : "Closed")}
                      </Chip>
                    </div>
                    <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textMuted, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span>{received} {lang === "ar" ? "تسلّم" : "received"}</span>
                      <span>·</span>
                      <span style={{ fontWeight: pending > 0 ? 700 : 500, color: pending > 0 ? tokens.primary : tokens.textMuted }}>
                        {pending} {lang === "ar" ? "بانتظار المراجعة" : "pending review"}
                      </span>
                      <span>·</span>
                      <span>{topics} {lang === "ar" ? (topics === 1 ? "موضوع" : "مواضيع") : (topics === 1 ? "topic" : "topics")}</span>
                      <span>·</span>
                      <span>{a.questions.length} {lang === "ar" ? (a.questions.length === 1 ? "سؤال" : "أسئلة") : (a.questions.length === 1 ? "question" : "questions")}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    {open && (
                      <Btn
                        tokens={tokens}
                        lang={lang}
                        variant="ghost"
                        title={lang === "ar" ? "إغلاق يدوي — يعطّل التسليم ويبقي سجل المراجعة" : "Manual close — disables submission, keeps review history"}
                        onClick={() => setAssignmentStatus(a.id, "closed")}
                        style={{ padding: "8px 16px", fontSize: 12.5 }}
                      >
                        {lang === "ar" ? "إغلاق" : "Close"}
                      </Btn>
                    )}
                    <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => openReview(a.id)} style={{ padding: "8px 16px", fontSize: 12.5 }}>
                      {lang === "ar" ? "فتح" : "Open"}
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
