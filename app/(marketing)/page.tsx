'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { Navbar } from '@/components/layout/Navbar'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare, ClipboardPaste, Sparkles, Send,
  Check, ArrowRight, Clock, AlertTriangle, Repeat,
  Users, Building2, History, ChevronDown, Star, Zap,
  Phone, MapPin, Euro, Copy, Heart,
} from 'lucide-react'

/* ─── Reusable animation wrappers ─── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >{children}</motion.div>
  )
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >{children}</motion.div>
  )
}

/* ─── Decorative SVG illustrations ─── */
function HeroIllustration({ t }: { t: (key: string) => string }) {
  const tones = [
    t('dashboard.tone_professional'),
    t('dashboard.tone_friendly'),
    t('dashboard.tone_direct'),
  ]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-12 max-w-2xl"
    >
      {/* Main chat mockup */}
      <div className="relative rounded-2xl border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/40">
          <div className="h-3 w-3 rounded-full bg-red-400/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <div className="h-3 w-3 rounded-full bg-green-400/70" />
          <div className="flex-1 mx-4 h-5 rounded-md bg-muted/60" />
        </div>
        <div className="p-5 space-y-3">
          {/* Incoming message */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="flex gap-2.5 max-w-[80%]"
          >
            <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/40 shrink-0 flex items-center justify-center text-xs font-bold text-blue-600">K</div>
            <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-xs leading-relaxed">
              {t('landing.hero_demo_message')}
            </div>
          </motion.div>
          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.3 }}
            className="flex gap-2.5 max-w-[80%] ml-auto flex-row-reverse"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 shrink-0 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tr-sm bg-primary/10 border border-primary/20 px-3.5 py-2.5 text-xs leading-relaxed text-primary">
              {t('landing.hero_generating')}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              > ▋</motion.span>
            </div>
          </motion.div>
          {/* Reply cards preview */}
          {tones.map((tone, i) => (
            <motion.div
              key={tone}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.15, duration: 0.4 }}
              className="rounded-xl border bg-card/80 px-3 py-2.5 text-xs"
            >
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mb-1.5 ${
                i === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                i === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>{tone}</span>
              <div className="h-2 rounded bg-muted w-full mb-1" />
              <div className="h-2 rounded bg-muted w-4/5" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-4 rounded-xl border bg-card shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <Zap className="h-4 w-4 text-warning" />
        <span className="text-xs font-semibold">{t('landing.hero_speed')}</span>
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-4 -left-4 rounded-xl border bg-card shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold">4.9 / 5.0</span>
      </motion.div>

      {/* Powered by badge */}
      <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/50 font-mono select-none">
        Powered by Llama 3.3
      </div>
    </motion.div>
  )
}

