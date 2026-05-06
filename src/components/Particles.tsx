import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; size: number
  vx: number; vy: number; alpha: number; color: string
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const make = (): Particle => ({
      x:     Math.random() * canvas.width,
      y:     canvas.height + Math.random() * 40,
      size:  Math.random() * 2.5 + 0.4,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    -(Math.random() * 0.55 + 0.18),
      alpha: Math.random() * 0.45 + 0.08,
      color: Math.random() > 0.5 ? '#c9a080' : '#c45b6a',
    })

    for (let i = 0; i < 90; i++) {
      const p = make()
      p.y = Math.random() * canvas.height
      particles.push(p)
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) Object.assign(p, make())
        ctx.globalAlpha = p.alpha
        ctx.fillStyle   = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
