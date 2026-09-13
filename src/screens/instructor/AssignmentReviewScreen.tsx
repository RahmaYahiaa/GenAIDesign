import { useMemo, useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import {
  Card, Btn, Chip, StatusPill, ConfidencePill, ScoreValue, VisibilityControl, Modal,
  AlertStrip, Field, inputStyle, textareaStyle, bFontFor, hFontFor, Th,
} from "../../components/ModuleUI";
import { CitationChip } from "../../components/SharedUI";
import {
  IconArrowRight, IconArrowLeft, IconDoubleCheck, IconCheck, IconPencil, IconBan,
  IconReply, IconWarning, IconSparkle, IconHistory, IconRefresh, IconImageAttach,
  IconEye, IconGear,
} from "../../components/Icons";
import RemedialPanel, { RemedialEntry } from "../../components/RemedialPanel";
import {
  ReviewUnit, latestAttempt, misconceptionText, fmtWhen, COURSE_BY_ID,
} from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Assignment Review (FR-REV-*, FR-VIS-*, FR-ERR-*, part of FR-RESUB-*).
// Order on screen: common-errors summary → quick-approval group → needs-review
// group → finalized history. Individual submissions open a detail view with
// exactly four actions plus an attempt switcher.
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignmentReviewScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, decide, requestResubmission, reopenUnit, bulkApprove, setScoreVisibility } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

  const assignment = mod.assignments.find((a) => a.id === state.assignmentId);
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);
  const [resubmitFor, setResubmitFor] = useState<string | null>(null);
  const [resubmitReason, setResubmitReason] = useState("");
  const [remedialEntry, setRemedialEntry] = useState<RemedialEntry | null>(null);

  const units = useMemo(() => mod.units.filter((u) => u.assignmentId === state.assignmentId), [mod.units, state.assignmentId]);

  // FR-ERR-01/02 — aggregate misconceptions across this assignment's submissions.
  const totalSubs = units.length || 1;
  const misAgg = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of units) {
      const seen = new Set<string>();
      for (const a of u.attempts) for (const m of a.eval.misconceptions) seen.add(m);
      for (const m of seen) counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([id, count]) => ({ id, count, pct: Math.round((count / totalSubs) * 100) }))
      .filter((x) => x.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [units, totalSubs]);

  if (!assignment) {
    return (
      <div style={{ padding: 40, fontFamily: bFont, color: tokens.textMuted }}>
        {lang === "ar" ? "التكليف غير موجود." : "Assignment not found."}
      </div>
    );
  }

  const course = COURSE_BY_ID(assignment.courseId);
  const qLabel = (u: ReviewUnit) => {
    const i = assignment.questions.findIndex((q) => q.id === u.questionId);
    return `Q${i + 1}`;
  };
  const qTopic = (u: ReviewUnit) => {
    const q = assignment.questions.find((x) => x.id === u.questionId);
    const t = course.topics.find((x) => x.id === q?.topicId);
    return t ? t.label[lang] : "";
  };
  const qMax = (u: ReviewUnit) => assignment.questions.find((q) => q.id === u.questionId)?.maxScore ?? 10;

  const pending = units.filter((u) => u.status === "awaiting_review");
  const quick = pending.filter((u) => {
    const ev = latestAttempt(u).eval;
    return ev.confidence === "high" && ev.aiScore !== null;
  });
  const needs = pending.filter((u) => !quick.includes(u));
  const resubPending = units.filter((u) => u.status === "resubmission_requested");
  const finalized = units.filter((u) => u.status === "final");

  // FR-VIS-04 — how many students currently see a graded score under this assignment.
  const visibleGradedCount = finalized.length;

  const toggleVisibility = () => {
    if (assignment.showScoreToStudent && visibleGradedCount > 0) setConfirmHide(true);
    else setScoreVisibility(assignment.id, !assignment.showScoreToStudent);
  };

  const unitRow = (u: ReviewUnit) => {
    const last = latestAttempt(u);
    return (
      <tr key={u.id} style={{ borderBottom: `1px solid ${tokens.cardBorder}` }}>
        <td style={{ padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Chip tokens={tokens} tone="primary">{qLabel(u)}</Chip>
            <span style={{ fontFamily: bFont, fontSize: 12.5, fontWeight: 500, color: tokens.textPrimary }}>{u.studentName}</span>
            {u.attempts.length > 1 && (
              <Chip tokens={tokens} tone="peri"><IconHistory size={10} color={tokens.developing} />{u.attempts.length}</Chip>
            )}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginTop: 3, paddingInlineStart: 4 }}>{qTopic(u)}</div>
        </td>
        <td style={{ padding: "10px 14px", maxWidth: 380 }}>
          <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {last.eval.feedback.split(". ")[0]}.
          </div>
        </td>
        <td style={{ padding: "10px 14px" }}><ScoreValue kind="ai" score={last.eval.aiScore} max={qMax(u)} tokens={tokens} lang={lang} /></td>
        <td style={{ padding: "10px 14px" }}><ConfidencePill confidence={last.eval.confidence} tokens={tokens} lang={lang} /></td>
        <td style={{ padding: "10px 14px", textAlign: "right" }}>
          <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => setOpenUnit(u.id)} style={{ padding: "5px 10px", fontSize: 11 }}>
            {lang === "ar" ? "فتح" : "Open"}
            <Arrow size={12} color={tokens.primary} />
          </Btn>
        </td>
      </tr>
    );
  };

  const detail = openUnit ? units.find((u) => u.id === openUnit) : null;

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left", minWidth: 0 }}>
          <button
            onClick={() => setState({ ...state, screen: "course-workspace", tab: "assignments" })}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10.5, color: tokens.textMuted, padding: 0, marginBottom: 8 }}
          >
            <Arrow size={12} color={tokens.textMuted} />
            {lang === "ar" ? "كل التكليفات" : "ALL ASSIGNMENTS"}
          </button>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 20, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: 0 }}>
              {lang === "ar" ? assignment.title.ar : assignment.title.en}
            </h1>
            <StatusPill status={assignment.status} tokens={tokens} lang={lang} />
          </div>
          <p style={{ fontSize: 12, color: tokens.textMuted, margin: "4px 0 0", fontFamily: bFont }}>
            {assignment.questions.length} {lang === "ar" ? "أسئلة" : "questions"} · {units.length} {lang === "ar" ? "إجابة مُقيّمة" : "evaluated answers"} · {course.id}
          </p>
        </div>

        {/* Live score-visibility control (FR-VIS-02, reachable mid-grading) */}
        <Card tokens={tokens} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <IconGear size={14} color={tokens.textMuted} />
          <VisibilityControl on={assignment.showScoreToStudent} onChange={toggleVisibility} tokens={tokens} lang={lang} />
          <span style={{ fontFamily: bFont, fontSize: 10.5, color: tokens.textFaint, maxWidth: 190, lineHeight: 1.45 }}>
            {lang === "ar" ? "إعداد حي — يمكن تغييره في أي وقت، قبل النشر أو بعده أو أثناء المراجعة." : "Live setting — change it any time: before publish, after publish, or mid-review."}
          </span>
        </Card>
      </div>

      {detail ? (
        <UnitDetail
          key={detail.id}
          state={state}
          setState={setState}
          unit={detail}
          qLabel={qLabel(detail)}
          qTopic={qTopic(detail)}
          qMax={qMax(detail)}
          onBack={() => setOpenUnit(null)}
          onResubmit={() => { setResubmitFor(detail.id); setResubmitReason(""); }}
        />
      ) : (
        <>
          {/* ── Common Errors Summary — shown BEFORE any individual submission ── */}
          <Card tokens={tokens} style={{ marginBottom: 18, borderInlineStartWidth: 3, borderInlineStartColor: tokens.gap }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                {lang === "ar" ? "ملخص الأخطاء الشائعة" : "Common errors summary"}
              </div>
              <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{lang === "ar" ? "عبر كل إجابات التكليف" : "across all submissions"}</span>
            </div>
            {misAgg.length === 0 ? (
              <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textMuted, margin: "8px 0 0", lineHeight: 1.6 }}>
                {lang === "ar"
                  ? "لم يُعثر على نمط خطأ متكرر في هذه الدفعة — لا تصنيف مُفتعل هنا."
                  : "No recurring error pattern was found in this cohort — nothing is forced into a category."}
              </p>
            ) : (
              misAgg.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${tokens.cardBorder}`, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textPrimary, lineHeight: 1.5 }}>{misconceptionText(m.id, lang)}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginTop: 3 }}>
                      {m.count} / {totalSubs} {lang === "ar" ? "إجابة" : "submissions"} · {m.pct}%
                    </div>
                  </div>
                  <div style={{ width: 90, flexShrink: 0 }}>
                    <div style={{ height: 5, background: tokens.inset, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${m.pct}%`, background: tokens.gap, borderRadius: 3 }} />
                    </div>
                  </div>
                  <Btn tokens={tokens} lang={lang} variant="violet" onClick={() => setRemedialEntry({ courseId: assignment.courseId, topicId: assignment.questions[0]?.topicId ?? "", misconceptionId: m.id })} style={{ flexShrink: 0 }}>
                    <IconSparkle size={12} color={tokens.gap} />
                    {lang === "ar" ? "توليد محتوى علاجي" : "Generate remedial content"}
                  </Btn>
                </div>
              ))
            )}
          </Card>

          {/* ── Group 1: ready for quick approval ── */}
          <Card tokens={tokens} style={{ marginBottom: 18, borderInlineStartWidth: 3, borderInlineStartColor: tokens.mastered }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 12, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>{lang === "ar" ? "جاهز للاعتماد السريع" : "Ready for quick approval"}</div>
                <Chip tokens={tokens} tone="primary">{quick.length}</Chip>
                <ConfidencePill confidence="high" tokens={tokens} lang={lang} />
              </div>
              <Btn tokens={tokens} lang={lang} onClick={() => setConfirmBulk(true)} disabled={quick.length === 0}>
                <IconDoubleCheck size={14} color="#fff" />
                {lang === "ar" ? `اعتماد جماعي (${quick.length})` : `Bulk approve (${quick.length})`}
              </Btn>
            </div>
            <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, margin: "0 0 10px", lineHeight: 1.55 }}>
              {lang === "ar"
                ? "كل إجابة قيّمها الذكاء الاصطناعي بثقة عالية. الاعتماد الجماعي ليس نهائياً — تبقى كل إجابة قابلة للفتح والتعديل بعده."
                : "Every answer the AI evaluated with high confidence. Bulk approval is not irreversible — each item stays reopenable and editable afterwards."}
            </p>
            {quick.length === 0 ? (
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint, padding: "6px 0" }}>
                {lang === "ar" ? "لا عناصر حالياً في هذه المجموعة." : "Nothing in this group right now."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th tokens={tokens}>{lang === "ar" ? "السؤال · الطالب" : "Question · Student"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "سطر التغذية الراجعة" : "One-line feedback"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "الدرجة المقترحة" : "Suggested score"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "الثقة" : "Confidence"}</Th>
                    <Th tokens={tokens} align="right"></Th>
                  </tr>
                </thead>
                <tbody>{quick.map(unitRow)}</tbody>
              </table>
            )}
          </Card>

          {/* ── Group 2: needs your review ── */}
          <Card tokens={tokens} style={{ marginBottom: 18, borderInlineStartWidth: 3, borderInlineStartColor: tokens.developing }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>{lang === "ar" ? "يحتاج مراجعتك" : "Needs your review"}</div>
              <Chip tokens={tokens} tone="peri">{needs.length}</Chip>
            </div>
            <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, margin: "0 0 10px", lineHeight: 1.55 }}>
              {lang === "ar"
                ? "ثقة متوسطة أو منخفضة أو أدلة غير كافية — تُفتح وتُراجع فردياً دائماً."
                : "Medium, low, or insufficient-evidence evaluations — always opened and reviewed individually."}
            </p>
            {needs.length === 0 ? (
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint, padding: "6px 0" }}>
                {lang === "ar" ? "لا عناصر بانتظار المراجعة الفردية." : "No items awaiting individual review."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th tokens={tokens}>{lang === "ar" ? "السؤال · الطالب" : "Question · Student"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "سطر التغذية الراجعة" : "One-line feedback"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "الدرجة المقترحة" : "Suggested score"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "الثقة" : "Confidence"}</Th>
                    <Th tokens={tokens} align="right"></Th>
                  </tr>
                </thead>
                <tbody>{needs.map(unitRow)}</tbody>
              </table>
            )}
            {resubPending.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <AlertStrip
                  tokens={tokens}
                  lang={lang}
                  tone="peri"
                  icon={<IconReply size={13} color={tokens.developing} />}
                  title={lang === "ar" ? `${resubPending.length} إجابة أعيد تسليمها وتنتظر تقييمها` : `${resubPending.length} resubmitted answer(s) awaiting evaluation`}
                  body={resubPending.map((u) => `${u.studentName} · ${qLabel(u)}`).join("  ·  ")}
                />
              </div>
            )}
          </Card>

          {/* ── Finalized history (kept viewable on closed assignments) ── */}
          <Card tokens={tokens}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>{lang === "ar" ? "السجل النهائي" : "Finalized history"}</div>
              <Chip tokens={tokens}>{finalized.length}</Chip>
              <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint }}>
                {lang === "ar" ? "يبقى متاحاً حتى بعد إغلاق التكليف." : "Remains viewable after the assignment is closed."}
              </span>
            </div>
            {finalized.length === 0 ? (
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>
                {lang === "ar" ? "لا قرارات نهائية بعد." : "No finalized decisions yet."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th tokens={tokens}>{lang === "ar" ? "السؤال · الطالب" : "Question · Student"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "مقترحة ← نهائية" : "Suggested → final"}</Th>
                    <Th tokens={tokens}>{lang === "ar" ? "الإجراء" : "Action"}</Th>
                    <Th tokens={tokens} align="right"></Th>
                  </tr>
                </thead>
                <tbody>
                  {finalized.map((u) => {
                    const last = latestAttempt(u);
                    const d = last.decision;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${tokens.cardBorder}` }}>
                        <td style={{ padding: "9px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                            <Chip tokens={tokens} tone="primary">{qLabel(u)}</Chip>
                            <span style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textPrimary }}>{u.studentName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "9px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                            <ScoreValue kind="ai" score={last.eval.aiScore} max={qMax(u)} tokens={tokens} lang={lang} />
                            <span style={{ color: tokens.textFaint, fontSize: 11 }}>→</span>
                            <ScoreValue kind="final" score={d?.finalScore ?? null} max={qMax(u)} tokens={tokens} lang={lang} />
                          </div>
                        </td>
                        <td style={{ padding: "9px 14px" }}>
                          <Chip tokens={tokens} tone={d?.action === "approve" ? "primary" : d?.action === "edit" ? "peri" : "violet"}>
                            {d?.action === "approve" ? (lang === "ar" ? "اعتماد" : "APPROVE") : d?.action === "edit" ? (lang === "ar" ? "تعديل" : "EDIT") : (lang === "ar" ? "رفض" : "REJECT")}
                          </Chip>
                        </td>
                        <td style={{ padding: "9px 14px", textAlign: "right" }}>
                          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setOpenUnit(u.id)} style={{ padding: "5px 10px", fontSize: 11 }}>
                            {lang === "ar" ? "فتح" : "Open"}
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      {/* ── Bulk approve confirmation (exactly one confirmation, FR-REV-06) ── */}
      <Modal
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? `اعتماد ${quick.length} إجابة دفعة واحدة` : `Approve ${quick.length} submissions at once`}
        subtitle={lang === "ar"
          ? "سيُعوتمد درجة الذكاء الاصطناعي كما هي لكل عنصر عالي الثقة. يمكنك فتح أي عنصر وتعديله لاحقاً."
          : "Each high-confidence item will be finalized with the AI-suggested score as-is. Any item can still be reopened and edited afterwards."}
      >
        <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 14, border: `1px solid ${tokens.cardBorder}`, borderRadius: 9, padding: "6px 10px" }}>
          {quick.map((u) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${tokens.insetBorder}`, fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary }}>
              <span>{qLabel(u)} · {u.studentName}</span>
              <span style={{ fontFamily: MONO, color: tokens.developing }}>{latestAttempt(u).eval.aiScore}/{qMax(u)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setConfirmBulk(false)}>{lang === "ar" ? "إلغاء" : "Cancel"}</Btn>
          <Btn tokens={tokens} lang={lang} onClick={() => { bulkApprove(quick.map((u) => u.id)); setConfirmBulk(false); }}>
            <IconDoubleCheck size={13} color="#fff" />
            {lang === "ar" ? "تأكيد الاعتماد الجماعي" : "Confirm bulk approve"}
          </Btn>
        </div>
      </Modal>

      {/* ── Visibility-off confirmation naming affected students (FR-VIS-04) ── */}
      <Modal
        open={confirmHide}
        onClose={() => setConfirmHide(false)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? "إخفاء الدرجات المرئية حالياً" : "Hide currently visible scores"}
        subtitle={lang === "ar"
          ? `${visibleGradedCount} طالباً يرون درجة نهائية معتمدة الآن تحت هذا التكليف. سيخسرون رؤيتها فور التطبيق.`
          : `${visibleGradedCount} student(s) currently see a finalized graded score under this assignment. They will lose visibility of it the moment this applies.`}
      >
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setConfirmHide(false)}>{lang === "ar" ? "تراجع" : "Keep visible"}</Btn>
          <Btn tokens={tokens} lang={lang} variant="violet" onClick={() => { setScoreVisibility(assignment.id, false); setConfirmHide(false); }}>
            <IconEye size={13} color={tokens.gap} />
            {lang === "ar" ? `إخفاء عن ${visibleGradedCount} طالباً` : `Hide from ${visibleGradedCount} student(s)`}
          </Btn>
        </div>
      </Modal>

      {/* ── Request resubmission (mandatory reason, FR-RESUB-01) ── */}
      <Modal
        open={resubmitFor !== null}
        onClose={() => setResubmitFor(null)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? "طلب إعادة تسليم" : "Request resubmission"}
        subtitle={lang === "ar"
          ? "السبب إلزامي ويُعرض للطالب بجانب إجابته السابقة. لا تُسجَّل درجة نهائية."
          : "The reason is mandatory and is shown to the student next to their previous answer. No final grade is recorded."}
      >
        <Field label={lang === "ar" ? "السبب (إلزامي)" : "Reason (required)"} tokens={tokens} lang={lang} required>
          <textarea value={resubmitReason} onChange={(e) => setResubmitReason(e.target.value)} style={textareaStyle(tokens, bFont)} className="genai-input" placeholder={lang === "ar" ? "ما الذي يجب أن يصلحه الطالب بالضبط؟" : "What exactly must the student fix?"} />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setResubmitFor(null)}>{lang === "ar" ? "إلغاء" : "Cancel"}</Btn>
          <Btn
            tokens={tokens}
            lang={lang}
            disabled={!resubmitReason.trim()}
            onClick={() => { if (resubmitFor) requestResubmission(resubmitFor, resubmitReason.trim()); setResubmitFor(null); setOpenUnit(null); }}
          >
            <IconReply size={13} color="#fff" />
            {lang === "ar" ? "إرسال الطلب للطالب" : "Send request to student"}
          </Btn>
        </div>
      </Modal>

      <RemedialPanel open={remedialEntry !== null} onClose={() => setRemedialEntry(null)} tokens={tokens} lang={lang} entry={remedialEntry} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual submission detail — four actions, attempt history, provisional
// vs final score always visually distinct.
// ─────────────────────────────────────────────────────────────────────────────
function UnitDetail({
  state, setState, unit, qLabel, qTopic, qMax, onBack, onResubmit,
}: {
  state: AppState;
  setState: (s: AppState) => void;
  unit: ReviewUnit;
  qLabel: string;
  qTopic: string;
  qMax: number;
  onBack: () => void;
  onResubmit: () => void;
}) {
  const { decide, reopenUnit } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const Arrow = isRtl ? IconArrowLeft : IconArrowRight;

  const [viewAttempt, setViewAttempt] = useState(unit.attempts.length);   // latest
  const [mode, setMode] = useState<null | "edit" | "reject">(null);
  const [scoreInput, setScoreInput] = useState<string>("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const attempt = unit.attempts[viewAttempt - 1];
  const isLatest = viewAttempt === unit.attempts.length;
  const canAct = isLatest && unit.status !== "final" && unit.attempts[viewAttempt - 1].resubmitReason === undefined;
  const decision = attempt.decision;

  const startEdit = (m: "edit" | "reject") => {
    setMode(m);
    setScoreInput(m === "edit" ? String(attempt.eval.aiScore ?? "") : "");
    setFeedbackInput(m === "edit" ? attempt.eval.feedback : "");
  };

  const scoreNum = Number(scoreInput);
  const scoreValid = scoreInput.trim() !== "" && !Number.isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= qMax;
  const feedbackValid = feedbackInput.trim().length > 0;

  return (
    <div>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10.5, color: tokens.textMuted, padding: 0, marginBottom: 12 }}>
        <Arrow size={12} color={tokens.textMuted} />
        {lang === "ar" ? "رجوع إلى المجموعتين" : "BACK TO GROUPS"}
      </button>

      <Card tokens={tokens} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Chip tokens={tokens} tone="primary">{qLabel}</Chip>
              <span style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted }}>{qTopic}</span>
              <ConfidencePill confidence={attempt.eval.confidence} tokens={tokens} lang={lang} />
              {unit.status === "final" && <Chip tokens={tokens} tone="primary"><IconCheck size={10} color={tokens.primary} />{lang === "ar" ? "نهائي" : "FINAL"}</Chip>}
              {unit.status === "resubmission_requested" && <Chip tokens={tokens} tone="peri"><IconReply size={10} color={tokens.developing} />{lang === "ar" ? "بانتظار إعادة التسليم" : "RESUBMISSION REQUESTED"}</Chip>}
            </div>
            <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 16, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>{unit.studentName}</div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint, marginTop: 3 }}>
              {lang === "ar" ? "سُلّمت" : "submitted"} {fmtWhen(attempt.submittedAt, lang)}
            </div>
          </div>

          {/* Attempt switcher (FR-RESUB-02) */}
          {unit.attempts.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <IconHistory size={14} color={tokens.textMuted} />
              <div style={{ display: "flex", gap: 4, padding: 3, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 8 }}>
                {unit.attempts.map((a) => (
                  <button
                    key={a.n}
                    onClick={() => { setViewAttempt(a.n); setMode(null); }}
                    style={{
                      padding: "5px 11px", borderRadius: 6, border: "none", cursor: "pointer",
                      fontFamily: MONO, fontSize: 10.5, fontWeight: 700,
                      background: viewAttempt === a.n ? tokens.card : "transparent",
                      color: viewAttempt === a.n ? tokens.primary : tokens.textMuted,
                      boxShadow: viewAttempt === a.n ? "0 1px 4px rgba(13,26,46,0.12)" : "none",
                    }}
                  >
                    {lang === "ar" ? `محاولة ${a.n}` : `Attempt ${a.n}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isLatest && (
          <div style={{ marginTop: 12 }}>
            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="slate"
              icon={<IconHistory size={13} color={tokens.noEvidence} />}
              title={lang === "ar" ? "تشاهد محاولة سابقة — للقراءة فقط." : "Viewing an earlier attempt — read-only."}
              body={lang === "ar" ? "الإجراءات النهائية متاحة على أحدث محاولة فقط." : "Final actions are available on the latest attempt only."}
            />
          </div>
        )}

        {attempt.resubmitReason && (
          <div style={{ marginTop: 12 }}>
            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="violet"
              icon={<IconReply size={13} color={tokens.gap} />}
              title={lang === "ar" ? "طُلبت إعادة التسليم على هذه المحاولة" : "Resubmission was requested on this attempt"}
              body={attempt.resubmitReason}
            />
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Student's answer */}
        <Card tokens={tokens}>
          <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary, marginBottom: 10 }}>
            {lang === "ar" ? "إجابة الطالب" : "Student answer"}
          </div>
          <div style={{ padding: "12px 14px", background: tokens.inset, border: `1px solid ${tokens.insetBorder}`, borderRadius: 9, fontFamily: bFont, fontSize: 13, color: tokens.textPrimary, lineHeight: 1.7, whiteSpace: "pre-wrap", minHeight: 60 }}>
            {attempt.text || (lang === "ar" ? "(لا نص — مرفق صورة فقط)" : "(no text — image attached only)")}
          </div>
          {attempt.image && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>
                <IconImageAttach size={12} color={tokens.textFaint} />
                {lang === "ar" ? "مرفق: عمل يدوي مصوّر" : "ATTACHED — handwritten work"}
              </div>
              <img src={attempt.image} alt="student handwritten work" style={{ width: "100%", borderRadius: 10, border: `1px solid ${tokens.cardBorder}`, display: "block" }} />
            </div>
          )}
        </Card>

        {/* AI evaluation + actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card tokens={tokens} style={{ borderInlineStartWidth: 3, borderInlineStartColor: tokens.developing }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>{lang === "ar" ? "تقييم الذكاء الاصطناعي" : "AI evaluation"}</div>
              <ScoreValue kind="ai" score={attempt.eval.aiScore} max={qMax} tokens={tokens} lang={lang} />
            </div>
            <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.65, margin: "0 0 10px" }}>{attempt.eval.feedback}</p>
            {attempt.eval.sources.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {attempt.eval.sources.map((s, i) => <CitationChip key={i} label={s} tokens={tokens} />)}
              </div>
            )}
            {attempt.eval.sources.length === 0 && (
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.noEvidence }}>
                {lang === "ar" ? "لا مصادر — تقييم غير موثّق" : "NO SOURCES — UNGROUNDED EVALUATION"}
              </div>
            )}
            {attempt.eval.misconceptions.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {attempt.eval.misconceptions.map((m) => (
                  <AlertStrip key={m} tokens={tokens} lang={lang} tone="violet" icon={<IconWarning size={12} color={tokens.gap} />} title={misconceptionText(m, lang)} />
                ))}
              </div>
            )}
          </Card>

          {decision && (
            <Card tokens={tokens} style={{ borderInlineStartWidth: 3, borderInlineStartColor: tokens.mastered }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>{lang === "ar" ? "القرار النهائي" : "Final decision"}</div>
                <ScoreValue kind="final" score={decision.finalScore} max={qMax} tokens={tokens} lang={lang} />
              </div>
              <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.6, margin: "0 0 8px" }}>{decision.finalFeedback}</p>
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>
                {decision.action.toUpperCase()} · {decision.decidedBy} · {fmtWhen(decision.decidedAt, lang)}
              </div>
              {isLatest && (
                <div style={{ marginTop: 10 }}>
                  <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => reopenUnit(unit.id)} style={{ padding: "5px 10px", fontSize: 11 }}>
                    <IconRefresh size={12} color={tokens.textMuted} />
                    {lang === "ar" ? "إعادة فتح للمراجعة" : "Reopen for review"}
                  </Btn>
                </div>
              )}
            </Card>
          )}

          {/* Edit / Reject composer */}
          {mode && canAct && (
            <Card tokens={tokens} style={{ borderInlineStartWidth: 3, borderInlineStartColor: mode === "edit" ? tokens.developing : tokens.gap }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary, marginBottom: 10 }}>
                {mode === "edit" ? (lang === "ar" ? "تعديل الدرجة / التغذية الراجعة" : "Edit score / feedback") : (lang === "ar" ? "رفض — تقييم يدوي كامل" : "Reject — full manual evaluation")}
              </div>
              {mode === "reject" && (
                <div style={{ marginBottom: 10 }}>
                  <AlertStrip
                    tokens={tokens}
                    lang={lang}
                    tone="violet"
                    icon={<IconBan size={12} color={tokens.gap} />}
                    title={lang === "ar" ? "يستبدل اقتراح الذكاء الاصطناعي بالكامل." : "Replaces the AI suggestion entirely."}
                  />
                </div>
              )}
              <Field label={lang === "ar" ? `الدرجة النهائية (0–${qMax})` : `Final score (0–${qMax})`} tokens={tokens} lang={lang} required>
                <input value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} type="number" min={0} max={qMax} style={{ ...inputStyle(tokens, bFont), fontFamily: MONO }} className="genai-input" />
              </Field>
              <Field label={lang === "ar" ? "التغذية الراجعة النهائية" : "Final feedback"} tokens={tokens} lang={lang} required>
                <textarea value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} style={textareaStyle(tokens, bFont)} className="genai-input" />
              </Field>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setMode(null)}>{lang === "ar" ? "إلغاء" : "Cancel"}</Btn>
                <Btn
                  tokens={tokens}
                  lang={lang}
                  disabled={!scoreValid || !feedbackValid}
                  onClick={() => { decide(unit.id, mode, { score: scoreNum, feedback: feedbackInput.trim() }); setMode(null); }}
                >
                  <IconCheck size={13} color="#fff" />
                  {lang === "ar" ? "حفظ كدرجة نهائية" : "Save as final"}
                </Btn>
              </div>
            </Card>
          )}

          {/* The four actions (FR-REV-01) */}
          {canAct && !mode && (
            <Card tokens={tokens}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, letterSpacing: "0.06em", marginBottom: 10 }}>
                {lang === "ar" ? "إجراء واحد من أربعة" : "EXACTLY ONE OF FOUR ACTIONS"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Btn tokens={tokens} lang={lang} onClick={() => decide(unit.id, "approve", {})} style={{ justifyContent: "center" }} disabled={attempt.eval.aiScore === null}>
                  <IconCheck size={13} color="#fff" />
                  {lang === "ar" ? "اعتماد" : "Approve"}
                </Btn>
                <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => startEdit("edit")} style={{ justifyContent: "center" }}>
                  <IconPencil size={13} color={tokens.primary} />
                  {lang === "ar" ? "تعديل" : "Edit"}
                </Btn>
                <Btn tokens={tokens} lang={lang} variant="violet" onClick={() => startEdit("reject")} style={{ justifyContent: "center" }}>
                  <IconBan size={13} color={tokens.gap} />
                  {lang === "ar" ? "رفض" : "Reject"}
                </Btn>
                <Btn tokens={tokens} lang={lang} variant="ghost" onClick={onResubmit} style={{ justifyContent: "center" }}>
                  <IconReply size={13} color={tokens.textSecondary} />
                  {lang === "ar" ? "طلب إعادة تسليم" : "Request resubmission"}
                </Btn>
              </div>
              {attempt.eval.aiScore === null && (
                <div style={{ marginTop: 8, fontFamily: bFont, fontSize: 11, color: tokens.textFaint }}>
                  {lang === "ar" ? "لا درجة مقترحة (أدلة غير كافية) — الاعتماد معطّل؛ استخدم تعديل أو رفض أو إعادة التسليم." : "No suggested score (insufficient evidence) — Approve is disabled; use Edit, Reject, or Request resubmission."}
                </div>
              )}
            </Card>
          )}

          {!isLatest && (
            <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint }}>
              {lang === "ar" ? "الإجراءات معطّلة على المحاولات السابقة." : "Actions are disabled on earlier attempts."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
