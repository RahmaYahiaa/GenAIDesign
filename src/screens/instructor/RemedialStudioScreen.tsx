import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, bFontFor, hFontFor } from "../../components/ModuleUI";
import { EmptyState } from "../../components/SharedUI";
import { IconSparkle, IconDoc, IconCheck } from "../../components/Icons";
import RemedialPanel, { RemedialEntry } from "../../components/RemedialPanel";
import { COURSE_BY_ID, fmtWhen } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Remedial content studio — the standalone entry point (FR-CONTENT-01b).
// The instructor picks any course and topic directly, at any time.
// ─────────────────────────────────────────────────────────────────────────────

export default function RemedialStudioScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<RemedialEntry | null>(null);

  const start = () => {
    const courseId = state.courseId ?? "CS301";
    setEntry({ courseId, topicId: COURSE_BY_ID(courseId).topics[0]?.id ?? "" });
    setOpen(true);
  };

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            {lang === "ar" ? "استوديو المحتوى العلاجي" : "Remedial content studio"}
          </h1>
          <p style={{ fontSize: 12.5, color: tokens.textMuted, margin: 0, fontFamily: bFont, maxWidth: 560, lineHeight: 1.6 }}>
            {lang === "ar"
              ? "ولّد شرحاً مركّزاً أو تدريباً إضافياً لأي موضوع في أي مقرر — مستقلاً عن أي خطأ مرصود. كل مخرج مسودة لا يراها الطلاب قبل النشر."
              : "Generate a focused explanation or extra practice for any topic in any course — independent of any detected error. Every output is a draft students never see until published."}
          </p>
        </div>
        <Btn tokens={tokens} lang={lang} onClick={start}>
          <IconSparkle size={13} color="#fff" />
          {lang === "ar" ? "محتوى جديد" : "New remedial content"}
        </Btn>
      </div>

      {mod.remedial.length === 0 ? (
        <Card tokens={tokens}>
          <EmptyState
            tokens={tokens}
            headFont={hFont}
            bodyFont={bFont}
            icon={<IconSparkle size={22} color={tokens.textFaint} />}
            title={lang === "ar" ? "لا مسودات بعد" : "No drafts yet"}
            description={lang === "ar"
              ? "ابدأ من هنا أو من أي نمط خطأ في شاشة مراجعة تكليف."
              : "Start here, or from any error pattern on an assignment review screen."}
            ctaLabel={lang === "ar" ? "محتوى جديد" : "New remedial content"}
            onCta={start}
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mod.remedial.map((d) => {
            const course = COURSE_BY_ID(d.courseId);
            const topic = course.topics.find((t) => t.id === d.topicId);
            return (
              <Card key={d.id} tokens={tokens}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <Chip tokens={tokens} tone="primary">{d.courseId}</Chip>
                      <Chip tokens={tokens}>{topic ? topic.label[lang] : d.topicId}</Chip>
                      <Chip tokens={tokens} tone={d.status === "published" ? "primary" : "peri"}>
                        {d.status === "published"
                          ? <><IconCheck size={10} color={tokens.primary} />{lang === "ar" ? "منشور" : "PUBLISHED"}</>
                          : <><IconDoc size={10} color={tokens.developing} />{lang === "ar" ? "مسودة" : "DRAFT"}</>}
                      </Chip>
                      <Chip tokens={tokens}>{d.type === "explanation" ? (lang === "ar" ? "شرح + مثال" : "explanation") : (lang === "ar" ? "تدريب" : "practice")}</Chip>
                    </div>
                    <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 4 }}>{d.title}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>
                      {fmtWhen(d.createdAt, lang)} · {lang === "ar" ? "الجمهور" : "audience"}: {d.audience === "all" ? (lang === "ar" ? "كل المقرر" : "all") : d.audience === "affected" ? (lang === "ar" ? "المتأثرون" : "affected") : (lang === "ar" ? `يدوي (${d.manualIds.length})` : `manual (${d.manualIds.length})`)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <RemedialPanel open={open} onClose={() => setOpen(false)} tokens={tokens} lang={lang} entry={entry} />
    </div>
  );
}
