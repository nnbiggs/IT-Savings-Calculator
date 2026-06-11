import { useState } from 'react'
import FileUploadButton from './FileUploadButton'
import MobileDrawer from './MobileDrawer'

function CulliganLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className={`flex items-center justify-center rounded-lg bg-teal/20 ${
          compact ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10'
        }`}
      >
        <svg
          className={`text-teal ${compact ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      </div>
      <div>
        <p className={`font-bold tracking-tight text-white ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
          Culligan
        </p>
        {!compact && (
          <p className="hidden text-[10px] font-medium text-light-blue/80 sm:block">
            PwC IT Strategy
          </p>
        )}
      </div>
    </div>
  )
}

export default function Header({
  onReset,
  isLoading,
  onFileUpload,
  layout = 'desktop',
  tabletTab,
  onTabletTabChange,
  onMenuOpen,
  onGoToAnalysis,
  onUploadFile,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleMenuToggle = () => {
    setDrawerOpen((o) => !o)
    onMenuOpen?.()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-light-blue bg-navy px-4 sm:px-6">
        {/* Logo — all breakpoints */}
        <CulliganLogo compact={layout === 'mobile'} />

        {/* Desktop: centered title */}
        {layout === 'desktop' && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold tracking-tight text-white lg:text-lg">
            IT Savings Agent
          </h1>
        )}

        {/* Tablet: center tabs */}
        {layout === 'tablet' && (
          <div className="absolute left-1/2 flex -translate-x-1/2 gap-1 rounded-lg bg-white/10 p-1">
            {['chat', 'analysis'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabletTabChange(tab)}
                className={`min-h-[36px] rounded-md px-4 text-xs font-semibold capitalize transition active:scale-95 ${
                  tabletTab === tab
                    ? 'bg-white text-navy'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Desktop: right actions */}
        {layout === 'desktop' && (
          <div className="flex items-center gap-2">
            <FileUploadButton onUploadComplete={onFileUpload} disabled={isLoading} label="Export" />
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="min-h-[36px] rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        )}

        {/* Tablet: export icon only */}
        {layout === 'tablet' && (
          <FileUploadButton
            onUploadComplete={onFileUpload}
            disabled={isLoading}
            iconOnly
          />
        )}

        {/* Mobile: hamburger */}
        {layout === 'mobile' && (
          <button
            type="button"
            onClick={handleMenuToggle}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white active:scale-95 transition hover:bg-white/10"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {drawerOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
      </header>

      {layout === 'mobile' && (
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onReset={onReset}
          onGoToAnalysis={onGoToAnalysis}
          onFileUpload={onUploadFile}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
