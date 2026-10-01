# Hosting della demo MCP su VPS Linux

Stato: 1 ottobre 2026. Valutazione, nessun deployment remoto effettuato.

## Risultato verificato

La VPS Oracle configurata non è raggiungibile via SSH. Il peer Tailscale è offline; ultima presenza il 24 settembre 2026, ore 01:50 Europe/Rome. Questo non distingue istanza spenta da Tailscale/SSH indisponibili. CPU, RAM, spazio, runtime e servizi attivi non sono stati verificati.

La console Tailscale ha mostrato una chiave scaduta. L’estensione di 30 minuti, autorizzata dal proprietario, è stata applicata ma non ha riportato il peer online. Il successivo controllo SSH ha restituito ancora un timeout: non è stato possibile riautenticare Linux. Per proseguire serve un accesso indipendente da Tailscale, per esempio la console Oracle, e la verifica dello stato dell’istanza e del servizio. Nessuna scadenza è stata disabilitata e nessun gateway è stato riavviato.

Per scelta del proprietario la demo rimane temporaneamente sul Mac. La migrazione è rinviata finché l’accesso remoto non sarà ripristinato e l’ambiente verificato.

## Architettura proposta

ChatGPT -> HTTPS pubblico stabile -> reverse proxy o Cloudflare Tunnel nominato -> server Node.js su loopback della VPS -> tool MCP e servizio sintetico.

Il Mac serve soltanto per sviluppo. Il servizio Node richiede Node.js >=22 e le dipendenze complete del pacchetto: il client MCP viene usato anche dal server demo e oggi è una devDependency, quindi non usare `npm ci --omit=dev`.

## Passaggi quando torna accessibile

1. Verificare risorse, sistema operativo, servizi, porte e proxy esistenti. Nessun riavvio di gateway condivisi.
2. Concordare un hostname del dominio Portale Italia. Il server oggi accetta soltanto HTTPS `*.trycloudflare.com`: prima di un dominio stabile aggiungere l’origine scelta a un’allowlist esplicita, preservando controllo Host/Origin, callback OAuth esatto, PKCE, audience e cookie Secure. Non accettare URL arbitrarie.
3. Preparare una directory e un utente dedicati, distribuire soltanto il pacchetto MCP, installare le dipendenze bloccate e compilare TypeScript.
4. Avviare il processo con systemd, utente non privilegiato, porta loopback, limiti di risorse e riavvio su errore; niente porte pubbliche dirette del backend.
5. Riutilizzare il proxy HTTPS esistente o un Tunnel nominato autorizzato. Le eventuali credenziali di tunnel rimangono sulla VPS, fuori dal repository.
6. Separare i log di processo dai dati demo: evitare querystring OAuth, token, cookie e contenuti chat nei log del proxy; conservazione limitata.
7. Verificare discovery, OAuth, tool e widget sul nuovo endpoint. Ricollegare l’app ChatGPT con il nuovo URL; i token e le sessioni vecchie non vengono trasferiti.
8. Preservare il vecchio tunnel fino alla prova del nuovo collegamento, poi dismetterlo con un passaggio esplicito.

## Perimetro della prima versione remota

Identità e prenotazioni restano sintetiche e in memoria: un riavvio cancella sessioni, ricevute e registro. Un processo stabile non trasforma questo in un servizio PA di produzione. Per continuità dei dati serve progettare persistenza, scadenze, revoca, cancellazione, rate limit e gestione degli errori prima dell’uso reale.

Non migrare credenziali o sessioni del browser/Mac. La precedente prenotazione sul Mac rimane nella vecchia demo; la nuova istanza partirebbe con dati nuovi.

Fonti tecniche: [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/), [OAuth ChatGPT](https://developers.openai.com/plugins/build/auth).
