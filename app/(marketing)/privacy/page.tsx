import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | ReplyPro',
  description: 'Privacy Policy for ReplyPro — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Last updated: April 11, 2026
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            <Link href="/privatnost" className="text-primary hover:underline">Pročitajte na hrvatskom →</Link>
          </p>

          <p className="text-muted-foreground leading-relaxed mb-8">
            <strong>ReplyPro d.o.o.</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates ReplyPro at{' '}
            <a href="https://replypro.hr" className="text-primary hover:underline">replypro.hr</a>.
            This Privacy Policy explains how we collect, use, and protect your personal data in
            accordance with the General Data Protection Regulation (GDPR) and applicable Croatian law.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect the following categories of personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Account data:</strong> email address, password (hashed), name, and agency name provided during registration.</li>
              <li><strong>Usage data:</strong> AI generation inputs and outputs, client and property data you enter, generation history.</li>
              <li><strong>Billing data:</strong> subscription status and billing history (payment card details are handled exclusively by Stripe and never stored by us).</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information, and usage logs for security and performance purposes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your data to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Provide, operate, and improve the ReplyPro service.</li>
              <li>Process payments and manage your subscription.</li>
              <li>Send transactional emails (account confirmation, password reset, billing receipts).</li>
              <li>Detect and prevent fraud, abuse, and security incidents.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do not sell your personal data to third parties. We do not use your data for
              advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Data Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored using <strong>Supabase</strong>, a database platform hosted on
              infrastructure within the European Union. All data is encrypted at rest and in transit.
              We take appropriate technical and organizational measures to protect your personal data
              against unauthorized access, loss, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the following third-party processors to operate the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Stripe</strong> — Payment processing. Stripe processes your payment
                information under their own privacy policy. We receive only subscription status
                and billing metadata.
              </li>
              <li>
                <strong>Groq</strong> — AI inference provider used to generate reply suggestions.
                Your input text is sent to Groq&apos;s API to produce AI-generated outputs. Groq
                processes this data under their own privacy policy.
              </li>
              <li>
                <strong>Resend</strong> — Transactional email delivery (account confirmation,
                password reset). Your email address is shared with Resend solely for this purpose.
              </li>
              <li>
                <strong>Supabase</strong> — Database and authentication infrastructure hosted
                within the EU.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Each of these processors is bound by data processing agreements and applicable
              data protection law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to
              provide the Service. If you delete your account, we will delete or anonymize your
              personal data within 30 days, except where we are required to retain it for legal
              or regulatory obligations (e.g., billing records for tax purposes, which may be
              retained for up to 7 years under Croatian law).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              As a data subject under the GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;), subject to legal retention requirements.</li>
              <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Right to restriction:</strong> Request that we restrict processing of your data in certain circumstances.</li>
              <li><strong>Right to object:</strong> Object to processing based on legitimate interests.</li>
              <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, withdraw it at any time.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@replypro.hr" className="text-primary hover:underline">privacy@replypro.hr</a>.
              We will respond within 30 days. You also have the right to lodge a complaint with the
              Croatian Personal Data Protection Agency (AZOP) at{' '}
              <a href="https://azop.hr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">azop.hr</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use essential cookies required for authentication and session management. These
              cookies are strictly necessary for the Service to function and cannot be disabled.
              We do not use tracking, advertising, or analytics cookies. By using the Service,
              you consent to the use of these essential cookies.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Specifically, we set the following authentication cookie:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
              <li>
                <strong>sb-[project-ref]-auth-token</strong> — Set by Supabase to maintain your
                authenticated session. This cookie stores an encrypted session token and is required
                to keep you logged in. It expires when you log out or after a period of inactivity.
                No personal data is stored in the cookie itself; it references a server-side session.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by email or via a notice in the Service at least 14 days before the changes
              take effect. Continued use of the Service after the effective date constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related inquiries or to exercise your rights, contact our data controller:
            </p>
            <address className="not-italic mt-3 text-muted-foreground space-y-1">
              <p><strong>ReplyPro d.o.o.</strong></p>
              <p>Ilica 1, 10000 Zagreb</p>
              <p>Croatia</p>
              <p>
                Email:{' '}
                <a href="mailto:privacy@replypro.hr" className="text-primary hover:underline">
                  privacy@replypro.hr
                </a>
              </p>
            </address>
          </section>
        </article>
      </div>
    </main>
  )
}
