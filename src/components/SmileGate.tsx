import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  visible: boolean
  onUnlock: () => void
}

export default function SmileGate({ visible, onUnlock }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const rafRef      = useRef<number>(0)
  const streamRef   = useRef<MediaStream | null>(null)
  const prevBrightRef = useRef<number[]>([])
  const holdRef     = useRef<number>(0)

  const [progress,  setProgress]  = useState(0)
  const [status,    setStatus]    = useState('Opening camera…')
  const [tapReady,  setTapReady]  = useState(false)

  // Show tap button after 4 seconds as guaranteed fallback
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setTapReady(true), 4000)
    return () => clearTimeout(t)
  }, [visible])

  /* ── Smile detection via canvas pixel brightness analysis ──
     When someone smiles, the lower half of their face brightens
     (teeth visible) and the cheek regions expand outward.
     We measure average brightness of the lower-center face zone
     over multiple frames and look for a sustained bright peak.
  */
  const detect = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    const W = 160, H = 120
    canvas.width = W; canvas.height = H

    ctx.save()
    ctx.translate(W, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, W, H)
    ctx.restore()

    // Sample the lower-center region of the face (approx mouth area)
    // Assumes face is centred and fills most of the frame
    const rx = Math.floor(W * 0.3)
    const ry = Math.floor(H * 0.52)
    const rw = Math.floor(W * 0.4)
    const rh = Math.floor(H * 0.25)

    const data = ctx.getImageData(rx, ry, rw, rh).data
    let brightness = 0
    const pixels = rw * rh
    for (let i = 0; i < data.length; i += 4) {
      // Perceptual luminance
      brightness += 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
    }
    brightness /= pixels // 0–255

    // Also sample upper region (forehead) as baseline
    const bx = Math.floor(W * 0.3)
    const by = Math.floor(H * 0.1)
    const bw = Math.floor(W * 0.4)
    const bh = Math.floor(H * 0.15)
    const bData = ctx.getImageData(bx, by, bw, bh).data
    let baseBrightness = 0
    const bPixels = bw * bh
    for (let i = 0; i < bData.length; i += 4) {
      baseBrightness += 0.299 * bData[i] + 0.587 * bData[i+1] + 0.114 * bData[i+2]
    }
    baseBrightness /= bPixels

    // Smile score: how much brighter is mouth zone vs forehead
    // Smiling with teeth creates a brightness spike in lower face
    const ratio = brightness / Math.max(baseBrightness, 1)

    // Smooth over last 8 frames
    const history = prevBrightRef.current
    history.push(ratio)
    if (history.length > 8) history.shift()
    const avg = history.reduce((a, b) => a + b, 0) / history.length

    // Calibrate: neutral ~0.85–1.05, big smile with teeth ~1.15–1.4+
    const SMILE_MIN = 1.08
    const SMILE_MAX = 1.45
    const score = Math.max(0, Math.min(1, (avg - SMILE_MIN) / (SMILE_MAX - SMILE_MIN)))

    setProgress(score)

    if (score > 0.65) {
      holdRef.current += 1
      if (holdRef.current >= 10) { // hold smile for ~10 frames
        onUnlock()
        return
      }
    } else {
      holdRef.current = Math.max(0, holdRef.current - 1)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [onUnlock])

  /* Start camera */
  useEffect(() => {
    if (!visible) return
    let active = true

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const v = videoRef.current!
        v.srcObject = stream
        await v.play()
        setStatus('Smile to unlock ✨')
        rafRef.current = requestAnimationFrame(detect)
      } catch {
        setStatus('Tap to continue')
        setTapReady(true)
      }
    })()

    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [visible, detect])

  if (!visible) return null

  const sparklePositions = [
    { top: '-4%',    left: '50%'   },
    { top: '8%',     right: '-4%'  },
    { top: '50%',    right: '-6%'  },
    { bottom: '6%',  right: '2%'   },
    { bottom: '-4%', left: '48%'   },
    { bottom: '6%',  left: '2%'    },
    { top: '50%',    left: '-6%'   },
    { top: '8%',     left: '-4%'   },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 15,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '2rem',
      background: 'radial-gradient(ellipse at 50% 40%, #1e0a18 0%, #0a0608 75%)',
      animation: 'sgFadeIn 0.8s ease forwards',
    }}>
      <style>{`
        @keyframes sgFadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes ringPulse     { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.03);opacity:1} }
        @keyframes depthPulse    { 0%,100%{opacity:.5;transform:scale(.98)} 50%{opacity:1;transform:scale(1.01)} }
        @keyframes mirrorShimmer { from{opacity:.4;transform:rotate(0deg)} to{opacity:1;transform:rotate(8deg)} }
        @keyframes sparkleDrift  { 0%{opacity:0;transform:scale(.5) translateY(0)} 30%{opacity:1;transform:scale(1.2) translateY(-4px)} 60%{opacity:.7} 100%{opacity:0;transform:scale(.8) translateY(-10px)} }
        @keyframes tapPulse      { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(196,91,106,0.4)} 50%{transform:scale(1.03);box-shadow:0 0 0 12px rgba(196,91,106,0)} }
      `}</style>

      {/* Hidden canvas for pixel analysis */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Mirror scene */}
      <div style={{
        position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        width: 'min(320px, 78vw)', height: 'min(320px, 78vw)',
      }}>
        {/* Glow rings */}
        {[
          { size: '100%', delay: '0s',   op: 0.15, shadow: '0 0 60px rgba(196,91,106,0.08)' },
          { size: '88%',  delay: '0.6s', op: 0.20, shadow: 'none' },
          { size: '76%',  delay: '1.2s', op: 0.25, shadow: 'none' },
        ].map((r, i) => (
          <div key={i} style={{
            position: 'absolute', width: r.size, height: r.size,
            borderRadius: '50%', border: `1px solid rgba(201,160,128,${r.op})`,
            boxShadow: r.shadow,
            animation: `ringPulse 4s ease-in-out ${r.delay} infinite`,
          }} />
        ))}

        {/* Mirror frame */}
        <div style={{
          position: 'relative', width: '72%', height: '72%',
          borderRadius: '50%', overflow: 'hidden',
          boxShadow: `
            0 0 0 2px rgba(201,160,128,0.6),
            0 0 0 6px rgba(120,70,50,0.35),
            0 0 0 10px rgba(80,40,30,0.25),
            0 0 0 14px rgba(201,160,128,0.1),
            0 0 60px rgba(196,91,106,0.25),
            inset 0 0 40px rgba(0,0,0,0.7)`,
        }}>
          {/* Depth layers */}
          {[
            { inset:'8%',  delay:'0s',   bg:'rgba(30,10,24,0.3)' },
            { inset:'16%', delay:'0.4s', bg:'rgba(20,8,18,0.4)'  },
            { inset:'24%', delay:'0.8s', bg:'rgba(15,6,14,0.5)'  },
            { inset:'32%', delay:'1.2s', bg:'rgba(10,4,10,0.6)'  },
          ].map((l, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: l.inset, left: l.inset, right: l.inset, bottom: l.inset,
              borderRadius: '50%',
              border: '1px solid rgba(201,160,128,0.12)',
              background: l.bg,
              animation: `depthPulse 6s ease-in-out ${l.delay} infinite`,
            }} />
          ))}

          <video ref={videoRef} muted playsInline style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', transform: 'scaleX(-1)',
            borderRadius: '50%',
            filter: 'sepia(20%) contrast(1.05) brightness(0.9)',
          }} />

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', zIndex: 2,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10,6,8,0.55) 75%, rgba(10,6,8,0.88) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Shimmer */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', zIndex: 3,
            background: 'linear-gradient(135deg, rgba(255,220,180,0.06) 0%, transparent 40%, transparent 60%, rgba(255,200,160,0.04) 100%)',
            animation: 'mirrorShimmer 5s ease-in-out infinite alternate',
            pointerEvents: 'none',
          }} />

          {/* Smile progress bar */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '50%',
            transform: 'translateX(-50%)', zIndex: 4,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px', width: '70%',
          }}>
            <p style={{
              fontFamily: "'Jost',sans-serif", fontSize: '0.65rem',
              fontWeight: 200, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(201,160,128,0.85)', whiteSpace: 'nowrap',
            }}>{status}</p>
            <div style={{
              width: '100%', height: '3px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '4px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progress * 100}%`,
                background: 'linear-gradient(90deg,#c45b6a,#e89060)',
                borderRadius: '4px', transition: 'width 0.12s ease',
                boxShadow: '0 0 8px rgba(196,91,106,0.7)',
              }} />
            </div>
          </div>
        </div>

        {/* Sparkles */}
        {sparklePositions.map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos,
            color: '#c9a080', fontSize: '0.7rem',
            animation: `sparkleDrift 4s ease-in-out ${(i*0.5).toFixed(1)}s infinite`,
          }}>✦</div>
        ))}
      </div>

      {/* Tap to unlock fallback — always shown after 4s */}
      {tapReady && (
        <button onClick={onUnlock} style={{
          padding: '0.85rem 2.8rem',
          background: 'transparent',
          border: '1px solid rgba(196,91,106,0.5)',
          borderRadius: '60px', color: '#f5e6d8',
          fontFamily: "'Jost',sans-serif",
          fontSize: '0.8rem', fontWeight: 200,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          cursor: 'pointer',
          animation: 'tapPulse 2s ease-in-out infinite',
          transition: 'background 0.3s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,91,106,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Tap to Continue →
        </button>
      )}
    </div>
  )
}
