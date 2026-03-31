'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'motion/react'
import { MessageSquare, Sparkles, Users, Building2, Star, Shield } from 'lucide-react'

const features = [
  { icon: Sparkles, keyHr: '3 tona AI odgovora', keyEn: '3 AI reply tones' },
  { icon: Users, keyHr: 'Knjiga klijenata', keyEn: 'Client book' },
  { icon: Building2, keyHr: 'Katalog nekretnina', keyEn: 'Property catalog' },
  { icon: Star, keyHr: 'Spremljeni favoriti', keyEn: 'Saved favorites' },
  { icon: Shield, keyHr: 'Sigurno i enkriptirano', keyEn: 'Secure and encrypted' },
]

function AuthIllustration() {
  return (
    <div className="relative mt-10 mx-auto w-full max-w-xs">
      {/* SVG abstract illustration */}
      <svg viewBox="0 0 280 200" fill="none" className="w-full opacity-80" aria-hidden="true">
        {/* Background circles */}
        <motion.circle
          cx="140" cy="100" r="80"
          stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 6"
          strokeOpacity="0.2"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 100px' }}
        />
        <motion.circle
          cx="140" cy="100" r="55"
          stroke="hsl(var(--primary))" strokeWidth="1"
          strokeOpacity="0.15"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 100px' }}
        />

        {/* Center icon */}
        <motion.rect
          x="118" y="78" width="44" height="44" rx="12"
          fill="hsl(var(--primary))" fillOpacity="0.15"
          stroke="hsl(var(--primary))" strokeWidth="1.5" strokeOpacity="0.4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transformOrigin: '140px 100px' }}
        />
        <motion.path
          d="M130 96h20M130 102h14M130 108h17"
          stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Orbiting dots */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = 140 + 80 * Math.cos(rad)
          const y = 100 + 80 * Math.sin(rad)
          return (
            <motion.circle
              key={i}
              cx={x} cy={y} r="5"
              fill="hsl(var(--primary))"
              fillOpacity="0.6"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          )
        })}

        {/* Floating chat bubbles */}
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="10" y="30" width="70" height="28" rx="8" fill="hsl(var(--primary))" fillOpacity="0.1" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="16" y="38" width="40" height="3" rx="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
          <rect x="16" y="45" width="28" height="3" rx="1.5" fill="hsl(var(--primary))" fillOpacity="0.3" />
        </motion.g>
        <motion.g
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <rect x="200" y="140" width="70" height="28" rx="8" fill="hsl(var(--primary))" fillOpacity="0.1" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="206" y="148" width="40" height="3" rx="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
          <rect x="206" y="155" width="28" height="3" rx="1.5" fill="hsl(var(--primary))" fillOpacity="0.3" />
        </motion.g>
      </svg>

      {/* Floating stat badges */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute top-0 right-0 rounded-xl border bg-card/90 backdrop-blur-sm shadow-lg px-3 py-2 text-center"
      >
        <p className="text-lg font-bold gradient-text">10×</p>
        <p className="text-[10px] text-muted-foreground">brže</p>
      </motion.div>
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        className="absolute bottom-0 left-0 rounded-xl border bg-card/90 backdrop-blur-sm shadow-lg px-3 py-2 text-center"
      >
        <p className="text-lg font-bold gradient-text">500+</p>
        <p className="text-[10px] text-muted-foreground">agenata</p>
      </motion.div>
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { language } = useTranslation()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between bg-card border-r p-10 xl:p-14 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/6 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, delay: 3 }}
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-10"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <MessageSquare className="h-5 w-5" />
            </motion.div>
            <span className="text-xl font-bold font-heading">ReplyPro</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl xl:text-4xl font-heading font-bold leading-tight mb-4 text-balance"
          >
            {language === 'hr' ? 'Odgovarajte klijentima 10× brže' : 'Reply to clients 10× faster'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-muted-foreground text-base leading-relaxed mb-8"
          >
            {language === 'hr'
              ? 'AI asistent za agente za nekretnine. Zalijepite poruku, dobijte 3 savršena odgovora.'
              : 'AI assistant for real estate agents. Paste a message, get 3 perfect replies.'}
          </motion.p>

          <div className="space-y-2.5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 cursor-default"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </motion.div>
                  <span className="text-sm font-medium">{language === 'hr' ? f.keyHr : f.keyEn}</span>
                </motion.div>
              )
            })}
          </div>

          <AuthIllustration />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative text-xs text-muted-foreground"
        >
          © 2026 ReplyPro
        </motion.p>
      </div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center justify-center px-4 py-10"
      >
        {children}
      </motion.div>
    </div>
  )
}
