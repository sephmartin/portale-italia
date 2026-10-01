# API pubbliche e MCP per servizi della PA

**Ricerca aggiornata al 30 settembre 2026.** Fonti primarie: siti istituzionali, documentazione PagoPA/PDND e repository pubblici degli enti. Le verifiche live qui indicate sono chiamate di sola lettura senza header di autenticazione; non sono state inviate richieste ad amministrazioni.

## Sintesi

La corsia agentica esiste già per i dati pubblici: oltre all’MCP semantico del progetto `italia`, AgID pubblica **Cruscotto Italia**, un MCP read-only che permette ai chatbot di interrogare dati comunali aggregati da più fonti istituzionali. Questo offre una base concreta da provare e un punto di confronto. Non equivale però a collegarsi alle pratiche personali o a eseguire servizi: per gli e-service PDND occorrono adesione, requisiti e autorizzazioni per il singolo servizio e per una finalità dichiarata.

La prima distinzione da mantenere nel progetto è quindi:

1. **Discovery e open data:** cataloghi pubblici, dataset e API consultabili senza credenziali; adatti a tool MCP read-only.
2. **Dati o operazioni non pubbliche:** servono API operative e un accesso autorizzato. Per gli e-service su PDND ciò include soggetto fruitore/erogatore, requisiti, richiesta di fruizione, finalità e voucher; altre piattaforme possono avere API dirette con un diverso percorso di abilitazione. Un MCP non sostituisce questi passaggi.

## Già disponibile: `italia/dati-semantic-mcp`

