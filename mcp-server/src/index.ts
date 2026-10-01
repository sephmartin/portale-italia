import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';
import { createHttpServer } from './http.js';

async function main() {
  const args = process.argv.slice(2);
  let close: () => Promise<void>;
  if (args.length === 0) {
    const handle = serveStdio(() => createServer());
    close = () => handle.close();
  } else if (args[0] === '--http' && (args.length === 1 || (args.length === 3 && args[1] === '--port'))) {
    const port = args[2] === undefined ? 9876 : Number(args[2]);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Porta non valida.');
    const http = createHttpServer();
    await new Promise<void>((resolve, reject) => {
      http.server.once('error', reject);
      http.server.listen(port, '127.0.0.1', resolve);
    });
    console.error(`Portale Italia MCP: http://127.0.0.1:${port}/mcp (sola lettura, locale)`);
    close = http.close;
  } else {
    throw new Error('Uso: node dist/index.js [--http [--port 9876]]');
  }
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => { void close().then(() => { process.exitCode = 0; }); });
  }
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Avvio MCP fallito.');
  process.exitCode = 1;
});
