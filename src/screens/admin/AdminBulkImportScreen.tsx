import { useMemo, useRef, useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, ConfirmBtn, AlertStrip, toast } from "@/components/ModuleUI";
import { SectionHeading } from "@/components/SharedUI";
import { IconUpload, IconDoc, IconCheck, IconWarning, IconBan, IconClock } from "@/components/Icons";
import { ImportRole } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-03 — bulk invitations, never instant accounts. Preview summary
// (new / existing / errors) before confirmation; bad rows are rejected
// individually without aborting the file. Accounts activate on
// self-registration; existing accounts enroll directly. No temp passwords.

type DraftRow = { firstName: string; lastName: string; email: string; role: ImportRole | ""; courseCodes: string[] };

const SAMPLE_ROWS: DraftRow[] = [
  { firstName: "Retag", lastName: "Nabil", email: "retag.nabil@menoufia.edu.eg", role: "student", courseCodes: ["CS301"] },
  { firstName: "Retag", lastName: "Nabil", email: "retag.nabil@menoufia.edu.eg", role: "student", courseCodes: ["CS301"] },
  { firstName: "Sara", lastName: "Mitchell", email: "sara.mitchell@gmail.com", role: "student", courseCodes: ["CS301"] },
  { firstName: "", lastName: "Hany", email: "", role: "student", courseCodes: ["CS201"] },
  { firstName: "Karim", lastName: "Saad", email: "karim.saad@menoufia.edu.eg", role: "", courseCodes: ["CS301"] },
  { firstName: "Salma", lastName: "Farouk", email: "salma.farouk@menoufia.edu.eg", role: "student", courseCodes: ["CS201", "CS301"] },
  { firstName: "Rania", lastName: "Adel", email: "rania.adel@menoufia.edu.eg", role: "doctor", courseCodes: ["BIO110"] },
  { firstName: "Marwan", lastName: "Tarek", email: "marwan.tarek@menoufia.edu.eg", role: "student", courseCodes: [] },
];

function parseCsv(text: string): DraftRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index) => !(index === 0 && /first|name|اسم/i.test(line)))
    .map((line) => {
      const parts = line.split(/[,\t;]/).map((p) => p.trim());
      const [firstName = "", lastName = "", email = "", roleRaw = "", coursesRaw = ""] = parts;
      const lowered = roleRaw.toLowerCase();
      const role: ImportRole | "" = lowered === "doctor" ? "doctor" : lowered === "student" ? "student" : "";
      const courseCodes = coursesRaw ? coursesRaw.split(/[+|]/).map((c) => c.trim().toUpperCase()).filter(Boolean) : [];
      return { firstName, lastName, email, role, courseCodes };
    });
}

const VERDICT_TONE = { new: "primary", existing: "peri", error: "violet" } as const;

