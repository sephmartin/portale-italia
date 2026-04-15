import ModulePage from "../components/ModulePage";
function CarIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
}
export default function AutoPage() {
  return (
    <ModulePage
      id="auto" name="Portale Automobilista" tagline="Patente, bollo, revisione e proprietà veicoli"
      color="var(--color-auto)" colorHex="#8a5c00" darkHex="#422c00" bg="var(--color-auto-light)" icon={CarIcon}
      stats={[{ value: "1", label: "veicolo registrato" }, { value: "30/04", label: "bollo scade" }, { value: "A, B", label: "categorie patente" }]}
      services={[
        { icon: "🚗", label: "Bollo Auto 2026", desc: "Calcola e paga il bollo online. Scadenza: entro il mese successivo all'immatricolazione.", badge: "Scade 30/04", badgeColor: "#ef4444" },
        { icon: "🪪", label: "Rinnovo Patente", desc: "Prenota la visita medica per il rinnovo della patente di guida" },
        { icon: "🔧", label: "Prenotazione Revisione", desc: "Prenota la revisione obbligatoria ogni 2 anni presso officine convenzionate" },
        { icon: "📋", label: "Proprietà Veicolo", desc: "Verifica intestatario, fermi, ipoteche e storia del veicolo" },
        { icon: "🔄", label: "Passaggio di Proprietà", desc: "Trasferisci l'intestazione del veicolo online tramite Motorizzazione" },
        { icon: "🆘", label: "Sospensione Patente", desc: "Verifica lo stato della patente e i punti residui" },
      ]}
      infoCards={[
        { title: "Bollo auto — come funziona", items: ["Si paga ogni anno entro il mese successivo alla scadenza", "L'importo dipende da kW del motore e regione di residenza", "I veicoli ibridi/elettrici hanno esenzioni o sconti regionali", "Paga con PagoPA, in tabaccheria o home banking"] },
        { title: "Revisione obbligatoria", items: ["Prima revisione: 4 anni dall'immatricolazione", "Successiva: ogni 2 anni", "Veicoli commerciali: ogni anno", "Costo indicativo: €45–65 presso officina autorizzata"] },
      ]}
    />
  );
}
