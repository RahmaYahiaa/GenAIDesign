import { useState, useEffect } from "react";
import { AppState, AppShell, AuthShell } from "./components/AppShell";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import MasteryScreen from "./screens/MasteryScreen";
import TutorScreen from "./screens/TutorScreen";
import DiagnosticScreen from "./screens/DiagnosticScreen";
import PracticeScreen from "./screens/PracticeScreen";
import ReassessmentScreen from "./screens/ReassessmentScreen";
import InstructorScreen from "./screens/InstructorScreen";
import { tk, MONO } from "./tokens";
import { EmptyState } from "./components/SharedUI";
import { IconCourses, IconProfile } from "./components/Icons";

// ─── Register Screen ──────────────────────────────────────────────────────────
function RegisterScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const tokens = tk(state.dark);
  const hFont = "'Plus Jakarta Sans', sans-serif";
  const bFont = "'Inter', sans-serif";
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [step, setStep] = useState(1);

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: `1.5px solid ${tokens.cardBorder}`, background: tokens.inset,
    color: tokens.textPrimary, fontFamily: bFont, fontSize: 13.5,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 44px)" }}>
      <div
        style={{
          flex: "0 0 58%",
          background: state.dark
            ? "linear-gradient(160deg, #0A0E23 0%, #131A38 60%, #1F1A45 100%)"
            : "linear-gradient(160deg, #1B4DA8 0%, #1a5298 55%, #0E7A9E 100%)",
          padding: "52px 60px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 8, border: "1px solid rgba(255,255,255,0.18)" }}>
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L23 8.5V19.5L14 25L5 19.5V8.5L14 3Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="3.5" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span style={{ fontFamily: hFont, fontWeight: 800, fontSize: 18, color: "white", letterSpacing: "-0.03em" }}>GenAI</span>
          </div>
          <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 28, color: "white", letterSpacing: "-0.03em", lineHeight: 1.25, margin: "0 0 16px" }}>
            Join your institution&apos;s<br />
            <span style={{ color: "rgba(255,255,255,0.65)" }}>learning intelligence network.</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 32px" }}>
            Access is granted through your academic institution. Once verified, you receive personalised diagnostics, AI tutoring grounded in approved course materials, and proof of measurable learning growth.
          </p>
          {[
            { label: "Knowledge Diagnostics", desc: "Pinpoint exactly what you know and do not" },
            { label: "Grounded AI Tutor", desc: "Explanations tied to your actual course materials" },
            { label: "Provable Growth", desc: "Before/after mastery scores with full evidence trail" },
          ].map((f) => (
            <div key={f.label} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "12px 14px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7FB2FF", marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 13, color: "white", marginBottom: 1 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 52px", background: tokens.bg, overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? tokens.primary : tokens.cardBorder, transition: "background 250ms ease" }} />
            ))}
          </div>
          <h2 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 20, color: tokens.textPrimary, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            {step === 1 ? "Create your account" : "Academic context"}
          </h2>
          <p style={{ fontSize: 12, color: tokens.textMuted, margin: "0 0 22px" }}>
            {step === 1 ? "Step 1 of 2 — Your details" : "Step 2 of 2 — Institution and course"}
          </p>

          {step === 1 ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>I am a</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10 }}>
                  {(["student", "instructor"] as const).map((r) => (
                    <button key={r} onClick={() => setRole(r)} style={{ padding: "9px 0", borderRadius: 7, border: "none", background: role === r ? tokens.card : "transparent", boxShadow: role === r ? "0 1px 4px rgba(13,26,46,0.12)" : "none", color: role === r ? (state.dark ? tokens.textPrimary : tokens.primary) : tokens.textMuted, fontFamily: bFont, fontWeight: role === r ? 600 : 500, fontSize: 13, cursor: "pointer" }}>
                      {r === "student" ? "Student" : "Instructor"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>First Name</label><input style={inp} placeholder="Sarah" className="genai-input" /></div>
                <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Last Name</label><input style={inp} placeholder="Al-Rashidi" className="genai-input" /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Institutional Email</label><input style={inp} type="email" placeholder="s.alrashidi@university.edu" dir="ltr" className="genai-input" /></div>
              <div style={{ marginBottom: 18 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Password</label><input style={inp} type="password" placeholder="Min. 12 characters" className="genai-input" /></div>
              <button onClick={() => setStep(2)} className="genai-cta" style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: tokens.primaryGrad, color: "white", fontFamily: hFont, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", cursor: "pointer", boxShadow: tokens.primaryShadow }}>
                Continue
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Institution</label>
                <select style={{ ...inp, appearance: "none", cursor: "pointer" }} className="genai-input">
                  <option>King Abdullah University of Science and Technology</option>
                  <option>Massachusetts Institute of Technology</option>
                  <option>Stanford University</option>
                  <option>University of Oxford</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Department</label>
                <select style={{ ...inp, appearance: "none", cursor: "pointer" }} className="genai-input">
                  <option>Computer Science</option>
                  <option>Electrical Engineering</option>
                  <option>Mathematics</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{role === "student" ? "Student ID" : "Faculty ID"}</label><input style={inp} placeholder={role === "student" ? "202341872" : "FAC-2024-0087"} dir="ltr" className="genai-input" /></div>
              {role === "student" && (
                <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Enrollment Code</label><input style={inp} placeholder="Provided by your instructor" dir="ltr" className="genai-input" /></div>
              )}
              <div style={{ padding: "10px 12px", background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 8, marginBottom: 18 }}>
                <p style={{ fontSize: 11, color: tokens.textMuted, margin: 0, lineHeight: 1.55 }}>Your academic data is protected under FERPA and stored in compliance with your institution data governance policy.</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStep(1)} style={{ padding: "11px 18px", borderRadius: 10, border: `1.5px solid ${tokens.cardBorder}`, background: tokens.card, color: tokens.textMuted, fontFamily: bFont, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Back
                </button>
                <button onClick={() => setState({ ...state, screen: "student-dashboard" })} className="genai-cta" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: tokens.primaryGrad, color: "white", fontFamily: hFont, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: tokens.primaryShadow }}>
                  Request Access
                </button>
              </div>
            </>
          )}
          <p style={{ textAlign: "center", fontSize: 12, color: tokens.textMuted, marginTop: 20 }}>
            Already have an account?{" "}
            <button onClick={() => setState({ ...state, screen: "login" })} style={{ color: tokens.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: bFont, padding: 0 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Courses Screen ───────────────────────────────────────────────────────────
function CoursesScreen({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const courses = [
    { code: "CS301", name: "Data Structures and Algorithms", nameAr: "هياكل البيانات والخوارزميات", instructor: "Dr. Nadia Al-Manea", week: 9, topics: 12, mastery: 58, evidence: 22 },
    { code: "CS302", name: "Operating Systems", nameAr: "نظم التشغيل", instructor: "Dr. Khalid Al-Shahrani", week: 7, topics: 10, mastery: 81, evidence: 18 },
    { code: "MATH201", name: "Probability and Statistics", nameAr: "الاحتمال والاحصاء", instructor: "Dr. Fatima Al-Ghamdi", week: 9, topics: 10, mastery: 33, evidence: 7 },
  ];

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 20px", textAlign: isRtl ? "right" : "left" }}>
        {lang === "ar" ? "مقرراتي" : "My Courses"}
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {courses.map((c) => {
          const color = c.mastery > 70 ? tokens.mastered : c.mastery > 40 ? tokens.developing : tokens.gap;
          return (
            <div key={c.code} onClick={() => setState({ ...state, screen: "mastery" })} style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 14, padding: "22px 22px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ padding: "5px 9px", background: tokens.primaryLight, border: `1px solid ${tokens.citationBorder}`, borderRadius: 6, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: tokens.primary }}>
                  {c.code}
                </div>
                <div style={{ textAlign: isRtl ? "left" : "right" }}>
                  <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color }}>{c.mastery}%</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint }}>{c.evidence} evidence pts</div>
                </div>
              </div>
              <div style={{ fontFamily: hFont, fontWeight: 600, fontSize: 15, color: tokens.textPrimary, marginBottom: 3, letterSpacing: "-0.02em", textAlign: isRtl ? "right" : "left" }}>
                {lang === "ar" ? c.nameAr : c.name}
              </div>
              <div style={{ fontSize: 12, color: tokens.textMuted, fontFamily: bFont, marginBottom: 14, textAlign: isRtl ? "right" : "left" }}>
                {c.instructor} · {lang === "ar" ? `الاسبوع ${c.week}` : `Week ${c.week}`} · {c.topics} {lang === "ar" ? "موضوع" : "topics"}
              </div>
              <div style={{ height: 5, background: tokens.inset, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${c.mastery}%`, background: color, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen({ state }: { state: AppState }) {
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const bFont = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  return (
    <div style={{ padding: "28px 32px", direction: isRtl ? "rtl" : "ltr" }}>
      <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 20px", textAlign: isRtl ? "right" : "left" }}>
        {lang === "ar" ? "الملف الشخصي" : "Profile"}
      </h1>
      <div style={{ background: tokens.card, border: `1px solid ${tokens.cardBorder}`, borderRadius: 14, padding: "28px 28px", maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: tokens.primaryLight, border: `2px solid ${tokens.primary}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: hFont, fontWeight: 700, fontSize: 20, color: tokens.primary }}>
            SA
          </div>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <div style={{ fontFamily: hFont, fontWeight: 700, fontSize: 17, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>{lang === "ar" ? "سارة الراشدي" : "Sarah Al-Rashidi"}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: tokens.textMuted }}>202341872 · Computer Science</div>
          </div>
        </div>
        {[
          { label: lang === "ar" ? "الجامعة" : "Institution", value: "King Abdullah University of Science and Technology" },
          { label: lang === "ar" ? "البريد" : "Email", value: "s.alrashidi@kaust.edu.sa" },
          { label: lang === "ar" ? "المقررات" : "Enrolled Courses", value: "CS301, CS302, MATH201" },
          { label: lang === "ar" ? "الفصل الدراسي" : "Current Semester", value: lang === "ar" ? "الفصل الثاني 2025-2026" : "Semester 2 2025-2026" },
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", padding: "12px 0", borderBottom: `1px solid ${tokens.cardBorder}`, justifyContent: "space-between", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: bFont }}>{row.label}</span>
            <span style={{ fontSize: 13, color: tokens.textPrimary, fontFamily: bFont, fontWeight: 500, textAlign: isRtl ? "left" : "right", maxWidth: "60%" }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState<AppState>({
    screen: "login",
    dark: false,
    lang: "en",
  });

  useEffect(() => {
    document.body.className = state.dark ? "dark" : "";
  }, [state.dark]);

  const isAuth = state.screen === "login" || state.screen === "register";
  const isInstructor = state.screen === "instructor";

  const renderScreen = () => {
    switch (state.screen) {
      case "login": return <LoginScreen state={state} setState={setState} />;
      case "register": return <RegisterScreen state={state} setState={setState} />;
      case "student-dashboard": return <DashboardScreen state={state} setState={setState} />;
      case "courses": return <CoursesScreen state={state} setState={setState} />;
      case "mastery": return <MasteryScreen state={state} setState={setState} />;
      case "tutor": return <TutorScreen state={state} />;
      case "diagnostic": return <DiagnosticScreen state={state} setState={setState} />;
      case "practice": return <PracticeScreen state={state} setState={setState} />;
      case "reassessment": return <ReassessmentScreen state={state} setState={setState} />;
      case "profile": return <ProfileScreen state={state} />;
      case "instructor": return <InstructorScreen state={state} setState={setState} />;
      default: return null;
    }
  };

  if (isAuth) {
    return (
      <AuthShell state={state} setState={setState}>
        {renderScreen()}
      </AuthShell>
    );
  }

  return (
    <AppShell state={state} setState={setState} role={isInstructor ? "instructor" : "student"}>
      {renderScreen()}
    </AppShell>
  );
}
