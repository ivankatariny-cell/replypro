'use client'

import { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { X, CheckCircle2, XCircle, Info, MessageSquare } from 'lucide-react'

const MAX_TOASTS = 3

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'default'
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />,
  error: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
  info: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
  default: <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />,
}

const STYLES = {
  success: 'bg-background border border-green-200 dark:border-green-800 text-foreground',
  error: 'bg-background border border-red-200 dark:border-red-800 text-foreground',
  info: 'bg-background border border-blue-200 dark:border-blue-800 text-foreground',
  default: 'bg-background border border-border text-foreground',
}

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-in on mount
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
        'transition-all duration-300 ease-out',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        STYLES[t.type]
      )}
      role="alert"
    >
      {ICONS[t.type]}
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="cursor-pointer ml-1 rounded hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)

    setToasts((prev) => {
      const next = [...prev, { id, message, type }]
      // If over limit, remove oldest
      if (next.length > MAX_TOASTS) {
        const removed = next.shift()!
        const oldTimer = timers.current.get(removed.id)
        if (oldTimer) {
          clearTimeout(oldTimer)
          timers.current.delete(removed.id)
        }
      }
      return next
    })

    const timer = setTimeout(() => dismiss(id), 3000)
    timers.current.set(id, timer)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
