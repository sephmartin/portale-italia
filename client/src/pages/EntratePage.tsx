import ModulePage from "../components/ModulePage";
function FileTextIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
export default function EntratePage() {
  return (
    <ModulePage
      id="entrate" name="Agenzia delle Entrate" tagline="Fisco, catasto e dichiarazioni tributarie"
      color="var(--color-entrate)" colorHex="#1a5c14" darkHex="#0a2d0a" bg="var(--color-entrate-light)" icon={FileTextIcon}
      stats={[{ value: "730", label: "pronto" }, { value: "€ 0", label: "rimborso atteso" }, { value: "16/02", label: "ultimo F24" }]}
      services={[
        { icon: "📄", label: "730 Precompilato 2026", desc: "Il tuo modello 730 è già caricato. Controlla, integra e invia entro il 30 settembre.", badge: "Disponibile", badgeColor: "#1a5c14" },
        { icon: "💳", label: "Pagamento F24", desc: "Paga imposte, contributi e tasse con F24 Web o F24 Editabile" },
        { icon: "🏠", label: "Visura Catastale", desc: "Consulta planimetrie e rendita catastale dei tuoi immobili gratuitamente" },
        { icon: "🏭", label: "Apri Partita IVA", desc: "Apertura online immediata e gratuita con modello AA9/12 o AA7/10" },
        { icon: "💰", label: "Stato Rimborsi", desc: "Verifica lo stato del rimborso IRPEF nel tuo cassetto fiscale" },
        { icon: "🏡", label: "IMU 2026", desc: "Calcola e paga l'IMU sugli immobili. Acconto: 16 giugno, Saldo: 16 dicembre" },
        { icon: "📊", label: "Dichiarazione IVA", desc: "Invio telematico della dichiarazione IVA annuale entro il 30 aprile" },
        { icon: "🔍", label: "Cassetto Fiscale", desc: "Storico pagamenti, dichiarazioni e atti tributari a tuo nome" },
        { icon: "📝", label: "Ravvedimento Operoso", desc: "Regolarizza tardivamente pagamenti e dichiarazioni con sanzioni ridotte" },
      ]}
      infoCards={[
        { title: "730 Precompilato — scadenze", items: ["Accettazione senza modifiche: 30 settembre", "Presentazione con modifiche: 30 settembre", "Modello Redditi PF: 15 ottobre", "Dati già caricati: CU, interessi mutuo, spese sanitarie (FSE)"] },
        { title: "Codici tributo F24 più usati", items: ["1001 — IRPEF acconto 1ª rata", "1002 — IRPEF acconto 2ª rata", "3918 — IMU abitazione principale", "6001 — IVA mensile gennaio", "1668 — Interessi da dilazione"] },
        { title: "Aliquote IRPEF 2026", items: ["0–28.000€ → 23%", "28.001–50.000€ → 35%", "Oltre 50.000€ → 43%", "Detrazioni lavoro dipendente fino a €1.955"] },
        { title: "Partita IVA — regimi", items: ["Regime forfettario: fino a €85.000 ricavi, imposta 5% (primi 5 anni) o 15%", "Regime ordinario: obbligatorio sopra €85.000 o con dipendenti", "Regime semplificato: per imprese sotto soglie fatturato"] },
      ]}
    />
  );
}
