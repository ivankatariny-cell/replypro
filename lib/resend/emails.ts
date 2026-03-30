import { getResend, FROM_EMAIL } from './client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://replypro.hr'

function baseTemplate(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafb"><div style="max-width:560px;margin:0 auto;padding:40px 20px"><div style="text-align:center;margin-bottom:32px"><span style="font-size:20px;font-weight:700;color:#0F766E">ReplyPro</span></div><div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">${content}</div><div style="text-align:center;margin-top:24px;font-size:12px;color:#94a3b8"><p>&copy; 2026 ReplyPro</p><a href="${APP_URL}" style="color:#94a3b8">Unsubscribe</a></div></div></body></html>`
}

async function send(email: string, subject: string, body: string) {
  await getResend().emails.send({ from: FROM_EMAIL, to: email, subject, html: baseTemplate(body) })
}

export async function sendWelcomeEmail(email: string, lang: 'hr' | 'en') {
  const subject = lang === 'hr' ? 'Dobrodošli u ReplyPro!' : 'Welcome to ReplyPro!'
  const body = lang === 'hr'
    ? `<h2 style="color:#0F766E;margin:0 0 16px">Dobrodošli!</h2><p>Hvala što ste se registrirali. Imate 10 besplatnih generacija.</p><a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Počnite koristiti ReplyPro</a>`
    : `<h2 style="color:#0F766E;margin:0 0 16px">Welcome!</h2><p>Thanks for signing up. You have 10 free generations.</p><a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Start using ReplyPro</a>`
  await send(email, subject, body)
}

export async function sendTrialLowEmail(email: string, lang: 'hr' | 'en') {
  const subject = lang === 'hr' ? 'Imate još 3 besplatne generacije' : 'You have 3 free generations left'
  const body = lang === 'hr'
    ? `<h2 style="color:#0F766E;margin:0 0 16px">Još 3 generacije</h2><p>Iskoristili ste 7 od 10 besplatnih generacija. Nadogradite na Pro za neograničen pristup.</p><a href="${APP_URL}/billing" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Nadogradite na Pro</a>`
    : `<h2 style="color:#0F766E;margin:0 0 16px">3 generations left</h2><p>You've used 7 of 10 free generations. Upgrade to Pro for unlimited access.</p><a href="${APP_URL}/billing" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Upgrade to Pro</a>`
  await send(email, subject, body)
}

export async function sendTrialExpiredEmail(email: string, lang: 'hr' | 'en') {
  const subject = lang === 'hr' ? 'Vaš besplatni period je završio' : 'Your free trial has ended'
  const body = lang === 'hr'
    ? `<h2 style="color:#0F766E;margin:0 0 16px">Besplatni period završen</h2><p>Nadogradite na Pro za samo 29€/mj i nastavite generirati savršene odgovore.</p><a href="${APP_URL}/billing" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Aktivirajte ReplyPro Pro — 29€/mj</a>`
    : `<h2 style="color:#0F766E;margin:0 0 16px">Trial ended</h2><p>Upgrade to Pro for just €29/mo and keep generating perfect replies.</p><a href="${APP_URL}/billing" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Activate ReplyPro Pro — €29/mo</a>`
  await send(email, subject, body)
}

export async function sendPaymentSuccessEmail(email: string, lang: 'hr' | 'en') {
  const subject = lang === 'hr' ? 'Plaćanje uspješno — dobrodošli u Pro!' : 'Payment successful — welcome to Pro!'
  const body = lang === 'hr'
    ? `<h2 style="color:#0F766E;margin:0 0 16px">Dobrodošli u Pro!</h2><p>Vaše plaćanje je uspješno. Sada imate neograničene generacije.</p><a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Idi na nadzornu ploču</a>`
    : `<h2 style="color:#0F766E;margin:0 0 16px">Welcome to Pro!</h2><p>Your payment was successful. You now have unlimited generations.</p><a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F766E;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Go to dashboard</a>`
  await send(email, subject, body)
}

export async function sendPaymentFailedEmail(email: string, lang: 'hr' | 'en') {
  const subject = lang === 'hr' ? 'Problem s plaćanjem' : 'Payment issue'
  const body = lang === 'hr'
    ? `<h2 style="color:#dc2626;margin:0 0 16px">Problem s plaćanjem</h2><p>Nismo uspjeli naplatiti vašu karticu. Molimo ažurirajte podatke o plaćanju.</p><a href="${APP_URL}/billing" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Ažuriraj plaćanje</a>`
    : `<h2 style="color:#dc2626;margin:0 0 16px">Payment issue</h2><p>We couldn't charge your card. Please update your payment details.</p><a href="${APP_URL}/billing" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Update payment</a>`
  await send(email, subject, body)
}
