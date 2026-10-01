import { createServer as createNodeServer } from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler, localhostHostValidation, localhostOriginValidation } from '@modelcontextprotocol/node';
import { createServer } from './server.js';
import { IpaClient } from './ipa.js';

export function createHttpServer() {
  const ipa = new IpaClient();
  const handler = createMcpHandler(() => createServer(ipa));
  const nodeHandler = toNodeHandler(handler, { maxRequestBodySize: 64 * 1024 });
  const validateHost = localhostHostValidation();
  const validateOrigin = localhostOriginValidation();
  const server = createNodeServer((request, response) => {
    if (!validateHost(request, response) || !validateOrigin(request, response)) return;
    if (request.url?.split('?')[0] !== '/mcp') {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Usa /mcp.');
      return;
    }
    void nodeHandler(request, response).catch(() => {
      if (response.writableEnded || response.destroyed) return;
      if (!response.headersSent) response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Richiesta MCP non completata.');
    });
  });
  return { server, close: async () => {
    await handler.close();
    if (server.listening) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  } };
}
