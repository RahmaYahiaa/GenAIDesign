import { tk } from "@/tokens";
import { bFontFor, inputStyle, Toggle, toast } from "@/components/ModuleUI";
import { AdminUser, OFFICER_TEMPLATES, PERMISSION_LABELS, PermissionKey, officerPermissionsOf } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-01 — shared permission-scope editor: ready-made template first,
// manual switches after; the officer only ever sees data inside these scopes.

export default function OfficerScopeEditor({ user, dark, lang }: { user: AdminUser; dark: boolean; lang: "en" | "ar" }) {
  const { setOfficerTemplate, toggleOfficerPermission } = useAdminModule();
  const tokens = tk(dark);
  const bFont = bFontFor(lang);
  const isRtl = lang === "ar";
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  return (
    <div style={{ border: `1px dashed ${tokens.cardBorder}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontFamily: bFont, fontWeight: 600, fontSize: 12.5, color: tokens.textPrimary, marginBottom: 6 }}>
        {t("Permission scope", "نطاق الصلاحيات")}
      </div>
      <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, margin: "0 0 10px", lineHeight: 1.6 }}>
        {t(
          "Start from a ready-made template, then tune switches manually — the officer only ever sees events and data inside these scopes.",
          "ابدأ بقالب جاهز ثم اضبط المفاتيح يدويًا — المسؤول لا يرى إلا أحداثًا وبيانات داخل هذه النطاقات.",
        )}
      </p>
      <select
        value={user.officerTemplateId ?? ""}
        onChange={(e) => {
          if (!e.target.value) return;
          setOfficerTemplate(user.id, e.target.value);
          toast(t("Template applied.", "طُبّق القالب."));
        }}
        style={{ ...inputStyle(tokens, bFont), cursor: "pointer", marginBottom: 12 }}
      >
        <option value="">{t("Custom set (no template)", "مجموعة مخصصة (بلا قالب)")}</option>
        {OFFICER_TEMPLATES.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>{lang === "ar" ? tpl.name.ar : tpl.name.en}</option>
        ))}
      </select>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(Object.keys(PERMISSION_LABELS) as PermissionKey[]).map((key) => {
          const on = officerPermissionsOf(user).includes(key);
          return (
            <div key={key} style={{ display: "flex", gap: 10, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Toggle on={on} onChange={() => toggleOfficerPermission(user.id, key)} tokens={tokens} />
              <span style={{ fontFamily: bFont, fontSize: 12, color: tokens.textSecondary }}>
                {lang === "ar" ? PERMISSION_LABELS[key].ar : PERMISSION_LABELS[key].en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
