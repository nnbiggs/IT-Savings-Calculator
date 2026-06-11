export const SCENARIO_IDS = {
  CURRENT: 'current-state',
  FULL_COVERAGE: 'full-coverage',
  PHASE_1: 'phase-1',
  TRANSFORMATION: 'transformation',
}

export const METRICS = [
  { key: 'totalITSpend', label: 'Total IT Spend', group: 'Financial' },
  { key: 'itSpendPctRevenue', label: 'IT Spend % Revenue', group: 'Financial' },
  { key: 'softwareSpend', label: 'Software Spend', group: 'Financial' },
  { key: 'softwarePctRevenue', label: 'Software % Revenue', group: 'Financial' },
  { key: 'annualSavingsCapture', label: 'Annual Savings Capture', group: 'Financial' },
  { key: 'evImpact', label: 'EV Impact (10× savings)', group: 'Financial' },
  { key: 'erpCount', label: 'ERP Instances', group: 'Portfolio' },
  { key: 'vendorContracts', label: 'Vendor Contracts', group: 'Portfolio' },
  { key: 'buCoverage', label: 'BU Coverage', group: 'Portfolio' },
  { key: 'managementRatio', label: 'Management Ratio', group: 'Organisation' },
  { key: 'offshoreDeliveryMix', label: 'Offshore Delivery Mix', group: 'Organisation' },
  { key: 'annualTickets', label: 'Annual Service Tickets', group: 'Operations' },
  { key: 'aiDeflectionRate', label: 'AI Deflection Rate', group: 'Operations' },
  { key: 'runGrowTransform', label: 'Run / Grow / Transform', group: 'Operations' },
  { key: 'maIntegrationCost', label: 'M&A Integration Cost', group: 'Strategic' },
]

export const SCENARIOS = [
  {
    id: SCENARIO_IDS.CURRENT,
    name: 'Current State',
    label: 'Today — June 2026',
    description:
      "Culligan's confirmed IT baseline from the PwC benchmarking analysis. Covers 20 of 40 business units.",
    color: '#5A6A7E',
    data: {
      totalITSpend: '$69.2M',
      itSpendPctRevenue: '2.10%',
      softwareSpend: '$34.8M',
      softwarePctRevenue: '1.05%',
      erpCount: '25',
      managementRatio: '19.9%',
      annualTickets: '126,000',
      aiDeflectionRate: '2%',
      vendorContracts: '44',
      buCoverage: '20',
      offshoreDeliveryMix: 'Below norm (unquantified)',
      annualSavingsCapture: '$0',
      evImpact: '$0',
      runGrowTransform: '78% / 14% / 8% (estimated)',
      maIntegrationCost: '$7.5M–25M/year (no playbook)',
    },
    chartValues: {
      totalITSpend: 69.2,
      softwareSpend: 34.8,
      annualSavingsCapture: 0,
    },
  },
  {
    id: SCENARIO_IDS.FULL_COVERAGE,
    name: 'Full BU Coverage',
    label: 'Full Coverage — All 40 BUs',
    description:
      'Extrapolated baseline when all 40 business units are included. Italy (9 entities) is the most material gap.',
    color: '#1B7F9E',
    data: {
      totalITSpend: '$120M (extrapolated)',
      itSpendPctRevenue: '2.10% (holds constant)',
      softwareSpend: '$60M (extrapolated)',
      softwarePctRevenue: '1.05% (holds constant)',
      erpCount: '35 (extrapolated)',
      managementRatio: '19.9% (holds constant)',
      annualTickets: '220,000 (extrapolated)',
      aiDeflectionRate: '2%',
      vendorContracts: '88 (extrapolated)',
      buCoverage: '40',
      offshoreDeliveryMix: 'Below norm (unquantified)',
      annualSavingsCapture: '$0',
      evImpact: '$0',
      runGrowTransform: '78% / 14% / 8% (estimated)',
      maIntegrationCost: '$15M–50M/year (no playbook)',
      note: 'Savings opportunity scales proportionally — $28–54M annually at full coverage',
    },
    chartValues: {
      totalITSpend: 120,
      softwareSpend: 60,
      annualSavingsCapture: 0,
    },
  },
  {
    id: SCENARIO_IDS.PHASE_1,
    name: 'Phase 1 Complete',
    label: 'After Phase 1 — Month 12',
    description:
      'Culligan after executing the three immediate actions: SAM program live, Moveworks scaled, developer copilots standardised.',
    color: '#E67E22',
    data: {
      totalITSpend: '$60.8M (down from $69.2M)',
      itSpendPctRevenue: '1.84%',
      softwareSpend: '$24.4–27.8M (SAM savings captured)',
      softwarePctRevenue: '0.74–0.84%',
      erpCount: '25 (unchanged — Phase 1 does not touch ERPs)',
      managementRatio: '19.9% (unchanged — survey pending)',
      annualTickets: '126,000',
      aiDeflectionRate: '35% (Moveworks scaled)',
      vendorContracts: '25–30 (consolidated)',
      buCoverage: '20',
      offshoreDeliveryMix: 'Below norm (unquantified)',
      annualSavingsCapture: '$6.3–13.7M',
      evImpact: '$63–164M',
      runGrowTransform: '72% / 18% / 10% (improving)',
      maIntegrationCost: 'Playbook in development',
    },
    savingsBreakdown: {
      samProgram: '$4.2–10.4M',
      aiServiceDesk: '$1.1–1.3M',
      developerCopilots: '$1.0–2.0M',
    },
    chartValues: {
      totalITSpend: 60.8,
      softwareSpend: 26.1,
      annualSavingsCapture: 10,
    },
  },
  {
    id: SCENARIO_IDS.TRANSFORMATION,
    name: 'Full Transformation',
    label: 'Post-Transformation — Month 36',
    description:
      'Culligan after executing all three phases: SAM complete, org delayered, ERP consolidated, shared services live, AI scaled.',
    color: '#1E7A46',
    data: {
      totalITSpend: '$38–53M (vs. $69.2M today)',
      itSpendPctRevenue: '1.15–1.60%',
      softwareSpend: '$11–14M (at peer median)',
      softwarePctRevenue: '0.33–0.42%',
      erpCount: '4–6 (consolidated)',
      managementRatio: '12–14% (delayered)',
      annualTickets: '80,000',
      aiDeflectionRate: '55–60% (AI scaled)',
      vendorContracts: '12–18 (consolidated)',
      buCoverage: '40',
      offshoreDeliveryMix: 'At peer norm (~35%)',
      annualSavingsCapture: '$28–54M',
      evImpact: '$280–540M',
      runGrowTransform: '58% / 24% / 18%',
      maIntegrationCost: '$3–5M/year (playbook operational)',
    },
    savingsBreakdown: {
      samProgram: '$8–12M',
      aiServiceDesk: '$2–3M',
      developerCopilots: '$2–3M',
      erpConsolidation: '$6–12M',
      sharedServices: '$4–8M',
      vendorConsolidation: '$3–6M',
    },
    chartValues: {
      totalITSpend: 45.5,
      softwareSpend: 12.5,
      annualSavingsCapture: 41,
    },
  },
]

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id)
}

export function getScenariosByIds(ids) {
  return ids.map((id) => getScenarioById(id)).filter(Boolean)
}

export const DEFAULT_ACTIVE_SCENARIOS = [SCENARIO_IDS.CURRENT]

export const DEFAULT_COMPARE_SCENARIOS = [
  SCENARIO_IDS.CURRENT,
  SCENARIO_IDS.PHASE_1,
  SCENARIO_IDS.TRANSFORMATION,
]
