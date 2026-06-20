'use client'

import { motion } from 'framer-motion'

const live = [
  {
    name: 'Stripe',
    badge: 'Live',
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    logo: (
      /* Stripe "S" emblem mark */
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" aria-label="Stripe">
        <rect width="40" height="40" rx="8" fill="#635BFF"/>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.6 15.4c0-1.1.9-1.5 2.4-1.5 2.1 0 4.8.6 6.9 1.8v-6.5a18.4 18.4 0 0 0-6.9-1.3c-5.6 0-9.4 2.9-9.4 7.8 0 7.6 10.5 6.4 10.5 9.7 0 1.3-1.1 1.7-2.7 1.7-2.4 0-5.4-1-7.7-2.3v6.6c2.6 1.1 5.2 1.6 7.7 1.6 5.8 0 9.7-2.9 9.7-7.8-.1-8.2-10.5-6.8-10.5-9.8z"
          fill="white"
        />
      </svg>
    ),
    grayscale: false,
  },
]

const coming = [
  { name: 'Paddle' },
  { name: 'Chargebee' },
  { name: 'Lemon Squeezy' },
  { name: 'Recurly' },
  { name: 'Custom API' },
]

export function IntegrationsRoadmap() {
  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-ink mb-4">
            Available now and coming soon
          </h2>
          <p className="text-muted max-w-xl mx-auto leading-relaxed">
            Revorva is building the universal payment recovery layer for subscription businesses.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Live */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-border rounded-2xl p-8"
          >
            <p className="text-xs font-semibold text-ink uppercase tracking-widest mb-6">Available now</p>
            {live.map((integration) => (
              <motion.div
                key={integration.name}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-cream"
              >
                <div className="flex items-center gap-4">
                  {integration.logo}
                  <span className="font-medium text-ink">{integration.name}</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${integration.badgeColor}`}>
                  {integration.badge}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-border rounded-2xl p-8"
          >
            <p className="text-xs font-semibold text-ink uppercase tracking-widest mb-6">Coming soon</p>
            <div className="space-y-3">
              {coming.map((integration, i) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -1 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cream border border-border flex items-center justify-center">
                      <span className="text-xs font-bold text-muted">{integration.name[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-muted">{integration.name}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FFE8DC', color: '#C94A1F' }}>
                    Coming soon
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-sm text-muted"
        >
          Need recovery for a different platform?{' '}
          <a href="mailto:support@revorva.com" className="text-accent hover:underline">
            Email us at support@revorva.com
          </a>{' '}
          — we prioritise based on demand.
        </motion.p>
      </div>
    </section>
  )
}
