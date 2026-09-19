import { useMemo, useState } from "react";
import { AppState } from "@/components/AppShell";
import { tk, MONO } from "@/tokens";
import { bFontFor, hFontFor, Card, Chip, AlertStrip, inputStyle } from "@/components/ModuleUI";
import { IconHistory, IconShield, IconFilter } from "@/components/Icons";
import { AUDIT_TYPE_LABELS, PERMISSION_LABELS, PermissionKey } from "@/data/adminModule";
import { useAdminModule } from "@/store/AdminStore";

// FR-ADM-10 — institution audit log: every administrative action across all
// admin screens lands here with actor, scope and proof reference. The store
// hands each viewer only the events his permission scope covers — the super
// admin sees everything, an officer sees strictly his own territory. Filters
// are plain dropdowns: text search, scope, event type, and a calendar
// period (today / yesterday / week / month / quarter / all time).

type RangeId = "today" | "yesterday" | "7d" | "30d" | "90d" | "all";

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Calendar-day distance: 0 = today, 1 = yesterday, … */
const dayDiff = (iso: string) =>
  Math.floor((startOfDay(Date.now()) - startOfDay(new Date(iso).getTime())) / 864e5);

const relTime = (iso: string, t: (en: string, ar: string) => string) => {
  const d = dayDiff(iso);
  if (d <= 0) return t("today", "اليوم");
  if (d === 1) return t("yesterday", "أمس");
  return t(`${d}d ago`, `منذ ${d} يوم`);
};

const inRange = (iso: string, range: RangeId) => {
  const d = dayDiff(iso);
  switch (range) {
    case "today": return d === 0;
    case "yesterday": return d === 1;
    case "7d": return d <= 7;
    case "30d": return d <= 30;
    case "90d": return d <= 90;
    default: return true;
  }
};

