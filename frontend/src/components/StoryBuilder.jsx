import { useState, useEffect, useRef } from 'react'
import { BookOpen, Wand2, Loader2, ChevronDown, User, MapPin, Swords, Star, X, Copy, Check, Cpu } from 'lucide-react'
import StorySimulator from './StorySimulator'

const API = 'http://localhost:5050'

function SelectRow({ icon: Icon, label, color, items, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = items.find(i => i.index === value)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const colors = {
    blue:   { border: 'rgba(96,165,250,0.35)',  bg: 'rgba(96,165,250,0.08)',  text: '#93c5fd', glow: 'rgba(96,165,250,0.2)' },
    purple: { border: 'rgba(167,139,250,0.35)', bg: 'rgba(167,139,250,0.08)', text: '#c4b5fd', glow: 'rgba(167,139,250,0.2)' },
    red:    { border: 'rgba(248,113,113,0.35)', bg: 'rgba(248,113,113,0.08)', text: '#fca5a5', glow: 'rgba(248,113,113,0.2)' },
    green:  { border: 'rgba(52,211,153,0.35)',  bg: 'rgba(52,211,153,0.08)',  text: '#6ee7b7', glow: 'rgba(52,211,153,0.2)' },
  }
  const c = colors[color] || colors.blue

  return (
    <div ref={ref} className="relative mb-3">
      <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 uppercase tracking-wider">
        <Icon size={10} style={{ color: c.text }} />
        {label}
      </label>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-all cursor-pointer"
        style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
      >
        <span className="truncate pr-2">
          {selected ? `${selected.index}. ${selected.text}` : '— select —'}
        </span>
        <ChevronDown size={11} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden"
          style={{
            background: 'rgba(8,12,28,0.97)',
            border: `1px solid ${c.border}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${c.glow}`,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {items.map(item => (
            <button
              key={item.index}
              onClick={() => { onChange(item.index); setOpen(false) }}
              className="w-full flex items-start gap-2 px-3 py-1.5 text-left text-xs transition-colors cursor-pointer"
              style={value === item.index
                ? { background: c.bg, color: c.text }
                : { color: '#64748b' }
              }
              onMouseEnter={e => { if (value !== item.index) e.currentTarget.style.background = 'rgba(99,179,237,0.05)'; e.currentTarget.style.color = '#94a3b8' }}
              onMouseLeave={e => { if (value !== item.index) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#64748b' } }}
            >
              <span className="shrink-0 font-mono" style={{ color: c.text, opacity: 0.6, minWidth: 20 }}>{item.index}.</span>
              <span className="leading-relaxed">{item.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StoryBuilder({ isOpen, onClose }) {
  const [phrases, setPhrases] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [selections, setSelections] = useState({ character: 1, location: 1, conflict: 1, resolution: 1 })
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [simOpen, setSimOpen] = useState(false)

  useEffect(() => {
    if (!isOpen || phrases) return
    setLoading(true)
    fetch(`${API}/api/phrases`)
      .then(r => r.json())
      .then(d => { setPhrases(d); setLoading(false) })
      .catch(() => { setError('Cannot reach backend. Make sure api.py is running on port 5050.'); setLoading(false) })
  }, [isOpen])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selections),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Generation failed. Is the backend running?')
    } finally {
      setGenerating(false)
    }
  }

  const copy = () => {
    if (!result?.story) return
    navigator.clipboard.writeText(result.story)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: 860,
          maxWidth: '95vw',
          maxHeight: '90vh',
          background: 'rgba(8,12,28,0.97)',
          border: '1px solid rgba(96,165,250,0.2)',
          boxShadow: '0 0 60px rgba(96,165,250,0.12), 0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-400/10 shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.8))' }} />
            <div>
              <h2 className="text-sm font-bold tracking-widest text-blue-300 uppercase">Story Builder</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pick elements, generate a full plot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
          >
            <X size={12} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — selectors */}
          <div className="w-72 shrink-0 border-r border-blue-400/10 p-5 overflow-y-auto scrollbar-thin">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
                <Loader2 size={12} className="animate-spin text-blue-400" />
                Loading options from backend...
              </div>
            )}
            {error && (
              <div className="text-xs text-red-400 py-2 px-3 rounded-lg mb-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}
            {phrases && (
              <>
                <SelectRow icon={User}   label="Character"  color="blue"   items={phrases.Character}        value={selections.character}  onChange={v => setSelections(s => ({ ...s, character: v }))} />
                <SelectRow icon={MapPin} label="Location"   color="purple" items={phrases.Location}         value={selections.location}   onChange={v => setSelections(s => ({ ...s, location: v }))} />
                <SelectRow icon={Swords} label="Conflict"   color="red"    items={phrases.Conflict}         value={selections.conflict}   onChange={v => setSelections(s => ({ ...s, conflict: v }))} />
                <SelectRow icon={Star}   label="Resolution" color="green"  items={phrases.ResolutionOutcome} value={selections.resolution} onChange={v => setSelections(s => ({ ...s, resolution: v }))} />
              </>
            )}

            <button
              onClick={generate}
              disabled={!phrases || generating}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.2))',
                border: '1px solid rgba(96,165,250,0.4)',
                color: '#93c5fd',
                boxShadow: '0 0 16px rgba(96,165,250,0.15)',
              }}
            >
              {generating
                ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                : <><Wand2 size={13} /> Generate Story</>
              }
            </button>
          </div>

          {/* Right — story output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {result ? (
              <>
                {/* Meta bar */}
                <div className="px-5 py-3 border-b border-blue-400/10 flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Attempts:</span>
                    <span className="text-blue-400 font-mono">{result.attempts}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Phase:</span>
                    <span className="text-green-400 font-mono">{result.phase} (RESOLUTION)</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setSimOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs cursor-pointer transition-all"
                      style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.15)' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(167,139,250,0.4)'; e.currentTarget.style.background = 'rgba(167,139,250,0.22)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 8px rgba(167,139,250,0.15)'; e.currentTarget.style.background = 'rgba(167,139,250,0.12)' }}
                    >
                      <Cpu size={11} /> Simulate
                    </button>
                    <button
                      onClick={copy}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs cursor-pointer transition-all"
                      style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}
                    >
                      {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* Selected elements tags */}
                <div className="px-5 py-2 flex flex-wrap gap-2 border-b border-blue-400/10 shrink-0">
                  {[
                    { label: result.selected.character, color: 'blue' },
                    { label: result.selected.location,  color: 'purple' },
                    { label: result.selected.conflict,  color: 'red' },
                    { label: result.selected.resolution, color: 'green' },
                  ].map(({ label, color }, i) => {
                    const c = { blue:'rgba(96,165,250,0.2)', purple:'rgba(167,139,250,0.2)', red:'rgba(248,113,113,0.2)', green:'rgba(52,211,153,0.2)' }[color]
                    const t = { blue:'#93c5fd', purple:'#c4b5fd', red:'#fca5a5', green:'#6ee7b7' }[color]
                    return (
                      <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: c, color: t, border: `1px solid ${t}33` }}>
                        {label.length > 40 ? label.slice(0, 40) + '…' : label}
                      </span>
                    )
                  })}
                </div>

                {/* Story text */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
                  {result.story.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-300 mb-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                {generating ? (
                  <>
                    <Loader2 size={32} className="text-blue-400 animate-spin mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(96,165,250,0.6))' }} />
                    <p className="text-sm text-slate-400">Generating your story...</p>
                    <p className="text-xs text-slate-600 mt-1">This may take a few seconds</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4" style={{ filter: 'drop-shadow(0 0 12px rgba(167,139,250,0.5))' }}>✦</div>
                    <p className="text-sm text-slate-400">Select your story elements</p>
                    <p className="text-xs text-slate-600 mt-1">then press Generate Story</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <StorySimulator
        isOpen={simOpen}
        onClose={() => setSimOpen(false)}
        segments={result?.segments || []}
        selected={result?.selected || {}}
      />
    </div>
  )
}
