import { useEffect, useRef } from 'react'
import { Terminal, CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react'

function LogLine({ entry }) {
  const icons = {
    info:    <ArrowRight size={11} className="text-blue-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 size={11} className="text-green-400 shrink-0 mt-0.5" />,
    error:   <XCircle size={11} className="text-red-400 shrink-0 mt-0.5" />,
    warn:    <AlertCircle size={11} className="text-yellow-400 shrink-0 mt-0.5" />,
    system:  <Terminal size={11} className="text-purple-400 shrink-0 mt-0.5" />,
  }
  const colors = {
    info:    '#93c5fd',
    success: '#6ee7b7',
    error:   '#fca5a5',
    warn:    '#fde68a',
    system:  '#c4b5fd',
  }

  return (
    <div className="flex items-start gap-2 py-0.5 px-1 rounded hover:bg-white/5 transition-colors group">
      {icons[entry.type] || icons.info}
      <div className="flex-1 min-w-0">
        <span className="text-slate-500 text-xs mr-2 font-mono select-none">
          {entry.time}
        </span>
        <span className="text-xs font-mono break-all" style={{ color: colors[entry.type] || colors.info }}>
          {entry.msg}
        </span>
      </div>
    </div>
  )
}

export default function LogPanel({ logs }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div
      className="glass-dark flex flex-col"
      style={{ height: 180, borderTop: '1px solid rgba(99,179,237,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-blue-400/10 shrink-0">
        <Terminal size={12} className="text-purple-400" />
        <span className="text-xs tracking-widest uppercase text-purple-400/80">Simulation Log</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1 font-mono">
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 py-2 px-1">
            <Terminal size={11} className="text-slate-600" />
            <span className="text-xs text-slate-600">Awaiting simulation...</span>
          </div>
        ) : (
          logs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
