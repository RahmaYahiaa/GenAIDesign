import { useMemo, useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Btn, Chip, ConfirmBtn, Drawer, Field, PillTabs, AlertStrip, textareaStyle, toast } from "@/components/ModuleUI";
import { IconInbox, IconDoc, IconImageAttach, IconCheck, IconBan, IconClock, IconEye } from "@/components/Icons";
import { OutOfYearRequest } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-05 — out-of-year enrollment requests: a student outside the course
// year must attach proof of an official exception; the admin decides after
// reviewing the proofs, a rejection always carries a reason, and every
// decision lands in the institution audit log with the proof reference.

type FilterId = "pending" | "accepted" | "rejected";

const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);

function ProofPreview({ request, tokens, lang, isRtl }: { request: OutOfYearRequest; tokens: ReturnType<typeof tk>; lang: "en" | "ar"; isRtl: boolean }) {
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {request.attachments.map((att) => (
        <div key={att.id} style={{ border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, overflow: "hidden" }}>
          {att.kind === "image" ? (
            <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: tokens.inset, borderBottom: `1px dashed ${tokens.cardBorder}` }}>
              <IconImageAttach size={22} color={tokens.textFaint} />
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint }}>{t("attached image preview", "معاينة الصورة المرفقة")}</span>
            </div>
          ) : (
            <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 6, background: tokens.inset, borderBottom: `1px dashed ${tokens.cardBorder}` }}>
              <div style={{ height: 7, width: "62%", borderRadius: 4, background: tokens.cardBorder }} />
              <div style={{ height: 7, width: "88%", borderRadius: 4, background: tokens.cardBorder, opacity: 0.75 }} />
              <div style={{ height: 7, width: "41%", borderRadius: 4, background: tokens.cardBorder, opacity: 0.55 }} />
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint, marginTop: 2 }}>{t("attached document preview", "معاينة المستند المرفق")}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
            {att.kind === "image" ? <IconImageAttach size={13} color={tokens.textSecondary} /> : <IconDoc size={13} color={tokens.textSecondary} />}
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: tokens.textPrimary, direction: "ltr" }}>{att.name}</span>
          </div>
        </div>
      ))}
      <p style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, margin: 0, lineHeight: 1.6 }}>
        {t(
          "Attachments come from the student-affairs exception flow — deciding without reviewing them is possible but discouraged.",
          "المرفقات مصدرها مسار استثناءات شؤون الطلاب — يمكن البت دون مراجعتها لكنه غير مستحسن.",
        )}
      </p>
    </div>
  );
}

