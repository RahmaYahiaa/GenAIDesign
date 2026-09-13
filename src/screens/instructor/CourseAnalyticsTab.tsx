import { useState } from "react";
import { AppState } from "../../components/AppShell";
import { tk, MONO, masteryLevel, masteryColor, masteryBg, masteryLevelLabel, MasteryLevel } from "../../tokens";
import { useInstructorModule } from "../../store/InstructorStore";
import { Card, Btn, Chip, Modal, Field, inputStyle, AlertStrip, bFontFor, hFontFor, Th } from "../../components/ModuleUI";
import { StatTile, MasteryBar, MasteryPill, CitationChip } from "../../components/SharedUI";
import { IconSparkle, IconWarning, IconUpload, IconTrendUp, IconClock, IconLock } from "../../components/Icons";
import RemedialPanel, { RemedialEntry } from "../../components/RemedialPanel";
import { STUDENTS, approvedMaterials, fmtWhen, StudentInfo } from "../../data/instructorModule";

// ─────────────────────────────────────────────────────────────────────────────
// Course analytics (FR-ANALYTICS-01..05, FR-COVERAGE-*). Precomputed figures
// with an explicit "as of" freshness stamp — never a live-updating dashboard.
// Mastery visuals reuse the exact per-student mastery language.
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS: MasteryLevel[] = ["no-evidence", "beginner", "intermediate", "advanced", "mastered"];

