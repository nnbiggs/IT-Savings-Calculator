import { motion } from 'framer-motion'
import { PHASES, getPhaseIndex } from '../lib/parseInsights'

export default function SessionProgress({ currentPhase }) {
  const activeIndex = getPhaseIndex(currentPhase)

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-body/50">
        Session Progress
      </h3>
      <div className="space-y-2">
        {PHASES.map((phase, index) => {
          const isActive = index === activeIndex
          const isComplete = index < activeIndex

          return (
            <div key={phase.id} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: isComplete
                      ? '#1E7A46'
                      : isActive
                        ? '#1B7F9E'
                        : '#D6E8F5',
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isComplete || isActive ? 'text-white' : 'text-body/40'
                  }`}
                >
                  {isComplete ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </motion.div>
                {index < PHASES.length - 1 && (
                  <div
                    className={`mt-1 h-4 w-0.5 ${
                      index < activeIndex ? 'bg-success' : 'bg-light-blue'
                    }`}
                  />
                )}
              </div>
              <div className="pb-2">
                <p
                  className={`text-sm font-semibold ${
                    isActive ? 'text-teal' : isComplete ? 'text-success' : 'text-body/50'
                  }`}
                >
                  {phase.label}
                </p>
                <p className="text-[11px] text-body/40">{phase.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
