import { useEffect, useState } from 'react'

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() => getBreakpoint())

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 639px)')
    const mqTablet = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')

    const update = () => setBreakpoint(getBreakpoint())

    mqMobile.addEventListener('change', update)
    mqTablet.addEventListener('change', update)
    window.addEventListener('resize', update)

    return () => {
      mqMobile.removeEventListener('change', update)
      mqTablet.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return breakpoint
}

function getBreakpoint() {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function useIsMobile() {
  return useBreakpoint() === 'mobile'
}

export function useIsTablet() {
  return useBreakpoint() === 'tablet'
}

export function useIsDesktop() {
  return useBreakpoint() === 'desktop'
}
