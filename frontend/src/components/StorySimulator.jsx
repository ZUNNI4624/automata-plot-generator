import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { X, Play, Pause, SkipForward, Square, Zap, ChevronRight } from 'lucide-react'

// ── Phase config ─────────────────────────────────────────────
const PHASES = [
  { id: 'SETUP',         state: 0, label: 'SETUP',         short: 'q0', color: '#60a5fa', glow: 'rgba(96,165,250,0.6)',  bg: 'rgba(96,165,250,0.1)',  trigger: 'Opening'     },
  { id: 'RISING_ACTION', state: 1, label: 'RISING ACTION', short: 'q1', color: '#a78bfa', glow: 'rgba(167,139,250,0.6)', bg: 'rgba(167,139,250,0.1)', trigger: 'Development' },
  { id: 'CLIMAX',        state: 2, label: 'CLIMAX',        short: 'q2', color: '#fb923c', glow: 'rgba(251,146,60,0.6)',  bg: 'rgba(251,146,60,0.1)',  trigger: 'Climax'      },
  { id: 'RESOLUTION',    state: 3, label: 'RESOLUTION',    short: 'q3', color: '#34d399', glow: 'rgba(52,211,153,0.6)',  bg: 'rgba(52,211,153,0.1)',  trigger: 'Resolution'  },
]

const SPEEDS = { slow: 90, medium: 45, fast: 12 }
const PAUSES = { slow: 2000, medium: 1100, fast: 350 }

// ── Helpers ───────────────────────────────────────────────────
function phaseOf(id) { return PHASES.find(p => p.id === id) || PHASES[0] }

function extractSentences(segments) {
  const out = []
  for (const seg of segments) {
    for (const para of seg.paragraphs) {
      const raw = para.match(/[^.!?…]+[.!?…]+/g) || [para]
      for (const s of raw) {
        const t = s.trim()
        if (t.length > 2) out.push({ text: t, phase: seg.phase, state: seg.state })
      }
    }
  }
  return out
}

