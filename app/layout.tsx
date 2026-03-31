import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ReplyPro — AI Reply Assistant for Real Estate Agents',
  description: 'Paste a client message. Get 3 perfect replies in 5 seconds.',
  openGraph: {
    title: 'ReplyPro — AI Reply Assistant for Real Estate Agents',
    description: 'Paste a client message. Get 3 perfect replies in 5 seconds.',
    url: 'https://replypro.hr',
    siteName: 'ReplyPro',
    locale: 'hr_HR',
    type: 'website',
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
        </ThemeProvider>
      </body>
    </html>
  )
}
