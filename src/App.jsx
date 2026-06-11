import { useRef, useState } from 'react'
import Header from './components/Header'
import ChatPanel from './components/ChatPanel'
import InsightsPanel from './components/InsightsPanel'
import MobileBottomNav from './components/MobileBottomNav'
import TabletSavingsBar from './components/TabletSavingsBar'
import { processUploadedFile } from './utils/fileUpload'
import { useSavingsAgent } from './hooks/useSavingsAgent'
import { useBreakpoint } from './hooks/useBreakpoint'
import { useKeyboardVisible } from './hooks/useKeyboardVisible'

export default function App() {
  const breakpoint = useBreakpoint()
  const keyboardVisible = useKeyboardVisible()
  const savingsTrackerRef = useRef(null)

  const [tabletTab, setTabletTab] = useState('chat')
  const [mobileTab, setMobileTab] = useState('chat')
  const [uploadProcessing, setUploadProcessing] = useState(false)

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

  const handleMobileUpload = async (file) => {
    setUploadProcessing(true)
    try {
      await processUploadedFile(file, handleFileUpload)
    } catch (err) {
      handleFileUpload(null, file.name, err.message)
    } finally {
      setUploadProcessing(false)
    }
  }

  const scrollToSavings = () => {
    if (breakpoint === 'tablet') {
      setTabletTab('analysis')
      setTimeout(() => {
        savingsTrackerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const insightsProps = {
    opportunities,
    facts,
    currentPhase,
    totalSavingsLow,
    totalSavingsHigh,
    compareScenarioIds,
    highlightedScenarioId,
    onToggleCompareScenario: toggleCompareScenario,
    qualityReport,
    cleansingRecommendations,
    cleansingLoading,
    editingField,
    onSelectField: setEditingField,
    onAcceptRecommendation: acceptRecommendation,
    onSaveFieldEdit: saveFieldEdit,
    onCancelEdit: () => setEditingField(null),
    savingsTrackerRef,
    lazyScenarios: breakpoint === 'mobile' && mobileTab !== 'scenarios',
  }

  const layout =
    breakpoint === 'mobile' ? 'mobile' : breakpoint === 'tablet' ? 'tablet' : 'desktop'

  const showChat =
    breakpoint === 'desktop' ||
    (breakpoint === 'tablet' && tabletTab === 'chat') ||
    (breakpoint === 'mobile' && mobileTab === 'chat')

  const showInsights =
    breakpoint === 'desktop' ||
    (breakpoint === 'tablet' && tabletTab === 'analysis') ||
    (breakpoint === 'mobile' && mobileTab !== 'chat')

  const mobileSection =
    mobileTab === 'analysis'
      ? 'analysis'
      : mobileTab === 'scenarios'
        ? 'scenarios'
        : mobileTab === 'quality'
          ? 'quality'
          : 'all'

  const bottomPadding =
    breakpoint === 'mobile'
      ? keyboardVisible
        ? 'pb-0'
        : 'pb-[56px]'
      : breakpoint === 'tablet'
        ? 'pb-12'
        : ''

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header
        onReset={handleReset}
        isLoading={isLoading || uploadProcessing}
        onFileUpload={handleFileUpload}
        layout={layout}
        tabletTab={tabletTab}
        onTabletTabChange={setTabletTab}
        onGoToAnalysis={() => setMobileTab('analysis')}
        onUploadFile={handleMobileUpload}
      />

      <div className={`flex min-h-0 flex-1 flex-col pt-14 lg:flex-row ${bottomPadding}`}>
        {/* Context panel — left 35% on desktop */}
        {showInsights && (
          <InsightsPanel
            {...insightsProps}
            section={breakpoint === 'mobile' ? mobileSection : 'all'}
          />
        )}

        {/* Chat panel — right 65% on desktop */}
        {showChat && (
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-light-grey/30 lg:w-[65%]">
            {breakpoint === 'desktop' && (
              <div className="hidden shrink-0 border-b border-light-blue/30 bg-white/60 px-6 py-3 lg:block">
                <p className="text-sm text-body/50">
                  Conversational IT savings analysis for{' '}
                  <span className="font-semibold text-navy">Culligan International</span>
                  {' '}— data quality score:{' '}
                  <span className="font-semibold text-teal">{qualityReport.overallScore}%</span>
                  {' '}({qualityReport.qualityLevel})
                </p>
              </div>
            )}
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSend={sendUserMessage}
            />
          </main>
        )}
      </div>

      {breakpoint === 'tablet' && (
        <TabletSavingsBar
          totalSavingsLow={totalSavingsLow}
          totalSavingsHigh={totalSavingsHigh}
          onTap={scrollToSavings}
        />
      )}

      {breakpoint === 'mobile' && (
        <MobileBottomNav
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          hidden={keyboardVisible}
        />
      )}
    </div>
  )
}
