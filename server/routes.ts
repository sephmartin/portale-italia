import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

// ─── Knowledge base cross-piattaforma ─────────────────────────────────────────
const KB: Record<string, { response: string; module: string; action?: { label: string; url: string } }> = {
  // INPS
  "pensione": { response: "Per la domanda di pensione accedi al modulo INPS. Requisiti 2026: 67 anni (vecchiaia) o 42 anni e 10 mesi di contributi (anticipata). Puoi fare la simulazione nel tuo Fascicolo INPS.", module: "inps", action: { label: "Vai a INPS → Pensione", url: "#/inps/pensione" } },
  "naspi": { response: "La NASpI spetta ai lavoratori dipendenti disoccupati involontari. Dura fino a metà delle settimane contributive degli ultimi 4 anni. Presentala entro 68 giorni dalla cessazione.", module: "inps", action: { label: "Vai a INPS → NASpI", url: "#/inps/naspi" } },
  "isee": { response: "L'ISEE si calcola presentando la DSU (Dichiarazione Sostitutiva Unica). La puoi fare online sul Portale INPS o tramite CAF. L'ISEE 2026 è valido fino al 31 dicembre.", module: "inps", action: { label: "Calcola ISEE", url: "#/inps/isee" } },
  "contributi": { response: "Il tuo estratto conto contributivo è nel Fascicolo Previdenziale INPS. Trovi tutti gli anni lavorativi, i periodi di disoccupazione e le proiezioni pensionistiche.", module: "inps", action: { label: "Fascicolo Previdenziale", url: "#/inps/fascicolo" } },
  "bonus": { response: "INPS gestisce: Assegno Unico Universale, Bonus Asilo Nido, Bonus Mamme, Bonus Psicologo, ADI. Vai al modulo INPS per vedere quelli a cui hai diritto.", module: "inps", action: { label: "Tutti i bonus INPS", url: "#/inps/bonus" } },
  // Agenzia Entrate
  "730": { response: "Il modello 730/2026 puoi presentarlo online tramite il precompilato nell'area riservata. Scadenza: 30 settembre. I dati sono già pre-caricati con CU, interessi, spese sanitarie.", module: "entrate", action: { label: "730 Precompilato", url: "#/entrate/730" } },
  "f24": { response: "Puoi pagare l'F24 online tramite il servizio F24 Web dell'Agenzia Entrate, bonifico bancario o app bancarie. Il codice tributo identifica il tipo di pagamento.", module: "entrate", action: { label: "Paga F24", url: "#/entrate/f24" } },
  "visura": { response: "Le visure catastali e ipotecarie sono disponibili nell'area 'Catasto e Cartografia' dell'Agenzia Entrate. Puoi visualizzarle gratuitamente con SPID.", module: "entrate", action: { label: "Visura Catastale", url: "#/entrate/catasto" } },
  "partita iva": { response: "Per aprire la Partita IVA compila il modello AA9/12 (persone fisiche) o AA7/10 (enti/società). Puoi farlo online in Fisconline. L'apertura è gratuita e immediata.", module: "entrate", action: { label: "Apri Partita IVA", url: "#/entrate/partita-iva" } },
  "rimborso": { response: "Il rimborso fiscale viene erogato dall'Agenzia Entrate o direttamente dal sostituto d'imposta (datore di lavoro). Puoi verificare lo stato nel tuo cassetto fiscale.", module: "entrate", action: { label: "Stato rimborsi", url: "#/entrate/rimborsi" } },
  "imu": { response: "L'IMU si paga entro il 16 giugno (acconto) e il 16 dicembre (saldo). Si calcola su rendita catastale × coefficiente × aliquota comunale. Puoi pagare con F24.", module: "entrate", action: { label: "Calcola IMU", url: "#/entrate/imu" } },
  "iva": { response: "Le dichiarazioni IVA si presentano entro il 30 aprile. La liquidazione è mensile o trimestrale. Puoi inviare il file telematico tramite Fisconline o un intermediario.", module: "entrate", action: { label: "Area IVA", url: "#/entrate/iva" } },
  // PagoPA
  "pagamento": { response: "Con PagoPA puoi pagare qualsiasi ente pubblico: tasse, multe, rette scolastiche, bollette PA, tributi comunali. Accedi con SPID e cerca l'ente.", module: "pagopa", action: { label: "Vai a PagoPA", url: "#/pagopa" } },
  "multa": { response: "Le multe stradali si pagano tramite PagoPA inserendo il codice avviso sul verbale. Puoi pagarle entro 60 giorni con sconto del 30%.", module: "pagopa", action: { label: "Paga Multa", url: "#/pagopa/multa" } },
  "tassa scolastica": { response: "Rette scolastiche, tasse universitarie e mense possono essere pagate tramite PagoPA. Cerca il tuo istituto nel portale.", module: "pagopa", action: { label: "Paga Scuola/Università", url: "#/pagopa/istruzione" } },
  // ANPR
  "certificato": { response: "Puoi scaricare gratuitamente i certificati anagrafici (residenza, stato civile, nascita, cittadinanza) dall'ANPR online senza andare in comune.", module: "anpr", action: { label: "Scarica Certificato", url: "#/anpr/certificati" } },
  "residenza": { response: "Il cambio di residenza si dichiara online al comune di destinazione attraverso il portale ANPR. Puoi farlo con SPID senza recarti allo sportello.", module: "anpr", action: { label: "Cambio Residenza", url: "#/anpr/residenza" } },
  "stato civile": { response: "I certificati di stato civile (matrimonio, nascita, morte) sono disponibili in ANPR. Se il tuo comune è iscritto puoi scaricarli subito in digitale.", module: "anpr", action: { label: "Stato Civile", url: "#/anpr/stato-civile" } },
  // Fascicolo Sanitario
  "ricetta": { response: "Le ricette mediche sono nel Fascicolo Sanitario Elettronico. Le ricette dematerializzate sono accessibili con il codice fiscale + numero NRE presso le farmacie.", module: "salute", action: { label: "Fascicolo Sanitario", url: "#/salute/fascicolo" } },
  "esenzione": { response: "Le esenzioni ticket sanitario (reddito, patologia) si richiedono alla ASL o tramite il Fascicolo Sanitario Elettronico della tua regione.", module: "salute", action: { label: "Esenzioni Ticket", url: "#/salute/esenzioni" } },
  "referto": { response: "I referti di esami e visite sono nel Fascicolo Sanitario Elettronico. Puoi accedervi con SPID e condividerli con i tuoi medici.", module: "salute", action: { label: "Referti Online", url: "#/salute/referti" } },
  // Patente/Auto
  "bollo": { response: "Il bollo auto si paga ogni anno alla scadenza. Puoi pagarlo con PagoPA, in tabaccheria, online sul portale ACI o sul Portale dell'Automobilista.", module: "auto", action: { label: "Paga Bollo Auto", url: "#/auto/bollo" } },
  "patente": { response: "Per il rinnovo della patente prenota la visita medica all'UMC o dalla tua ASL. Per la conversione patente straniera rivolgiti alla Motorizzazione Civile.", module: "auto", action: { label: "Portale Automobilista", url: "#/auto/patente" } },
  "revisione": { response: "La revisione auto è obbligatoria ogni 4 anni per le auto nuove, poi ogni 2 anni. Prenota presso un centro autorizzato MIT o officina convenzionata.", module: "auto", action: { label: "Revisione Veicolo", url: "#/auto/revisione" } },
};

