import { useEffect, useMemo, useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, Drawer, Field, inputStyle, AlertStrip, ConfirmBtn, toast } from "@/components/ModuleUI";
import { IconCheck, IconWarning, IconEye } from "@/components/Icons";
import { AdminUserKind, officerPermissionsOf, templateOf } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";
import OfficerScopeEditor from "./OfficerScopeEditor";

// FR-ADM-02 — every institution user on one screen: activate/deactivate
// (backend already blocks login instantly per user.isActive), change roles,
// and FR-ADM-04 academic/employee numbers for manual verification.
// FR-ADM-01 officer permission templates live in the same drawer.

const KIND_LABELS: Record<AdminUserKind, { en: string; ar: string }> = {
  student: { en: "Student", ar: "طالب" },
  doctor: { en: "Doctor", ar: "دكتور" },
  officer: { en: "Officer", ar: "مسؤول" },
};

type KindFilter = "all" | AdminUserKind;
type StatusFilter = "all" | "active" | "inactive";

export default function AdminUsersScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, toggleUserActive, changeUserKind, setAcademicNumber } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [numberDraft, setNumberDraft] = useState("");
  const [kindDraft, setKindDraft] = useState<AdminUserKind>("student");

  const users = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mod.users.filter((user) => {
      if (kindFilter !== "all" && user.kind !== kindFilter) return false;
      if (statusFilter === "active" && !user.isActive) return false;
      if (statusFilter === "inactive" && user.isActive) return false;
      if (!needle) return true;
      return `${user.firstName} ${user.lastName}`.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle) || (user.academicNumber ?? "").toLowerCase().includes(needle);
    });
  }, [mod.users, query, kindFilter, statusFilter]);

  const openUser = mod.users.find((u) => u.id === openUserId) ?? null;

  useEffect(() => {
    if (openUser) {
      setNumberDraft(openUser.academicNumber ?? "");
      setKindDraft(openUser.kind);
    }
  }, [openUserId, openUser?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {
    all: mod.users.length,
    student: mod.users.filter((u) => u.kind === "student").length,
    doctor: mod.users.filter((u) => u.kind === "doctor").length,
    officer: mod.users.filter((u) => u.kind === "officer").length,
  };

  const filterChip = (id: KindFilter, label: string, count?: number) => (
    <button
      key={id}
      onClick={() => setKindFilter(id)}
      style={{
        padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: bFont, fontSize: 12, fontWeight: kindFilter === id ? 600 : 500,
        background: kindFilter === id ? tokens.primaryLight : tokens.card,
        border: `1px solid ${kindFilter === id ? tokens.primary : tokens.cardBorder}`,
        color: kindFilter === id ? tokens.primary : tokens.textSecondary,
      }}
    >
      {label}{count !== undefined ? ` · ${count}` : ""}
    </button>
  );

  const statusChip = (id: StatusFilter, label: string) => (
    <button
      key={id}
      onClick={() => setStatusFilter(id)}
      style={{
        padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: bFont, fontSize: 12, fontWeight: statusFilter === id ? 600 : 500,
        background: statusFilter === id ? tokens.primaryLight : tokens.card,
        border: `1px solid ${statusFilter === id ? tokens.primary : tokens.cardBorder}`,
        color: statusFilter === id ? tokens.primary : tokens.textSecondary,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: "26px 32px", maxWidth: 1080, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("User management", "إدارة المستخدمين")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Every student, doctor and officer of the institution — status, roles and verification numbers.", "كل طالب ودكتور ومسؤول في المؤسسة — الحالة والأدوار وأرقام التحقق.")}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search name, email or number…", "دور بالاسم أو الإيميل أو الرقم…")}
          style={{ ...inputStyle(tokens, bFont), width: "auto", flex: 1, minWidth: 220 }}
        />
        {filterChip("all", t("All", "الكل"), counts.all)}
        {filterChip("student", t("Students", "طلاب"), counts.student)}
        {filterChip("doctor", t("Doctors", "دكاترة"), counts.doctor)}
        {filterChip("officer", t("Officers", "مسؤولون"), counts.officer)}
        <span style={{ width: 1, background: tokens.cardBorder, alignSelf: "stretch" }} />
        {statusChip("all", t("Any status", "أي حالة"))}
        {statusChip("active", t("Active", "نشط"))}
        {statusChip("inactive", t("Deactivated", "معطّل"))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.map((user) => {
          const tpl = templateOf(user);
          const custom = Boolean(user.officerPermissions) && !user.isSuperAdmin;
          return (
            <Card tokens={tokens} key={user.id} style={{ padding: "12px 16px", opacity: user.isActive ? 1 : 0.62 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>
                      {user.firstName} {user.lastName}
                    </span>
                    <Chip tokens={tokens} tone={user.kind === "officer" ? "primary" : user.kind === "doctor" ? "peri" : "default"}>
                      {lang === "ar" ? KIND_LABELS[user.kind].ar : KIND_LABELS[user.kind].en}
                    </Chip>
                    {user.isSuperAdmin && <Chip tokens={tokens} tone="primary">{t("Super", "سوبر")}</Chip>}
                    {custom && <Chip tokens={tokens} tone="violet">{t("Custom permissions", "صلاحيات مخصصة")}</Chip>}
                    {user.accountType === "individual" && <Chip tokens={tokens} tone="slate">{t("Individual", "فردي")}</Chip>}
                    {!user.isActive && <Chip tokens={tokens} tone="slate">{t("Deactivated", "معطّل")}</Chip>}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted, marginTop: 4 }}>{user.email}</div>
                  <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 3 }}>
                    {user.kind === "student" && user.year ? t(`Year ${user.year}`, `سنة ${user.year}`) + " · " : ""}
                    {user.department ?? (user.accountType === "individual" ? t("Personal space", "مساحة شخصية") : "—")}
                    {user.kind === "officer" && (officerPermissionsOf(user).length > 0 || tpl)
                      ? ` · ${officerPermissionsOf(user).length} ${t("scopes", "نطاقات")}`
                      : ""}
                  </div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: user.academicNumber ? tokens.textSecondary : tokens.textFaint, flexShrink: 0 }}>
                  {user.academicNumber ?? t("no number yet", "بلا رقم بعد")}
                </span>
                <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "7px 12px", fontSize: 12, flexShrink: 0 }} onClick={() => setOpenUserId(user.id)}>
                  <IconEye size={13} color={tokens.textSecondary} />
                  {t("Manage", "إدارة")}
                </Btn>
              </div>
            </Card>
          );
        })}
        {users.length === 0 && (
          <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textFaint, padding: "18px 4px" }}>
            {t("No users match these filters.", "لا مستخدمون يطابقون عوامل التصفية.")}
          </div>
        )}
      </div>

      <Drawer
        open={openUser !== null}
        onClose={() => setOpenUserId(null)}
        tokens={tokens}
        lang={lang}
        title={openUser ? `${openUser.firstName} ${openUser.lastName}` : ""}
        subtitle={openUser?.email}
      >
        {openUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Chip tokens={tokens} tone="default">{lang === "ar" ? KIND_LABELS[openUser.kind].ar : KIND_LABELS[openUser.kind].en}</Chip>
              {openUser.isSuperAdmin && <Chip tokens={tokens} tone="primary">{t("Super admin", "سوبر أدمن")}</Chip>}
              <Chip tokens={tokens} tone={openUser.isActive ? "peri" : "slate"}>{openUser.isActive ? t("Active", "نشط") : t("Deactivated", "معطّل")}</Chip>
              {openUser.accountType === "individual" && <Chip tokens={tokens} tone="slate">{t("Individual account", "حساب فردي")}</Chip>}
            </div>

            <Field
              tokens={tokens}
              lang={lang}
              label={openUser.kind === "student" ? t("Academic number (optional)", "الرقم الأكاديمي (اختياري)") : openUser.kind === "doctor" || openUser.kind === "officer" ? t("Employee number (optional)", "الرقم الوظيفي (اختياري)") : t("Number", "الرقم")}
              hint={t("For manual verification only — never gates login or registration.", "للتحقق اليدوي فقط — لا يمنع الدخول أو التسجيل أبدًا.")}
            >
              <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <input value={numberDraft} onChange={(e) => setNumberDraft(e.target.value)} style={{ ...inputStyle(tokens, bFont), width: "auto", flex: 1 }} placeholder={openUser.kind === "student" ? "20231701" : "EMP-0021"} />
                <Btn
                  tokens={tokens}
                  lang={lang}
                  variant="soft"
                  style={{ padding: "8px 14px", fontSize: 12 }}
                  onClick={() => {
                    setAcademicNumber(openUser.id, numberDraft);
                    toast(t("Number saved.", "حُفظ الرقم."));
                  }}
                >
                  {t("Save", "حفظ")}
                </Btn>
              </div>
            </Field>

            {!openUser.isSuperAdmin && (
              <Field tokens={tokens} lang={lang} label={t("Account role", "دور الحساب")}>
                <select
                  value={kindDraft}
                  onChange={(e) => {
                    const kind = e.target.value as AdminUserKind;
                    setKindDraft(kind);
                    changeUserKind(openUser.id, kind);
                    toast(t("Role updated and audit-logged.", "حُدّث الدور وسُجّل في التدقيق."));
                  }}
                  style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}
                >
                  <option value="student">{t("Student", "طالب")}</option>
                  <option value="doctor">{t("Doctor", "دكتور")}</option>
                  <option value="officer">{t("Officer", "مسؤول")}</option>
                </select>
              </Field>
            )}

            {openUser.kind === "officer" && !openUser.isSuperAdmin && (
              <OfficerScopeEditor user={openUser} dark={state.dark} lang={lang} />
            )}

            {openUser.isSuperAdmin ? (
              <AlertStrip
                tokens={tokens}
                lang={lang}
                tone="peri"
                icon={<IconCheck size={14} color={tokens.primary} />}
                title={t("The super admin account can never be deactivated or demoted.", "لا يمكن تعطيل حساب السوبر أدمن أو تخفيض دوره أبدًا.")}
              />
            ) : (
              <div style={{ border: `1px solid ${tokens.gapBorder}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <IconWarning size={13} color={tokens.gap} />
                  <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 12.5, color: tokens.textPrimary }}>
                    {openUser.isActive ? t("Deactivate account", "تعطيل الحساب") : t("Reactivate account", "إعادة تفعيل الحساب")}
                  </span>
                </div>
                <p style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, margin: "0 0 10px", lineHeight: 1.6 }}>
                  {openUser.isActive
                    ? t("Deactivating blocks login immediately — the platform already enforces this at sign-in. Data and enrollments stay untouched.", "التعطيل يمنع الدخول فورًا — المنصة تفرض ذلك عند تسجيل الدخول بالفعل. البيانات والتسجيلات تبقى كما هي.")
                    : t("Reactivating restores login instantly.", "إعادة التفعيل تعيد الدخول فورًا.")}
                </p>
                <ConfirmBtn
                  tokens={tokens}
                  lang={lang}
                  variant={openUser.isActive ? "violet" : "soft"}
                  label={openUser.isActive
                    ? t("Deactivate this account", "تعطيل هذا الحساب")
                    : t("Reactivate this account", "إعادة تفعيل هذا الحساب")}
                  confirmLabel={openUser.isActive
                    ? t("Click again — login gets blocked now", "اضغط للتأكيد — سيُمنع الدخول الآن")
                    : t("Click again to restore login", "اضغط للتأكيد لاستعادة الدخول")}
                  onConfirm={() => {
                    toggleUserActive(openUser.id);
                    toast(openUser.isActive ? t("Account deactivated and audit-logged.", "عُطّل الحساب وسُجّل في التدقيق.") : t("Account reactivated.", "أُعيد تفعيل الحساب."));
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
