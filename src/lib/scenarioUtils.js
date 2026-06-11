import { METRICS, SCENARIOS, getScenarioById } from '../data/scenarios'

export function getMetricValue(scenario, key) {
  return scenario?.data?.[key] ?? '—'
}

export function buildComparisonRows(scenarioIds) {
  const scenarios = scenarioIds.map((id) => getScenarioById(id)).filter(Boolean)

  return METRICS.map((metric) => ({
    ...metric,
    values: scenarios.map((s) => ({
      scenarioId: s.id,
      value: getMetricValue(s, metric.key),
      color: s.color,
    })),
  }))
}

export function getDeltaDirection(metricKey, baselineValue, compareValue) {
  const lowerIsBetter = [
    'totalITSpend',
    'itSpendPctRevenue',
    'softwareSpend',
    'softwarePctRevenue',
    'erpCount',
    'vendorContracts',
    'managementRatio',
    'annualTickets',
    'maIntegrationCost',
  ].includes(metricKey)

  const higherIsBetter = [
    'annualSavingsCapture',
    'evImpact',
    'buCoverage',
    'aiDeflectionRate',
  ].includes(metricKey)

  const baseline = parseFirstNumber(baselineValue)
  const compare = parseFirstNumber(compareValue)

  if (baseline == null || compare == null) return 'neutral'
  if (compare === baseline) return 'neutral'

  if (lowerIsBetter) return compare < baseline ? 'better' : 'worse'
  if (higherIsBetter) return compare > baseline ? 'better' : 'worse'
  return 'neutral'
}

function parseFirstNumber(value) {
  if (value == null) return null
  const str = String(value)
  const match = str.match(/([\d,.]+)/)
  if (!match) return null
  return parseFloat(match[1].replace(/,/g, ''))
}

export function formatScenarioList(ids) {
  return ids
    .map((id) => getScenarioById(id)?.label)
    .filter(Boolean)
    .join(' vs ')
}

export function getScenarioSummaryForPrompt() {
  return SCENARIOS.map(
    (s) =>
      `- **${s.label}** (${s.id}): ${s.description} — IT spend ${s.data.totalITSpend}, savings ${s.data.annualSavingsCapture}`,
  ).join('\n')
}

export function getChartMetrics(scenarioIds) {
  const scenarios = scenarioIds.map((id) => getScenarioById(id)).filter(Boolean)
  return [
    { key: 'totalITSpend', label: 'Total IT Spend ($M)' },
    { key: 'softwareSpend', label: 'Software Spend ($M)' },
    { key: 'annualSavingsCapture', label: 'Savings Capture ($M)' },
  ].map((metric) => ({
    ...metric,
    bars: scenarios.map((s) => ({
      id: s.id,
      label: s.label.split('—')[0].trim(),
      color: s.color,
      value: s.chartValues?.[metric.key] ?? 0,
    })),
  }))
}
