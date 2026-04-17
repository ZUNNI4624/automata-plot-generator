import { Play, RotateCcw, Download, Cpu, Activity, BookOpen } from 'lucide-react'

export default function Navbar({ onRun, onReset, onExport, simRunning, onStoryBuilder }) {
  return (
    <nav className="glass-dark flex items-center justify-between px-6 py-3 border-b border-blue-400/10 z-50 relative">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Cpu size={22} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.8))' }} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.9)' }} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-widest text-blue-300" style={{ textShadow: '0 0 10px rgba(96,165,250,0.6)' }}>
            AUTOMATA
          </span>
          <span className="text-xs tracking-[0.3em] text-purple-400/80">PLOT GENERATOR</span>
        </div>
      </div>

      {/* Center — decorative state indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Activity size={12} className={simRunning ? 'text-green-400 animate-pulse' : 'text-slate-600'} />
        <span className={simRunning ? 'text-green-400' : 'text-slate-600'}>
          {simRunning ? 'SIMULATION ACTIVE' : 'IDLE'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStoryBuilder}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(167,139,250,0.12)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: '#a78bfa',
            boxShadow: '0 0 10px rgba(167,139,250,0.15)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(167,139,250,0.4)'; e.currentTarget.style.background = 'rgba(167,139,250,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 10px rgba(167,139,250,0.15)'; e.currentTarget.style.background = 'rgba(167,139,250,0.12)' }}
        >
          <BookOpen size={12} />
          Story Builder
        </button>
        <button
          onClick={onRun}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.35)',
            color: '#34d399',
            boxShadow: '0 0 10px rgba(52,211,153,0.15)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(52,211,153,0.4)'; e.currentTarget.style.background = 'rgba(52,211,153,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 10px rgba(52,211,153,0.15)'; e.currentTarget.style.background = 'rgba(52,211,153,0.12)' }}
        >
          <Play size={12} />
          Run
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.25)',
            color: '#60a5fa',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(96,165,250,0.35)'; e.currentTarget.style.background = 'rgba(96,165,250,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(96,165,250,0.1)' }}
        >
          <RotateCcw size={12} />
          Reset
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.25)',
            color: '#a78bfa',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(167,139,250,0.35)'; e.currentTarget.style.background = 'rgba(167,139,250,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(167,139,250,0.1)' }}
        >
          <Download size={12} />
          Export
        </button>
      </div>
    </nav>
  )
}
