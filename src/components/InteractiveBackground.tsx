'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================
// 1. Gradient Mesh — Animated blobs that respond to scroll
// ============================================================
export function GradientMesh({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <motion.div
        animate={{
          x: [0, 50, -30, 20, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -40, 30, -20, 0],
          y: [0, 30, -50, 20, 0],
          scale: [1, 0.9, 1.15, 0.95, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-[20%] -right-[10%] w-[55%] h-[55%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
    </div>
  )
}

// ============================================================
// 2. Grid Background — Animated grid with glow intersections
// ============================================================
export function GridBackground({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div className="absolute inset-0 grid-bg" />
      {/* Glow at center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

// ============================================================
// 3. Aurora Background — CSS-only flowing aurora bands
// ============================================================
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div className="aurora-container">
        <div className="aurora-band aurora-band-1" />
        <div className="aurora-band aurora-band-2" />
        <div className="aurora-band aurora-band-3" />
      </div>
    </div>
  )
}

// ============================================================
// 4. Floating Particles — Canvas-based particle system
// ============================================================
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  connections: number[]
}

export function FloatingParticles({
  className,
  count = 50,
  color = '109, 40, 217',
  connectDistance = 120,
}: {
  className?: string
  count?: number
  color?: string
  connectDistance?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef<number>(0)

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        connections: [],
      })
    }
    particlesRef.current = particles
  }, [count])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      initParticles(rect.width, rect.height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse interaction — gentle attraction
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.02
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Apply velocity with damping
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.vy *= 0.99

        // Wrap around edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const cdx = p.x - p2.x
          const cdy = p.y - p2.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

          if (cdist < connectDistance) {
            const lineOpacity = (1 - cdist / connectDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${color}, ${lineOpacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [color, connectDistance, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-auto', className)}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

// ============================================================
// 5. Mouse Glow — Follows cursor with a soft radial gradient
// ============================================================
export function MouseGlow({ className }: { className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 20 })
  const springY = useSpring(y, { stiffness: 150, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  return (
    <motion.div
      className={cn('fixed pointer-events-none z-[1] mix-blend-soft-light', className)}
      style={{
        x: useTransform(springX, (v) => v - 200),
        y: useTransform(springY, (v) => v - 200),
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109, 40, 217, 0.15) 0%, transparent 70%)',
      }}
    />
  )
}

// ============================================================
// 6. Noise Texture — Subtle grain overlay for premium feel
// ============================================================
export function NoiseTexture({ className, opacity = 0.03 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  )
}

// ============================================================
// 7. Beam Lines — Animated light beams crossing the viewport
// ============================================================
export function BeamLines({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        className="absolute top-[20%] w-[200px] h-[1px] rotate-[35deg]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(109, 40, 217, 0.15), transparent)',
        }}
      />
      <motion.div
        animate={{ x: ['200%', '-100%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
        className="absolute top-[60%] w-[300px] h-[1px] rotate-[-25deg]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.12), transparent)',
        }}
      />
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear', repeatDelay: 6 }}
        className="absolute top-[80%] w-[150px] h-[1px] rotate-[15deg]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(109, 40, 217, 0.10), transparent)',
        }}
      />
    </div>
  )
}
