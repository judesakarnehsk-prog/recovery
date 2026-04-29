'use client'

import { AnimatedSection } from '@/lib/motion'
import { GradientMesh, NoiseTexture } from '@/components/InteractiveBackground'

export default function TermsPage() {
  return (
    <div className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
      <GradientMesh className="opacity-20" />
      <NoiseTexture opacity={0.02} />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="text-4xl font-extrabold text-text-primary mb-4">Terms of Service</h1>
          <p className="text-text-secondary mb-12">Last updated: January 15, 2025</p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="prose prose-slate max-w-none space-y-8">
            <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-text-secondary leading-relaxed text-sm">
                These Terms of Service constitute a binding agreement between you and <strong>Humanaira Ltd</strong>,
                a company registered in England and Wales (registered office: 167–169 Great Portland St, London,
                W1W 5PF). Humanaira Ltd operates Revorva as a product. References to &ldquo;Revorva&rdquo;,
                &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; in these Terms refer to Humanaira Ltd.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">1. Acceptance of Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                By accessing or using Revorva (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including free trial users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">2. Description of Service</h2>
              <p className="text-text-secondary leading-relaxed">
                Revorva is a SaaS platform that helps subscription businesses recover failed payments through automated retry logic and personalized dunning emails. The Service connects to your Stripe account via OAuth and operates on your behalf to retry failed charges and communicate with your customers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">3. Account Registration</h2>
              <p className="text-text-secondary leading-relaxed">
                You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must be at least 18 years old and authorized to enter agreements on behalf of your business.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">4. Stripe Connect Authorization</h2>
              <p className="text-text-secondary leading-relaxed">
                By connecting your Stripe account, you authorize Revorva to access your payment data, retry failed charges, and send emails to your customers on your behalf. You may revoke this authorization at any time by disconnecting from your Revorva dashboard or directly through Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">5. Billing & Subscriptions</h2>
              <p className="text-text-secondary leading-relaxed">
                Revorva offers a 14-day free trial. After the trial, you must subscribe to a paid plan to continue using the Service. Subscriptions are billed monthly or annually. You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds are available within 30 days under our money-back guarantee.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">6. Acceptable Use</h2>
              <p className="text-text-secondary leading-relaxed">
                You agree not to: (a) use the Service for any unlawful purpose; (b) send spam or unsolicited emails outside the scope of legitimate payment recovery; (c) attempt to gain unauthorized access to our systems; (d) reverse engineer the Service; (e) use the Service to process payments in violation of Stripe&apos;s Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">7. Limitation of Liability</h2>
              <p className="text-text-secondary leading-relaxed">
                Revorva is provided &quot;as is.&quot; We make no guarantees about the amount of revenue that will be recovered. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">8. Termination</h2>
              <p className="text-text-secondary leading-relaxed">
                Either party may terminate at any time. We may suspend or terminate your account if you violate these terms. Upon termination, we will revoke Stripe access and delete your data per our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">9. Governing Law</h2>
              <p className="text-text-secondary leading-relaxed">
                These terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">10. Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                For questions about these terms, contact us at{' '}
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