/* ─── Client Book illustration ─── */
function ClientBookIllustration({ t }: { t: (key: string) => string }) {
  const clients = [
    { initials: 'MK', name: 'Marko K.', interest: t('landing.illus_client_interest_1'), budget: '150–200k€', color: 'bg-blue-500' },
    { initials: 'AH', name: 'Ana H.', interest: t('landing.illus_client_interest_2'), budget: '80–120k€', color: 'bg-violet-500' },
    { initials: 'IP', name: 'Ivan P.', interest: t('landing.illus_client_interest_3'), budget: '250–350k€', color: 'bg-emerald-500' },
  ]
  return (
    <div className="relative rounded-2xl border bg-card shadow-xl shadow-primary/8 overflow-hidden max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">{t('nav.clients')}</span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">3 {t('landing.illus_active')}</span>
      </div>
      <div className="p-3 space-y-2">
        {clients.map((c, i) => (
          <motion.div
            key={c.initials}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.4 }}
            whileHover={{ x: 3 }}
            className="flex items-center gap-3 rounded-xl border bg-background/60 px-3 py-2.5 cursor-default"
          >
            <div className={`h-8 w-8 rounded-full ${c.color} shrink-0 flex items-center justify-center text-[10px] font-bold text-white`}>
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{c.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{c.interest}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-0.5 text-[10px] font-semibold text-primary">
                <Euro className="h-2.5 w-2.5" />{c.budget}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Floating new message badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-3 rounded-xl border bg-card shadow-lg px-2.5 py-1.5 flex items-center gap-1.5"
      >
        <Phone className="h-3 w-3 text-green-500" />
        <span className="text-[10px] font-semibold">{t('landing.illus_new_inquiry')}</span>
      </motion.div>
    </div>
  )
}

/* ─── Property Catalog illustration ─── */
function PropertyCatalogIllustration({ t }: { t: (key: string) => string }) {
  const props = [
    { icon: MapPin, label: t('landing.illus_prop_1'), rooms: '3', price: '185.000€', tag: t('landing.illus_prop_tag_sale') },
    { icon: MapPin, label: t('landing.illus_prop_2'), rooms: '2', price: '95.000€', tag: t('landing.illus_prop_tag_new') },
  ]
  return (
    <div className="relative rounded-2xl border bg-card shadow-xl shadow-primary/8 overflow-hidden max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">{t('nav.properties')}</span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">2 {t('landing.illus_active')}</span>
      </div>
      <div className="p-3 space-y-2">
        {props.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.15, duration: 0.4 }}
            whileHover={{ x: 3 }}
            className="flex items-center gap-3 rounded-xl border bg-background/60 px-3 py-2.5 cursor-default"
          >
            <div className="h-8 w-8 rounded-xl bg-primary/10 shrink-0 flex items-center justify-center">
              <p.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.rooms} {t('landing.illus_rooms')}</p>
            </div>
            <div className="text-right shrink-0 space-y-0.5">
              <p className="text-[10px] font-bold text-primary">{p.price}</p>
              <span className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">{p.tag}</span>
            </div>
          </motion.div>
        ))}
        {/* AI reply preview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">{t('landing.illus_ai_included')}</span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-primary/20 w-full" />
            <div className="h-1.5 rounded bg-primary/20 w-4/5" />
            <div className="h-1.5 rounded bg-primary/20 w-3/5" />
          </div>
        </motion.div>
      </div>
      {/* Copy badge */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-3 -right-3 rounded-xl border bg-card shadow-lg px-2.5 py-1.5 flex items-center gap-1.5"
      >
        <Copy className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold">{t('landing.illus_copied')}</span>
      </motion.div>
    </div>
  )
}

