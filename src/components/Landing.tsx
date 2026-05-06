import { useState } from 'react'

interface Props { onBegin: () => void }

export default function Landing({ onBegin }: Props) {
  const [exiting, setExiting] = useState(false)

  const handleClick = () => {
    setExiting(true)
    setTimeout(onBegin, 1100)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #2a1020 0%, #0a0608 70%)',
      transition: 'opacity 1.1s ease, transform 1.1s ease',
      opacity:   exiting ? 0 : 1,
      transform: exiting ? 'scale(1.07)' : 'scale(1)',
      pointerEvents: exiting ? 'none' : 'auto',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'roseFloat 3s ease-in-out infinite' }}>
        🌹
      </div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(2rem, 6vw, 3.8rem)',
        fontWeight: 300, color: '#f5e6d8',
        textAlign: 'center', lineHeight: 1.2,
        letterSpacing: '0.02em', marginBottom: '0.6rem',
      }}>
        For My Favourite Person
      </h1>
      <p style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: '0.85rem', fontWeight: 200,
        letterSpacing: '0.35em', textTransform: 'uppercase',
        color: '#c9a080', marginBottom: '3rem',
      }}>
        A love letter in light &amp; code
      </p>
      <button onClick={handleClick} style={{
        padding: '1rem 3.5rem',
        background: 'transparent',
        border: '1px solid rgba(205,160,110,0.5)',
        borderRadius: '60px', color: '#f5e6d8',
        fontFamily: "'Jost', sans-serif",
        fontSize: '0.85rem', fontWeight: 300,
        letterSpacing: '0.3em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.4s ease',
      }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(205,160,110,0.9)'
          ;(e.target as HTMLButtonElement).style.letterSpacing = '0.38em'
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(205,160,110,0.5)'
          ;(e.target as HTMLButtonElement).style.letterSpacing = '0.3em'
        }}
      >
        Begin Experience
      </button>

      <style>{`
        @keyframes roseFloat {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%      { transform: translateY(-12px) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
