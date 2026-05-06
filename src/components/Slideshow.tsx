import { useEffect, useRef, useState, useCallback } from 'react'
import { SLIDES, MUSIC_URL, SLIDE_DURATION_SECONDS } from '../config'
import Card3D from './Card3D'
import FinalPage from './FinalPage'

interface Props { visible: boolean }

// Total "steps" = slides + 1 final page
// idx 0..SLIDES.length-1 → photo cards
// idx SLIDES.length       → final letter

export default function Slideshow({ visible }: Props) {
  const TOTAL = SLIDES.length + 1          // slides + letter page
  const FINAL = SLIDES.length              // index of letter page

  const [idx,      setIdx]      = useState(0)
  const [entering, setEntering] = useState(true)
  const [muted,    setMuted]    = useState(false)
  const [progress, setProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef   = useRef<number>(0)
  const startRef = useRef<number>(0)

  const isFinal = idx === FINAL

  /* Init audio */
  useEffect(() => {
    const a = new Audio(MUSIC_URL)
    a.loop = true; a.volume = 0.45
    audioRef.current = a
    return () => { a.pause() }
  }, [])

  useEffect(() => {
    if (visible) audioRef.current?.play().catch(() => {})
  }, [visible])

  /* Timer — rAF progress + auto-advance
     On the final page we still run the bar (loops back to slide 0) */
  const startTimer = useCallback((currentIdx: number) => {
    cancelAnimationFrame(rafRef.current)
    setProgress(0)
    startRef.current = performance.now()
    const duration = SLIDE_DURATION_SECONDS * 1000

    const tick = (now: number) => {
      const pct = Math.min((now - startRef.current) / duration, 1)
      setProgress(pct)
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        /* On final page — stop auto-advance, just stay */
        if (currentIdx === FINAL) {
          setProgress(1)
          return
        }
        setEntering(false)
        setTimeout(() => {
          setIdx(prev => {
            const next = prev + 1   // advances to FINAL after last slide
            setEntering(true)
            startTimer(next)
            return next
          })
        }, 60)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [FINAL]) // eslint-disable-line

  useEffect(() => {
    if (!visible) return
    startTimer(0)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible, startTimer])

  const goTo = (i: number) => {
    cancelAnimationFrame(rafRef.current)
    setEntering(false)
    setTimeout(() => {
      setIdx(i)
      setEntering(true)
      startTimer(i)
    }, 60)
  }

  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) { a.play(); setMuted(false) }
    else          { a.pause(); setMuted(true)  }
  }

  if (!visible) return null

  return (
    <>
      {/* ── SLIDE VIEW (hidden when on final page) ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0608',
        animation: 'ssIn 1s ease forwards',
        opacity: isFinal ? 0 : 1,
        pointerEvents: isFinal ? 'none' : 'auto',
        transition: 'opacity 0.8s ease',
      }}>
        <style>{`@keyframes ssIn { from{opacity:0} to{opacity:1} }`}</style>
        {!isFinal && <Card3D slide={SLIDES[idx]} entering={entering} />}
      </div>

      {/* ── FINAL LETTER PAGE ── */}
      <FinalPage visible={isFinal} />

      {/* ── PROGRESS BAR (always on top, hidden on final page) ── */}
      {!isFinal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #c45b6a, #e89060, #c9a080)',
          transformOrigin: 'left',
          transform: `scaleX(${progress})`,
          boxShadow: '0 0 8px rgba(196,91,106,0.55)',
          zIndex: 100,
          transition: 'transform 0.1s linear',
        }} />
      )}

      {/* ── MUSIC TOGGLE (always visible) ── */}
      <button onClick={toggleMute} title="Toggle music" style={{
        position: 'fixed', top: '24px', right: '24px',
        zIndex: 200,
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(205,140,90,0.3)',
        cursor: 'pointer', color: '#c9a080', fontSize: '1.15rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s ease',
        opacity: muted ? 0.3 : 1,
      }}>
        {muted ? '♩' : '♫'}
      </button>

      {/* ── NAV DOTS (slides + final page dot) ── */}
      <div style={{
        position: 'fixed', bottom: '36px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '10px', zIndex: 200,
      }}>
        {Array.from({ length: TOTAL }).map((_, i) => {
          const isActive  = i === idx
          const isFinalDot = i === FINAL
          return (
            <button key={i} onClick={() => goTo(i)} style={{
              width:  isActive ? '24px' : '6px',
              height: '6px',
              borderRadius: isActive ? '3px' : '50%',
              background: isActive
                ? (isFinalDot ? '#c45b6a' : '#c9a080')
                : 'rgba(255,255,255,0.18)',
              border: `1px solid ${isActive
                ? (isFinalDot ? '#c45b6a' : '#c9a080')
                : 'rgba(255,255,255,0.1)'}`,
              boxShadow: isActive
                ? `0 0 8px rgba(${isFinalDot ? '196,91,106' : '201,160,128'},0.5)`
                : 'none',
              cursor: 'pointer', padding: 0,
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              /* Final dot is a heart shape via content trick — we use a slightly bigger size */
              fontSize: isFinalDot ? '6px' : undefined,
            }}
              title={isFinalDot ? 'Letter 💌' : `Photo ${i + 1}`}
            />
          )
        })}
      </div>
    </>
  )
}
