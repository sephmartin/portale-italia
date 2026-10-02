import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

// Keyword map for intelligent, honest routing from the hero composer
const ROUTE_KEYWORDS: { route: string; keywords: string[] }[] = [
  {
    route: "/auto",
    keywords: ["bollo", "auto", "patente", "veicol", "revisione", "motorizzazione", "targa", "punti patente", "macchina", "guida"],
  },
  {
    route: "/anpr",
    keywords: ["residenza", "anpr", "certificat", "nascita", "famiglia", "stato civile", "matrimonio", "anagrafe", "documento", "carta identita"],
  },
  {
    route: "/entrate",
    keywords: ["730", "fiscale", "f24", "tasse", "irpef", "entrate", "iva", "catast", "rendita", "rimborso", "cassetto fiscale", "agenzia entrate", "dichiarazione"],
  },
  {
    route: "/inps",
    keywords: ["inps", "pension", "naspi", "isee", "disoccupazione", "contribut", "assegno unico", "maternita", "bonus", "previdenza", "pensione"],
  },
  {
    route: "/pagopa",
    keywords: ["pagopa", "paga", "multa", "tribut", "tari", "imu", "bollettin", "iuv", "bonifico", "scolastic", "mensa", "universita", "pagamento"],
  },
  {
    route: "/salute",
    keywords: ["salute", "sanit", "medic", "refert", "ricett", "cup", "esenzion", "ospedal", "visita", "fascicolo sanitario", "dottore", "esame"],
  },
  {
    route: "/api",
    keywords: ["api", "sviluppator", "developer", "endpoint", "webhook", "gateway", "rest", "integrazione", "sdk"],
  },
  {
    route: "/dashboard",
    keywords: ["dashboard", "notifiche", "avvisi", "spid", "cie", "profilo", "scadenze"],
  },
];

function findTargetRoute(query: string): string {
  const q = query.toLowerCase().trim();
  if (!q) return "/hub";
  for (const item of ROUTE_KEYWORDS) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.route;
    }
  }
  return "/hub";
}

function scrollToSection(id: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    target.focus({ preventScroll: true });
  };
}

// Service definitions for the public grid
const PUBLIC_SERVICES = [
  {
    id: "inps",
    title: "INPS & Previdenza",
    desc: "Simulazione dei percorsi per consultazione contributi, calcolo ISEE, richiesta NASpI e Assegno Unico.",
    route: "/inps",
    category: "Previdenza e Sostegni",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    examples: ["Estratto conto contributivo", "Domanda NASpI", "Simulazione ISEE"],
  },
  {
    id: "entrate",
    title: "Agenzia delle Entrate",
    desc: "Consultazione simulata del cassetto fiscale, modello 730 precompilato, F24 e visure catastali.",
    route: "/entrate",
    category: "Fisco e Immobili",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    examples: ["730 Precompilato", "Modello F24 online", "Visura catastale"],
  },
  {
    id: "pagopa",
    title: "PagoPA & Tributi",
    desc: "Verifica e riepilogo dimostrativo degli avvisi di pagamento, tributi locali (TARI, IMU) e sanzioni.",
    route: "/pagopa",
    category: "Pagamenti Unificati",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    examples: ["Codice avviso IUV", "Multe e sanzioni", "Tributi comunali TARI/IMU"],
  },
  {
    id: "anpr",
    title: "ANPR Anagrafe Nazionale",
    desc: "Flusso guidato per il rilascio di certificati anagrafici, stato di famiglia e cambi di residenza.",
    route: "/anpr",
    category: "Certificati e Popolazione",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    examples: ["Certificato di residenza", "Stato di famiglia", "Dichiarazione cambio residenza"],
  },
  {
    id: "salute",
    title: "Fascicolo Sanitario Elettronico",
    desc: "Accesso simulato allo storico referti, ricette dematerializzate e prenotazioni visite specialistiche.",
    route: "/salute",
    category: "Sanità e Salute",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    examples: ["Referti esami clinici", "Ricette farmaceutiche", "Prenotazione prestazioni CUP"],
  },
  {
    id: "auto",
    title: "Portale dell'Automobilista",
    desc: "Verifica scadenze bollo auto, saldo punti della patente di guida e scadenze revisione veicoli.",
    route: "/auto",
    category: "Mobilità e Veicoli",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
    examples: ["Calcolo e scadenza bollo", "Saldo punti patente", "Controllo revisione veicolo"],
  },
];

