import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

export default function ScenarioCard({ scenario, isHighlighted, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const savings = scenario.data?.annualSavingsCapture || '—'
  const keyMetric = scenario.data?.totalITSpend || '—'

  const handleClick = () => {
    if (isMobile) {
      setExpanded((e) => !e)
    }
    onSelect?.(scenario.id)
  }

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        isHighlighted ? 'ring-2 ring-offset-1' : ''
      }`}
      style={{
        borderColor: `${scenario.color}40`,
        backgroundColor: `${scenario.color}08`,
        ...(isHighlighted ? { ringColor: scenario.color } : {}),
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full min-h-[44px] items-start justify-between gap-2 text-left active:scale-[0.98] transition"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold sm:text-base" style={{ color: scenario.color }}>
            {scenario.label}
          </p>
          {isMobile && !expanded && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-body/60">
              <span>Spend: {keyMetric}</span>
              <span className="font-semibold text-success">Savings: {savings}</span>
            </div>
          )}
        </div>
        {isMobile && (
          <svg
            className={`h-5 w-5 shrink-0 text-body/40 transition ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {(!isMobile || expanded) && (
          <motion.div
            initial={reducedMotion || isMobile ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion || isMobile ? undefined : { height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-xs leading-relaxed text-body/70 sm:text-sm">
              {scenario.description}
            </p>
            {scenario.data?.note && (
              <p className="mt-2 text-xs font-medium text-teal sm:text-sm">{scenario.data.note}</p>
            )}
            {scenario.savingsBreakdown && (
              <div className="mt-3 space-y-1 border-t border-light-blue/30 pt-2">
                {Object.entries(scenario.savingsBreakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs sm:text-sm">
                    <span className="capitalize text-body/60">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-navy">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
