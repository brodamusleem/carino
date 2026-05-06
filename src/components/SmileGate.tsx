import { useEffect, useRef, useState, useCallback } from 'react'
import { SMILE_THRESHOLD } from '../config'

interface Props {
  visible: boolean
  onUnlock: () => void
}

// Pinned version — never use @latest in production
const MEDIAPIPE_VERSION = '0.10.14'
const MEDIAPIPE_ESM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/+esm`
const MEDIAPIPE_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export default function SmileGate({ visible, onUnlock }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const rafRef     = useRef<number>(0)
  const landmarker = useRef<any>(null)
  const streamRef  = useRef<MediaStream | null>(null)

  const [progress, setProgress] = useState(0)
  const [loaded,   setLoaded]   = useState(false)
  const [status,   setStatus]   = useState('Initialising…')

  /* Load MediaPipe once — GPU first, CPU fallback */
  useEffect(() => {
    let cancelled = false

    const tryLoad = async (delegate: 'GPU' | 'CPU') => {
      const { FaceLandmarker, FilesetResolver } = await import(
        /* @vite-ignore */
        MEDIAPIPE_ESM
      )
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM)
      if (cancelled) return
      landmarker.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
      })
    }

    ;(async () => {
      try {
        setStatus('Loading AI…')
        await tryLoad('GPU')
        if (!cancelled) { setLoaded(true); setStatus('Smile to unlock ✨') }
      } catch (gpuErr) {
        console.warn('GPU delegate failed, trying CPU…', gpuErr)
        try {
          await tryLoad('CPU')
          if (!cancelled) { setLoaded(true); setStatus('Smile to unlock ✨') }
        } catch (cpuErr) {
          console.warn('MediaPipe fully failed — auto-unlocking', cpuErr)
          if (!cancelled) {
            setStatus('Camera unavailable')
            setTimeout(onUnlock, 1500)
          }
        }
      }
    })()

    return () => { cancelled = true }
  }, [onUnlock])

  /* Start camera when visible */
  useEffect(() => {
    if (!visible) return
    let active = true

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        console.warn('Camera denied — auto-unlocking')
        onUnlock()
      }
    })()

    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [visible, onUnlock])

  /* Detection loop */
  const detect = useCallback(() => {
    const v = videoRef.current
    if (!v || v.readyState < 2 || !landmarker.current) {
      rafRef.current = requestAnimationFrame(detect)
      return
    }
    try {
      const result = landmarker.current.detectForVideo(v, performance.now())
      if (result.faceBlendshapes?.length > 0) {
        const sh    = result.faceBlendshapes[0].categories
        const left  = sh.find((c: any) => c.categoryName === 'mouthSmileLeft')?.score  || 0
        const right = sh.find((c: any) => c.categoryName === 'mouthSmileRight')?.score || 0
        const score = (left + right) / 2
        setProgress(score)
        if (score >= SMILE_THRESHOLD) { onUnlock(); return }
      }
    } catch (_) {}
    rafRef.current = requestAnimationFrame(detect)
  }, [onUnlock])

  useEffect(() => {
    if (!visible || !loaded) return
    rafRef.current = requestAnimationFrame(detect)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible, loaded, detect])

  if (!visible) return null

  const sparklePositions = [
    { top: '-4%',   left: '50%'   },
    { top: '8%',    right: '-4%'  },
    { top: '50%',   right: '-6%'  },
    { bottom: '6%', right: '2%'   },
    { bottom: '-4%',left: '48%'   },
    { bottom: '6%', left: '2%'    },
    { top: '50%',   left: '-6%'   },
    { top: '8%',    left: '-4%'   },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 40%, #1e0a18 0%, #0a0608 75%)',
      animation: 'sgFadeIn 0.8s ease forwards',
    }}>
      <style>{`
        @keyframes sgFadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes ringPulse  {
          0%,100% { transform:scale(1);    opacity:0.6; }
          50%     { transform:scale(1.03); opacity:1;   }
        }
        @keyframes depthPulse {
          0%,100% { opacity:0.5; transform:scale(0.98); }
          50%     { opacity:1;   transform:scale(1.01); }
        }
        @keyframes mirrorShimmer {
          from { opacity:0.4; transform:rotate(0deg);  }
          to   { opacity:1;   transform:rotate(8deg);  }
        }
        @keyframes sparkleDrift {
          0%   { opacity:0;   transform:scale(0.5) translateY(0);     }
          30%  { opacity:1;   transform:scale(1.2) translateY(-4px);  }
          60%  { opacity:0.7; }
          100% { opacity:0;   transform:scale(0.8) translateY(-10px); }
        }
      `}</style>

      <div style={{
        position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        width: 'min(340px, 82vw)', height: 'min(340px, 82vw)',
      }}>

        {/* Glow rings */}
        {[
          { size: '100%', delay: '0s',   opacity: 0.15, shadow: '0 0 60px rgba(196,91,106,0.08)' },
          { size: '88%',  delay: '0.6s', opacity: 0.2,  shadow: 'none' },
          { size: '76%',  delay: '1.2s', opacity: 0.25, shadow: 'none' },
        ].map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: r.size, height: r.size,
            borderRadius: '50%',
            border: `1px solid rgba(201,160,128,${r.opacity})`,
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
            0 0 120px rgba(140,50,70,0.15),
            inset 0 0 40px rgba(0,0,0,0.7)
          `,
        }}>
          {/* Depth layers */}
          {[
            { inset: '8%',  delay: '0s',   bg: 'rgba(30,10,24,0.3)'  },
            { inset: '16%', delay: '0.4s', bg: 'rgba(20,8,18,0.4)'   },
            { inset: '24%', delay: '0.8s', bg: 'rgba(15,6,14,0.5)'   },
            { inset: '32%', delay: '1.2s', bg: 'rgba(10,4,10,0.6)'   },
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

          {/* Live video */}
          <video ref={videoRef} muted playsInline style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', transform: 'scaleX(-1)',
            borderRadius: '50%',
            filter: 'sepia(20%) contrast(1.05) brightness(0.9)',
          }} />

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10,6,8,0.55) 75%, rgba(10,6,8,0.88) 100%)',
            pointerEvents: 'none', zIndex: 2,
          }} />

          {/* Shimmer */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,220,180,0.06) 0%, transparent 40%, transparent 60%, rgba(255,200,160,0.04) 100%)',
            animation: 'mirrorShimmer 5s ease-in-out infinite alternate',
            pointerEvents: 'none', zIndex: 3,
          }} />

          {/* Smile prompt */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '50%',
            transform: 'translateX(-50%)', zIndex: 4,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px', width: '70%',
          }}>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.65rem', fontWeight: 200,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(201,160,128,0.85)', whiteSpace: 'nowrap',
            }}>
              {status}
            </p>
            <div style={{
              width: '100%', height: '3px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '4px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #c45b6a, #e89060)',
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
            animation: `sparkleDrift 4s ease-in-out ${(i * 0.5).toFixed(1)}s infinite`,
          }}>✦</div>
        ))}
      </div>
    </div>
  )
}
