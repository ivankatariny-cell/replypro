import { MessageSquare, Sparkles, Clock, Users, Star } from 'lucide-react'
import Image from 'next/image'

const stats = [
  { icon: Clock, value: '5 sec', label: 'Average reply time' },
  { icon: Users, value: '500+', label: 'Active agents' },
  { icon: Star, value: '4.9', label: 'Average rating' },
]

const testimonial = {
  text: '"ReplyPro saved me 2 hours every day. My clients get replies instantly and I close more deals."',
  name: 'Marko Horvat',
  role: 'Senior Agent, Zagreb',
  initials: 'MH',
}

function AnimatedOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large primary orb */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          left: '-15%',
          background: 'radial-gradient(circle, hsl(164 72% 52%) 0%, transparent 70%)',
          animation: 'float 12s ease-in-out infinite',
        }}
      />
      {/* Secondary orb */}
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: 350,
          height: 350,
          bottom: '-5%',
          right: '-10%',
          background: 'radial-gradient(circle, hsl(174 64% 45%) 0%, transparent 70%)',
          animation: 'float 9s ease-in-out 3s infinite',
        }}
      />
      {/* Small accent orb */}
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: 200,
          height: 200,
          top: '40%',
          right: '20%',
          background: 'radial-gradient(circle, hsl(164 72% 70%) 0%, transparent 70%)',
          animation: 'float 7s ease-in-out 1.5s infinite',
        }}
      />
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

function MockReplyCard() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Sparkles className="h-3 w-3 text-white/40" />
          <span className="text-xs text-white/40 font-medium">ReplyPro AI</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Client message */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Client message</p>
          <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/80 leading-relaxed">
              Pozdrav, zanima me stan na Ilici. Je li još dostupan i koja je cijena?
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[10px] text-white/30 font-medium">3 replies in 4 seconds</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Reply tones */}
        <div className="space-y-2">
          {[
            { label: 'Professional', preview: 'Poštovani, hvala na upitu. Stan je dostupan...', color: 'rgba(255,255,255,0.12)', dot: 'bg-blue-300' },
            { label: 'Friendly', preview: 'Bok! Da, stan je još slobodan 🏠 Kada bi...', color: 'rgba(52,211,153,0.12)', dot: 'bg-emerald-300' },
            { label: 'Direct', preview: 'Stan je dostupan. Cijena €185.000. Termin?', color: 'rgba(56,189,248,0.12)', dot: 'bg-sky-300' },
          ].map((tone) => (
            <div key={tone.label} className="rounded-xl px-3 py-2" style={{ background: tone.color }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">{tone.label}</span>
              </div>
              <p className="text-xs text-white/70 truncate">{tone.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT: Visual panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between relative overflow-hidden px-12 py-10"
        style={{ background: 'linear-gradient(145deg, hsl(222 47% 8%) 0%, hsl(222 47% 12%) 50%, hsl(222 47% 9%) 100%)' }}
      >
        <AnimatedOrbs />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Image src="/icon.png" alt="ReplyPro" width={40} height={40} className="rounded-xl" />
          <span className="text-xl font-bold text-white tracking-tight">ReplyPro</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-10 max-w-md">
          {/* Headline */}
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', color: 'hsl(164 72% 62%)' }}
            >
              <Sparkles className="h-3 w-3" />
              AI assistant for real estate agents
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Reply to clients<br />
              <span style={{ background: 'linear-gradient(135deg, hsl(164 72% 52%) 0%, hsl(174 64% 62%) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                in 5 seconds.
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Generate 3 perfect reply tones for every client message. Built for Croatian real estate agents.
            </p>
          </div>

          {/* Mock card */}
          <MockReplyCard />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" style={{ color: 'hsl(164 72% 52%)' }} />
                  <span className="text-lg font-bold text-white">{value}</span>
                </div>
                <p className="text-xs text-white/40 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="relative z-10 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm text-white/70 leading-relaxed italic mb-4">{testimonial.text}</p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, hsl(164 72% 38%) 0%, hsl(174 64% 45%) 100%)' }}
            >
              {testimonial.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{testimonial.name}</p>
              <p className="text-xs text-white/40">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 px-6 pt-6 lg:hidden">
          <Image src="/icon.png" alt="ReplyPro" width={36} height={36} className="rounded-xl" />
          <span className="text-lg font-bold tracking-tight">ReplyPro</span>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pb-6">
          © 2026 ReplyPro · <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a> · <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
        </p>
      </div>
    </div>
  )
}
