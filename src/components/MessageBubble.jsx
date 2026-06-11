import { motion } from 'framer-motion'
import { stripStructuredBlocks } from '../lib/parseInsights'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-navy">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let listItems = []

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 list-disc space-y-1 pl-5">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
      listItems = []
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(trimmed.slice(2))
    } else {
      flushList()
      if (trimmed) {
        elements.push(
          <p key={idx} className="mb-2 last:mb-0">
            {renderInline(trimmed)}
          </p>,
        )
      }
    }
  })

  flushList()
  return elements
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const displayText = isUser
    ? message.content
    : stripStructuredBlocks(message.content)
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  if (!displayText) return null

  const Wrapper = reducedMotion ? 'div' : motion.div
  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: isMobile ? 0 : 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: isMobile ? 0.15 : 0.3, ease: 'easeOut' },
      }

  return (
    <Wrapper
      {...motionProps}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 leading-relaxed ${
          isMobile ? 'max-w-[88%] text-sm' : 'max-w-[80%] text-sm md:max-w-[80%] lg:max-w-[75%] lg:text-base'
        } ${
          isUser
            ? 'rounded-br-md bg-navy text-white'
            : 'rounded-bl-md border-l-4 border-l-teal border border-light-blue/60 bg-white text-body shadow-sm'
        }`}
      >
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-2">
            <div
              className={`flex items-center justify-center rounded-full bg-navy font-bold text-white ${
                isMobile ? 'h-7 w-7 text-[8px]' : 'h-5 w-5 text-[9px]'
              }`}
            >
              PwC
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
              IT Strategy Partner
            </span>
          </div>
        )}
        <div className={isUser ? '' : 'text-body/90'}>
          {isUser ? displayText : renderMarkdown(displayText)}
        </div>
      </div>
    </Wrapper>
  )
}
