import { motion } from 'framer-motion'
import { SCENARIOS } from '../data/scenarios'
import { getChartMetrics } from '../lib/scenarioUtils'
import ScenarioCard from './ScenarioCard'
import ScenarioComparison from './ScenarioComparison'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

function MetricBarChart({ chartMetrics }) {
  const reducedMotion = useReducedMotion()
  const globalMax = Math.max(
    ...chartMetrics.flatMap((m) => m.bars.map((b) => b.value)),
    1,
  )

  return (
    <div className="space-y-4">
      {chartMetrics.map((metric) => (
        <div key={metric.key}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-body/50 sm:text-sm">
            {metric.label}
          </p>
          <div className="space-y-1.5">
            {metric.bars.map((bar) => {
              const Bar = reducedMotion ? 'div' : motion.div
              const barProps = reducedMotion
                ? { style: { width: `${(bar.value / globalMax) * 100}%`, backgroundColor: bar.color } }
                : {
                    initial: { width: 0 },
                    animate: { width: `${(bar.value / globalMax) * 100}%` },
                    transition: { duration: 0.5, ease: 'easeOut' },
                    style: { backgroundColor: bar.color },
                  }

              return (
                <div key={bar.id} className="flex items-center gap-2">
                  <span
                    className="w-16 shrink-0 truncate text-[10px] font-medium text-body/60 sm:text-xs"
                    title={bar.label}
                  >
                    {bar.label}
                  </span>
                  <div className="relative h-4 flex-1 overflow-hidden rounded bg-light-grey">
                    <Bar {...barProps} className="h-full rounded" />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[10px] font-semibold text-navy sm:text-xs">
                    {bar.value > 0 ? bar.value : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ScenarioPanel({
  compareIds,
  highlightedId,
  onToggleCompare,
  lazy = false,
}) {
  const isMobile = useIsMobile()
  const chartMetrics = getChartMetrics(compareIds)
  const highlighted = SCENARIOS.find((s) => s.id === highlightedId)

  if (lazy) {
    return (
      <div className="rounded-xl border border-dashed border-light-blue/60 px-4 py-8 text-center text-sm text-body/50">
        Open Scenarios tab to view comparison charts
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-navy sm:text-xl">
          Scenario Model
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-body/50 sm:text-sm">
          Compare Culligan&apos;s IT baseline against modelled future states
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((scenario) => {
          const isSelected = compareIds.includes(scenario.id)
          const isHighlighted = highlightedId === scenario.id

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onToggleCompare(scenario.id)}
              className={`min-h-[36px] rounded-full border px-2.5 py-1 text-[10px] font-semibold transition active:scale-95 sm:min-h-[44px] sm:px-3 sm:text-xs ${
                isSelected
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-light-blue bg-white text-body/60 hover:border-teal/40'
              } ${isHighlighted ? 'ring-2 ring-offset-1' : ''}`}
              style={
                isSelected
                  ? { backgroundColor: scenario.color, ringColor: scenario.color }
                  : undefined
              }
            >
              {scenario.label.split('—')[0].trim()}
            </button>
          )
        })}
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {SCENARIOS.filter((s) => compareIds.includes(s.id)).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isHighlighted={highlightedId === scenario.id}
              onSelect={onToggleCompare}
            />
          ))}
        </div>
      ) : (
        highlighted && (
          <ScenarioCard
            scenario={highlighted}
            isHighlighted
            onSelect={onToggleCompare}
          />
        )
      )}

      <MetricBarChart chartMetrics={chartMetrics} />

      <ScenarioComparison compareIds={compareIds} />

      {compareIds.some((id) => {
        const s = SCENARIOS.find((sc) => sc.id === id)
        return s?.savingsBreakdown
      }) && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-body/50 sm:text-sm">
            Savings Breakdown
          </h4>
          <div className="space-y-2">
            {compareIds.map((id) => {
              const s = SCENARIOS.find((sc) => sc.id === id)
              if (!s?.savingsBreakdown) return null
              return (
                <div key={id} className="rounded-lg bg-light-grey/60 p-3">
                  <p className="mb-2 text-xs font-semibold sm:text-sm" style={{ color: s.color }}>
                    {s.label}
                  </p>
                  <div className="space-y-1">
                    {Object.entries(s.savingsBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs sm:text-sm">
                        <span className="capitalize text-body/60">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-semibold text-navy">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
