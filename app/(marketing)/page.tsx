'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare, ClipboardPaste, Sparkles, Send,
  Check, ArrowRight, Clock, AlertTriangle, Repeat,
  Users, Building2, History, UserCheck,
  ChevronDown,
} from 'lucide-react'

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()
  const [roiMessages, setRoiMessages] = useState(15)
  const [roiMinutes, setRoiMinutes] = useState(5)

  const hoursSaved = Math.round((roiMessages * roiMinutes * 22) / 60 * 10) / 10
  const hoursWithReply = Math.round((roiMessages * 0.5 * 22) / 60 * 10) / 10

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 bg-[length:200%_200%] animate-gradient-shift" />
        <div className="relative max-w-4xl mx-auto text-center">
          <FadeUp>
            <Badge variant="secondary" className="mb-4">{t('landing.badge')}</Badge>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6">
              {t('landing.headline')}
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('landing.subheadline')}
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="cursor-pointer text-base">
                  {t('landing.cta_primary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="cursor-pointer text-base">
                  {t('landing.cta_secondary')}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{t('landing.no_card')}</p>
          </FadeUp>
        </div>
      </section>

      {/* Pain Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-12">{t('landing.pain_title')}</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, text: t('landing.pain_1') },
              { icon: Repeat, text: t('landing.pain_2') },
              { icon: AlertTriangle, text: t('landing.pain_3') },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                      <item.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <p className="text-center mt-8 text-primary font-medium">{t('landing.pain_solution')}</p>
          </FadeUp>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.how_it_works')}</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ClipboardPaste, title: t('landing.step1_title'), desc: t('landing.step1_desc') },
              { icon: Sparkles, title: t('landing.step2_title'), desc: t('landing.step2_desc') },
              { icon: Send, title: t('landing.step3_title'), desc: t('landing.step3_desc') },
            ].map((step, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="mx-auto mb-2 text-xs font-bold text-primary">{i + 1}</div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.example_title')}</h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{t('history.original')}:</p>
                <p className="text-base italic">&ldquo;{t('landing.example_message')}&rdquo;</p>
              </CardContent>
            </Card>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { variant: 'professional' as const, border: 'border-blue-200 dark:border-blue-800', tone: t('dashboard.tone_professional'), text: t('landing.example_pro') },
              { variant: 'friendly' as const, border: 'border-green-200 dark:border-green-800', tone: t('dashboard.tone_friendly'), text: t('landing.example_friendly') },
              { variant: 'direct' as const, border: 'border-amber-200 dark:border-amber-800', tone: t('dashboard.tone_direct'), text: t('landing.example_direct') },
            ].map((card, i) => (
              <FadeUp key={i} delay={0.2 + i * 0.15}>
                <Card className={card.border}>
                  <CardContent className="p-4">
                    <Badge variant={card.variant} className="mb-2">{card.tone}</Badge>
                    <p className="text-sm">{card.text}</p>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.features_title')}</h2>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: t('landing.feat_tones'), desc: t('landing.feat_tones_desc') },
              { icon: Sparkles, title: t('landing.feat_lang'), desc: t('landing.feat_lang_desc') },
              { icon: ClipboardPaste, title: t('landing.feat_templates'), desc: t('landing.feat_templates_desc') },
              { icon: Users, title: t('landing.feat_clients'), desc: t('landing.feat_clients_desc') },
              { icon: Building2, title: t('landing.feat_properties'), desc: t('landing.feat_properties_desc') },
              { icon: History, title: t('landing.feat_history'), desc: t('landing.feat_history_desc') },
            ].map((feat, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <Card className="h-full hover:border-primary/30 hover:shadow-sm transition-all cursor-default">
                  <CardContent className="p-5">
                    <feat.icon className="h-5 w-5 text-primary mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-heading font-bold text-center mb-4">{t('landing.roi_title')}</h2>
            <p className="text-center text-muted-foreground mb-8">{t('landing.roi_subtitle')}</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('landing.roi_messages')}</span>
                    <span className="font-bold">{roiMessages}</span>
                  </div>
                  <input type="range" min={5} max={50} value={roiMessages} onChange={(e) => setRoiMessages(+e.target.value)} className="w-full cursor-pointer accent-primary" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('landing.roi_minutes')}</span>
                    <span className="font-bold">{roiMinutes} min</span>
                  </div>
                  <input type="range" min={2} max={10} value={roiMinutes} onChange={(e) => setRoiMinutes(+e.target.value)} className="w-full cursor-pointer accent-primary" />
                </div>
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('landing.roi_without')}</p>
                  <p className="text-2xl font-bold text-destructive">{hoursSaved}h / {t('landing.roi_month')}</p>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t('landing.roi_with')}</p>
                  <p className="text-2xl font-bold text-primary">{hoursWithReply}h / {t('landing.roi_month')}</p>
                  <p className="text-xs text-primary mt-1">{t('landing.roi_save')} {Math.round(hoursSaved - hoursWithReply)}h {t('landing.roi_month')}</p>
                </div>
                <Link href="/signup" className="block">
                  <Button className="w-full cursor-pointer">{t('landing.roi_cta')}</Button>
                </Link>
              </CardContent>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.pricing_title')}</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <FadeUp delay={0.1}>
              <Card className="h-full">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">{t('landing.pricing_free')}</h3>
                  <p className="text-3xl font-bold mb-4">€0</p>
                  <p className="text-sm text-muted-foreground mb-6">{t('landing.pricing_free_desc')}</p>
                  <ul className="space-y-2 text-sm text-left mb-6">
                    {[t('landing.pricing_feature_1'), t('landing.pricing_feature_2'), '10 ' + t('landing.pricing_feature_gen')].map((f) => (
                      <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full cursor-pointer">{t('landing.cta_primary')}</Button>
                  </Link>
                </CardContent>
              </Card>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Card className="border-primary h-full relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">{t('landing.popular')}</Badge>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">{t('landing.pricing_pro')}</h3>
                  <p className="text-3xl font-bold text-primary mb-4">{t('landing.pricing_pro_price')}</p>
                  <p className="text-sm text-muted-foreground mb-6">{t('landing.pricing_pro_desc')}</p>
                  <ul className="space-y-2 text-sm text-left mb-6">
                    {[t('landing.pricing_feature_1'), t('landing.pricing_feature_2'), t('landing.pricing_feature_3'), t('landing.pricing_feature_4'), t('landing.pricing_feature_5'), t('landing.pricing_feature_6')].map((f) => (
                      <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full cursor-pointer">{t('landing.cta_primary')}</Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-3">{t('landing.guarantee')}</p>
                </CardContent>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-heading font-bold text-center mb-12">FAQ</h2>
          </FadeUp>
          <div className="space-y-4">
            {[
              { q: t('landing.faq_1_q'), a: t('landing.faq_1_a') },
              { q: t('landing.faq_2_q'), a: t('landing.faq_2_a') },
              { q: t('landing.faq_3_q'), a: t('landing.faq_3_a') },
              { q: t('landing.faq_4_q'), a: t('landing.faq_4_a') },
            ].map((faq, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm mb-1">{faq.q}</p>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">{t('landing.final_cta_title')}</h2>
            <p className="text-muted-foreground mb-6">{t('landing.final_cta_desc')}</p>
            <Link href="/signup">
              <Button size="lg" className="cursor-pointer text-base">
                {t('landing.cta_primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold">ReplyPro</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">{t('landing.footer_terms')}</a>
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">{t('landing.footer_privacy')}</a>
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">{t('landing.footer_contact')}</a>
          </div>
          <p className="text-xs text-muted-foreground">&copy; 2026 ReplyPro</p>
        </div>
      </footer>
    </div>
  )
}
