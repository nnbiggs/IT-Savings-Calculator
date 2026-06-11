import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

export default function TypingIndicator() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const Wrapper = reducedMotion ? 'div' : motion.div

  return (
    <Wrapper
      {...(reducedMotion
        ? {}
        : {
            initial: { opacity: 0, y: isMobile ? 0 : 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0 },
          })}
      className="flex justify-start"
    >
      <div className="rounded-2xl rounded-bl-md border border-light-blue/60 bg-white px-4 py-3 shadow-sm">
        <div className="mb-1.5 flex items-center gap-2">
          <div
            className={`flex items-center justify-center rounded-full bg-navy font-bold text-white ${
              isMobile ? 'h-7 w-7 text-[8px]' : 'h-5 w-5 text-[9px]'
            }`}
          >
            PwC
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Analysing...
          </span>
        </div>
        <div className="flex gap-1.5 py-1">
          {[0, 1, 2].map((i) => {
            const Dot = reducedMotion ? 'span' : motion.span
            return (
              <Dot
                key={i}
                className="h-2 w-2 rounded-full bg-teal/60"
                {...(reducedMotion
                  ? {}
                  : {
                      animate: { opacity: [0.3, 1, 0.3], y: [0, -4, 0] },
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      },
                    })}
              />
            )
          })}
        </div>
      </div>
    </Wrapper>
  )
}
