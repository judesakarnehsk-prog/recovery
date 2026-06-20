import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { getAllPosts } from '@/lib/blog'
import { BlogEmailCapture } from '@/components/blog/BlogEmailCapture'

export const metadata: Metadata = {
  title: 'Blog — SaaS Payment Recovery',
  description: 'Insights on involuntary churn, dunning, and recovering failed Stripe payments for SaaS founders.',
  openGraph: {
    title: 'Revorva Blog — SaaS Payment Recovery',
    description: 'Insights on involuntary churn, dunning, and recovering failed Stripe payments for SaaS founders.',
  },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">Blog</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-4">
            SaaS payment recovery
          </h1>
          <p className="text-lg text-muted max-w-xl">
            Practical guides on involuntary churn, dunning sequences, and recovering revenue from failed payments.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Post list */}
          <div className="lg:col-span-2 space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white border border-border rounded-2xl p-6 hover:shadow-elevated transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-cream border border-border text-muted capitalize">
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-muted ml-auto">
                    <Clock className="w-3 h-3" />
                    {post.readTime} read
                  </span>
                </div>
                <h2 className="font-display text-xl text-ink mb-2 leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">{formatDate(post.publishedAt)} · {post.author}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:gap-2 transition-all"
                  >
                    Read more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <BlogEmailCapture />
            <div className="bg-ink rounded-2xl p-6">
              <p className="font-semibold text-white mb-2">Free recovery calculator</p>
              <p className="text-sm text-white/60 mb-4">See exactly how much you&apos;re losing to failed payments every month.</p>
              <Link href="/tools/recovery-calculator" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:gap-2 transition-all">
                Calculate now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
