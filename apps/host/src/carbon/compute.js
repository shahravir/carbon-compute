const { buildFactorIndex, defaultFactors } = require('./factors');

function normalizeUnit(unit) {
  return String(unit || '').trim().toLowerCase();
}

function resolveFactor(record, factorIndex) {
  if (record.emissionFactorKgCo2e != null) {
    return {
      id: record.emissionFactorId || 'inline-factor',
      emissionFactorKgCo2e: Number(record.emissionFactorKgCo2e),
      source: record.factorSource || 'Inline factor override',
      scope: record.scope || 'unassigned',
    };
  }

  const byId = record.emissionFactorId ? factorIndex.get(record.emissionFactorId) : null;
  if (byId) {
    return byId;
  }

  const unit = normalizeUnit(record.unit);
  const matched = defaultFactors.find((factor) => normalizeUnit(factor.unit) === unit && (!record.scope || factor.scope === record.scope));
  if (matched) {
    return matched;
  }

  throw new Error(`No emission factor found for record ${record.id || record.name || 'unknown'}`);
}

function calculateRecord(record, factorIndex = buildFactorIndex()) {
  if (!record || typeof record !== 'object') {
    throw new Error('Each record must be an object.');
  }

  const activityValue = Number(record.activityValue);
  if (!Number.isFinite(activityValue) || activityValue < 0) {
    throw new Error('activityValue must be a finite non-negative number.');
  }

  const factor = resolveFactor(record, factorIndex);
  const emissionsKgCo2e = activityValue * Number(factor.emissionFactorKgCo2e);

  return {
    id: record.id || null,
    name: record.name || record.category || 'activity',
    scope: record.scope || factor.scope || 'unassigned',
    unit: record.unit || factor.unit,
    activityValue,
    emissionFactorKgCo2e: Number(factor.emissionFactorKgCo2e),
    emissionsKgCo2e,
    source: record.source || factor.source || 'unknown',
    confidence: record.confidence == null ? 0.75 : Number(record.confidence),
    metadata: record.metadata || {},
  };
}

function calculatePortfolio(records, options = {}) {
  const factorIndex = options.factorIndex || buildFactorIndex();
  const lineItems = records.map((record) => calculateRecord(record, factorIndex));

  const totals = lineItems.reduce((accumulator, item) => {
    accumulator.totalEmissionsKgCo2e += item.emissionsKgCo2e;
    accumulator.byScope[item.scope] = (accumulator.byScope[item.scope] || 0) + item.emissionsKgCo2e;
    accumulator.bySource[item.source] = (accumulator.bySource[item.source] || 0) + item.emissionsKgCo2e;
    return accumulator;
  }, { totalEmissionsKgCo2e: 0, byScope: {}, bySource: {} });

  return {
    totals,
    lineItems,
    methodology: options.methodology || 'deterministic-factors-v1',
  };
}

module.exports = {
  calculateRecord,
  calculatePortfolio,
  resolveFactor,
};
