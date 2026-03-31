'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { MessageSquare, Sparkles, Users, Building2, Star, Shield } from 'lucide-react'

const features = [
  { icon: Sparkles, keyHr: '3 tona AI odgovora', keyEn: '3 AI reply tones' },
  { icon: Users, keyHr: 'Knjiga klijenata', keyEn: 'Client book' },
  { icon: Building2, keyHr: 'Katalog nekretnina', keyEn: 'Property catalog' },
  { icon: Star, keyHr: 'Spremljeni favoriti', keyEn: 'Saved favorites' },
  { icon: Shield, keyHr: 'Sigurno i enkriptirano', keyEn: 'Secure and encrypted' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { language } = useTranslation()

  return (
    <div className="flex min-h-screen">
      {/* Left panel — features (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-heading">ReplyPro</span>
          </div>
          <h2 className="text-3xl font-heading font-bold mb-3">
            {language === 'hr' ? 'Odgovarajte klijentima 10x brže' : 'Reply to clients 10x faster'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'hr' ? 'AI asistent za agente za nekretnine u Hrvatskoj' : 'AI assistant for real estate agents'}
          </p>
          <div className="space-y-4">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{language === 'hr' ? f.keyHr : f.keyEn}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
