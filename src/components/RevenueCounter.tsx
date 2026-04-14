'use client'

import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, RefreshCw, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AnimatedCounter, AnimatedSection, staggerContainer, staggerItem } from '@/lib/motion'

interface RevenueCounterProps {
  totalRecovered: number
  recoveryRate: number
  totalAttempts: number
  emailsSent: number
}

const defaultStats: RevenueCounterProps = {
  totalRecovered: 12847,
  recoveryRate: 73.2,
  totalAttempts: 342,
  emailsSent: 891,
}

export function RevenueCounter(props: Partial<RevenueCounterProps>) {
  const stats = { ...defaultStats, ...props }

  const cards = [
    {
      label: 'Revenue Recovered',
      icon: DollarSign,
      value: stats.totalRecovered,
      prefix: '$',
      suffix: '',
      color: 'text-success',
      bg: 'bg-success/10',
      trend: '+23.5%',
      trendUp: true,
    },
    {
      label: 'Recovery Rate',
      icon: TrendingUp,
      value: stats.recoveryRate,
      prefix: '',
      suffix: '%',
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '+5.2%',
      trendUp: true,
    },
    {
      label: 'Retry Attempts',
      icon: RefreshCw,
      value: stats.totalAttempts,
      prefix: '',
      suffix: '',
      color: 'text-accent',
      bg: 'bg-accent/10',
      trend: '142 this week',
      trendUp: true,
    },
    {
      label: 'Dunning Emails Sent',
      icon: Mail,
      value: stats.emailsSent,
      prefix: '',
      suffix: '',
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '67% open rate',
      trendUp: true,
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {cards.map((card) => (
        <motion.div key={card.label} variants={staggerItem}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.02] to-transparent rounded-bl-full" />
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div>
              <AnimatedCounter
                value={card.value}
                prefix={card.prefix}
                suffix={card.suffix}
                className={`text-3xl font-extrabold text-text-primary`}
              />
              <p className="text-sm text-text-secondary mt-1">{card.label}</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-xs font-semibold text-success">{card.trend}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
