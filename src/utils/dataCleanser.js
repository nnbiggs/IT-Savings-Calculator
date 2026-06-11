import { sendMessage as sendAnthropicMessage } from '../lib/anthropic'

const CLEANSE_SYSTEM = `You are a senior data analyst specialising in IT financial benchmarking for enterprise companies. You have received data about a company's IT environment that contains quality issues. Your job is to:
1. Explain what each issue means in plain terms
2. Suggest the most likely correct value based on industry context
3. Provide a method to verify the correct value
4. Assess the impact on the savings analysis if the issue is not resolved

Be specific. Reference the company's industry, size, and profile when making suggestions. Never invent data — always express corrections as estimates with confidence levels.`

function buildCleanseUserMessage(qualityIssues) {
  return `Here are the data quality issues found in this company's IT benchmarking data:

Company profile: $3.4B revenue, water services and industrial, PE-backed, 40 BUs, ~50 acquisitions/year

Quality issues detected:
${JSON.stringify(qualityIssues, null, 2)}

For each issue provide:
{
  "field": string,
  "issue": string (plain language explanation),
  "likelyCause": string (why this is probably wrong),
  "recommendedValue": string or range,
  "confidenceInRecommendation": "high"|"medium"|"low",
  "verificationMethod": string (how to get the correct number),
  "impactIfUnresolved": "critical"|"high"|"medium"|"low",
  "impactExplanation": string (what it means for the savings analysis)
}

Return as JSON array. No other text.`
}

const DEMO_RECOMMENDATIONS = {
  buCoverage: {
    field: 'buCoverage',
    issue: 'Benchmarking data covers only 20 of 40 business units — half the enterprise is not in scope.',
    likelyCause: 'PwC engagement phased by region; Italy cluster (9 entities) and several APAC BUs not yet onboarded.',
    recommendedValue: '40 BUs (extrapolate using $120M total IT spend at same ratios)',
    confidenceInRecommendation: 'high',
    verificationMethod: 'Request IT cost allocation from Italy finance lead and regional CIOs for uncovered BUs.',
    impactIfUnresolved: 'critical',
    impactExplanation: 'Savings estimates are understated by ~40–50%. ERP consolidation opportunity may be $6.5–12M annually at full coverage vs $3.8–7.5M on partial data.',
  },
  developerHeadcount: {
    field: 'developerHeadcount',
    issue: 'Developer headcount not provided — cannot size copilot ROI or delivery capacity accurately.',
    likelyCause: 'Headcount data sits in HR systems outside IT benchmarking scope; often split across BUs.',
    recommendedValue: '180–280 FTEs (5–8% of estimated ~2,500–3,500 IT staff for $3.4B manufacturer)',
    confidenceInRecommendation: 'medium',
    verificationMethod: 'Pull active developer FTEs from Workday/HRIS filtered by job family; include contractors above 6 months.',
    impactIfUnresolved: 'high',
    impactExplanation: 'Developer copilot savings ($1–2M) cannot be validated. May over- or under-state Phase 1 benefits by 30%.',
  },
  offshoreDeliveryMix: {
    field: 'offshoreDeliveryMix',
    issue: 'Offshore delivery mix is unquantified — operating model savings cannot be benchmarked.',
    likelyCause: 'Outsourcing towers managed by procurement; no central view of onshore/offshore/nearshore split.',
    recommendedValue: '15–25% offshore (below peer median of ~35% for global manufacturers)',
    confidenceInRecommendation: 'medium',
    verificationMethod: 'Audit top 5 SI/MSP contracts for delivery location mix; survey tower leads.',
    impactIfUnresolved: 'high',
    impactExplanation: 'Shared services and offshore optimisation ($4–8M) remain unvalidated — could be largest structural lever.',
  },
  cloudBreakdown: {
    field: 'cloudBreakdown',
    issue: 'Cloud spend breakdown not available — FinOps savings cannot be precisely targeted.',
    likelyCause: 'Multi-cloud estate (AWS/Azure) with limited tagging; IoT and field workloads on separate accounts.',
    recommendedValue: '$18–28M annual cloud spend (25–40% of total IT) based on peer benchmarks',
    confidenceInRecommendation: 'medium',
    verificationMethod: 'Run AWS Cost Explorer and Azure Cost Management exports; consolidate by tag and BU.',
    impactIfUnresolved: 'medium',
    impactExplanation: 'Cloud FinOps quick wins ($1.2–2.5M) need baseline validation before board presentation.',
  },
  vendorContracts: {
    field: 'vendorContracts',
    issue: 'Vendor contract count reflects minimum commitments only — actual contract volume is higher.',
    likelyCause: 'Procurement tracker captures tier-1 renewals; shadow SaaS and regional dealer contracts excluded.',
    recommendedValue: '65–90 active contracts (44 confirmed minimum + estimated regional/dealer layer)',
    confidenceInRecommendation: 'medium',
    verificationMethod: 'Cross-reference Coupa/Ariba, SAM tool, and AP spend analysis for recurring SaaS vendors.',
    impactIfUnresolved: 'medium',
    impactExplanation: 'Vendor consolidation savings may be 20–30% higher than modelled if full contract inventory captured.',
  },
  acquisitionsPerYear: {
    field: 'acquisitionsPerYear',
    issue: 'High acquisition velocity (~50/year) with no M&A IT integration playbook documented.',
    likelyCause: 'PE-backed roll-up strategy; IT integration treated as project-by-project without standard playbook.',
    recommendedValue: 'Establish playbook targeting $3–5M/year integration cost vs current $7.5–25M',
    confidenceInRecommendation: 'high',
    verificationMethod: 'Interview M&A integration PMO and review last 5 acquisition IT cost post-mortems.',
    impactIfUnresolved: 'critical',
    impactExplanation: 'M&A IT drag is a top-3 cost driver. Without playbook, every acquisition adds 2–5 ERP instances and duplicate contracts.',
  },
}

