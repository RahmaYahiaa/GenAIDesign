import { Tokens, MONO, tk } from "../tokens";
import { Toaster } from "./ModuleUI";
import {
  IconLogoBrand, IconDashboard, IconCourses, IconMastery, IconTutor,
  IconDiagnostic, IconPractice, IconReassessment, IconProfile,
  IconSun, IconMoon, IconGlobe, IconBell, IconSignOut,
  IconClipboard, IconUsers, IconSparkle, IconShield,
} from "./Icons";

export type WorkspaceTab = "assignments" | "analytics" | "audit";

type Screen =
  | "student-dashboard" | "courses" | "mastery" | "tutor"
  | "diagnostic" | "practice" | "reassessment" | "profile"
  | "student-assignments" | "student-assignment"
  | "instructor-home" | "course-workspace" | "assignment-create"
  | "assignment-review" | "instructor" | "content-studio" | "students"
  | "auditor-home";

export type { Screen };

interface AppState {
  screen: Screen | "login" | "register";
  dark: boolean;
  lang: "en" | "ar";
  /** Course the current workspace / student view is scoped to. */
  courseId?: string;
  /** Assignment currently open (review, create-target or student view). */
  assignmentId?: string;
  /** Active tab of the course workspace. */
  tab?: WorkspaceTab;
  /** Student whose file is open (instructor Students screen). */
  studentId?: string;
  /**
   * Demo control modelling account type: when true the signed-in learner holds
   * only personal courses, so the whole assignment module must disappear
   * (FR-SCOPE-03) — no disabled tab, no nav item, nothing.
   */
  personalOnly?: boolean;
}

export type { AppState };

const STUDENT_NAV: { id: Screen; labelEn: string; labelAr: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: "student-dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم", Icon: IconDashboard },
  { id: "courses", labelEn: "My Courses", labelAr: "مقرراتي", Icon: IconCourses },
  // Institutional-only (FR-SCOPE-03) — filtered out for personal-only accounts.
  { id: "student-assignments", labelEn: "Assignments", labelAr: "التكليفات", Icon: IconClipboard },
  { id: "mastery", labelEn: "Topics & Mastery", labelAr: "المواضيع والإتقان", Icon: IconMastery },
  { id: "tutor", labelEn: "AI Tutor", labelAr: "المعلم الذكي", Icon: IconTutor },
  { id: "diagnostic", labelEn: "Diagnostic", labelAr: "التشخيص", Icon: IconDiagnostic },
  { id: "practice", labelEn: "Practice", labelAr: "التدريب", Icon: IconPractice },
  { id: "reassessment", labelEn: "Reassessment", labelAr: "إعادة التقييم", Icon: IconReassessment },
];

const STUDENT_NAV_BOTTOM: { id: Screen; labelEn: string; labelAr: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: "profile", labelEn: "Profile", labelAr: "الملف الشخصي", Icon: IconProfile },
];

const INSTRUCTOR_NAV: { id: Screen; labelEn: string; labelAr: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: "instructor-home", labelEn: "My Courses", labelAr: "مقرراتي", Icon: IconCourses },
  { id: "course-workspace", labelEn: "Workspace", labelAr: "مساحة العمل", Icon: IconClipboard },
  { id: "students", labelEn: "Students", labelAr: "الطلاب", Icon: IconUsers },
  { id: "content-studio", labelEn: "Content Studio", labelAr: "استوديو المحتوى", Icon: IconSparkle },
  { id: "instructor", labelEn: "Legacy Analytics", labelAr: "التحليلات القديمة", Icon: IconDashboard },
];

const AUDITOR_NAV: { id: Screen; labelEn: string; labelAr: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: "auditor-home", labelEn: "Audit Oversight", labelAr: "الرقابة والتدقيق", Icon: IconShield },
];

/** Sub-screens that should keep their parent nav item highlighted. */
const NAV_PARENT: Partial<Record<Screen, Screen>> = {
  "student-assignment": "student-assignments",
  "assignment-create": "course-workspace",
  "assignment-review": "course-workspace",
};

interface AppShellProps {
  state: AppState;
  setState: (s: AppState) => void;
  children: React.ReactNode;
  role?: "student" | "instructor" | "auditor";
}

