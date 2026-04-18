import { useState, useRef, useEffect, useCallback } from "react";

interface Msg { role: "user" | "assistant"; content: string; action?: { label: string; url: string }; module?: string; }

// ─── Knowledge base client-side ─────────────────────────────────────────────
const KB: Record<string, { response: string; module: string; action?: { label: string; url: string } }> = {
  // INPS
  "pensione": { response: "Per la domanda di pensione accedi al modulo INPS. Requisiti 2026: 67 anni (vecchiaia) o 42 anni e 10 mesi di contributi (anticipata). Puoi fare la simulazione nel tuo Fascicolo INPS.", module: "inps", action: { label: "Vai a INPS → Pensione", url: "/#/inps/pensione" } },
  "naspi": { response: "La NASpI spetta ai lavoratori dipendenti disoccupati involontari. Dura fino a metà delle settimane contributive degli ultimi 4 anni. Presentala entro 68 giorni dalla cessazione.", module: "inps", action: { label: "Vai a INPS → NASpI", url: "/#/inps/naspi" } },
  "isee": { response: "L'ISEE si calcola presentando la DSU (Dichiarazione Sostitutiva Unica). La puoi fare online sul Portale INPS o tramite CAF. L'ISEE 2026 è valido fino al 31 dicembre.", module: "inps", action: { label: "Calcola ISEE", url: "/#/inps/isee" } },
  "contributi": { response: "Il tuo estratto conto contributivo è nel Fascicolo Previdenziale INPS. Trovi tutti gli anni lavorativi, i periodi di disoccupazione e le proiezioni pensionistiche.", module: "inps", action: { label: "Fascicolo Previdenziale", url: "/#/inps/fascicolo" } },
  "bonus": { response: "INPS gestisce: Assegno Unico Universale, Bonus Asilo Nido, Bonus Mamme, Bonus Psicologo, ADI. Vai al modulo INPS per vedere quelli a cui hai diritto.", module: "inps", action: { label: "Tutti i bonus INPS", url: "/#/inps/bonus" } },
  // Agenzia Entrate
  "730": { response: "Il modello 730/2026 puoi presentarlo online tramite il precompilato nell'area riservata. Scadenza: 30 settembre. I dati sono già pre-caricati con CU, interessi, spese sanitarie.", module: "entrate", action: { label: "730 Precompilato", url: "/#/entrate/730" } },
  "f24": { response: "Puoi pagare l'F24 online tramite il servizio F24 Web dell'Agenzia Entrate, bonifico bancario o app bancarie. Il codice tributo identifica il tipo di pagamento.", module: "entrate", action: { label: "Paga F24", url: "/#/entrate/f24" } },
  "visura": { response: "Le visure catastali e ipotecarie sono disponibili nell'area 'Catasto e Cartografia' dell'Agenzia Entrate. Puoi visualizzarle gratuitamente con SPID.", module: "entrate", action: { label: "Visura Catastale", url: "/#/entrate/catasto" } },
  "partita iva": { response: "Per aprire la Partita IVA compila il modello AA9/12 (persone fisiche) o AA7/10 (enti/società). Puoi farlo online in Fisconline. L'apertura è gratuita e immediata.", module: "entrate", action: { label: "Apri Partita IVA", url: "/#/entrate/partita-iva" } },
  "rimborso": { response: "Il rimborso fiscale viene erogato dall'Agenzia Entrate o direttamente dal sostituto d'imposta (datore di lavoro). Puoi verificare lo stato nel tuo cassetto fiscale.", module: "entrate", action: { label: "Stato rimborsi", url: "/#/entrate/rimborsi" } },
  "imu": { response: "L'IMU si paga entro il 16 giugno (acconto) e il 16 dicembre (saldo). Si calcola su rendita catastale × coefficiente × aliquota comunale. Puoi pagare con F24.", module: "entrate", action: { label: "Calcola IMU", url: "/#/entrate/imu" } },
  "iva": { response: "Le dichiarazioni IVA si presentano entro il 30 aprile. La liquidazione è mensile o trimestrale. Puoi inviare il file telematico tramite Fisconline o un intermediario.", module: "entrate", action: { label: "Area IVA", url: "/#/entrate/iva" } },
  // PagoPA
  "pagamento": { response: "Con PagoPA puoi pagare qualsiasi ente pubblico: tasse, multe, rette scolastiche, bollette PA, tributi comunali. Accedi con SPID e cerca l'ente.", module: "pagopa", action: { label: "Vai a PagoPA", url: "/#/pagopa" } },
  "multa": { response: "Le multe stradali si pagano tramite PagoPA inserendo il codice avviso sul verbale. Puoi pagarle entro 60 giorni con sconto del 30%.", module: "pagopa", action: { label: "Paga Multa", url: "/#/pagopa/multa" } },
  "tassa scolastica": { response: "Rette scolastiche, tasse universitarie e mense possono essere pagate tramite PagoPA. Cerca il tuo istituto nel portale.", module: "pagopa", action: { label: "Paga Scuola/Università", url: "/#/pagopa/istruzione" } },
  // ANPR
  "certificato": { response: "Puoi scaricare gratuitamente i certificati anagrafici (residenza, stato civile, nascita, cittadinanza) dall'ANPR online senza andare in comune.", module: "anpr", action: { label: "Scarica Certificato", url: "/#/anpr/certificati" } },
  "residenza": { response: "Il cambio di residenza si dichiara online al comune di destinazione attraverso il portale ANPR. Puoi farlo con SPID senza recarti allo sportello.", module: "anpr", action: { label: "Cambio Residenza", url: "/#/anpr/residenza" } },
  "stato civile": { response: "I certificati di stato civile (matrimonio, nascita, morte) sono disponibili in ANPR. Se il tuo comune è iscritto puoi scaricarli subito in digitale.", module: "anpr", action: { label: "Stato Civile", url: "/#/anpr/stato-civile" } },
  // Fascicolo Sanitario
  "ricetta": { response: "Le ricette mediche sono nel Fascicolo Sanitario Elettronico. Le ricette dematerializzate sono accessibili con il codice fiscale + numero NRE presso le farmacie.", module: "salute", action: { label: "Fascicolo Sanitario", url: "/#/salute/fascicolo" } },
  "esenzione": { response: "Le esenzioni ticket sanitario (reddito, patologia) si richiedono alla ASL o tramite il Fascicolo Sanitario Elettronico della tua regione.", module: "salute", action: { label: "Esenzioni Ticket", url: "/#/salute/esenzioni" } },
  "referto": { response: "I referti di esami e visite sono nel Fascicolo Sanitario Elettronico. Puoi accedervi con SPID e condividerli con i tuoi medici.", module: "salute", action: { label: "Referti Online", url: "/#/salute/referti" } },
  // Patente/Auto
  "bollo": { response: "Il bollo auto si paga ogni anno alla scadenza. Puoi pagarlo con PagoPA, in tabaccheria, online sul portale ACI o sul Portale dell'Automobilista.", module: "auto", action: { label: "Paga Bollo Auto", url: "/#/auto/bollo" } },
  "patente": { response: "Per il rinnovo della patente prenota la visita medica all'UMC o dalla tua ASL. Per la conversione patente straniera rivolgiti alla Motorizzazione Civile.", module: "auto", action: { label: "Portale Automobilista", url: "/#/auto/patente" } },
  "revisione": { response: "La revisione auto è obbligatoria ogni 4 anni per le auto nuove, poi ogni 2 anni. Prenota presso un centro autorizzato MIT o officina convenzionata.", module: "auto", action: { label: "Revisione Veicolo", url: "/#/auto/revisione" } },
};