export default function CourseAnalyticsTab({ state, courseId }: { state: AppState; courseId: string }) {
  const { state: mod, addMaterial } = useInstructorModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);

  const course = mod.courses.find((c) => c.id === courseId) ?? mod.courses[0];
  const [remedialEntry, setRemedialEntry] = useState<RemedialEntry | null>(null);
  const [authFor, setAuthFor] = useState<StudentInfo | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  // Class mastery distribution — same ladder language as the student view.
  const distribution = LEVELS.map((lvl) => ({
    level: lvl,
    count: STUDENTS.filter((s) => masteryLevel(s.avg, true) === lvl).length,
  }));
  const totalStudents = STUDENTS.length;

  // Topics ranked most → least problematic.
  const ranked = [...course.topics]
    .filter((t) => t.evidence > 0)
    .sort((a, b) => a.pct - b.pct);
  const coverageGaps = course.topics.filter((t) => approvedMaterials(t) === 0);

  // Bounded attention list: multiple gaps OR a clear decline — never the roster.
  const attention = STUDENTS.filter((s) => s.gaps.length >= 2 || s.trend === "declining").slice(0, 5);

  const trendColor = (t: StudentInfo["trend"]) => (t === "improving" ? tokens.mastered : t === "declining" ? tokens.gap : tokens.developing);
  const trendLabel = (t: StudentInfo["trend"]) => (t === "improving" ? (lang === "ar" ? "يتحسن" : "Improving") : t === "declining" ? (lang === "ar" ? "يتراجع" : "Declining") : (lang === "ar" ? "مستقر" : "Stable"));

  const uploadTopic = course.topics.find((t) => t.id === uploadFor);

  return (
    <>
      {/* Header + freshness */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 12, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h2 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 19, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 3px" }}>
            {lang === "ar" ? "تحليلات المقرر" : "Course analytics"}
          </h2>
          <p style={{ fontSize: 12.5, color: tokens.textMuted, margin: 0, fontFamily: bFont }}>
            {course.instructor} · {lang === "ar" ? `الأسبوع ${course.week}` : `Week ${course.week}`}
          </p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 8 }}>
          <IconClock size={12} color={tokens.textMuted} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textMuted, letterSpacing: "0.04em" }}>
            {lang === "ar" ? "محسوب مسبقاً حتى" : "PRECOMPUTED AS OF"} {fmtWhen(mod.analyticsAsOf, lang)}
          </span>
        </div>
      </div>

      {/* Stat row — established visual language */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatTile label={lang === "ar" ? "الطلاب" : "Students"} value={`${course.enrolled}`} sub={lang === "ar" ? "مسجّلون" : "enrolled"} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "متوسط الإتقان" : "Avg. mastery"} value={`${course.overall}%`} sub={lang === "ar" ? "كل المواضيع" : "all topics"} mono accent={masteryColor(masteryLevel(course.overall, true), tokens)} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "يحتاجون انتباهاً" : "Need attention"} value={`${attention.length}`} sub={lang === "ar" ? "فجوات متعددة أو تراجع" : "multiple gaps or decline"} accent={tokens.gap} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "مواضيع مشكلة" : "Problematic topics"} value={`${ranked.filter((t) => t.pct <= 60).length}`} sub={lang === "ar" ? "إتقان ≤ 60%" : "mastery ≤ 60%"} accent={tokens.developing} tokens={tokens} headFont={hFont} bodyFont={bFont} />
        <StatTile label={lang === "ar" ? "فجوات تغطية" : "Coverage gaps"} value={`${coverageGaps.length}`} sub={lang === "ar" ? "بلا مادة معتمدة" : "zero approved material"} accent={coverageGaps.length ? tokens.gap : tokens.mastered} tokens={tokens} headFont={hFont} bodyFont={bFont} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Class mastery distribution */}
        <Card tokens={tokens}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
              {lang === "ar" ? "توزيع إتقان الدفعة" : "Class mastery distribution"}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{lang === "ar" ? "نفس سلّم إتقان الطالب" : "same ladder as student view"}</span>
          </div>
          {distribution.map((d) => {
            const color = masteryColor(d.level, tokens);
            const pct = Math.round((d.count / totalStudents) * 100);
            return (
              <div key={d.level} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ width: 96, flexShrink: 0, textAlign: isRtl ? "right" : "left" }}>
                  <MasteryPill level={d.level} tokens={tokens} lang={lang} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, background: tokens.inset, borderRadius: 4, overflow: "hidden", border: `1px solid ${tokens.insetBorder}` }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.8s ease-out" }} />
                  </div>
                </div>
                <div style={{ width: 74, flexShrink: 0, textAlign: isRtl ? "left" : "right" }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color }}>{d.count}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}> · {pct}%</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 12, padding: "9px 12px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 8, fontFamily: bFont, fontSize: 11, color: tokens.textMuted, lineHeight: 1.55 }}>
            {lang === "ar"
              ? "مجمّع من خرائط الإتقان الفردية ويُحدَّث عند اعتماد الدرجات أو نشر محتوى علاجي."
              : "Aggregated from individual mastery maps; refreshed when grades are finalized or remedial content is published."}
          </div>
        </Card>

        {/* Ranked problematic topics */}
        <Card tokens={tokens}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
              {lang === "ar" ? "المواضيع من الأكثر للأقل مشكلة" : "Topics, most → least problematic"}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{lang === "ar" ? "مرتّب بالشدة" : "ranked by severity"}</span>
          </div>
          {ranked.map((t, i) => {
            const level = masteryLevel(t.pct, true);
            const color = masteryColor(level, tokens);
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < ranked.length - 1 ? `1px solid ${tokens.cardBorder}` : "none", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: masteryBg(level, tokens), color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
                  <div style={{ fontFamily: bFont, fontSize: 12, fontWeight: 500, color: tokens.textPrimary, marginBottom: 4 }}>{lang === "ar" ? t.label.ar : t.label.en}</div>
                  <MasteryBar pct={t.pct} evidence={t.evidence} thin tokens={tokens} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color, width: 40, textAlign: isRtl ? "left" : "right", flexShrink: 0 }}>{t.pct}%</span>
                <Btn tokens={tokens} lang={lang} variant="violet" onClick={() => setRemedialEntry({ courseId: course.id, topicId: t.id })} style={{ padding: "4px 9px", fontSize: 10.5, flexShrink: 0 }}>
                  <IconSparkle size={11} color={tokens.gap} />
                  {lang === "ar" ? "محتوى علاجي" : "Remedial"}
                </Btn>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Students requiring attention — bounded */}
        <Card tokens={tokens} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${tokens.cardBorder}`, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>
              {lang === "ar" ? "طلاب يحتاجون انتباهاً" : "Students requiring attention"}
            </div>
            <Chip tokens={tokens} tone="violet">{lang === "ar" ? "فجوات متعددة أو تراجع واضح — ليس القائمة الكاملة" : "multiple gaps or clear decline — not the full roster"}</Chip>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th tokens={tokens}>{lang === "ar" ? "الطالب" : "Student"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "الإتقان" : "Mastery"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "الفجوات" : "Gaps"}</Th>
                <Th tokens={tokens}>{lang === "ar" ? "الاتجاه" : "Trend"}</Th>
                <Th tokens={tokens} align="right"></Th>
              </tr>
            </thead>
            <tbody>
              {attention.map((s, i) => {
                const level = masteryLevel(s.avg, true);
                const color = masteryColor(level, tokens);
                return (
                  <tr key={s.id} style={{ borderBottom: i < attention.length - 1 ? `1px solid ${tokens.cardBorder}` : "none" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <span style={{ width: 26, height: 26, borderRadius: "50%", background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: hFont, fontWeight: 700, fontSize: 9.5, color: tokens.primary, flexShrink: 0 }}>
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                        <span style={{ fontFamily: bFont, fontSize: 12.5, fontWeight: 500, color: tokens.textPrimary }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 46, height: 4, background: tokens.inset, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${s.avg}%`, background: color, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color }}>{s.avg}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textMuted }}>{s.gaps.length} {lang === "ar" ? "فجوات" : "gaps"}</span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontFamily: MONO, fontSize: 9.5, color: trendColor(s.trend), background: `${trendColor(s.trend)}18`, border: `1px solid ${trendColor(s.trend)}44`, borderRadius: 4, padding: "2px 7px" }}>
                        {trendLabel(s.trend)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <Btn tokens={tokens} lang={lang} variant="soft" onClick={() => { setAuthFor(s); setAuthorized(false); }} style={{ padding: "4px 9px", fontSize: 10.5 }}>
                        {lang === "ar" ? "فتح" : "Open"}
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Material coverage alerts */}
        <Card tokens={tokens}>
          <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary, marginBottom: 12 }}>
            {lang === "ar" ? "تنبيهات تغطية المواد" : "Material coverage alerts"}
          </div>
          {coverageGaps.length === 0 ? (
            <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted, lineHeight: 1.6 }}>
              {lang === "ar" ? "كل مواضيع هذا المقرر لديها مادة معتمدة واحدة على الأقل." : "Every topic in this course has at least one approved material."}
            </div>
          ) : (
            coverageGaps.map((t) => (
              <div key={t.id} style={{ marginBottom: 10 }}>
                <AlertStrip
                  tokens={tokens}
                  lang={lang}
                  tone="violet"
                  icon={<IconWarning size={13} color={tokens.gap} />}
                  title={lang === "ar" ? `صفر مادة معتمدة: ${t.label.ar}` : `Zero approved material: ${t.label.en}`}
                  body={lang === "ar"
                    ? "التقييم والمعلم الذكي لا يستطيعان الاستناد لهذا الموضوع."
                    : "Evaluation and the AI tutor cannot ground this topic."}
                  action={
                    <Btn tokens={tokens} lang={lang} variant="violet" onClick={() => { setUploadFor(t.id); setUploadTitle(""); }} style={{ padding: "5px 10px", fontSize: 11 }}>
                      <IconUpload size={11} color={tokens.gap} />
                      {lang === "ar" ? "ارفع مادة" : "Upload material"}
                    </Btn>
                  }
                />
              </div>
            ))
          )}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${tokens.cardBorder}`, fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.6 }}>
            {lang === "ar"
              ? "تنبيه وقائي: يظهر قبل أن يختبره الطلاب كعجز في المعلم الذكي."
              : "A preventive alert: it surfaces before students experience it as the tutor being unable to answer."}
          </div>
        </Card>
      </div>

      {/* Student authorization modal (FR-ANALYTICS-05) */}
      <Modal
        open={authFor !== null}
        onClose={() => setAuthFor(null)}
        tokens={tokens}
        lang={lang}
        width={520}
        title={authFor ? authFor.name : ""}
        subtitle={lang === "ar"
          ? "فتح سجل طالب فردي يتطلب تفويض المدرّس على مستوى المقرر — نفس التفويض المفروض في بقية المنصة."
          : "Opening an individual student record requires the same course-scoped instructor authorization enforced elsewhere on the platform."}
      >
        {!authorized ? (
          <div>
            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="peri"
              icon={<IconLock size={13} color={tokens.developing} />}
              title={lang === "ar" ? "التفويض مطلوب" : "Authorization required"}
              body={lang === "ar"
                ? `أنت مخوّل كمدرّس لـ ${course.id}. تأكيد التفويض يسجّل دخولك إلى سجل الطالب.`
                : `You are staff on ${course.id}. Confirming logs your entry into this student record.`}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
              <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setAuthFor(null)}>{lang === "ar" ? "إلغاء" : "Cancel"}</Btn>
              <Btn tokens={tokens} lang={lang} onClick={() => setAuthorized(true)}>
                <IconLock size={13} color="#fff" />
                {lang === "ar" ? "تأكيد التفويض وفتح السجل" : "Confirm authorization"}
              </Btn>
            </div>
          </div>
        ) : authFor ? (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Chip tokens={tokens} tone="primary">{course.id}</Chip>
              <Chip tokens={tokens}>{authFor.sessions} {lang === "ar" ? "جلسات ذكاء اصطناعي" : "AI sessions"}</Chip>
              <span style={{ fontFamily: MONO, fontSize: 10, color: trendColor(authFor.trend), background: `${trendColor(authFor.trend)}18`, border: `1px solid ${trendColor(authFor.trend)}44`, borderRadius: 4, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <IconTrendUp size={10} color={trendColor(authFor.trend)} />
                {trendLabel(authFor.trend)}
              </span>
            </div>
            {course.topics.map((t) => {
              const isGap = authFor.gaps.includes(t.id);
              const pct = isGap ? Math.max(8, t.pct - 18) : Math.min(96, t.pct + 12);
              const level = masteryLevel(pct, true);
              return (
                <div key={t.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textSecondary, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {isGap && <IconWarning size={11} color={tokens.gap} />}
                      {lang === "ar" ? t.label.ar : t.label.en}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: masteryColor(level, tokens) }}>{pct}%</span>
                  </div>
                  <MasteryBar pct={pct} evidence={1} thin tokens={tokens} />
                </div>
              );
            })}
            <div style={{ marginTop: 12 }}>
              <CitationChip label={lang === "ar" ? "سجل دخول المفوّض مسجّل" : "authorized access logged"} tokens={tokens} />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Direct upload for a flagged topic */}
      <Modal
        open={uploadFor !== null}
        onClose={() => setUploadFor(null)}
        tokens={tokens}
        lang={lang}
        title={lang === "ar" ? `رفع مادة — ${uploadTopic ? uploadTopic.label.ar : ""}` : `Upload material — ${uploadTopic ? uploadTopic.label.en : ""}`}
        subtitle={lang === "ar" ? "تُزال فجوة التغطية بعد اعتماد المادة." : "The coverage gap clears once the material is approved."}
      >
        <Field label={lang === "ar" ? "عنوان المادة" : "Material title"} tokens={tokens} lang={lang} required>
          <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} style={inputStyle(tokens, bFont)} className="genai-input" placeholder={lang === "ar" ? "مثال: المحاضرة 9 — ديكسترا" : "e.g. Lecture 9 — Dijkstra"} />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn tokens={tokens} lang={lang} variant="ghost" onClick={() => setUploadFor(null)}>{lang === "ar" ? "إلغاء" : "Cancel"}</Btn>
          <Btn tokens={tokens} lang={lang} disabled={!uploadTitle.trim()} onClick={() => { if (uploadFor) addMaterial(course.id, uploadFor, uploadTitle.trim()); setUploadFor(null); }}>
            <IconUpload size={13} color="#fff" />
            {lang === "ar" ? "رفع" : "Upload"}
          </Btn>
        </div>
      </Modal>

      <RemedialPanel open={remedialEntry !== null} onClose={() => setRemedialEntry(null)} tokens={tokens} lang={lang} entry={remedialEntry} />
    </>
  );
}
