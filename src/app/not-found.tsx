import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">404</p>
      <h1 className="font-display italic text-5xl lg:text-6xl text-ink mb-4">
        Page not found
      </h1>
      <p className="text-muted text-lg max-w-sm mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-ink text-white font-medium px-6 py-3 rounded-lg hover:bg-ink/90 transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
