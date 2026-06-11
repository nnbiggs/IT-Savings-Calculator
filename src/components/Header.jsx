import FileUploadButton from './FileUploadButton'

export default function Header({ onReset, isLoading, onFileUpload }) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-light-blue bg-navy px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/20">
          <svg
            className="h-6 w-6 text-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Culligan IT Savings Agent
          </h1>
          <p className="text-xs font-medium text-light-blue/80">
            PwC IT Strategy · Working Session
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FileUploadButton onUploadComplete={onFileUpload} disabled={isLoading} />
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          New Session
        </button>
      </div>
    </header>
  )
}
