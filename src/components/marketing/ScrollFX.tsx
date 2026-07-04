'use client'

import { useEffect, useRef } from 'react'

export function ScrollFX() {
  const glowRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const bgTickRef = useRef(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const glowPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // ── SCROLL PROGRESS BAR ──
    function onScroll() {
      if (barRef.current) {
        const total = document.documentElement.scrollHeight - window.innerHeight
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0
        barRef.current.style.width = Math.min(pct, 100) + '%'
      }

      // ── SCROLL-REACTIVE BACKGROUND ──
      if (!bgTickRef.current) {
        bgTickRef.current = true
        requestAnimationFrame(() => {
          const progress = window.scrollY / Math.max(
            document.documentElement.scrollHeight - window.innerHeight, 1
          )
          const stops = [
            { y: 0,    r: 252, g: 250, b: 245 },
            { y: 0.15, r: 251, g: 248, b: 242 },
            { y: 0.30, r: 253, g: 249, b: 243 },
            { y: 0.50, r: 250, g: 248, b: 244 },
            { y: 0.70, r: 252, g: 250, b: 246 },
            { y: 0.85, r: 251, g: 249, b: 243 },
            { y: 1.00, r: 248, g: 246, b: 240 },
          ]
          let seg = 0
          for (let i = 0; i < stops.length - 1; i++) {
            if (progress >= stops[i].y && progress <= stops[i + 1].y) { seg = i; break }
          }
          const from = stops[seg]
          const to = stops[Math.min(seg + 1, stops.length - 1)]
          const t = from.y === to.y ? 0 : (progress - from.y) / (to.y - from.y)
          const lerp = (a: number, b: number) => Math.round(a + (b - a) * t)
          document.body.style.backgroundColor =
            `rgb(${lerp(from.r, to.r)},${lerp(from.g, to.g)},${lerp(from.b, to.b)})`
          bgTickRef.current = false
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // ── CURSOR GLOW (desktop only) ──
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (isTouch) {
      if (glowRef.current) glowRef.current.style.display = 'none'
      return
    }

    glowPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    mouseRef.current = { ...glowPosRef.current }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    document.addEventListener('mousemove', onMouseMove)

    let rafId: number
    function animGlow() {
      const gp = glowPosRef.current
      const mp = mouseRef.current
      gp.x += (mp.x - gp.x) * 0.07
      gp.y += (mp.y - gp.y) * 0.07
      if (glowRef.current) {
        glowRef.current.style.left = gp.x + 'px'
        glowRef.current.style.top = gp.y + 'px'
      }
      rafId = requestAnimationFrame(animGlow)
    }
    rafId = requestAnimationFrame(animGlow)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Scroll progress bar */}
      <div
        ref={barRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          height: 2, width: '0%',
          background: 'linear-gradient(90deg, #F5780A 0%, #FFB347 100%)',
          zIndex: 9999, pointerEvents: 'none',
          transition: 'width 0.08s linear',
        }}
      />
      {/* Cursor glow */}
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,120,10,0.07) 0%, transparent 65%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1,
          willChange: 'left, top',
          left: '-9999px', top: '-9999px',
        }}
      />
    </>
  )
}
