import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { IpaClient } from '../dist/ipa.js';
import { createServer } from '../dist/server.js';

// Synthetic, frozen records; no real email address or person. Not an IPA snapshot.
const entities = [
  { Codice_IPA: 'c_fixture_a', Denominazione_ente: 'Comune Alfa', Data_aggiornamento: '2025-12-11', Mail1: 'ente@example.invalid', Tipo_Mail1: 'PEC' },
  { Codice_IPA: 'c_fixture_b', Denominazione_ente: 'Comune Alfa Piccolo', Data_aggiornamento: '2025-04-01' },
];
const offices = [{
  Codice_IPA: 'c_fixture_a', Codice_uni_uo: 'FIXTURE', Descrizione_uo: 'Ufficio digitale',
  Nome_responsabile: 'Nome', Cognome_responsabile: 'Fittizio', Mail_responsabile: 'rtd@example.invalid',
  Data_aggiornamento: '2024-03-15',
}];
const calls = [];
let mode = 'ok';
const fetcher = async input => {
  const url = new URL(String(input));
  calls.push(url);
  assert.equal(url.origin, 'https://indicepa.gov.it');
  if (url.pathname.endsWith('/package_show')) {
    const id = url.searchParams.get('id') === 'enti' ? 'fixture-enti' : 'fixture-uffici';
    return Response.json({ success: true, result: {
      license_id: 'CC-BY-4.0', license_url: 'https://creativecommons.org/licenses/by/4.0/',
      resources: [
        { id: 'inactive', datastore_active: false },
        { id, datastore_active: true, last_modified: '2026-09-30T03:14:00' },
      ],
    } });
  }
  assert.ok(url.pathname.endsWith('/datastore_search'));
  if (mode === 'unavailable') return new Response('', { status: 503 });
  if (mode === 'malformed') return Response.json({ success: true, result: { total: 'invalid', records: [] } });
  let records = url.searchParams.get('resource_id') === 'fixture-enti' ? entities : offices;
  const filters = JSON.parse(url.searchParams.get('filters') ?? '{}');
  const q = JSON.parse(url.searchParams.get('q') ?? '{}');
  if (filters.Codice_IPA) records = records.filter(row => row.Codice_IPA === filters.Codice_IPA);
  if (q.Denominazione_ente) records = records.filter(row => row.Denominazione_ente?.includes(q.Denominazione_ente));
  if (mode === 'wrong-code' && url.searchParams.get('resource_id') === 'fixture-uffici') {
    records = [{ ...offices[0], Codice_IPA: 'another_entity' }];
  }
  const total = records.length;
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const limit = Number(url.searchParams.get('limit') ?? 10);
  return Response.json({ success: true, result: { total, records: records.slice(offset, offset + limit) } });
};
const ipa = new IpaClient(fetcher);
const handler = createMcpHandler(() => createServer(ipa));
const client = new Client({ name: 'portale-italia-contract-verification', version: '0.1.0' });
const checks = [];
async function check(name, work) { await work(); checks.push(name); }
async function call(name, args) {
  return client.callTool({ name, arguments: args });
}
function content(result) {
  assert.equal(result.isError, undefined, JSON.stringify(result.content));
  assert.ok(result.structuredContent);
  return result.structuredContent;
}
try {
  await client.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1/mcp'), {
    fetch: (input, init) => handler.fetch(new Request(input, init)),
  }));
  await check('schemi e annotazioni sola lettura pubblicati', async () => {
    const tools = (await client.listTools()).tools;
    assert.equal(tools.length, 2);
    assert.ok(tools.every(tool => tool.outputSchema && tool.annotations.readOnlyHint && !tool.annotations.destructiveHint));
  });
  await check('ricerca conserva candidati distinti e fonte CC BY', async () => {
    const result = content(await call('ipa_search_entities', { query: 'Comune Alfa' }));
    assert.equal(result.total, 2);
    assert.deepEqual(result.entities.map(entity => entity.ipa_code), ['c_fixture_a', 'c_fixture_b']);
    assert.equal(result.source.license, 'CC-BY-4.0');
    assert.equal(result.source.resource_id, 'fixture-enti');
    assert.ok(result.retrieved_at);
  });
  await check('paginazione conserva totale e next_offset', async () => {
    const result = content(await call('ipa_search_entities', { query: 'Comune Alfa', limit: 1 }));
    assert.equal(result.entities.length, 1);
    assert.equal(result.next_offset, 1);
    const page2 = content(await call('ipa_search_entities', { query: 'Comune Alfa', limit: 1, offset: 1 }));
    assert.equal(page2.entities[0].ipa_code, 'c_fixture_b');
    assert.equal(page2.next_offset, null);
  });
  await check('ufficio selezionato per codice esatto e metadati distinti dalla data del record', async () => {
    const result = content(await call('ipa_get_digital_office', { ipa_code: 'c_fixture_a' }));
    assert.equal(result.entity.ipa_code, 'c_fixture_a');
    assert.equal(result.offices[0].responsible_name, 'Nome Fittizio');
    assert.equal(result.offices[0].record_updated_at, '2024-03-15');
    assert.equal(result.sources.offices.dataset_refreshed_at, '2026-09-30T03:14:00');
    assert.equal(result.sources.offices.resource_id, 'fixture-uffici');
    const officeQuery = calls.find(url => url.searchParams.get('resource_id') === 'fixture-uffici');
    assert.deepEqual(JSON.parse(officeQuery.searchParams.get('filters')), { Codice_IPA: 'c_fixture_a' });
    assert.equal(calls.filter(url => url.pathname.endsWith('/package_show')).length, 2);
  });
  await check('ente senza record RTD non viene dichiarato senza nomina', async () => {
    const result = content(await call('ipa_get_digital_office', { ipa_code: 'c_fixture_b' }));
    assert.equal(result.entity_found, true);
    assert.equal(result.total_offices, 0);
    assert.ok(result.notes.some(note => note.includes('non dimostra')));
  });
  await check('codice inesistente non restituisce un ente presunto', async () => {
    const result = content(await call('ipa_get_digital_office', { ipa_code: 'not_found' }));
    assert.equal(result.entity_found, false);
    assert.equal(result.entity, null);
  });
  await check('input fuori schema rifiutati prima di contattare IPA', async () => {
    const before = calls.length;
    for (const args of [{ query: 'x' }, { query: 'Comune', limit: 30 }, { query: 'Comune', offset: -1 }]) {
      const result = await call('ipa_search_entities', args);
      assert.equal(result.isError, true);
    }
    const result = await call('ipa_get_digital_office', { ipa_code: 'bad"code' });
    assert.equal(result.isError, true);
    assert.equal(calls.length, before);
  });
  await check('indisponibilità upstream produce errore esplicito', async () => {
    mode = 'unavailable';
    const result = await call('ipa_search_entities', { query: 'Comune Alfa' });
    assert.equal(result.isError, true);
    assert.ok(result.content[0].text.includes('503'));
  });
  await check('schema upstream non valido non genera contatti', async () => {
    mode = 'malformed';
    const result = await call('ipa_search_entities', { query: 'Comune Alfa' });
    assert.equal(result.isError, true);
    assert.equal(result.structuredContent, undefined);
  });
  await check('record di un altro ente rifiutato nel lookup esatto', async () => {
    mode = 'wrong-code';
    const result = await call('ipa_get_digital_office', { ipa_code: 'c_fixture_a' });
    assert.equal(result.isError, true);
    assert.ok(result.content[0].text.includes('non corrispondono'));
  });
} finally {
  await client.close();
  await handler.close();
}
const report = { verified_at: new Date().toISOString(), scope: 'Fixture artificiali, protocollo MCP e contratto adapter; nessuna rete PA.', checks_passed: checks.length, checks };
await mkdir(new URL('../verification/', import.meta.url), { recursive: true });
await writeFile(new URL('../verification/contract.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
