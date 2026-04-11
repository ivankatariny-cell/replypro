import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | ReplyPro',
  description: 'Terms of Service for ReplyPro — AI reply assistant for real estate agents.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Last updated: April 11, 2026
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            <Link href="/uvjeti" className="text-primary hover:underline">Pročitajte na hrvatskom →</Link>
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReplyPro (&quot;the Service&quot;) is a B2B AI-powered reply assistant designed for real estate
              agents. The Service is operated by <strong>ReplyPro d.o.o.</strong>, a company registered
              in Croatia, located at <strong>Ilica 1, 10000 Zagreb, Croatia</strong>. By accessing or using
              ReplyPro at <a href="https://replypro.hr" className="text-primary hover:underline">replypro.hr</a>,
              you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use the Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>All activity that occurs under your account.</li>
              <li>Providing accurate and up-to-date information during registration.</li>
              <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You must be at least 18 years old and a registered business entity or professional to
              use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Subscription &amp; Billing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ReplyPro offers subscription plans billed on a monthly or annual basis. The Pro plan
              is currently priced at <strong>€29.00 per month (VAT included where applicable)</strong>.
              By subscribing:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>You authorize us to charge your payment method on a recurring basis.</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
              <li>You may cancel your subscription at any time via the billing portal.</li>
              <li>Refunds are not provided for partial billing periods unless required by law.</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Payment processing is handled by Stripe. By providing payment information, you also
              agree to Stripe&apos;s terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Generate spam, misleading, or fraudulent content.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe on the intellectual property rights of others.</li>
              <li>Attempt to reverse-engineer, scrape, or disrupt the Service.</li>
              <li>Share your account credentials with unauthorized third parties.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, software, and technology comprising the Service is owned by{' '}
              <strong>ReplyPro d.o.o.</strong> or its licensors. You retain ownership of any content
              you input into the Service. By using the Service, you grant us a limited license to
              process your input solely to provide the Service. AI-generated outputs are provided
              for your use, but we make no warranties regarding their accuracy or fitness for any
              particular purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, <strong>ReplyPro d.o.o.</strong>{' '}
              shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Service. Our total liability to you for any
              claims arising from these Terms shall not exceed the amount you paid us in the three
              months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate this agreement at any time. We may suspend or terminate
              your access immediately if you breach these Terms. Upon termination, your right to
              use the Service ceases. We may retain your data for a period as described in our
              Privacy Policy before deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of the Republic
              of Croatia. Any disputes arising from these Terms shall be subject to the exclusive
              jurisdiction of the competent courts in Croatia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us:
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
