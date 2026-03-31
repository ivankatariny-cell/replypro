'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
  onClick: () => void
  loading: boolean
  disabled: boolean
}

export function GenerateButton({ onClick, loading, disabled }: Props) {
  const { t } = useTranslation()

  return (
    <motion.div
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        size="lg"
        className="w-full cursor-pointer text-sm font-semibold relative overflow-hidden group"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('dashboard.generating')}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center"
            >
              <motion.span
                animate={!disabled ? { rotate: [0, 15, -10, 0] } : {}}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
                className="mr-2"
              >
                <Sparkles className="h-4 w-4" />
              </motion.span>
              {t('dashboard.generate_btn')}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Shimmer sweep */}
        {!disabled && !loading && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
        {/* Pulse ring when active */}
        {!disabled && !loading && (
          <motion.span
            className="absolute inset-0 rounded-lg border-2 border-primary-foreground/20"
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
      </Button>
    </motion.div>
  )
}
