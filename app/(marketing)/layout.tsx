import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: 'https://replypro.hr' },
  title: 'ReplyPro — Odgovarajte klijentima za 5 sekundi',
  description: '10 besplatnih generacija. Bez kreditne kartice. AI asistent za agente nekretnina.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
