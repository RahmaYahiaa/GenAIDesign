import { useState } from "react";
import { AppState, WorkspaceTab } from "../../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, Tabs, Field, inputStyle, Modal, AlertStrip, bFontFor, hFontFor, Th } from "../../components/ModuleUI";
import { StatTile, MasteryBar, MasteryPill } from "../../components/SharedUI";
import { IconPlus, IconUpload, IconWarning, IconCheck, IconDoc, IconClipboard, IconShield, IconDashboard } from "../../components/Icons";
import AssignmentsTab from "./AssignmentsTab";
import CourseAnalyticsTab from "./CourseAnalyticsTab";
import AuditTrailTab from "./AuditTrailTab";
import { approvedMaterials, pendingMaterials, latestAttempt } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Course Workspace — the container that now carries Assignments and Analytics
// alongside the course overview and the audit trail.
// ─────────────────────────────────────────────────────────────────────────────

export default function CourseWorkspaceScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, addMaterial, approveMaterial } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const courseId = state.courseId ?? "CS301";
  const course = mod.courses.find((c) => c.id === courseId) ?? mod.courses[0];
  const tab: WorkspaceTab = state.tab ?? "overview";

  const assignments = mod.assignments.filter((a) => a.courseId === course.id);
  const pendingCount = mod.units.filter((u) => u.courseId === course.id && u.status === "awaiting_review").length;
  const coverageGaps = course.topics.filter((t) => approvedMaterials(t) === 0);

  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const setTab = (t: WorkspaceTab) => setState({ ...state, tab: t });

  const uploadTopic = course.topics.find((t) => t.id === uploadFor);

  return (
    <div style={{ padding: "26px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Workspace header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Chip tokens={tokens} tone="primary">{course.id}</Chip>
            <Chip tokens={tokens}>{lang === "ar" ? `الأسبوع ${course.week}` : `Week ${course.week}`}</Chip>
            <Chip tokens={tokens}>{course.enrolled} {lang === "ar" ? "طالباً" : "students"}</Chip>
          </div>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            {lang === "ar" ? course.title.ar : course.title.en}
          </h1>
          <p style={{ fontSize: 12.5, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {course.instructor} · {lang === "ar" ? "مساحة المقرر المؤسسية" : "Institutional course workspace"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setTab("audit")}>
            <IconShield size={13} color={tokens.textMuted} />
            {lang === "ar" ? "سجل التدقيق" : "Audit trail"}
          </Btn>
          <Btn tokens={tokens} lang={lang} onClick={() => setState({ ...state, screen: "assignment-create", courseId: course.id, assignmentId: undefined })}>
            <IconPlus size={13} color="#fff" />
            {lang === "ar" ? "تكليف جديد" : "New assignment"}
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tokens={tokens}
        lang={lang}
        active={tab}
        onSelect={(id) => setTab(id as WorkspaceTab)}
        tabs={[
          { id: "overview", label: lang === "ar" ? "نظرة عامة والمواد" : "Overview & Materials" },
          { id: "assignments", label: lang === "ar" ? "التكليفات" : "Assignments", badge: pendingCount },
          { id: "analytics", label: lang === "ar" ? "التحليلات" : "Analytics" },
          { id: "audit", label: lang === "ar" ? "سجل التدقيق" : "Audit Trail" },
        ]}
      />

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            <StatTile label={lang === "ar" ? "متوسط إتقان الدفعة" : "Class avg. mastery"} value={`${course.overall}%`} mono accent={masteryColor(masteryLevel(course.overall, true), tokens)} tokens={tokens} headFont={hFont} bodyFont={bFont} />
            <StatTile label={lang === "ar" ? "التكليفات" : "Assignments"} value={`${assignments.length}`} sub={`${assignments.filter((a) => a.status === "open").length} ${lang === "ar" ? "مفتوح" : "open"}`} tokens={tokens} headFont={hFont} bodyFont={bFont} />
            <StatTile label={lang === "ar" ? "بانتظار المراجعة" : "Pending review"} value={`${pendingCount}`} mono accent={pendingCount > 0 ? tokens.developing : tokens.noEvidence} tokens={tokens} headFont={hFont} bodyFont={bFont} />
            <StatTile label={lang === "ar" ? "فجوات التغطية" : "Coverage gaps"} value={`${coverageGaps.length}`} sub={lang === "ar" ? "مواضيع بلا مادة معتمدة" : "topics w/o approved material"} accent={coverageGaps.length ? tokens.gap : tokens.mastered} tokens={tokens} headFont={hFont} bodyFont={bFont} />
          </div>

          {/* Materials coverage (FR-COVERAGE-01/02) */}
          <Card tokens={tokens} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
                {lang === "ar" ? "تغطية المواد المعتمدة حسب الموضوع" : "Approved material coverage by topic"}
              </div>
              <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{lang === "ar" ? "الصفر = تنبيه تغطية" : "zero = coverage alert"}</span>
            </div>
            <p style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted, margin: "0 0 14px", lineHeight: 1.6 }}>
              {lang === "ar"
                ? "تنبيه وقائي: أي موضوع بلا مادة معتمدة يجعل المعلم الذكي والتقييم غير قادرين على الاستناد إليه. ارفع مادة ليُزال التنبيه."
                : "A preventive alert: any topic with zero approved material leaves the tutor and the evaluation pipeline unable to ground it. Upload material to clear the alert."}
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th tokens={tokens}>{lang === "ar" ? "الموضوع" : "Topic"}</Th>
                  <Th tokens={tokens}>{lang === "ar" ? "إتقان الدفعة" : "Class mastery"}</Th>
                  <Th tokens={tokens} align="right">{lang === "ar" ? "معتمد" : "Approved"}</Th>
                  <Th tokens={tokens} align="right">{lang === "ar" ? "قيد الاعتماد" : "Pending"}</Th>
                  <Th tokens={tokens} align="right">{lang === "ar" ? "إجراء" : "Action"}</Th>
                </tr>
              </thead>
              <tbody>
                {course.topics.map((t, i) => {
                  const appr = approvedMaterials(t);
                  const pend = pendingMaterials(t);
                  const level = masteryLevel(t.pct, t.evidence > 0);
                  const color = masteryColor(level, tokens);
                  return (
                    <tr key={t.id} style={{ borderBottom: i < course.topics.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
                      <td style={{ padding: "11px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          {appr === 0 && <IconWarning size={13} color={tokens.gap} />}
                          <span style={{ fontFamily: bFont, fontSize: 12.5, fontWeight: 500, color: tokens.textPrimary }}>{lang === "ar" ? t.label.ar : t.label.en}</span>
                          <MasteryPill level={level} tokens={tokens} lang={lang} />
                        </div>
                      </td>
                      <td style={{ padding: "11px 10px", minWidth: 150 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1 }}><MasteryBar pct={t.pct} evidence={t.evidence} thin tokens={tokens} /></div>
                          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{t.evidence > 0 ? `${t.pct}%` : "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 10px", textAlign: "right" }}>
                        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: appr > 0 ? tokens.mastered : tokens.gap }}>{appr}</span>
                      </td>
                      <td style={{ padding: "11px 10px", textAlign: "right" }}>
                        <span style={{ fontFamily: MONO, fontSize: 12, color: pend > 0 ? tokens.developing : tokens.textFaint }}>{pend}</span>
                      </td>
                      <td style={{ padding: "11px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          {t.materials.filter((m) => m.status === "pending").map((m) => (
                            <Btn key={m.id} tokens={tokens} lang={lang} variant="soft" onClick={() => approveMaterial(course.id, t.id, m.id)} style={{ padding: "4px 9px", fontSize: 10.5 }} title={m.title}>
                              <IconCheck size={11} color={tokens.primary} />
                              {lang === "ar" ? "اعتمد" : "Approve"}
                            </Btn>
                          ))}
                          <Btn tokens={tokens} lang={lang} variant={appr === 0 ? "violet" : "ghost"} onClick={() => { setUploadFor(t.id); setUploadTitle(""); }} style={{ padding: "4px 9px", fontSize: 10.5 }}>
                            <IconUpload size={11} color={appr === 0 ? tokens.gap : tokens.textMuted} />
                            {lang === "ar" ? "ارفع مادة" : "Upload"}
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Assignments at a glance + audit shortcut */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card tokens={tokens}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>{lang === "ar" ? "التكليفات" : "Assignments"}</div>
                <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => setTab("assignments")} style={{ padding: "5px 10px", fontSize: 11 }}>
                  <IconClipboard size={12} color={tokens.primary} />
                  {lang === "ar" ? "كل التكليفات" : "View all"}
                </Btn>
              </div>
              {assignments.length === 0 && (
                <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>{lang === "ar" ? "لا تكليفات بعد." : "No assignments yet."}</div>
              )}
              {assignments.slice(0, 3).map((a) => {
                const pend = mod.units.filter((u) => u.assignmentId === a.id && u.status === "awaiting_review").length;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${tokens.cardBorder}`, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
                      <div style={{ fontFamily: bFont, fontSize: 12.5, fontWeight: 500, color: tokens.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lang === "ar" ? a.title.ar : a.title.en}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{pend} {lang === "ar" ? "بانتظار المراجعة" : "pending"}</div>
                    </div>
                    <Chip tokens={tokens} tone={a.status === "open" ? "primary" : "slate"}>{a.status === "open" ? (lang === "ar" ? "مفتوح" : "OPEN") : (lang === "ar" ? "مغلق" : "CLOSED")}</Chip>
                  </div>
                );
              })}
            </Card>

            <Card tokens={tokens}>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 12 }}>
                {lang === "ar" ? "مواد المواضيع" : "Topic material"}
              </div>
              {course.topics.flatMap((t) => t.materials).slice(0, 5).map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: `1px solid ${tokens.cardBorder}`, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <IconDoc size={13} color={m.status === "approved" ? tokens.mastered : tokens.developing} />
                  <span style={{ flex: 1, fontFamily: bFont, fontSize: 12, color: tokens.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span>
                  <Chip tokens={tokens} tone={m.status === "approved" ? "primary" : "peri"}>{m.status === "approved" ? (lang === "ar" ? "معتمد" : "APPROVED") : (lang === "ar" ? "قيد الاعتماد" : "PENDING")}</Chip>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <AlertStrip
                  tokens={tokens}
                  lang={lang}
                  tone="peri"
                  icon={<IconDashboard size={13} color={tokens.developing} />}
                  title={lang === "ar" ? "التحليلات محسوبة مسبقاً" : "Analytics are precomputed"}
                  body={lang === "ar" ? "تُحدَّث عند الاعتماد أو نشر محتوى علاجي — ليست لحظية." : "Refreshed on approval or remedial publish — not live."}
                />
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "assignments" && <AssignmentsTab state={state} setState={setState} courseId={course.id} />}
      {tab === "analytics" && <CourseAnalyticsTab state={state} courseId={course.id} />}
      {tab === "audit" && <AuditTrailTab state={state} courseId={course.id} />}

      {/* Upload material modal */}
      <Modal
        open={uploadFor !== null}
        onClose={() => setUploadFor(null)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? `رفع مادة — ${uploadTopic ? uploadTopic.label[lang] : ""}` : `Upload material — ${uploadTopic ? uploadTopic.label.en : ""}`}
        subtitle={lang === "ar"
          ? "تدخل المادة حالة «قيد الاعتماد» ثم تعتمدّها لتصبح مرجعاً للتقييم والمعلم الذكي."
          : "Material enters as pending approval; approve it to become grounding for evaluation and the tutor."}
      >
        <Field label={lang === "ar" ? "عنوان المادة" : "Material title"} tokens={tokens} lang={lang} required>
          <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder={lang === "ar" ? "مثال: المحاضرة 9 — ديكسترا" : "e.g. Lecture 9 — Dijkstra"} style={inputStyle(tokens, bFont)} className="genai-input" />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setUploadFor(null)}>{lang === "ar" ? "إلغاء" : "Cancel"}</Btn>
          <Btn
            tokens={tokens}
            lang={lang}
            disabled={!uploadTitle.trim()}
            onClick={() => { if (uploadFor) addMaterial(course.id, uploadFor, uploadTitle.trim()); setUploadFor(null); }}
          >
            <IconUpload size={13} color="#fff" />
            {lang === "ar" ? "رفع كمسودة معتمدة لاحقاً" : "Upload as pending"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