function getAgentResponse(message: string, module?: string) {
  const lower = message.toLowerCase();
  for (const [kw, data] of Object.entries(KB)) {
    if (lower.includes(kw) && (!module || module === "general" || data.module === module || module === data.module)) {
      return data;
    }
  }
  // Fallback intelligente
  const hints: Record<string, string> = {
    inps: "INPS → pensione, NASpI, ISEE, contributi, bonus",
    entrate: "Entrate → 730, F24, visura, partita IVA, rimborsi, IMU",
    pagopa: "PagoPA → pagamenti PA, multe, tasse scolastiche",
    anpr: "ANPR → certificati, residenza, stato civile",
    salute: "Salute → ricette, referti, esenzioni ticket",
    auto: "Auto → bollo, patente, revisione",
  };
  const hint = module && hints[module] ? `Sono l'assistente ${module.toUpperCase()}. Posso aiutarti con: ${hints[module]}.` : `Sono l'assistente CittadinoOS. Posso aiutarti con servizi di INPS, Agenzia delle Entrate, PagoPA, ANPR, Fascicolo Sanitario e molto altro.`;
  return { response: hint, module: module || "general" };
}

export function registerRoutes(httpServer: Server, app: Express) {
  app.post("/api/v1/agent/query", (req, res) => {
    const { message, sessionId, module } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: "message and sessionId required" });
    storage.addMessage({ sessionId, role: "user", content: message, module: module || "general", timestamp: Date.now() });
    const result = getAgentResponse(message, module);
    const reply = storage.addMessage({ sessionId, role: "assistant", content: result.response, module: result.module, timestamp: Date.now() });
    res.json({ response: result.response, action: (result as any).action || null, module: result.module, messageId: reply.id });
  });

  app.get("/api/v1/agent/history/:sessionId", (req, res) => {
    res.json({ messages: storage.getMessages(req.params.sessionId) });
  });

  // Catalogo servizi unificato
  app.get("/api/v1/services", (req, res) => {
    res.json({
      modules: [
        { id: "inps", name: "INPS", color: "#1a3a6b", icon: "shield", services: ["Pensione", "NASpI", "ISEE", "Contributi", "Assegno Unico", "Invalidità"] },
        { id: "entrate", name: "Agenzia Entrate", color: "#2d6a1f", icon: "file-text", services: ["730 Precompilato", "F24", "Visure Catastali", "Partita IVA", "Rimborsi", "IMU"] },
        { id: "pagopa", name: "PagoPA", color: "#0066cc", icon: "credit-card", services: ["Pagamenti PA", "Multe", "Tasse Scolastiche", "Tributi Comunali", "Bollo Auto"] },
        { id: "anpr", name: "ANPR", color: "#8b1a1a", icon: "users", services: ["Certificati Anagrafici", "Cambio Residenza", "Stato Civile", "Carte d'Identità"] },
        { id: "salute", name: "Fascicolo Sanitario", color: "#7b2d8b", icon: "heart", services: ["Referti Online", "Ricette", "Esenzioni Ticket", "Vaccinazioni", "Prenotazioni CUP"] },
        { id: "auto", name: "Portale Automobilista", color: "#c67c00", icon: "car", services: ["Bollo Auto", "Patente", "Revisione", "Proprietà Veicolo", "Targhe"] },
      ]
    });
  });

  // Notifiche aggregate
  app.get("/api/v1/notifications", (req, res) => {
    res.json({
      notifications: [
        { id: 1, module: "entrate", title: "730 Precompilato disponibile", body: "Il tuo 730/2026 è pronto per la revisione. Scadenza 30 settembre.", date: "2026-04-10", priority: "high", read: false },
        { id: 2, module: "inps", title: "Bonus Asilo Nido 2026 aperto", body: "Da oggi puoi richiedere il Bonus Asilo Nido. Importo max €3.000.", date: "2026-04-08", priority: "medium", read: false },
        { id: 3, module: "auto", title: "Bollo auto in scadenza", body: "Il tuo bollo auto scade il 30 aprile 2026. Paga ora con PagoPA.", date: "2026-04-05", priority: "high", read: false },
        { id: 4, module: "anpr", title: "Certificato residenza disponibile", body: "Il certificato di residenza aggiornato è disponibile per il download.", date: "2026-04-01", priority: "low", read: true },
        { id: 5, module: "salute", title: "Referto disponibile", body: "Il referto dell'esame del 22 marzo è ora disponibile nel Fascicolo Sanitario.", date: "2026-03-28", priority: "medium", read: true },
        { id: 6, module: "pagopa", title: "Pagamento IMU ricevuto", body: "Il pagamento IMU 2026 primo acconto di €412,00 è stato registrato.", date: "2026-03-15", priority: "low", read: true },
      ]
    });
  });

  // Profilo cittadino aggregato
  app.get("/api/v1/citizen/profile", (req, res) => {
    res.json({
      name: "Mario Rossi",
      cf: "RSSMRA80A01H501U",
      spid: true,
      cie: true,
      summary: {
        inps: { contributions: 18, nextPayment: null, activeDomande: 1 },
        entrate: { pending730: true, lastF24: "2026-02-16", pendingRimborso: 0 },
        pagopa: { pendingPayments: 2, totalPending: 612.00 },
        anpr: { residence: "Roma (RM)", lastCertificate: "2026-04-01" },
        salute: { unresolvedReferti: 1, activeEsenzioni: ["E01"] },
        auto: { vehicles: 1, bolloExpiry: "2026-04-30" },
      }
    });
  });
}
