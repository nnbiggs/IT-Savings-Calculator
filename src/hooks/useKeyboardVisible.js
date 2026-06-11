import { useEffect, useState } from 'react'

export function useKeyboardVisible() {
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return undefined

    const threshold = 150
    const initialHeight = vv.height

    const handleResize = () => {
      setKeyboardVisible(initialHeight - vv.height > threshold)
    }

    vv.addEventListener('resize', handleResize)
    return () => vv.removeEventListener('resize', handleResize)
  }, [])

  return keyboardVisible
}
