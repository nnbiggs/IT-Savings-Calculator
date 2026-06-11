import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatSavingRange } from '../lib/parseInsights'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

function formatEvRange(low, high) {
  if (!low && !high) return 'TBD'
  const evLow = low * 10
  const evHigh = high * 10
  return `${formatCurrency(evLow)} – ${formatCurrency(evHigh)}`
}

export default function SavingsTracker({
  totalSavingsLow,
  totalSavingsHigh,
  opportunities = [],
  qualityReport,
  compact = false,
}) {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const [expandedLine, setExpandedLine] = useState(null)

  const annualRange = formatSavingRange(totalSavingsLow, totalSavingsHigh)
  const evRange = formatEvRange(totalSavingsLow, totalSavingsHigh)
  const hasSavings = totalSavingsLow > 0 || totalSavingsHigh > 0

  const Wrapper = reducedMotion || isMobile ? 'div' : motion.div
  const wrapperProps =
    reducedMotion || isMobile
      ? {}
      : {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
        }

  if (compact) {
    return (
      <div className="rounded-xl bg-navy px-4 py-3 text-white">
        <p className="text-xs font-semibold text-light-blue/70 sm:text-sm">
          {annualRange}
          <span className="mx-2 text-light-blue/40">·</span>
          EV {evRange}
        </p>
      </div>
    )
  }

  return (
    <Wrapper {...wrapperProps} className="rounded-xl bg-navy p-4 text-white sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-light-blue/70 sm:text-sm">
        Identified Savings Range
      </p>
      <p className="mt-1 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
        {hasSavings ? annualRange : '$16M – $31M'}
        <span className="mt-0.5 block text-base font-medium text-light-blue/80 md:text-lg">
          / year
        </span>
      </p>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-light-blue/70 sm:text-sm">
        EV Impact
      </p>
      <p className="mt-1 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
        {hasSavings ? evRange : '$160M – $370M'}
      </p>

      {qualityReport?.overallScore < 90 && (
        <p className="mt-2 text-xs text-amber/90 sm:text-sm">
          Caveat: {qualityReport.qualityLevel} data ({qualityReport.overallScore}%)
        </p>
      )}

      {isMobile && opportunities.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
          {opportunities.map((opp) => (
            <button
              key={opp.title}
              type="button"
              onClick={() =>
                setExpandedLine(expandedLine === opp.title ? null : opp.title)
              }
              className="flex w-full min-h-[44px] items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left active:scale-[0.98] transition"
            >
              <span className="text-xs font-medium text-light-blue/90">{opp.title}</span>
              <span className="text-xs font-bold text-success">
                {formatSavingRange(opp.annualSavingLow, opp.annualSavingHigh)}
              </span>
            </button>
          ))}
          {expandedLine && (
            <p className="px-3 text-xs text-light-blue/70">
              {opportunities.find((o) => o.title === expandedLine)?.summary}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-light-blue/60 sm:text-sm">
          {opportunities.length} opportunit{opportunities.length === 1 ? 'y' : 'ies'} identified
        </p>
      )}
    </Wrapper>
  )
}
