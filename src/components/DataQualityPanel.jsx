import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { statusIcon, statusColor, STATUS } from '../utils/dataQuality'

function ProgressRing({ score, color }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#F4F6F8" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-navy">
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

export default function DataQualityPanel({
  qualityReport,
  recommendations,
  cleansingLoading,
  editingField,
  onSelectField,
  onAcceptRecommendation,
  onSaveFieldEdit,
  onCancelEdit,
}) {
  const hasIssues = qualityReport.issueCount > 0
  const [expanded, setExpanded] = useState(hasIssues)
  const [fixMode, setFixMode] = useState(false)
  const [editValue, setEditValue] = useState('')

  const selectedRec = recommendations.find((r) => r.field === editingField)
  const selectedField = qualityReport.fields.find((f) => f.key === editingField)

  const handleFixClick = () => {
    setFixMode(true)
    setEditValue(selectedField?.value != null ? String(selectedField.value) : '')
  }

  return (
    <div className="rounded-xl border border-light-blue/60 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <ProgressRing
            score={qualityReport.overallScore}
            color={statusColor(
              qualityReport.overallScore >= 90
                ? STATUS.GREEN
                : qualityReport.overallScore >= 70
                  ? STATUS.AMBER
                  : STATUS.RED,
            )}
          />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-body/50">
              Data Quality
            </h3>
            <span
              className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${levelBadgeStyle(qualityReport.qualityLevel)}`}
            >
              {qualityReport.qualityLevel}
            </span>
          </div>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-body/40 transition ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-light-blue/40"
          >
            <div className="space-y-3 px-4 py-3">
              <p className="text-[11px] text-body/60">{qualityReport.qualityDescription}</p>

              <div className="overflow-x-auto rounded-lg border border-light-blue/40">
                <table className="w-full min-w-[320px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-light-blue/40 bg-light-grey/80 text-[10px] uppercase tracking-wider text-body/50">
                      <th className="px-2 py-2 font-semibold">Field</th>
                      <th className="px-2 py-2 font-semibold">Value</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                      <th className="px-2 py-2 font-semibold">Issue</th>
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
                        <td className="px-2 py-2 font-medium text-body/70">{field.label}</td>
                        <td className="px-2 py-2 font-semibold text-navy">
                          {field.displayValue}
                          {field.isEstimated && (
                            <span className="ml-1 text-[9px] font-normal text-amber">(est.)</span>
                          )}
                        </td>
                        <td className="px-2 py-2">{statusIcon(field.status)}</td>
                        <td className="max-w-[120px] truncate px-2 py-2 text-body/50" title={field.issues[0]}>
                          {field.issues[0] ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasIssues && (
                <p className="text-[11px] text-body/50">
                  {qualityReport.issueCount} field{qualityReport.issueCount !== 1 ? 's have' : ' has'} quality
                  issues that may affect savings estimates. Click any flagged field to see the AI recommendation.
                </p>
              )}

              {cleansingLoading && (
                <p className="text-[11px] text-teal">Analysing data quality issues...</p>
              )}

              <AnimatePresence>
                {editingField && fixMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-light-blue/60 bg-light-grey/50 p-3"
                  >
                    <p className="mb-2 text-xs font-semibold text-navy">
                      Edit {selectedField?.label ?? editingField}
                    </p>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-lg border border-light-blue px-3 py-2 text-sm"
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
                        className="rounded-lg bg-navy px-3 py-1.5 text-[11px] font-semibold text-white"
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
                        className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold text-body/60"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {editingField && !fixMode && selectedRec && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-amber/30 bg-amber/5 p-3"
                  >
                    <p className="text-xs font-semibold text-navy">{selectedField?.label}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-body/80">
                      <span className="font-semibold">Issue: </span>
                      {selectedRec.issue}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-body/70">
                      <span className="font-semibold">Likely cause: </span>
                      {selectedRec.likelyCause}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-body/70">
                      <span className="font-semibold">Recommended: </span>
                      {selectedRec.recommendedValue}
                      <span className="ml-1 text-amber">
                        ({selectedRec.confidenceInRecommendation} confidence)
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-body/70">
                      <span className="font-semibold">Verify: </span>
                      {selectedRec.verificationMethod}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-body/70">
                      <span className="font-semibold">
                        Impact if unresolved ({selectedRec.impactIfUnresolved}):{' '}
                      </span>
                      {selectedRec.impactExplanation}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptRecommendation(editingField, selectedRec)
                          setFixMode(false)
                        }}
                        className="rounded-lg bg-teal px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal/90"
                      >
                        Accept AI recommendation
                      </button>
                      <button
                        type="button"
                        onClick={handleFixClick}
                        className="rounded-lg border border-navy/20 px-3 py-1.5 text-[11px] font-semibold text-navy hover:bg-light-grey"
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
