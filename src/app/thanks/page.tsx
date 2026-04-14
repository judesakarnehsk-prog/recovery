'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientMesh, NoiseTexture } from '@/components/InteractiveBackground'

export default function ThanksPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <GradientMesh className="opacity-40" />
      <NoiseTexture opacity={0.02} />
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-success/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-3xl bg-success/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">
            You are all set!
          </h1>
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
            Your account is active and Revorva is ready to start recovering your failed payments.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/onboarding">
            <Button variant="cta" size="lg" className="group">
              Set Up Recovery
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-text-secondary"
        >
          Need help? Email us at{' '}
          <a href="mailto:support@revorva.com" className="text-primary hover:underline">
            support@revorva.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
