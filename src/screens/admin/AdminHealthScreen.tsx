import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, AlertStrip } from "@/components/ModuleUI";
import { SectionHeading } from "@/components/SharedUI";
import { IconShield, IconInbox, IconUpload, IconBookOpen, IconTrendUp, IconCheck } from "@/components/Icons";
import { AUDIT_TYPE_LABELS, officerPermissionsOf, PERMISSION_LABELS, templateOf } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-11 — the rare visitor's home. Answers one question: is everything
// healthy, or does something need my intervention? Not a daily action center.

function fmtWhen(iso: string, lang: "en" | "ar") {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 6e4));
  if (mins < 60) return lang === "ar" ? `منذ ${mins} دقيقة` : `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return lang === "ar" ? `منذ ${h} ساعة` : `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return lang === "ar" ? `منذ ${d} يوم` : `${d}d ago`;
  const mo = Math.round(d / 30);
  return lang === "ar" ? `منذ ${mo} شهر` : `${mo}mo ago`;
}

export default function AdminHealthScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { health, state: mod, visibleAudit } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const allHealthy =
    health.pendingRequests === 0 && health.oldestInvitationDays < 7 && health.coursesWithoutMaterials === 0 && mod.settings.isActive;

  const officers = mod.users.filter((u) => u.kind === "officer");

  return (
    <div style={{ padding: "26px 32px", maxWidth: 1080, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Institution health", "صحة المؤسسة")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t(
            "One question for a rare visit: is everything sound, or does something need my intervention?",
            "سؤال واحد لزيارة نادرة: هل كل شيء سليم أم يوجد ما يحتاج تدخلي؟",
          )}
        </p>
      </div>

      {mod.settings.isActive ? (
        allHealthy ? (
          <div style={{ marginBottom: 18 }}>
            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="peri"
              icon={<IconCheck size={14} color={tokens.primary} />}
              title={t("Everything is sound — nothing needs your intervention.", "كل شيء سليم — لا يوجد ما يحتاج تدخلك.")}
              body={t(`Contract runs until ${mod.settings.contractEndsAt}. This page tells you the moment that changes.`, `العقد سارٍ حتى ${mod.settings.contractEndsAt}. هذه الصفحة تنبهك فور اختلاف ذلك.`)}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 18 }}>
            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="violet"
              icon={<IconShield size={14} color={tokens.gap} />}
              title={t("A few items need your attention below.", "بعض العناصر تحتاج انتباهك بالأسفل.")}
            />
          </div>
        )
      ) : (
        <div style={{ marginBottom: 18 }}>
          <AlertStrip
            tokens={tokens}
            lang={lang}
            tone="violet"
            icon={<IconShield size={14} color={tokens.gap} />}
            title={t("Contract inactive — every institutional account is blocked from login.", "العقد غير نشط — كل الحسابات المؤسسية ممنوعة من الدخول.")}
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 22 }}>
        <Card tokens={tokens} style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => setState({ ...state, screen: "admin-requests" })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconInbox size={14} color={health.pendingRequests ? tokens.gap : tokens.textFaint} />
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted }}>{t("PENDING REQUESTS", "طلبات معلقة")}</span>
          </div>
          <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 26, color: health.pendingRequests ? tokens.gap : tokens.textPrimary }}>{health.pendingRequests}</div>
          <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3 }}>
            {t("Out-of-year enrollments awaiting a decision", "طلبات تسجيل خارج السنة بانتظار البت")}
          </div>
        </Card>

        <Card tokens={tokens} style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => setState({ ...state, screen: "admin-bulk-import" })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconUpload size={14} color={health.oldestInvitationDays >= 7 ? tokens.gap : tokens.textFaint} />
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted }}>{t("UNACCEPTED INVITATIONS", "دعوات لم تُقبل")}</span>
          </div>
          <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 26, color: health.oldestInvitationDays >= 7 ? tokens.gap : tokens.textPrimary }}>{health.unacceptedInvitations}</div>
          <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3 }}>
            {health.unacceptedInvitations
              ? t(`Oldest waiting ${health.oldestInvitationDays} days — a contact-problem signal, not a system fault`, `أقدمها منتظرة ${health.oldestInvitationDays} يوم — مؤشر مشكلة تواصل لا مشكلة نظام`)
              : t("Every bulk invitation has been accepted", "كل دعوات الإدخال الجماعي قُبلت")}
          </div>
        </Card>

        <Card tokens={tokens} style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => setState({ ...state, screen: "admin-analytics" })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconBookOpen size={14} color={health.coursesWithoutMaterials ? tokens.gap : tokens.textFaint} />
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted }}>{t("COVERAGE GAPS", "فجوات التغطية")}</span>
          </div>
          <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 26, color: health.coursesWithoutMaterials ? tokens.gap : tokens.textPrimary }}>
            {health.coursesWithoutMaterials}<span style={{ fontSize: 13, color: tokens.textFaint, fontWeight: 500 }}> / {health.totalCourses}</span>
          </div>
          <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3 }}>
            {t("Courses with zero approved material, institution-wide", "مقررات بلا أي مواد معتمدة على مستوى المؤسسة")}
          </div>
        </Card>

        <Card tokens={tokens} style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconShield size={14} color={mod.settings.isActive ? tokens.primary : tokens.gap} />
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted }}>{t("CONTRACT", "العقد")}</span>
          </div>
          <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 16, color: mod.settings.isActive ? tokens.primary : tokens.gap }}>
            {mod.settings.isActive ? t("Active", "سارٍ") : t("Inactive", "غير نشط")}
          </div>
          <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3 }}>
            {mod.settings.isActive ? t(`Runs until ${mod.settings.contractEndsAt}`, `سارٍ حتى ${mod.settings.contractEndsAt}`) : t("Login blocked for the whole institution", "الدخول محظور على المؤسسة كلها")}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
        <div>
          <SectionHeading
            title={t("Delegation activity", "نشاط التفويض")}
            subtitle={t(`${health.activeOfficers} of ${health.totalOfficers} officers active in the last 7 days`, `${health.activeOfficers} من ${health.totalOfficers} مسؤولين نشطون خلال ٧ أيام`)}
            tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {officers.map((officer) => {
              const tpl = templateOf(officer);
              const perms = officerPermissionsOf(officer);
              const activeNow = Date.now() - new Date(officer.lastActiveAt).getTime() < 7 * 864e5;
              return (
                <Card tokens={tokens} key={officer.id} style={{ padding: "12px 16px", cursor: "pointer" }} onClick={() => setState({ ...state, screen: "admin-officers" })}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>
                          {officer.firstName} {officer.lastName}
                        </span>
                        {officer.isSuperAdmin && <Chip tokens={tokens} tone="primary">{t("Super admin", "سوبر أدمن")}</Chip>}
                        {officer.officerPermissions && !officer.isSuperAdmin && <Chip tokens={tokens} tone="violet">{t("Custom", "مخصص")}</Chip>}
                      </div>
                      <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted, marginTop: 3 }}>
                        {officer.isSuperAdmin
                          ? t("Full permissions", "صلاحيات كاملة")
                          : tpl
                            ? (lang === "ar" ? tpl.name.ar : tpl.name.en)
                            : t("No template assigned", "بلا قالب معيّن")}
                        {!officer.isSuperAdmin && perms.length > 0 && (
                          <span style={{ fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint }}> · {perms.length} {t("scopes", "نطاقات")}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: activeNow ? tokens.primary : tokens.noEvidence, flexShrink: 0 }}>
                      {activeNow ? t("active", "نشط") : fmtWhen(officer.lastActiveAt, lang)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeading
            title={t("Latest audit events", "أحدث أحداث التدقيق")}
            subtitle={t("Within your permission scope", "ضمن نطاق صلاحياتك")}
            tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
            action={
              <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => setState({ ...state, screen: "admin-audit" })}>
                {t("Full log", "السجل الكامل")}
              </Btn>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleAudit.slice(0, 4).map((event) => (
              <Card tokens={tokens} key={event.id} style={{ padding: "11px 14px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <Chip tokens={tokens} tone="default">{lang === "ar" ? AUDIT_TYPE_LABELS[event.type].ar : AUDIT_TYPE_LABELS[event.type].en}</Chip>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>
                    {PERMISSION_LABELS[event.scope][lang === "ar" ? "ar" : "en"]}
                  </span>
                </div>
                <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.6 }}>
                  {lang === "ar" ? event.summary.ar : event.summary.en}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginTop: 5 }}>
                  {event.actorName} · {fmtWhen(event.at, lang)}
                </div>
              </Card>
            ))}
            {visibleAudit.length === 0 && (
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>
                {t("Nothing logged inside your scope yet.", "لا أحداث مسجلة داخل نطاقك بعد.")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, padding: "12px 16px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, display: "flex", gap: 10, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <IconTrendUp size={14} color={tokens.developing} />
        <span style={{ fontFamily: bFont, fontSize: 12, color: tokens.textSecondary }}>
          {t(
            "Platform-wide analytics update once a day (precomputed) — ",
            "تحليلات المنصة تتحدث مرة يوميًا (محسوبة مسبقًا) — ",
          )}
          <button onClick={() => setState({ ...state, screen: "admin-analytics" })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: bFont, fontSize: 12, color: tokens.primary, fontWeight: 600 }}>
            {t("open analytics", "افتح التحليلات")}
          </button>
        </span>
      </div>
    </div>
  );
}
