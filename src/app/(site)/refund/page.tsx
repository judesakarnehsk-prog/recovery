import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Revorva refund policy for subscription services.',
}

export default function RefundPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray">
        <h1 className="text-4xl font-extrabold text-text-primary mb-8">Refund Policy</h1>
        <p className="text-sm text-text-secondary mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-primary">Free Trial</h2>
            <p>
              All Revorva plans include a 14-day free trial. No credit card is required to start your trial.
              If you decide Revorva isn&apos;t right for you during the trial period, you can cancel at any time
              without being charged.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary">Subscription Cancellation</h2>
            <p>
              You can cancel your Revorva subscription at any time from your billing settings. Upon cancellation:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Your account will remain active until the end of your current billing period.</li>
              <li>No further charges will be made after cancellation.</li>
              <li>You will retain access to your dashboard and data until the billing period ends.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary">Refund Eligibility</h2>
            <p>
              We offer refunds under the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Within 30 days of your first payment:</strong> If you&apos;re not satisfied with Revorva after your trial converts to a paid subscription, contact us within 30 days for a full refund.</li>
              <li><strong>Service issues:</strong> If Revorva experiences extended downtime or fails to function as described, you may be eligible for a prorated refund.</li>
              <li><strong>Duplicate charges:</strong> If you were charged in error or billed twice, we will refund the duplicate charge immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary">Non-Refundable Situations</h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Partial month usage after the 30-day satisfaction guarantee period.</li>
              <li>Annual subscriptions after the 30-day satisfaction guarantee period (downgrades are available).</li>
              <li>Accounts terminated for violation of our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary">How to Request a Refund</h2>
            <p>
              To request a refund, please contact our support team at{' '}
              <a href="mailto:billing@revorva.com" className="text-primary hover:underline">billing@revorva.com</a>{' '}
              with your account email and the reason for your request. We aim to process all refund requests within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary">Contact</h2>
            <p>
              If you have questions about our refund policy, please reach out to{' '}
              <a href="mailto:billing@revorva.com" className="text-primary hover:underline">billing@revorva.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
