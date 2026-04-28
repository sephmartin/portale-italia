# CittadinoOS — Project Brief v4

Un sistema operativo per il cittadino italiano.

Project Brief v4 — Aprile 2026

## 🔥 Il problema

La pubblica amministrazione italiana è frammentata in silos digitali: INPS, Agenzia delle Entrate, PagoPA, ANPR, Fascicolo Sanitario, Portale Automobilista. Ognuno con la sua interfaccia, la sua logica, la sua password. Il cittadino è costretto a fare da middleware umano tra sistemi che non comunicano tra loro.

**Non è un problema tecnico** — le informazioni esistono. È un problema di design: nessuno ha mai progettato l'esperienza complessiva del cittadino.

## 💡 La soluzione

Un unico punto di accesso a tutti i servizi della PA, con un'unica autenticazione SPID/CIE. Non un altro portale — **un layer intelligente** che si mette sopra a quello che già esiste e lo rende utilizzabile. Pensa a come Mint.com ha unificato il banking, ma per tutta la burocrazia italiana.

## 🚀 Il prototipo

Il prototipo funzionale esiste già. È stato costruito con un approccio AI-native — "vibe coding" — dove l'intento guida l'esecuzione. Una web app React con:

- Sidebar unificata con accesso a tutti i moduli PA (INPS, Entrate, Sanità, PagoPA...)
- Dashboard centralizzata con notifiche aggregate da ogni ente
- Agente vocale per ogni modulo, basato su Web Speech API
- API Gateway documentato con 9+ endpoint unificati
- Design system **conforme a Design System Italia** con token ufficiali (verde istituzionale, tricolore), accessibilità AGID (WCAG 2.1 AA)
- Dark mode, responsive mobile con drawer navigation

Non è un mockup su Figma. È codice che gira.

## 🎯 La visione

Oltre al portale unificato, la visione include un layer di automazione fiscale e finanziaria. Collegando il conto bancario via PSD2 (open banking, già attivo in Italia), ogni movimento viene classificato automaticamente: spesa deducibile, reddito, IVA.

- Pre-compilazione automatica del 730, Modello Unico, F24 — senza input manuale
- Notifiche proattive: "Hai ricevuto €1.200 da Mario Bianchi — vuoi registrarla come fattura?"
- Zero dichiarazioni manuali: tutto il flusso fiscale diventa trasparente e automatico

L'obiettivo non è sostituire la PA. **È renderla invisibile** — come dovrebbe essere.

## 🌐 Benchmark internazionali

Il pattern architetturale di CittadinoOS segue la direzione già tracciata da tre modelli di riferimento globali. Questo PoC esplora la fattibilità di quel modello nel contesto italiano, dimostrando che il gap non è tecnologico — è di volontà e design.

### 🇪🇪 Estonia — Bürokratt

Assistente AI unificato (dal 2020) che aggrega servizi pubblici eterogenei in un'interfaccia conversazionale accessibile via testo, voce o lingua dei segni. Pattern "generative UI over legacy systems."

Active since 2020 → [e-estonia.com](https://e-estonia.com/estonia-and-automated-decision-making-challenges-for-public-administration/)

### 🇬🇧 Regno Unito — AI Action Plan 2025

Il governo britannico ha lanciato nel gennaio 2025 un piano AI per la PA con partnership diretta con Anthropic. "Humphrey" per i civil servant. Un AI assistant per i servizi pubblici ai cittadini.

Stimato: £45 miliardi/anno risparmio → [techuk.org](https://www.techuk.org/resource/uk-government-brings-further-ai-capability-into-public-services.html)

### 🇸🇬 Singapore — Singpass

2.700+ servizi di 800 enti pubblici accessibili da una singola identità digitale unificata, con pre-compilazione automatica dei moduli tramite dati utente.

41 milioni transazioni/mese → [tech.gov.sg](https://www.tech.gov.sg/products-and-services/for-citizens/digital-services/singpass/)

## 🛠 Stack e compliance

- **Frontend**: `design-react-kit` + `design-tokens-italia` (token ufficiali) per UI conforme alle linee guida AGID
- **API**: OpenAPI 3.0, compatibile con `italia/api-oas-checker`
- **Riferimenti**: API PA Digitale 2026 (architettura di riferimento)
- **Autenticazione**: SPID/CIE nativa; integrazione con IT Wallet / EUDI Wallet come layer di identità complementare
- **Accessibilità**: WCAG 2.1 AA, conformità GLI AGID
- **Approccio sviluppo**: AI-native, vibe coding con agenti di supporto

## ❓ Le domande aperte

Questo non è un progetto con tutte le risposte. È un progetto con le domande giuste.

### Interoperabilità

Le API della PA italiana non sono aperte — come si risolve? L'approccio ipotizzato: middleware che aggrega i dati, PSD2 per la parte bancaria, accesso autorizzato dall'utente via SPID/CIE. Non serve hackerare nulla: basta che il cittadino autorizzi l'accesso ai propri dati.

C'è poi un pezzo che cambia il quadro: l'**EU Digital Identity Wallet** (eIDAS 2.0), che l'Italia sta già implementando come **IT Wallet** — attivo da dicembre 2024 sull'app IO, con oltre 2 milioni di wallet attivati nella prima settimana. CittadinoOS non è un'alternativa al wallet — è lo strato intelligente e interattivo che ci si appoggia sopra: il cittadino si autentica con l'EUDI Wallet, e CittadinoOS orchestra tutto il resto. Lo rende un acceleratore della visione europea, non un concorrente.

### Privacy e trust

Dati fiscali e sanitari richiedono un livello di fiducia altissimo. La direzione: agente on-device, zero storage server-side, autenticazione SPID nativa. I dati restano sul dispositivo del cittadino — non su un server di terzi.

### Accessibilità

Come funziona per chi non è tech-savvy? La voce come interfaccia primaria, zero gergo tecnico, un'unica app con un'unica login. Se sai parlare, sai usarla.

## ☕ Perché parliamone

Caffè Design non è un nome a caso. Riccardo ha lavorato direttamente al design system INPS — conosce i vincoli tecnici e burocratici dall'interno. Il podcast tratta da tempo di AI e interfacce conversazionali. Siete un ponte naturale verso agenzie e stakeholder che già collaborano con la PA italiana.

Il vostro approccio — meno tecnico, più umano — è esattamente la filosofia di questo progetto.

Non sto cercando investitori. Sto cercando le persone giuste con cui capire se questo ha senso farlo davvero.

Questo brief è scritto da un music producer e AI consultant napoletano. Non un tecnico PA — un outsider che ha visto il problema da utente, si è stufato, e ha costruito il prototipo.

**Fonti:**
- [innovazione.gov.it](https://innovazione.gov.it) (IT Wallet)
- [freshfields.com/eidas](https://freshfields.com/eidas) (eIDAS 2.0)

**Demo:** [portale-italia.online](https://portale-italia.online)  
**Repo:** [GitHub](https://github.com/sephmartin/portale-italia)

CittadinoOS — Project Brief v4 · Aprile 2026
