const defaultFactors = [
  {
    id: 'electricity-grid-average',
    scope: 'scope2',
    unit: 'kWh',
    emissionFactorKgCo2e: 0.386,
    source: 'Default grid average factor',
  },
  {
    id: 'diesel-litre',
    scope: 'scope1',
    unit: 'litre',
    emissionFactorKgCo2e: 2.68,
    source: 'Default stationary combustion factor',
  },
  {
    id: 'llm-token-batch',
    scope: 'scope3',
    unit: '1k-tokens',
    emissionFactorKgCo2e: 0.012,
    source: 'Default inference estimate factor',
  },
  {
    id: 'server-hour',
    scope: 'scope2',
    unit: 'server-hour',
    emissionFactorKgCo2e: 0.145,
    source: 'Default server utilization factor',
  },
];

function buildFactorIndex(factors = defaultFactors) {
  const index = new Map();

  for (const factor of factors) {
    index.set(factor.id, factor);
  }

  return index;
}

module.exports = {
  defaultFactors,
  buildFactorIndex,
};