function Tooltip({ label, children, side = "right" }: { label: string; children: React.ReactNode; side?: "right" | "left" }) {
  return (
    <div style={{ position: "relative", display: "flex" }} className="tooltip-trigger">
      {children}
      <div
        className="tooltip-box"
        style={{
          position: "absolute",
          [side === "right" ? "left" : "right"]: "calc(100% + 8px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "#131A38",
          color: "#EDF0F5",
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
          padding: "4px 10px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 150ms ease",
          zIndex: 200,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function AppShell({ state, setState, children, role = "student" }: AppShellProps) {
  const dark = state.dark;
  const lang = state.lang;
  const isRtl = lang === "ar";

  const SIDEBAR_W = 220;
  const TOPBAR_H = 44;

  // Tokens — single source of truth (login cobalt-blue palette)
  const T = tk(dark);
  const bg = T.bg;
  const sidebarBg = T.sidebar;
  const sidebarBorder = T.sidebarBorder;
  const sidebarActive = T.sidebarActive;
  const sidebarHover = T.sidebarHover;
  const primary = T.primary;
  const textPrimary = T.textPrimary;
  const textMuted = T.textMuted;
  const cardBorder = T.cardBorder;
  const topbarBg = dark ? "rgba(10,14,35,0.95)" : "rgba(244,246,249,0.95)";

  const baseNav = role === "auditor" ? AUDITOR_NAV : role === "student" ? STUDENT_NAV : INSTRUCTOR_NAV;
  // FR-SCOPE-03 — a personal-only account sees no assignment affordance at all.
  const nav = role === "student" && state.personalOnly
    ? baseNav.filter((i) => i.id !== "student-assignments")
    : baseNav;
  const navBottom = role === "student" ? STUDENT_NAV_BOTTOM : [];
  const activeScreen = (NAV_PARENT[state.screen as Screen] ?? state.screen) as Screen;

  const ctxCourse = state.courseId ?? "CS301";
  const contextLabel = role === "instructor"
    ? (lang === "ar" ? `لوحة تحكم المدرس — ${ctxCourse}` : `Instructor Dashboard — ${ctxCourse}`)
    : role === "auditor"
      ? (lang === "ar" ? `الرقابة والتدقيق — ${ctxCourse} (قراءة فقط)` : `Audit Oversight — ${ctxCourse} (read-only)`)
      : `CS301 · ${lang === "ar" ? "الأسبوع 9" : "Week 9"}`;

  const navItem = (item: typeof STUDENT_NAV[0]) => {
    const isActive = activeScreen === item.id;
    const label = lang === "ar" ? item.labelAr : item.labelEn;
    return (
      <button
        key={item.id}
        onClick={() => setState({ ...state, screen: item.id })}
        title={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "9px 14px",
          borderRadius: 8,
          border: "none",
          background: isActive ? sidebarActive : "transparent",
          color: isActive ? primary : textMuted,
          cursor: "pointer",
          textAlign: isRtl ? "right" : "left",
          flexDirection: isRtl ? "row-reverse" : "row",
          transition: "background 120ms ease, color 120ms ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = sidebarHover;
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        <item.Icon size={17} color={isActive ? primary : textMuted} />
        <span
          style={{
            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif",
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            letterSpacing: isActive ? "-0.01em" : "0",
          }}
        >
          {label}
        </span>
        {isActive && (
          <div
            style={{
              marginLeft: isRtl ? 0 : "auto",
              marginRight: isRtl ? "auto" : 0,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: primary,
            }}
          />
        )}
      </button>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: bg,
        color: textPrimary,
        overflow: "hidden",
        direction: isRtl ? "rtl" : "ltr",
        fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: SIDEBAR_W,
          flexShrink: 0,
          background: sidebarBg,
          borderRight: isRtl ? "none" : `1px solid ${sidebarBorder}`,
          borderLeft: isRtl ? `1px solid ${sidebarBorder}` : "none",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          transition: "background 200ms ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "18px 16px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: `1px solid ${sidebarBorder}`,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <IconLogoBrand size={26} />
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: primary,
                letterSpacing: "-0.03em",
              }}
            >
              GenAI
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: textMuted,
                letterSpacing: "0.04em",
              }}
            >
              ACADEMIC INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: "10px 14px 6px" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {lang === "ar" ? (role === "student" ? "طالب" : role === "auditor" ? "مدقق" : "مدرس") : role === "student" ? "STUDENT" : role === "auditor" ? "AUDITOR" : "INSTRUCTOR"}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0 8px", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {nav.map((item) => navItem(item))}
          </div>
        </nav>

        {/* Bottom nav */}
        {navBottom.length > 0 && (
          <div
            style={{
              padding: "8px",
              borderTop: `1px solid ${sidebarBorder}`,
            }}
          >
            {navBottom.map((item) => navItem(item))}
          </div>
        )}

        {/* User stub */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: `1px solid ${sidebarBorder}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `${primary}18`,
              border: `1.5px solid ${primary}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: primary,
              flexShrink: 0,
            }}
          >
            {role === "instructor" ? "NM" : role === "auditor" ? "HZ" : "SA"}
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? "right" : "left" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary, fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {role === "auditor"
                ? (lang === "ar" ? "د. هالة زيدان — ضمان الجودة" : "Dr. Hala Zaydan — Quality Assurance")
                : role === "instructor"
                ? (lang === "ar" ? "أ.د. نادية المانع" : "Prof. Dr. Nadia Al-Manea")
                : (lang === "ar" ? "سارة الراشدي" : "Sarah Al-Rashidi")}
            </div>
            <div style={{ fontSize: 10, color: textMuted, fontFamily: MONO }}>
              {role === "auditor" ? (lang === "ar" ? "إشراف · كل المقررات المؤسسية" : "Oversight · all institutional courses") : role === "instructor" ? "CS301 · CS401 · CS303" : state.personalOnly ? "LIN101 · personal" : "CS301 · CS401"}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header
          style={{
            height: TOPBAR_H,
            background: topbarBg,
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 20px",
            gap: 4,
            flexShrink: 0,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          {/* Context label — reflects the active workspace / course scope */}
          <div style={{ flex: 1, textAlign: isRtl ? "right" : "left", minWidth: 0 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%" }}>
              {contextLabel}
            </span>
          </div>

          {/* Notification icon */}
          <button
            title={lang === "ar" ? "الإشعارات" : "Notifications"}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${cardBorder}`, background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: textMuted,
            }}
          >
            <IconBell size={15} color={textMuted} />
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setState({ ...state, lang: lang === "en" ? "ar" : "en" })}
            title={lang === "en" ? "Arabic" : "English"}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${cardBorder}`, background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: textMuted,
            }}
          >
            <IconGlobe size={15} color={textMuted} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setState({ ...state, dark: !dark })}
            title={dark ? (lang === "ar" ? "الوضع النهاري" : "Light Mode") : (lang === "ar" ? "الوضع الليلي" : "Dark Mode")}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${cardBorder}`, background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: textMuted,
            }}
          >
            {dark ? <IconSun size={15} color={textMuted} /> : <IconMoon size={15} color={textMuted} />}
          </button>

          {/* Sign out — icon only */}
          <button
            onClick={() => setState({ ...state, screen: "login" })}
            title={lang === "ar" ? "تسجيل الخروج" : "Sign out"}
            aria-label={lang === "ar" ? "تسجيل الخروج" : "Sign out"}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${cardBorder}`, background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: textMuted,
            }}
          >
            <IconSignOut size={15} color={textMuted} />
          </button>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: bg,
            direction: isRtl ? "rtl" : "ltr",
            transition: "background 200ms ease",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Auth Shell (for login/register — no sidebar) ─────────────────────────────
interface AuthShellProps {
  state: AppState;
  setState: (s: AppState) => void;
  children: React.ReactNode;
}
export function AuthShell({ state, setState, children }: AuthShellProps) {
  const dark = state.dark;
  const lang = state.lang;
  const T = tk(dark);
  const textMuted = T.textMuted;
  const cardBorder = T.cardBorder;
  const topbarBg = dark ? "rgba(10,14,35,0.98)" : "rgba(244,246,249,0.98)";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Minimal top bar */}
      <header
        style={{
          height: 44,
          background: topbarBg,
          borderBottom: `1px solid ${cardBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconLogoBrand size={22} />
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              color: dark ? T.primary : "#1B4DA8",
              letterSpacing: "-0.03em",
            }}
          >
            GenAI
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setState({ ...state, lang: lang === "en" ? "ar" : "en" })}
            style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${cardBorder}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <IconGlobe size={14} color={textMuted} />
          </button>
          <button
            onClick={() => setState({ ...state, dark: !dark })}
            style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${cardBorder}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {dark ? <IconSun size={14} color={textMuted} /> : <IconMoon size={14} color={textMuted} />}
          </button>

          {/* Demo navigation */}
          <div style={{ width: 1, height: 20, background: cardBorder, margin: "5px 4px" }} />
          {([["student-dashboard", "STUDENT"], ["instructor-home", "INSTRUCTOR"]] as [Screen, string][]).map(([s, label]) => (
            <button
              key={s}
              onClick={() => setState({ ...state, screen: s, courseId: s === "instructor-home" ? undefined : state.courseId })}
              style={{
                padding: "4px 10px", borderRadius: 6,
                border: `1px solid ${cardBorder}`, background: "transparent",
                fontFamily: MONO, fontSize: 10, color: textMuted,
                cursor: "pointer", letterSpacing: "0.04em",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      {children}
      <Toaster tokens={tk(dark)} lang={lang} />
    </div>
  );
}
