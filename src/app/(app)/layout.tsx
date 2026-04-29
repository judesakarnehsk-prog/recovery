import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for display name / email
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, company_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar userEmail={profile?.email ?? user.email} avatarUrl={profile?.avatar_url ?? undefined} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
