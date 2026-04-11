import { MessageSquare, Check } from 'lucide-react'

const features = [
  'Generate 3 reply tones in 5 seconds',
  'Croatian & English auto-detection',
  'Client & property context-aware AI',
]

function FloatingDots() {
  const dots = [
    { size: 8, top: '15%', left: '10%', delay: '0s', duration: '6s' },
    { size: 5, top: '25%', left: '80%', delay: '1s', duration: '8s' },
    { size: 10, top: '60%', left: '15%', delay: '2s', duration: '7s' },
    { size: 6, top: '70%', left: '75%', delay: '0.5s', duration: '9s' },
    { size: 4, top: '40%', left: '90%', delay: '1.5s', duration: '5s' },
    { size: 7, top: '85%', left: '40%', delay: '3s', duration: '7s' },
    { size: 5, top: '10%', left: '55%', delay: '2.5s', duration: '6s' },
  ]

  return (
    <>
      {dots.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/20 animate-float pointer-events-none"
          style={{
            width: dot.size,
            height: dot.size,
            top: dot.top,
            left: dot.left,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
          }}
        />
      ))}
    </>
  )
}

function MockChatCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 shadow-xl">
      {/* Client message */}
      <div className="mb-4">
        <p className="text-xs text-white/60 mb-1.5 font-medium uppercase tracking-wide">Client message</p>
        <div className="rounded-xl bg-white/15 px-3.5 py-2.5">
          <p className="text-sm text-white leading-relaxed">
            Hi, is the apartment on Ilica still available? What&apos;s the price?
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-white/20" />
        <p className="text-xs text-white/50">3 AI replies generated</p>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Reply tone badges */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Professional', color: 'bg-white/20 border-white/30' },
          { label: 'Friendly', color: 'bg-emerald-400/20 border-emerald-300/30' },
          { label: 'Direct', color: 'bg-sky-400/20 border-sky-300/30' },
        ].map((tone) => (
          <span
            key={tone.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-white ${tone.color}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            {tone.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[45%_55%]">
      {/* LEFT PANEL — form side */}
      <div className="flex flex-col min-h-screen bg-white px-6 py-8 sm:px-10 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(164_72%_28%)] text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">ReplyPro</span>
        </div>

        {/* Form content */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center lg:text-left">
          © 2026 ReplyPro
        </p>
      </div>

      {/* RIGHT PANEL — visual side, hidden on mobile */}
      <div
        className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden px-10 py-12"
        style={{
          background: 'linear-gradient(135deg, hsl(164 72% 28%) 0%, hsl(174 64% 38%) 100%)',
        }}
      >
        <FloatingDots />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 w-full max-w-md">
          {/* Wordmark */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">ReplyPro</h1>
            <p className="text-white/70 text-sm">AI assistant for real estate agents</p>
          </div>

          {/* Feature bullets */}
          <ul className="space-y-3 text-left w-full">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 border border-white/30">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                <span className="text-sm text-white/90 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Mock chat card */}
          <MockChatCard />
        </div>
      </div>
    </div>
  )
}
