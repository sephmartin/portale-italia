import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { IpaClient, searchResultSchema, officesResultSchema } from './ipa.js';

const pagination = {
  limit: z.number().int().min(1).max(20).default(10).describe('Numero di risultati, da 1 a 20.'),
  offset: z.number().int().min(0).max(10_000).default(0).describe('Offset restituito da next_offset, inizialmente 0.'),
};
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };

function failure(error: unknown) {
  const known = error instanceof Error ? error.message : 'Errore sconosciuto.';
  const text = known.includes('Indice PA') || known.includes('IPA') ? known
    : 'Impossibile leggere una risposta valida da Indice PA. Riprova più tardi; non usare contatti presunti.';
  return { isError: true, content: [{ type: 'text' as const, text }] };
}

export function createServer(ipa = new IpaClient()) {
  const server = new McpServer({ name: 'portale-italia-mcp-server', version: '0.1.0' });
  server.registerTool('ipa_search_entities', {
    title: 'Cerca enti nell’Indice PA',
    description: 'Cerca per denominazione nel registro pubblico ufficiale IPA. Restituisce codici IPA, contatti istituzionali, fonte e date. Disambigua i risultati prima di chiedere l’ufficio digitale. Solo lettura, nessuna autorizzazione ai servizi personali.',
    inputSchema: z.object({
      query: z.string().trim().min(2).max(120).describe('Denominazione o parte del nome, es. Comune di Bologna.'),
      ...pagination,
    }),
    outputSchema: searchResultSchema,
    annotations,
  }, async ({ query, limit, offset }) => {
    try {
      const result = await ipa.search(query, limit, offset);
      return { structuredContent: result, content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return failure(error); }
  });
  server.registerTool('ipa_get_digital_office', {
    title: 'Trova ufficio e responsabile della transizione digitale',
    description: 'Usa un codice IPA esatto ottenuto dalla ricerca per leggere gli uffici digitali e i referenti pubblicati. Nessun risultato non implica nessun RTD. Il refresh del dataset è distinto dalla data del record. Non invia messaggi e non concede accesso alle API.',
    inputSchema: z.object({
      ipa_code: z.string().trim().min(1).max(50).regex(/^[a-zA-Z0-9_.-]+$/).describe('Codice IPA esatto restituito da ipa_search_entities.'),
      ...pagination,
    }),
    outputSchema: officesResultSchema,
    annotations,
  }, async ({ ipa_code, limit, offset }) => {
    try {
      const result = await ipa.digitalOffice(ipa_code, limit, offset);
      return { structuredContent: result, content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return failure(error); }
  });
  return server;
}
