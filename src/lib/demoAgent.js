import { START_MESSAGE } from './systemPrompt'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function countUserTurns(messages) {
  return messages.filter(
    (m) => m.role === 'user' && m.content !== START_MESSAGE,
  ).length
}

function textIncludes(text, terms) {
  const lower = text.toLowerCase()
  return terms.some((term) => lower.includes(term))
}

function extractSpend(text) {
  const match = text.match(/\$?\s*([\d,.]+)\s*(m|million|b|billion|k|thousand)?/i)
  if (!match) return null
  let value = parseFloat(match[1].replace(/,/g, ''))
  const unit = match[2]?.toLowerCase()
  if (unit === 'b' || unit === 'billion') value *= 1000
  if (unit === 'k' || unit === 'thousand') value /= 1000
  return value
}

export function isDemoModeEnabled() {
  return import.meta.env.VITE_DEMO_MODE === 'true'
}

export async function getDemoResponse(messages, userContent) {
  await delay(900 + Math.random() * 600)

  if (userContent === START_MESSAGE) {
    return `Good afternoon — I'm your PwC IT Strategy partner for today's session with Culligan's CIO team.

We have a **confirmed benchmarking baseline**: **$69.2M total IT spend** (2.10% of revenue) across **20 of 40 business units**, with **$34.8M in software**, **25 ERP instances**, and **44 vendor contracts**.

I've run an initial **data quality assessment** on this baseline — we're at **ACCEPTABLE quality (~70%)**. The analysis is directional but has known gaps:
- **BU coverage** — only 20 of 40 BUs in scope (Italy cluster is the largest gap)
- **Developer headcount** — not provided
- **Offshore delivery mix** — unquantified
- **Cloud breakdown** — not available

These gaps mean savings estimates should be **caveated** until we fill them — the consolidation opportunity at full coverage is likely **$6.5–12M**, not the partial-BU figure.

The context panel shows the **data quality dashboard** and **four modelled scenarios**. I can compare today vs Phase 1 vs full transformation at any time.

**Where would you like to start** — review data quality gaps, walk through today's landscape, or compare future scenarios?

[PHASE_UPDATE]
{"phase":"discovery","summary":"Presented baseline, data quality status, and scenario model"}
[/PHASE_UPDATE]

[SCENARIO_VIEW]
{"scenarios":["current-state","phase-1","transformation"],"highlight":"current-state"}
[/SCENARIO_VIEW]`
  }

  const turns = countUserTurns(messages)
  const input = userContent

  if (
    textIncludes(input, [
      'data quality',
      'quality score',
      'missing data',
      'data gap',
      'cleanse',
      'cleansing',
      'incomplete',
      'unreliable',
      'italy',
      'bu coverage',
      'coverage gap',
    ])
  ) {
    return `I've assessed the benchmarking data — here's my read on **data quality**:

**Overall: ACCEPTABLE (~70%)** — analysis is directional but not board-final without closing key gaps.

| Field | Status | Issue |
|-------|--------|-------|
| Total IT Spend ($69.2M) | ✅ | Confirmed baseline |
| Software Spend ($34.8M) | ✅ | Confirmed |
| BU Coverage (20/40) | ⚠️ | **Incomplete** — Italy (9 entities) not in scope |
| ERP Count (25) | ✅ | Plausible for 20 BUs |
| Developer Count | 🔴 | **Missing** — blocks copilot ROI validation |
| Offshore Mix | 🔴 | **Missing** — blocks operating model sizing |
| Cloud Breakdown | 🔴 | **Missing** — blocks FinOps targeting |

**Before I give you the ERP consolidation savings estimate**, I want to flag that application spend ($34.8M) only covers **20 of 40 BUs**. At full coverage, software spend is likely **$40–50M** — meaning consolidation opportunity could be **$6.5–12M annually**, not $3.8–7.5M.

**Can you confirm spend for the Italy cluster?** That alone covers 9 entities and would move us from ACCEPTABLE to HIGH QUALITY on coverage.

Check the **Data Quality** panel on the right — click any flagged field for AI recommendations and one-click fixes.

[PHASE_UPDATE]
{"phase":"analysis","summary":"Surfaced data quality gaps and impact on savings"}
[/PHASE_UPDATE]`
  }

  if (
    textIncludes(input, [
      'compare',
      'scenario',
      'scenarios',
      'side by side',
      'side-by-side',
      'model',
      'what if',
      'what-if',
      'landscape',
      'baseline',
      'today',
      'current state',
      'transformation',
      'phase 1',
      'phase 2',
      'full coverage',
      'all 40',
      '40 bu',
      'month 12',
      'month 36',
    ])
  ) {
    if (textIncludes(input, ['full coverage', 'all 40', '40 bu', 'italy', 'extrapol'])) {
      return `Let me put **Full BU Coverage** in context against today's confirmed baseline.

| Metric | Today (20 BUs) | Full Coverage (40 BUs) |
|--------|----------------|------------------------|
| **Total IT Spend** | $69.2M | ~$120M (extrapolated) |
| **Software Spend** | $34.8M | ~$60M |
| **ERP Instances** | 25 | ~35 |
| **Vendor Contracts** | 44 | ~88 |
| **Annual Savings** | $0 | $0 (baseline — opportunity scales) |

The critical insight: **Italy alone represents 9 entities not yet in scope**. When you extrapolate to all 40 BUs at the same cost ratios, the addressable savings pool scales proportionally to **$28–54M annually** — but so does the complexity.

The question for the board isn't just "how much can we save" — it's whether you're sizing the programme against **20 BUs or 40**. I'd recommend planning at full coverage even if you phase execution.

Want me to compare **Full Coverage vs Phase 1**, or jump straight to the **36-month transformation case**?

[SCENARIO_VIEW]
{"scenarios":["current-state","full-coverage"],"highlight":"full-coverage"}
[/SCENARIO_VIEW]

[PHASE_UPDATE]
{"phase":"analysis","summary":"Compared current state vs full BU coverage"}
[/PHASE_UPDATE]`
    }

    if (textIncludes(input, ['phase 1', 'phase 2', 'month 12', '12 month', 'quick win', 'sam', 'moveworks'])) {
      return `Here's **Today vs Phase 1 Complete** — the 12-month case after SAM, Moveworks, and developer copilots:

| Metric | Today | After Phase 1 (Month 12) | Delta |
|--------|-------|--------------------------|-------|
| **Total IT Spend** | $69.2M | $60.8M | **−$8.4M** |
| **IT Spend % Revenue** | 2.10% | 1.84% | −26 bps |
| **Software Spend** | $34.8M | $24.4–27.8M | **−$7–10M** |
| **AI Deflection Rate** | 2% | 35% | +33 pts |
| **Vendor Contracts** | 44 | 25–30 | −14 to −19 |
| **Annual Savings** | $0 | **$6.3–13.7M** | — |
| **EV Impact** | $0 | **$63–164M** | — |

**Phase 1 savings breakdown:**
- SAM programme: **$4.2–10.4M**
- AI service desk (Moveworks): **$1.1–1.3M**
- Developer copilots: **$1.0–2.0M**

Notably, **ERP count stays at 25** — Phase 1 deliberately avoids the hard structural work. That's the Phase 2/3 bet.

Does this Phase 1 case meet your board's near-term expectations, or should we model a more aggressive 12-month scenario?

[SCENARIO_VIEW]
{"scenarios":["current-state","phase-1"],"highlight":"phase-1"}
[/SCENARIO_VIEW]

[PHASE_UPDATE]
{"phase":"analysis","summary":"Compared current state vs Phase 1 outcomes"}
[/PHASE_UPDATE]`
    }

    if (textIncludes(input, ['transformation', 'month 36', '36 month', 'full transform', 'target state', 'end state'])) {
      return `This is the **board-level case** — Today vs Full Transformation at Month 36:

| Metric | Today | Post-Transformation | Delta |
|--------|-------|---------------------|-------|
| **Total IT Spend** | $69.2M | $38–53M | **−$16–31M** |
| **IT Spend % Revenue** | 2.10% | 1.15–1.60% | −50 to −95 bps |
| **Software Spend** | $34.8M | $11–14M | **−$21–24M** |
| **ERP Instances** | 25 | 4–6 | **−19 to −21** |
| **Vendor Contracts** | 44 | 12–18 | **−26 to −32** |
| **BU Coverage** | 20 | 40 | +20 |
| **AI Deflection** | 2% | 55–60% | +53 pts |
| **Annual Savings** | $0 | **$28–54M** | — |
| **EV Impact** | $0 | **$280–540M** | — |
| **Run/Grow/Transform** | 78/14/8 | 58/24/18 | Shift to invest |

**Transformation savings breakdown:**
- SAM (complete): $8–12M
- AI service desk: $2–3M
- Developer copilots: $2–3M
- ERP consolidation: $6–12M
- Shared services: $4–8M
- Vendor consolidation: $3–6M

The **EV impact of $280–540M** is the number that moves the CFO — at 10× annual savings, this is a material enterprise value story, not just an IT cost exercise.

What's your reaction to the **ERP consolidation** (25 → 4–6) — is that politically feasible in your organisation?

[SCENARIO_VIEW]
{"scenarios":["current-state","transformation"],"highlight":"transformation"}
[/SCENARIO_VIEW]

[PHASE_UPDATE]
{"phase":"roadmap","summary":"Presented full transformation scenario vs today"}
[/PHASE_UPDATE]`
    }

    return `Let me frame Culligan's **four modelled scenarios** for you:

**1. Today (June 2026)** — $69.2M IT spend, 20/40 BUs, 25 ERPs, 44 contracts
**2. Full Coverage** — ~$120M extrapolated to all 40 BUs (Italy is the biggest gap)
**3. Phase 1 (Month 12)** — $60.8M spend, $6.3–13.7M savings captured, ERPs unchanged
**4. Transformation (Month 36)** — $38–53M spend, $28–54M savings, 4–6 ERPs, $280–540M EV impact

The context panel on the right shows a **side-by-side comparison** of Today, Phase 1, and Full Transformation. You can toggle scenarios using the chips at the top.

| | Today | Phase 1 | Transformation |
|---|-------|---------|----------------|
| IT Spend | $69.2M | $60.8M | $38–53M |
| Savings | $0 | $6.3–13.7M | $28–54M |
| ERPs | 25 | 25 | 4–6 |
| AI Deflection | 2% | 35% | 55–60% |

**Which two scenarios should we stress-test in detail** — or shall I walk through the investment case for Phase 1 vs waiting for the full transformation?

[SCENARIO_VIEW]
{"scenarios":["current-state","phase-1","transformation"],"highlight":"current-state"}
[/SCENARIO_VIEW]

[PHASE_UPDATE]
{"phase":"analysis","summary":"Presented all four scenario overview"}
[/PHASE_UPDATE]`
  }

  if (textIncludes(input, ['roadmap', 'summary', 'summarise', 'summarize', 'recommend', 'priorit'])) {
    return `Let me synthesise across our **four modelled scenarios** into a prioritised roadmap:

**Now → Month 12 (Phase 1) — $6.3–13.7M savings**
- Stand up SAM programme → $4.2–10.4M
- Scale Moveworks AI deflection to 35% → $1.1–1.3M
- Standardise developer copilots → $1.0–2.0M
- IT spend drops from **$69.2M → $60.8M**

**Month 12 → Month 36 (Phases 2–3) — additional $15–40M**
- ERP consolidation (25 → 4–6) → $6–12M
- Shared services operating model → $4–8M
- Vendor tower consolidation → $3–6M
- Full 40-BU coverage at transformed cost base

**Board narrative:** Phase 1 is self-funding and de-risked. The transformation case delivers **$280–540M EV impact** but requires ERP and org change appetite.

I'd recommend the CIO table a **Phase 1 decision this quarter** while socialising the 36-month case with the CFO.

Want a deeper comparison of **Phase 1 vs Full Transformation**, or help building the board slide narrative?

[PHASE_UPDATE]
{"phase":"roadmap","summary":"Delivered scenario-based savings roadmap"}
[/PHASE_UPDATE]

[SCENARIO_VIEW]
{"scenarios":["current-state","phase-1","transformation"],"highlight":"transformation"}
[/SCENARIO_VIEW]`
  }

  if (textIncludes(input, ['cloud', 'aws', 'azure', 'finops', 'infrastructure'])) {
    return `Cloud is often the fastest place to find **credible quick wins** for a global manufacturer like Culligan — especially where field and IoT workloads have grown organically.

If cloud spend has outpaced revenue growth, the typical levers are:
- **Reserved capacity & savings plans** vs on-demand (often 20–35% reduction)
- **Rightsizing** over-provisioned compute across dev/test and analytics
- **Storage tiering** for IoT telemetry and log retention
- **Tagging & chargeback** to stop shadow growth across regions and dealers

For a company at your scale, we typically see **$1.2–2.5M annual opportunity** in cloud alone — higher if FinOps discipline hasn't been formalised.

**What is your approximate annual cloud spend**, and is it centrally governed or largely distributed across business units?

[PHASE_UPDATE]
{"phase":"deep-dive","summary":"Deep-diving cloud cost optimisation"}
[/PHASE_UPDATE]

[SAVINGS_OPPORTUNITY]
{"title":"Cloud FinOps & Rightsizing Programme","category":"Cloud","annualSavingLow":1200000,"annualSavingHigh":2500000,"effort":"Medium","timeframe":"Quick Win","confidence":"Medium","summary":"Reserved instances, rightsizing, and storage tiering across AWS/Azure estate"}
[/SAVINGS_OPPORTUNITY]`
  }

  if (textIncludes(input, ['sap', 'erp', 'oracle', 'vendor', 'contract', 'license', 'licence'])) {
    return `SAP and major ERP contracts are usually **top-three cost items** for Culligan-scale manufacturers — and renewal cycles are where the most leverage sits.

Before we size this, a few signals matter:
- Are you on **RISE with SAP / S/4** migration path, or maintaining ECC with significant customisation?
- Is support and SI spend bundled across multiple vendors?
- When is your **next major renewal window**?

Peer benchmarks suggest **15–25% negotiable savings** on mature ERP estates through licence optimisation, support re-tiering, and SI rate normalisation — often **$2–4M** for a spend profile like yours.

Which ERP platform are you on today, and when does your primary support contract come up for renewal?

[PHASE_UPDATE]
{"phase":"deep-dive","summary":"Exploring ERP and vendor contract savings"}
[/PHASE_UPDATE]

[SAVINGS_OPPORTUNITY]
{"title":"ERP Vendor & Support Renegotiation","category":"Vendor","annualSavingLow":2000000,"annualSavingHigh":4000000,"effort":"High","timeframe":"6-18 months","confidence":"Medium","summary":"Licence optimisation and SI rate normalisation at next SAP renewal cycle"}
[/SAVINGS_OPPORTUNITY]`
  }

  if (textIncludes(input, ['outsource', 'offshore', 'managed service', 'msp', 'insource', 'fte', 'headcount'])) {
    return `The operating model question is often where **sustainable** savings live — not just one-off cuts.

What I'm hearing is we should examine the balance between internal FTEs, global delivery centres, and managed service providers across infrastructure and application support.

For Culligan specifically, the dealer network and field service footprint often create **fragmented L1/L2 support** — duplicate towers, overlapping SLAs, and commercial escalation clauses that haven't been re-bid in 3+ years.

Typical opportunities:
- **Tower consolidation** on infrastructure managed services — 10–18% rate reduction
- **Automation of service desk** and field dispatch integration — 15–20% FTE avoidance
- **Global delivery mix** optimisation — shifting commodity work to lower-cost centres

**Roughly how is your IT delivery split today** — percentage insourced vs outsourced, and across which towers?

[PHASE_UPDATE]
{"phase":"deep-dive","summary":"Examining IT operating model and outsourcing"}
[/PHASE_UPDATE]

[SAVINGS_OPPORTUNITY]
{"title":"Infrastructure Managed Services Re-bid","category":"Operating Model","annualSavingLow":800000,"annualSavingHigh":1500000,"effort":"Medium","timeframe":"6-18 months","confidence":"Medium","summary":"Consolidate overlapping MSP towers and re-bid at market rates"}
[/SAVINGS_OPPORTUNITY]`
  }

  const spend = extractSpend(input)

  if (turns === 1 || spend) {
    const spendLabel = spend ? `$${spend}M` : 'your stated spend level'
    return `Thank you — **${spendLabel}** gives us a useful anchor. For a ~$1.5B revenue global manufacturer, that ${
      spend && spend > 35
        ? 'sits **above** the peer median of ~2.0% of revenue — there is likely meaningful headroom'
        : spend && spend < 25
          ? 'is ** lean relative to peers** — savings may be more about reallocation than cuts'
          : "is ** broadly in line with industry benchmarks** — we'll need to find savings through structural efficiency, not blanket reduction"
    }.

Help me understand the **run vs change split**:
- What percentage is **run-the-business** (support, maintenance, BAU infrastructure)?
- What percentage is **change** (projects, transformation, new capability)?

And which **two or three line items** would you point to as the largest — ERP, cloud, field service platforms, outsourcing, something else?

[SESSION_FACT]
{"label":"Total IT Spend","value":"${spend ? `$${spend}M annually` : 'Under discussion'}","category":"Financial"}
[/SESSION_FACT]

[PHASE_UPDATE]
{"phase":"discovery","summary":"Captured spend anchor, probing run/change split"}
[/PHASE_UPDATE]`
  }

  if (turns === 2 || textIncludes(input, ['run', 'change', '70', '60', '80', 'baU', 'maintain'])) {
    return `That's helpful context. A heavy run ratio — common in manufacturing with legacy ERP and global operations — often signals **accumulated technical debt** and vendor lock-in rather than lack of discipline.

I'd like to shift into the **application portfolio** next, because that's where Culligan typically sees duplication: dealer CRM, field service, IoT platforms, and regional instances of the same capability.

**Do you maintain a formal application inventory**, and are there known areas of overlap — for example, multiple CRM or field service tools across regions or the dealer network?

If you're not sure, describe how many major platforms sit above $1M annual cost — that alone usually reveals rationalisation candidates.

[PHASE_UPDATE]
{"phase":"deep-dive","summary":"Moving to application portfolio rationalisation"}
[/PHASE_UPDATE]`
  }

  if (turns >= 3) {
    return `Based on what you've shared, I'm forming a clear picture. Let me reflect back:

Culligan's IT cost base has the classic profile of a **global manufacturer with a distributed dealer and field service model** — meaningful spend in ERP, cloud growth, and fragmented application support. The good news: that combination usually yields **$5–12M in addressable savings** over 18 months without compromising digital capability — if sequenced correctly.

I'd flag three immediate hypotheses:
1. **Cloud FinOps** — quick wins with measurable ROI in 90 days
2. **Application rationalisation** — duplicate regional and dealer tools
3. **Vendor renegotiation** — ERP and infrastructure contracts at renewal

We can go deeper on any of these, or I can **draft a prioritised roadmap** now.

What would be most valuable — cloud, applications, vendor contracts, or a full roadmap summary?

[PHASE_UPDATE]
{"phase":"analysis","summary":"Synthesising findings and sizing opportunity range"}
[/PHASE_UPDATE]

[SAVINGS_OPPORTUNITY]
{"title":"Application Portfolio Rationalisation","category":"Applications","annualSavingLow":1500000,"annualSavingHigh":3000000,"effort":"Medium","timeframe":"6-18 months","confidence":"Medium","summary":"Consolidate duplicate CRM and field service tools across regions and dealer network"}
[/SAVINGS_OPPORTUNITY]

[SAVINGS_OPPORTUNITY]
{"title":"SaaS Licence Optimisation","category":"Applications","annualSavingLow":400000,"annualSavingHigh":800000,"effort":"Low","timeframe":"Quick Win","confidence":"High","summary":"Reclaim unused licences across corporate and dealer SaaS estate"}
[/SAVINGS_OPPORTUNITY]`
  }

  return `I appreciate that detail — it adds useful colour to the picture.

To keep us moving efficiently: could you share either your **approximate total IT spend** or the **largest cost category** you're concerned about (cloud, ERP, outsourcing, applications)?

That will let me benchmark against Culligan's peer set and start quantifying opportunities for the roadmap.

[PHASE_UPDATE]
{"phase":"discovery","summary":"Gathering baseline spend information"}
[/PHASE_UPDATE]`
}

export async function sendDemoMessage(messages, userContent) {
  return getDemoResponse(messages, userContent)
}
