import SessionProgress from './SessionProgress'
import OpportunityCard from './OpportunityCard'
import ScenarioPanel from './ScenarioPanel'
import DataQualityPanel from './DataQualityPanel'
import SavingsTracker from './SavingsTracker'
import { useIsMobile } from '../hooks/useBreakpoint'

const EXPLORATION_QUESTIONS = [
  'What is our biggest software spend risk?',
  'How much could SAM save us annually?',
  'What does full BU coverage change?',
  'Which phase delivers fastest ROI?',
]

export default function InsightsPanel({
  opportunities,
  facts,
  currentPhase,
  totalSavingsLow,
  totalSavingsHigh,
  compareScenarioIds,
  highlightedScenarioId,
  onToggleCompareScenario,
  qualityReport,
  cleansingRecommendations,
  cleansingLoading,
  editingField,
  onSelectField,
  onAcceptRecommendation,
  onSaveFieldEdit,
  onCancelEdit,
  section = 'all',
  savingsTrackerRef,
  lazyScenarios = false,
}) {
  const isMobile = useIsMobile()

  const showQuality = section === 'all' || section === 'quality'
  const showScenarios = section === 'all' || section === 'scenarios'
  const showAnalysisContent = section === 'all' || section === 'analysis'
  const showProgress = section === 'all'
  const isMobileAnalysis = isMobile && section === 'analysis'

  const factsSection = facts.length > 0 && showAnalysisContent && (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-navy sm:text-xl">
        What We Know
      </h3>
      <div className={isMobileAnalysis ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
        {facts.map((fact) => (
          <div
            key={fact.label}
            className={`rounded-lg bg-light-grey px-3 py-2 ${
              isMobileAnalysis
                ? 'flex min-h-[44px] flex-col justify-center'
                : 'flex items-center justify-between'
            }`}
          >
            <span className="text-xs font-medium text-body/60 sm:text-sm">{fact.label}</span>
            <span className="text-xs font-semibold text-navy sm:text-sm">{fact.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const savingsSection = showAnalysisContent && (
    <div ref={savingsTrackerRef}>
      <SavingsTracker
        totalSavingsLow={totalSavingsLow}
        totalSavingsHigh={totalSavingsHigh}
        opportunities={opportunities}
        qualityReport={qualityReport}
      />
    </div>
  )

  const opportunitiesSection = showAnalysisContent && (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-navy sm:text-xl">
        {isMobileAnalysis ? 'Questions to Explore' : 'Savings Opportunities'}
      </h3>
      {isMobileAnalysis ? (
        <ul className="space-y-2">
          {EXPLORATION_QUESTIONS.map((q) => (
            <li
              key={q}
              className="rounded-lg border border-light-blue/40 bg-light-grey/50 px-3 py-3 text-sm text-body/70"
            >
              {q}
            </li>
          ))}
        </ul>
      ) : opportunities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-light-blue bg-light-grey/50 px-4 py-6 text-center">
          <p className="text-xs font-medium text-body/50 sm:text-sm">
            Opportunities appear as the consultant identifies them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <OpportunityCard key={opp.title} opportunity={opp} index={i} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <aside className="flex min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white lg:w-[35%] lg:border-r lg:border-light-blue/50">
      {section === 'all' && (
        <div className="hidden shrink-0 border-b border-light-blue/50 px-5 py-4 lg:block">
          <h2 className="text-xl font-semibold text-navy">Context Panel</h2>
          <p className="text-sm text-body/50">
            Data quality, scenarios, and live insights
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5">
        {/* Mobile analysis: savings first */}
        {isMobileAnalysis && savingsSection}

        {showQuality && (
          <DataQualityPanel
            qualityReport={qualityReport}
            recommendations={cleansingRecommendations}
            cleansingLoading={cleansingLoading}
            editingField={editingField}
            onSelectField={onSelectField}
            onAcceptRecommendation={onAcceptRecommendation}
            onSaveFieldEdit={onSaveFieldEdit}
            onCancelEdit={onCancelEdit}
            mobileCards={section === 'quality' || isMobileAnalysis}
          />
        )}

        {/* Desktop / tablet: facts before savings */}
        {!isMobileAnalysis && factsSection}
        {!isMobileAnalysis && savingsSection}

        {showScenarios && (
          <ScenarioPanel
            compareIds={compareScenarioIds}
            highlightedId={highlightedScenarioId}
            onToggleCompare={onToggleCompareScenario}
            lazy={lazyScenarios}
          />
        )}

        {showProgress && (
          <div className="border-t border-light-blue/40 pt-5">
            <SessionProgress currentPhase={currentPhase} />
          </div>
        )}

        {isMobileAnalysis && factsSection}
        {opportunitiesSection}
      </div>
    </aside>
  )
}
