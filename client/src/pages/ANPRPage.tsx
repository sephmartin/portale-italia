import ModulePage from "../components/ModulePage";
function UsersIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
export default function ANPRPage() {
  const certs = [
    { tipo: "Certificato di Residenza", data: "01/04/2026", stato: "Disponibile" },
    { tipo: "Stato di Famiglia", data: "15/03/2026", stato: "Disponibile" },
    { tipo: "Certificato di Nascita", data: "10/01/2026", stato: "Disponibile" },
  ];
  return (
    <ModulePage
      id="anpr" name="ANPR" tagline="Anagrafe Nazionale della Popolazione Residente"
      color="var(--color-anpr)" colorHex="#7a1a1a" darkHex="#3d0a0a" bg="var(--color-anpr-light)" icon={UsersIcon}
      stats={[{ value: "Roma (RM)", label: "Residenza" }, { value: "3", label: "certificati scaricati" }, { value: "✓", label: "Comune iscritto ANPR" }]}
      services={[
        { icon: "📃", label: "Certificato di Residenza", desc: "Download immediato, gratuito, con firma digitale valida", badge: "Gratuito", badgeColor: "#1a5c14" },
        { icon: "👨‍👩‍👧", label: "Stato di Famiglia", desc: "Composizione del nucleo familiare aggiornata" },
        { icon: "🎂", label: "Certificato di Nascita", desc: "Dati anagrafici ufficiali dal Registro di Stato Civile" },
        { icon: "💍", label: "Certificato di Matrimonio", desc: "Estratto dell'atto di matrimonio con apostille" },
        { icon: "🏠", label: "Cambio di Residenza", desc: "Dichiara il cambio online senza andare in comune" },
        { icon: "🆔", label: "Carta d'Identità Elettronica", desc: "Prenota il rinnovo CIE presso il tuo comune" },
      ]}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          I miei certificati
        </p>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
                {["Tipo", "Data", "Stato", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certs.map((c, i) => (
                <tr key={c.tipo} style={{ background: i % 2 === 0 ? "var(--color-surface)" : "var(--color-bg)", borderBottom: i < certs.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <td className="px-4 py-3 font-medium text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>{c.tipo}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>{c.data}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--color-entrate-light)", color: "var(--color-entrate)", fontFamily: "var(--font-body)" }}>{c.stato}</span></td>
                  <td className="px-4 py-3"><button className="text-xs font-semibold hover:underline" style={{ color: "var(--color-anpr)", fontFamily: "var(--font-body)" }}>Scarica PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