export default function AdminBulkImportScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, stageImport, confirmImport, discardImport, health } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const fileRef = useRef<HTMLInputElement>(null);
  const [localBusy, setLocalBusy] = useState(false);

  const openBatch = mod.batches.find((b) => !b.confirmed) ?? null;
  const doneBatches = mod.batches.filter((b) => b.confirmed);

  const preview = useMemo(() => {
    if (!openBatch) return null;
    return {
      total: openBatch.rows.length,
      newCount: openBatch.rows.filter((r) => r.verdict === "new").length,
      existingCount: openBatch.rows.filter((r) => r.verdict === "existing").length,
      errorCount: openBatch.rows.filter((r) => r.verdict === "error").length,
    };
  }, [openBatch]);

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    setLocalBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      stageImport(file.name, parseCsv(String(reader.result)));
      setLocalBusy(false);
      toast(t("File analysed — review the summary below before confirming.", "تحلل الملف — راجع الملخص بالأسفل قبل التأكيد."));
    };
    reader.onerror = () => setLocalBusy(false);
    reader.readAsText(file);
  };

  const verdictChip = (verdict: "new" | "existing" | "error") => (
    <Chip tokens={tokens} tone={VERDICT_TONE[verdict]}>
      {verdict === "new" ? t("Invitation", "دعوة") : verdict === "existing" ? t("Existing — direct enroll", "قائم — انضمام مباشر") : t("Rejected", "مرفوض")}
    </Chip>
  );

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Bulk invitations", "الإدخال الجماعي")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Invitations tied to courses — never instant accounts, never temporary passwords.", "دعوات مربوطة بمقررات — لا حسابات فورية أبدًا ولا كلمات مرور مؤقتة.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconCheck size={14} color={tokens.primary} />}
          title={t(
            "Each row creates an invitation linked to a course — the real account activates the moment the person self-registers with the same email, and lands in the right course without typing any course code.",
            "كل صف ينشئ دعوة مربوطة بمقرر — الحساب الحقيقي يتفعل لحظة تسجيل الشخص بنفس الإيميل، ويصل للمقرر المقصود دون كتابة أي كود.",
          )}
        />
      </div>

      <Card tokens={tokens} style={{ padding: "16px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted, marginBottom: 7 }}>
              {t("FIXED COLUMNS", "الأعمدة الثابتة")}
            </div>
            <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.7 }}>
              {t("first name · last name · email · role (student/doctor) · course code", "الاسم الأول · اسم العائلة · الإيميل · الدور (طالب/دكتور) · كود المقرر")}
            </div>
            <div style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 4 }}>
              {t("CSV or Excel-exported text. Multiple courses separated by +.", "CSV أو نص مصدّر من Excel. أكثر من مقرر يفصل بينهم +.")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Btn tokens={tokens} lang={lang} variant="soft" disabled={localBusy} style={{ padding: "10px 16px", fontSize: 12.5 }} onClick={() => fileRef.current?.click()}>
              <IconUpload size={14} color={tokens.primary} />
              {t("Choose file", "اختر ملفًا")}
            </Btn>
            <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "10px 16px", fontSize: 12.5 }} onClick={() => {
              stageImport("cs301-fall.csv", SAMPLE_ROWS);
              toast(t("Sample file analysed — every edge case included.", "تحلل الملف التجريبي — يتضمن كل الحالات الحدّية."));
            }}>
              <IconDoc size={14} color={tokens.textSecondary} />
              {t("Try sample file", "جرّب ملفًا تجريبيًا")}
            </Btn>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            onPickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </Card>

      {openBatch && preview && (
        <div style={{ marginBottom: 18 }}>
          <SectionHeading
            title={t("Preview before executing", "معاينة قبل التنفيذ")}
            subtitle={openBatch.fileName}
            tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
            action={
              <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => discardImport(openBatch.id)}>
                  <IconBan size={13} color={tokens.textSecondary} />
                  {t("Discard", "إلغاء")}
                </Btn>
                <ConfirmBtn
                  tokens={tokens}
                  lang={lang}
                  variant="solid"
                  label={t(`Send ${preview.newCount} invitations · enroll ${preview.existingCount}`, `أرسل ${preview.newCount} دعوة · ضمّ ${preview.existingCount}`)}
                  confirmLabel={t("Click again to execute the import", "اضغط للتأكيد لتنفيذ الإدخال")}
                  onConfirm={() => {
                    confirmImport(openBatch.id);
                    toast(t("Import executed and audit-logged.", "نُفّذ الإدخال وسُجّل في التدقيق."));
                  }}
                />
              </div>
            }
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Chip tokens={tokens} tone="slate">{t("Rows", "صفوف")}: {preview.total}</Chip>
            <Chip tokens={tokens} tone="primary">{t("New invitations", "دعوات جديدة")}: {preview.newCount}</Chip>
            <Chip tokens={tokens} tone="peri">{t("Existing accounts", "حسابات قائمة")}: {preview.existingCount}</Chip>
            <Chip tokens={tokens} tone="violet">{t("Errors — rejected rows only", "أخطاء — صفوف مرفوضة فقط")}: {preview.errorCount}</Chip>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openBatch.rows.map((row) => (
              <Card tokens={tokens} key={row.row} style={{ padding: "10px 14px", opacity: row.verdict === "error" ? 0.72 : 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, width: 28, flexShrink: 0 }}>#{row.row}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>
                      {row.firstName || t("(missing first name)", "(اسم أول ناقص)")} {row.lastName}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, marginInlineStart: 8 }}>
                      {row.email || t("(missing email)", "(إيميل ناقص)")}
                    </span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textSecondary, flexShrink: 0 }}>
                    {row.role ? (row.role === "student" ? t("student", "طالب") : t("doctor", "دكتور")) : t("invalid role", "دور غير صحيح")}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: tokens.textSecondary, flexShrink: 0 }}>
                    {row.courseCodes.length ? row.courseCodes.join(" + ") : "—"}
                  </span>
                  <span style={{ flexShrink: 0 }}>{verdictChip(row.verdict)}</span>
                </div>
                {row.verdict === "error" && row.errorReason && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <IconWarning size={12} color={tokens.gap} />
                    <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.gap }}>
                      {lang === "ar" ? row.errorReason.ar : row.errorReason.en}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {doneBatches.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionHeading title={t("Import history", "سجل الإدخالات")} tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {doneBatches.map((batch) => {
              const n = batch.rows.filter((r) => r.verdict === "new").length;
              const e = batch.rows.filter((r) => r.verdict === "existing").length;
              const x = batch.rows.filter((r) => r.verdict === "error").length;
              return (
                <Card tokens={tokens} key={batch.id} style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <IconDoc size={13} color={tokens.textFaint} />
                    <span style={{ fontFamily: MONO, fontSize: 11.5, color: tokens.textPrimary }}>{batch.fileName}</span>
                    <Chip tokens={tokens} tone="primary">{n} {t("invitations", "دعوات")}</Chip>
                    <Chip tokens={tokens} tone="peri">{e} {t("enrolled directly", "انضموا مباشرة")}</Chip>
                    {x > 0 && <Chip tokens={tokens} tone="violet">{x} {t("rejected", "مرفوض")}</Chip>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <SectionHeading
          title={t("Invitations", "الدعوات")}
          subtitle={health.unacceptedInvitations
            ? t(`Oldest waiting ${health.oldestInvitationDays} days — a contact-problem signal, not a system fault`, `أقدمها منتظرة ${health.oldestInvitationDays} يوم — مؤشر مشكلة تواصل لا مشكلة نظام`)
            : t("Every invitation has been accepted", "كل الدعوات قُبلت")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mod.invitations.map((inv) => {
            const waitingDays = inv.status === "pending" ? Math.floor((Date.now() - new Date(inv.sentAt).getTime()) / 864e5) : 0;
            return (
              <Card tokens={tokens} key={inv.id} style={{ padding: "11px 14px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13, color: tokens.textPrimary }}>
                        {inv.firstName} {inv.lastName}
                      </span>
                      <Chip tokens={tokens} tone="default">{inv.role === "student" ? t("student", "طالب") : t("doctor", "دكتور")}</Chip>
                      <Chip tokens={tokens} tone="slate">{inv.courseCode}</Chip>
                      {inv.status === "accepted"
                        ? <Chip tokens={tokens} tone="primary">{t("Accepted", "مقبولة")}</Chip>
                        : <Chip tokens={tokens} tone={waitingDays >= 7 ? "violet" : "default"}>{t("Pending", "بانتظار التفعيل")}</Chip>}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>{inv.email}</div>
                  </div>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: inv.status === "pending" && waitingDays >= 7 ? tokens.gap : tokens.textFaint, flexShrink: 0 }}>
                    <IconClock size={11} color={inv.status === "pending" && waitingDays >= 7 ? tokens.gap : tokens.textFaint} />
                    {inv.status === "accepted"
                      ? t("activated", "اتفعلت")
                      : waitingDays > 0
                        ? t(`${waitingDays}d waiting`, `${waitingDays} يوم انتظار`)
                        : t("sent today", "أُرسلت اليوم")}
                  </span>
                </div>
              </Card>
            );
          })}
          {mod.invitations.length === 0 && (
            <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textFaint }}>
              {t("No invitations yet — run an import above.", "لا دعوات بعد — نفّذ إدخالًا بالأعلى.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
