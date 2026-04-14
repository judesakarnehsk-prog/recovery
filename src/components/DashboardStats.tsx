'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ExternalLink, CheckCircle2, XCircle, Clock, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { formatCurrencyPrecise, getFailureReason, getStepLabel } from '@/lib/utils'

interface Recovery {
  id: string
  payment_intent_id: string
  amount: number
  status: 'recovered' | 'pending' | 'failed' | 'email_sent'
  recovered_at: string | null
  email_step: number
  customer_email?: string
  failure_reason?: string
  created_at: string
}

const mockRecoveries: Recovery[] = [
  {
    id: '1',
    payment_intent_id: 'pi_3Q1abc...',
    amount: 4900,
    status: 'recovered',
    recovered_at: '2025-01-15T10:30:00Z',
    email_step: 2,
    customer_email: 'sarah@example.com',
    failure_reason: 'insufficient_funds',
    created_at: '2025-01-13T08:00:00Z',
  },
  {
    id: '2',
    payment_intent_id: 'pi_3Q2def...',
    amount: 9900,
    status: 'email_sent',
    recovered_at: null,
    email_step: 1,
    customer_email: 'mike@startup.io',
    failure_reason: 'card_declined',
    created_at: '2025-01-15T14:00:00Z',
  },
  {
    id: '3',
    payment_intent_id: 'pi_3Q3ghi...',
    amount: 2900,
    status: 'pending',
    recovered_at: null,
    email_step: 3,
    customer_email: 'alex@company.co',
    failure_reason: 'expired_card',
    created_at: '2025-01-14T09:00:00Z',
  },
  {
    id: '4',
    payment_intent_id: 'pi_3Q4jkl...',
    amount: 19900,
    status: 'recovered',
    recovered_at: '2025-01-12T16:45:00Z',
    email_step: 1,
    customer_email: 'team@bigcorp.com',
    failure_reason: 'authentication_required',
    created_at: '2025-01-11T10:00:00Z',
  },
  {
    id: '5',
    payment_intent_id: 'pi_3Q5mno...',
    amount: 7900,
    status: 'failed',
    recovered_at: null,
    email_step: 3,
    customer_email: 'jen@store.com',
    failure_reason: 'do_not_honor',
    created_at: '2025-01-10T12:00:00Z',
  },
]

const statusConfig = {
  recovered: { label: 'Recovered', variant: 'success' as const, icon: CheckCircle2 },
  pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
  failed: { label: 'Failed', variant: 'error' as const, icon: XCircle },
  email_sent: { label: 'Email Sent', variant: 'accent' as const, icon: Mail },
}

export function DashboardStats({ recoveries }: { recoveries?: Recovery[] }) {
  const data = recoveries || mockRecoveries

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Recent Recoveries</h2>
          <Badge variant="default">{data.length} total</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Email Step</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((recovery, index) => {
              const status = statusConfig[recovery.status]
              const StatusIcon = status.icon

              return (
                <motion.tr
                  key={recovery.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border transition-colors hover:bg-background/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {(recovery.customer_email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {recovery.customer_email || 'Unknown'}
                        </p>
                        <p className="text-xs text-text-secondary font-mono">
                          {recovery.payment_intent_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-text-primary">
                      {formatCurrencyPrecise(recovery.amount / 100)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-secondary">
                      {getFailureReason(recovery.failure_reason)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-secondary">
                      {getStepLabel(recovery.email_step)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-secondary">
                      {format(new Date(recovery.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  )
}
