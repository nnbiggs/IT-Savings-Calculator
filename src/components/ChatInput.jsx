export default function ChatInput({ value, onChange, onSubmit, isLoading, compact = false }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <div
      className={`shrink-0 border-t border-light-blue/50 bg-white ${
        compact ? 'px-3 py-3' : 'px-4 py-4 sm:px-6'
      }`}
    >
      <form onSubmit={onSubmit} className="flex items-end gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your IT context or answer the consultant's question..."
            rows={compact ? 1 : 2}
            disabled={isLoading}
            className={`w-full resize-none rounded-xl border border-light-blue bg-light-grey/50 px-3 py-2.5 text-body placeholder:text-body/40 focus:border-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-60 sm:px-4 sm:py-3 ${
              compact ? 'text-sm' : 'text-sm sm:text-base'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={`flex shrink-0 items-center justify-center rounded-xl bg-teal text-white transition hover:bg-teal/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
            compact ? 'h-11 w-11' : 'h-11 w-11 sm:h-11 sm:w-11'
          }`}
          aria-label="Send message"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
      {!compact && (
        <p className="mt-2 hidden text-[11px] text-body/40 sm:block">
          Press Enter to send · Shift+Enter for new line
        </p>
      )}
    </div>
  )
}
