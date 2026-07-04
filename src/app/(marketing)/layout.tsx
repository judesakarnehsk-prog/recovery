import { Nav } from '@/components/marketing/Nav'
import { Footer } from '@/components/marketing/Footer'
import { ScrollFX } from '@/components/marketing/ScrollFX'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollFX />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
