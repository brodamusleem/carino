import { useEffect, useRef, useState } from 'react'
import { LETTER } from '../config'

interface Props { visible: boolean }

export default function FinalPage({ visible }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [show, setShow] = useState(false)

  /* Delay reveal slightly so transition feels intentional */
  useEffect(() => {
    if (!visible) { setShow(false); return }
    const t = setTimeout(() => setShow(true), 80)
    return () => clearTimeout(t)
  }, [visible])

  /* ── Sparkle canvas ── */
  useEffect(() => {
    if (!visible) return
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    let animId: number

    interface Spark {
      x: number; y: number; vx: number; vy: number
      size: number; alpha: number; decay: number
      color: string; twinkle: number; twinkleSpeed: number
    }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#c9a080','#c45b6a','#e89060','#f5e6d8','#e8c4a0','#ff9eb5']

    const makeSpark = (burst?: { x: number; y: number }): Spark => {
      const angle = Math.random() * Math.PI * 2
      const speed = burst ? Math.random() * 4 + 1 : Math.random() * 0.8 + 0.2
      return {
        x:           burst ? burst.x : Math.random() * canvas.width,
        y:           burst ? burst.y : Math.random() * canvas.height,
        vx:          burst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.5,
        vy:          burst ? Math.sin(angle) * speed : -(Math.random() * 0.4 + 0.1),
        size:        Math.random() * 3 + 0.8,
        alpha:       burst ? 1 : Math.random() * 0.7 + 0.1,
        decay:       burst ? Math.random() * 0.015 + 0.008 : 0,
        color:       COLORS[Math.floor(Math.random() * COLORS.length)],
        twinkle:     Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
      }
    }

    /* Ambient sparks */
    const sparks: Spark[] = []
    for (let i = 0; i < 120; i++) {
      const s = makeSpark()
      s.y = Math.random() * canvas.height
      sparks.push(s)
    }

    /* Burst sparks */
    const bursts: Spark[] = []
    const addBurst = () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height * 0.7
      for (let i = 0; i < 18; i++) bursts.push(makeSpark({ x, y }))
    }
    addBurst()
    const burstInterval = setInterval(addBurst, 2200)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      /* Ambient */
      for (const s of sparks) {
        s.x += s.vx; s.y += s.vy
        s.twinkle += s.twinkleSpeed
        if (s.y < -10) { Object.assign(s, makeSpark()); s.y = canvas.height + 5 }
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle))
        ctx.globalAlpha = a
        ctx.fillStyle   = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
      }

      /* Burst particles */
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i]
        b.x += b.vx; b.y += b.vy
        b.vy += 0.04  /* gravity */
        b.alpha -= b.decay
        if (b.alpha <= 0) { bursts.splice(i, 1); continue }
        ctx.globalAlpha = b.alpha
        ctx.fillStyle   = b.color
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.size * 1.3, 0, Math.PI * 2)
        ctx.fill()

        /* tiny star cross */
        ctx.strokeStyle = b.color
        ctx.lineWidth   = 0.8
        ctx.globalAlpha = b.alpha * 0.6
        ctx.beginPath()
        ctx.moveTo(b.x - b.size * 2, b.y)
        ctx.lineTo(b.x + b.size * 2, b.y)
        ctx.moveTo(b.x, b.y - b.size * 2)
        ctx.lineTo(b.x, b.y + b.size * 2)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      clearInterval(burstInterval)
      window.removeEventListener('resize', resize)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 25,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #1e0818 0%, #0a0608 65%)',
    }}>
      <style>{`
        @keyframes fpFadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes roseGlow {
          0%,100% { text-shadow:0 0 20px rgba(196,91,106,0.4), 0 0 40px rgba(196,91,106,0.2); transform:scale(1) rotate(-4deg); }
          50%     { text-shadow:0 0 40px rgba(196,91,106,0.7), 0 0 80px rgba(196,91,106,0.3); transform:scale(1.08) rotate(4deg); }
        }
        @keyframes ornamentPulse {
          0%,100% { opacity:0.35; letter-spacing:0.55em; }
          50%     { opacity:0.7;  letter-spacing:0.7em;  }
        }
        .letter-body p { margin-bottom: 1.1rem; }
        .letter-body p:last-child { margin-bottom: 0; }
      `}</style>

      {/* Sparkle canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Letter card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 'min(580px, 90vw)',
        maxHeight: '88vh',
        overflowY: 'auto',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
        /* hide scrollbar visually */
        scrollbarWidth: 'none',
      }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(30,10,24,0.92) 0%, rgba(18,6,16,0.96) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(205,140,90,0.2)',
          boxShadow: `
            0 60px 140px rgba(0,0,0,0.9),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.07),
            0 0 80px rgba(196,91,106,0.08)
          `,
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          backdropFilter: 'blur(12px)',
        }}>

          {/* Top ornament */}
          <p style={{
            textAlign: 'center', marginBottom: '1.8rem',
            fontSize: '1rem', color: '#c9a080',
            animation: 'ornamentPulse 3s ease-in-out infinite',
          }}>✦ ✦ ✦</p>

          {/* Rose */}
          <div style={{
            textAlign: 'center', fontSize: '3.2rem',
            marginBottom: '1.4rem',
            animation: 'roseGlow 4s ease-in-out infinite',
            display: 'block',
          }}>🌹</div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 300, fontStyle: 'italic',
            color: '#f5e6d8', textAlign: 'center',
            lineHeight: 1.3, marginBottom: '0.5rem',
            letterSpacing: '0.01em',
          }}>
            {LETTER.title}
          </h2>

          {/* Subtitle line */}
          <div style={{
            width: '60px', height: '1px', margin: '0 auto 2rem',
            background: 'linear-gradient(90deg, transparent, rgba(205,140,90,0.5), transparent)',
          }} />

          {/* Letter body */}
          <div
            className="letter-body"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1rem, 2.5vw, 1.18rem)',
              fontWeight: 300, lineHeight: 1.85,
              color: 'rgba(245,230,216,0.88)',
              textAlign: 'justify',
            }}
          >
            {LETTER.paragraphs.map((para, i) => (
              <p key={i} style={{
                animation: `fpFadeUp 0.8s ease ${(i * 0.15 + 0.3).toFixed(2)}s both`,
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* Sign-off */}
          <div style={{ marginTop: '2.2rem', textAlign: 'right' }}>
            <div style={{
              width: '80px', height: '1px', marginLeft: 'auto', marginBottom: '1rem',
              background: 'linear-gradient(90deg, transparent, rgba(205,140,90,0.4))',
            }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              fontStyle: 'italic', fontWeight: 300,
              color: '#c9a080', letterSpacing: '0.04em',
            }}>
              {LETTER.signoff}
            </p>
          </div>

          {/* Bottom ornament */}
          <p style={{
            textAlign: 'center', marginTop: '2rem',
            fontSize: '1rem', color: '#c9a080',
            animation: 'ornamentPulse 3s ease-in-out 1.5s infinite',
          }}>✦ ✦ ✦</p>
        </div>
      </div>
    </div>
  )
}
