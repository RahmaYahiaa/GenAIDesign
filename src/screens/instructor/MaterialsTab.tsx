import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, AlertStrip, toast } from "../../components/ModuleUI";
import { MasteryBar } from "../../components/SharedUI";
import { IconWarning, IconCheck, IconUpload, IconSparkle, IconDoc } from "../../components/Icons";
import { approvedMaterials, pendingMaterials, coverageGap, fmtWhen } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Materials tab — the workspace's fourth tab: the course's grounding library
// per topic. Pending uploads are approved here; new material can be drafted
// here (goes to pending) while real production happens in Content Studio.
// A topic with zero approved materials is a coverage gap (FR-COVERAGE-01).
// ─────────────────────────────────────────────────────────────────────────────

export default function MaterialsTab({ state, setState, courseId }: { state: AppState; setState: (s: AppState) => void; courseId: string }) {
  const { state: mod, addMaterial, approveMaterial } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const course = mod.courses.find((c) => c.id === courseId) ?? mod.courses[0];

  // Urgency order: coverage gaps first, then topics with most pending.
  const topics = [...course.topics].sort(
    (a, b) =>
      (coverageGap(a) ? 0 : 1) - (coverageGap(b) ? 0 : 1) ||
      pendingMaterials(b) - pendingMaterials(a),
  );

  const totalApproved = course.topics.reduce((s, tp) => s + approvedMaterials(tp), 0);
  const totalPending = course.topics.reduce((s, tp) => s + pendingMaterials(tp), 0);
  const gaps = course.topics.filter(coverageGap).length;

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <div>
      {gaps > 0 && (
        <div style={{ marginBottom: 16 }}>
          <AlertStrip
            tokens={tokens}
            lang={lang}
            tone="violet"
            icon={<IconWarning size={14} color={tokens.gap} />}
            title={t(
              `${gaps} topic${gaps === 1 ? "" : "s"} with zero approved materials — the AI can not ground its help there, and the institution analytics counts this course as partially bare.`,
              `${gaps} موضوع بلا مواد معتمدة — الذكاء الاصطناعي لا يستطيع الاستناد هناك، وتحليلات المؤسسة تحسب هذا المقرر عارٍ جزئيًا.`,
            )}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <Chip tokens={tokens} tone="primary">{t("Approved", "معتمدة")}: {totalApproved}</Chip>
        <Chip tokens={tokens} tone="peri">{t("Pending approval", "في انتظار الاعتماد")}: {totalPending}</Chip>
        <Chip tokens={tokens} tone={gaps > 0 ? "violet" : "slate"}>{t("Coverage gaps", "فجوات التغطية")}: {gaps}</Chip>
        <span style={{ flex: 1 }} />
        <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => setState({ ...state, screen: "content-studio", courseId })}>
          <IconSparkle size={13} color={tokens.textSecondary} />
          {t("Open Content Studio for this course", "افتح استوديو المحتوى لهذا المقرر")}
        </Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {topics.map((topic) => {
          const approved = approvedMaterials(topic);
          const pending = pendingMaterials(topic);
          const gap = coverageGap(topic);
          const sorted = [...topic.materials].sort((a, b) => (a.status === b.status ? a.addedAt.localeCompare(b.addedAt) : a.status === "pending" ? -1 : 1));
          return (
            <Card
              tokens={tokens}
              key={topic.id}
              style={{
                padding: "14px 16px",
                border: gap ? `1px solid ${tokens.gap}55` : `1px solid ${tokens.cardBorder}`,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row", marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, letterSpacing: "0.06em" }}>{topic.short}</span>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>
                      {lang === "ar" ? topic.label.ar : topic.label.en}
                    </span>
                    {gap && <Chip tokens={tokens} tone="violet">{t("Coverage gap", "فجوة تغطية")}</Chip>}
                  </div>
                  <div style={{ marginTop: 8, maxWidth: 320 }}>
                    <MasteryBar tokens={tokens} pct={topic.pct} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <Chip tokens={tokens} tone="primary">{approved} {t("approved", "معتمد")}</Chip>
                  {pending > 0 && <Chip tokens={tokens} tone="peri">{pending} {t("pending", "معلق")}</Chip>}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                {sorted.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
                      padding: "8px 12px", borderRadius: 8,
                      background: tokens.inset, border: `1px solid ${tokens.cardBorder}`,
                      flexDirection: isRtl ? "row-reverse" : "row",
                    }}
                  >
                    <IconDoc size={13} color={tokens.textSecondary} />
                    <span style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textPrimary, flex: 1, minWidth: 180 }}>{m.title}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{fmtWhen(m.addedAt, lang)}</span>
                    {m.status === "pending" ? (
                      <>
                        <Chip tokens={tokens} tone="peri">{t("Pending", "معلق")}</Chip>
                        <Btn
                          tokens={tokens}
                          lang={lang}
                          variant="soft"
                          style={{ padding: "5px 11px", fontSize: 11.5, flexShrink: 0 }}
                          onClick={() => {
                            approveMaterial(course.id, topic.id, m.id);
                            toast(t(`«${m.title}» approved — the AI can now ground answers in it.`, `اعتُمد «${m.title}» — يستطيع الذكاء الاصطناعي الاستناد إليه الآن.`));
                          }}
                        >
                          <IconCheck size={12} color={tokens.primary} />
                          {t("Approve", "اعتماد")}
                        </Btn>
                      </>
                    ) : (
                      <Chip tokens={tokens} tone="primary">{t("Approved", "معتمد")}</Chip>
                    )}
                  </div>
                ))}
                {sorted.length === 0 && (
                  <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint, padding: "6px 2px" }}>
                    {t("No materials yet — upload from the Studio or draft a placeholder below.", "لا مواد بعد — ارفع من الاستوديو أو أضف مبدئيًا بالأسفل.")}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <input
                  value={drafts[topic.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [topic.id]: e.target.value }))}
                  placeholder={t("New material title — e.g. Lecture 9 slides (PDF)…", "عنوان مادة جديدة — مثال: شرائح المحاضرة 9 (PDF)…")}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    border: `1px solid ${tokens.cardBorder}`, background: tokens.card,
                    color: tokens.textPrimary, fontFamily: bFont, fontSize: 12.5, outline: "none",
                    direction: isRtl ? "rtl" : "ltr",
                  }}
                />
                <Btn
                  tokens={tokens}
                  lang={lang}
                  variant="soft"
                  disabled={!(drafts[topic.id] ?? "").trim()}
                  style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0 }}
                  onClick={() => {
                    const title = (drafts[topic.id] ?? "").trim();
                    if (!title) return;
                    addMaterial(course.id, topic.id, title);
                    setDrafts((d) => ({ ...d, [topic.id]: "" }));
                    toast(t(`«${title}» filed as pending — approve it above to make it grounding-eligible.`, `أُدرج «${title}» كمعلق — اعتمده بالأعلى ليصبح صالحًا للاستناد.`));
                  }}
                >
                  <IconUpload size={13} color={tokens.primary} />
                  {t("Add (goes to pending)", "إضافة (تذهب معلقة)")}
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
