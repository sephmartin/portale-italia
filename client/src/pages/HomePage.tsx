import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AgentWidget from "../components/AgentWidget";
import { MODULES } from "../components/AppShell";

// ─── Mock data (used when API is unavailable in static deploy) ──────────────
const MOCK_PROFILE = {
  summary: {
    pagopa: { totalPending: 612.00, pendingPayments: 2 },
    inps: { contributions: 18 },
    anpr: { residence: "Roma (RM)" },
  }
};
const MOCK_NOTIFS = {
  notifications: [
    { id: 1, read: false },
    { id: 2, read: false },
    { id: 3, read: true },
  ]
};

// Safe fetcher: falls back to mock if server unavailable
async function safeFetch<T>(url: string, mock: T): Promise<T> {
  try {
    const r = await fetch(url);
    if (!r.ok) return mock;
    const text = await r.text();
    if (!text || text.trim().startsWith("<")) return mock;
    return JSON.parse(text) as T;
  } catch {
    return mock;
  }
}

export default function HomePage() {
  const { data: notifData } = useQuery({
    queryKey: ["/api/v1/notifications"],
    queryFn: () => safeFetch("/api/v1/notifications", MOCK_NOTIFS),
  });
  const { data: profileData } = useQuery({
    queryKey: ["/api/v1/citizen/profile"],
    queryFn: () => safeFetch("/api/v1/citizen/profile", MOCK_PROFILE),
  });

  const profile = profileData ?? MOCK_PROFILE;
  const unread = (notifData?.notifications ?? MOCK_NOTIFS.notifications).filter((n: any) => !n.read).length;

  return (
    <div className="space-y-8 fade-in">
      {/* Welcome bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-extrabold truncate" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
            Buongiorno, Mario
          </h1>
          <p className="mt-1 text-xs sm:text-sm truncate" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            {new Date().toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })} · SPID attivo · CIE attiva
          </p>
        </div>
        {unread > 0 && (
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold hover:shadow-md transition-all flex-shrink-0"
            style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.06)", fontFamily: "var(--font-body)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unread} avvisi
          </Link>
        )}
      </div>

      {/* Agent — central */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          Assistente Unificato
        </p>
        <AgentWidget module="general" accent="var(--color-brand)" />
      </div>

      {/* Quick status cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          La tua situazione
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger">
          {[
            { label: "730 precompilato", value: "Disponibile", hint: "Scadenza 30 set", color: "var(--color-entrate)", bg: "var(--color-entrate-light)", urgent: true, href: "/entrate" },
            { label: "Bollo auto", value: "Scade 30 apr", hint: "Paga con PagoPA", color: "var(--color-auto)", bg: "var(--color-auto-light)", urgent: true, href: "/auto" },
            { label: "Pagamenti pendenti", value: `€ ${profile.summary.pagopa.totalPending.toFixed(2)}`, hint: `${profile.summary.pagopa.pendingPayments} da pagare`, color: "var(--color-pagopa)", bg: "var(--color-pagopa-light)", urgent: false, href: "/pagopa" },
            { label: "Contributi INPS", value: `${profile.summary.inps.contributions} anni`, hint: "Fascicolo previdenziale", color: "var(--color-inps)", bg: "var(--color-inps-light)", urgent: false, href: "/inps" },
            { label: "Referto disponibile", value: "1 nuovo", hint: "Fascicolo sanitario", color: "var(--color-salute)", bg: "var(--color-salute-light)", urgent: false, href: "/salute" },
            { label: "Residenza ANPR", value: profile.summary.anpr.residence, hint: "Certificato aggiornato", color: "var(--color-anpr)", bg: "var(--color-anpr-light)", urgent: false, href: "/anpr" },
          ].map((card) => (
            <Link key={card.label} href={card.href}
              className="p-4 rounded-xl border card-hover fade-in relative overflow-hidden"
              style={{ background: "var(--color-surface)", borderColor: card.urgent ? card.color : "var(--color-border)" }}
            >
              {card.urgent && <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-sm" style={{ background: card.color }} />}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: card.bg }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: card.color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{card.label}</span>
              </div>
              <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)", color: card.urgent ? card.color : "var(--color-text)" }}>{card.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>{card.hint}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Modules grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          Accesso diretto ai servizi
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger">
          {MODULES.map(({ id, href, label, color, bg, icon: Icon }) => (
            <Link key={id} href={href}
              className="p-5 rounded-xl border card-hover fade-in group"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, color }}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-sm group-hover:underline decoration-[var(--color-border)]"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{label}</h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
                {{
                  inps: "Pensione, NASpI, ISEE, contributi",
                  entrate: "730, F24, visure, IVA",
                  pagopa: "Pagamenti PA, multe, tributi",
                  anpr: "Certificati, residenza, stato civile",
                  salute: "Referti, ricette, esenzioni",
                  auto: "Bollo, patente, revisione",
                }[id]}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* API Banner */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "var(--color-text)", color: "var(--color-bg)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-50" style={{ fontFamily: "var(--font-body)" }}>Developer & AI Agents</span>
          </div>
          <h3 className="font-extrabold" style={{ fontFamily: "var(--font-display)" }}>API Gateway Unificato</h3>
          <p className="text-sm mt-1 opacity-60" style={{ fontFamily: "var(--font-body)" }}>
            Tutti i servizi PA in un unico endpoint. Integra in n8n, Make, o qualsiasi agente AI.
          </p>
        </div>
        <Link href="/api"
          className="px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: "var(--color-brand)", color: "white", fontFamily: "var(--font-body)" }}>
          Vai all'API Gateway →
        </Link>
      </div>
    </div>
  );
}
