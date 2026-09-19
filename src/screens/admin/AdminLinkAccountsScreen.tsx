import { useMemo } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, AlertStrip, toast } from "@/components/ModuleUI";
import { SectionHeading } from "@/components/SharedUI";
import { IconAnchor, IconSend, IconCheck, IconClock, IconWarning } from "@/components/Icons";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-07 — linking individual accounts: the institution invites holders of
// personal accounts living on an approved domain; nothing converts until the
// student consents, history and courses stay untouched, and a declined
// invitation stays visible because the student may change his mind later.

const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);

export default function AdminLinkAccountsScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, sendLinkInvitation, respondLinkInvitation } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const domains = mod.settings.emailDomains;
  const awaiting = mod.linkInvitations.filter((i) => i.status === "awaiting-consent").length;

  const counts = useMemo(() => ({
    candidates: mod.linkCandidates.length,
    awaiting,
    linked: mod.linkInvitations.filter((i) => i.status === "linked").length,
    declined: mod.linkInvitations.filter((i) => i.status === "declined").length,
  }), [mod.linkCandidates, mod.linkInvitations, awaiting]);

  const statusChip = (status: "awaiting-consent" | "linked" | "declined") =>
    status === "awaiting-consent"
      ? <Chip tokens={tokens} tone="peri">{t("Awaiting student consent", "بانتظار موافقة الطالب")}</Chip>
      : status === "linked"
        ? <Chip tokens={tokens} tone="primary">{t("Linked — institutional", "مرتبط — مؤسسي")}</Chip>
        : <Chip tokens={tokens} tone="violet">{t("Declined — may accept later", "مرفوض — قد يقبل لاحقًا")}</Chip>;

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Individual account linking", "ربط الحسابات الفردية")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Personal accounts on approved domains convert to institutional — only with the student's own consent.", "الحسابات الشخصية على النطاقات المعتمدة تتحول لمؤسسية — بموافقة الطالب نفسه فقط.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconAnchor size={14} color={tokens.primary} />}
          title={t(
            "Consent is the gate: before he agrees, nothing changes; after he agrees, the account becomes institutional with its history and courses fully preserved. The student keeps the right to decline.",
            "الموافقة هي البوابة: قبلها لا يتغير شيء، وبعدها يصبح الحساب مؤسسيًا بمحفوظاته ومقرراته كاملة. وللطالب حق الرفض دائمًا.",
          )}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <Chip tokens={tokens} tone="slate">{t("Candidates", "مرشحون")}: {counts.candidates}</Chip>
        <Chip tokens={tokens} tone="peri">{t("Awaiting consent", "بانتظار الموافقة")}: {counts.awaiting}</Chip>
        <Chip tokens={tokens} tone="primary">{t("Linked", "مرتبطة")}: {counts.linked}</Chip>
        <Chip tokens={tokens} tone="violet">{t("Declined", "مرفوضة")}: {counts.declined}</Chip>
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHeading
          title={t("Candidates — personal accounts on approved domains", "المرشحون — حسابات شخصية على النطاقات المعتمدة")}
          subtitle={t(`Auto-detected because their emails end in ${domains.map((d) => "@" + d).join(", ")}`, `رُصدوا تلقائيًا لأن إيميلاتهم تنتهي بـ ${domains.map((d) => "@" + d).join(", ")}`)}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mod.linkCandidates.map((c) => (
            <Card tokens={tokens} key={c.userId} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>{c.studentName}</span>
                    <Chip tokens={tokens} tone="default">{t("Individual account", "حساب فردي")}</Chip>
                    <Chip tokens={tokens} tone="slate">{c.domain}</Chip>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>{c.email}</div>
                  <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 4 }}>
                    {t(`${c.personalCourses} personal course${c.personalCourses === 1 ? "" : "s"} — everything carries over after consent`, `${c.personalCourses} مقرر شخصي — كل شيء ينتقل بعد الموافقة`)}
                  </div>
                </div>
                <Btn
                  tokens={tokens}
                  lang={lang}
                  variant="soft"
                  style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0 }}
                  onClick={() => {
                    sendLinkInvitation(c.userId);
                    toast(t(`Link invitation sent to ${c.studentName} — he decides from inside his own account.`, `أُرسلت دعوة الربط إلى ${c.studentName} — يقرر من داخل حسابه.`));
                  }}
                >
                  <IconSend size={13} color={tokens.primary} />
                  {t("Send link invitation", "إرسال دعوة ربط")}
                </Btn>
              </div>
            </Card>
          ))}
          {mod.linkCandidates.length === 0 && (
            <Card tokens={tokens} style={{ padding: "18px 16px" }}>
              <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textMuted }}>
                {t("No candidates left — every detected personal account has been invited.", "لا مرشحين متبقين — كل الحسابات الشخصية المرصودة دُعيت.")}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div>
        <SectionHeading
          title={t("Link invitations", "دعوات الربط")}
          subtitle={counts.awaiting
            ? t(`${counts.awaiting} still waiting — the student sees the consent banner the moment he logs in`, `${counts.awaiting} ما زالت منتظرة — يرى الطالب شريط الموافقة فور دخوله`)
            : t("Every invitation has been answered", "كل الدعوات أُجيب عنها")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mod.linkInvitations.map((inv) => {
            const waitingDays = inv.status === "awaiting-consent" ? daysAgo(inv.sentAt) : 0;
            return (
              <Card tokens={tokens} key={inv.id} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>{inv.studentName}</span>
                      {statusChip(inv.status)}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>{inv.email}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 5, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      {inv.status === "awaiting-consent" && (
                        <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: waitingDays >= 5 ? tokens.gap : tokens.textFaint }}>
                          <IconClock size={11} color={waitingDays >= 5 ? tokens.gap : tokens.textFaint} />
                          {waitingDays > 0 ? t(`waiting ${waitingDays}d`, `منتظرة ${waitingDays} يوم`) : t("sent today", "أُرسلت اليوم")}
                        </span>
                      )}
                      {inv.status === "linked" && inv.respondedAt && (
                        <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: tokens.primary }}>
                          <IconCheck size={11} color={tokens.primary} />
                          {t("consented — account converted, audit-logged", "وافق — تحول الحساب وسُجل في التدقيق")}
                        </span>
                      )}
                      {inv.status === "declined" && (
                        <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: tokens.gap }}>
                          <IconWarning size={11} color={tokens.gap} />
                          {t("the consent banner stays visible inside his account", "شريط الموافقة يبقى ظاهرًا داخل حسابه")}
                        </span>
                      )}
                    </div>
                  </div>
                  {inv.status === "awaiting-consent" && (
                    <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "7px 12px", fontSize: 12, flexShrink: 0 }} onClick={() => {
                      respondLinkInvitation(inv.id, "linked");
                      toast(t("Student consented (simulated) — the account is now institutional.", "وافق الطالب (محاكاة) — أصبح الحساب مؤسسيًا."));
                    }}>
                      <IconCheck size={13} color={tokens.textSecondary} />
                      {t("Simulate consent", "محاكاة الموافقة")}
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })}
          {mod.linkInvitations.length === 0 && (
            <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>
              {t("No invitations yet — invite a candidate above.", "لا دعوات بعد — ادعُ مرشحًا بالأعلى.")}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 16, lineHeight: 1.6 }}>
        {t(
          "The simulate-consent button above stands in for the student's side for review purposes — the real decision banner lives on the student interface (Batch 5).",
          "زر محاكاة الموافقة بالأعلى يمثل جهة الطالب لغرض المراجعة — شريط القرار الحقيقي يعيش في واجهة الطالب (الدفعة 5).",
        )}
      </p>
    </div>
  );
}
