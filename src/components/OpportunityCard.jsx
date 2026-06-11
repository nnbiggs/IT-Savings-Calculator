import { motion } from 'framer-motion'
import { formatSavingRange } from '../lib/parseInsights'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

const effortColors = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-amber/10 text-amber',
  High: 'bg-danger/10 text-danger',
}

const confidenceColors = {
  High: 'text-success',
  Medium: 'text-amber',
  Low: 'text-body/50',
}

export default function OpportunityCard({ opportunity, index }) {
  const {
    title,
    category,
    annualSavingLow,
    annualSavingHigh,
    effort,
    timeframe,
    confidence,
    summary,
  } = opportunity

  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const Wrapper = reducedMotion || isMobile ? 'div' : motion.div
  const motionProps =
    reducedMotion || isMobile
      ? {}
      : {
          initial: { opacity: 0, x: 12 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: index * 0.08 },
        }

  return (
    <Wrapper
      {...motionProps}
      className="rounded-xl border border-light-blue/60 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-navy sm:text-base">{title}</h4>
        {category && (
          <span className="shrink-0 rounded-full bg-light-blue px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal sm:text-xs">
            {category}
          </span>
        )}
      </div>

      {summary && (
        <p className="mb-3 text-xs leading-relaxed text-body/70 sm:text-sm">{summary}</p>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-body/40 sm:text-sm">
            Est. Annual Saving
          </p>
          <p className="text-base font-bold text-success sm:text-lg">
            {formatSavingRange(annualSavingLow, annualSavingHigh)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {effort && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${effortColors[effort] || 'bg-light-grey text-body/50'}`}
            >
              {effort} Effort
            </span>
          )}
          {timeframe && (
            <span className="text-[10px] font-medium text-body/50 sm:text-xs">
              {timeframe}
            </span>
          )}
        </div>
      </div>

      {confidence && (
        <p className={`mt-2 text-[10px] font-medium sm:text-xs ${confidenceColors[confidence] || ''}`}>
          {confidence} confidence
        </p>
      )}
    </Wrapper>
  )
}
