'use client'

import { motion } from 'motion/react'
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
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        size="lg"
        className="w-full md:w-auto cursor-pointer text-base relative overflow-hidden group"
      >
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <motion.div
            animate={!disabled ? { rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
          </motion.div>
        )}
        {loading ? t('dashboard.generating') : t('dashboard.generate_btn')}
        {!disabled && !loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
      </Button>
    </motion.div>
  )
}
