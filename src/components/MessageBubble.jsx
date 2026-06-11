import { motion } from 'framer-motion'
import { stripStructuredBlocks } from '../lib/parseInsights'

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

  if (!displayText) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-teal text-white'
            : 'rounded-bl-md border border-light-blue/60 bg-white text-body shadow-sm'
        }`}
      >
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[9px] font-bold text-white">
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
    </motion.div>
  )
}
