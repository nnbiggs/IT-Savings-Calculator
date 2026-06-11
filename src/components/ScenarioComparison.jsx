import { useRef, useState } from 'react'
import { SCENARIOS, SCENARIO_IDS } from '../data/scenarios'
import { buildComparisonRows, getDeltaDirection } from '../lib/scenarioUtils'
import { useIsMobile } from '../hooks/useBreakpoint'

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

function MobileSwipeView({ compareIds, rows }) {
  const [index, setIndex] = useState(0)
  const touchStart = useRef(null)
  const baseline = SCENARIOS.find((s) => s.id === SCENARIO_IDS.CURRENT)
  const scenarioId = compareIds[index]
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStart.current == null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && index < compareIds.length - 1) setIndex((i) => i + 1)
      if (diff < 0 && index > 0) setIndex((i) => i - 1)
    }
    touchStart.current = null
  }

  if (!scenario) return null

  return (
    <div
      className="rounded-xl border border-light-blue/60 bg-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between border-b border-light-blue/40 bg-light-grey px-4 py-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="min-h-[44px] min-w-[44px] rounded-lg text-body/50 disabled:opacity-30 active:scale-95"
          aria-label="Previous scenario"
        >
          ‹
        </button>
        <div className="text-center">
          <span
            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: scenario.color }}
          />
          <span className="text-sm font-semibold text-navy">{scenario.label.split('—')[0].trim()}</span>
          <p className="text-xs text-body/50">
            {index + 1} of {compareIds.length} — swipe to compare
          </p>
        </div>
        <button
          type="button"
          disabled={index === compareIds.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          className="min-h-[44px] min-w-[44px] rounded-lg text-body/50 disabled:opacity-30 active:scale-95"
          aria-label="Next scenario"
        >
          ›
        </button>
      </div>
      <div className="divide-y divide-light-blue/30">
        {rows.map((row) => {
          const cell = row.values.find((v) => v.scenarioId === scenarioId)
          const isBaseline = scenarioId === SCENARIO_IDS.CURRENT
          const direction =
            !isBaseline && baseline
              ? getDeltaDirection(row.key, baseline.data[row.key], cell?.value)
              : 'neutral'

          return (
            <div key={row.key} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-medium text-body/60">{row.label}</span>
              <span className="text-sm font-semibold text-navy">
                {cell?.value}
                {!isBaseline && <DeltaIndicator direction={direction} />}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DesktopTable({ compareIds, rows }) {
  const baseline = SCENARIOS.find((s) => s.id === SCENARIO_IDS.CURRENT)

  return (
    <div className="overflow-x-auto rounded-xl border border-light-blue/60">
      <div
        className="grid min-w-[480px] text-[10px] font-semibold uppercase tracking-wider text-body/50 sm:text-xs"
        style={{
          gridTemplateColumns: `minmax(88px, 1fr) repeat(${compareIds.length}, minmax(72px, 1fr))`,
        }}
      >
        <div className="border-b border-light-blue/40 bg-light-grey px-2 py-2 sm:px-3">Metric</div>
        {compareIds.map((id) => {
          const s = SCENARIOS.find((sc) => sc.id === id)
          return (
            <div
              key={id}
              className="border-b border-l border-light-blue/40 bg-light-grey px-2 py-2 sm:px-3"
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
          className={`grid min-w-[480px] text-xs sm:text-sm ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-light-grey/40'}`}
          style={{
            gridTemplateColumns: `minmax(88px, 1fr) repeat(${compareIds.length}, minmax(72px, 1fr))`,
          }}
        >
          <div className="px-2 py-2 font-medium text-body/60 sm:px-3">{row.label}</div>
          {row.values.map((cell) => {
            const isBaseline = cell.scenarioId === SCENARIO_IDS.CURRENT
            const direction =
              !isBaseline && baseline
                ? getDeltaDirection(row.key, baseline.data[row.key], cell.value)
                : 'neutral'

            return (
              <div
                key={cell.scenarioId}
                className="border-l border-light-blue/30 px-2 py-2 font-semibold text-navy sm:px-3"
              >
                <span className="leading-snug">{cell.value}</span>
                {!isBaseline && <DeltaIndicator direction={direction} />}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function ScenarioComparison({ compareIds, lazy = false }) {
  const isMobile = useIsMobile()
  const rows = buildComparisonRows(compareIds)

  if (lazy) return null

  if (isMobile) {
    return <MobileSwipeView compareIds={compareIds} rows={rows} />
  }

  return <DesktopTable compareIds={compareIds} rows={rows} />
}
