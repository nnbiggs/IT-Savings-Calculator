import { sendMessage as sendAnthropicMessage } from './anthropic'
import { getDemoResponse, isDemoModeEnabled } from './demoAgent'

let demoModeActive = isDemoModeEnabled()

export function getDemoModeActive() {
  return demoModeActive
}

export function resetDemoMode() {
  demoModeActive = isDemoModeEnabled()
}

export async function sendMessage(messages, systemPrompt, { forceDemo = false } = {}) {
  const lastContent = messages[messages.length - 1]?.content ?? ''

  if (forceDemo || demoModeActive) {
    demoModeActive = true
    return getDemoResponse(messages, lastContent)
  }

  try {
    return await sendAnthropicMessage(messages, systemPrompt)
  } catch (error) {
    const isMissingKey =
      error.message?.includes('ANTHROPIC_API_KEY') ||
      error.message?.includes('not set') ||
      error.message?.includes('503') ||
      error.message?.includes('404')

    if (isMissingKey) {
      demoModeActive = true
      return getDemoResponse(messages, lastContent)
    }

    throw error
  }
}

export { isDemoModeEnabled }
