import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function MobileDrawer({
  open,
  onClose,
  onReset,
  onGoToAnalysis,
  onUploadFile,
  isLoading,
}) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-navy/40"
            onClick={onClose}
          />
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed left-0 right-0 top-14 z-50 border-b border-light-blue/30 bg-navy shadow-xl"
          >
            <div className="flex flex-col gap-1 p-4">
              <label
                className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg px-4 text-sm font-semibold text-white active:scale-95 transition hover:bg-white/10 has-[:disabled]:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export / Upload data
                <input
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  disabled={isLoading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onUploadFile(file)
                      onClose()
                    }
                    e.target.value = ''
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  onReset()
                  onClose()
                }}
                disabled={isLoading}
                className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 text-left text-sm font-semibold text-white active:scale-95 transition hover:bg-white/10 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset session
              </button>
              <button
                type="button"
                onClick={() => {
                  onGoToAnalysis()
                  onClose()
                }}
                className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 text-left text-sm font-semibold text-white active:scale-95 transition hover:bg-white/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Go to Analysis
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
