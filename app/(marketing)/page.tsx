'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare, ClipboardPaste, Sparkles, Send,
  Check, ArrowRight
} from 'lucide-react'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">AI Reply Assistant</Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6">
            {t('landing.headline')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('landing.subheadline')}
          </p>
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
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.how_it_works')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ClipboardPaste, title: t('landing.step1_title'), desc: t('landing.step1_desc') },
              { icon: Sparkles, title: t('landing.step2_title'), desc: t('landing.step2_desc') },
              { icon: Send, title: t('landing.step3_title'), desc: t('landing.step3_desc') },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.example_title')}</h2>
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">{t('history.original')}:</p>
              <p className="text-base italic">&ldquo;{t('landing.example_message')}&rdquo;</p>
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <Badge variant="professional" className="mb-2">{t('dashboard.tone_professional')}</Badge>
                <p className="text-sm">Poštovani, hvala Vam na upitu. Imamo nekoliko izvrsnih opcija u centru Zagreba koje odgovaraju Vašim kriterijima. Predlažem da se nađemo [slobodan sam u utorak] kako bih Vam osobno predstavio nekretnine. S poštovanjem, Agent</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4">
                <Badge variant="friendly" className="mb-2">{t('dashboard.tone_friendly')}</Badge>
                <p className="text-sm">Bok! Super da ste se javili. Imam par stanova baš u centru koji bi vam mogli odgovarati — 3 sobe, odlične lokacije. Kad bi vam pasalo da ih pogledamo? Javite mi pa ćemo dogovoriti. Pozdrav, Agent</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <Badge variant="direct" className="mb-2">{t('dashboard.tone_direct')}</Badge>
                <p className="text-sm">Imam 3 stana u centru Zagreba u vašem budžetu. Mogu vam poslati detalje ili dogovoriti razgledavanje [slobodan sam u utorak]. Javite se. Agent</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">{t('landing.pricing_title')}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">{t('landing.pricing_free')}</h3>
                <p className="text-3xl font-bold mb-4">€0</p>
                <p className="text-sm text-muted-foreground mb-6">{t('landing.pricing_free_desc')}</p>
                <ul className="space-y-2 text-sm text-left mb-6">
                  {[t('landing.pricing_feature_1'), t('landing.pricing_feature_2')].map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>
                  ))}
                  <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4" />10 generations</li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full cursor-pointer">{t('landing.cta_primary')}</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">{t('landing.pricing_pro')}</h3>
                <p className="text-3xl font-bold text-primary mb-4">{t('landing.pricing_pro_price')}</p>
                <p className="text-sm text-muted-foreground mb-6">{t('landing.pricing_pro_desc')}</p>
                <ul className="space-y-2 text-sm text-left mb-6">
                  {[t('landing.pricing_feature_1'), t('landing.pricing_feature_2'), t('landing.pricing_feature_3'), t('landing.pricing_feature_4')].map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full cursor-pointer">{t('landing.cta_primary')}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
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
          <p className="text-xs text-muted-foreground">© 2026 ReplyPro</p>
        </div>
      </footer>
    </div>
  )
}
