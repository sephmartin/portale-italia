import ModulePage from "../components/ModulePage";
function CreditCardIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
export default function PagoPAPage() {
  const pendingPayments = [
    { id: "PA-2026-0041", ente: "Comune di Roma", desc: "TARI 2026 — Prima rata", amount: "€ 342,00", scadenza: "2026-05-31", urgent: false },
    { id: "PA-2026-0038", ente: "Motorizzazione Civile", desc: "Bollo auto Targa AA123BB", amount: "€ 270,00", scadenza: "2026-04-30", urgent: true },
  ];
  return (
    <ModulePage
      id="pagopa" name="PagoPA" tagline="Il sistema di pagamento della Pubblica Amministrazione italiana"
      color="var(--color-pagopa)" colorHex="#0050a0" darkHex="#00245a" bg="var(--color-pagopa-light)" icon={CreditCardIcon}
      stats={[{ value: "2", label: "pagamenti pendenti" }, { value: "€ 612", label: "totale da pagare" }, { value: "€ 412", label: "pagato nel 2026" }]}
      services={[
        { icon: "🏛️", label: "Cerca Ente Pubblico", desc: "Paga qualsiasi ente: comuni, università, ASL, ministeri" },
        { icon: "🚗", label: "Paga Multa Stradale", desc: "Inserisci il codice avviso sul verbale. Sconto 30% entro 60 giorni.", badge: "Sconto 30%", badgeColor: "#1a5c14" },
        { icon: "🎓", label: "Tasse Universitarie", desc: "Paga rate di iscrizione, tasse e contributi al tuo ateneo" },
        { icon: "🏫", label: "Retta Scolastica / Mensa", desc: "Pagamento mense, gite, libri e servizi scolastici comunali" },
        { icon: "🏠", label: "Tributi Comunali", desc: "IMU, TARI, TOSAP e altri tributi comunali in un click" },
        { icon: "💊", label: "Ticket Sanitario", desc: "Paga il ticket per visite, esami e farmaci tramite PagoPA" },
      ]}
    >
      {/* Pending payments */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          Pagamenti in scadenza
        </p>
        <div className="space-y-3">
          {pendingPayments.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border card-hover"
              style={{ background: "var(--color-surface)", borderColor: p.urgent ? "var(--color-auto)" : "var(--color-border)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{p.desc}</p>
                  {p.urgent && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--color-auto-light)", color: "var(--color-auto)", fontFamily: "var(--font-body)" }}>In scadenza</span>}
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{p.ente} · Scade {new Date(p.scadenza).toLocaleDateString("it-IT")}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--color-pagopa)" }}>{p.amount}</p>
                <button className="mt-1 text-xs font-semibold px-3 py-1 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: "var(--color-pagopa)", color: "white", fontFamily: "var(--font-body)" }}>
                  Paga ora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModulePage>
  );
}