function getAgentResponse(message: string, module?: string) {
  const lower = message.toLowerCase();
  for (const [kw, data] of Object.entries(KB)) {
    if (lower.includes(kw) && (!module || module === "general" || data.module === module || module === data.module)) {
      return data;
    }
  }
  const hints: Record<string, string> = {
    inps: "INPS → pensione, NASpI, ISEE, contributi, bonus",
    entrate: "Entrate → 730, F24, visura, partita IVA, rimborsi, IMU",
    pagopa: "PagoPA → pagamenti PA, multe, tasse scolastiche",
    anpr: "ANPR → certificati, residenza, stato civile",
    salute: "Salute → ricette, referti, esenzioni ticket",
    auto: "Auto → bollo, patente, revisione",
  };
  const hint = module && hints[module]
    ? `Sono l'assistente ${module.toUpperCase()}. Posso aiutarti con: ${hints[module]}.`
    : `Sono l'assistente CittadinoOS. Posso aiutarti con servizi di INPS, Agenzia delle Entrate, PagoPA, ANPR, Fascicolo Sanitario e molto altro.`;
  return { response: hint, module: module || "general" };
}

const MODULE_SUGGESTIONS: Record<string, string[]> = {
  general: ["Voglio fare il 730", "Come pago il bollo auto?", "Scarica certificato di residenza", "Stato del mio rimborso IRPEF"],
  inps: ["Quanto prenderò di pensione?", "Come richiedo la NASpI?", "Calcola il mio ISEE", "Mostra i miei contributi"],
  entrate: ["730 precompilato", "Paga F24", "Visura catastale", "Apri Partita IVA"],
  pagopa: ["Paga una multa", "Bollo auto in scadenza", "Tassa universitaria", "Tutti i pagamenti pendenti"],
  anpr: ["Certificato di residenza", "Cambio di residenza", "Certificato di nascita", "Stato civile"],
  salute: ["Vedi i miei referti", "Rinnova ricetta medica", "Esenzione ticket", "Prenota visita CUP"],
  auto: ["Scadenza bollo auto", "Rinnova patente", "Prenota revisione", "Passaggio di proprietà"],
};

