const BLOCK_PATTERNS = {
  opportunity: /\[SAVINGS_OPPORTUNITY\]\s*([\s\S]*?)\s*\[\/SAVINGS_OPPORTUNITY\]/g,
  fact: /\[SESSION_FACT\]\s*([\s\S]*?)\s*\[\/SESSION_FACT\]/g,
  phase: /\[PHASE_UPDATE\]\s*([\s\S]*?)\s*\[\/PHASE_UPDATE\]/g,
  scenario: /\[SCENARIO_VIEW\]\s*([\s\S]*?)\s*\[\/SCENARIO_VIEW\]/g,
}

function parseJsonBlock(raw) {
  try {
    return JSON.parse(raw.trim())
  } catch {
    return null
  }
}

export function stripStructuredBlocks(text) {
  return text
    .replace(/\[SAVINGS_OPPORTUNITY\][\s\S]*?\[\/SAVINGS_OPPORTUNITY\]/g, '')
    .replace(/\[SESSION_FACT\][\s\S]*?\[\/SESSION_FACT\]/g, '')
    .replace(/\[PHASE_UPDATE\][\s\S]*?\[\/PHASE_UPDATE\]/g, '')
    .replace(/\[SCENARIO_VIEW\][\s\S]*?\[\/SCENARIO_VIEW\]/g, '')
    .trim()
}

export function extractInsights(text) {
  const opportunities = []
  const facts = []
  let phaseUpdate = null
  let scenarioView = null

  for (const match of text.matchAll(BLOCK_PATTERNS.opportunity)) {
    const parsed = parseJsonBlock(match[1])
    if (parsed?.title) opportunities.push(parsed)
  }

  for (const match of text.matchAll(BLOCK_PATTERNS.fact)) {
    const parsed = parseJsonBlock(match[1])
    if (parsed?.label) facts.push(parsed)
  }

  for (const match of text.matchAll(BLOCK_PATTERNS.phase)) {
    const parsed = parseJsonBlock(match[1])
    if (parsed?.phase) phaseUpdate = parsed
  }

  for (const match of text.matchAll(BLOCK_PATTERNS.scenario)) {
    const parsed = parseJsonBlock(match[1])
    if (parsed?.scenarios?.length) scenarioView = parsed
  }

  return { opportunities, facts, phaseUpdate, scenarioView }
}

export function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatSavingRange(low, high) {
  if (!low && !high) return 'TBD'
  if (low === high) return formatCurrency(low)
  return `${formatCurrency(low)} – ${formatCurrency(high)}`
}

export const PHASES = [
  { id: 'discovery', label: 'Discovery', description: 'Understanding the IT spend landscape' },
  { id: 'deep-dive', label: 'Deep Dive', description: 'Exploring cost drivers in detail' },
  { id: 'analysis', label: 'Analysis', description: 'Benchmarking and opportunity sizing' },
  { id: 'roadmap', label: 'Roadmap', description: 'Prioritised savings plan' },
]

export function getPhaseIndex(phaseId) {
  return PHASES.findIndex((p) => p.id === phaseId)
}
