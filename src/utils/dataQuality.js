import { CULLIGAN_PROFILE, FIELD_DEFINITIONS } from '../data/knowledgeData'

export const STATUS = {
  GREEN: 'GREEN',
  AMBER: 'AMBER',
  RED: 'RED',
  GREY: 'GREY',
}

const PLAUSIBILITY = {
  totalITSpend: { min: 30_000_000, max: 200_000_000 },
  itSpendPctRevenue: { min: 0.8, max: 6.0 },
  softwarePctOfIT: { min: 0.2, max: 0.65 },
  erpCount: { min: 1, max: 60, warnAbove: 50 },
  managementRatio: { min: 5, max: 35 },
  ticketsPerStaff: { min: 50, max: 500 },
  vendorContracts: { min: 1, max: 300 },
  acquisitionsPerYear: { min: 0, max: 100 },
  developerPctOfIT: { min: 0.05, max: 0.4 },
  offshoreDeliveryMix: { min: 0, max: 70 },
}

const QUALITY_LEVELS = [
  { min: 90, label: 'HIGH QUALITY', description: 'Analysis is reliable' },
  { min: 70, label: 'ACCEPTABLE', description: 'Analysis is directional — note key gaps' },
  { min: 50, label: 'POOR', description: 'Significant uncertainty — flag prominently' },
  { min: 0, label: 'UNRELIABLE', description: 'Do not proceed without addressing critical gaps' },
]

function isPresent(value) {
  if (value == null || value === '') return false
  if (typeof value === 'string' && /unknown|not provided|unquantified/i.test(value)) return false
  return true
}

function monthsSince(dateStr) {
  if (!dateStr) return null
  const [y, m] = dateStr.split('-').map(Number)
  if (!y || !m) return null
  const then = new Date(y, m - 1)
  const now = new Date(2026, 5) // June 2026 session date
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth())
}