Il repository pubblico [`italia/dati-semantic-mcp`](https://github.com/italia/dati-semantic-mcp) si descrive come server MCP per interagire con [Schema.gov.it](https://schema.gov.it/). Developers Italia è il progetto pubblico promosso dal Dipartimento per la Trasformazione Digitale e AgID ([sito ufficiale](https://developers.italia.it/it)); il repo è pubblicato nell’organizzazione GitHub `italia` e dichiara licenza MIT.

I tool documentati servono a esplorare ontologie, classi, proprietà e vocabolari, eseguire query SPARQL su Schema o endpoint esterni, risolvere identificatori territoriali e analizzare ontologie locali. È un MCP utile per semantica e discovery, **non un connettore alle pratiche o agli e-service transazionali delle PA**: questa è una deduzione dal perimetro dichiarato nel README, che riguarda risorse semantiche e SPARQL.

Fonte e funzioni: [README del repository](https://github.com/italia/dati-semantic-mcp). La stessa documentazione descrive i tool come `search_concepts`, `inspect_concept`, `query_sparql`, `browse_vocabulary`, `resolve_territorial_uri` e strumenti correlati.

## Già disponibile: MCP AgID Cruscotto Italia

La scheda istituzionale [MCP Cruscotto Italia su dati.gov.it](https://www.dati.gov.it/node/487), aggiornata al 25 giugno 2026, identifica Cruscotto Italia come piattaforma AgID e collega un endpoint MCP pubblico per interrogare dati comunali da chatbot. Il codice è nel repository pubblico dell’organizzazione GitHub `AgID`: [AgID/cruscotto-italia](https://github.com/AgID/cruscotto-italia).

**Endpoint MCP:** [`https://cruscotto-italia-mcp.agid.workers.dev/mcp`](https://cruscotto-italia-mcp.agid.workers.dev/mcp)

### Verifica live

Il 30 settembre 2026 ho inviato `tools/list`, `mcp_info` e una ricerca read-only per “Bologna” con JSON-RPC `POST`, senza header Authorization. Le richieste hanno risposto `200`. Il servizio ha dichiarato versione `0.20.0`, build del 10 settembre 2026 e, al momento della chiamata, 27 dataset, 17 istituzioni, 7.918 comuni e 20 chiavi sorgente raggruppate.

**Cautela su endpoint e hosting:** il collegamento dall’area istituzionale di dati.gov.it conferma che AgID indirizza gli utenti a questo endpoint; l’URL è ospitato sotto `agid.workers.dev`. La verifica qui conferma la risposta live, non l’assetto contrattuale o operativo dell’hosting né garanzie di servizio oltre a quanto pubblicato da AgID e dal repository.

La ricerca di Bologna ha restituito il codice ISTAT `037006` e i comuni con nomi corrispondenti. La risposta `mcp_info` ha indicato, tra le fonti, ANAC, BDAP-MOP, SIOPE, Italia Domani/PNRR, ISTAT, ISPRA, MIUR, ACI, MEF, ANNCSU, Ministero della Salute, GSE/MASE, AGCOM, MIMIT, Ministero del Lavoro, MiC e ItaliaMeteo. Conteggi e fonti possono cambiare: `mcp_info` è la verifica corrente da consultare.

### Sei tool di dominio e due adapter

La documentazione del repository presenta sei tool di dominio; il `tools/list` live ha restituito questi sei più due adapter di compatibilità, quindi **otto tool in totale** nella versione interrogata:

| Tool | Uso dichiarato |
|---|---|
| `mcp_info` | Metadati del servizio, fonti e aggiornamento dei dati |
| `search_comune` | Ricerca di un comune e risoluzione del codice ISTAT |
| `comune_kpi` | Indicatori sintetici comunali |
| `comune_dashboard` | Vista aggregata del comune sulle fonti integrate |
| `anncsu_civico_search` | Ricerca di strade e numeri civici ANNCSU |
| `censimento_sezione_search` | Ricerca o ranking su variabili censuarie per sezione |
| `search` | Adapter di ricerca per compatibilità con connettori ChatGPT |
| `fetch` | Adapter per recuperare dati comunali per codice ISTAT |

Fonti: [README AgID](https://github.com/AgID/cruscotto-italia#api-mcp-per-agenti-ai) e chiamata live `tools/list` all’endpoint sopra. Il README può riportare un conteggio precedente; la lista live è la fotografia della versione 0.20.0.

### Cosa copre e cosa non copre

Cruscotto Italia espone dati aperti aggregati o lookup territoriali, costruiti tramite pipeline ETL e mirror. Le frequenze variano secondo la fonte; consultare `mcp_info`, la pagina metodologica del progetto e le licenze prima di usare un dato in una risposta. Il repository dichiara che gli strumenti MCP sono read-only e non eseguono scritture ([documentazione di sicurezza](https://github.com/AgID/cruscotto-italia/blob/main/docs/SECURITY.md)).

È quindi già un esempio nazionale di chatbot/tool use su open data della PA. In base al perimetro pubblicato, non è un canale per leggere lo stato personale di una pratica o inviare una richiesta amministrativa: per questi casi servono API operative e un accesso autorizzato, con permessi specifici quando si usa PDND. Quest’ultima frase è una deduzione dal perimetro del MCP e dal flusso PDND, non una dichiarazione che ogni possibile funzione futura sia esclusa.

## Schema.gov.it: REST read-only senza credenziali

[Schema.gov.it](https://schema.gov.it/) cataloga risorse semantiche — vocabolari controllati, ontologie e schemi dati — per favorire l’interoperabilità. Non è un catalogo di servizi cittadini né una banca dati di posizioni individuali. Fonti: [FAQ sul catalogo](https://schema.gov.it/il-progetto/domande-frequenti/) e [note legali](https://schema.gov.it/note-legali/).

La [specifica OpenAPI pubblicata dal sito](https://schema.gov.it/wp-content/plugins/wp-schema/assets/yaml/openapi.yaml) documenta il server pubblico `https://www.schema.gov.it/api` e dichiara `security: []` per le operazioni GET qui rilevanti:

| Endpoint | Funzione |
|---|---|
| `GET /semantic-assets?q={testo}&limit={n}` | Cerca asset semantici nel catalogo |
| `GET /semantic-assets/by-iri?iri={IRI}` | Recupera dettagli di un asset |
| `GET /vocabularies?limit={n}&offset={n}` | Elenca vocabolari controllati |
| `GET /vocabularies/{agency_id}/{key_concept}` | Legge voci di un vocabolario |
| `GET /vocabularies/{agency_id}/{key_concept}/{id}` | Legge una singola voce |

Esempio verificato senza credenziali:

```text
GET https://www.schema.gov.it/api/semantic-assets?q=residenza&limit=2
```

La risposta è stata `200 application/json`; tra i risultati figurava metadata dell’ontologia INPS sulla Certificazione Unica. Un secondo esempio documentato e verificato è `GET https://www.schema.gov.it/api/vocabularies/dfp/elenco_diplomi_universitari`, che ha restituito `200` e 276 voci. Questi sono metadati/vocabolari, non record di cittadini. L’API Schema è indicata nella spec come beta, quindi la struttura può cambiare.

## `api.gov.it`: discovery delle API PA

[Developers Italia](https://developers.italia.it/it/interoperabilita-e-api) presenta [api.gov.it](https://api.gov.it/it/) come catalogo delle interfacce per integrazione e scambio di dati tra sistemi pubblici: si può cercare per parole chiave e filtrare per ente erogatore o fruitore. La [guida ufficiale all’integrazione](https://developers.italia.it/it/guide/progettare-e-integrare-servizi-interoperabili) descrive il processo: cercare l’API nel catalogo, accedere alla PDND per chiederne la fruizione, sviluppare, verificare e pubblicare secondo le regole d’interoperabilità.

Il catalogo aiuta a scoprire **quali e-service esistono e chi li eroga**. La loro presenza a catalogo non prova che un privato possa invocarli anonimamente. In questa ricerca il fetch del sito api.gov.it da parte del browser di ricerca ha restituito `403`; perciò non ho verificato eventuali API di esportazione o endpoint interni del catalogo. Le URL operative sotto non dipendono da endpoint non verificati di api.gov.it.

## PDND: accesso e limiti per un MCP

Il [Piano triennale ICT](https://docs.italia.it/italia/piano-triennale-ict/pianotriennale-ict-doc/it/2024-2026-agg-2026/capitolo-3_servizi/e-service-in-interoperabilit%C3%A0-tramite-pdnd.html) descrive PDND come piattaforma per autenticazione, autorizzazione e tracciamento degli accessi; gli e-service sono implementati tramite API REST o SOAP e registrati in un catalogo pubblico. Il [glossario operativo PagoPA](https://developer.pagopa.it/it/pdnd-interoperabilita/guides/manuale-operativo-pdnd-interoperabilita/v1.0/riferimenti-tecnici/glossario) precisa che esiste una versione pubblica del catalogo per la consultazione.

Il flusso documentato per usare un servizio è, in breve:

1. Aderire a PDND e operare come soggetto ammesso. La [guida all’adesione](https://www.developer.pagopa.it/it/pdnd-interoperabilita/guides/manuale-operativo-pdnd-interoperabilita/per-iniziare/guida-alladesione) richiede SPID o CIE livello 2; per completare l’adesione l’ente sottoscrive l’accordo con firma elettronica qualificata CAdES e nomina amministratori.
2. Trovare il singolo e-service e verificare gli attributi richiesti dall’erogatore.
3. Presentare la richiesta di fruizione con le dichiarazioni/documenti richiesti; l’erogatore può doverla verificare o attivare.
4. Una volta attiva la fruizione, definire la finalità e l’analisi del rischio, creare client e configurare le chiavi.
5. Ottenere da PDND il voucher e presentarlo alle chiamate verso l’API dell’erogatore.

Fonti: [funzionamento generale PDND](https://www.developer.pagopa.it/it/pdnd-interoperabilita/guides/manuale-operativo-pdnd-interoperabilita/per-iniziare/funzionamento-generale), [richiesta di fruizione](https://www.developer.pagopa.it/it/pdnd-interoperabilita/guides/manuale-operativo-pdnd-interoperabilita/v1.0/tutorial/tutorial-per-il-fruitore/come-presentare-una-richiesta-di-fruizione) e [Quick Start](https://developer.pagopa.it/pdnd-interoperabilita/quick-start). Quindi un singolo MCP server non acquisisce un’autorizzazione universale: le credenziali e la finalità devono corrispondere al soggetto fruitore e agli e-service autorizzati. Per un chatbot destinato ai cittadini occorre definire anche dove avviene l’autenticazione dell’utente e quali dati si possono restituire; i permessi del backend non sono un sostituto dell’identità/consenso o della base giuridica richiesta per la specifica operazione.

### Aggiornamento verificato: apertura alle imprese dal gennaio 2026

La [notizia ufficiale PagoPA del 15 gennaio 2026](https://www.interop.pagopa.it/news/apertura-privati) annuncia che tutte le imprese iscritte al Registro Imprese possono aderire alla PDND e operare come fruitori ed erogatori, in applicazione dell’aggiornamento delle Linee Guida AgID di giugno 2025.

La vecchia pagina del manuale **v1.0** [A chi si rivolge](https://www.developer.pagopa.it/it/pdnd-interoperabilita/guides/manuale-operativo-pdnd-interoperabilita/v1.0/per-iniziare/a-chi-si-rivolge-destinatari), che limita i privati alla sperimentazione, non va usata per negare questa apertura successiva. Correzione rispetto alla prima stesura della ricerca: l’adesione delle imprese ammesse è oggi documentata; non dobbiamo presentarla come un’ipotesi ancora genericamente bloccata.

Questo annuncio non concede automaticamente l’accesso a ogni e-service e non documenta l’ammissibilità di una persona fisica che non opera come impresa iscritta. Restano da verificare **il soggetto che porterà il pilota, l’ambiente, il servizio specifico, gli attributi e la finalità**. Il [Quick Start corrente](https://developer.pagopa.it/pdnd-interoperabilita/quick-start) mantiene il percorso per singolo e-service: richiesta di fruizione, finalità, client e voucher. Non è un login del cittadino né un mandato a operare per lui.

Le [API PDND Core v3](https://www.interop.pagopa.it/news/api-v3), pubblicate il 18 marzo 2026, gestiscono la piattaforma: non sono da sole API per prenotare appuntamenti o inviare pratiche. Per ciascuna operazione serve ancora l’API del suo erogatore.

## Indice PA: primo connettore MCP implementato

L’open data CKAN di [Indice PA](https://indicepa.gov.it/ipa-dati/) consente query pubbliche senza credenziali su due dataset ufficiali: [Enti](https://indicepa.gov.it/ipa-dati/dataset/enti) e [Responsabili della transizione al digitale](https://indicepa.gov.it/ipa-dati/dataset/responsabili-della-transizione-al-digitale). Il 30 settembre 2026 sono state verificate chiamate `package_show` e `datastore_search` all’API `https://indicepa.gov.it/ipa-dati/api/3/action/`.

Nel progetto è stato aggiunto un [server MCP autonomo](../../mcp-server/README.md), con ricerca dell’ente e lookup del suo ufficio digitale attraverso il codice IPA esatto. Il lookup della risorsa è dinamico: usa i metadati del dataset, senza fissare nel codice un identificatore di risorsa che può cambiare. Le risposte includono attribuzione, licenza, data di recupero, refresh del dataset e data di aggiornamento del singolo record.

Il dataset dei RTD contiene gli uffici per cui l’ente ha indicato il responsabile: zero record non dimostra zero nomine. Una denominazione può corrispondere a più enti. La ricerca “Comune di Bologna” ha restituito anche Castel Guelfo di Bologna; il codice IPA disambigua il referente. L’aggiornamento quotidiano del dataset non implica che ciascun contatto sia stato aggiornato di recente.

Questa è una prima capacità reale e utile alla selezione del pilota; il passo successivo resta un’operazione autorizzata su un servizio. La [mappa degli interlocutori e delle richieste](../strategy/piano-agentico-pa.md) distingue questi due traguardi.

## API pubblica read-only d’esempio

Per un piccolo prototipo MCP non dipendente da credenziali personali, la Regione Emilia-Romagna espone un’API REST di open data turistici. La scheda del dataset su [dati.gov.it](https://www.dati.gov.it/node/view-dataset/dataset?id=0ce0a832-44d9-45ab-bf0a-353db137408a) dichiara rilascio JSON, aggiornamento regolare, licenza CC-BY 4.0 e accesso pubblico; la [spec OpenAPI APT Servizi](https://apt-servizi.github.io/openapi-ert/) documenta filtri per data, città, provincia, comune/codice ISTAT, tema e categoria.

```text
GET https://emiliaromagnaturismo.it/opendata/v1/events?lang=it&limit=1&page=1
```

La chiamata è stata verificata il 30 settembre 2026 senza token: `200 application/json`. Il risultato includeva un evento e campi descrittivi in HTML: un adapter MCP dovrebbe convertirli in testo semplice e citare fonte/licenza. È una demo reale, ma settoriale: non offre accesso a dati individuali o a pratiche amministrative.

## Indicazione operativa

1. **Provare il MCP Cruscotto Italia** come baseline per dati comunali aperti; capire quali domande copre già.
2. **Usare `dati-semantic-mcp` e Schema.gov.it** per discovery e mapping semantico, non come sostituti di API operative.
3. **Usare il connettore IPA** già implementato per trovare enti e uffici digitali, con fonti e date tracciabili.
4. **Per servizi che richiedono accesso o azioni**, scegliere un solo caso d’uso, individuare l’ente titolare e l’operatore della piattaforma, poi verificare API, idoneità e autorizzazioni. Quando il servizio usa PDND, identificare anche l’e-service e il soggetto fruitore. Evitare di rendere PDND un requisito presunto per qualsiasi API.

Questo posiziona il lavoro agentico in modo verificabile: i connettori read-only possono partire ora; l’accesso ai servizi personalizzati richiede un accordo istituzionale concreto e autorizzazioni per servizio.
