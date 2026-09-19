import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Chip, AlertStrip } from "@/components/ModuleUI";
import { SectionHeading } from "@/components/SharedUI";
import { IconClock, IconUsers, IconCourses, IconSparkle, IconWarning, IconProfile } from "@/components/Icons";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-12 — platform-wide analytics as a precomputed snapshot: the numbers
// this screen shows were rolled up by the platform, not computed live — the
// institution admin reads the state, he never waits for it. Gaps (courses
// without materials, weak coverage) surface before the glossy totals.

const fmt = (n: number) => n.toLocaleString("en-US");

function MiniBar({ pct, color, tokens }: { pct: number; color: string; tokens: ReturnType<typeof tk> }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(2, Math.min(100, pct))}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
  );
}

export default function AdminAnalyticsScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const snap = mod.analytics;
  const asOfHours = Math.max(1, Math.round((Date.now() - new Date(snap.asOf).getTime()) / 36e5));
  const totals = snap.faculties.reduce(
    (acc, f) => ({
      doctors: acc.doctors + f.doctors,
      activeDoctors: acc.activeDoctors + f.activeDoctors,
      students: acc.students + f.students,
      courses: acc.courses + f.courses,
      noMaterials: acc.noMaterials + f.coursesWithoutMaterials,
    }),
    { doctors: 0, activeDoctors: 0, students: 0, courses: 0, noMaterials: 0 },
  );

  const tile = (icon: React.ReactNode, label: string, value: string, sub?: string, warn = false) => (
    <Card tokens={tokens} style={{ padding: "13px 15px", flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
        {icon}
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted }}>{label}</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: warn ? tokens.gap : tokens.textPrimary, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>{sub}</div>}
    </Card>
  );

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Platform analytics", "تحليلات المنصة")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("One snapshot, zero waiting — gaps first, gloss later.", "لقطة واحدة بلا انتظار — الفجوات أولًا ثم الأرقام اللامعة.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconClock size={14} color={tokens.primary} />}
          title={t(
            `Precomputed snapshot from ${asOfHours}h ago — the platform rolls these up in the background, so reading them never costs a live query.`,
            `لقطة محسوبة مسبقًا منذ ${asOfHours} ساعة — المنصة تلخصها في الخلفية فقراءتها لا تكلف أي استعلام مباشر.`,
          )}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading title={t("Institution at a glance", "المؤسسة في لمحة")} tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
          {tile(<IconUsers size={14} color={tokens.textSecondary} />, t("STUDENTS", "الطلاب"), fmt(totals.students))}
          {tile(<IconProfile size={14} color={tokens.textSecondary} />, t("DOCTORS", "الدكاترة"), `${totals.activeDoctors}/${totals.doctors}`, t("active this term", "نشطون هذا الترم"))}
          {tile(<IconCourses size={14} color={tokens.textSecondary} />, t("COURSES", "المقررات"), fmt(totals.courses))}
          {tile(<IconWarning size={14} color={tokens.gap} />, t("NO MATERIALS", "بلا مواد"), String(totals.noMaterials), t("courses with zero content", "مقررات بلا أي محتوى"), totals.noMaterials > 0)}
          {tile(<IconSparkle size={14} color={tokens.textSecondary} />, t("AI CALLS 30d", "طلبات AI/30 يوم"), fmt(snap.usage.aiCalls30d), `≈ $${fmt(snap.usage.estCostUsd)}`)}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading
          title={t("Faculties", "الكليات")}
          subtitle={t("Doctors, students, coverage and AI appetite — side by side so the weak faculty stands out on its own.", "الدكاترة والطلاب والتغطية وجوع الذكاء الاصطناعي — جنبًا إلى جنب حتى تبرز الكلية المتعثرة وحدها.")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {snap.faculties.map((f) => {
            const activePct = Math.round((f.activeDoctors / Math.max(1, f.doctors)) * 100);
            const barePct = Math.round((f.coursesWithoutMaterials / Math.max(1, f.courses)) * 100);
            return (
              <Card tokens={tokens} key={f.id} style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>
                        {lang === "ar" ? f.name.ar : f.name.en}
                      </span>
                      <Chip tokens={tokens} tone="slate">{fmt(f.students)} {t("students", "طالب")}</Chip>
                      <Chip tokens={tokens} tone="slate">{f.courses} {t("courses", "مقرر")}</Chip>
                      {f.coursesWithoutMaterials > 0 && (
                        <Chip tokens={tokens} tone="violet">{f.coursesWithoutMaterials} {t("without materials", "بلا مواد")}</Chip>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textMuted }}>{t("ACTIVE DOCTORS", "دكاترة نشطون")}</span>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textSecondary }}>{f.activeDoctors}/{f.doctors}</span>
                        </div>
                        <MiniBar pct={activePct} color={tokens.primary} tokens={tokens} />
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textMuted }}>{t("AVG MASTERY", "متوسط الإتقان")}</span>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textSecondary }}>{Math.round(f.masteryAvg * 100)}%</span>
                        </div>
                        <MiniBar pct={f.masteryAvg * 100} color={tokens.developing} tokens={tokens} />
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: isRtl ? "left" : "right" }}>
                    <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: tokens.textPrimary }}>{fmt(f.aiCalls30d)}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginTop: 3 }}>{t("AI calls / 30d", "طلب AI / 30 يوم")}</div>
                    {barePct > 0 && (
                      <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.gap, marginTop: 6 }}>{barePct}% {t("bare courses", "مقررات عارية")}</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading
          title={t("Coverage gaps", "فجوات التغطية")}
          subtitle={t("Departments where courses still lack grounded materials — the content officer's to-do list.", "الأقسام التي تفتقر مقرراتها لمواد مغذية للذكاء الاصطناعي — قائمة مهام مسؤول المحتوى.")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <Card tokens={tokens} style={{ padding: "4px 16px" }}>
          {snap.coverageGaps.map((gap, index) => (
            <div key={(lang === "ar" ? gap.department.ar : gap.department.en)} style={{ padding: "12px 0", borderBottom: index === snap.coverageGaps.length - 1 ? "none" : `1px solid ${tokens.cardBorder}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 7, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary, flex: 1 }}>
                  {lang === "ar" ? gap.department.ar : gap.department.en}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: gap.missingPercent >= 25 ? tokens.gap : tokens.textSecondary }}>
                  {gap.missingPercent}% {t("missing", "ناقص")}
                </span>
              </div>
              <MiniBar pct={gap.missingPercent} color={gap.missingPercent >= 25 ? tokens.gap : tokens.textFaint} tokens={tokens} />
            </div>
          ))}
        </Card>
        <p style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 12, lineHeight: 1.6 }}>
          {t(
            "The active-doctor usage figure above is what renewals are argued on — it is the only number that moves the subscription needle.",
            "رقم الدكاترة النشطين بالأعلى هو ما تُبنى عليه مفاوضات التجديد — وهو الرقم الوحيد الذي يحرك قيمة الاشتراك فعلًا.",
          )}
        </p>
      </div>
    </div>
  );
}
