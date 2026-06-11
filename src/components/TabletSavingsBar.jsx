import { formatCurrency, formatSavingRange } from '../lib/parseInsights'

function formatEvCompact(low, high) {
  if (!low && !high) return '$160–370M'
  const evLow = low * 10
  const evHigh = high * 10
  return `${formatCurrency(evLow)} – ${formatCurrency(evHigh)}`
}

export default function TabletSavingsBar({
  totalSavingsLow,
  totalSavingsHigh,
  onTap,
}) {
  const hasSavings = totalSavingsLow > 0 || totalSavingsHigh > 0
  const savings = hasSavings
    ? formatSavingRange(totalSavingsLow, totalSavingsHigh)
    : '$16M – $31M'
  const ev = formatEvCompact(totalSavingsLow, totalSavingsHigh)

  return (
    <button
      type="button"
      onClick={onTap}
      className="fixed bottom-0 left-0 right-0 z-40 flex min-h-[48px] items-center justify-center border-t border-light-blue/50 bg-navy px-4 py-3 text-sm font-semibold text-white active:scale-[0.99] transition safe-bottom"
    >
      <span>
        Savings: {savings}
        <span className="mx-2 text-light-blue/50">·</span>
        EV: {ev}
      </span>
      <svg
        className="ml-2 h-4 w-4 text-light-blue/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
