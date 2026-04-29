// Legacy component — replaced by Sidebar in (app) route group layout.
// Kept as stub to avoid breaking admin/flat pages during transition.
'use client'

import Link from 'next/link'

interface AuthenticatedNavProps {
  userName?: string
  userEmail?: string
}

export function AuthenticatedNav({ userName, userEmail }: AuthenticatedNavProps) {
  return (
    <header className="bg-white border-b border-border h-14 flex items-center px-6">
      <Link href="/dashboard" className="text-base font-bold text-ink font-sans">
        Revorva<span className="text-accent">.</span>
      </Link>
    </header>
  )
}
