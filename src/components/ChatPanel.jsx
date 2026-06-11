import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'
import SuggestedPrompts from './SuggestedPrompts'
import { useIsMobile } from '../hooks/useBreakpoint'
import { useKeyboardVisible } from '../hooks/useKeyboardVisible'

const MAX_VISIBLE_MESSAGES = 50

export default function ChatPanel({
  messages,
  isLoading,
  error,
  onSend,
  className = '',
}) {
  const scrollRef = useRef(null)
  const [input, setInput] = useState('')
  const isMobile = useIsMobile()
  const keyboardVisible = useKeyboardVisible()

  const visibleMessages = messages.slice(-MAX_VISIBLE_MESSAGES)
  const hasUserMessage = messages.some((m) => m.role === 'user')
  const showPrompts = !hasUserMessage && !isLoading

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, keyboardVisible])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input)
    setInput('')
  }

  const handlePromptSelect = (prompt) => {
    if (isLoading) return
    onSend(prompt)
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6"
      >
        {visibleMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger sm:mx-6">
          {error}
          {(error.includes('ANTHROPIC_API_KEY') || error.includes('not set')) && (
            <span className="mt-1 block text-xs text-danger/70">
              Edit <code className="font-mono">.env</code>, add your key or set{' '}
              <code className="font-mono">VITE_DEMO_MODE=true</code>, then
              restart <code className="font-mono">npm run dev</code>.
            </span>
          )}
          {(error.includes('resolve') || error.includes('VPN') || error.includes('502')) && (
            <span className="mt-1 block text-xs text-danger/70">
              If you are on a corporate VPN, try reconnecting or switching network, then refresh.
            </span>
          )}
        </div>
      )}

      <SuggestedPrompts onSelect={handlePromptSelect} visible={showPrompts} />

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        compact={isMobile}
      />
    </div>
  )
}
