import { SUGGESTED_PROMPTS } from '../data/suggestedPrompts'
import { useIsMobile, useIsTablet } from '../hooks/useBreakpoint'

export default function SuggestedPrompts({ onSelect, visible }) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  if (!visible) return null

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2 px-4 pb-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="min-h-[44px] rounded-xl border border-light-blue/60 bg-white px-3 py-2.5 text-left text-xs font-medium text-body/80 shadow-sm active:scale-95 transition hover:border-teal/40 hover:bg-light-grey/50"
          >
            {prompt}
          </button>
        ))}
      </div>
    )
  }

  if (isTablet) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="shrink-0 rounded-full border border-light-blue/60 bg-white px-4 py-2 text-xs font-medium text-body/80 shadow-sm active:scale-95 transition hover:border-teal/40"
          >
            {prompt}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 px-6 pb-2">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-light-blue/60 bg-white px-4 py-2 text-xs font-medium text-body/80 shadow-sm active:scale-95 transition hover:border-teal/40"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
