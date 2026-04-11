import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { CookieBanner } from '@/components/ui/cookie-banner'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://replypro.hr'),
  title: {
    default: 'ReplyPro — AI odgovori za agente nekretnina',
    template: '%s | ReplyPro',
  },
  description: 'ReplyPro generira 3 savršena odgovora za svaku poruku klijenta za 5 sekundi. Napravljeno za agente nekretnina u Hrvatskoj.',
  keywords: ['AI asistent nekretnine', 'odgovori klijentima', 'agent nekretnina alat', 'real estate AI Croatia', 'ReplyPro'],
  authors: [{ name: 'ReplyPro' }],
  creator: 'ReplyPro',
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    alternateLocale: 'en_US',
    url: 'https://replypro.hr',
    siteName: 'ReplyPro',
    title: 'ReplyPro — AI odgovori za agente nekretnina',
    description: 'Generirajte 3 savršena odgovora za svaku poruku klijenta za 5 sekundi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReplyPro — AI odgovori za agente nekretnina',
    description: 'Generirajte 3 savršena odgovora za svaku poruku klijenta za 5 sekundi.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            {children}
          </ToastProvider>
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
