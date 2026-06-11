import { motion } from 'framer-motion'
import SessionProgress from './SessionProgress'
import OpportunityCard from './OpportunityCard'
import ScenarioPanel from './ScenarioPanel'
import DataQualityPanel from './DataQualityPanel'
import { formatSavingRange } from '../lib/parseInsights'

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
}) {
  return (
    <aside className="flex w-full flex-col border-l border-light-blue/50 bg-white lg:w-[400px] xl:w-[480px]">
      <div className="border-b border-light-blue/50 px-5 py-4">
        <h2 className="text-sm font-semibold text-navy">Context Panel</h2>
        <p className="text-[11px] text-body/50">
          Data quality, scenarios, and live insights
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <DataQualityPanel
          qualityReport={qualityReport}
          recommendations={cleansingRecommendations}
          cleansingLoading={cleansingLoading}
          editingField={editingField}
          onSelectField={onSelectField}
          onAcceptRecommendation={onAcceptRecommendation}
          onSaveFieldEdit={onSaveFieldEdit}
          onCancelEdit={onCancelEdit}
        />

        <ScenarioPanel
          compareIds={compareScenarioIds}
          highlightedId={highlightedScenarioId}
          onToggleCompare={onToggleCompareScenario}
        />

        <div className="border-t border-light-blue/40 pt-5">
          <SessionProgress currentPhase={currentPhase} />
        </div>

        {(totalSavingsLow > 0 || totalSavingsHigh > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-navy p-4 text-white"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-light-blue/70">
              Identified Savings Range
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatSavingRange(totalSavingsLow, totalSavingsHigh)}
            </p>
            {qualityReport.overallScore < 90 && (
              <p className="mt-1 text-[10px] text-amber/90">
                Caveat: {qualityReport.qualityLevel} data ({qualityReport.overallScore}%)
              </p>
            )}
            <p className="mt-1 text-[11px] text-light-blue/60">
              {opportunities.length} opportunit{opportunities.length === 1 ? 'y' : 'ies'} identified
            </p>
          </motion.div>
        )}

        {facts.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-body/50">
              Key Facts
            </h3>
            <div className="space-y-2">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-center justify-between rounded-lg bg-light-grey px-3 py-2"
                >
                  <span className="text-xs font-medium text-body/60">{fact.label}</span>
                  <span className="text-xs font-semibold text-navy">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-body/50">
            Savings Opportunities
          </h3>
          {opportunities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-light-blue bg-light-grey/50 px-4 py-6 text-center">
              <p className="text-xs font-medium text-body/50">
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
      </div>
    </aside>
  )
}
