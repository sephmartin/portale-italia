# 🇮🇹 Portale Italia

> **Il layer di orchestrazione che unifica i servizi della PA italiana in un'unica interfaccia conversazionale.**

> ⚠️ **PoC educativo e di advocacy.** I dati sono simulati. Non integra sistemi PA reali. Nessun dato personale viene raccolto o trasmesso.

🔗 **Live Demo:** [portale-italia.online](https://portale-italia.online)

## 🚀 Cosa fa

- **Hub unificato:** INPS, Agenzia Entrate, PagoPA, ANPR, Fascicolo Sanitario, Automobilista — tutto in un posto
- **Assistente AI integrato:** Contesto cross-piattaforma. Chiedi "come pago il bollo?" e ti guida nel modulo giusto
- **Dark mode nativa**
- **Design accessibile e responsive** — funziona su desktop e mobile
- **API Gateway unificato** per sviluppatori e agenti AI

## 🌐 Benchmark Internazionali

Il pattern architetturale segue modelli già adottati in altri paesi:

- **🇪🇪 Estonia — Bürokratt:** Assistente AI unificato (dal 2020) che aggrega servizi pubblici eterogenei in un'interfaccia conversazionale accessibile via testo, voce o lingua dei segni. [→ e-estonia](https://e-estonia.com/estonia-and-automated-decision-making-challenges-for-public-administration/)
- **🇬🇧 UK — AI Opportunities Action Plan 2025:** Governo britannico con partnership Anthropic per costruire un AI assistant per i servizi pubblici. Risparmio stimato: £45 miliardi/anno. [→ techUK](https://www.techuk.org/resource/uk-government-brings-further-ai-capability-into-public-services.html)
- **🇸🇬 Singapore — Singpass:** 2.700 servizi di 800 enti accessibili da una singola identità digitale unificata. 41 milioni di transazioni al mese. [→ tech.gov.sg](https://www.tech.gov.sg/products-and-services/for-citizens/digital-services/singpass/)

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

## 🎨 Design System

Portale-Italia utilizza il token set ufficiale [`design-tokens-italia`](https://github.com/italia/design-tokens-italia) per garantire la conformità alle linee guida di design AgID. I colori del brand personalizzato (verde Italia) si sovrappongono ai token ufficiali per spaziatura, tipografia, raggi e ombre.

- **Token:** spaziatura (`--it-spacing-*`), dimensioni font (`--it-font-size-*`), ombre, raggi
- **Personalizzati:** `--color-brand` (#1d7a3f), colori specifici per modulo, estensioni tema scuro
- **Risultato:** accessibile WCAG AA, allineato AGID, Lighthouse 91+ mobile

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

Non sostituisce i database statali. Agisce come layer di orchestrazione sopra i sistemi legacy, formatta i dati e li espone tramite API unificata.

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
├── components/     # AppShell, AgentWidget, componenti UI
├── hooks/          # use-toast, use-mobile
└── lib/            # Utils, queryClient

server/             # Backend Express
shared/             # Schema condiviso
```

## 🤝 API Gateway

Portale Italia espone un API Gateway REST unificato con contratto documentato **OpenAPI 3.0** e standard AGID. Tutte le risorse richiedono autenticazione SPID/CIE.

- 📄 **Spec:** [OpenAPI.yaml](./OpenAPI.yaml)
- 🔗 **Sandbox:** `https://portale-italia.online/api/v1`

<table>
<tr><td><code>POST /api/v1/agent/query</code></td><td>Query assistente AI</td></tr>
<tr><td><code>GET /api/v1/services</code></td><td>Catalogo servizi PA</td></tr>
<tr><td><code>GET /api/v1/notifications</code></td><td>Notifiche aggregate</td></tr>
<tr><td><code>GET /api/v1/citizen/profile</code></td><td>Profilo cittadino</td></tr>
</table>

## 🏛 Collaborazione Istituzionale

Se lavori in un ente PA, in AgID, nel Dipartimento per la Trasformazione Digitale, o ti occupi di interoperabilità dei dati pubblici in Italia, scrivici per parlare di come portare questa architettura su dati reali.

Il progetto è catalogato su [Developers Italia](https://developers.italia.it) tramite `publiccode.yml`.

📬 **Contatti:** portale@sephmartin.com

## 🤝 Contribuire

Contributi benvenuti. Apri una issue o una PR.

Per proposte di collaborazione istituzionale o commerciale: **portale@sephmartin.com**

## ⚖️ Licenza

**AGPLv3** — Sei libero di usare, studiare e modificare questo codice. Qualsiasi servizio web erogato usando questo codice (anche modificato) deve rendere pubblico il proprio sorgente.

Per uso commerciale senza vincolo AGPL: contattami per una licenza enterprise.

---

*— Seph Martin*
