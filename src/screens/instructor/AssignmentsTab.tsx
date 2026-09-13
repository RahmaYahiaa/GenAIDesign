import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, StatusPill, bFontFor, hFontFor, Th } from "../../components/ModuleUI";
import { EmptyState } from "../../components/SharedUI";
import { IconPlus, IconClipboard, IconBan, IconRefresh, IconEye, IconEyeOff, IconArrowRight, IconArrowLeft, IconClock } from "../../components/Icons";
import { fmtAgo } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Assignments list — the middle screen between the course workspace and an
// individual assignment. Close/Reopen live here too, for convenience.
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignmentsTab({ state, setState, courseId }: { state: AppState; setState: (s: AppState) => void; courseId: string }) {
  const { state: mod, setAssignmentStatus } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

  const assignments = mod.assignments.filter((a) => a.courseId === courseId);
  const course = mod.courses.find((c) => c.id === courseId);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textMuted }}>
          {lang === "ar"
            ? "كل تكليفات هذا المقرر. المغلق يبقى قابلاً للاطلاع على تاريخ المراجعات مع تعطيل التسليم."
            : "Every assignment in this course. Closed assignments keep their full review history, with submission disabled."}
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
        <Card tokens={tokens} style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th tokens={tokens}>{lang === "ar" ? "التكليف" : "Assignment"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "الحالة" : "Status"}</Th>
                <Th tokens={tokens} align="right">{lang === "ar" ? "تسلّم" : "Received"}</Th>
                <Th tokens={tokens} align="right">{lang === "ar" ? "بانتظار المراجعة" : "Pending review"}</Th>
                <Th tokens={tokens} align="right">{lang === "ar" ? "المواضيع" : "Topics"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "الدرجة للطالب" : "Score visibility"}</Th>
                <Th tokens={tokens} align="right">{lang === "ar" ? "إجراءات" : "Actions"}</Th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => {
                const units = mod.units.filter((u) => u.assignmentId === a.id);
                const received = new Set(units.map((u) => u.studentId)).size;
                const answersReceived = units.reduce((s, u) => s + u.attempts.length, 0);
                const pending = units.filter((u) => u.status === "awaiting_review").length;
                const topics = new Set(a.questions.map((q) => q.topicId)).size;
                return (
                  <tr key={a.id} style={{ borderBottom: i < assignments.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
                    <td style={{ padding: "13px 16px", maxWidth: 340 }}>
                      <button
                        onClick={() => setState({ ...state, screen: "assignment-review", courseId, assignmentId: a.id, tab: "assignments" })}
                        style={{ display: "block", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: isRtl ? "right" : "left" }}
                      >
                        <div style={{ fontFamily: bFont, fontSize: 13, fontWeight: 600, color: tokens.textPrimary, marginBottom: 3 }}>{lang === "ar" ? a.title.ar : a.title.en}</div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <span>{a.questions.length} {lang === "ar" ? "أسئلة" : "questions"}</span>
                          <span>·</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconClock size={10} color={tokens.textFaint} />{fmtAgo(a.createdAt, lang)}</span>
                        </div>
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px" }}><StatusPill status={a.status} tokens={tokens} lang={lang} /></td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: tokens.textPrimary }}>{received}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9.5, color: tokens.textFaint }}>{answersReceived} {lang === "ar" ? "إجابة" : "answers"}</div>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: pending > 0 ? tokens.developing : tokens.noEvidence }}>{pending}</span>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: tokens.textSecondary }}>{topics}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: bFont, fontSize: 11, color: a.showScoreToStudent ? tokens.primary : tokens.textFaint }}>
                        {a.showScoreToStudent ? <IconEye size={13} color={tokens.primary} /> : <IconEyeOff size={13} color={tokens.textFaint} />}
                        {a.showScoreToStudent ? (lang === "ar" ? "ظاهرة" : "Visible") : (lang === "ar" ? "مخفية" : "Hidden")}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => setState({ ...state, screen: "assignment-review", courseId, assignmentId: a.id, tab: "assignments" })} style={{ padding: "5px 10px", fontSize: 11 }}>
                          {lang === "ar" ? "مراجعة" : "Review"}
                          <Arrow size={12} color={tokens.primary} />
                        </Btn>
                        {a.status === "open" ? (
                          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setAssignmentStatus(a.id, "closed")} style={{ padding: "5px 10px", fontSize: 11 }} title={lang === "ar" ? "إغلاق يدوي — يعطّل التسليم" : "Manual close — disables submission"}>
                            <IconBan size={12} color={tokens.textMuted} />
                            {lang === "ar" ? "إغلاق" : "Close"}
                          </Btn>
                        ) : (
                          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setAssignmentStatus(a.id, "open")} style={{ padding: "5px 10px", fontSize: 11 }} title={lang === "ar" ? "إعادة فتح يدوية" : "Manual reopen"}>
                            <IconRefresh size={12} color={tokens.textMuted} />
                            {lang === "ar" ? "إعادة فتح" : "Reopen"}
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {course && (
        <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 14, lineHeight: 1.6, textAlign: isRtl ? "right" : "left" }}>
          {lang === "ar"
            ? "لا مواعيد نهائية في هذه الوحدة: التكليف مفتوح أو مغلق فقط، ويتحكم المدرّس بالحالة يدوياً."
            : "No deadlines exist in this module: an assignment is simply Open or Closed, controlled manually by the instructor."}
        </p>
      )}
    </>
  );
}
