import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { createHttpServer } from '../dist/http.js';

const expectedTools = ['ipa_get_digital_office', 'ipa_search_entities'];
const checks = [];
async function check(name, work) { await work(); checks.push(name); }
function readResult(result) {
  assert.equal(result.isError, undefined, JSON.stringify(result.content));
  assert.ok(result.structuredContent, 'Structured content missing');
  return result.structuredContent;
}
function wireStatus(url, headers) {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers }, response => {
      response.resume();
      response.once('end', () => resolve(response.statusCode));
    });
    req.once('error', reject);
    req.end();
  });
}

const stdio = new Client({ name: 'portale-italia-live-verification', version: '0.1.0' });
let sample;
try {
  await stdio.connect(new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../dist/index.js', import.meta.url))],
    stderr: 'pipe',
  }));
  await check('stdio: discovery dei due tool', async () => {
    const tools = (await stdio.listTools()).tools;
    assert.deepEqual(tools.map(tool => tool.name).sort(), expectedTools);
    assert.ok(tools.every(tool => tool.annotations?.readOnlyHint));
  });
  await check('stdio: ricerca live e disambiguazione di Bologna', async () => {
    const result = readResult(await stdio.callTool({
      name: 'ipa_search_entities', arguments: { query: 'Comune di Bologna' },
    }));
    const match = result.entities.find(entity => entity.name === 'Comune di Bologna');
    assert.ok(match, 'Ente esatto non trovato');
    assert.ok(result.entities.length > 1, 'Il caso di disambiguazione è cambiato: rivedere questo controllo');
    assert.equal(result.source.license, 'CC-BY-4.0');
    sample = { ipa_code: match.ipa_code, entity: match.name, search_matches: result.total };
  });
  await check('stdio: referente live da codice IPA esatto e date distinte', async () => {
    const result = readResult(await stdio.callTool({
      name: 'ipa_get_digital_office', arguments: { ipa_code: sample.ipa_code },
    }));
    assert.equal(result.entity_found, true);
    assert.equal(result.entity.ipa_code, sample.ipa_code);
    assert.ok(result.offices.length > 0);
    assert.ok(result.offices[0].record_updated_at);
    assert.ok(result.sources.offices.dataset_refreshed_at);
    assert.notEqual(result.offices[0].record_updated_at, result.sources.offices.dataset_refreshed_at);
    sample.office_records = result.total_offices;
    sample.office_record_updated_at = result.offices[0].record_updated_at;
    sample.dataset_refreshed_at = result.sources.offices.dataset_refreshed_at;
  });
} finally { await stdio.close(); }

const http = createHttpServer();
await new Promise((resolve, reject) => {
  http.server.once('error', reject);
  http.server.listen(0, '127.0.0.1', resolve);
});
const url = new URL(`http://127.0.0.1:${http.server.address().port}/mcp`);
const httpClient = new Client({ name: 'portale-italia-http-verification', version: '0.1.0' });
try {
  await httpClient.connect(new StreamableHTTPClientTransport(url));
  await check('HTTP: discovery dei due tool', async () => {
    assert.deepEqual((await httpClient.listTools()).tools.map(tool => tool.name).sort(), expectedTools);
  });
  await check('HTTP: chiamata live a IPA', async () => {
    const result = readResult(await httpClient.callTool({
      name: 'ipa_get_digital_office', arguments: { ipa_code: sample.ipa_code, limit: 1 },
    }));
    assert.equal(result.entity.ipa_code, sample.ipa_code);
    assert.equal(result.offices.length, 1);
  });
  await check('HTTP: rifiuta Host esterno', async () => {
    assert.equal(await wireStatus(url, { Host: 'attacker.example' }), 403);
  });
  await check('HTTP: rifiuta Origin esterna', async () => {
    assert.equal((await fetch(url, { headers: { Origin: 'https://attacker.example' } })).status, 403);
  });
  await check('HTTP: limita il percorso a /mcp', async () => {
    assert.equal((await fetch(new URL('/other', url))).status, 404);
  });
  await check('HTTP: rifiuta body oltre 64 KiB', async () => {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(65 * 1024),
    });
    assert.equal(response.status, 413);
  });
  await check('HTTP: discovery con protocollo MCP 2025-06-18', async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-06-18' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    assert.equal(response.status, 200);
    const raw = await response.text();
    const payload = response.headers.get('content-type')?.includes('text/event-stream')
      ? raw.split('\n').find(line => line.startsWith('data: '))?.slice(6)
      : raw;
    assert.ok(payload, 'Risposta MCP vuota');
    const body = JSON.parse(payload);
    assert.deepEqual(body.result.tools.map(tool => tool.name).sort(), expectedTools);
  });
} finally {
  await httpClient.close();
  await http.close();
}
const report = {
  verified_at: new Date().toISOString(),
  scope: 'MCP SDK clients + API pubblica IPA; nessun account ChatGPT, dato personale del cittadino o azione PA.',
  checks_passed: checks.length,
  checks,
  sample,
};
const output = new URL('../verification/live.json', import.meta.url);
await mkdir(new URL('../verification/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
