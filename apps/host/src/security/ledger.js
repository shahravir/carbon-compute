const fs = require('node:fs');
const path = require('node:path');
const { hashEntry, hmac } = require('../hash');

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadLedger(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const contents = fs.readFileSync(filePath, 'utf8').trim();
  if (!contents) {
    return [];
  }

  return contents.split('\n').map((line) => JSON.parse(line));
}

function createLedger({ filePath, signingKey }) {
  ensureDirectory(filePath);

  function append(payload) {
    const entries = loadLedger(filePath);
    const previous = entries[entries.length - 1] || null;
    const body = {
      createdAt: new Date().toISOString(),
      previousHash: previous ? previous.entryHash : null,
      payload,
    };
    const entryHash = hashEntry(body);
    const signature = hmac(entryHash, signingKey);
    const entry = { ...body, entryHash, signature };

    fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`);
    return entry;
  }

  function verify() {
    const entries = loadLedger(filePath);
    let previousHash = null;

    for (const entry of entries) {
      const { entryHash, signature, ...body } = entry;
      if (body.previousHash !== previousHash) {
        return { ok: false, reason: 'previous-hash-mismatch' };
      }

      if (hashEntry(body) !== entryHash) {
        return { ok: false, reason: 'body-hash-mismatch' };
      }

      if (signingKey && signature !== hmac(entryHash, signingKey)) {
        return { ok: false, reason: 'signature-mismatch' };
      }

      previousHash = entryHash;
    }

    return { ok: true, entries };
  }

  return {
    append,
    verify,
    load: () => loadLedger(filePath),
  };
}

module.exports = {
  createLedger,
  loadLedger,
};
