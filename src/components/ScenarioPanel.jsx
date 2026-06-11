import { motion } from 'framer-motion'
import {
  SCENARIOS,
  SCENARIO_IDS,
} from '../data/scenarios'
import { buildComparisonRows, getChartMetrics, getDeltaDirection } from '../lib/scenarioUtils'

function DeltaIndicator({ direction }) {
  if (direction === 'better') {
    return (
      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-success" title="Improvement vs today" />
    )
  }
  if (direction === 'worse') {
    return (
      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-danger" title="Higher vs today" />
    )
  }
  return null
}

function MetricBarChart({ chartMetrics }) {
  const globalMax = Math.max(
    ...chartMetrics.flatMap((m) => m.bars.map((b) => b.value)),
    1,
  )

  return (
    <div className="space-y-4">
      {chartMetrics.map((metric) => (
        <div key={metric.key}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-body/50">
            {metric.label}
          </p>
          <div className="space-y-1.5">
            {metric.bars.map((bar) => (
              <div key={bar.id} className="flex items-center gap-2">
                <span
                  className="w-16 shrink-0 truncate text-[10px] font-medium text-body/60"
                  title={bar.label}
                >
                  {bar.label}
                </span>
                <div className="relative h-4 flex-1 overflow-hidden rounded bg-light-grey">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(bar.value / globalMax) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded"
                    style={{ backgroundColor: bar.color }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-[10px] font-semibold text-navy">
                  {bar.value > 0 ? bar.value : '—'}
                </span>
              </div>
            ))}
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
}) {
  const rows = buildComparisonRows(compareIds)
  const chartMetrics = getChartMetrics(compareIds)
  const baseline = SCENARIOS.find((s) => s.id === SCENARIO_IDS.CURRENT)
  const highlighted = SCENARIOS.find((s) => s.id === highlightedId)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-body/50">
          Scenario Model
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-body/50">
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
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
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

      {highlighted && (
        <motion.div
          key={highlighted.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-3"
          style={{ borderColor: `${highlighted.color}40`, backgroundColor: `${highlighted.color}08` }}
        >
          <p className="text-xs font-semibold" style={{ color: highlighted.color }}>
            {highlighted.label}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-body/70">
            {highlighted.description}
          </p>
          {highlighted.data.note && (
            <p className="mt-2 text-[11px] font-medium text-teal">{highlighted.data.note}</p>
          )}
        </motion.div>
      )}

      <MetricBarChart chartMetrics={chartMetrics} />

      <div className="overflow-hidden rounded-xl border border-light-blue/60">
        <div
          className="grid text-[10px] font-semibold uppercase tracking-wider text-body/50"
          style={{
            gridTemplateColumns: `minmax(88px, 1fr) repeat(${compareIds.length}, minmax(72px, 1fr))`,
          }}
        >
          <div className="border-b border-light-blue/40 bg-light-grey px-2 py-2">Metric</div>
          {compareIds.map((id) => {
            const s = SCENARIOS.find((sc) => sc.id === id)
            return (
              <div
                key={id}
                className="border-b border-l border-light-blue/40 bg-light-grey px-2 py-2"
              >
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: s?.color }}
                />
                <span className="normal-case">{s?.label.split('—')[0].trim()}</span>
              </div>
            )
          })}
        </div>

        {rows.map((row, rowIdx) => (
          <div
            key={row.key}
            className={`grid text-[11px] ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-light-grey/40'}`}
            style={{
              gridTemplateColumns: `minmax(88px, 1fr) repeat(${compareIds.length}, minmax(72px, 1fr))`,
            }}
          >
            <div className="px-2 py-2 font-medium text-body/60">{row.label}</div>
            {row.values.map((cell) => {
              const isBaseline = cell.scenarioId === SCENARIO_IDS.CURRENT
              const direction =
                !isBaseline && baseline
                  ? getDeltaDirection(row.key, baseline.data[row.key], cell.value)
                  : 'neutral'

              return (
                <div
                  key={cell.scenarioId}
                  className="border-l border-light-blue/30 px-2 py-2 font-semibold text-navy"
                >
                  <span className="leading-snug">{cell.value}</span>
                  {!isBaseline && <DeltaIndicator direction={direction} />}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {compareIds.some((id) => {
        const s = SCENARIOS.find((sc) => sc.id === id)
        return s?.savingsBreakdown
      }) && (
        <div>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-body/50">
            Savings Breakdown
          </h4>
          <div className="space-y-2">
            {compareIds.map((id) => {
              const s = SCENARIOS.find((sc) => sc.id === id)
              if (!s?.savingsBreakdown) return null
              return (
                <div key={id} className="rounded-lg bg-light-grey/60 p-3">
                  <p className="mb-2 text-[11px] font-semibold" style={{ color: s.color }}>
                    {s.label}
                  </p>
                  <div className="space-y-1">
                    {Object.entries(s.savingsBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-[11px]">
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
