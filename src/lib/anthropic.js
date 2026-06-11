const API_URL = '/api/anthropic/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1000

export async function sendMessage(messages, systemPrompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map(({ role, content }) => ({
        role,
        content,
      })),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    let message = `API request failed (${response.status})`
    try {
      const parsed = JSON.parse(errorBody)
      message = parsed.error?.message || message
    } catch {
      if (errorBody) message = errorBody
    }
    throw new Error(message)
  }

  const data = await response.json()
  const textBlock = data.content?.find((block) => block.type === 'text')
  return textBlock?.text ?? ''
}
