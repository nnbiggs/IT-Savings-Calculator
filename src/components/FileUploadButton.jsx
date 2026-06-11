import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { processUploadedFile } from '../utils/fileUpload'

const FileUploadButton = forwardRef(function FileUploadButton(
  { onUploadComplete, disabled, iconOnly = false, label = 'Upload data', className = '' },
  ref,
) {
  const inputRef = useRef(null)
  const [step, setStep] = useState(null)

  useImperativeHandle(ref, () => ({
    open: () => inputRef.current?.click(),
  }))

  const handleFile = async (file) => {
    setStep('reading')
    await new Promise((r) => setTimeout(r, 800))

    try {
      setStep('quality')
      await new Promise((r) => setTimeout(r, 600))

      setStep('populating')
      await new Promise((r) => setTimeout(r, 400))

      await processUploadedFile(file, onUploadComplete)
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
        className={`flex items-center justify-center rounded-lg border border-white/20 font-semibold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50 ${
          iconOnly
            ? 'min-h-[44px] min-w-[44px] p-2'
            : 'min-h-[36px] px-3 py-2 text-[11px] sm:px-4 sm:text-xs'
        } ${className}`}
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
      >
        {iconOnly ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        ) : (
          label
        )}
      </button>

      <AnimatePresence>
        {step && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/40 backdrop-blur-sm"
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
})

export default FileUploadButton