export default function AdminRequestsScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { state: mod, decideRequest } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const [filter, setFilter] = useState<FilterId>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const open = mod.requests.find((r) => r.id === openId) ?? null;
  const noteOk = note.trim().length > 0;

  const counts = useMemo(() => ({
    pending: mod.requests.filter((r) => r.status === "pending").length,
    accepted: mod.requests.filter((r) => r.status === "accepted").length,
    rejected: mod.requests.filter((r) => r.status === "rejected").length,
  }), [mod.requests]);

  const shown = mod.requests.filter((r) => r.status === filter);

  const decide = (decision: "accepted" | "rejected") => {
    if (!open) return;
    decideRequest(open.id, decision, decision === "rejected" ? note.trim() : note.trim() || undefined);
    toast(decision === "accepted"
      ? t("Request accepted — the student lands in the course immediately, and the decision is audit-logged.", "قُبل الطلب — يصل الطالب للمقرر فورًا والقرار مسجل في التدقيق.")
      : t("Request rejected with your reason — the student sees it in his notifications, and the decision is audit-logged.", "رُفض الطلب بسببك — يراه الطالب في إشعاراته والقرار مسجل في التدقيق."));
    setOpenId(null);
  };

  const yearGapChip = (r: OutOfYearRequest) =>
    r.studentYear < r.courseYear ? (
      <Chip tokens={tokens} tone="peri">{t(`Year ${r.studentYear} → ${r.courseYear} fast-track`, `ترقية من سنة ${r.studentYear} إلى ${r.courseYear}`)}</Chip>
    ) : r.studentYear > r.courseYear ? (
      <Chip tokens={tokens} tone="default">{t(`Year ${r.studentYear} backfill to ${r.courseYear}`, `استكمال من سنة ${r.studentYear} إلى ${r.courseYear}`)}</Chip>
    ) : (
      <Chip tokens={tokens} tone="default">{t("Same year — special case", "نفس السنة — حالة خاصة")}</Chip>
    );

  const statusChip = (s: OutOfYearRequest["status"]) =>
    s === "pending"
      ? <Chip tokens={tokens} tone="peri">{t("Waiting for review", "بانتظار المراجعة")}</Chip>
      : s === "accepted"
        ? <Chip tokens={tokens} tone="primary">{t("Accepted", "مقبول")}</Chip>
        : <Chip tokens={tokens} tone="violet">{t("Rejected", "مرفوض")}</Chip>;

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Out-of-year requests", "طلبات خارج السنة")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Proof-backed exceptions — decided one by one, never by accident.", "استثناءات مدعومة بإثباتات — تُبت واحدًا واحدًا ولا تقع بالمصادفة.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconInbox size={14} color={tokens.primary} />}
          title={t(
            "A student outside the course year can not enroll by code — he requests, attaches the official exception, and your decision both grants the seat and reaches his notifications.",
            "الطالب خارج سنة المقرر لا يسجل بالكود — يطلب ويرفق الاستثناء الرسمي، وقرارك يمنح المقعد ويصل لإشعاراته معًا.",
          )}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <PillTabs
          tokens={tokens}
          lang={lang}
          active={filter}
          onSelect={(id) => setFilter(id as FilterId)}
          tabs={[
            { id: "pending", label: `${t("Pending", "معلقة")} · ${counts.pending}` },
            { id: "accepted", label: `${t("Accepted", "مقبولة")} · ${counts.accepted}` },
            { id: "rejected", label: `${t("Rejected", "مرفوضة")} · ${counts.rejected}` },
          ]}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map((r) => {
          const waiting = daysAgo(r.submittedAt);
          return (
            <Card tokens={tokens} key={r.id} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span style={{ fontFamily: bFont, fontWeight: 600, fontSize: 13.5, color: tokens.textPrimary }}>{r.studentName}</span>
                    <Chip tokens={tokens} tone="slate">{t(`Year ${r.studentYear}`, `سنة ${r.studentYear}`)}</Chip>
                    {yearGapChip(r)}
                    {statusChip(r.status)}
                  </div>
                  <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textSecondary, marginTop: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11.5 }}>{r.courseCode}</span>
                    {"  ·  "}
                    {lang === "ar" ? r.courseTitle.ar : r.courseTitle.en}
                  </div>
                  <div style={{ fontFamily: bFont, fontSize: 12, color: tokens.textMuted, marginTop: 6, lineHeight: 1.65 }}>
                    {r.reason}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    {r.attachments.map((att) => (
                      <span key={att.id} style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10, color: tokens.textSecondary, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 5, padding: "3px 8px" }}>
                        {att.kind === "image" ? <IconImageAttach size={11} color={tokens.textSecondary} /> : <IconDoc size={11} color={tokens.textSecondary} />}
                        {att.name}
                      </span>
                    ))}
                  </div>
                  {r.status !== "pending" && (
                    <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textFaint, marginTop: 8 }}>
                      {t("Decided by", "البت بواسطة")} {r.decidedBy}
                      {r.decisionNote ? ` — “${r.decisionNote}”` : ""}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: isRtl ? "flex-start" : "flex-end", flexShrink: 0 }}>
                  {r.status === "pending" ? (
                    <>
                      <Btn tokens={tokens} lang={lang} variant="soft" style={{ padding: "8px 14px", fontSize: 12.5 }} onClick={() => { setNote(""); setOpenId(r.id); }}>
                        <IconEye size={13} color={tokens.primary} />
                        {t("Review proofs & decide", "راجع الإثباتات وابت")}
                      </Btn>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontFamily: MONO, fontSize: 10.5, color: waiting >= 3 ? tokens.gap : tokens.textFaint }}>
                        <IconClock size={11} color={waiting >= 3 ? tokens.gap : tokens.textFaint} />
                        {waiting > 0 ? t(`waiting ${waiting}d`, `معلق منذ ${waiting} يوم`) : t("submitted today", "قُدم اليوم")}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint }}>
                      {r.decidedAt ? t(`${daysAgo(r.decidedAt)}d ago`, `منذ ${daysAgo(r.decidedAt)} يوم`) : ""}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {shown.length === 0 && (
          <Card tokens={tokens} style={{ padding: "26px 18px", textAlign: "center" }}>
            <div style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted }}>
              {filter === "pending"
                ? t("Nothing waiting — every request has been decided.", "لا شيء معلق — كل الطلبات تم البت فيها.")
                : t("No requests under this filter yet.", "لا طلبات تحت هذا الفلتر بعد.")}
            </div>
          </Card>
        )}
      </div>

      <Drawer
        open={open !== null}
        onClose={() => setOpenId(null)}
        tokens={tokens}
        lang={lang}
        title={open ? `${open.studentName} → ${open.courseCode}` : ""}
        subtitle={open ? (lang === "ar" ? open.courseTitle.ar : open.courseTitle.en) : ""}
      >
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <Chip tokens={tokens} tone="slate">{t(`Student in year ${open.studentYear}`, `الطالب في سنة ${open.studentYear}`)}</Chip>
              <Chip tokens={tokens} tone="slate">{t(`Course of year ${open.courseYear}`, `مقرر سنة ${open.courseYear}`)}</Chip>
              {yearGapChip(open)}
            </div>

            <div style={{ background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted, marginBottom: 7 }}>
                {t("STUDENT STATEMENT", "بيان الطالب")}
              </div>
              <p style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textPrimary, margin: 0, lineHeight: 1.7 }}>{open.reason}</p>
            </div>

            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.09em", color: tokens.textMuted, marginBottom: 7 }}>
                {t("PROOF ATTACHMENTS", "مرفقات الإثبات")}
              </div>
              <ProofPreview request={open} tokens={tokens} lang={lang} isRtl={isRtl} />
            </div>

            <Field tokens={tokens} lang={lang} label={t("Decision note", "ملاحظة القرار")} hint={t("Optional for acceptance — required for rejection so the student knows why.", "اختيارية للقبول — إلزامية للرفض حتى يعرف الطالب السبب.")}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={{ ...textareaStyle(tokens, bFont) }}
                placeholder={t("e.g. Exception verified against student-affairs records.", "مثال: تم التحقق من الاستثناء من سجلات شؤون الطلاب.")}
              />
            </Field>

            <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <ConfirmBtn
                tokens={tokens}
                lang={lang}
                variant="solid"
                label={t("Accept — enroll in course", "قبول — تسجيل في المقرر")}
                confirmLabel={t("Click again to accept", "اضغط للتأكيد للقبول")}
                onConfirm={() => decide("accepted")}
              />
              <ConfirmBtn
                tokens={tokens}
                lang={lang}
                variant="soft"
                disabled={!noteOk}
                label={t("Reject with reason", "رفض مع السبب")}
                confirmLabel={t("Click again to reject", "اضغط للتأكيد للرفض")}
                onConfirm={() => decide("rejected")}
              />
            </div>
            {!noteOk && (
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <IconBan size={12} color={tokens.textFaint} />
                <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint }}>
                  {t("Write the note above to unlock rejection.", "اكتب الملاحظة بالأعلى لتفعيل زر الرفض.")}
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <IconCheck size={12} color={tokens.textFaint} />
              <span style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, lineHeight: 1.6 }}>
                {t("The decision records the proof reference in the audit log and notifies the student instantly.", "القرار يسجل مرجع الإثبات في التدقيق ويُشعر الطالب لحظيًا.")}
              </span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
