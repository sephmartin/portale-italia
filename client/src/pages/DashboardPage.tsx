import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MODULES } from "../components/AppShell";

const MODULE_COLOR: Record<string, string> = {
  inps: "var(--color-inps)", entrate: "var(--color-entrate)", pagopa: "var(--color-pagopa)",
  anpr: "var(--color-anpr)", salute: "var(--color-salute)", auto: "var(--color-auto)",
};
const MODULE_BG: Record<string, string> = {
  inps: "var(--color-inps-light)", entrate: "var(--color-entrate-light)", pagopa: "var(--color-pagopa-light)",
  anpr: "var(--color-anpr-light)", salute: "var(--color-salute-light)", auto: "var(--color-auto-light)",
};

function NotifBadge({ priority }: { priority: string }) {
  const c = priority === "high" ? "#ef4444" : priority === "medium" ? "var(--color-auto)" : "var(--color-text-faint)";
  const bg = priority === "high" ? "rgba(239,68,68,0.08)" : priority === "medium" ? "var(--color-auto-light)" : "var(--color-bg)";
  const label = priority === "high" ? "Urgente" : priority === "medium" ? "Info" : "Letto";
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: c, background: bg, fontFamily: "var(--font-body)" }}>{label}</span>;
}

export default function DashboardPage() {
  const [_, setLocation] = useLocation();
  const MOCK_N = { notifications: [ { id:1, title:"730 Precompilato disponibile", message:"Il tuo 730/2026 è pronto per la revisione. Scadenza 30 settembre.", date:"2026-04-10", source:"entrate", priority:"high", read:false }, { id:2, title:"Bonus Asilo Nido 2026 aperto", message:"Da oggi puoi richiedere il Bonus Asilo Nido. Importo max €3.000.", date:"2026-04-08", source:"inps", priority:"medium", read:false }, { id:3, title:"Bollo auto in scadenza", message:"Il tuo bollo auto scade il 30 aprile 2026. Paga ora con PagoPA.", date:"2026-04-05", source:"auto", priority:"high", read:false }, { id:4, title:"Certificato residenza disponibile", message:"Il certificato di residenza aggiornato è disponibile per il download.", date:"2026-04-01", source:"anpr", priority:"low", read:true }, { id:5, title:"Referto disponibile", message:"Il referto dell'esame del 22 marzo è ora disponibile nel Fascicolo Sanitario.", date:"2026-03-28", source:"salute", priority:"medium", read:true }, { id:6, title:"Pagamento IMU ricevuto", message:"Il pagamento IMU 2026 primo acconto di €412.00 è stato registrato.", date:"2026-03-15", source:"pagopa", priority:"low", read:true } ] };
  const MOCK_P = { citizen: { name:"Mario Rossi", cf:"RSSMRA80A01H501U" }, spid: { active:true }, cie: { active:true }, summary: { inps:{ contributions:18, activeDomande:1 }, entrate:{ dichiarazioneAnno:"2025", ultimoF24:"2026-02-16" }, pagopa:{ pendingPayments:2, totalPending:612.00 }, anpr:{ residence:"Roma (RM)", certificatiScaricati:3 }, salute:{ refertiNuovi:1, esenzioni:["E01"] }, auto:{ veicoli:1, bolloScadenza:"2026-04-30" } } };
  async function sf<T>(url: string, mock: T): Promise<T> { try { const r = await fetch(url); if (!r.ok) return mock; const t = await r.text(); if (!t||t.trim().startsWith("<")) return mock; return JSON.parse(t); } catch { return mock; } }
  const { data: notifData } = useQuery({ queryKey: ["/api/v1/notifications"], queryFn: () => sf("/api/v1/notifications", MOCK_N) });
  const { data: profileData } = useQuery({ queryKey: ["/api/v1/citizen/profile"], queryFn: () => sf("/api/v1/citizen/profile", MOCK_P) });
  const notifications = (notifData?.notifications && notifData.notifications[0]?.title ? notifData.notifications : null) ?? MOCK_N.notifications;
  const citizen = profileData?.citizen ?? MOCK_P.citizen;
  const spidStatus = profileData?.spid ?? MOCK_P.spid;
  const cieStatus = profileData?.cie ?? MOCK_P.cie;
  const summary = profileData?.summary ?? MOCK_P.summary;

  return (
    <div className="space-y-8 fade-in">
      <div>
          <h1 className="font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 1.2rem + 2.5vw, 2.5rem)", color: "var(--color-text)" }}>
          Dashboard
        </h1>
        <p className="text-base mt-1" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Situazione aggiornata al {new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: notifications */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            Notifiche ({notifications.filter((n: any) => !n.read).length} non lette)
          </h2>
          <div className="space-y-2">
            {notifications.map((n: any) => {
              const moduleId = n.module || n.source;
              const mod = MODULES.find(m => m.id === moduleId);
              return (
                <div key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all card-hover ${n.read ? "opacity-60" : ""}`}
                  style={{ background: "var(--color-surface)", cursor: "pointer", borderColor: !n.read && n.priority === "high" ? MODULE_COLOR[moduleId] : "var(--color-border)" }}
                  onClick={() => { setLocation(`/${moduleId || "dashboard"}`); }}
                >
                  {mod && (
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: MODULE_BG[moduleId], color: MODULE_COLOR[moduleId] }}>
                      <mod.icon size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{n.title}</p>
                      <NotifBadge priority={n.priority} />
                    </div>
                    <p className="text-base" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{n.message || n.body}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm" style={{ color: "var(--color-text-faint)" }}>
                        {new Date(n.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                      </span>
                      {mod && <span className="text-sm font-semibold" style={{ color: MODULE_COLOR[moduleId] }}>{mod.label}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: summary */}
        {citizen && (
          <div className="space-y-4">
            {/* Profile card */}
            <div className="rounded-xl border p-5" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white"
                  style={{ background: "var(--color-brand)", fontFamily: "var(--font-display)" }}>
                  {citizen.name?.split(" ")?.map((n: string) => n[0])?.join("") ?? ""}
                </div>
                <div>
                  <p className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{citizen.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{citizen.cf}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "SPID", ok: spidStatus?.active, color: "var(--color-brand)" },
                  { label: "CIE", ok: cieStatus?.active, color: "var(--color-brand)" },
                ].map(i => (
                  <div key={i.label} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{i.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: i.ok ? "#22c55e" : "#ef4444" }} />
                      <span className="text-xs font-medium" style={{ color: i.ok ? "#22c55e" : "#ef4444", fontFamily: "var(--font-body)" }}>
                        {i.ok ? "Attivo" : "Non attivo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modules summary */}
            {MODULES.map(({ id, label, icon: Icon }) => {
              const s = summary[id as keyof typeof summary] as any;
              if (!s) return null;
              const lines: string[] = [];
              if (id === "inps") { lines.push(`${s.contributions} anni contributi`); if (s.activeDomande) lines.push(`${s.activeDomande} domanda attiva`); }
              if (id === "entrate") { if (s.pending730) lines.push("730 da presentare"); const f24 = s.lastF24 || s.ultimoF24; if (f24) { try { lines.push(`Ultimo F24: ${new Date(f24).toLocaleDateString("it-IT")}`); } catch { lines.push(`Ultimo F24: ${f24}`); } } }
              if (id === "pagopa") { lines.push(`€${s.totalPending.toFixed(2)} da pagare`); lines.push(`${s.pendingPayments} pagamenti`); }
              if (id === "anpr") { lines.push(s.residence); }
              if (id === "salute") { const nr = s.unresolvedReferti || s.refertiNuovi; if (nr) lines.push(`${nr} referto nuovo`); }
              if (id === "auto") { const exp = s.bolloExpiry || s.bolloScadenza; if (exp) { try { lines.push(`Bollo scade ${new Date(exp).toLocaleDateString("it-IT")}`); } catch { lines.push(`Bollo scade ${exp}`); } } }
              return (
                <div key={id} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: MODULE_BG[id], color: MODULE_COLOR[id] }}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{label}</p>
                    {lines.map((l, i) => (
                      <p key={i} className="text-sm truncate" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{l}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
