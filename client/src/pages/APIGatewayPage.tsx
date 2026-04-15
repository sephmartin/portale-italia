import { useState } from "react";

const ENDPOINTS = [
  {
    method: "POST", path: "/api/v1/agent/query", module: "Tutti",
    desc: "Query cross-piattaforma all'assistente AI. Specifica il modulo per risposta contestuale (inps, entrate, pagopa, anpr, salute, auto). Ideale per agenti AI e chatbot.",
    body: `{ "message": "Come pago il bollo auto?", "sessionId": "ses_abc123", "module": "auto" }`,
    response: `{ "response": "Il bollo auto si paga ogni anno...", "action": { "label": "Paga Bollo Auto", "url": "/auto/bollo" }, "module": "auto", "messageId": 17 }`,
    auth: false,
  },
  {
    method: "GET", path: "/api/v1/citizen/profile", module: "Tutti",
    desc: "Profilo aggregato del cittadino con summary di tutti i moduli: INPS, Entrate, PagoPA, ANPR, Salute, Auto. Richiede autenticazione SPID/CIE.",
    body: null,
    response: `{ "name": "Mario Rossi", "cf": "RSSMRA80A01H501U", "spid": true, "summary": { "inps": { "contributions": 18 }, "entrate": { "pending730": true }, "pagopa": { "totalPending": 612.00 }, ... } }`,
    auth: true,
  },
  {
    method: "GET", path: "/api/v1/notifications", module: "Tutti",
    desc: "Feed aggregato di tutte le notifiche PA del cittadino, ordinate per priorità. Include avvisi da INPS, Agenzia Entrate, PagoPA, ANPR, Salute e Automobilista.",
    body: null,
    response: `{ "notifications": [{ "id": 1, "module": "entrate", "title": "730 disponibile", "priority": "high", "read": false, "date": "2026-04-10" }] }`,
    auth: true,
  },
  {
    method: "GET", path: "/api/v1/services", module: "Tutti",
    desc: "Catalogo completo di tutti i moduli e servizi disponibili nella piattaforma CittadinoOS. Utile per costruire navigatori o knowledge base per agenti AI.",
    body: null,
    response: `{ "modules": [{ "id": "inps", "name": "INPS", "color": "#1a3a6b", "services": ["Pensione", "NASpI", "ISEE", ...] }] }`,
    auth: false,
  },
  {
    method: "POST", path: "/api/v1/inps/domanda", module: "INPS",
    desc: "Invia una domanda previdenziale INPS (pensione, NASpI, ISEE, Assegno Unico, Bonus Asilo Nido, Invalidità, Maternità). Richiede autenticazione.",
    body: `{ "tipo": "naspi", "dataCessazione": "2026-03-31", "motivazione": "licenziamento", "iban": "IT60X..." }`,
    response: `{ "praticaId": "NASpI-2026-001234", "stato": "Ricevuta", "stimaRisposta": "30 giorni" }`,
    auth: true,
  },
  {
    method: "POST", path: "/api/v1/entrate/f24", module: "Entrate",
    desc: "Genera e invia un F24 telematico. Supporta tutti i codici tributo. Il pagamento viene effettuato tramite addebito SDD o avviso PagoPA.",
    body: `{ "codice_tributo": "1001", "anno": "2026", "importo": 1250.00, "iban_addebito": "IT60X..." }`,
    response: `{ "protocollo": "F24-2026-00987654", "stato": "Inviato", "importo": 1250.00, "dataVersamento": "2026-06-30" }`,
    auth: true,
  },
  {
    method: "POST", path: "/api/v1/pagopa/pay", module: "PagoPA",
    desc: "Avvia il pagamento di un avviso PagoPA tramite codice avviso IUV. Restituisce redirect URL al checkout PagoPA oppure esito diretto se già configurato.",
    body: `{ "iuv": "301000000000000001", "cf_ente": "80016350821", "importo": 342.00 }`,
    response: `{ "sessionId": "PGPA-2026-0001", "checkoutUrl": "https://checkout.pagopa.it/...", "scadenza": "2026-05-31" }`,
    auth: true,
  },
  {
    method: "GET", path: "/api/v1/anpr/certificates", module: "ANPR",
    desc: "Scarica certificati anagrafici del cittadino: residenza, stato di famiglia, nascita, matrimonio, cittadinanza. Firma digitale inclusa nel PDF.",
    body: null,
    response: `{ "tipo": "residenza", "pdfBase64": "JVBERi0...", "dataEmissione": "2026-04-13", "firmato": true }`,
    auth: true,
  },
  {
    method: "WebSocket", path: "/ws/v1/notify/{cf}", module: "Tutti",
    desc: "Stream real-time delle notifiche aggregate da tutti i moduli PA. Emette eventi tipizzati per modulo con priorità. Richiede Bearer token.",
    body: `// Connessione\nconst ws = new WebSocket('wss://api.cittadino.gov.it/ws/v1/notify/RSSMRA80A01H501U');\nws.on('message', data => console.log(JSON.parse(data)));`,
    response: `{ "type": "notification", "module": "entrate", "priority": "high", "title": "730 disponibile", "timestamp": 1744542000 }`,
    auth: true,
  },
];