function assessField(key, data, estimatedFields = {}) {
  const def = FIELD_DEFINITIONS.find((f) => f.key === key)
  if (!def) return null

  if (def.outOfScope) {
    return {
      key,
      label: def.label,
      value: data[key],
      displayValue: isPresent(data[key]) ? formatDisplay(key, data) : 'Out of scope',
      status: STATUS.GREY,
      issues: [],
      completeness: isPresent(data[key]) ? 1 : 0,
      isEstimated: !!estimatedFields[key],
    }
  }

  const value = data[key]
  const present = isPresent(value)
  const issues = []
  let status = STATUS.GREEN

  if (!present) {
    return {
      key,
      label: def.label,
      value: null,
      displayValue: key === 'buCoverage' && data.buCoverage != null
        ? `${data.buCoverage} of ${data.totalBUs ?? 40}`
        : 'Not provided',
      status: STATUS.RED,
      issues: [`${def.label} is missing — required for reliable analysis`],
      completeness: 0,
      isEstimated: false,
    }
  }

  // Plausibility checks
  if (key === 'totalITSpend' && (value < PLAUSIBILITY.totalITSpend.min || value > PLAUSIBILITY.totalITSpend.max)) {
    issues.push(`Total IT spend $${(value / 1e6).toFixed(1)}M is outside credible range ($30M–$200M) for Culligan`)
    status = STATUS.AMBER
  }

  if (key === 'itSpendPctRevenue') {
    if (value < PLAUSIBILITY.itSpendPctRevenue.min || value > PLAUSIBILITY.itSpendPctRevenue.max) {
      issues.push(`IT spend at ${value}% of revenue is outside typical range (0.8%–6.0%)`)
      status = STATUS.AMBER
    }
    if (value < 0.5) {
      issues.push('IT spend below 0.5% of revenue — likely incomplete (shadow IT not captured)')
      status = STATUS.RED
    }
  }

  if (key === 'softwareSpend' && isPresent(data.totalITSpend)) {
    const ratio = value / data.totalITSpend
    if (ratio < PLAUSIBILITY.softwarePctOfIT.min || ratio > PLAUSIBILITY.softwarePctOfIT.max) {
      issues.push(`Software is ${(ratio * 100).toFixed(0)}% of IT spend — expected 20%–65%`)
      status = STATUS.AMBER
    }
  }

  if (key === 'erpCount') {
    if (value > PLAUSIBILITY.erpCount.warnAbove) {
      issues.push(`ERP count of ${value} exceeds 50 — likely data entry error`)
      status = STATUS.RED
    } else if (value < PLAUSIBILITY.erpCount.min || value > PLAUSIBILITY.erpCount.max) {
      issues.push(`ERP count ${value} is outside plausible range (1–60)`)
      status = STATUS.AMBER
    }
  }

  if (key === 'managementRatio' && (value < PLAUSIBILITY.managementRatio.min || value > PLAUSIBILITY.managementRatio.max)) {
    issues.push(`Management ratio ${value}% outside typical range (5%–35%)`)
    status = STATUS.AMBER
  }

  if (key === 'vendorContracts') {
    if (value < PLAUSIBILITY.vendorContracts.min || value > PLAUSIBILITY.vendorContracts.max) {
      issues.push(`Vendor contract count ${value} is outside plausible range`)
      status = STATUS.AMBER
    }
    if (data.vendorContractsMinimumOnly) {
      issues.push('Vendor contracts figure reflects minimum commitments only — actual may be higher')
      status = STATUS.AMBER
    }
  }

  if (key === 'acquisitionsPerYear' && (value < 0 || value > PLAUSIBILITY.acquisitionsPerYear.max)) {
    issues.push(`Acquisitions per year (${value}) outside plausible range (0–100)`)
    status = STATUS.AMBER
  }

  if (key === 'offshoreDeliveryMix' && typeof value === 'number') {
    if (value < PLAUSIBILITY.offshoreDeliveryMix.min || value > PLAUSIBILITY.offshoreDeliveryMix.max) {
      issues.push(`Offshore mix ${value}% outside typical range (0%–70%)`)
      status = STATUS.AMBER
    }
  }

  if (key === 'buCoverage') {
    const total = data.totalBUs ?? CULLIGAN_PROFILE.totalBUs
    const pct = (value / total) * 100
    if (pct < 50) {
      issues.push(`BU coverage ${value} of ${total} (${pct.toFixed(0)}%) — below 50% threshold; savings may be understated`)
      status = STATUS.AMBER
    }
  }

  if (estimatedFields[key]) {
    status = STATUS.AMBER
    issues.push('Value is an AI estimate — not confirmed by client')
  }

  return {
    key,
    label: def.label,
    value,
    displayValue: formatDisplay(key, data),
    status,
    issues,
    completeness: 1,
    isEstimated: !!estimatedFields[key],
  }
}

function formatDisplay(key, data) {
  const value = data[key]
  if (key === 'buCoverage') return `${value} of ${data.totalBUs ?? 40}`
  if (key === 'totalITSpend' || key === 'softwareSpend') return `$${(value / 1_000_000).toFixed(1)}M`
  if (['itSpendPctRevenue', 'managementRatio', 'aiDeflectionRate'].includes(key)) return `${value}%`
  if (key === 'annualTickets') return value.toLocaleString()
  if (key === 'offshoreDeliveryMix' && typeof value === 'string') return value
  if (key === 'cloudBreakdown') return value
  return String(value)
}