// ── Horizontal FSA Bar ────────────────────────────────────────
function FSABar({ activeState, prevState, transitioning }) {
  return (
    <div className="flex items-center justify-center gap-0 select-none py-4 px-6 relative">
      {PHASES.map((ph, i) => {
        const isActive  = activeState === ph.state
        const isPassed  = activeState > ph.state
        const isNext    = prevState === ph.state - 1 && transitioning

        return (
          <div key={ph.id} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 relative">
              <div
                className="relative flex items-center justify-center rounded-full transition-all duration-700"
                style={{
                  width: isActive ? 80 : 64,
                  height: isActive ? 80 : 64,
                  border: `2px solid ${isActive ? ph.color : isPassed ? ph.color + '55' : 'rgba(99,179,237,0.15)'}`,
                  background: isActive ? ph.bg : isPassed ? ph.bg.replace('0.1','0.04') : 'rgba(4,8,20,0.8)',
                  boxShadow: isActive
                    ? `0 0 24px ${ph.glow}, 0 0 50px ${ph.glow.replace('0.6','0.2')}, inset 0 0 20px ${ph.glow.replace('0.6','0.1')}`
                    : isPassed ? `0 0 8px ${ph.glow.replace('0.6','0.15')}` : 'none',
                  zIndex: isActive ? 2 : 1,
                }}
              >
                {/* Accept state double ring */}
                {ph.state === 3 && (
                  <div style={{
                    position: 'absolute', inset: isActive ? -8 : -6,
                    borderRadius: '50%',
                    border: `1.5px solid ${isActive ? ph.color : ph.color + '30'}`,
                    transition: 'all 0.7s',
                  }} />
                )}

                {/* Pulse ring when active */}
                {isActive && (
                  <>
                    <div style={{
                      position: 'absolute', inset: -14, borderRadius: '50%',
                      border: `2px solid ${ph.color}50`,
                      animation: 'fsaPing 1.4s ease-out infinite',
                    }} />
                    <div style={{
                      position: 'absolute', inset: -22, borderRadius: '50%',
                      border: `1px solid ${ph.color}25`,
                      animation: 'fsaPing 1.4s ease-out infinite 0.4s',
                    }} />
                  </>
                )}

                {/* Checkmark for passed */}
                {isPassed && !isActive && (
                  <span style={{ fontSize: 18, color: ph.color + '80' }}>✓</span>
                )}

                {/* State label */}
                {(isActive || !isPassed) && (
                  <span
                    className="font-mono font-bold transition-all duration-700"
                    style={{
                      fontSize: isActive ? 16 : 13,
                      color: isActive ? ph.color : 'rgba(99,179,237,0.2)',
                      textShadow: isActive ? `0 0 12px ${ph.color}` : 'none',
                    }}
                  >
                    {ph.short}
                  </span>
                )}
              </div>

              {/* Phase name label */}
              <span
                className="font-mono tracking-widest transition-all duration-700"
                style={{
                  fontSize: 9,
                  color: isActive ? ph.color : isPassed ? ph.color + '55' : 'rgba(99,179,237,0.15)',
                  textShadow: isActive ? `0 0 8px ${ph.color}` : 'none',
                  letterSpacing: '0.15em',
                }}
              >
                {ph.label}
              </span>
            </div>

            {/* Edge arrow */}
            {i < PHASES.length - 1 && (
              <div className="flex flex-col items-center mx-3 mb-5" style={{ minWidth: 60 }}>
                <span
                  className="text-xs font-mono mb-1 transition-all duration-500"
                  style={{
                    color: activeState > ph.state ? PHASES[i+1].color + '80' : 'rgba(99,179,237,0.12)',
                    fontSize: 9,
                  }}
                >
                  {PHASES[i+1].trigger}
                </span>
                <div className="relative flex items-center" style={{ width: 60 }}>
                  <div
                    className="h-px transition-all duration-700"
                    style={{
                      width: '100%',
                      background: activeState > ph.state
                        ? `linear-gradient(90deg, ${ph.color}60, ${PHASES[i+1].color}60)`
                        : 'rgba(99,179,237,0.1)',
                    }}
                  />
                  {/* Traveling dot on transition */}
                  {transitioning && prevState === ph.state && (
                    <div
                      style={{
                        position: 'absolute', top: '50%', left: 0,
                        width: 8, height: 8, borderRadius: '50%',
                        background: PHASES[i+1].color,
                        boxShadow: `0 0 10px ${PHASES[i+1].glow}`,
                        transform: 'translateY(-50%)',
                        animation: 'travelDot 0.5s ease-out forwards',
                      }}
                    />
                  )}
                  <ChevronRight
                    size={12}
                    style={{
                      position: 'absolute', right: -6,
                      color: activeState > ph.state ? PHASES[i+1].color + '80' : 'rgba(99,179,237,0.1)',
                      transition: 'color 0.7s',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Story History (left column) ───────────────────────────────
function StoryHistory({ sentences, currentIdx }) {
  const histRef = useRef(null)
  const past = sentences.slice(0, currentIdx)

  useEffect(() => {
    histRef.current?.scrollTo({ top: histRef.current.scrollHeight, behavior: 'smooth' })
  }, [currentIdx])

  return (
    <div
      ref={histRef}
      className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-1.5"
      style={{ fontFamily: 'system-ui, Georgia, serif' }}
    >
      {past.length === 0 && (
        <p className="text-xs text-slate-700 italic">Story history will appear here…</p>
      )}
      {past.map((s, i) => {
        const ph = phaseOf(s.phase)
        const isRecent = i >= past.length - 3
        return (
          <p
            key={i}
            className="text-xs leading-relaxed transition-all duration-500"
            style={{
              color: isRecent ? ph.color + 'cc' : '#334155',
              borderLeft: `2px solid ${isRecent ? ph.color + '50' : 'transparent'}`,
              paddingLeft: isRecent ? 8 : 0,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {s.text}
          </p>
        )
      })}
    </div>
  )
}

// ── Typewriter display (right column) ────────────────────────
function TypewriterDisplay({ sentence, visibleWords, ph }) {
  if (!sentence) return null
  const words = sentence.text.split(' ')
  const shown = words.slice(0, visibleWords)
  const hidden = words.slice(visibleWords)
  const cursor = visibleWords < words.length

  return (
    <div
      className="flex-1 flex flex-col items-start justify-center px-8 py-6"
      style={{ minHeight: 0 }}
    >
      {/* Phase badge */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-xs font-mono tracking-widest uppercase"
        style={{
          background: ph.bg,
          border: `1px solid ${ph.color}50`,
          color: ph.color,
          boxShadow: `0 0 12px ${ph.glow.replace('0.6','0.2')}`,
        }}
      >
        <Zap size={10} style={{ filter: `drop-shadow(0 0 4px ${ph.color})` }} />
        {ph.label}
      </div>

      {/* Main typewriter text */}
      <p
        className="leading-loose"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 18,
          color: '#e2e8f0',
          maxWidth: 520,
          minHeight: 120,
        }}
      >
        <span style={{ color: ph.color, textShadow: `0 0 10px ${ph.glow.replace('0.6','0.4')}` }}>
          {shown.join(' ')}
        </span>
        {cursor && (
          <span
            className="inline-block w-0.5 h-5 ml-1 align-middle"
            style={{ background: ph.color, boxShadow: `0 0 6px ${ph.color}`, animation: 'blink 0.9s step-end infinite' }}
          />
        )}
        {shown.length > 0 && !cursor && ' '}
        <span style={{ color: 'transparent', userSelect: 'none' }}>{hidden.join(' ')}</span>
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function StorySimulator({ isOpen, onClose, segments = [], selected = {} }) {
  const sentences = useMemo(() => extractSentences(segments), [segments])

  const [sentenceIdx, setSentenceIdx]   = useState(0)
  const [visibleWords, setVisibleWords] = useState(0)
  const [playing, setPlaying]           = useState(false)
  const [speed, setSpeed]               = useState('medium')
  const [transitioning, setTransitioning] = useState(false)
  const [prevState, setPrevState]       = useState(null)

  const timerRef = useRef(null)

  const cur        = sentences[sentenceIdx]
  const words      = cur?.text.split(' ') || []
  const typingDone = visibleWords >= words.length
  const isFinished = sentences.length > 0 && sentenceIdx >= sentences.length - 1 && typingDone
  const activeState = cur?.state ?? 0
  const ph = phaseOf(cur?.phase)

  // Reset on open
  useEffect(() => {
    if (isOpen) { setSentenceIdx(0); setVisibleWords(0); setPlaying(false); setPrevState(null) }
  }, [isOpen])

  // Reset visible words on sentence change
  useEffect(() => { setVisibleWords(0) }, [sentenceIdx])

  // Detect FSA transition
  useEffect(() => {
    if (prevState !== null && activeState !== prevState) {
      setTransitioning(true)
      setTimeout(() => setTransitioning(false), 600)
    }
    setPrevState(activeState)
  }, [activeState])

  // Auto-play engine
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!playing) return

    if (!typingDone) {
      timerRef.current = setTimeout(() => setVisibleWords(v => v + 1), SPEEDS[speed])
    } else if (!isFinished) {
      timerRef.current = setTimeout(() => setSentenceIdx(i => i + 1), PAUSES[speed])
    } else {
      setPlaying(false)
    }

    return () => clearTimeout(timerRef.current)
  }, [playing, visibleWords, typingDone, isFinished, speed, sentenceIdx])

  const doStep = useCallback(() => {
    clearTimeout(timerRef.current)
    if (!typingDone) {
      setVisibleWords(words.length)
    } else if (!isFinished) {
      setSentenceIdx(i => i + 1)
    }
  }, [typingDone, isFinished, words.length])

  const doReset = useCallback(() => {
    clearTimeout(timerRef.current)
    setPlaying(false)
    setSentenceIdx(0)
    setVisibleWords(0)
  }, [])

  const jumpToPhase = useCallback((phaseId) => {
    clearTimeout(timerRef.current)
    setPlaying(false)
    const idx = sentences.findIndex(s => s.phase === phaseId)
    if (idx !== -1) { setSentenceIdx(idx); setVisibleWords(0) }
  }, [sentences])

  if (!isOpen) return null

  const progress = sentences.length > 1
    ? (sentenceIdx + (typingDone ? 1 : visibleWords / Math.max(words.length, 1))) / sentences.length
    : 0

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes fsaPing   { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.8);opacity:0} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes travelDot { 0%{left:0} 100%{left:100%} }
        @keyframes phaseFlash{ 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
      `}</style>

      <div
        className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: 980, maxWidth: '97vw', maxHeight: '94vh',
          background: 'rgba(4,8,20,0.99)',
          border: `1px solid ${ph.color}35`,
          boxShadow: `0 0 80px ${ph.glow.replace('0.6','0.1')}, 0 32px 80px rgba(0,0,0,0.9)`,
          transition: 'border-color 0.8s, box-shadow 0.8s',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-4 px-6 py-3 shrink-0"
          style={{ borderBottom: `1px solid ${ph.color}20`, transition: 'border-color 0.8s' }}
        >
          <div className="flex-1">
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: ph.color, transition: 'color 0.8s' }}>
              FSA Story Simulation
            </h2>
            {selected.character && (
              <p className="text-xs mt-0.5 text-slate-600 truncate max-w-xs">
                {selected.character}
              </p>
            )}
          </div>

          {/* Sentence counter */}
          <span className="text-xs font-mono text-slate-600">
            {sentenceIdx + 1} <span className="text-slate-700">/ {sentences.length}</span>
          </span>

          {/* Speed selector */}
          <div className="flex gap-1">
            {['slow','medium','fast'].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-2 py-0.5 rounded text-xs font-mono cursor-pointer transition-all capitalize"
                style={speed === s
                  ? { background: ph.bg, border: `1px solid ${ph.color}50`, color: ph.color }
                  : { background: 'transparent', border: '1px solid rgba(99,179,237,0.1)', color: '#334155' }
                }
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
          >
            <X size={12} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ height: 2, background: 'rgba(99,179,237,0.06)' }}>
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, #60a5fa, ${ph.color})`,
              boxShadow: `0 0 8px ${ph.glow}`,
              transition: 'width 0.4s, background 0.8s, box-shadow 0.8s',
            }}
          />
        </div>

        {/* ── FSA Bar ── */}
        <div style={{ borderBottom: `1px solid rgba(99,179,237,0.06)`, background: 'rgba(2,4,14,0.6)' }}>
          <FSABar activeState={activeState} prevState={prevState} transitioning={transitioning} />
        </div>

        {/* ── Body: history | typewriter ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — story history */}
          <div
            className="flex flex-col"
            style={{ width: 260, borderRight: `1px solid rgba(99,179,237,0.06)` }}
          >
            <div className="px-4 pt-3 pb-2 shrink-0">
              <span className="text-xs font-mono tracking-widest text-slate-700 uppercase">History</span>
            </div>
            <StoryHistory sentences={sentences} currentIdx={sentenceIdx} />
          </div>

          {/* Right — typewriter */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Phase transition flash */}
            {transitioning && (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: ph.bg,
                  animation: 'phaseFlash 0.6s ease-out forwards',
                  pointerEvents: 'none', zIndex: 10,
                }}
              />
            )}
            <TypewriterDisplay sentence={cur} visibleWords={visibleWords} ph={ph} />

            {/* Finished banner */}
            {isFinished && (
              <div className="px-8 pb-6">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(52,211,153,0.08)',
                    border: '1px solid rgba(52,211,153,0.35)',
                    boxShadow: '0 0 20px rgba(52,211,153,0.1)',
                  }}
                >
                  <span style={{ fontSize: 20, filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' }}>✦</span>
                  <div>
                    <p className="text-sm font-semibold text-green-400">Story Complete</p>
                    <p className="text-xs text-slate-500 mt-0.5">FSA reached RESOLUTION — accepted</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Controls ── */}
        <div
          className="flex items-center gap-3 px-6 py-3 shrink-0"
          style={{ borderTop: `1px solid rgba(99,179,237,0.06)` }}
        >
          {/* Reset */}
          <button
            onClick={doReset}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
            title="Reset"
          >
            <Square size={13} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setPlaying(p => !p)}
            disabled={isFinished}
            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
            style={{
              background: playing ? 'rgba(251,191,36,0.12)' : ph.bg,
              border: `1px solid ${playing ? 'rgba(251,191,36,0.4)' : ph.color + '55'}`,
              color: playing ? '#fbbf24' : ph.color,
              boxShadow: playing ? '0 0 12px rgba(251,191,36,0.2)' : `0 0 14px ${ph.glow.replace('0.6','0.25')}`,
              transition: 'all 0.3s',
            }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Step */}
          <button
            onClick={doStep}
            disabled={isFinished}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
            style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}
            title="Next sentence"
          >
            <SkipForward size={13} />
          </button>

          {/* Phase jump buttons */}
          <div className="flex items-center gap-1.5 ml-4">
            {PHASES.map(p => {
              const exists = sentences.some(s => s.phase === p.id)
              const isActive = activeState === p.state
              return (
                <button
                  key={p.id}
                  onClick={() => jumpToPhase(p.id)}
                  disabled={!exists}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all disabled:opacity-20"
                  style={isActive
                    ? { background: p.bg, border: `1px solid ${p.color}55`, color: p.color, boxShadow: `0 0 10px ${p.glow.replace('0.6','0.2')}` }
                    : { background: 'transparent', border: '1px solid rgba(99,179,237,0.08)', color: '#334155' }
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive ? p.color : '#1e293b' }} />
                  {p.short}
                </button>
              )
            })}
          </div>

          {/* Word/sentence stats */}
          <div className="ml-auto text-xs font-mono text-slate-700">
            <span style={{ color: ph.color + '90' }}>{visibleWords}</span>
            <span className="text-slate-800">/{words.length} words</span>
          </div>
        </div>
      </div>
    </div>
  )
}
