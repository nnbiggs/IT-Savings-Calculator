import Header from './components/Header'
import ChatPanel from './components/ChatPanel'
import InsightsPanel from './components/InsightsPanel'
import { useSavingsAgent } from './hooks/useSavingsAgent'

export default function App() {
  const {
    messages,
    opportunities,
    facts,
    currentPhase,
    isLoading,
    error,
    totalSavingsLow,
    totalSavingsHigh,
    compareScenarioIds,
    highlightedScenarioId,
    qualityReport,
    cleansingRecommendations,
    cleansingLoading,
    editingField,
    sendUserMessage,
    resetSession,
    startSession,
    toggleCompareScenario,
    setEditingField,
    acceptRecommendation,
    saveFieldEdit,
    handleFileUpload,
  } = useSavingsAgent()

  const handleReset = () => {
    resetSession()
    setTimeout(() => startSession(), 100)
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        onReset={handleReset}
        isLoading={isLoading}
        onFileUpload={handleFileUpload}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-light-grey/30">
          <div className="shrink-0 border-b border-light-blue/30 bg-white/60 px-6 py-3">
            <p className="text-xs text-body/50">
              Conversational IT savings analysis for{' '}
              <span className="font-semibold text-navy">Culligan International</span>
              {' '}— data quality score:{' '}
              <span className="font-semibold text-teal">{qualityReport.overallScore}%</span>
              {' '}({qualityReport.qualityLevel})
            </p>
          </div>
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSend={sendUserMessage}
          />
        </main>

        <InsightsPanel
          opportunities={opportunities}
          facts={facts}
          currentPhase={currentPhase}
          totalSavingsLow={totalSavingsLow}
          totalSavingsHigh={totalSavingsHigh}
          compareScenarioIds={compareScenarioIds}
          highlightedScenarioId={highlightedScenarioId}
          onToggleCompareScenario={toggleCompareScenario}
          qualityReport={qualityReport}
          cleansingRecommendations={cleansingRecommendations}
          cleansingLoading={cleansingLoading}
          editingField={editingField}
          onSelectField={setEditingField}
          onAcceptRecommendation={acceptRecommendation}
          onSaveFieldEdit={saveFieldEdit}
          onCancelEdit={() => setEditingField(null)}
        />
      </div>
    </div>
  )
}
