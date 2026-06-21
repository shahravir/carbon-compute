const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { calculatePortfolio } = require('./carbon/compute');
const { createLedger } = require('./security/ledger');
const { evaluateToolCall } = require('./policy/llm-policy');

const rootDir = path.resolve(__dirname, '../../..');
const dataDir = path.join(rootDir, 'data');
const ledger = createLedger({
  filePath: path.join(dataDir, 'ledger.jsonl'),
  signingKey: process.env.LEDGER_SIGNING_KEY || '',
});

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    sendJson(response, 500, {
      error: 'internal_error',
      message: error.message,
    });
  });
});

async function handleRequest(request, response) {
  const url = new URL(request.url, 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/healthz') {
    return sendJson(response, 200, { ok: true, service: 'carbon-compute-host' });
  }

  if (request.method === 'GET' && url.pathname === '/api/meta') {
    return sendJson(response, 200, {
      name: 'Carbon Compute Enterprise',
      version: '0.1.0',
      deploymentMode: 'hybrid',
      trustModel: 'hash-chained-audit-ledger',
      dataSources: ['cloud-billing', 'kubernetes', 'vm', 'facility', 'llm-usage', 'manual'],
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/audit-ledger') {
    return sendJson(response, 200, ledger.load());
  }

  if (request.method === 'GET' && url.pathname === '/api/audit-ledger/verify') {
    return sendJson(response, 200, ledger.verify());
  }

  if (request.method === 'POST' && url.pathname === '/api/calculate') {
    const body = await readJsonBody(request);
    const records = Array.isArray(body.records) ? body.records : [];
    const result = calculatePortfolio(records, { methodology: body.methodology });
    ledger.append({ type: 'carbon_calculation', inputCount: records.length, totals: result.totals });
    return sendJson(response, 200, result);
  }

  if (request.method === 'POST' && url.pathname === '/api/ingest') {
    const body = await readJsonBody(request);
    const entry = ledger.append({ type: 'ingest', source: body.source || 'manual', payload: body.payload || body });
    return sendJson(response, 200, { ok: true, entry });
  }

  if (request.method === 'POST' && url.pathname === '/api/llm/tool-call') {
    const body = await readJsonBody(request);
    const decision = evaluateToolCall(body);
    ledger.append({ type: 'llm_tool_call', decision, toolName: body.toolName, userRole: body.userRole });
    return sendJson(response, 200, decision);
  }

  if ((request.method === 'GET' && url.pathname === '/') || (request.method === 'GET' && url.pathname.startsWith('/assets/'))) {
    return serveStatic(response, url.pathname);
  }

  return sendJson(response, 404, { error: 'not_found' });
}

function serveStatic(response, requestPath) {
  const dashboardRoot = path.join(rootDir, 'apps/dashboard/public');
  const filePath = requestPath === '/' ? path.join(dashboardRoot, 'index.html') : path.join(dashboardRoot, requestPath.replace('/assets/', ''));

  if (!filePath.startsWith(dashboardRoot)) {
    return sendJson(response, 403, { error: 'forbidden' });
  }

  if (!fs.existsSync(filePath)) {
    return sendJson(response, 404, { error: 'asset-not-found' });
  }

  const contentType = filePath.endsWith('.css') ? 'text/css' : filePath.endsWith('.js') ? 'application/javascript' : 'text/html';
  response.writeHead(200, { 'content-type': contentType });
  response.end(fs.readFileSync(filePath));
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body, null, 2));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      if (!chunks.length) {
        return resolve({});
      }

      try {
        const json = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(json);
      } catch (error) {
        reject(new Error('invalid-json-body'));
      }
    });
    request.on('error', reject);
  });
}

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  process.stdout.write(`Carbon Compute Enterprise host listening on http://localhost:${port}\n`);
});
