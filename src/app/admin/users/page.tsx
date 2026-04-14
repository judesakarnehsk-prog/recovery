'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { AuthenticatedNav } from '@/components/AuthenticatedNav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface AdminUser {
  id: string
  email: string
  full_name: string
  plan: string
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const profileRes = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
    if (profileRes.data) {
      setUserName(profileRes.data.full_name || '')
      setUserEmail(profileRes.data.email || user.email || '')
    }

    const res = await fetch('/api/admin/stats')
    if (!res.ok) { setError('Access denied.'); setLoading(false); return }
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav userName={userName} userEmail={userEmail} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin" className="text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">All Users</h1>
            <p className="text-sm text-text-secondary mt-1">{users.length} registered users</p>
          </div>
        </div>

        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-6 font-medium text-text-secondary">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Plan</th>
                      <th className="text-right py-3 px-6 font-medium text-text-secondary">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-text-secondary text-sm">
                          No users found.
                        </td>
                      </tr>
                    ) : filtered.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-6 font-medium text-text-primary">{u.full_name || '—'}</td>
                        <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={u.plan === 'scale' ? 'accent' : u.plan === 'growth' ? 'default' : 'success'}>
                            {u.plan || 'free'}
                          </Badge>
                        </td>
                        <td className="py-3 px-6 text-right text-text-secondary">
                          {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