function runConsistencyChecks(data, fieldResults) {
  const consistencyIssues = []

  if (isPresent(data.softwareSpend) && isPresent(data.totalITSpend) && data.softwareSpend > data.totalITSpend) {
    consistencyIssues.push({
      fields: ['softwareSpend', 'totalITSpend'],
      message: 'Software spend cannot exceed total IT spend',
    })
  }

  if (isPresent(data.developerHeadcount) && isPresent(data.itStaffCount) && data.developerHeadcount > data.itStaffCount) {
    consistencyIssues.push({
      fields: ['developerHeadcount', 'itStaffCount'],
      message: 'Developer headcount cannot exceed total IT staff',
    })
  }

  if (data.aiMaturity === 'Advanced' && isPresent(data.aiDeflectionRate) && data.aiDeflectionRate < 20) {
    consistencyIssues.push({
      fields: ['aiDeflectionRate', 'aiMaturity'],
      message: 'AI maturity marked Advanced but deflection rate below 20% — inconsistent',
    })
  }

  if (isPresent(data.acquisitionsPerYear) && data.acquisitionsPerYear > 20 && !data.maPlaybook) {
    consistencyIssues.push({
      fields: ['acquisitionsPerYear', 'maPlaybook'],
      message: `${data.acquisitionsPerYear} acquisitions/year with no M&A integration playbook — high risk gap`,
    })
  }

  if (isPresent(data.erpCount) && isPresent(data.buCoverage) && data.erpCount > data.buCoverage * 2) {
    consistencyIssues.push({
      fields: ['erpCount', 'buCoverage'],
      message: `ERP count (${data.erpCount}) exceeds 2× BU coverage (${data.buCoverage}) — verify duplication`,
    })
  }

  if (isPresent(data.revenueCoveredPct) && data.revenueCoveredPct < 60) {
    consistencyIssues.push({
      fields: ['buCoverage', 'revenueCoveredPct'],
      message: `Revenue covered (~${data.revenueCoveredPct}%) below 60% — analysis may not represent full enterprise`,
    })
  }

  if (isPresent(data.itStaffCount) && isPresent(data.annualTickets)) {
    const perStaff = data.annualTickets / data.itStaffCount
    if (perStaff < PLAUSIBILITY.ticketsPerStaff.min || perStaff > PLAUSIBILITY.ticketsPerStaff.max) {
      consistencyIssues.push({
        fields: ['annualTickets', 'itStaffCount'],
        message: `Tickets per IT staff (${Math.round(perStaff)}) outside typical range (50–500)`,
      })
    }
  }

  consistencyIssues.forEach(({ fields, message }) => {
    fields.forEach((fieldKey) => {
      const field = fieldResults.find((f) => f.key === fieldKey)
      if (field && field.status !== STATUS.RED) {
        if (!field.issues.includes(message)) field.issues.push(message)
        if (field.status === STATUS.GREEN) field.status = STATUS.AMBER
      }
    })
  })

  return consistencyIssues
}

function runCurrencyChecks(data) {
  const issues = []
  const age = monthsSince(data.dataAsOf)
  if (age != null && age > 18) {
    issues.push(`Data labelled as ${data.dataAsOf} — older than 18 months; refresh recommended`)
  }
  if (data.fiscalYearMix) {
    issues.push('Mix of data from different fiscal years detected')
  }
  return issues
}

function runCoverageChecks(data) {
  const issues = []
  const total = data.totalBUs ?? CULLIGAN_PROFILE.totalBUs
  if (isPresent(data.buCoverage) && data.buCoverage / total < 0.5) {
    issues.push(`Current data covers ${data.buCoverage} of ${total} BUs — Italy cluster (9 entities) is the largest gap`)
  }
  return issues
}