function getDemoRecommendations(qualityReport) {
  const seen = new Set()
  const recs = []

  qualityReport.issues.forEach((item) => {
    const field = item.field === '_meta' ? null : item.field
    if (!field || seen.has(field)) return
    if (DEMO_RECOMMENDATIONS[field]) {
      seen.add(field)
      recs.push(DEMO_RECOMMENDATIONS[field])
    }
  })

  if (recs.length === 0) {
    return Object.values(DEMO_RECOMMENDATIONS).slice(0, 3)
  }

  return recs
}

function parseRecommendations(text) {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function assessAndCleanseData(_rawData, qualityReport, { forceDemo = false } = {}) {
  if (!qualityReport.issues.length) return []

  if (forceDemo || import.meta.env.VITE_DEMO_MODE === 'true') {
    await new Promise((r) => setTimeout(r, 600))
    return getDemoRecommendations(qualityReport)
  }

  try {
    const response = await sendAnthropicMessage(
      [{ role: 'user', content: buildCleanseUserMessage(qualityReport.issues) }],
      CLEANSE_SYSTEM,
    )
    const parsed = parseRecommendations(response)
    if (Array.isArray(parsed) && parsed.length) return parsed
    return getDemoRecommendations(qualityReport)
  } catch {
    return getDemoRecommendations(qualityReport)
  }
}

export function getRecommendationForField(recommendations, fieldKey) {
  return recommendations.find((r) => r.field === fieldKey)
}

export function parseRecommendedValue(recommendation) {
  if (!recommendation?.recommendedValue) return null
  const str = recommendation.recommendedValue
  const rangeMatch = str.match(/([\d.]+)[–-]([\d.]+)/)
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1])
    const high = parseFloat(rangeMatch[2])
    return (low + high) / 2
  }
  const numMatch = str.match(/([\d,]+)/)
  if (numMatch) return parseFloat(numMatch[1].replace(/,/g, ''))
  return str
}
