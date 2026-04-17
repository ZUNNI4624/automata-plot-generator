import { Play, Pause, SkipForward, Square } from 'lucide-react'

export default function SimControls({ step, totalSteps, playing, onPlay, onPause, onStep, onStop, inputStr, currentIdx }) {
  const chars = inputStr.split('')

  return (
    <div
      className="glass flex items-center gap-4 px-4 py-2 rounded-xl"
      style={{ border: '1px solid rgba(99,179,237,0.15)', minWidth: 320 }}
    >
      {/* Playback buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={playing ? onPause : onPlay}
          disabled={totalSteps === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
          style={{
            background: playing ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
            border: playing ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(52,211,153,0.3)',
            color: playing ? '#fbbf24' : '#34d399',
          }}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          onClick={onStep}
          disabled={step >= totalSteps}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}
          title="Step"
        >
          <SkipForward size={13} />
        </button>

        <button
          onClick={onStop}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
          title="Stop"
        >
          <Square size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-1">
          {chars.map((c, i) => (
            <span
              key={i}
              className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono transition-all"
              style={
                i < currentIdx
                  ? { background: 'rgba(167,139,250,0.25)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)' }
                  : i === currentIdx
                  ? { background: 'rgba(52,211,153,0.25)', color: '#34d399', border: '1px solid rgba(52,211,153,0.5)', boxShadow: '0 0 8px rgba(52,211,153,0.4)' }
                  : { background: 'rgba(15,23,42,0.5)', color: '#475569', border: '1px solid rgba(99,179,237,0.1)' }
              }
            >
              {c}
            </span>
          ))}
          {chars.length === 0 && <span className="text-xs text-slate-600">No input</span>}
        </div>
        <div className="h-1 rounded-full" style={{ background: 'rgba(99,179,237,0.1)' }}>
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: totalSteps ? `${(step / totalSteps) * 100}%` : '0%',
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              boxShadow: '0 0 6px rgba(96,165,250,0.5)',
            }}
          />
        </div>
      </div>

      <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
        {step}/{totalSteps}
      </span>
    </div>
  )
}
