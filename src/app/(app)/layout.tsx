import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, company_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ background: 'var(--bg, #080808)', minHeight: '100vh', fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
      <Sidebar userEmail={profile?.email ?? user.email} avatarUrl={profile?.avatar_url ?? undefined} />
      <main style={{ marginLeft: 220, minHeight: '100vh', background: 'var(--bg, #080808)', paddingTop: 32 }}>
        {children}
      </main>
    </div>
  )
}
