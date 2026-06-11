export const CULLIGAN_PROFILE = {
  revenue: 3_400_000_000,
  totalBUs: 40,
  totalRevenue: 3_400_000_000,
  industry: 'water services and industrial',
  peBacked: true,
  acquisitionsPerYearTypical: 50,
}

export const FIELD_DEFINITIONS = [
  { key: 'totalITSpend', label: 'Total IT Spend', type: 'currency' },
  { key: 'itSpendPctRevenue', label: 'IT Spend % Revenue', type: 'percent' },
  { key: 'softwareSpend', label: 'Software Spend', type: 'currency' },
  { key: 'buCoverage', label: 'BU Coverage', type: 'buCoverage' },
  { key: 'erpCount', label: 'ERP Count', type: 'number' },
  { key: 'managementRatio', label: 'Mgmt Ratio', type: 'percent' },
  { key: 'vendorContracts', label: 'Vendor Contracts', type: 'number' },
  { key: 'developerHeadcount', label: 'Developer Count', type: 'number' },
  { key: 'offshoreDeliveryMix', label: 'Offshore Mix', type: 'percentOrText' },
  { key: 'cloudBreakdown', label: 'Cloud Breakdown', type: 'text' },
  { key: 'annualTickets', label: 'Annual Tickets', type: 'number' },
  { key: 'aiDeflectionRate', label: 'AI Deflection Rate', type: 'percent' },
  { key: 'acquisitionsPerYear', label: 'Acquisitions / Year', type: 'number' },
  { key: 'itStaffCount', label: 'IT Staff Count', type: 'number', outOfScope: true },
]

/** Culligan PwC benchmarking baseline — June 2026 */
export const DEFAULT_KNOWLEDGE_DATA = {
  totalITSpend: 69_200_000,
  itSpendPctRevenue: 2.1,
  softwareSpend: 34_800_000,
  erpCount: 25,
  managementRatio: 19.9,
  annualTickets: 126_000,
  vendorContracts: 44,
  buCoverage: 20,
  totalBUs: 40,
  offshoreDeliveryMix: null,
  developerHeadcount: null,
  cloudBreakdown: null,
  acquisitionsPerYear: 50,
  aiDeflectionRate: 2,
  aiMaturity: 'Emerging',
  maPlaybook: false,
  itStaffCount: null,
  revenueCoveredPct: 50,
  dataAsOf: '2026-06',
  vendorContractsMinimumOnly: true,
  shadowITIncluded: true,
  source: 'PwC benchmarking analysis',
}

export function formatFieldDisplay(key, value, data = {}) {
  if (value == null || value === '') {
    if (key === 'buCoverage' && data.buCoverage != null && data.totalBUs) {
      return `${data.buCoverage} of ${data.totalBUs}`
    }
    return 'Not provided'
  }
  switch (key) {
    case 'totalITSpend':
    case 'softwareSpend':
      return `$${(value / 1_000_000).toFixed(1)}M`
    case 'itSpendPctRevenue':
    case 'managementRatio':
    case 'aiDeflectionRate':
      return typeof value === 'number' ? `${value}%` : value
    case 'offshoreDeliveryMix':
      return typeof value === 'number' ? `${value}%` : value
    case 'buCoverage':
      return `${value} of ${data.totalBUs ?? 40}`
    case 'annualTickets':
      return value.toLocaleString()
    default:
      return String(value)
  }
}

export function parseUploadedValue(key, raw) {
  if (raw == null || raw === '') return null
  const str = String(raw).trim()
  if (['offshoreDeliveryMix', 'cloudBreakdown'].includes(key) && /unknown|not provided|n\/a/i.test(str)) {
    return null
  }
  const num = parseFloat(str.replace(/[$,%]/g, '').replace(/,/g, ''))
  if (!Number.isNaN(num)) {
    if (key.includes('Spend') && num < 1000) return num * 1_000_000
    return num
  }
  return str
}
