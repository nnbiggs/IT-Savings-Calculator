import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { statusIcon, statusColor, STATUS } from '../utils/dataQuality'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useBreakpoint'

function ProgressRing({ score, color, large = false }) {
  const radius = large ? 28 : 18
  const size = large ? 72 : 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const center = size / 2

  return (
    <div className={`relative shrink-0 ${large ? 'h-[72px] w-[72px]' : 'h-11 w-11'}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#F4F6F8" strokeWidth="4" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-bold text-navy ${
          large ? 'text-sm' : 'text-[9px]'
        }`}
      >
        {score}%
      </span>
    </div>
  )
}

function levelBadgeStyle(level) {
  switch (level) {
    case 'HIGH QUALITY':
      return 'bg-success/10 text-success border-success/30'
    case 'ACCEPTABLE':
      return 'bg-teal/10 text-teal border-teal/30'
    case 'POOR':
      return 'bg-amber/10 text-amber border-amber/30'
    default:
      return 'bg-danger/10 text-danger border-danger/30'
  }
}

function FieldCard({ field, isEditing, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const hasIssue = field.status !== STATUS.GREEN

  return (
    <button
      type="button"
      onClick={() => {
        if (hasIssue) onSelect(field.key)
        setExpanded((e) => !e)
      }}
      className={`w-full rounded-xl border p-4 text-left active:scale-[0.98] transition ${
        isEditing ? 'border-teal bg-light-blue/10' : 'border-light-blue/60 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy">{field.label}</p>
          <p className="mt-1 text-sm font-semibold text-navy">
            {field.displayValue}
            {field.isEstimated && (
              <span className="ml-1 text-xs font-normal text-amber">(est.)</span>
            )}
          </p>
        </div>
        <span className="text-xl">{statusIcon(field.status)}</span>
      </div>
      {expanded && field.issues[0] && (
        <p className="mt-3 border-t border-light-blue/30 pt-3 text-xs text-body/70">
          {field.issues[0]}
        </p>
      )}
    </button>
  )
}

export default function DataQualityPanel({
  qualityReport,
  recommendations,
  cleansingLoading,
  editingField,
  onSelectField,
  onAcceptRecommendation,
  onSaveFieldEdit,
  onCancelEdit,
  mobileCards = false,
}) {
  const hasIssues = qualityReport.issueCount > 0
  const [expanded, setExpanded] = useState(hasIssues || mobileCards)
  const [fixMode, setFixMode] = useState(false)
  const [editValue, setEditValue] = useState('')
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const useCards = mobileCards || isMobile

  const selectedRec = recommendations.find((r) => r.field === editingField)
  const selectedField = qualityReport.fields.find((f) => f.key === editingField)

  const handleFixClick = () => {
    setFixMode(true)
    setEditValue(selectedField?.value != null ? String(selectedField.value) : '')
  }

  const scoreColor = statusColor(
    qualityReport.overallScore >= 90
      ? STATUS.GREEN
      : qualityReport.overallScore >= 70
        ? STATUS.AMBER
        : STATUS.RED,
  )

  return (
    <div className="rounded-xl border border-light-blue/60 bg-white">
      <button
        type="button"
        onClick={() => !mobileCards && setExpanded((e) => !e)}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <ProgressRing
            score={qualityReport.overallScore}
            color={scoreColor}
            large={mobileCards}
          />
          <div>
            <h3 className="text-lg font-semibold text-navy sm:text-xl">
              Data Quality
            </h3>
            <span
              className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-xs font-bold sm:text-sm ${levelBadgeStyle(qualityReport.qualityLevel)}`}
            >
              {qualityReport.qualityLevel}
            </span>
          </div>
        </div>
        {!mobileCards && (
          <svg
            className={`h-4 w-4 shrink-0 text-body/40 transition ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {(expanded || mobileCards) && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-light-blue/40"
          >
            <div className="space-y-3 px-4 py-3">
              <p className="text-xs text-body/60 sm:text-sm">{qualityReport.qualityDescription}</p>

              {useCards ? (
                <div className="space-y-2">
                  {qualityReport.fields.map((field) => (
                    <FieldCard
                      key={field.key}
                      field={field}
                      isEditing={editingField === field.key}
                      onSelect={(key) => {
                        setFixMode(false)
                        onSelectField(key)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-light-blue/40">
                  <table className="w-full min-w-[320px] text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-light-blue/40 bg-light-grey/80 text-[10px] uppercase tracking-wider text-body/50 sm:text-xs">
                        <th className="px-2 py-2 font-semibold sm:px-3">Field</th>
                        <th className="px-2 py-2 font-semibold sm:px-3">Value</th>
                        <th className="px-2 py-2 font-semibold sm:px-3">Status</th>
                        <th className="px-2 py-2 font-semibold sm:px-3">Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityReport.fields.map((field) => (
                        <tr
                          key={field.key}
                          className={`cursor-pointer border-b border-light-blue/20 last:border-0 hover:bg-light-blue/10 ${
                            editingField === field.key ? 'bg-light-blue/20' : ''
                          }`}
                          onClick={() => {
                            if (field.status !== STATUS.GREEN) {
                              setFixMode(false)
                              onSelectField(field.key)
                            }
                          }}
                        >
                          <td className="px-2 py-2 font-medium text-body/70 sm:px-3">{field.label}</td>
                          <td className="px-2 py-2 font-semibold text-navy sm:px-3">
                            {field.displayValue}
                            {field.isEstimated && (
                              <span className="ml-1 text-[9px] font-normal text-amber">(est.)</span>
                            )}
                          </td>
                          <td className="px-2 py-2 sm:px-3">{statusIcon(field.status)}</td>
                          <td
                            className="max-w-[120px] truncate px-2 py-2 text-body/50 sm:px-3"
                            title={field.issues[0]}
                          >
                            {field.issues[0] ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {hasIssues && (
                <p className="text-xs text-body/50 sm:text-sm">
                  {qualityReport.issueCount} field{qualityReport.issueCount !== 1 ? 's have' : ' has'}{' '}
                  quality issues that may affect savings estimates.
                  {useCards ? ' Tap any flagged field for recommendations.' : ' Click any flagged field to see the AI recommendation.'}
                </p>
              )}

              {cleansingLoading && (
                <p className="text-xs text-teal sm:text-sm">Analysing data quality issues...</p>
              )}

              <AnimatePresence>
                {editingField && fixMode && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-light-blue/60 bg-light-grey/50 p-3"
                  >
                    <p className="mb-2 text-sm font-semibold text-navy">
                      Edit {selectedField?.label ?? editingField}
                    </p>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-light-blue px-3 py-2 text-sm"
                      placeholder="Enter corrected value"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSaveFieldEdit(editingField, editValue)
                          setFixMode(false)
                          setEditValue('')
                        }}
                        className="min-h-[44px] rounded-lg bg-navy px-4 text-xs font-semibold text-white active:scale-95 sm:text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFixMode(false)
                          setEditValue('')
                          onCancelEdit()
                        }}
                        className="min-h-[44px] rounded-lg border px-4 text-xs font-semibold text-body/60 active:scale-95 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {editingField && !fixMode && selectedRec && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-amber/30 bg-amber/5 p-3"
                  >
                    <p className="text-sm font-semibold text-navy">{selectedField?.label}</p>
                    <p className="mt-2 text-xs leading-relaxed text-body/80 sm:text-sm">
                      <span className="font-semibold">Issue: </span>
                      {selectedRec.issue}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-body/70 sm:text-sm">
                      <span className="font-semibold">Likely cause: </span>
                      {selectedRec.likelyCause}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-body/70 sm:text-sm">
                      <span className="font-semibold">Recommended: </span>
                      {selectedRec.recommendedValue}
                      <span className="ml-1 text-amber">
                        ({selectedRec.confidenceInRecommendation} confidence)
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptRecommendation(editingField, selectedRec)
                          setFixMode(false)
                        }}
                        className="min-h-[44px] rounded-lg bg-teal px-4 text-xs font-semibold text-white hover:bg-teal/90 active:scale-95 sm:text-sm"
                      >
                        Accept AI recommendation
                      </button>
                      <button
                        type="button"
                        onClick={handleFixClick}
                        className="min-h-[44px] rounded-lg border border-navy/20 px-4 text-xs font-semibold text-navy hover:bg-light-grey active:scale-95 sm:text-sm"
                      >
                        Fix this
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
