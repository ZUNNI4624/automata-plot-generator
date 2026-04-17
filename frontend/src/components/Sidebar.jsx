import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Settings, Zap } from 'lucide-react'

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase cursor-pointer transition-colors"
        style={{ color: '#94a3b8', background: 'rgba(99,179,237,0.05)' }}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon size={11} />}
          {title}
        </span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && <div className="mt-2 px-1">{children}</div>}
    </div>
  )
}

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) { onChange([...values, v]); setInput('') }
  }
  return (
    <div className="mb-2">
      {label && <label className="block text-xs text-slate-500 mb-1">{label}</label>}
      <div className="flex gap-1 flex-wrap mb-1 min-h-[24px]">
        {values.map(v => (
          <span
            key={v}
            onClick={() => onChange(values.filter(x => x !== v))}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer transition-all"
            style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd' }}
            title="Click to remove"
          >
            {v} ×
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          className="input-glass flex-1 px-2 py-1 rounded text-xs"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
        />
        <button
          onClick={add}
          className="px-2 py-1 rounded text-xs cursor-pointer transition-all"
          style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ fsm, setFsm, inputStr, setInputStr }) {
  const { states, alphabet, transitions, startState, acceptStates } = fsm

  const setTransition = (from, sym, to) => {
    const key = `${from}--${sym}`
    setFsm(f => ({ ...f, transitions: { ...f.transitions, [key]: to } }))
  }

  const getTransition = (from, sym) => transitions[`${from}--${sym}`] || ''

  return (
    <aside
      className="glass-dark flex flex-col h-full overflow-y-auto scrollbar-thin"
      style={{ width: 260, minWidth: 260, borderRight: '1px solid rgba(99,179,237,0.1)' }}
    >
      <div className="p-3 border-b border-blue-400/10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Settings size={12} className="text-blue-400" />
          <span className="tracking-widest uppercase text-blue-400/80">Configuration</span>
        </div>
      </div>

      <div className="p-3 flex-1">
        <Section title="States" icon={Zap}>
          <TagInput
            values={states}
            onChange={v => setFsm(f => ({ ...f, states: v }))}
            placeholder="e.g. q0, q1 ..."
          />
        </Section>

        <Section title="Alphabet">
          <TagInput
            values={alphabet}
            onChange={v => setFsm(f => ({ ...f, alphabet: v }))}
            placeholder="e.g. a, b, 0, 1 ..."
          />
        </Section>

        <Section title="Start State">
          <select
            className="input-glass w-full px-2 py-1.5 rounded text-xs"
            value={startState}
            onChange={e => setFsm(f => ({ ...f, startState: e.target.value }))}
          >
            <option value="">-- none --</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Section>

        <Section title="Accept States">
          <div className="flex flex-wrap gap-1">
            {states.map(s => (
              <button
                key={s}
                onClick={() => {
                  const next = acceptStates.includes(s)
                    ? acceptStates.filter(x => x !== s)
                    : [...acceptStates, s]
                  setFsm(f => ({ ...f, acceptStates: next }))
                }}
                className="px-2 py-0.5 rounded text-xs cursor-pointer transition-all"
                style={
                  acceptStates.includes(s)
                    ? { background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.5)', color: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.25)' }
                    : { background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(99,179,237,0.15)', color: '#64748b' }
                }
              >
                {s}
              </button>
            ))}
            {states.length === 0 && <span className="text-xs text-slate-600">Add states first</span>}
          </div>
        </Section>

        <Section title="Transitions">
          {states.length === 0 || alphabet.length === 0 ? (
            <p className="text-xs text-slate-600">Add states and alphabet first</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-1 pr-2 text-slate-500 font-normal">δ</th>
                    {alphabet.map(a => (
                      <th key={a} className="px-1 py-1 text-center font-mono text-blue-400/70">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {states.map(s => (
                    <tr key={s} className="border-t border-blue-400/5">
                      <td className="py-1 pr-2 font-mono text-purple-400">{s}</td>
                      {alphabet.map(a => (
                        <td key={a} className="px-1 py-0.5">
                          <select
                            className="input-glass w-full px-1 py-0.5 rounded text-xs text-center"
                            value={getTransition(s, a)}
                            onChange={e => setTransition(s, a, e.target.value)}
                          >
                            <option value="">—</option>
                            {states.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Input String">
          <input
            className="input-glass w-full px-2 py-1.5 rounded text-xs font-mono"
            value={inputStr}
            onChange={e => setInputStr(e.target.value)}
            placeholder="e.g. aabb"
          />
          <p className="text-xs text-slate-600 mt-1">Used for simulation</p>
        </Section>
      </div>
    </aside>
  )
}