const QUICK_TOPICS = [
  { label: "Bollo auto", route: "/auto" },
  { label: "Certificato di residenza", route: "/anpr" },
  { label: "730 precompilato", route: "/entrate" },
  { label: "Pensione e ISEE", route: "/inps" },
  { label: "Avviso PagoPA", route: "/pagopa" },
  { label: "Referti sanitari", route: "/salute" },
];

export default function PublicHomePage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoute = findTargetRoute(query);
    setLocation(targetRoute);
  };

  return (
    <div className="min-h-dvh flex flex-col selection:bg-[#1d7a3f] selection:text-white" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      {/* ─── Skip Link for Accessibility ───────────────────────────────────────── */}
      <a
        href="#main-content"
        onClick={scrollToSection("main-content")}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#0b4d26] focus:text-white focus:px-4 focus:py-2.5 focus:font-semibold focus:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand)]"
      >
        Salta al contenuto principale
      </a>

      {/* ─── Minimal Italian Civic Tricolor Accent Line ──────────────────────── */}
      <div className="w-full h-1 flex flex-shrink-0" aria-hidden="true">
        <div className="flex-1 bg-[#009246]" />
        <div className="flex-1 bg-[#f4f5f7] dark:bg-[#d8dde6]" />
        <div className="flex-1 bg-[#ce2b37]" />
      </div>

      {/* ─── Main Civic Navigation Bar ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Institutional Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded-md p-1 -m-1"
            aria-label="Portale Italia, pagina iniziale"
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-white font-bold"
              style={{ background: "var(--color-brand, #1d7a3f)" }}
            >
              <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6" aria-hidden="true">
                <clipPath id="shield-clip-landing">
                  <path d="M18 6L28 10V20C28 26 18 30 18 30C18 30 8 26 8 20V10Z" />
                </clipPath>
                <g clipPath="url(#shield-clip-landing)">
                  <rect x="8" y="6" width="7" height="24" fill="#009246" />
                  <rect x="15" y="6" width="6" height="24" fill="#ffffff" />
                  <rect x="21" y="6" width="7" height="24" fill="#ce2b37" />
                </g>
                <circle cx="18" cy="18" r="3.2" fill="none" stroke="#ffffff" strokeWidth="1.4" />
                <path d="M18 15.2L18.4 17H20.2L18.8 18.1L19.3 19.9L18 18.7L16.7 19.9L17.2 18.1L15.8 17H17.6Z" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-base tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                >
                  Portale Italia
                </span>
              </div>
              <p className="hidden sm:block text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                Orientamento ai servizi pubblici
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Navigazione principale" className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
            <a
              href="#come-funziona"
              onClick={scrollToSection("come-funziona")}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded px-1.5 py-1"
            >
              Come funziona
            </a>
            <a
              href="#servizi"
              onClick={scrollToSection("servizi")}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded px-1.5 py-1"
            >
              Servizi PA
            </a>
            <a
              href="#privacy"
              onClick={scrollToSection("privacy")}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded px-1.5 py-1"
            >
              Privacy e trasparenza
            </a>
            <Link
              href="/api"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded px-1.5 py-1"
            >
              <span>AI Gateway</span>
            </Link>
          </nav>

          {/* Actions: Theme Toggle + Single Primary Access */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDark((prev) => !prev)}
              className="w-9 h-9 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)" }}
              aria-label={dark ? "Attiva modalità chiara" : "Attiva modalità scura"}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <Link
              href="/hub"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand)]"
              style={{ background: "var(--color-brand, #1d7a3f)", fontFamily: "var(--font-display)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Apri la demo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────────────── */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">

        {/* ─── Editorial Hero Section ────────────────────────────────────────── */}
        <section
          className="border-b pt-9 pb-10 sm:pt-16 sm:pb-20 bg-[#f8f7f2] dark:bg-[#171c19]"
          style={{
            borderColor: "var(--color-border)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            
            {/* Main Civic Headings */}
            <h1
              className="font-semibold text-4xl sm:text-6xl lg:text-7xl mb-5 text-[var(--color-text)]"
              style={{
                fontFamily: "var(--font-body)",
                letterSpacing: "-0.03em",
                lineHeight: 1.04,
              }}
            >
              Di cosa hai bisogno oggi?
            </h1>

            <p
              className="max-w-3xl mx-auto text-balance text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
            >
              Un punto di partenza per orientarti tra i servizi pubblici, con parole semplici.
            </p>

            {/* ── Central Routing & Search Box ── */}
            <div className="max-w-2xl mx-auto mb-6">
              <form
                role="search"
                onSubmit={handleSearchSubmit}
                className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-lg border focus-within:border-[var(--color-brand)] focus-within:ring-2 focus-within:ring-[var(--color-brand)] transition-all"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                }}
              >
                <div className="flex items-center gap-2.5 w-full px-3 py-1 flex-1">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="flex-shrink-0 text-[var(--color-text-muted)]"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <label htmlFor="civic-search-input" className="sr-only">
                    Cerca un servizio pubblico o digita la tua necessità
                  </label>
                  <input
                    id="civic-search-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Es. Come pago il bollo auto? oppure ISEE 2026..."
                    className="w-full bg-transparent text-sm sm:text-base outline-none py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-md font-semibold text-sm text-white flex items-center justify-center gap-2 hover:opacity-95 transition-opacity flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand)]"
                  style={{ background: "var(--color-brand, #1d7a3f)", fontFamily: "var(--font-display)" }}
                >
                  <span>Trova servizio</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              {/* Clear Honest Civic Disclosure */}
              <div
                className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[var(--color-text-muted)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 self-center" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  <strong>Demo:</strong> pratiche simulate, nessun dato reale inviato alla PA.
                </span>
              </div>
            </div>

            {/* ── Quick Topic Shortcuts ── */}
            <div className="pt-2 max-w-2xl mx-auto">
              <p
                className="text-left text-xs font-semibold uppercase tracking-wider mb-2.5 text-[var(--color-text-faint)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Argomenti frequenti
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_TOPICS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.route}
                    className="group min-w-0 w-full min-h-10 inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-xs leading-snug font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <span>{item.label}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[var(--color-text-faint)] group-hover:text-[var(--color-brand)]" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ─── Section: Come funziona ──────────────────────────────────────────── */}
        <section
          id="come-funziona"
          tabIndex={-1}
          className="py-14 sm:py-18 border-b focus:outline-none"
          style={{
            scrollMarginTop: "4.5rem",
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2
                className="font-bold text-2xl sm:text-3xl mb-2 text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Come funziona Portale Italia
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                Un modello di orientamento civico in tre passaggi per facilitare il rapporto tra cittadino e servizi pubblici.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div
                className="p-6 rounded-lg border flex flex-col justify-between"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div>
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm text-white mb-4"
                    style={{ background: "var(--color-brand, #1d7a3f)", fontFamily: "var(--font-display)" }}
                  >
                    1
                  </div>
                  <h3 className="font-bold text-base mb-2 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                    Esprimi la tua necessità
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                    Inserisci una domanda o seleziona un tema in linguaggio naturale, senza dover conoscere la suddivisione interna dei ministeri o degli enti.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className="p-6 rounded-lg border flex flex-col justify-between"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div>
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm text-white mb-4"
                    style={{ background: "var(--color-brand, #1d7a3f)", fontFamily: "var(--font-display)" }}
                  >
                    2
                  </div>
                  <h3 className="font-bold text-base mb-2 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                    Orientamento immediato
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                    Il sistema individua il percorso di competenza e presenta i requisiti, i documenti necessari e i passi operativi richiesti.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className="p-6 rounded-lg border flex flex-col justify-between"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div>
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm text-white mb-4"
                    style={{ background: "var(--color-brand, #1d7a3f)", fontFamily: "var(--font-display)" }}
                  >
                    3
                  </div>
                  <h3 className="font-bold text-base mb-2 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                    Simulazione trasparente
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                    Esplora le schermate e i flussi in sicurezza. Nel prototipo non avvengono addebiti finanziari né accessi ad archivi anagrafici reali.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section: Catalogo Servizi PA ────────────────────────────────────── */}
        <section
          id="servizi"
          tabIndex={-1}
          className="py-14 sm:py-20 border-b focus:outline-none"
          style={{
            scrollMarginTop: "4.5rem",
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-brand)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Aree tematiche
                </p>
                <h2
                  className="font-bold text-2xl sm:text-3xl text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Servizi della Pubblica Amministrazione
                </h2>
                <p className="text-sm sm:text-base mt-1 text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                  Accedi direttamente ai moduli dimostrativi per comprendere la struttura di ciascun servizio.
                </p>
              </div>

              <Link
                href="/hub"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span>Esplora tutti i moduli nell'Hub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PUBLIC_SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-lg border p-6 flex flex-col justify-between transition-colors hover:border-[var(--color-brand)]"
                  style={{
                    background: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-md border flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-brand)",
                        }}
                      >
                        {srv.icon}
                      </div>
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                        style={{
                          borderColor: "var(--color-border)",
                          background: "var(--color-surface)",
                          color: "var(--color-text-muted)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {srv.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg mb-2 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                      {srv.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4 text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                      {srv.desc}
                    </p>

                    <div className="pt-3 border-t space-y-1.5" style={{ borderColor: "var(--color-divider)" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
                        Esempi di consultazione:
                      </p>
                      <ul className="space-y-1 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                        {srv.examples.map((ex) => (
                          <li key={ex} className="flex items-center gap-2">
                            <span className="w-1.5 h-0.5 bg-[var(--color-brand)] flex-shrink-0" aria-hidden="true" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <Link
                      href={srv.route}
                      aria-label={`Apri il modulo dimostrativo per ${srv.title}`}
                      className="w-full py-2.5 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-brand-light)] hover:border-[var(--color-brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      <span>Apri modulo dimostrativo</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section: Trasparenza, Privacy & Sicurezza ──────────────────────── */}
        <section
          id="privacy"
          tabIndex={-1}
          className="py-14 sm:py-20 border-b focus:outline-none"
          style={{
            scrollMarginTop: "4.5rem",
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Mission & Principles */}
              <div className="lg:col-span-7 space-y-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Trasparenza civica
                </p>
                <h2
                  className="font-bold text-2xl sm:text-3xl text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Progettato per la chiarezza e il rispetto dei dati
                </h2>
                <p
                  className="text-sm sm:text-base leading-relaxed text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Portale Italia è un prototipo di ricerca e advocacy civica indipendente. È ideato per mostrare come un'interfaccia pubblica possa risultare accessibile, leggibile e priva di attriti burocratici.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{ background: "var(--color-brand-light)", color: "var(--color-brand)" }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                        Dati e scenari sintetici
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        I saldi, gli importi e i dati anagrafici visualizzati sono generati unicamente per finalità illustrative.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{ background: "var(--color-brand-light)", color: "var(--color-brand)" }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                        Nessuna raccolta credenziali
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Il prototipo non richiede, non riceve e non memorizza credenziali SPID, CIE o dati bancari reali.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{ background: "var(--color-brand-light)", color: "var(--color-brand)" }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                        Nessuna trasmissione a banche dati statali
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Nessuna richiesta viene inoltrata a server o registri della Pubblica Amministrazione.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Structured Specification Card */}
              <div
                className="lg:col-span-5 p-6 rounded-lg border"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: "var(--color-divider)" }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-faint)]">
                    Scheda di trasparenza
                  </span>
                  <span
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-brand)" }}
                  >
                    STATUS: SIMULAZIONE
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                  <div>
                    <span className="font-semibold text-[var(--color-text)]">Scopo del progetto:</span>
                    <p className="mt-0.5">Offrire un punto di riferimento visivo e architetturale per l'accessibilità digitale dei servizi civici.</p>
                  </div>

                  <div>
                    <span className="font-semibold text-[var(--color-text)]">Gestione della sessione:</span>
                    <p className="mt-0.5">Le preferenze e le simulazioni rimangono confinate nel browser locale del visitatore.</p>
                  </div>

                  <div className="pt-2 border-t" style={{ borderColor: "var(--color-divider)" }}>
                    <Link
                      href="/api"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded"
                    >
                      <span>Consulta la documentazione architetturale API</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Section: Specifiche API & Interoperabilità ───────────────────────── */}
        <section
          className="py-12 border-b"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div
              className="rounded-lg border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
              }}
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-brand)" }}
                  >
                    CONNESSIONI PER AGENTI CIVICI
                  </span>
                </div>
                <h2 className="font-bold text-xl sm:text-2xl mb-1.5 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                  AI Gateway
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Un concept per collegare assistenti digitali ai servizi pubblici tramite API autorizzate. Le integrazioni mostrate sono simulate: nessun collegamento con sistemi della PA è attivo.
                </p>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto">
                <Link
                  href="/api"
                  className="w-full md:w-auto px-5 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 border transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <span>Esplora AI Gateway</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── Institutional Civic Footer ──────────────────────────────────────── */}
      <footer
        className="pt-12 pb-8 border-t text-sm"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b" style={{ borderColor: "var(--color-divider)" }}>
            
            {/* Col 1: Identity & Description */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "var(--color-brand, #1d7a3f)" }}
                >
                  IT
                </div>
                <span className="font-bold text-sm text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                  Portale Italia
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                Iniziativa civica indipendente per la semplificazione, l'accessibilità e la trasparenza dei percorsi digitali pubblici.
              </p>
            </div>

            {/* Col 2: Servizi PA */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2.5 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                Servizi PA
              </p>
              <ul className="space-y-1.5 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                <li><Link href="/inps" className="hover:underline hover:text-[var(--color-text)]">INPS Previdenza</Link></li>
                <li><Link href="/entrate" className="hover:underline hover:text-[var(--color-text)]">Agenzia delle Entrate</Link></li>
                <li><Link href="/pagopa" className="hover:underline hover:text-[var(--color-text)]">PagoPA Tributi</Link></li>
                <li><Link href="/anpr" className="hover:underline hover:text-[var(--color-text)]">ANPR Anagrafe</Link></li>
                <li><Link href="/salute" className="hover:underline hover:text-[var(--color-text)]">Fascicolo Sanitario</Link></li>
                <li><Link href="/auto" className="hover:underline hover:text-[var(--color-text)]">Automobilista & Patenti</Link></li>
              </ul>
            </div>

            {/* Col 3: Piattaforma */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2.5 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                Piattaforma
              </p>
              <ul className="space-y-1.5 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                <li><Link href="/hub" className="hover:underline hover:text-[var(--color-text)]">Hub Cittadino</Link></li>
                <li><Link href="/dashboard" className="hover:underline hover:text-[var(--color-text)]">Dashboard Personale</Link></li>
                <li><Link href="/api" className="hover:underline hover:text-[var(--color-text)]">AI Gateway</Link></li>
                <li><a href="#come-funziona" onClick={scrollToSection("come-funziona")} className="hover:underline hover:text-[var(--color-text)]">Come funziona</a></li>
                <li><a href="#privacy" onClick={scrollToSection("privacy")} className="hover:underline hover:text-[var(--color-text)]">Trasparenza e dati</a></li>
              </ul>
            </div>

            {/* Col 4: Note Legali & Progetto */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2.5 text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                Note di progetto
              </p>
              <ul className="space-y-1.5 text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-body)" }}>
                <li>Prototipo open source</li>
                <li>Nessun dato reale raccolto</li>
                <li>SPID e CIE simulati</li>
                <li>Accessibilità WCAG 2.1 AA</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-faint)]" style={{ fontFamily: "var(--font-body)" }}>
            <p>
              © {new Date().getFullYear()} Portale Italia · CittadinoOS. Prototipo dimostrativo indipendente non affiliato formalmente a enti della PA.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/hub" className="hover:underline text-[var(--color-brand)] font-semibold">
                Accedi alla demo →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
