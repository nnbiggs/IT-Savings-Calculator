const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
  { id: 'quality', label: 'Quality', icon: '✅' },
]

export default function MobileBottomNav({ activeTab, onTabChange, hidden }) {
  if (hidden) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-light-blue/50 bg-white safe-bottom"
      aria-label="Main navigation"
    >
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 active:scale-95 transition ${
                isActive ? 'text-teal' : 'text-body/50'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg leading-none" aria-hidden>
                {tab.icon}
              </span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
