import { useEffect, useRef, useState } from 'react'
import { Slide } from '../config'

interface Props {
  slide: Slide
  entering: boolean
}

export default function Card3D({ slide, entering }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imgErr, setImgErr] = useState(false)

  useEffect(() => { setImgErr(false) }, [slide])

  /* 3D tilt on mouse / touch */
  useEffect(() => {
    let curX = 0, curY = 0, tX = 0, tY = 0
    let rafId: number

    const onMove = (cx: number, cy: number) => {
      const wcx = window.innerWidth  / 2
      const wcy = window.innerHeight / 2
      tX = (cy - wcy) / wcy * -11
      tY = (cx - wcx) / wcx *  11
    }

    const onMouse = (e: MouseEvent)      => onMove(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent)      => onMove(e.touches[0].clientX, e.touches[0].clientY)

    const loop = () => {
      curX += (tX - curX) * 0.07
      curY += (tY - curY) * 0.07
      if (cardRef.current)
        cardRef.current.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`
      rafId = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes slideEnter {
          from { opacity:0; transform:translateY(32px) scale(0.95); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes photoShimmer {
          0%   { background-position: 200% 200%; }
          100% { background-position:-200%-200%; }
        }
        .card-photo-img { transition: transform 0.7s ease; }
        .card-surface:hover .card-photo-img { transform: scale(1.04); }
      `}</style>

      <div style={{ perspective: '1300px', width: 'min(370px, 86vw)' }}>
        <div ref={cardRef} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>

          {/* Card surface */}
          <div className="card-surface" style={{
            position: 'relative',
            background: '#160c12',
            borderRadius: '20px',
            border: '1px solid rgba(205,140,90,0.18)',
            overflow: 'hidden',
            boxShadow: `
              0 60px 130px rgba(0,0,0,0.85),
              0 0 0 1px rgba(255,255,255,0.04),
              inset 0 1px 0 rgba(255,255,255,0.07)
            `,
            animation: entering ? 'slideEnter 0.75s cubic-bezier(0.4,0,0.2,1) both' : 'none',
          }}>

            {/* Photo area */}
            <div style={{
              position: 'relative', width: '100%',
              aspectRatio: '3/4', overflow: 'hidden',
            }}>
              {slide.img && !imgErr ? (
                <img
                  src={slide.img}
                  alt="Birthday"
                  className="card-photo-img"
                  onError={() => setImgErr(true)}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block',
                  }}
                />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #1c0f18 0%, #2a1520 50%, #1c0f18 100%)',
                }}>
                  <span style={{ fontSize: '3.5rem', opacity: 0.55 }}>🌹</span>
                  <span style={{
                    fontFamily: "'Jost',sans-serif", fontSize: '0.8rem',
                    fontWeight: 200, letterSpacing: '0.2em',
                    color: 'rgba(255,255,255,0.3)',
                  }}>Your Photo Here</span>
                  <span style={{
                    fontFamily: "'Jost',sans-serif", fontSize: '0.62rem',
                    fontWeight: 200, letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.18)', textAlign: 'center', padding: '0 1rem',
                  }}>Set img: 'url' in src/config.ts</span>
                </div>
              )}

              {/* Shimmer */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
                background: 'linear-gradient(135deg, transparent 35%, rgba(255,210,170,0.07) 50%, transparent 65%)',
                backgroundSize: '200% 200%',
                animation: 'photoShimmer 4s ease infinite',
              }} />

              {/* Vignette */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
                background: 'linear-gradient(to bottom, transparent 55%, rgba(22,12,18,0.75) 100%)',
              }} />
            </div>

            {/* Footer */}
            <div style={{ padding: '1.3rem 1.6rem 1.5rem', position: 'relative' }}>
              {/* Divider */}
              <div style={{
                position: 'absolute', top: 0, left: '1.6rem', right: '1.6rem', height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(205,140,90,0.35), transparent)',
              }} />
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(1.05rem, 3vw, 1.3rem)',
                fontWeight: 300, fontStyle: 'italic',
                color: '#f5e6d8', lineHeight: 1.55, textAlign: 'center',
              }}>
                {slide.msg}
              </p>
              <p style={{
                textAlign: 'center', marginTop: '0.75rem',
                fontSize: '0.9rem', letterSpacing: '0.55em',
                color: '#c9a080', opacity: 0.4,
              }}>✦ ✦ ✦</p>
            </div>

            {/* Gloss */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '20px', pointerEvents: 'none',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
            }} />
          </div>
        </div>
      </div>
    </>
  )
}
