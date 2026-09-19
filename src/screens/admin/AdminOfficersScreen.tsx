import { useEffect, useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, Modal, Drawer, Field, inputStyle, AlertStrip, toast } from "@/components/ModuleUI";
import { IconShield, IconPlus, IconPencil, IconCheck } from "@/components/Icons";
import { OFFICER_TEMPLATES, PERMISSION_LABELS, officerPermissionsOf, templateOf } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";
import OfficerScopeEditor from "./OfficerScopeEditor";

// FR-ADM-01 — delegated officers: super admin adds officers from ready-made
// templates, then tunes scopes manually. Each officer only sees events and
// data inside his own scope; the super admin alone manages permission sets.

const monoLabel = (text: string, tokens: ReturnType<typeof tk>) => (
  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted, marginBottom: 7 }}>{text}</div>
);

export default function AdminOfficersScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, addOfficer } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const [addOpen, setAddOpen] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [tplId, setTplId] = useState(OFFICER_TEMPLATES[0].id);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const officers = mod.users.filter((u) => u.kind === "officer");
  const editUser = officers.find((u) => u.id === editUserId) ?? null;
  const pickedTpl = OFFICER_TEMPLATES.find((tpl) => tpl.id === tplId) ?? OFFICER_TEMPLATES[0];
  const emailOk = /@/.test(email);
  const canAdd = first.trim() && last.trim() && emailOk;

  useEffect(() => {
    if (!addOpen) { setFirst(""); setLast(""); setEmail(""); setTplId(OFFICER_TEMPLATES[0].id); }
  }, [addOpen]);

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
            {t("Officers & permissions", "المسؤولون والصلاحيات")}
          </h1>
          <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
            {t("Ready-made templates, manually tunable scopes — nobody outgrows them.", "قوالب جاهزة ونطاقات قابلة للضبط اليدوي — لا أحد يتخطى نطاقه.")}
          </p>
        </div>
        <Btn tokens={tokens} lang={lang} style={{ padding: "10px 16px", fontSize: 13 }} onClick={() => setAddOpen(true)}>
          <IconPlus size={14} color="#fff" />
          {t("Add officer", "إضافة مسؤول")}
        </Btn>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconShield size={14} color={tokens.primary} />}
          title={t(
            "Only the super admin manages permission sets — every officer sees events and data strictly inside his own scope.",
            "السوبر أدمن وحده يدير مجموعات الصلاحيات — وكل مسؤول يرى الأحداث والبيانات داخل نطاقه فقط.",
          )}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {officers.map((officer) => {
          const tpl = templateOf(officer);
          const perms = officerPermissionsOf(officer);
          const custom = Boolean(officer.officerPermissions) && !officer.isSuperAdmin;
          return (
            <Card tokens={tokens} key={officer.id} style={{ padding: "13px 16px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>
                      {officer.firstName} {officer.lastName}
                    </span>
                    {officer.isSuperAdmin && <Chip tokens={tokens} tone="primary">{t("Super admin", "سوبر أدمن")}</Chip>}
                    {!officer.isSuperAdmin && tpl && !custom && (
                      <Chip tokens={tokens} tone="default">{lang === "ar" ? tpl.name.ar : tpl.name.en}</Chip>
                    )}
                    {custom && <Chip tokens={tokens} tone="violet">{t("Custom permissions", "صلاحيات مخصصة")}</Chip>}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>{officer.email}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    {perms.map((key) => (
                      <span key={key} style={{ fontFamily: MONO, fontSize: 10, color: tokens.textSecondary, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 5, padding: "2px 7px" }}>
                        {lang === "ar" ? PERMISSION_LABELS[key].ar : PERMISSION_LABELS[key].en}
                      </span>
                    ))}
                    {perms.length === 0 && (
                      <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.gap }}>
                        {t("No scopes assigned — this officer sees nothing until you assign one.", "لا نطاقات معينة — هذا المسؤول لا يرى شيئًا حتى تعيّن نطاقًا.")}
                      </span>
                    )}
                  </div>
                </div>
                {!officer.isSuperAdmin && (
                  <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "7px 12px", fontSize: 12, flexShrink: 0 }} onClick={() => setEditUserId(officer.id)}>
                    <IconPencil size={13} color={tokens.textSecondary} />
                    {t("Edit scopes", "تعديل النطاقات")}
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        tokens={tokens}
        lang={lang}
        title={t("Add officer", "إضافة مسؤول")}
        subtitle={t("A delegated admin account scoped by a permission template.", "حساب مسؤول مفوض محدد بقالب صلاحيات.")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field tokens={tokens} lang={lang} label={t("First name", "الاسم الأول")} required>
              <input value={first} onChange={(e) => setFirst(e.target.value)} style={{ ...inputStyle(tokens, bFont) }} placeholder={t("e.g. Heba", "مثال: هبة")} />
            </Field>
            <Field tokens={tokens} lang={lang} label={t("Last name", "اسم العائلة")} required>
              <input value={last} onChange={(e) => setLast(e.target.value)} style={{ ...inputStyle(tokens, bFont) }} placeholder={t("e.g. Salah", "مثال: صلاح")} />
            </Field>
          </div>
          <Field tokens={tokens} lang={lang} label={t("Institutional email", "الإيميل الجامعي")} required hint={t("A login invitation activates once the person self-registers with this exact email.", "دعوة الدخول تتفعل فور تسجيل الشخص بنفس هذا الإيميل.")}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle(tokens, bFont), direction: "ltr", textAlign: "left" }} placeholder="officer@menoufia.edu.eg" />
          </Field>
          <Field tokens={tokens} lang={lang} label={t("Permission template", "قالب الصلاحيات")} required>
            <select value={tplId} onChange={(e) => setTplId(e.target.value)} style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}>
              {OFFICER_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{lang === "ar" ? tpl.name.ar : tpl.name.en}</option>
              ))}
            </select>
          </Field>

          <div style={{ background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, padding: "10px 12px" }}>
            {monoLabel(t("TEMPLATE SCOPES", "نطاقات القالب"), tokens)}
            <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, margin: "0 0 8px", lineHeight: 1.6 }}>
              {lang === "ar" ? pickedTpl.description.ar : pickedTpl.description.en}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              {pickedTpl.permissions.map((key) => (
                <span key={key} style={{ fontFamily: MONO, fontSize: 10, color: tokens.textSecondary, background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 5, padding: "2px 7px" }}>
                  {lang === "ar" ? PERMISSION_LABELS[key].ar : PERMISSION_LABELS[key].en}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconCheck size={13} color={tokens.textFaint} />
            <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.55 }}>
              {t("You can retune any switch afterwards from the officers list or the users drawer.", "تقدر تعيد ضبط أي مفتاح لاحقًا من قائمة المسؤولين أو درج المستخدم.")}
            </span>
          </div>

          <Btn
            tokens={tokens}
            lang={lang}
            disabled={!canAdd}
            style={{ width: "100%", padding: "11px 0", fontSize: 13.5, justifyContent: "center" }}
            onClick={() => {
              addOfficer({ firstName: first.trim(), lastName: last.trim(), email: email.trim().toLowerCase(), templateId: tplId });
              setAddOpen(false);
              toast(t("Officer added and audit-logged.", "أُضيف المسؤول وسُجّل في التدقيق."));
            }}
          >
            {t("Add officer", "إضافة المسؤول")}
          </Btn>
        </div>
      </Modal>

      <Drawer
        open={editUser !== null}
        onClose={() => setEditUserId(null)}
        tokens={tokens}
        lang={lang}
        title={editUser ? `${editUser.firstName} ${editUser.lastName}` : ""}
        subtitle={editUser?.email}
      >
        {editUser && <OfficerScopeEditor user={editUser} dark={state.dark} lang={lang} />}
      </Drawer>
    </div>
  );
}