export default function AgentWidget({ module = "general", accent = "var(--color-brand)" }: { module?: string; accent?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechOk] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setMsgs(p => [...p, { role: "user", content: text }]);
    setInput(""); setLoading(true);
    // Simula breve latenza per UX naturale
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
    const data = getAgentResponse(text, module);
    setMsgs(p => [...p, { role: "assistant", content: data.response, action: (data as any).action, module: data.module }]);
    setLoading(false);
  }, [module]);

  const startListen = useCallback(() => {
    if (!speechOk) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR(); r.lang = "it-IT"; r.continuous = false; r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); send(t); };
    r.start(); recRef.current = r; setOpen(true);
  }, [speechOk, send]);

  const suggestions = MODULE_SUGGESTIONS[module] || MODULE_SUGGESTIONS.general;

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border text-left group hover:shadow-md transition-all"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        data-testid="agent-open-btn"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent, opacity: 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Chiedi all'assistente o cerca un servizio...
        </span>
        {speechOk && (
          <button onClick={e => { e.stopPropagation(); startListen(); }}
            className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-80"
            style={{ background: accent }} aria-label="Parla"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden scale-in" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-lg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)", background: accent }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Assistente CittadinoOS</p>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-300" /><p className="text-xs text-white/60">Online</p></div>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1 rounded-md" aria-label="Chiudi">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "280px", minHeight: msgs.length > 0 ? "160px" : "0" }}>
        {msgs.length === 0 && (
          <div className="text-center py-2">
            <p className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Ciao! Chiedimi qualsiasi cosa sui servizi PA italiani.
            </p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex fade-in ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[78%] px-3 py-2 rounded-xl text-sm"
              style={m.role === "user"
                ? { background: accent, color: "white", borderBottomRightRadius: "4px" }
                : { background: "var(--color-surface-raised, var(--color-bg))", color: "var(--color-text)", borderBottomLeftRadius: "4px", border: "1px solid var(--color-border)" }
              }>
              <p style={{ fontFamily: "var(--font-body)", lineHeight: 1.55 }}>{m.content}</p>
              {m.action && (
                <a href={m.action.url} className="mt-1.5 flex items-center gap-1 text-xs font-semibold hover:underline underline-offset-2"
                  style={{ color: m.role === "user" ? "rgba(255,255,255,0.8)" : accent }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  {m.action.label}
                </a>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2.5 rounded-xl border" style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: accent }} />
                <div className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: accent }} />
                <div className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: accent }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {msgs.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)}
              className="px-2.5 py-1 rounded-full text-xs font-medium border hover:border-[var(--color-brand)] transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Scrivi o parla..." className="flex-1 bg-transparent text-sm outline-none"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
            data-testid="agent-input" />
          {speechOk && (
            <button onClick={listening ? () => recRef.current?.stop() : startListen}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: listening ? "#ef4444" : "var(--color-brand-light)", color: listening ? "white" : accent }}
              aria-label="Mic">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-30"
            style={{ background: accent, color: "white" }} aria-label="Invia" data-testid="agent-send">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
