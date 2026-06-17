import React from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  color: string
  pulseR: number; pulseMax: number; isPulser: boolean
}

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#7dd3fc', '#a5f3fc', '#c7d2fe']

export default function AnimatedBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c   = canvas  // non-null alias for nested fns
    const ctx = c.getContext('2d')!
    let animId: number
    let particles: Particle[] = []

    function resize() {
      c.width  = window.innerWidth
      c.height = window.innerHeight
      init()
    }

    function init() {
      const count = Math.min(140, Math.floor((c.width * c.height) / 9000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.3) * 0.55,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.2 + 0.5,
        opacity: Math.random() * 0.65 + 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulseR: Math.random() * 50,
        pulseMax: Math.random() * 55 + 25,
        isPulser: Math.random() < 0.12,
      }))
    }

    function drawGrid() {
      const g = 70
      ctx.strokeStyle = 'rgba(56,189,248,0.035)'
      ctx.lineWidth = 1
      for (let x = 0; x <= c.width; x += g) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke()
      }
      for (let y = 0; y <= c.height; y += g) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke()
      }
    }

    function drawGlowOrbs() {
      const orbs = [
        { x: c.width * 0.15, y: c.height * 0.3,  r: 180, color: '59,130,246' },
        { x: c.width * 0.82, y: c.height * 0.65, r: 220, color: '99,102,241' },
        { x: c.width * 0.5,  y: c.height * 0.1,  r: 150, color: '6,182,212' },
      ]
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        g.addColorStop(0,   `rgba(${o.color},0.10)`)
        g.addColorStop(0.5, `rgba(${o.color},0.04)`)
        g.addColorStop(1,   `rgba(${o.color},0)`)
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })
    }

    function drawConnections() {
      const maxDist = 130
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.28
            ctx.beginPath()
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`
            ctx.lineWidth   = 0.7
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    function drawParticles() {
      particles.forEach(p => {
        // Pulse ring
        if (p.isPulser && p.pulseR > 2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.pulseR, 0, Math.PI * 2)
          ctx.strokeStyle = `${p.color}${Math.floor((1 - p.pulseR / p.pulseMax) * 80).toString(16).padStart(2,'0')}`
          ctx.lineWidth   = 1.2
          ctx.stroke()
        }
        // Soft glow halo
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        halo.addColorStop(0,   p.color + '50')
        halo.addColorStop(1,   p.color + '00')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()
        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }

    function update() {
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        // Soft wrap
        if (p.x < -30) p.x = c.width  + 30
        if (p.x > c.width  + 30) p.x = -30
        if (p.y < -30) p.y = c.height + 30
        if (p.y > c.height + 30) p.y = -30
        // Micro-turbulence
        p.vx += (Math.random() - 0.5) * 0.015
        p.vy += (Math.random() - 0.5) * 0.015
        p.vx  = Math.max(-1.2, Math.min(1.2, p.vx))
        p.vy  = Math.max(-0.9, Math.min(0.9, p.vy))
        // Pulse expand
        if (p.isPulser) {
          p.pulseR += 0.45
          if (p.pulseR > p.pulseMax) p.pulseR = 0
        }
      })
    }

    function loop() {
      ctx.clearRect(0, 0, c.width, c.height)
      drawGrid()
      drawGlowOrbs()
      drawConnections()
      drawParticles()
      update()
      animId = requestAnimationFrame(loop)
    }

    resize()
    loop()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #020917 0%, #091628 35%, #0d1f42 65%, #060e22 100%)',
        zIndex: 0,
      }}
    />
  )
}
