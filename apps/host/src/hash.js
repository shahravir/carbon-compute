const crypto = require('node:crypto');

function canonicalize(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`);
  return `{${entries.join(',')}}`;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function hmac(text, secret) {
  if (!secret) {
    return null;
  }

  return crypto.createHmac('sha256', secret).update(text).digest('hex');
}

function hashEntry(entry) {
  return sha256(canonicalize(entry));
}

module.exports = {
  canonicalize,
  sha256,
  hmac,
  hashEntry,
};