export function assessDataQuality(rawData, estimatedFields = {}) {
  const data = { ...rawData }
  const assessedKeys = FIELD_DEFINITIONS.filter((f) => !f.outOfScope).map((f) => f.key)

  const fields = assessedKeys
    .map((key) => assessField(key, data, estimatedFields))
    .filter(Boolean)

  runConsistencyChecks(data, fields)

  const currencyIssues = runCurrencyChecks(data)
  const coverageIssues = runCoverageChecks(data)

  const scorable = fields.filter((f) => f.status !== STATUS.GREY)
  const greenCount = scorable.filter((f) => f.status === STATUS.GREEN).length
  const overallScore = scorable.length ? Math.round((greenCount / scorable.length) * 100) : 0
  const qualityLevel = QUALITY_LEVELS.find((l) => overallScore >= l.min)?.label ?? 'UNRELIABLE'

  const allIssues = [
    ...fields.flatMap((f) =>
      f.issues.map((issue) => ({ field: f.key, label: f.label, issue, status: f.status })),
    ),
    ...currencyIssues.map((issue) => ({ field: '_meta', label: 'Data currency', issue, status: STATUS.AMBER })),
    ...coverageIssues.map((issue) => ({ field: 'buCoverage', label: 'BU Coverage', issue, status: STATUS.AMBER })),
  ]

  const criticalMissing = fields
    .filter((f) => f.status === STATUS.RED && f.completeness === 0)
    .map((f) => f.label)

  return {
    fields,
    overallScore,
    qualityLevel,
    qualityDescription: QUALITY_LEVELS.find((l) => l.label === qualityLevel)?.description,
    issueCount: allIssues.length,
    criticalMissing,
    issues: allIssues,
    assessedAt: new Date().toISOString(),
  }
}

export function getQualityContextForPrompt(qualityReport) {
  return {
    qualityScore: qualityReport.overallScore,
    qualityLevel: qualityReport.qualityLevel,
    issueCount: qualityReport.issueCount,
    criticalMissing: qualityReport.criticalMissing,
    qualityIssues: qualityReport.issues.slice(0, 12),
  }
}

export function statusIcon(status) {
  switch (status) {
    case STATUS.GREEN:
      return '✅'
    case STATUS.AMBER:
      return '⚠️'
    case STATUS.RED:
      return '🔴'
    case STATUS.GREY:
      return '➖'
    default:
      return '—'
  }
}

export function statusColor(status) {
  switch (status) {
    case STATUS.GREEN:
      return '#1E7A46'
    case STATUS.AMBER:
      return '#E67E22'
    case STATUS.RED:
      return '#C0392B'
    case STATUS.GREY:
      return '#5A6A7E'
    default:
      return '#1A1A2E'
  }
}

export function mergeKnowledgeFromFacts(data, facts) {
  const merged = { ...data }
  facts.forEach((fact) => {
    const label = fact.label?.toLowerCase() ?? ''
    if (label.includes('it spend') && !label.includes('%')) {
      const n = parseFloat(String(fact.value).replace(/[^0-9.]/g, ''))
      if (n) merged.totalITSpend = n < 1000 ? n * 1_000_000 : n
    }
    if (label.includes('software')) {
      const n = parseFloat(String(fact.value).replace(/[^0-9.]/g, ''))
      if (n) merged.softwareSpend = n < 1000 ? n * 1_000_000 : n
    }
  })
  return merged
}

export function extractDataFromUpload(parsed) {
  const mapping = {
    totalITSpend: ['totalITSpend', 'total_it_spend', 'itSpend', 'it_spend'],
    softwareSpend: ['softwareSpend', 'software_spend'],
    erpCount: ['erpCount', 'erp_count', 'erpInstances'],
    managementRatio: ['managementRatio', 'management_ratio'],
    vendorContracts: ['vendorContracts', 'vendor_contracts'],
    buCoverage: ['buCoverage', 'bu_coverage', 'businessUnits'],
    developerHeadcount: ['developerHeadcount', 'developer_headcount', 'developers'],
    offshoreDeliveryMix: ['offshoreDeliveryMix', 'offshore_delivery_mix'],
    cloudBreakdown: ['cloudBreakdown', 'cloud_breakdown'],
    annualTickets: ['annualTickets', 'annual_tickets', 'tickets'],
    itSpendPctRevenue: ['itSpendPctRevenue', 'it_spend_pct'],
    acquisitionsPerYear: ['acquisitionsPerYear', 'acquisitions_per_year'],
  }

  const result = {}
  Object.entries(mapping).forEach(([target, aliases]) => {
    for (const alias of aliases) {
      if (parsed[alias] != null) {
        result[target] = parsed[alias]
        break
      }
    }
  })
  return result
}
