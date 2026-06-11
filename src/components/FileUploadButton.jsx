import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractDataFromUpload } from '../utils/dataQuality'
import { parseUploadedValue } from '../data/knowledgeData'

function parseFileContent(text, filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'json') {
    return JSON.parse(text)
  }
  if (ext === 'csv') {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim())
    const values = lines[1]?.split(',').map((v) => v.trim()) ?? []
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = values[i]
    })
    return obj
  }
  throw new Error('Unsupported format — use JSON or CSV')
}

export default function FileUploadButton({ onUploadComplete, disabled }) {
  const inputRef = useRef(null)
  const [step, setStep] = useState(null)

  const handleFile = async (file) => {
    setStep('reading')
    await new Promise((r) => setTimeout(r, 800))

    try {
      const text = await file.text()
      const parsed = parseFileContent(text, file.name)
      const extracted = extractDataFromUpload(parsed)

      setStep('quality')
      await new Promise((r) => setTimeout(r, 600))

      const normalized = {}
      Object.entries(extracted).forEach(([key, raw]) => {
        normalized[key] = parseUploadedValue(key, raw)
      })

      setStep('populating')
      await new Promise((r) => setTimeout(r, 400))

      onUploadComplete(normalized, file.name)
      setStep(null)
    } catch (err) {
      setStep(null)
      onUploadComplete(null, file.name, err.message)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={disabled || !!step}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-white/20 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
      >
        Upload data
      </button>

      <AnimatePresence>
        {step && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
          >
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-navy">Processing upload</h3>
              <div className="mt-4 space-y-3">
                {[
                  { id: 'reading', label: 'Reading your files...' },
                  { id: 'quality', label: 'Checking data quality...' },
                  { id: 'populating', label: 'Updating knowledge state...' },
                ].map((s, i) => {
                  const steps = ['reading', 'quality', 'populating']
                  const currentIdx = steps.indexOf(step)
                  const thisIdx = steps.indexOf(s.id)
                  const done = thisIdx < currentIdx
                  const active = s.id === step

                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          done
                            ? 'bg-success text-white'
                            : active
                              ? 'bg-teal text-white'
                              : 'bg-light-grey text-body/40'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`text-sm ${active ? 'font-semibold text-navy' : 'text-body/50'}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
