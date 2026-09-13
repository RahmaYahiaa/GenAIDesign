import { useEffect, useMemo, useState } from "react";
import { Tokens } from "../tokens";
import type { Lang, RemedialDraft } from "../data/instructorModule";
import { COURSE_BY_ID, STUDENTS, misconceptionText, approvedMaterials } from "../data/instructorModule";
import { useInstructorModule } from "../store/InstructorStore";
import { Drawer, Btn, Chip, Field, inputStyle, bFontFor, hFontFor, AlertStrip } from "./ModuleUI";
import { IconSparkle, IconWarning, IconUsers, IconCheck, IconDoc } from "./Icons";

// ─────────────────────────────────────────────────────────────────────────────
// Generate remedial content — one panel, two entry points (FR-CONTENT-01):
//   (a) from a detected misconception in the Common Errors Summary (pre-filled)
//   (b) standalone, where the instructor picks any course + topic
// Output is always an editable draft, never auto-visible to students
// (FR-CONTENT-04). Audience is chosen at publish time (FR-CONTENT-05).
// ─────────────────────────────────────────────────────────────────────────────

export interface RemedialEntry {
  courseId: string;
  topicId: string;
  misconceptionId?: string;
}

let draftSeq = 0;
const newDraftId = () => `rem-${++draftSeq}-${Date.now().toString(36)}`;

function buildDraft(entry: RemedialEntry, type: "explanation" | "practice", lang: Lang): { title: string; body: string } {
  const course = COURSE_BY_ID(entry.courseId);
  const topic = course.topics.find((t) => t.id === entry.topicId);
  const topicLabel = topic ? (lang === "ar" ? topic.label.ar : topic.label.en) : entry.topicId;
  const mis = entry.misconceptionId ? misconceptionText(entry.misconceptionId, lang) : null;
  const mats = topic ? topic.materials.filter((m) => m.status === "approved").map((m) => m.title) : [];

  if (type === "explanation") {
    const title = lang === "ar" ? `شرح مركّز: ${topicLabel}` : `Focused explanation — ${topicLabel}`;
    const body = [
      lang === "ar" ? `## لماذا يقع الطلاب في هذا الخطأ` : `## Why this trips students up`,
      mis
        ? (lang === "ar" ? `النمط المرصود في هذه الدفعة: «${mis}». يظهر هذا الاعتقاد عندما يُعامَل الشرط الظاهري وكأنه الشرط الحاكم.` : `The pattern observed in this cohort: "${mis}". It surfaces when the surface symptom is treated as the governing condition.`)
        : (lang === "ar" ? `هذا الموضوع يسجّل أدنى إتقان في المقرر حالياً، لذا نبدأ من تعريف البنية نفسها قبل أي تطبيق.` : `This topic currently records the lowest mastery in the course, so we start from the definition of the structure itself before any application.`),
      "",
      lang === "ar" ? `## النموذج الصحيح` : `## The correct model`,
      lang === "ar"
        ? `الفكرة الحاكمة في ${topicLabel}: الشرط الذي يحدد السلوك هو شرط البنية الداخلية، لا شكل المدخلات. عند التطبيق اسأل دائماً: ما الضمان الذي تعطيه هذه البنية، وما الثمن الذي تدفعه مقابله؟`
        : `The governing idea in ${topicLabel}: the condition that determines behaviour is the internal structural invariant, not the shape of the inputs. When applying it, always ask — what guarantee does this structure give, and what cost is paid for it?`,
      "",
      lang === "ar" ? `## مثال محلول` : `## Worked example`,
      lang === "ar"
        ? `1) خذ مدخلاً صغيراً يمكن تتبّعه يدوياً.\n2) طبّق الشرط الحاكم خطوة بخطوة وسجّل الحالة بعد كل خطوة.\n3) قارن الناتج بالحدود النظرية (الأفضل/الأسوأ) وتأكد أنها متسقة.`
        : `1) Take a small input you can trace by hand.\n2) Apply the governing condition step by step, recording the state after each step.\n3) Compare the result against the theoretical bounds (best/worst) and check consistency.`,
      mats.length
        ? `\n${lang === "ar" ? "المصادر المعتمدة المستخدمة: " : "Approved sources used: "}${mats.join(" · ")}`
        : `\n${lang === "ar" ? "تحذير: لا توجد مواد معتمدة لهذا الموضوع — المسودة غير موثّقة." : "Warning: no approved material exists for this topic — this draft is ungrounded."}`,
    ].join("\n");
    return { title, body };
  }

  const title = lang === "ar" ? `تدريب إضافي: ${topicLabel}` : `Additional practice — ${topicLabel}`;
  const body = [
    lang === "ar" ? `## ثلاثة أسئلة بنفس الموضوع` : `## Three questions on the same topic`,
    "",
    lang === "ar"
      ? `س1) تتبّع يدوياً مثالاً صغيراً في ${topicLabel} واكتب الحالة بعد كل خطوة.\nالحل: يُقيَّم على صحة التتبّع واتساقه مع الشرط الحاكم.`
      : `Q1) Trace a small ${topicLabel} example by hand and write the state after each step.\nAnswer key: graded on trace correctness and consistency with the governing condition.`,
    "",
    lang === "ar"
      ? `س2) أعطِ مدخلاً يكسر الحدس الشائع في هذا الموضوع واشرح لماذا ينكسر.\nالحل: يُقيَّم على تسمية الشرط الذي انتُهك.`
      : `Q2) Give an input that breaks the common intuition for this topic and explain why it breaks.\nAnswer key: graded on naming the violated condition.`,
    "",
    lang === "ar"
      ? `س3) قارن حالتين تتفقان في المدخل وتختلفان في البنية، وحدد أيهما أفضل ولماذا.\nالحل: يُقيَّم على ربط الفرق بالضمان/الثمن.`
      : `Q3) Compare two cases with identical input but different structure, and state which is better and why.\nAnswer key: graded on linking the difference to the guarantee/cost trade-off.`,
    mis ? `\n${lang === "ar" ? "مستهدف التصحيح: " : "Targeted at correcting: "}${mis}` : "",
  ].join("\n");
  return { title, body };
}

