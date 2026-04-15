import ModulePage from "../components/ModulePage";
function ShieldIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
export default function INPSPage() {
  return (
    <ModulePage
      id="inps" name="INPS" tagline="Istituto Nazionale della Previdenza Sociale"
      color="var(--color-inps)" colorHex="#1a3a6b" darkHex="#0d1e38" bg="var(--color-inps-light)" icon={ShieldIcon}
      stats={[{ value: "18", label: "anni contributi" }, { value: "2043", label: "pensione stimata" }, { value: "1", label: "domanda attiva" }]}
      services={[
        { icon: "🏦", label: "Domanda di Pensione", desc: "Simula e presenta domanda di pensione di vecchiaia o anticipata" },
        { icon: "📉", label: "NASpI", desc: "Indennità di disoccupazione per lavoratori dipendenti", badge: "Entro 68gg", badgeColor: "#ef4444" },
        { icon: "📊", label: "ISEE 2026", desc: "Calcola e ottieni l'attestazione ISEE per accedere ai bonus" },
        { icon: "👶", label: "Assegno Unico Universale", desc: "Sostegno mensile per famiglie con figli fino a 21 anni" },
        { icon: "🎁", label: "Bonus Asilo Nido", desc: "Contributo per rette asili nido fino a €3.000", badge: "Aperto", badgeColor: "#1a6b3a" },
        { icon: "♿", label: "Invalidità Civile", desc: "Riconoscimento e prestazioni per persone con disabilità" },
        { icon: "🤰", label: "Maternità e Paternità", desc: "Indennità per congedo parentale, maternità e paternità" },
        { icon: "📋", label: "Fascicolo Previdenziale", desc: "Estratto conto, storia lavorativa e proiezione pensionistica" },
        { icon: "💊", label: "Bonus Psicologo", desc: "Contributo per sedute di psicoterapia fino a €1.500" },
      ]}
      infoCards={[
        { title: "Pensione di vecchiaia 2026", items: ["Età: 67 anni", "Contributi minimi: 20 anni", "Domanda: almeno 3 mesi prima", "Finestra di uscita: primo giorno del mese successivo"] },
        { title: "Pensione anticipata 2026", items: ["Quota 103: 62 anni + 41 anni contributi", "Pensione anticipata ordinaria: 42 anni 10 mesi (uomini) / 41 anni 10 mesi (donne)", "Opzione Donna: 61 anni + 35 anni (con figli)"] },
        { title: "Contributi e aliquote", items: ["Lavoratori dipendenti: 33% (23.81% datore + 9.19% dipendente)", "Artigiani e commercianti: 24% sul reddito dichiarato", "Gestione Separata (collaboratori): 33.72%"] },
        { title: "Contatti INPS", items: ["Contact Center: 803 164 (gratuito fisso)", "Da cellulare: 06 164 164 (a pagamento)", "Lun–Ven 8:00–20:00 · Sab 8:00–14:00", "INPS Risponde: chiarimenti normativi"] },
      ]}
    />
  );
}
