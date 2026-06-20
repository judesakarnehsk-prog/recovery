import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Twitter, Linkedin, Copy } from 'lucide-react'
import { marked } from 'marked'
import { getAllPosts, getPost } from '@/lib/blog'
import { BlogEmailCapture } from '@/components/blog/BlogEmailCapture'
import { BlogShareButtons } from '@/components/blog/BlogShareButtons'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
    },
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  const htmlContent = marked(post.content, { async: false }) as string

  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Revorva', url: 'https://revorva.com' },
    datePublished: post.publishedAt,
    keywords: post.tags.join(', '),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleSchema }}
      />

      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <article className="lg:col-span-2">
              {/* Back link */}
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-8">
                <ArrowLeft className="w-3.5 h-3.5" />
                All posts
              </Link>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-cream border border-border text-muted capitalize">
                    {tag.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-4">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
                <span className="text-sm text-muted">{post.author}</span>
                <span className="text-border">·</span>
                <span className="text-sm text-muted">{formatDate(post.publishedAt)}</span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1 text-sm text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} read
                </span>
              </div>

              {/* Content */}
              <div
                className="prose prose-sm max-w-none text-muted leading-relaxed
                  prose-headings:text-ink prose-headings:font-display prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                  prose-p:mb-4 prose-p:leading-relaxed
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-ink prose-strong:font-semibold
                  prose-ul:my-4 prose-li:my-1
                  prose-hr:border-border prose-hr:my-8
                  prose-blockquote:border-l-accent prose-blockquote:bg-cream prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-muted
                  prose-code:text-accent prose-code:bg-cream prose-code:px-1 prose-code:rounded
                  prose-pre:bg-cream prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                  prose-table:border-collapse prose-th:bg-cream prose-th:font-semibold prose-th:text-ink prose-td:border prose-td:border-border prose-th:border prose-th:border-border"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Share */}
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm font-medium text-ink mb-3">Share this article</p>
                <BlogShareButtons title={post.title} />
              </div>

              {/* CTA */}
              <div className="mt-10 bg-ink rounded-2xl p-8 text-center">
                <h2 className="font-display text-2xl text-white mb-2">
                  Try Revorva free for 14 days
                </h2>
                <p className="text-white/60 text-sm mb-6">Connect Stripe in 2 minutes. Start recovering failed payments automatically.</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-accent text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors"
                >
                  Connect Stripe — Start Free
                </Link>
              </div>

              {/* Email capture */}
              <div className="mt-6">
                <BlogEmailCapture source={`blog_post_${post.slug}`} />
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-display text-xl text-ink mb-5">Related articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="flex items-start gap-4 p-4 bg-white border border-border rounded-xl hover:shadow-card transition-shadow"
                      >
                        <div>
                          <p className="font-medium text-ink text-sm mb-1">{related.title}</p>
                          <p className="text-xs text-muted">{related.readTime} read · {formatDate(related.publishedAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 self-start">
              <BlogEmailCapture source={`blog_sidebar_${post.slug}`} />
              <div className="bg-cream border border-border rounded-2xl p-6">
                <p className="text-sm font-semibold text-ink mb-2">Calculate your recovery</p>
                <p className="text-xs text-muted mb-3">See how much you&apos;re losing to failed payments every month.</p>
                <Link href="/tools/recovery-calculator" className="text-sm font-medium text-accent hover:underline">
                  Free calculator →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
