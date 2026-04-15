# 🇮🇹 Portale Italia

> **Il layer di orchestrazione che unifica i servizi della PA italiana in un'unica interfaccia conversazionale.**

Portale Italia non è un mockup: è un prototipo funzionante costruito per dimostrare che il collo di bottiglia della burocrazia digitale italiana non è più tecnologico, ma di design.

🔗 **Live Demo:** [portale-italia.online](https://portale-italia.online)

## 🚀 Cosa fa

- **Hub unificato:** INPS, Agenzia Entrate, PagoPA, ANPR, Fascicolo Sanitario, Automobilista — tutto in un posto
- **Assistente AI integrato:** Contesto cross-piattaforma. Chiedi "come pago il bollo?" e ti guida nel modulo giusto
- **Dark mode nativa**
- **Design accessibile e responsive** — funziona su desktop e mobile
- **API Gateway unificato** per sviluppatori e agenti AI

## 🏗 Architettura

```
┌─────────────────────────────────────────┐
│           Portale Italia UI             │
│  React 18 + Vite + Tailwind + wouter    │
├─────────────────────────────────────────┤
│          API Gateway Layer              │
│     /api/v1/notifications               │
│     /api/v1/citizen/profile             │
│     /api/v1/agent/query                 │
├─────────────────────────────────────────┤
│        Servizi PA (simulati)            │
│  INPS │ Entrate │ PagoPA │ ANPR │ ...   │
└─────────────────────────────────────────┘
```

Questo progetto **non** sostituisce i database statali. Agisce come un layer di orchestrazione sopra i sistemi legacy, formatta i dati e li espone tramite API unificata.

## ⚡ Setup

```bash
npm install
npm run dev      # Sviluppo su localhost
npm run build    # Build produzione
```

## 📂 Struttura

```
client/src/
├── pages/          # Pagine (Dashboard, INPS, Entrate, PagoPA, ...)
├── components/     # AppShell, AgentWidget, UI components
├── hooks/          # use-toast, use-mobile
└── lib/            # Utils, queryClient

server/             # Backend Express (opzionale)
shared/             # Schema condiviso
```

## 🤝 Contribuire

Contributi benvenuti. Il progetto è pensato per essere un prototipo educativo e di advocacy — una dimostrazione di cosa i cittadini italiani meritano.

Apri una issue o una PR. Per proposte di collaborazione istituzionale o commerciale: **sephmartinmusic@gmail.com**

## ⚖️ Licenza

**AGPLv3** — Sei libero di usare, studiare e modificare questo codice. Qualsiasi servizio web erogato usando questo codice (anche modificato) deve rendere pubblico il proprio sorgente.

Per uso commerciale senza vincolo AGPL: contattami per una licenza enterprise.

---

*Costruito per dimostrare cosa è possibile fare oggi.*
*— Seph Martin*
