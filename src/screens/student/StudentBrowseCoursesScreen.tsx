import { useMemo, useRef, useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, Drawer, Field, AlertStrip, inputStyle, textareaStyle, toast } from "@/components/ModuleUI";
import { SectionHeading } from "@/components/SharedUI";
import { IconBookOpen, IconCheck, IconDoc, IconImageAttach, IconPlus, IconX, IconClock, IconWarning, IconAnchor, IconInbox } from "@/components/Icons";
import { COURSE_CATALOG, CatalogCourse, STUDENT_ME_ID } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-05/06/07 — the student side of the admin spec, in one screen:
// browse every institution course (not just paste a code), enroll instantly
// in your own year, and for any other year file a proof-backed request that
// lands in the admin queue the same second. Individual accounts on approved
// domains additionally see the link-consent banner and the blocked
// personal-course message — they can not grow a private lane next to the
// institution's catalog.

const STUDENT_YEAR = 3;

const dayDiff = (iso: string) => {
  const day = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  return Math.floor((day(Date.now()) - day(new Date(iso).getTime())) / 864e5);
};

type Attachment = { name: string; kind: "image" | "file" };

export default function StudentBrowseCoursesScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, submitRequest } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set(["CS301"]));
  const [drawerCourse, setDrawerCourse] = useState<CatalogCourse | null>(null);
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkDismissed, setLinkDismissed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const myRequests = useMemo(
    () => mod.requests.filter((r) => r.studentId === STUDENT_ME_ID),
    [mod.requests],
  );

  const requestFor = (code: string) => myRequests.find((r) => r.courseCode === code && r.status === "pending") ?? null;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSE_CATALOG.filter((c) => {
      if (yearFilter !== "all" && c.year !== Number(yearFilter)) return false;
      if (!q) return true;
      return [c.code, c.title.en, c.title.ar, c.department.en, c.department.ar, c.doctor].join(" ").toLowerCase().includes(q);
    });
  }, [query, yearFilter]);

  const openDrawer = (course: CatalogCourse) => {
    setReason("");
    setAttachments([]);
    setDrawerCourse(course);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...files].map((f) => ({ name: f.name, kind: (/\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name) ? "image" : "file") as Attachment["kind"] }));
    setAttachments((prev) => {
      const have = new Set(prev.map((a) => a.name));
      return [...prev, ...next.filter((a) => !have.has(a.name))];
    });
  };

  const reasonOk = reason.trim().length > 0;
  const canSubmit = reasonOk && attachments.length > 0;

  const send = () => {
    if (!drawerCourse || !canSubmit) return;
    submitRequest({
      courseCode: drawerCourse.code,
      courseTitle: drawerCourse.title,
      courseYear: drawerCourse.year,
      reason: reason.trim(),
      attachments,
    });
    toast(t(
      `Request sent — ${drawerCourse.code} now sits in the admin queue with your proof attached.`,
      `أُرسل الطلب — ${drawerCourse.code} الآن في قايمة الإدارة ومرفقاتك معه.`,
    ));
    setDrawerCourse(null);
  };

  const enroll = (course: CatalogCourse) => {
    setEnrolled((prev) => new Set(prev).add(course.code));
    toast(t(`Enrolled in ${course.code} — it opens in My Courses right away.`, `سُجلت في ${course.code} — يظهر في مقرراتي فورًا.`));
  };

  const courseAction = (course: CatalogCourse) => {
    if (enrolled.has(course.code)) {
      return <Chip tokens={tokens} tone="primary">{t("Enrolled", "مسجل")}</Chip>;
    }
    const pending = requestFor(course.code);
    if (pending) {
      return <Chip tokens={tokens} tone="peri">{t("Request pending", "الطلب معلق")}</Chip>;
    }
    if (course.year === STUDENT_YEAR) {
      return (
        <Btn tokens={tokens} lang={lang} variant="soft" style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0 }} onClick={() => enroll(course)}>
          <IconCheck size={13} color={tokens.primary} />
          {t("Enroll now", "سجّل الآن")}
        </Btn>
      );
    }
    return (
      <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "8px 14px", fontSize: 12.5, flexShrink: 0 }} onClick={() => openDrawer(course)}>
        <IconDoc size={13} color={tokens.textSecondary} />
        {t("Request with proof", "اطلب بإثبات")}
      </Btn>
    );
  };

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Browse institution courses", "استعرض مقررات المؤسسة")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Every course in your faculty — not only the ones you already know the code of.", "كل مقررات كليتك — مش بس اللي تعرف كودها.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconBookOpen size={14} color={tokens.primary} />}
          title={t(
            `You are in year ${STUDENT_YEAR}: courses of your year enroll instantly. Any other year needs a request with the official proof attached — the admin sees it with your statement, decides, and you are notified.`,
            `أنتِ في السنة ${STUDENT_YEAR}: مقررات سنتك تسجليها فورًا. أما السنوات الأخرى فتحتاج طلبًا مرفقًا بالإثبات الرسمي — الإدارة تراه مع بيانك وتبت فيه ويصلك إشعار.`,
          )}
        />
      </div>

      {state.personalOnly && !linkDismissed && (
        <Card tokens={tokens} style={{ padding: "14px 16px", marginBottom: 14, borderColor: tokens.primaryMid }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span style={{ flexShrink: 0, marginTop: 2 }}><IconAnchor size={16} color={tokens.primary} /></span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>
                {t("Your university invites you to link your account", "جامعتك تدعوك لربط حسابك")}
              </div>
              <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted, marginTop: 5, lineHeight: 1.7 }}>
                {t(
                  "This personal account runs on an approved domain (menoufia.edu.eg). Linking converts it to institutional — your courses and history come along whole, and you become visible to your faculty. Nothing changes until you say yes.",
                  "حسابك الفردي على نطاق معتمد (menoufia.edu.eg). الربط يحوله لمؤسسي — مقرراتك ومحفوظاتك تنتقل كاملة وتصبحين ظاهرة لكليتك. لا شيء يتغير حتى توافقي.",
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Btn tokens={tokens} lang={lang} style={{ padding: "9px 14px", fontSize: 12.5 }} onClick={() => {
                setLinkDismissed(true);
                toast(t("Linked (simulated) — the admin side logs «account.linked» with your consent.", "رُبط الحساب (محاكاة) — جهة الإدارة تسجل «ربط حساب فردي» بموافقتك."));
              }}>
                <IconCheck size={13} color="#fff" />
                {t("Accept linking", "أوافق على الربط")}
              </Btn>
              <Btn tokens={tokens} lang={lang} variant="ghost" style={{ padding: "9px 14px", fontSize: 12.5 }} onClick={() => setLinkDismissed(true)}>
                {t("Later", "لاحقًا")}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      {state.personalOnly && (
        <Card tokens={tokens} style={{ padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <IconWarning size={14} color={tokens.gap} />
            <span style={{ fontFamily: bFont, fontSize: 12, color: tokens.textSecondary, flex: 1, minWidth: 240, lineHeight: 1.65 }}>
              {t(
                "Creating new personal courses is paused for your account — your email sits on an institution-approved domain, so the path forward is linking above, not another private lane.",
                "إنشاء مقررات شخصية جديدة متوقف لحسابك — إيميلك على نطاق معتمد مؤسسيًا، فالطريق الصحيح هو الربط بالأعلى لا مسار خاص جديد.",
              )}
            </span>
            <Btn tokens={tokens} lang={lang} variant="ghost" disabled style={{ padding: "8px 13px", fontSize: 12, flexShrink: 0 }}>
              <IconPlus size={13} color={tokens.textFaint} />
              {t("New personal course", "مقرر شخصي جديد")}
            </Btn>
          </div>
        </Card>
      )}

      <Card tokens={tokens} style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ flex: "2 1 240px", minWidth: 200 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.09em", color: tokens.textFaint, marginBottom: 4 }}>
              {t("SEARCH THE CATALOG", "ابحث في الكتالوج")}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ ...inputStyle(tokens, bFont) }}
              placeholder={t("Course code, title, department, or doctor…", "كود المقرر أو اسمه أو القسم أو الدكتور…")}
            />
          </div>
          <div style={{ flex: "1 1 150px", minWidth: 135 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.09em", color: tokens.textFaint, marginBottom: 4 }}>
              {t("YEAR", "السنة")}
            </div>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}>
              <option value="all">{t("All years", "كل السنوات")}</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>{t(`Year ${y}`, `السنة ${y}`)}{y === STUDENT_YEAR ? ` — ${t("you", "أنتِ")}` : ""}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {shown.map((course) => (
          <Card tokens={tokens} key={course.code} style={{ padding: "13px 16px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div style={{ flex: 1, minWidth: 230 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600, color: tokens.textPrimary }}>{course.code}</span>
                  <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>
                    {lang === "ar" ? course.title.ar : course.title.en}
                  </span>
                  <Chip tokens={tokens} tone={course.year === STUDENT_YEAR ? "primary" : "slate"}>
                    {t(`Year ${course.year}`, `السنة ${course.year}`)}
                  </Chip>
                </div>
                <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 4 }}>
                  {lang === "ar" ? course.department.ar : course.department.en} · {course.doctor}
                </div>
              </div>
              {courseAction(course)}
            </div>
          </Card>
        ))}
        {shown.length === 0 && (
          <Card tokens={tokens} style={{ padding: "24px 18px", textAlign: "center" }}>
            <div style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted }}>
              {t("No course matches this search.", "لا مقرر يطابق هذا البحث.")}
            </div>
          </Card>
        )}
      </div>

      <div>
        <SectionHeading
          title={t("My out-of-year requests", "طلباتي خارج السنة")}
          subtitle={myRequests.length
            ? t("The moment the admin decides, the status below moves — no refresh needed.", "لحظة ما الإدارة تبت، الحالة بالأسفل تتحرك — بلا تحديث للصفحة.")
            : t("Nothing yet — request any course outside your year from above.", "لا شيء بعد — اطلبي أي مقرر خارج سنتك من الأعلى.")}
          tokens={tokens} headFont={hFont} bodyFont={bFont} rtl={isRtl}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myRequests.map((r) => {
            const waiting = dayDiff(r.submittedAt);
            return (
              <Card tokens={tokens} key={r.id} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ flexShrink: 0 }}><IconInbox size={14} color={tokens.textFaint} /></span>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: tokens.textPrimary }}>{r.courseCode}</span>
                      <span style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textPrimary }}>{lang === "ar" ? r.courseTitle.ar : r.courseTitle.en}</span>
                      {r.status === "pending"
                        ? <Chip tokens={tokens} tone="peri">{t("Pending decision", "بانتظار القرار")}</Chip>
                        : r.status === "accepted"
                          ? <Chip tokens={tokens} tone="primary">{t("Accepted — you're in", "مقبول — أصبحت مسجلة")}</Chip>
                          : <Chip tokens={tokens} tone="violet">{t("Rejected", "مرفوض")}</Chip>}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 5, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint }}>
                        <IconClock size={11} color={tokens.textFaint} />
                        {r.status === "pending"
                          ? (waiting === 0 ? t("submitted today", "قُدم اليوم") : t(`waiting ${waiting}d`, `معلق منذ ${waiting} يوم`))
                          : r.decidedBy ? t(`decided by ${r.decidedBy}`, `البت بواسطة ${r.decidedBy}`) : ""}
                      </span>
                      {r.decisionNote && (
                        <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textMuted }}>“{r.decisionNote}”</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Drawer
        open={drawerCourse !== null}
        onClose={() => setDrawerCourse(null)}
        tokens={tokens}
        lang={lang}
        title={drawerCourse ? t(`Request ${drawerCourse.code}`, `طلب ${drawerCourse.code}`) : ""}
        subtitle={drawerCourse ? (lang === "ar" ? drawerCourse.title.ar : drawerCourse.title.en) : ""}
      >
        {drawerCourse && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Chip tokens={tokens} tone="slate">{t(`You: year ${STUDENT_YEAR}`, `أنتِ: السنة ${STUDENT_YEAR}`)}</Chip>
              <Chip tokens={tokens} tone="slate">{t(`Course: year ${drawerCourse.year}`, `المقرر: السنة ${drawerCourse.year}`)}</Chip>
              <Chip tokens={tokens} tone="peri">{t("Needs admin decision", "يحتاج قرار الإدارة")}</Chip>
            </div>

            <AlertStrip
              tokens={tokens}
              lang={lang}
              tone="violet"
              icon={<IconWarning size={14} color={tokens.gap} />}
              title={t(
                "Enrolling outside your year is a formal exception: attach the student-affairs approval (and fees receipt if asked). Without at least one attachment the request can not leave this drawer.",
                "التسجيل خارج سنتك استثناء رسمي: أرفقي موافقة شؤون الطلاب (وإيصال المصاريف إن طُلب). بدون مرفق واحد على الأقل لن يغادر الطلب هذا الدرج.",
              )}
            />

            <Field tokens={tokens} lang={lang} label={t("Your statement", "بيانك")} required>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                style={{ ...textareaStyle(tokens, bFont) }}
                placeholder={t("Why does this exception make sense? e.g. completed the prerequisite with distinction.", "لماذا يستحق هذا الاستثناء؟ مثال: أنهيت المتطلب السابق بامتياز.")}
              />
            </Field>

            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.09em", color: tokens.textFaint }}>
                  {t("PROOF ATTACHMENTS", "مرفقات الإثبات")}
                </span>
                <Btn tokens={tokens} lang={lang} variant="soft" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => fileRef.current?.click()}>
                  <IconPlus size={12} color={tokens.primary} />
                  {t("Attach proof", "إرفاق إثبات")}
                </Btn>
              </div>
              <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                {attachments.map((a) => (
                  <span key={a.name} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: tokens.textPrimary, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 6, padding: "4px 9px", direction: "ltr" }}>
                    {a.kind === "image" ? <IconImageAttach size={11} color={tokens.textSecondary} /> : <IconDoc size={11} color={tokens.textSecondary} />}
                    {a.name}
                    <button onClick={() => setAttachments((prev) => prev.filter((x) => x.name !== a.name))} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex" }} aria-label={`remove ${a.name}`}>
                      <IconX size={11} color={tokens.textSecondary} />
                    </button>
                  </span>
                ))}
                {attachments.length === 0 && (
                  <span style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint }}>
                    {t("student-affairs-approval.pdf · fees-receipt.jpg — at least one is required.", "موافقة شؤون الطلاب · إيصال المصاريف — واحد على الأقل مطلوب.")}
                  </span>
                )}
              </div>
            </div>

            <Btn
              tokens={tokens}
              lang={lang}
              disabled={!canSubmit}
              style={{ width: "100%", padding: "11px 0", fontSize: 13.5, justifyContent: "center" }}
              onClick={send}
            >
              {t("Send request to the institution", "أرسل الطلب للمؤسسة")}
            </Btn>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <IconCheck size={12} color={tokens.textFaint} />
              <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.6 }}>
                {t("The admin opens exactly this: your statement plus these attachments, then you get the decision as a notification.", "الإدارة تفتح هذا بالضبط: بيانك وهذه المرفقات، ثم يصلك القرار إشعارًا.")}
              </span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