export default function RemedialPanel({
  open, onClose, tokens, lang, entry,
}: {
  open: boolean;
  onClose: () => void;
  tokens: Tokens;
  lang: Lang;
  entry: RemedialEntry | null;
}) {
  const { state, saveRemedial, publishRemedial, discardRemedial } = useInstructorModule();
  const bFont = bFontFor(lang);
  const hFont = hFontFor(lang);

  const [courseId, setCourseId] = useState(entry?.courseId ?? "CS301");
  const [topicId, setTopicId] = useState(entry?.topicId ?? "");
  const [misId, setMisId] = useState<string | undefined>(entry?.misconceptionId);
  const [type, setType] = useState<"explanation" | "practice">("explanation");
  const [draft, setDraft] = useState<RemedialDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  // Re-seed whenever the panel is opened with a new entry point.
  useEffect(() => {
    if (!open) return;
    setJustPublished(false);
    setDraft(null);
    if (entry) {
      setCourseId(entry.courseId);
      setTopicId(entry.topicId);
      setMisId(entry.misconceptionId);
    } else {
      setCourseId("CS301");
      setTopicId(COURSE_BY_ID("CS301").topics[0]?.id ?? "");
      setMisId(undefined);
    }
  }, [open, entry]);

  const course = COURSE_BY_ID(courseId);
  const topics = course.topics;
  const topic = topics.find((t) => t.id === topicId);
  const grounded = topic ? approvedMaterials(topic) > 0 : false;

  const affectedStudents = useMemo(() => {
    if (!misId) return [];
    const ids = new Set<string>();
    for (const u of state.units) {
      if (u.courseId !== courseId) continue;
      if (u.attempts.some((a) => a.eval.misconceptions.includes(misId))) ids.add(u.studentId);
    }
    return STUDENTS.filter((s) => ids.has(s.id));
  }, [misId, courseId, state.units]);

  const generate = () => {
    if (!topicId) return;
    setGenerating(true);
    setJustPublished(false);
    window.setTimeout(() => {
      const { title, body } = buildDraft({ courseId, topicId, misconceptionId: misId }, type, lang);
      setDraft({
        id: newDraftId(), courseId, topicId, misconceptionId: misId, type,
        title, body,
        audience: misId && affectedStudents.length > 0 ? "affected" : "all",
        manualIds: [], status: "draft", createdAt: new Date().toISOString(),
      });
      setGenerating(false);
    }, 650);
  };

  const publish = () => {
    if (!draft) return;
    saveRemedial({ ...draft, status: "published" });
    publishRemedial(draft.id);
    setJustPublished(true);
  };

  const selectStyle = { ...inputStyle(tokens, bFont), appearance: "none" as const, cursor: "pointer" };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      tokens={tokens}
      lang={lang}
      title={lang === "ar" ? "توليد محتوى علاجي" : "Generate remedial content"}
      subtitle={lang === "ar"
        ? "المخرج مسودة قابلة للتحرير — لا يظهر للطلاب إلا بعد النشر."
        : "Output is an editable draft — never visible to students until published."}
    >
      {/* Entry context */}
      {misId && (
        <div style={{ marginBottom: 14 }}>
          <AlertStrip
            tokens={tokens}
            lang={lang}
            tone="violet"
            icon={<IconWarning size={13} color={tokens.gap} />}
            title={lang === "ar" ? "مولّد من نمط خطأ مرصود" : "Seeded from a detected error pattern"}
            body={misconceptionText(misId, lang)}
          />
        </div>
      )}

      {/* Course + topic pickers (always available — standalone entry point) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label={lang === "ar" ? "المقرر" : "Course"} tokens={tokens} lang={lang}>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setTopicId(COURSE_BY_ID(e.target.value).topics[0]?.id ?? "");
              setMisId(undefined);
              setDraft(null);
            }}
            style={selectStyle}
            className="genai-input"
          >
            {state.courses.filter((c) => !c.isPersonal).map((c) => (
              <option key={c.id} value={c.id}>{c.id} — {lang === "ar" ? c.title.ar : c.title.en}</option>
            ))}
          </select>
        </Field>
        <Field label={lang === "ar" ? "الموضوع" : "Topic"} tokens={tokens} lang={lang}>
          <select
            value={topicId}
            onChange={(e) => { setTopicId(e.target.value); setDraft(null); }}
            style={selectStyle}
            className="genai-input"
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{lang === "ar" ? t.label.ar : t.label.en}</option>
            ))}
          </select>
        </Field>
      </div>

      {!grounded && topic && (
        <div style={{ marginBottom: 14 }}>
          <AlertStrip
            tokens={tokens}
            lang={lang}
            tone="slate"
            icon={<IconWarning size={13} color={tokens.noEvidence} />}
            title={lang === "ar" ? "لا توجد مواد معتمدة لهذا الموضوع" : "No approved material for this topic"}
            body={lang === "ar"
              ? "سيكون التوليد غير موثّق. ارفع مادة معتمدة أولاً لتحسين الجودة."
              : "Generation will be ungrounded. Upload approved material first for better quality."}
          />
        </div>
      )}

      {/* Content type */}
      <Field label={lang === "ar" ? "نوع المحتوى" : "Content type"} tokens={tokens} lang={lang}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([
            ["explanation", lang === "ar" ? "شرح مركّز مع مثال محلول" : "Focused explanation + worked example"],
            ["practice", lang === "ar" ? "أسئلة تدريب إضافية" : "Additional practice questions"],
          ] as ["explanation" | "practice", string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setType(id); setDraft(null); }}
              style={{
                padding: "10px 12px", borderRadius: 9, cursor: "pointer", textAlign: lang === "ar" ? "right" : "left",
                border: `1.5px solid ${type === id ? tokens.primary : tokens.cardBorder}`,
                background: type === id ? tokens.primaryLight : tokens.card,
                color: type === id ? tokens.primary : tokens.textSecondary,
                fontFamily: bFont, fontSize: 12, fontWeight: type === id ? 600 : 500, lineHeight: 1.4,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      {!draft && (
        <Btn tokens={tokens} lang={lang} onClick={generate} disabled={generating || !topicId} style={{ width: "100%", justifyContent: "center", padding: "11px 0" }}>
          <IconSparkle size={14} color="#fff" />
          {generating ? (lang === "ar" ? "جارٍ التوليد…" : "Generating…") : (lang === "ar" ? "توليد المسودة" : "Generate draft")}
        </Btn>
      )}

      {/* Editable draft */}
      {draft && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Chip tokens={tokens} tone="peri">
              <IconDoc size={10} color={tokens.developing} />
              {lang === "ar" ? "مسودة — غير منشورة" : "DRAFT — NOT PUBLISHED"}
            </Chip>
            <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint }}>
              {lang === "ar" ? "عدّل بحرية أو تخلَّ دون نشر." : "Edit freely, or discard without publishing."}
            </span>
          </div>

          <Field label={lang === "ar" ? "العنوان" : "Title"} tokens={tokens} lang={lang}>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} style={inputStyle(tokens, bFont)} className="genai-input" />
          </Field>
          <Field label={lang === "ar" ? "المحتوى" : "Content"} tokens={tokens} lang={lang}>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              style={{ ...inputStyle(tokens, bFont), minHeight: 240, resize: "vertical", lineHeight: 1.65, fontFamily: bFont, fontSize: 12.5 }}
              className="genai-input"
            />
          </Field>

          {/* Audience — chosen at publish time (FR-CONTENT-05) */}
          <Field label={lang === "ar" ? "الجمهور عند النشر" : "Audience at publish"} tokens={tokens} lang={lang}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                ["all", lang === "ar" ? "كل طلاب المقرر" : "All students in the course", `${course.enrolled}`],
                ["affected", lang === "ar" ? `الطلاب المتأثرون بالخطأ المرصود فقط (${affectedStudents.length})` : `Only students affected by the originating misconception (${affectedStudents.length})`, misId ? (lang === "ar" ? "مقترح افتراضياً" : "suggested default") : (lang === "ar" ? "غير متاح — لا خطأ مصدري" : "n/a — no originating misconception")],
                ["manual", lang === "ar" ? "مجموعة مختارة يدوياً" : "Manually selected subset", ""],
              ] as ["all" | "affected" | "manual", string, string][]).map(([id, label, note]) => {
                const disabled = id === "affected" && !misId;
                return (
                  <button
                    key={id}
                    disabled={disabled}
                    onClick={() => setDraft({ ...draft, audience: id })}
                    style={{
                      display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer",
                      border: `1.5px solid ${draft.audience === id ? tokens.primary : tokens.cardBorder}`,
                      background: draft.audience === id ? tokens.primaryLight : tokens.card,
                      opacity: disabled ? 0.5 : 1, textAlign: lang === "ar" ? "right" : "left",
                    }}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${draft.audience === id ? tokens.primary : tokens.textFaint}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {draft.audience === id && <span style={{ width: 7, height: 7, borderRadius: "50%", background: tokens.primary }} />}
                    </span>
                    <span style={{ flex: 1, fontFamily: bFont, fontSize: 12, color: tokens.textPrimary, fontWeight: 500 }}>{label}</span>
                    {note && <span style={{ fontFamily: bFont, fontSize: 10, color: tokens.textFaint }}>{note}</span>}
                  </button>
                );
              })}
            </div>
          </Field>

          {draft.audience === "manual" && (
            <div style={{ marginBottom: 14, padding: "10px 12px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 9, maxHeight: 150, overflowY: "auto" }}>
              {STUDENTS.filter((s) => s.id !== "st-sarah").map((s) => {
                const on = draft.manualIds.includes(s.id);
                return (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer", fontFamily: bFont, fontSize: 12, color: tokens.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => setDraft({ ...draft, manualIds: on ? draft.manualIds.filter((x) => x !== s.id) : [...draft.manualIds, s.id] })}
                      style={{ accentColor: tokens.primary }}
                    />
                    {s.name}
                  </label>
                );
              })}
            </div>
          )}

          {draft.audience === "affected" && affectedStudents.length > 0 && (
            <div style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <IconUsers size={13} color={tokens.textMuted} />
              {affectedStudents.map((s) => <Chip key={s.id} tokens={tokens}>{s.name}</Chip>)}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn tokens={tokens} lang={lang} onClick={publish} style={{ flex: 1, justifyContent: "center" }}>
              <IconCheck size={13} color="#fff" />
              {lang === "ar" ? "نشر للجمهور المحدد" : "Publish to audience"}
            </Btn>
            <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => { discardRemedial(draft.id); setDraft(null); }}>
              {lang === "ar" ? "تخلٍّ دون نشر" : "Discard"}
            </Btn>
          </div>

          {justPublished && (
            <div style={{ marginTop: 12 }}>
              <AlertStrip
                tokens={tokens}
                lang={lang}
                tone="peri"
                icon={<IconCheck size={13} color={tokens.developing} />}
                title={lang === "ar" ? "تم النشر — المحتوى أصبح مرئياً للجمهور المحدد فقط." : "Published — now visible to the selected audience only."}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${tokens.cardBorder}`, fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.6 }}>
        {lang === "ar"
          ? "ملاحظة: التوليد يستند إلى مواد المقرر المعتمدة عبر نفس خط الاسترجاع المستخدم في المعلم الذكي."
          : "Note: generation is grounded in approved course material through the same retrieval pipeline used by the AI Tutor."}
      </div>
      <div style={{ height: 8 }} />
      <span style={{ fontFamily: hFont, fontSize: 0, color: "transparent" }}>.</span>
    </Drawer>
  );
}
