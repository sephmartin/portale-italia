# Demo ibrida Portale Italia

## Avvio e prova

```sh
cd mcp-server
npm ci
npm run demo
```

Apri **http://127.0.0.1:9880** (usa questo indirizzo preciso, non un hostname alternativo). Per un'altra porta: `PORTALE_DEMO_PORT=9881 npm run demo`. Per arrestare: Ctrl+C nel terminale che l'ha avviata.

1. Collega un utente → scegli Alice o Bob → Autorizza la demo.
2. Scegli un orario. È una preparazione: non c'è ancora alcuna prenotazione.
3. Conferma nell'interfaccia. Appare una ricevuta `DEMO-…`.
4. Consulta le attività e scarica il registro.
5. Annulla l'appuntamento: lo slot torna disponibile.
6. Cambia utente: le ricevute dell'altro utente non vengono mostrate.
7. Espandi la ricerca IPA: questa parte legge dati pubblici reali del registro ufficiale; nessuna prenotazione reale viene creata.

Non serve un'API key OpenAI. Non c'è un modello linguistico locale: i pulsanti sono un client dimostrativo degli strumenti MCP. La componente agentica viene esposta via MCP a un client compatibile.

## Che cosa è reale

- Interfaccia interattiva, server HTTP vincolato a `127.0.0.1`.
- OAuth authorization code + PKCE S256: state, issuer, audience/resource, redirect URI e client esatto; codici monouso e access token revocabili di 15 minuti.
- Identità **solo sintetiche** Alice e Bob: non è SPID, CIE, Google login né autenticazione di una persona reale. L'identity provider è locale e dimostrativo.
- Il browser usa una sessione HttpOnly/SameSite; l'access token resta lato server. Cookie senza Secure esclusivamente perché questa demo è HTTP su loopback. Produzione richiede HTTPS + Secure.
- UI → client ufficiale MCP → `/mcp` protetto → strumenti, con bearer token verificato.
- Prenotazione, ricevuta, annullamento e controllo di proprietà: servizio simulato in memoria, nessuna API PA transazionale collegata.
- Conferma tramite endpoint UI con sessione e CSRF: non esiste uno strumento MCP che approvi la richiesta della persona. Il tool di commit respinge richieste non approvate.
- Registro visibile per l'utente dimostrativo: identità fittizia, orario, azione, eventuale identificatore della richiesta/ricevuta. Niente token, cookie, IP o contenuti di chat nel registro. Massimo 500 eventi complessivi, tutto volatile fino al riavvio.

## Interfaccia dentro ChatGPT

Il server consegna la risorsa `ui://portale-italia/appointments.html`, MIME `text/html;profile=mcp-app`, e i tool pubblicano `_meta.ui.resourceUri`. Il componente usa il bridge MCP Apps `ui/initialize`, `tools/call`, `ui/notifications/tool-result` per leggere disponibilità/ricevute. La risorsa è stata verificata via client MCP; **è stata renderizzata e provata nel vero account ChatGPT il 1 ottobre 2026**.

### Collaudo HTTPS attivo (1 ottobre 2026)

URL di prova: https://transmit-luck-information-mediterranean.trycloudflare.com
Endpoint ChatGPT: https://transmit-luck-information-mediterranean.trycloudflare.com/mcp

La modalità pubblica usa cookie Secure, origine/host esatti, OAuth DCR limitato al callback ChatGPT stabile ufficiale, issuer `iss`, PKCE e audience. Supporta permessi di lettura separati dalla scrittura; ogni sessione pubblica ottiene un'identità sintetica distinta anche scegliendo lo stesso nome Alice. La conferma rimane nella pagina demo associata alla sessione OAuth: lo strumento di preparazione restituisce un link con la richiesta da controllare.

Il tunnel non supporta SSE: l'adattatore converte le risposte MCP legacy stateless terminate in JSON; le risposte moderne usano JSON. Non ci sono notifiche o flussi persistenti in questa demo.

Il server è ancora locale e il tunnel temporaneo: il link cessa di funzionare quando termina il processo/Mac o cambia il tunnel. Non è un servizio stabile né un deployment di produzione. La verifica sul link pubblico è salvata in `verification/https.json`. Collegamento OAuth, rendering del widget, disponibilità, preparazione, conferma nella pagina e lettura della ricevuta sono stati provati nel vero ChatGPT il 1 ottobre 2026. La ricevuta di test è stata poi annullata, preservando la prenotazione preesistente.

Per ricreare il collegamento:

```sh
npx wrangler tunnel quick-start http://127.0.0.1:9881
# Copia l'URL HTTPS appena stampato in un secondo terminale:
PORTALE_DEMO_PORT=9881 PORTALE_DEMO_PUBLIC_URL=https://NOME.trycloudflare.com npm run demo
```

Per testare il collegamento pubblico:

```sh
node demo/verify-https.mjs https://NOME.trycloudflare.com
```

In ChatGPT, seguire la documentazione ufficiale corrente: abilitare la modalità sviluppatore nelle impostazioni, creare una connessione MCP, inserire l'endpoint `/mcp`, scegliere OAuth se richiesto, autorizzare l'utente fittizio. La disponibilità della modalità sviluppatore dipende dall'account/workspace. Non occorre aggiungere un client secret: il server demo usa client pubblici con PKCE e registrazione dinamica limitata.

Prompt di prova: «Mostrami gli appuntamenti disponibili dello sportello dimostrativo di Portale Italia». Poi «Prepara un orario disponibile». Aprire il link di conferma nel browser usato per l'autorizzazione, confermare e chiedere al chatbot di leggere la ricevuta.

Il prossimo passo stabile richiede hosting indipendente dal Mac, identity provider appropriato, rate limit, gestione persistenza/revoca e una revisione di sicurezza del servizio. Pubblicazione nel catalogo e operazioni PA reali non sono avvenute.

Fonti ufficiali consultate il 30 settembre 2026:

- https://developers.openai.com/plugins/build/app-quickstart
- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/deploy/connect-chatgpt

## Verifica

```sh
npm run build
npm run verify:demo
```

Esito salvato in `verification/demo.json`. Copre OAuth, accesso MCP, isolamento utenti, CSRF, consenso alla scrittura, duplicati, slot occupato, annullamento, revoca e risorsa UI. Prova manuale nel browser Codex: login Alice, disponibilità, preparazione, conferma e ricevuta. Screenshot in `../output/portale-italia-demo.png` rispetto alla radice del pacchetto MCP.

## Privacy e limiti

Lo schema locale è una dimostrazione del controllo di accesso, non una certificazione di sicurezza o conformità. Con dati PA reali vanno definiti titolare/responsabile, finalità, basi giuridiche, minimizzazione, tempi di conservazione e gestione incidenti. I risultati restituiti a un chatbot possono essere trattati anche dal relativo fornitore: non si può promettere che tutti i dati restino dentro la PA. Evitare di inviare credenziali, token o intere pratiche al modello.

La demo non traccia destinatari email. Le sessioni pubbliche hanno identità sintetiche separate e le ricevute sono filtrate per identità. Un'identità Alice/Bob non dimostra chi sia la persona che apre la pagina.

## Hosting indipendente dal Mac

Vedi il [piano VPS Linux](../../docs/strategy/hosting-vps.md). La migrazione non è ancora effettuata: la VPS configurata risulta offline sulla rete privata e non raggiungibile via SSH. I report `verification/demo.json` e `verification/https.json` conservano i limiti della loro verifica originale; il successivo test manuale ChatGPT è descritto in [verification/chatgpt-manual.json](../verification/chatgpt-manual.json).
