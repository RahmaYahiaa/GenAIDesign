import { useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, Toggle, AlertStrip, inputStyle, toast } from "@/components/ModuleUI";
import { SectionHeading } from "@/components/SharedUI";
import { IconGear, IconPlus, IconX, IconCheck, IconShield } from "@/components/Icons";
import { SUPPLEMENTAL_SOURCE_TYPES } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-08 — institution settings: approved registration email domains,
// self-registration gate, and the AI-grounding supplemental source policy.
// Everything saves on the spot and is audit-logged — the rare visitor edits
// one row and leaves; there is no unsaved-changes ceremony.

export default function AdminSettingsScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, updateSettings } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const settings = mod.settings;
  const [newDomain, setNewDomain] = useState("");
  const domainOk = /^[a-z0-9.-]+\.[a-z]{2,}$/.test(newDomain.trim()) && !settings.emailDomains.includes(newDomain.trim().toLowerCase());

  const addDomain = () => {
    if (!domainOk) return;
    updateSettings({ emailDomains: [...settings.emailDomains, newDomain.trim().toLowerCase()] });
    setNewDomain("");
    toast(t("Domain added — saved and audit-logged.", "أُضيف النطاق — حُفظ وسُجل في التدقيق."));
  };

  const removeDomain = (domain: string) => {
    if (settings.emailDomains.length <= 1) {
      toast(t("The institution keeps at least one approved domain.", "تبقى المؤسسة على نطاق معتمد واحد على الأقل."));
      return;
    }
    updateSettings({ emailDomains: settings.emailDomains.filter((d) => d !== domain) });
    toast(t("Domain removed — saved and audit-logged.", "أُزيل النطاق — حُفظ وسُجل في التدقيق."));
  };

  const toggleSourceType = (id: string) => {
    const current = settings.allowedSupplementalSourceTypes;
    const next = current.includes(id) ? current.filter((s) => s !== id) : [...current, id];
    updateSettings({ allowedSupplementalSourceTypes: next });
    toast(t("Source policy updated — applies to new course materials instantly.", "حُدّثت سياسة المصادر — تسري على المواد الجديدة فورًا."));
  };

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Institution settings", "إعدادات المؤسسة")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Four levers only — registration, self-onboarding, course creation, and AI source policy. Each saves on the spot.", "أربع رافعات فقط — التسجيل والانضمام الذاتي وإنشاء المقررات وسياسة مصادر الذكاء الاصطناعي. كل تعديل يُحفظ في الحال.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconGear size={14} color={tokens.primary} />}
          title={t(
            "No save buttons anywhere: every change persists immediately, is audit-logged, and takes effect for the next login or upload.",
            "لا أزرار حفظ في أي مكان: كل تغيير يُخزن فورًا ويسجل في التدقيق ويسري مع أول دخول أو رفع تالٍ.",
          )}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading title={t("Institution identity", "هوية المؤسسة")} tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl} />
        <Card tokens={tokens} style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontFamily: bFont, fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>
                {lang === "ar" ? settings.institutionName.ar : settings.institutionName.en}
              </div>
              <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3 }}>
                {lang === "ar" ? settings.institutionName.en : settings.institutionName.ar}
              </div>
            </div>
            <Chip tokens={tokens} tone={settings.isActive ? "primary" : "violet"}>
              {settings.isActive ? t("Subscription active", "الاشتراك فعال") : t("Subscription suspended", "الاشتراك موقوف")}
            </Chip>
            <Chip tokens={tokens} tone="slate">{t("Contract until", "التعاقد حتى")} {settings.contractEndsAt}</Chip>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint }}>
              <IconShield size={11} color={tokens.textFaint} />
              {t("managed by the platform team", "تديره المنصة")}
            </span>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading
          title={t("Approved email domains", "النطاقات المعتمدة للتسجيل")}
          subtitle={t("Only emails ending in these can self-register or accept invitations; they also feed the account-linking detector.", "الإيميلات المنتهية بها فقط تسجل ذاتيًا أو تقبل الدعوات — وهي أيضًا ما يغذي كاشف الربط.")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <Card tokens={tokens} style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
            {settings.emailDomains.map((domain) => (
              <span key={domain} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontFamily: MONO, fontSize: 11.5, color: tokens.textPrimary, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 7, padding: "5px 10px", direction: "ltr" }}>
                @{domain}
                <button onClick={() => removeDomain(domain)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" }} aria-label={`remove ${domain}`}>
                  <IconX size={12} color={tokens.textSecondary} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addDomain(); }}
              style={{ ...inputStyle(tokens, bFont), flex: 1, direction: "ltr", textAlign: "left" }}
              placeholder="faculty.menoufia.edu.eg"
            />
            <Btn tokens={tokens} lang={lang} variant="soft" disabled={!domainOk} style={{ padding: "9px 14px", fontSize: 12.5, flexShrink: 0 }} onClick={addDomain}>
              <IconPlus size={13} color={tokens.primary} />
              {t("Add domain", "إضافة النطاق")}
            </Btn>
          </div>
          <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 8 }}>
            {t("Lowercased automatically; sub-domains of a removed domain stop registering immediately.", "يُحفظ بأحرف صغيرة تلقائيًا — النطاقات الفرعية لنطاق محذوف تتوقف عن التسجيل فورًا.")}
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading title={t("Self-onboarding", "الانضمام الذاتي")} tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl} />
        <Card tokens={tokens} style={{ padding: "13px 16px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>
                {t("Allow self-registration", "السماح بالتسجيل الذاتي")}
              </div>
              <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3, lineHeight: 1.6 }}>
                {t(
                  "On: invitations activate themselves the moment the person signs up. Off: only sync or admin-created accounts can enter.",
                  "مفعّل: الدعوات تتفعل من نفسها فور تسجيل الشخص. متوقف: لا يدخل إلا حساب مزامن أو منشأ من الإدارة.",
                )}
              </div>
            </div>
            <Toggle tokens={tokens} on={settings.allowSelfRegistration} onChange={() => {
              updateSettings({ allowSelfRegistration: !settings.allowSelfRegistration });
              toast(settings.allowSelfRegistration
                ? t("Self-registration paused — saved and audit-logged.", "توقف التسجيل الذاتي — حُفظ وسُجل في التدقيق.")
                : t("Self-registration resumed — saved and audit-logged.", "عاد التسجيل الذاتي — حُفظ وسُجل في التدقيق."));
            }} />
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading
          title={t("Course creation", "إنشاء المقررات")}
          subtitle={t("Separate from the source policy below: this controls whether a doctor may start a course shell at all — not what he uploads inside one.", "منفصلة عن سياسة المصادر بالأسفل: هذه تتحكم في إنشاء هيكل المقرر نفسه — لا في ما يُرفع داخله.")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <Card tokens={tokens} style={{ padding: "13px 16px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>
                {t("Allow doctors to create courses", "السماح للدكاترة بإنشاء مقررات")}
              </div>
              <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 3, lineHeight: 1.6 }}>
                {t(
                  "On: a doctor sees «New course» inside his own department and provisions it himself. Off: courses arrive only from institutional setup or bulk import — the button disappears and existing courses are untouched.",
                  "مفعّل: يرى الدكتور زر «مقرر جديد» داخل قسمه ويجهزه بنفسه. متوقف: المقررات تأتي فقط من الإعداد المؤسسي أو الإدخال الجماعي — يختفي الزر وتبقى المقررات القائمة كما هي.",
                )}
              </div>
            </div>
            <Toggle tokens={tokens} on={settings.allowDoctorCourseCreation} onChange={() => {
              updateSettings({ allowDoctorCourseCreation: !settings.allowDoctorCourseCreation });
              toast(settings.allowDoctorCourseCreation
                ? t("Doctor course creation blocked — saved and audit-logged.", "أُوقف إنشاء المقررات للدكاترة — حُفظ وسُجل في التدقيق.")
                : t("Doctors may create courses again — saved and audit-logged.", "عاد إنشاء المقررات للدكاترة — حُفظ وسُجل في التدقيق."));
            }} />
          </div>
        </Card>
      </div>

      <div>
        <SectionHeading
          title={t("Allowed supplemental source types", "أنواع المصادر التكميلية المسموحة")}
          subtitle={t("What doctors may upload to ground the AI — blocked types are rejected at upload time with a clear reason.", "ما يسمح للدكاترة برفعه لتغذية الذكاء الاصطناعي — الأنواع المحظورة تُرفض وقت الرفع بسبب واضح.")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <Card tokens={tokens} style={{ padding: "4px 16px" }}>
          {SUPPLEMENTAL_SOURCE_TYPES.map((src, index) => {
            const on = settings.allowedSupplementalSourceTypes.includes(src.id);
            return (
              <div key={src.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: index === SUPPLEMENTAL_SOURCE_TYPES.length - 1 ? "none" : `1px solid ${tokens.cardBorder}`, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>
                      {lang === "ar" ? src.label.ar : src.label.en}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{src.id}</span>
                    {on && (
                      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                        <IconCheck size={11} color={tokens.primary} />
                        <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.primary }}>{t("allowed", "مسموح")}</span>
                      </span>
                    )}
                  </div>
                </div>
                <Toggle tokens={tokens} on={on} onChange={() => toggleSourceType(src.id)} />
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
