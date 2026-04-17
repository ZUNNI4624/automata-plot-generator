import { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import FSAGraph from './components/FSAGraph'
import LogPanel from './components/LogPanel'
import SimControls from './components/SimControls'
import StoryBuilder from './components/StoryBuilder'
import { useFSMSimulation } from './useFSMSimulation'

// Mirrors PlotStateMachine from fsa.py
// States: SETUP(0) → RISING_ACTION(1) → CLIMAX(2) → RESOLUTION(3)
// Alphabet symbols: O=Opening  D=Development  S=Scene  E=Event  C=Climax  R=Resolution
const DEFAULT_FSM = {
  states: ['SETUP', 'RISING_ACTION', 'CLIMAX', 'RESOLUTION'],
  alphabet: ['O', 'D', 'S', 'E', 'C', 'R'],
  transitions: {
    // SETUP: Opening keeps us here, Development advances
    'SETUP--O': 'SETUP',
    'SETUP--D': 'RISING_ACTION',
    // RISING_ACTION: Scenes & Events loop, Climax advances
    'RISING_ACTION--S': 'RISING_ACTION',
    'RISING_ACTION--E': 'RISING_ACTION',
    'RISING_ACTION--C': 'CLIMAX',
    // CLIMAX: loops on C, Resolution advances
    'CLIMAX--C': 'CLIMAX',
    'CLIMAX--R': 'RESOLUTION',
    // RESOLUTION: terminal — stays
    'RESOLUTION--R': 'RESOLUTION',
  },
  startState: 'SETUP',
  acceptStates: ['RESOLUTION'],
}

export default function App() {
  const [fsm, setFsm] = useState(DEFAULT_FSM)
  // O=Opening D=Development S=Scene E=Event C=Climax R=Resolution
  const [inputStr, setInputStr] = useState('ODSSECR')
  const [storyBuilderOpen, setStoryBuilderOpen] = useState(false)

  const {
    logs, step, playing, activeState, visitedStates, activeEdgeKey,
    totalSteps, currentCharIdx,
    run, doStep, stop, reset,
    setPlaying,
  } = useFSMSimulation(fsm, inputStr)

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ fsm, inputStr }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'automaton.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [fsm, inputStr])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: '#020817' }}>
      {/* Gradient atmosphere orbs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 20% 20%, rgba(30,58,138,0.18) 0%, transparent 70%),
          radial-gradient(ellipse 50% 35% at 80% 80%, rgba(88,28,135,0.15) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 50% 50%, rgba(6,78,59,0.08) 0%, transparent 70%)
        `,
      }} />

      <Navbar
        onRun={run}
        onReset={reset}
        onExport={handleExport}
        simRunning={playing || activeState !== null}
        onStoryBuilder={() => setStoryBuilderOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar fsm={fsm} setFsm={setFsm} inputStr={inputStr} setInputStr={setInputStr} />

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <FSAGraph
              fsm={fsm}
              activeState={activeState}
              visitedStates={visitedStates}
              activeEdgeKey={activeEdgeKey}
            />

            {/* Floating sim controls */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
              style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))' }}
            >
              <SimControls
                step={step}
                totalSteps={totalSteps}
                playing={playing}
                onPlay={() => { if (totalSteps === 0) run(); setPlaying(true) }}
                onPause={() => setPlaying(false)}
                onStep={doStep}
                onStop={stop}
                inputStr={inputStr}
                currentIdx={currentCharIdx}
              />
            </div>

            {/* Canvas hint */}
            <div className="absolute top-3 right-4 flex items-center gap-2 text-xs text-slate-600 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
              <span>Drag nodes · Scroll to zoom</span>
            </div>
          </div>

          <LogPanel logs={logs} />
        </div>
      </div>

      <StoryBuilder isOpen={storyBuilderOpen} onClose={() => setStoryBuilderOpen(false)} />
    </div>
  )
}
