'use client'

import { AnimatedSection } from '@/lib/motion'
import { GradientMesh, NoiseTexture } from '@/components/InteractiveBackground'

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
      <GradientMesh className="opacity-20" />
      <NoiseTexture opacity={0.02} />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="text-4xl font-extrabold text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-text-secondary mb-12">Last updated: January 15, 2025</p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="prose prose-slate max-w-none space-y-8">
            <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-text-secondary leading-relaxed text-sm">
                Revorva is a product of <strong>Humanaira Ltd</strong>, a company registered in England and Wales
                (registered office: 167–169 Great Portland St, London, W1W 5PF). Humanaira Ltd is the data
                controller responsible for your personal information under this policy. References to
                &ldquo;Revorva&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; in this policy refer to Humanaira Ltd.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">1. Information We Collect</h2>
              <p className="text-text-secondary leading-relaxed">
                When you create an account, we collect your email address, name, and password hash. When you connect your Stripe account via OAuth, we receive an access token and your Stripe account ID. We do not store or have access to your customers&apos; full credit card numbers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">2. How We Use Your Information</h2>
              <p className="text-text-secondary leading-relaxed">
                We use your information to: (a) provide the Revorva service, including processing payment retries and sending dunning emails on your behalf; (b) communicate with you about your account; (c) improve our service; (d) comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">3. Stripe Data</h2>
              <p className="text-text-secondary leading-relaxed">
                We access your Stripe data exclusively via Stripe Connect OAuth with the permissions you grant. We process payment intent data and customer email addresses solely for the purpose of recovering failed payments. We do not sell, share, or use this data for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">4. Data Security</h2>
              <p className="text-text-secondary leading-relaxed">
                All data is encrypted at rest and in transit using AES-256 and TLS 1.3. Access tokens are stored encrypted. Our infrastructure is hosted on Vercel and Supabase with SOC 2 compliant providers. We perform regular security audits and follow OWASP best practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">5. Third-Party Services</h2>
              <p className="text-text-secondary leading-relaxed">
                We use the following third-party services: Stripe (payment processing), Supabase (database and authentication), Resend (email delivery), and Vercel (hosting). Each service has its own privacy policy governing their handling of data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">6. GDPR & CCPA</h2>
              <p className="text-text-secondary leading-relaxed">
                We comply with GDPR and CCPA. You have the right to access, correct, delete, or export your personal data at any time. To exercise these rights, contact us at{' '}
                <a href="mailto:support@revorva.com" className="text-primary hover:underline">
                  support@revorva.com
                </a>. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">7. Data Retention</h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your data for as long as your account is active. When you delete your account, we remove all personal data within 30 days and anonymize analytics data. Stripe access tokens are revoked immediately upon account deletion or disconnection.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">8. Cookies &amp; Analytics</h2>
              <p className="text-text-secondary leading-relaxed mb-3">
                We use essential cookies for authentication and session management. We also use Vercel Analytics for anonymous usage tracking.
              </p>
              <p className="text-text-secondary leading-relaxed mb-3">
                With your consent, we use <strong>Google Analytics 4</strong> to understand how visitors interact with our website. Google Analytics collects anonymised data such as pages visited, time on site, and general location (country/region). We do not enable advertising features, and IP addresses are anonymised. No personally identifiable information is sent to Google.
              </p>
              <p className="text-text-secondary leading-relaxed mb-3">
                Google Analytics cookies are only set <strong>after you click &ldquo;Accept&rdquo;</strong> in the cookie banner. If you click &ldquo;Decline&rdquo;, no Google Analytics cookies or scripts are loaded. You can change your preference at any time by clearing your browser&apos;s local storage.
              </p>
              <p className="text-text-secondary leading-relaxed">
                For more information on how Google handles data collected via Analytics, see{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google&apos;s Privacy Policy
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">9. Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                For questions about this privacy policy, contact us at{' '}
                <a href="mailto:support@revorva.com" className="text-primary hover:underline">
                  support@revorva.com
                </a>.
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
