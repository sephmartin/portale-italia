# Portale Italia MCP — primo connettore reale

Server MCP open source che consulta l’**Indice delle Pubbliche Amministrazioni (IPA)** per trovare enti e uffici della transizione digitale. Non richiede credenziali né un account LLM. Il connettore legge dati istituzionali pubblici; non accede a pratiche personali e non compie operazioni amministrative.

## Cosa fa adesso

| Tool | Input | Risultato |
|---|---|---|
| `ipa_search_entities` | `query`, `limit` 1–20, `offset` | Candidati con denominazione, codice IPA, sito e contatti istituzionali |
| `ipa_get_digital_office` | `ipa_code` esatto, `limit` 1–20, `offset` | Ufficio, referente e contatti pubblicati per quell’ente |

Entrambi restituiscono dati strutturati, fonte, licenza, data di recupero, refresh della fonte e data del singolo record. Sono annotati come sola lettura e non inviano messaggi. La fonte è interrogata al momento della chiamata; solo i metadati del dataset vengono riutilizzati per cinque minuti.

Esempio: “Comune di Bologna” può includere anche Castel Guelfo di Bologna. L’agente deve selezionare il codice dell’ente esatto prima di leggere il suo ufficio digitale. Nessun ufficio trovato significa **nessun record pubblicato in quel dataset**: non prova l’assenza di una nomina RTD. Una data di refresh recente non rende recente un contatto aggiornato anni prima.

Fonti ufficiali: [registro degli enti](https://indicepa.gov.it/ipa-dati/dataset/enti), [uffici e RTD](https://indicepa.gov.it/ipa-dati/dataset/responsabili-della-transizione-al-digitale), [guida del portale IPA](https://indicepa.gov.it/ipa-files/help-portale/index.html). L’API open data CKAN usata qui è distinta dai webservice IPA che richiedono un identificativo di autorizzazione.

## Avvio

Richiede Node.js 22 o superiore. Questo pacchetto ha dipendenze e build proprie e non modifica l’app React esistente.

```sh
cd mcp-server
npm ci --ignore-scripts
npm run build
```

Per un client MCP che avvia processi locali, usare `node` con il **percorso assoluto** di `mcp-server/dist/index.js`. Esempio di configurazione da adattare al proprio client:

```json
{
  "mcpServers": {
    "portale-italia": {
      "command": "node",
      "args": ["/percorso/assoluto/portale-italia/cittadino-os/mcp-server/dist/index.js"]
    }
  }
}
```

Per un client MCP Streamable HTTP locale:

```sh
npm run start:http
```

Endpoint: `http://127.0.0.1:9876/mcp`. Porta alternativa: `node dist/index.js --http --port 9877`. Il server ascolta solo sul computer locale, valida Host e Origin e limita le richieste a 64 KiB. Non ha autenticazione perché questa versione locale offre esclusivamente lookup di dati pubblici.

**Un chatbot ospitato nel cloud non può raggiungere questo indirizzo locale.** Il servizio di sola lettura qui descritto resta locale. La [demo ibrida separata](demo/README.md) offre invece HTTPS temporaneo, OAuth e un widget provati in ChatGPT il 1 ottobre 2026, con prenotazioni esclusivamente sintetiche. “Supporta MCP” non significa che tutti i chatbot accettino qualsiasi trasporto o siano già collegati.

## Verifica ripetibile

```sh
npm run build
npm run verify:contract
npm run verify:live
```

La verifica del contratto usa dati artificiali e controlla schemi, paginazione, filtri esatti, provenienza e gestione degli errori. La verifica live avvia client MCP reali su stdio e HTTP, consulta IPA, verifica i limiti locali e prova la discovery con un protocollo del 2025. Salva una fotografia in [verification/live.json](verification/live.json). Non occorrono chiavi API o un modello LLM. Le verifiche live possono fallire se il servizio upstream è indisponibile o se cambia il caso di disambiguazione usato.

## Perimetro tecnico

- TypeScript, SDK MCP ufficiale v2, Zod v4; dipendenze bloccate nel lockfile.
- `src/ipa.ts`: adapter CKAN su un dominio fisso, letture con timeout e limite di dimensione, risorse scoperte dai metadati.
- `src/server.ts`: due tool con input/output espliciti e risultati strutturati.
- `src/index.ts`: trasporto stdio; stdout riservato al protocollo.
- `src/http.ts`: endpoint Streamable HTTP stateless locale.
- Nessuna URL arbitraria, query SQL, raccolta massiva di rubriche, invio o credenziale PA.

Le stringhe restituite dalla fonte sono dati, non istruzioni per l’agente. Sito e mail sono campi pubblicati dall’ente: non sono certificazioni di disponibilità, risposta o potere di autorizzazione.

## Passaggio ai servizi operativi

Il prossimo adapter dipenderà da un pilota concordato: candidato iniziale **consultazione disponibilità, prenotazione e cancellazione di un appuntamento** in ambiente di collaudo. Non è implementato e non abbiamo ancora verificato un endpoint utilizzabile. Serviranno ente titolare, operatore della piattaforma, API documentata, autorizzazioni e modalità di autenticazione del cittadino. Le azioni avranno conferma umana verificabile, prevenzione dei duplicati, ricevuta e gestione degli errori.

Vedi [mappa, ruoli e piano di contatto](../docs/strategy/piano-agentico-pa.md) e [ricerca API](../docs/research/agentic-pa-apis.md).

## Licenze

Codice di questo pacchetto: **AGPL-3.0-only**, coerente con il [file LICENSE](../LICENSE) e `publiccode.yml` del progetto. È stato allineato anche il metadato di licenza dell’app principale, che riportava MIT. I dati IPA dichiarano **CC BY 4.0** nei metadati verificati; la licenza dei dati è restituita in ogni lookup e rimane distinta da quella del codice. Se si separa il backend in un repository autonomo, includere anche il file LICENSE.

## Demo ibrida con login

`npm run demo` apre il percorso su http://127.0.0.1:9880: OAuth locale con PKCE, utenti fittizi, prenotazione simulata via MCP, conferma, ricevuta e attività. Istruzioni e limiti in [demo/README.md](demo/README.md). Il widget MCP Apps è predisposto, ma ChatGPT non è ancora collegato.