export default function AdminAuditScreen({ state }: { state: AppState; setState: (s: AppState) => void }) {
  const { visibleAudit, me } = useAdminModule();
  const tokens = tk(state.dark);
  const lang = state.lang;
  const isRtl = lang === "ar";
  const hFont = hFontFor(lang);
  const bFont = bFontFor(lang);
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<string>("all");
  const [range, setRange] = useState<RangeId>("all");

  const scopesPresent = useMemo(() => {
    const keys = new Set<PermissionKey>();
    for (const ev of visibleAudit) keys.add(ev.scope);
    return [...keys];
  }, [visibleAudit]);

  const ranges: { id: RangeId; en: string; ar: string }[] = [
    { id: "all", en: "All time", ar: "كل الفترات" },
    { id: "today", en: "Today", ar: "اليوم" },
    { id: "yesterday", en: "Yesterday", ar: "أمس" },
    { id: "7d", en: "Last 7 days", ar: "آخر ٧ أيام" },
    { id: "30d", en: "Last 30 days", ar: "آخر ٣٠ يومًا" },
    { id: "90d", en: "Last 90 days", ar: "آخر ٩٠ يومًا" },
  ];

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleAudit.filter((ev) => {
      if (scope !== "all" && ev.scope !== scope) return false;
      if (!inRange(ev.at, range)) return false;
      if (!q) return true;
      const haystack = [ev.summary.en, ev.summary.ar, ev.detail?.en ?? "", ev.detail?.ar ?? "", ev.actorName].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [visibleAudit, query, scope, range]);

  const selectLabel = (text: string) => (
    <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.09em", color: tokens.textFaint, marginBottom: 4 }}>{text}</div>
  );

  return (
    <div style={{ padding: "26px 32px", maxWidth: 980, margin: "0 auto", direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: hFont, fontWeight: 700, fontSize: 22, color: tokens.textPrimary, letterSpacing: "-0.025em", margin: "0 0 4px" }}>
          {t("Institution audit log", "سجل تدقيق المؤسسة")}
        </h1>
        <p style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted, margin: 0 }}>
          {t("Who did what, inside which scope, carrying which proof — permanently.", "مين عمل إيه، داخل أي نطاق، وبأي مرجع إثبات — بشكل دائم.")}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AlertStrip
          tokens={tokens}
          lang={lang}
          tone="peri"
          icon={<IconShield size={14} color={tokens.primary} />}
          title={me.isSuperAdmin
            ? t(
                "You are the super admin, so this log shows every scope. An officer opening the same screen sees only the events his own permissions cover — nobody audits outside his territory.",
                "أنتِ السوبر أدمن لذلك يعرض السجل كل النطاقات. المسؤول عند فتح نفس الشاشة يرى فقط الأحداث التي تغطيها صلاحياته — لا أحد يدقق خارج حدوده.",
              )
            : t(
                "This log shows only events inside your own permission scope — the super admin alone sees everything.",
                "يعرض هذا السجل الأحداث داخل نطاق صلاحياتك فقط — السوبر أدمن وحده يرى كل شيء.",
              )}
        />
      </div>

      <Card tokens={tokens} style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <span style={{ alignSelf: "center", flexShrink: 0, paddingBottom: 4 }}>
            <IconFilter size={14} color={tokens.textSecondary} />
          </span>
          <div style={{ flex: "2 1 220px", minWidth: 180 }}>
            {selectLabel(t("SEARCH", "بحث"))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ ...inputStyle(tokens, bFont) }}
              placeholder={t("Search the summary, the actor, or a proof reference…", "ابحث في الملخص أو الفاعل أو مرجع إثبات…")}
            />
          </div>
          <div style={{ flex: "1 1 170px", minWidth: 150 }}>
            {selectLabel(t("SCOPE", "النطاق"))}
            <select value={scope} onChange={(e) => setScope(e.target.value)} style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}>
              <option value="all">{t("All scopes", "كل النطاقات")}</option>
              {scopesPresent.map((key) => (
                <option key={key} value={key}>{lang === "ar" ? PERMISSION_LABELS[key].ar : PERMISSION_LABELS[key].en}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 140px", minWidth: 125 }}>
            {selectLabel(t("PERIOD", "الفترة"))}
            <select value={range} onChange={(e) => setRange(e.target.value as RangeId)} style={{ ...inputStyle(tokens, bFont), cursor: "pointer" }}>
              {ranges.map((r) => (
                <option key={r.id} value={r.id}>{lang === "ar" ? r.ar : r.en}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: tokens.textFaint }}>
          {t(`showing ${shown.length} of ${visibleAudit.length} events`, `يُعرض ${shown.length} من أصل ${visibleAudit.length} حدث`)}
        </span>
        {(query || scope !== "all" || range !== "all") && (
          <button
            onClick={() => { setQuery(""); setScope("all"); setRange("all"); }}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: bFont, fontSize: 11, color: tokens.primary }}
          >
            {t("Clear filters", "مسح الفلاتر")}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.map((ev) => (
          <Card tokens={tokens} key={ev.id} style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span style={{ flexShrink: 0, marginTop: 2 }}>
                <IconHistory size={14} color={tokens.textFaint} />
              </span>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <Chip tokens={tokens} tone="default">{lang === "ar" ? AUDIT_TYPE_LABELS[ev.type].ar : AUDIT_TYPE_LABELS[ev.type].en}</Chip>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: tokens.textSecondary, background: tokens.inset, border: `1px solid ${tokens.cardBorder}`, borderRadius: 5, padding: "2px 7px" }}>
                    {lang === "ar" ? PERMISSION_LABELS[ev.scope].ar : PERMISSION_LABELS[ev.scope].en}
                  </span>
                </div>
                <div style={{ fontFamily: bFont, fontSize: 12.5, color: tokens.textPrimary, marginTop: 6, lineHeight: 1.65 }}>
                  {lang === "ar" ? ev.summary.ar : ev.summary.en}
                </div>
                {ev.detail && (
                  <div style={{ fontFamily: bFont, fontSize: 11.5, color: tokens.textMuted, marginTop: 4, lineHeight: 1.6 }}>
                    {lang === "ar" ? ev.detail.ar : ev.detail.en}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: isRtl ? "left" : "right" }}>
                <div style={{ fontFamily: bFont, fontWeight: 600, fontSize: 11.5, color: tokens.textSecondary }}>{ev.actorName}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: tokens.textFaint, marginTop: 3 }}>{relTime(ev.at, t)}</div>
              </div>
            </div>
          </Card>
        ))}
        {shown.length === 0 && (
          <Card tokens={tokens} style={{ padding: "26px 18px", textAlign: "center" }}>
            <div style={{ fontFamily: bFont, fontSize: 13, color: tokens.textMuted }}>
              {t("No events match this search and filter combination.", "لا أحداث تطابق هذا البحث ومجموعة الفلاتر.")}
            </div>
          </Card>
        )}
      </div>

      <p style={{ fontFamily: bFont, fontSize: 11, color: tokens.textFaint, marginTop: 16, lineHeight: 1.6 }}>
        {t(
          "Events keep their proof references forever — request decisions cite the attachment names, imports cite the file names.",
          "الأحداث تحتفظ بمراجع إثباتها دائمًا — قرارات الطلبات تذكر أسماء المرفقات والإدخالات تذكر أسماء الملفات.",
        )}
      </p>
    </div>
  );
}
