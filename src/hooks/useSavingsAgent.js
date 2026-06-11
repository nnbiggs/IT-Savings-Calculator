import { useCallback, useEffect, useRef, useState } from 'react'
import { sendMessage, isDemoModeEnabled, getDemoModeActive, resetDemoMode } from '../lib/agent'
import { buildSystemPrompt, START_MESSAGE } from '../lib/systemPrompt'
import { extractInsights } from '../lib/parseInsights'
import { DEFAULT_COMPARE_SCENARIOS, SCENARIO_IDS } from '../data/scenarios'
import { DEFAULT_KNOWLEDGE_DATA, parseUploadedValue } from '../data/knowledgeData'
import {
  assessDataQuality,
  getQualityContextForPrompt,
  mergeKnowledgeFromFacts,
} from '../utils/dataQuality'
import {
  assessAndCleanseData,
  parseRecommendedValue,
} from '../utils/dataCleanser'

let messageId = 0
function nextId() {
  messageId += 1
  return messageId
}

export function useSavingsAgent() {
  const [messages, setMessages] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [facts, setFacts] = useState([])
  const [currentPhase, setCurrentPhase] = useState('discovery')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled())
  const [compareScenarioIds, setCompareScenarioIds] = useState(DEFAULT_COMPARE_SCENARIOS)
  const [highlightedScenarioId, setHighlightedScenarioId] = useState(SCENARIO_IDS.CURRENT)

  const [knowledgeData, setKnowledgeData] = useState(DEFAULT_KNOWLEDGE_DATA)
  const [estimatedFields, setEstimatedFields] = useState({})
  const [qualityReport, setQualityReport] = useState(() =>
    assessDataQuality(DEFAULT_KNOWLEDGE_DATA),
  )
  const [cleansingRecommendations, setCleansingRecommendations] = useState([])
  const [cleansingLoading, setCleansingLoading] = useState(false)
  const [editingField, setEditingField] = useState(null)

  const apiMessagesRef = useRef([])
  const startingRef = useRef(false)

  const runQualityPipeline = useCallback(
    async (data, estimates = estimatedFields, demo = isDemoMode) => {
      const report = assessDataQuality(data, estimates)
      setQualityReport(report)

      if (report.issueCount > 0) {
        setCleansingLoading(true)
        const recs = await assessAndCleanseData(data, report, { forceDemo: demo })
        setCleansingRecommendations(recs)
        setCleansingLoading(false)
      } else {
        setCleansingRecommendations([])
      }

      return report
    },
    [estimatedFields, isDemoMode],
  )

  useEffect(() => {
    runQualityPipeline(knowledgeData, estimatedFields, isDemoMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateKnowledgeData = useCallback(
    (updates, { isEstimate = false } = {}) => {
      setKnowledgeData((prev) => {
        const next = { ...prev, ...updates }
        if (isEstimate) {
          setEstimatedFields((ef) => ({
            ...ef,
            ...Object.fromEntries(Object.keys(updates).map((k) => [k, true])),
          }))
        }
        runQualityPipeline(next, { ...estimatedFields, ...(isEstimate ? updates : {}) }, isDemoMode)
        return next
      })
    },
    [estimatedFields, isDemoMode, runQualityPipeline],
  )

  const processResponse = useCallback(
    (rawText) => {
      const { opportunities: newOpps, facts: newFacts, phaseUpdate, scenarioView } =
        extractInsights(rawText)

      if (newOpps.length) {
        setOpportunities((prev) => {
          const titles = new Set(prev.map((o) => o.title))
          const unique = newOpps.filter((o) => !titles.has(o.title))
          return [...prev, ...unique]
        })
      }

      if (newFacts.length) {
        setFacts((prev) => {
          const labels = new Set(prev.map((f) => f.label))
          const unique = newFacts.filter((f) => !labels.has(f.label))
          const mergedFacts = [...prev, ...unique]
          setKnowledgeData((kd) => {
            const merged = mergeKnowledgeFromFacts(kd, unique)
            runQualityPipeline(merged, estimatedFields, isDemoMode)
            return merged
          })
          return mergedFacts
        })
      }

      if (phaseUpdate?.phase) setCurrentPhase(phaseUpdate.phase)

      if (scenarioView?.scenarios?.length) {
        setCompareScenarioIds(scenarioView.scenarios)
        if (scenarioView.highlight) setHighlightedScenarioId(scenarioView.highlight)
      }

      return rawText
    },
    [estimatedFields, isDemoMode, runQualityPipeline],
  )

  const callAgent = useCallback(
    async (userContent) => {
      setIsLoading(true)
      setError(null)

      const qualityContext = getQualityContextForPrompt(qualityReport)
      const systemPrompt = buildSystemPrompt(qualityContext)

      const userMsg = { role: 'user', content: userContent }
      apiMessagesRef.current = [...apiMessagesRef.current, userMsg]

      try {
        const rawResponse = await sendMessage(apiMessagesRef.current, systemPrompt, {
          forceDemo: isDemoMode,
        })
        const assistantMsg = { role: 'assistant', content: rawResponse }
        apiMessagesRef.current = [...apiMessagesRef.current, assistantMsg]

        processResponse(rawResponse)

        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: rawResponse,
            timestamp: new Date(),
          },
        ])

        if (getDemoModeActive()) setIsDemoMode(true)
      } catch (err) {
        apiMessagesRef.current = apiMessagesRef.current.slice(0, -1)
        setError(err.message || 'Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [processResponse, isDemoMode, qualityReport],
  )

  const startSession = useCallback(async () => {
    if (sessionStarted || startingRef.current) return
    startingRef.current = true
    setSessionStarted(true)
    await callAgent(START_MESSAGE)
    startingRef.current = false
  }, [sessionStarted, callAgent])

  const sendUserMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed, timestamp: new Date() },
      ])

      await callAgent(trimmed)
    },
    [isLoading, callAgent],
  )

  const toggleCompareScenario = useCallback((scenarioId) => {
    setCompareScenarioIds((prev) => {
      if (prev.includes(scenarioId)) {
        if (prev.length <= 1) return prev
        return prev.filter((id) => id !== scenarioId)
      }
      if (prev.length >= 3) return [...prev.slice(1), scenarioId]
      return [...prev, scenarioId]
    })
    setHighlightedScenarioId(scenarioId)
  }, [])

  const acceptRecommendation = useCallback(
    (fieldKey, recommendation) => {
      const parsed = parseRecommendedValue(recommendation)
      const value =
        typeof parsed === 'number'
          ? fieldKey.includes('Spend')
            ? parsed < 1000
              ? parsed * 1_000_000
              : parsed
            : parsed
          : parsed

      updateKnowledgeData({ [fieldKey]: value }, { isEstimate: true })
      setEditingField(null)
    },
    [updateKnowledgeData],
  )

  const saveFieldEdit = useCallback(
    (fieldKey, rawValue) => {
      const value = parseUploadedValue(fieldKey, rawValue)
      updateKnowledgeData({ [fieldKey]: value, vendorContractsMinimumOnly: false })
      setEstimatedFields((ef) => {
        const next = { ...ef }
        delete next[fieldKey]
        return next
      })
      setEditingField(null)
    },
    [updateKnowledgeData],
  )

  const handleFileUpload = useCallback(
    (extracted, filename, uploadError) => {
      if (uploadError) {
        setError(`File upload failed: ${uploadError}`)
        return
      }
      if (!extracted || !Object.keys(extracted).length) {
        setError('No recognisable IT data fields found in upload.')
        return
      }
      updateKnowledgeData({ ...extracted, source: `File upload: ${filename}` })
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'user',
          content: `[Uploaded file: ${filename}] — please assess data quality and summarise findings.`,
          timestamp: new Date(),
        },
      ])
      callAgent(
        `[Uploaded file: ${filename}] Data extracted and quality-checked. Summarise data quality issues and how they affect the savings analysis.`,
      )
    },
    [updateKnowledgeData, callAgent],
  )

  const resetSession = useCallback(() => {
    messageId = 0
    apiMessagesRef.current = []
    startingRef.current = false
    resetDemoMode()
    setIsDemoMode(isDemoModeEnabled())
    setMessages([])
    setOpportunities([])
    setFacts([])
    setCurrentPhase('discovery')
    setCompareScenarioIds(DEFAULT_COMPARE_SCENARIOS)
    setHighlightedScenarioId(SCENARIO_IDS.CURRENT)
    setKnowledgeData(DEFAULT_KNOWLEDGE_DATA)
    setEstimatedFields({})
    setQualityReport(assessDataQuality(DEFAULT_KNOWLEDGE_DATA))
    setCleansingRecommendations([])
    setEditingField(null)
    setError(null)
    setSessionStarted(false)
  }, [])

  useEffect(() => {
    startSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalSavingsLow = opportunities.reduce((sum, o) => sum + (o.annualSavingLow || 0), 0)
  const totalSavingsHigh = opportunities.reduce((sum, o) => sum + (o.annualSavingHigh || 0), 0)

  return {
    messages,
    opportunities,
    facts,
    currentPhase,
    isLoading,
    error,
    sessionStarted,
    isDemoMode,
    compareScenarioIds,
    highlightedScenarioId,
    qualityReport,
    cleansingRecommendations,
    cleansingLoading,
    editingField,
    totalSavingsLow,
    totalSavingsHigh,
    sendUserMessage,
    resetSession,
    startSession,
    toggleCompareScenario,
    setEditingField,
    acceptRecommendation,
    saveFieldEdit,
    handleFileUpload,
  }
}
