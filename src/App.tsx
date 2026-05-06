import { useState, useCallback } from 'react'
import Particles  from './components/Particles'
import Landing    from './components/Landing'
import SmileGate  from './components/SmileGate'
import Slideshow  from './components/Slideshow'

type Stage = 'landing' | 'smiling' | 'slideshow'

export default function App() {
  const [stage, setStage] = useState<Stage>('landing')

  const handleBegin  = useCallback(() => setStage('smiling'),   [])
  const handleUnlock = useCallback(() => setStage('slideshow'), [])

  return (
    <>
      <Particles />
      <Landing   onBegin={handleBegin} />
      <SmileGate visible={stage === 'smiling'}   onUnlock={handleUnlock} />
      <Slideshow visible={stage === 'slideshow'} />
    </>
  )
}
