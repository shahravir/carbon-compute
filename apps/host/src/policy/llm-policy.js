function redactSecrets(text) {
  return String(text)
    .replace(/sk-[a-zA-Z0-9]{16,}/g, '[redacted-secret]')
    .replace(/AKIA[0-9A-Z]{16}/g, '[redacted-aws-key]');
}

function evaluateToolCall({ userRole, toolName, payload }) {
  const allowedTools = new Set([
    'calculate_carbon',
    'ingest_activity',
    'verify_audit_ledger',
    'fetch_emission_factor',
    'generate_report_draft',
  ]);

  if (!allowedTools.has(toolName)) {
    return { allowed: false, reason: 'tool-not-allowed' };
  }

  if (userRole === 'auditor' && toolName === 'ingest_activity') {
    return { allowed: false, reason: 'auditor-cannot-write' };
  }

  return {
    allowed: true,
    payload: {
      ...payload,
      prompt: payload && payload.prompt ? redactSecrets(payload.prompt) : payload && payload.prompt,
    },
  };
}

module.exports = {
  redactSecrets,
  evaluateToolCall,
};
