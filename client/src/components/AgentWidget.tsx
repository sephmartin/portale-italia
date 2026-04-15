import { useState, useRef, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

interface Msg { role: "user" | "assistant"; content: string; action?: { label: string; url: string }; module?: string; }

const SESSION_ID = "cos_" + Math.random().toString(36).slice(2, 9);

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
    try {
      const data = await apiRequest("POST", "/api/v1/agent/query", { message: text, sessionId: SESSION_ID, module }).then(r => r.json());
      setMsgs(p => [...p, { role: "assistant", content: data.response, action: data.action, module: data.module }]);
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(data.response);
        u.lang = "it-IT"; u.rate = 1.05;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch { setMsgs(p => [...p, { role: "assistant", content: "Errore di connessione. Riprova." }]); }
    finally { setLoading(false); }
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
