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

## 🌐 Benchmark Internazionali

Il pattern architetturale di Portale-Italia segue la direzione già tracciata da tre modelli di riferimento globali. Questo PoC esplora la fattibilità di quel modello nel contesto italiano, dimostrando che il gap non è tecnologico — è di volontà e design.

- **🇪🇪 Estonia — Bürokratt:** Assistente AI unificato (dal 2020) che aggrega servizi pubblici eterogenei in un'interfaccia conversazionale accessibile via testo, voce o lingua dei segni. Pattern "generative UI over legacy systems." [→ e-estonia](https://e-estonia.com/estonia-and-automated-decision-making-challenges-for-public-administration/)
- **🇬🇧 UK — AI Opportunities Action Plan 2025:** Governo britannico con partnership Anthropic per costruire un AI assistant per i servizi pubblici. "Humphrey" per i civil servant. Risparmio stimato: £45 miliardi/anno. [→ techUK](https://www.techuk.org/resource/uk-government-brings-further-ai-capability-into-public-services.html)
- **🇸🇬 Singapore — Singpass:** 2.700 servizi di 800 enti accessibili da una singola identità digitale unificata. 41 milioni di transazioni al mese. Il modello più maturo di "single entry point" per i servizi PA. [→ tech.gov.sg](https://www.tech.gov.sg/products-and-services/for-citizens/digital-services/singpass/)

## 📸 Screenshot

### Desktop

| Hub | Dashboard |
|-----|-----------|
| ![Hub Desktop](assets/screenshots/desktop_hub.png) | ![Dashboard Desktop](assets/screenshots/desktop_dashboard.png) |

| INPS | Agenzia Entrate |
|------|-----------------|
| ![INPS Desktop](assets/screenshots/desktop_inps.png) | ![Entrate Desktop](assets/screenshots/desktop_entrate.png) |

### Mobile

| Hub | Dashboard | INPS |
|-----|-----------|------|
| <img src="assets/screenshots/mobile_hub.png" width="200" /> | <img src="assets/screenshots/mobile_dashboard.png" width="200" /> | <img src="assets/screenshots/mobile_inps.png" width="200" /> |

| Agenzia Entrate | PagoPA | Salute |
|-----------------|--------|--------|
| <img src="assets/screenshots/mobile_entrate.png" width="200" /> | <img src="assets/screenshots/mobile_pagopa.png" width="200" /> | <img src="assets/screenshots/mobile_salute.png" width="200" /> |

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

Apri una issue o una PR. Per proposte di collaborazione istituzionale o commerciale: **portale@sephmartin.com**

## ⚖️ Licenza

**AGPLv3** — Sei libero di usare, studiare e modificare questo codice. Qualsiasi servizio web erogato usando questo codice (anche modificato) deve rendere pubblico il proprio sorgente.

Per uso commerciale senza vincolo AGPL: contattami per una licenza enterprise.

---

*Costruito per dimostrare cosa è possibile fare oggi.*
*— Seph Martin*
