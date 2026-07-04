'use client'

import { useEffect, useRef } from 'react'

interface Particle { x: number; y: number; r: number; dx: number; dy: number; o: number }

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    let pts: Particle[] = []
    let rafId: number
    let resizeTimer: ReturnType<typeof setTimeout>

    function resize() {
      W = canvas!.width = canvas!.offsetWidth
      H = canvas!.height = canvas!.offsetHeight
    }

    function init(n: number) {
      pts = []
      for (let i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.1 + 0.25,
          dx: (Math.random() - 0.5) * 0.28,
          dy: (Math.random() - 0.5) * 0.28,
          o: Math.random() * 0.35 + 0.08,
        })
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      for (const p of pts) {
        p.x += p.dx
        p.y += p.dy
        if (p.x < -2) p.x = W + 2
        if (p.x > W + 2) p.x = -2
        if (p.y < -2) p.y = H + 2
        if (p.y > H + 2) p.y = -2
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(201,74,31,${p.o})`
        ctx!.fill()
      }
      rafId = requestAnimationFrame(draw)
    }

    resize()
    init(55)
    draw()

    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => { resize(); init(55) }, 200)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0, opacity: 0.5,
      }}
      aria-hidden="true"
    />
  )
}