/* ─── Magnetic button wrapper ─── */
function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)'
  }
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Main page ─── */
export default function LandingPage() {
  const { t } = useTranslation()
  const [roiMessages, setRoiMessages] = useState(15)
  const [roiMinutes, setRoiMinutes] = useState(5)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const hoursSaved = Math.round((roiMessages * roiMinutes * 22) / 60 * 10) / 10
  const hoursWithReply = Math.round((roiMessages * 0.5 * 22) / 60 * 10) / 10

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-info/6 blur-3xl pointer-events-none"
        />
        {/* Floating dots decoration */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full max-w-4xl mx-auto text-center">
          <FadeUp>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="inline-block"
            >
              <Badge variant="secondary" className="mb-6 text-xs px-3 py-1 gap-1.5">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block"
                >
                  <Sparkles className="h-3 w-3" />
                </motion.span>
                {t('landing.badge')}
              </Badge>
            </motion.div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-5 text-balance">
              <span className="gradient-text">{t('landing.headline').split(' ').slice(0, 2).join(' ')}</span>
              {' '}{t('landing.headline').split(' ').slice(2).join(' ')}
            </h1>
          </FadeUp>

          <FadeUp delay={0.18}>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('landing.subheadline')}
            </p>
          </FadeUp>

          <FadeUp delay={0.26}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <MagneticButton>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="cursor-pointer text-sm font-semibold px-7 glow-primary-sm relative overflow-hidden group">
                      {t('landing.cta_primary')}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </motion.div>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a href="#how-it-works">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" variant="outline" className="cursor-pointer text-sm">
                      {t('landing.cta_secondary')}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </a>
              </MagneticButton>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
              <Check className="h-3 w-3 text-primary" />
              {t('landing.no_card')}
            </p>
          </FadeUp>

          <HeroIllustration t={t} />
        </motion.div>
      </section>

      {/* ── Social proof strip ── */}
      <FadeIn>
        <div className="border-y bg-muted/30 py-4 px-4 overflow-hidden">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { value: '10', label: t('landing.strip_free_gen') },
              { value: '0', label: t('landing.strip_no_card') },
              { value: 'HR + EN', label: t('landing.strip_languages') },
              { value: '10×', label: t('landing.strip_faster') },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-xl font-bold gradient-text tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Pain ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp><h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-12">{t('landing.pain_title')}</h2></FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Clock, text: t('landing.pain_1') },
              { icon: Repeat, text: t('landing.pain_2') },
              { icon: AlertTriangle, text: t('landing.pain_3') },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 12px 32px hsl(var(--destructive)/0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="rounded-xl border bg-card p-6 text-center cursor-default shimmer-hover"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10"
                  >
                    <item.icon className="h-5 w-5 text-destructive" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center mt-8 text-primary font-semibold text-sm"
            >
              {t('landing.pain_solution')}
            </motion.p>
          </FadeUp>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30 relative overflow-hidden">
        {/* Decorative line */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" viewBox="0 0 800 400" fill="none">
            <path d="M0 200 Q200 100 400 200 T800 200" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="8 4" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto relative">
          <FadeUp><h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-14">{t('landing.how_it_works')}</h2></FadeUp>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            {[
              { icon: ClipboardPaste, title: t('landing.step1_title'), desc: t('landing.step1_desc') },
              { icon: Sparkles, title: t('landing.step2_title'), desc: t('landing.step2_desc') },
              { icon: Send, title: t('landing.step3_title'), desc: t('landing.step3_desc') },
            ].map((step, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 + i * 0.15 }}
                    className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/30"
                  >
                    {i + 1}
                  </motion.div>
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    className="mx-auto my-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
                  >
                    <step.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp><h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('landing.example_title')}</h2></FadeUp>
          <FadeUp delay={0.08}>
            <div className="rounded-xl border bg-muted/50 px-5 py-4 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('history.original')}</p>
              <p className="text-sm italic text-foreground/80">&ldquo;{t('landing.example_message')}&rdquo;</p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { variant: 'professional' as const, tone: t('dashboard.tone_professional'), text: t('landing.example_pro') },
              { variant: 'friendly' as const, tone: t('dashboard.tone_friendly'), text: t('landing.example_friendly') },
              { variant: 'direct' as const, tone: t('dashboard.tone_direct'), text: t('landing.example_direct') },
            ].map((card, i) => (
              <FadeUp key={i} delay={0.16 + i * 0.12}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 16px 40px hsl(var(--primary)/0.08)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="rounded-xl border bg-card p-5 h-full shimmer-hover"
                >
                  <Badge variant={card.variant} className="mb-3">{card.tone}</Badge>
                  <p className="text-sm leading-relaxed text-foreground/90">{card.text}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <FadeUp><h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('landing.features_title')}</h2></FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: MessageSquare, title: t('landing.feat_tones'), desc: t('landing.feat_tones_desc') },
              { icon: Sparkles, title: t('landing.feat_lang'), desc: t('landing.feat_lang_desc') },
              { icon: ClipboardPaste, title: t('landing.feat_templates'), desc: t('landing.feat_templates_desc') },
              { icon: Users, title: t('landing.feat_clients'), desc: t('landing.feat_clients_desc') },
              { icon: Building2, title: t('landing.feat_properties'), desc: t('landing.feat_properties_desc') },
              { icon: History, title: t('landing.feat_history'), desc: t('landing.feat_history_desc') },
            ].map((feat, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -3, borderColor: 'hsl(var(--primary)/0.4)' }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="rounded-xl border bg-card p-5 h-full cursor-default shimmer-hover"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3"
                  >
                    <feat.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="font-semibold text-sm mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>

          {/* ── Feature illustrations ── */}
          <div className="mt-16 grid md:grid-cols-2 gap-10 items-center">
            <FadeUp delay={0.05}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">{t('landing.feat_clients')}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.illus_clients_desc')}</p>
                <ul className="space-y-1.5 text-sm">
                  {[t('landing.illus_clients_point_1'), t('landing.illus_clients_point_2'), t('landing.illus_clients_point_3')].map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />{pt}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <ClientBookIllustration t={t} />
            </FadeUp>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-10 items-center">
            <FadeUp delay={0.15} className="order-2 md:order-1">
              <PropertyCatalogIllustration t={t} />
            </FadeUp>
            <FadeUp delay={0.05} className="order-1 md:order-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">{t('landing.feat_properties')}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('landing.illus_props_desc')}</p>
                <ul className="space-y-1.5 text-sm">
                  {[t('landing.illus_props_point_1'), t('landing.illus_props_point_2'), t('landing.illus_props_point_3')].map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />{pt}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto">
          <FadeUp>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">{t('landing.roi_title')}</h2>
            <p className="text-center text-sm text-muted-foreground mb-8">{t('landing.roi_subtitle')}</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <motion.div
              whileHover={{ boxShadow: '0 20px 60px hsl(var(--primary)/0.08)' }}
              className="rounded-2xl border bg-card p-6 space-y-5"
            >
              {[
                { label: t('landing.roi_messages'), value: roiMessages, min: 5, max: 50, onChange: setRoiMessages },
                { label: t('landing.roi_minutes'), value: roiMinutes, min: 2, max: 10, onChange: setRoiMinutes, suffix: ' min' },
              ].map((slider) => (
                <div key={slider.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{slider.label}</span>
                    <motion.span
                      key={slider.value}
                      initial={{ scale: 1.3, color: 'hsl(var(--primary))' }}
                      animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                      className="font-bold tabular-nums"
                    >
                      {slider.value}{slider.suffix || ''}
                    </motion.span>
                  </div>
                  <input
                    type="range" min={slider.min} max={slider.max} value={slider.value}
                    onChange={(e) => slider.onChange(+e.target.value)}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  key={hoursSaved}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 text-center"
                >
                  <p className="text-xs text-muted-foreground mb-1">{t('landing.roi_without')}</p>
                  <p className="text-2xl font-bold text-destructive tabular-nums">{hoursSaved}h</p>
                  <p className="text-xs text-muted-foreground">/ {t('landing.roi_month')}</p>
                </motion.div>
                <motion.div
                  key={hoursWithReply}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center"
                >
                  <p className="text-xs text-muted-foreground mb-1">{t('landing.roi_with')}</p>
                  <p className="text-2xl font-bold text-primary tabular-nums">{hoursWithReply}h</p>
                  <p className="text-xs text-primary font-medium">-{Math.round(hoursSaved - hoursWithReply)}h / {t('landing.roi_month')}</p>
                </motion.div>
              </div>
              <Link href="/signup" className="block">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full cursor-pointer">{t('landing.roi_cta')}</Button>
                </motion.div>
              </Link>
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <FadeUp><h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('landing.pricing_title')}</h2></FadeUp>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <FadeUp delay={0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="rounded-xl border bg-card p-6 h-full flex flex-col"
              >
                <h3 className="text-lg font-semibold mb-1">{t('landing.pricing_free')}</h3>
                <p className="text-3xl font-bold mb-1">€0</p>
                <p className="text-sm text-muted-foreground mb-5">{t('landing.pricing_free_desc')}</p>
                <ul className="space-y-2.5 text-sm mb-6 flex-1">
                  {[t('landing.pricing_feature_1'), t('landing.pricing_feature_2'), '10 ' + t('landing.pricing_feature_gen')].map((f, i) => (
                    <motion.li key={f} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0" />{f}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full cursor-pointer">{t('landing.cta_primary')}</Button>
                  </motion.div>
                </Link>
              </motion.div>
            </FadeUp>
            <FadeUp delay={0.16}>
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 24px 60px hsl(var(--primary)/0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="rounded-xl border-2 border-primary bg-card p-6 h-full flex flex-col relative overflow-hidden"
              >
                {/* Glow top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                <div className="absolute -top-3 left-5">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="bg-primary text-primary-foreground text-xs">{t('landing.popular')}</Badge>
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold mb-1 mt-2">{t('landing.pricing_pro')}</h3>
                <p className="text-3xl font-bold text-primary mb-1">{t('landing.pricing_pro_price')}</p>
                <p className="text-sm text-muted-foreground mb-5">{t('landing.pricing_pro_desc')}</p>
                <ul className="space-y-2.5 text-sm mb-6 flex-1">
                  {[t('landing.pricing_feature_1'), t('landing.pricing_feature_2'), t('landing.pricing_feature_3'), t('landing.pricing_feature_4'), t('landing.pricing_feature_5'), t('landing.pricing_feature_6')].map((f, i) => (
                    <motion.li key={f} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0" />{f}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full cursor-pointer glow-primary-sm">{t('landing.cta_primary')}</Button>
                  </motion.div>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">{t('landing.guarantee')}</p>
              </motion.div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeUp><h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">FAQ</h2></FadeUp>
          <div className="space-y-2">
            {[
              { q: t('landing.faq_1_q'), a: t('landing.faq_1_a') },
              { q: t('landing.faq_2_q'), a: t('landing.faq_2_a') },
              { q: t('landing.faq_3_q'), a: t('landing.faq_3_a') },
              { q: t('landing.faq_4_q'), a: t('landing.faq_4_a') },
            ].map((faq, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <motion.div
                  layout
                  className="rounded-xl border bg-card overflow-hidden cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    <p className="font-semibold text-sm">{faq.q}</p>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 pointer-events-none"
        />
        <div className="relative max-w-xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3 text-balance">{t('landing.final_cta_title')}</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{t('landing.final_cta_desc')}</p>
            <MagneticButton className="inline-block">
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button size="lg" className="cursor-pointer text-sm font-semibold px-8 glow-primary relative overflow-hidden group">
                    {t('landing.cta_primary')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Button>
                </motion.div>
              </Link>
            </MagneticButton>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-center">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <span className="font-heading font-bold text-sm">ReplyPro</span>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
            <Link href="/terms">
              <motion.span whileHover={{ color: 'hsl(var(--foreground))' }} className="transition-colors cursor-pointer">{t('landing.footer_terms')}</motion.span>
            </Link>
            <Link href="/uvjeti">
              <motion.span whileHover={{ color: 'hsl(var(--foreground))' }} className="transition-colors cursor-pointer">Uvjeti korištenja</motion.span>
            </Link>
            <Link href="/privacy">
              <motion.span whileHover={{ color: 'hsl(var(--foreground))' }} className="transition-colors cursor-pointer">{t('landing.footer_privacy')}</motion.span>
            </Link>
            <Link href="/privatnost">
              <motion.span whileHover={{ color: 'hsl(var(--foreground))' }} className="transition-colors cursor-pointer">Privatnost</motion.span>
            </Link>
            <a href="mailto:info@replypro.hr">
              <motion.span whileHover={{ color: 'hsl(var(--foreground))' }} className="transition-colors cursor-pointer">{t('landing.footer_contact')}</motion.span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
          <p className="text-xs text-muted-foreground">&copy; 2026 ReplyPro. Sva prava pridržana.</p>
        </div>
      </footer>
    </div>
  )
}
