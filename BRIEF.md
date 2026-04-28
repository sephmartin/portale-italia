# Portale Italia — Project Brief

## Il problema

La pubblica amministrazione italiana è frammentata in silos digitali: INPS, Agenzia delle Entrate, PagoPA, ANPR, Fascicolo Sanitario, Portale Automobilista. Ognuno con la sua interfaccia, la sua logica, la sua password. Il cittadino è costretto a fare da middleware umano tra sistemi che non comunicano tra loro.

Non è più un problema tecnico. Le informazioni esistono, le API esistono, l'identità digitale esiste. La sfida ora è di design: progettare l'esperienza complessiva del cittadino attraverso i vari enti — qualcosa che finora non è stato fatto in modo unificato.

## La soluzione

Un unico punto di accesso a tutti i servizi della PA, con un'unica autenticazione SPID/CIE. Non un altro portale — un layer intelligente che si mette sopra a quello che già esiste e lo rende utilizzabile.

## Il prototipo

Il prototipo funzionale esiste. È una web app React con:

- Sidebar unificata con accesso a tutti i moduli PA (INPS, Entrate, Sanità, PagoPA...)
- Dashboard centralizzata con notifiche aggregate da ogni ente
- Agente conversazionale sperimentale per ogni modulo, basato su Web Speech API
- API Gateway documentato con 9+ endpoint unificati
- Design system coerente con identità visiva italiana (tricolore, verde istituzionale)
- Dark mode, responsive mobile con drawer navigation

## La visione

Oltre al portale unificato, la visione include un layer di automazione fiscale e finanziaria. Collegando il conto bancario via PSD2, ogni movimento viene classificato automaticamente: spesa deducibile, reddito, IVA. Il risultato:

- Pre-compilazione automatica del 730, Modello Unico, F24
- Notifiche proattive per la registrazione di movimenti
- Zero dichiarazioni manuali: tutto il flusso fiscale diventa trasparente e automatico

L'obiettivo non è sostituire la PA. È renderla invisibile — come dovrebbe essere.

## Verso un ecosistema agentico: MCP

Le API di oggi permettono agli umani di accedere ai servizi PA tramite interfacce web. Ma il prossimo passo è un ecosistema in cui agenti AI — Siri, assistenti open source, software fiscali — dialogano direttamente con la PA senza integrazioni custom per ogni coppia.

Il **Model Context Protocol (MCP)** è lo standard emergente che rende questo possibile: un unico protocollo di scoperta e interazione che permette a qualsiasi agente di connettersi a qualsiasi fonte dati strutturata. Francia e Regno Unito stanno già sperimentando MCP server governativi; la Francia ha esposto oltre 74.000 dataset pubblici tramite MCP.

L'architettura di Portale Italia è già orientata in questa direzione: gli endpoint `/api/v1/agent/query`, `/api/v1/services` e `/api/v1/citizen/profile` sono progettati per un consumatore agentico, non solo umano. Il passo successivo naturale è esporre un **MCP server nativo** sopra il layer di orchestrazione esistente — così che qualsiasi agente AI possa compilare un F24 o verificare una notifica INPS senza sapere nulla dei sistemi sottostanti.

## Domande aperte

**Interoperabilità.** Le API della PA italiana non sono aperte. L'approccio ipotizzato: middleware che aggrega i dati, PSD2 per la parte bancaria, accesso autorizzato dall'utente via SPID/CIE. L'EU Digital Identity Wallet (IT Wallet) risolve il problema dell'identità digitale. Portale Italia può essere lo strato intelligente che si appoggia al wallet.

**Privacy e trust.** Dati fiscali e sanitari richiedono fiducia altissima. Direzione: agente on-device, zero storage server-side, autenticazione SPID nativa. I dati restano sul dispositivo del cittadino.

**Accessibilità.** La voce come interfaccia primaria, zero gergo tecnico, un'unica app con un'unica login. Se sai parlare, sai usarla.

---

*Questo è un PoC in evoluzione. Codice open source: https://github.com/sephmartin/portale-italia*
