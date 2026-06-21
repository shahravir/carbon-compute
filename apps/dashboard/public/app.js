const demoRecords = [
  { id: 'grid-001', name: 'HQ electricity', scope: 'scope2', unit: 'kWh', activityValue: 120000, emissionFactorId: 'electricity-grid-average', source: 'utility-bill' },
  { id: 'diesel-001', name: 'Backup generator', scope: 'scope1', unit: 'litre', activityValue: 430, emissionFactorId: 'diesel-litre', source: 'fuel-log' },
  { id: 'llm-001', name: 'LLM inference', scope: 'scope3', unit: '1k-tokens', activityValue: 5200, emissionFactorId: 'llm-token-batch', source: 'model-usage' },
];

const recordsInput = document.getElementById('records-input');
const calculationOutput = document.getElementById('calculation-output');
const calculationStatus = document.getElementById('calculation-status');
const ledgerStatus = document.getElementById('ledger-status');
const summaryCards = document.getElementById('summary-cards');

document.getElementById('seed-demo').addEventListener('click', () => {
  recordsInput.value = JSON.stringify(demoRecords, null, 2);
});

document.getElementById('calculate').addEventListener('click', async () => {
  calculationStatus.textContent = 'Calculating...';
  calculationStatus.className = 'status-warn';

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ records: JSON.parse(recordsInput.value || '[]') }),
    });

    const payload = await response.json();
    calculationOutput.textContent = JSON.stringify(payload, null, 2);
    calculationStatus.textContent = 'Done';
    calculationStatus.className = 'status-ok';
    await refreshLedger();
  } catch (error) {
    calculationOutput.textContent = String(error.message || error);
    calculationStatus.textContent = 'Error';
    calculationStatus.className = 'status-error';
  }
});

async function loadMeta() {
  const response = await fetch('/api/meta');
  const meta = await response.json();

  summaryCards.innerHTML = [
    { value: meta.deploymentMode, label: 'Deployment mode' },
    { value: meta.trustModel, label: 'Trust model' },
    { value: meta.dataSources.length, label: 'Active source classes' },
  ].map(renderMetricCard).join('');
}

async function refreshLedger() {
  const [ledgerResponse, verificationResponse] = await Promise.all([
    fetch('/api/audit-ledger'),
    fetch('/api/audit-ledger/verify'),
  ]);

  const entries = await ledgerResponse.json();
  const verification = await verificationResponse.json();
  const lastEntry = entries[entries.length - 1];

  ledgerStatus.innerHTML = [
    { value: verification.ok ? 'verified' : verification.reason, label: 'Ledger integrity' },
    { value: entries.length, label: 'Entries' },
    { value: lastEntry ? lastEntry.payload.type : 'none', label: 'Latest event' },
  ].map(renderMetricCard).join('');
}

function renderMetricCard(metric) {
  return `<div class="metric-card"><div class="value">${escapeHtml(String(metric.value))}</div><div class="label">${escapeHtml(metric.label)}</div></div>`;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

recordsInput.value = JSON.stringify(demoRecords, null, 2);
loadMeta().then(refreshLedger).catch((error) => {
  calculationOutput.textContent = String(error.message || error);
});
