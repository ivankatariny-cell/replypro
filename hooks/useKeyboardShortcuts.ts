'use client'

import { useEffect } from 'react'

export interface ShortcutDefinition {
  key: string
  meta?: boolean
  ctrl?: boolean
  handler: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focus is inside an input, textarea, or contenteditable
      const active = document.activeElement
      if (!active) return
      const tag = (active as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((active as HTMLElement).isContentEditable) return

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta ? e.metaKey : true
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true
        const modifierRequired = shortcut.meta || shortcut.ctrl
        const modifierPressed = e.metaKey || e.ctrlKey

        if (!modifierRequired) {
          if (e.key === shortcut.key && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            shortcut.handler()
            return
          }
        } else {
          if (e.key === shortcut.key && modifierPressed && metaMatch && ctrlMatch) {
            e.preventDefault()
            shortcut.handler()
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
