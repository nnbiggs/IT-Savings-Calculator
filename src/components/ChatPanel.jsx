import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'

export default function ChatPanel({
  messages,
  isLoading,
  error,
  onSend,
}) {
  const scrollRef = useRef(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input)
    setInput('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mx-6 mb-3 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
          {(error.includes('ANTHROPIC_API_KEY') || error.includes('not set')) && (
            <span className="block mt-1 text-xs text-danger/70">
              Edit <code className="font-mono">culligan-savings-agent/.env</code>, add your key, then
              restart <code className="font-mono">npm run dev</code>.
            </span>
          )}
          {(error.includes('resolve') || error.includes('VPN') || error.includes('502')) && (
            <span className="block mt-1 text-xs text-danger/70">
              If you are on a corporate VPN, try reconnecting or switching network, then refresh.
            </span>
          )}
        </div>
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
