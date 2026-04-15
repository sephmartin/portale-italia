import ModulePage from "../components/ModulePage";
function HeartIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
export default function SalutePage() {
  const referti = [
    { esame: "Emocromo completo", data: "22/03/2026", medico: "Dr. Bianchi", stato: "Nuovo" },
    { esame: "ECG a riposo", data: "10/02/2026", medico: "Dr. Ferrara", stato: "Letto" },
    { esame: "Rx Torace", data: "15/01/2026", medico: "Dr. Conti", stato: "Letto" },
  ];
  return (
    <ModulePage
      id="salute" name="Fascicolo Sanitario" tagline="Fascicolo Sanitario Elettronico regionale"
      color="var(--color-salute)" colorHex="#6a1a7a" darkHex="#350a3d" bg="var(--color-salute-light)" icon={HeartIcon}
      stats={[{ value: "1", label: "referto nuovo" }, { value: "E01", label: "esenzione attiva" }, { value: "0", label: "ricette attive" }]}
      services={[
        { icon: "🧾", label: "Referti Online", desc: "Visualizza e scarica referti di esami e visite specialistiche", badge: "1 nuovo", badgeColor: "#ef4444" },
        { icon: "💊", label: "Ricette Dematerializzate", desc: "Accedi alle tue prescrizioni mediche con CF + NRE" },
        { icon: "🏥", label: "Prenotazione CUP", desc: "Prenota visite ed esami nelle strutture pubbliche e convenzionate" },
        { icon: "🎫", label: "Esenzione Ticket", desc: "Richiedi o verifica le esenzioni per reddito o patologia" },
        { icon: "💉", label: "Vaccinazioni", desc: "Libretto vaccinale digitale e prenotazione vaccini" },
        { icon: "🩺", label: "Medico di Medicina Generale", desc: "Cambia il tuo MMG online tramite il portale regionale" },
      ]}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>Ultimi referti</p>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
                {["Esame / Visita", "Data", "Medico", "Stato", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referti.map((r, i) => (
                <tr key={r.esame} style={{ background: i % 2 === 0 ? "var(--color-surface)" : "var(--color-bg)", borderBottom: i < referti.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <td className="px-4 py-3 font-medium text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>{r.esame}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>{r.data}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>{r.medico}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: r.stato === "Nuovo" ? "rgba(239,68,68,0.08)" : "var(--color-bg)", color: r.stato === "Nuovo" ? "#ef4444" : "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
                      {r.stato}
                    </span>
                  </td>
                  <td className="px-4 py-3"><button className="text-xs font-semibold hover:underline" style={{ color: "var(--color-salute)", fontFamily: "var(--font-body)" }}>Visualizza</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