const METHOD_STYLE: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#e8f5ee", text: "#1a5c14" },
  POST: { bg: "#e8eef8", text: "#1a3a6b" },
  WebSocket: { bg: "#f5e6f8", text: "#6a1a7a" },
};

const MODULE_COLORS: Record<string, string> = {
  "Tutti": "var(--color-brand)", INPS: "var(--color-inps)", Entrate: "var(--color-entrate)",
  PagoPA: "var(--color-pagopa)", ANPR: "var(--color-anpr)",
};

function EndpointRow({ ep }: { ep: typeof ENDPOINTS[0] }) {
  const [open, setOpen] = useState(false);
  const ms = METHOD_STYLE[ep.method] || METHOD_STYLE.GET;
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-bg)] transition-colors text-left"
        data-testid={`ep-${ep.path}`}>
        <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ ...ms, fontFamily: "var(--font-mono)" }}>{ep.method}</span>
        <code className="text-sm flex-1 truncate" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>{ep.path}</code>
        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${MODULE_COLORS[ep.module]}18`, color: MODULE_COLORS[ep.module] || "var(--color-brand)", fontFamily: "var(--font-body)" }}>{ep.module}</span>
        {ep.auth && <span className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: "var(--color-text-faint)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Auth
        </span>}
        <svg style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{ep.desc}</p>
          <div className="grid md:grid-cols-2 gap-3">
            {ep.body && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-text-faint)" }}>Request</p>
                <pre className="text-xs p-3 rounded-lg overflow-x-auto" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)", color: "var(--color-text)", lineHeight: 1.6 }}>{ep.body}</pre>
              </div>
            )}
            <div className={ep.body ? "" : "md:col-span-2"}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-text-faint)" }}>Response</p>
              <pre className="text-xs p-3 rounded-lg overflow-x-auto" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)", color: "var(--color-text)", lineHeight: 1.6 }}>{ep.response}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function APIGatewayPage() {
  const [filter, setFilter] = useState("Tutti");
  const modules = ["Tutti", "INPS", "Entrate", "PagoPA", "ANPR"];
  const filtered = ENDPOINTS.filter(e => filter === "Tutti" || e.module === filter);

  return (
    <div className="space-y-7 fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-3" style={{ borderColor: "var(--color-brand)", background: "var(--color-brand-light)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <span className="text-xs font-semibold" style={{ color: "var(--color-brand)", fontFamily: "var(--font-body)" }}>REST API v1 · WebSocket · Open</span>
        </div>
        <h1 className="font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>API Gateway Unificato</h1>
        <p className="mt-2 text-sm max-w-2xl" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Un unico gateway per accedere a tutti i servizi PA italiani. Integra INPS, Agenzia Entrate, PagoPA, ANPR e molto altro in qualsiasi app, agente AI o workflow.
        </p>
      </div>

      {/* Base URL */}
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-faint)" }}>Base URL</p>
          <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-brand)", fontSize: "var(--text-sm)" }}>https://api.cittadino.gov.it/</code>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-faint)" }}>Auth</p>
          <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>Bearer &lt;SPID_token&gt;</code>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-faint)" }}>Rate Limit</p>
          <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>1000 req/min</code>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-text-faint)" }}>Agent Endpoint</p>
          <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-entrate)", fontSize: "var(--text-sm)" }}>POST /api/v1/agent/query</code>
        </div>
      </div>

      {/* Module filter */}
      <div className="flex flex-wrap gap-2">
        {modules.map(m => (
          <button key={m} onClick={() => setFilter(m)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={{
              background: filter === m ? (MODULE_COLORS[m] || "var(--color-brand)") : "var(--color-surface)",
              color: filter === m ? "white" : "var(--color-text-muted)",
              borderColor: filter === m ? (MODULE_COLORS[m] || "var(--color-brand)") : "var(--color-border)",
              fontFamily: "var(--font-body)",
            }}>
            {m}
          </button>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-2">
        {filtered.map((ep, i) => <EndpointRow key={i} ep={ep} />)}
      </div>

      {/* Integrations */}
      <div>
        <h2 className="font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Integrazioni rapide</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          {[
            { icon: "⚡", name: "n8n", code: "HTTP POST /api/v1/agent/query" },
            { icon: "🔗", name: "Make", code: "HTTP Module + JSON body" },
            { icon: "🤖", name: "AI Agent", code: "Tool: POST /agent/query" },
            { icon: "📱", name: "Mobile App", code: "REST + WebSocket notify" },
          ].map(i => (
            <div key={i.name} className="p-4 rounded-xl border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <span className="text-2xl block mb-2">{i.icon}</span>
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{i.name}</p>
              <code className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>{i.code}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
