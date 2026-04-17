import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/* ── Custom State Node ─────────────────────────────────────── */
function StateNode({ data }) {
  const { label, isStart, isAccept, isActive, isVisited } = data

  let borderColor = 'rgba(99,179,237,0.35)'
  let glowColor = 'rgba(96,165,250,0.2)'
  let bgColor = 'rgba(15,23,42,0.85)'
  let textColor = '#93c5fd'

  if (isActive) {
    borderColor = '#34d399'
    glowColor = 'rgba(52,211,153,0.6)'
    bgColor = 'rgba(52,211,153,0.12)'
    textColor = '#34d399'
  } else if (isVisited) {
    borderColor = 'rgba(167,139,250,0.6)'
    glowColor = 'rgba(167,139,250,0.3)'
    bgColor = 'rgba(167,139,250,0.08)'
    textColor = '#a78bfa'
  }

  const size = 56

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 0, height: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 0, height: 0 }} />

      {/* Start arrow */}
      {isStart && (
        <div style={{
          position: 'absolute', left: -36, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <div style={{ width: 22, height: 2, background: '#60a5fa', boxShadow: '0 0 6px rgba(96,165,250,0.8)' }} />
          <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '7px solid #60a5fa' }} />
        </div>
      )}

      {/* Outer ring for accept state */}
      {isAccept && (
        <div style={{
          position: 'absolute', inset: -5,
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 10px ${glowColor}`,
          transition: 'all 0.3s ease',
        }} />
      )}

      {/* Main circle */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 ${isActive ? 20 : 8}px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'grab',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 13, fontWeight: 600,
          color: textColor,
          textShadow: isActive ? `0 0 10px ${textColor}` : 'none',
          userSelect: 'none',
        }}>
          {label}
        </span>

        {/* Active pulse ring */}
        {isActive && (
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '2px solid rgba(52,211,153,0.4)',
            animation: 'ping 1s ease-in-out infinite',
          }} />
        )}
      </div>
    </div>
  )
}

// Defined outside component to avoid re-render warning
const nodeTypes = { stateNode: StateNode }

/* ── Build React Flow nodes & edges ────────────────────────── */
function buildElements(fsm, activeState, visitedStates, activeEdgeKey) {
  const { states, alphabet, transitions, startState, acceptStates } = fsm
  const count = states.length

  // Arrange in a circle
  const cx = 0, cy = 0
  const r = Math.max(120, count * 40)

  const nodes = states.map((s, i) => {
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2
    return {
      id: s,
      type: 'stateNode',
      position: { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) },
      data: {
        label: s,
        isStart: s === startState,
        isAccept: acceptStates.includes(s),
        isActive: s === activeState,
        isVisited: visitedStates.includes(s) && s !== activeState,
      },
      draggable: true,
    }
  })

  // Group transitions by (from, to) to bundle labels
  const edgeMap = {}
  for (const [key, to] of Object.entries(transitions)) {
    if (!to) continue
    const [from, sym] = key.split('--')
    const ek = `${from}=>${to}`
    if (!edgeMap[ek]) edgeMap[ek] = { from, to, labels: [] }
    edgeMap[ek].labels.push(sym)
  }

  const edges = Object.entries(edgeMap).map(([ek, { from, to, labels }]) => {
    const isActive = activeEdgeKey === ek
    const isSelf = from === to
    return {
      id: ek,
      source: from,
      target: to,
      label: labels.join(', '),
      type: 'default',
      animated: isActive,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? '#34d399' : '#60a5fa',
        width: 16, height: 16,
      },
      style: {
        stroke: isActive ? '#34d399' : 'rgba(96,165,250,0.5)',
        strokeWidth: isActive ? 2.5 : 1.5,
        filter: isActive ? 'drop-shadow(0 0 6px rgba(52,211,153,0.8))' : 'none',
        transition: 'all 0.3s ease',
      },
      labelStyle: {
        fill: isActive ? '#34d399' : '#93c5fd',
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: isActive ? 700 : 400,
      },
      labelBgStyle: {
        fill: 'rgba(8,12,28,0.85)',
        rx: 4, ry: 4,
      },
    }
  })

  return { nodes, edges }
}

/* ── Main Graph Component ───────────────────────────────────── */
export default function FSAGraph({ fsm, activeState, visitedStates, activeEdgeKey }) {
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildElements(fsm, activeState, visitedStates, activeEdgeKey),
    [fsm, activeState, visitedStates, activeEdgeKey]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  // Sync when fsm changes (states added/removed)
  useEffect(() => {
    const { nodes: n, edges: e } = buildElements(fsm, activeState, visitedStates, activeEdgeKey)
    setNodes(n)
    setEdges(e)
  }, [fsm, activeState, visitedStates, activeEdgeKey])

  return (
    <div className="relative w-full h-full">
      {/* Keyframe for ping animation */}
      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.3}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(99,179,237,0.08)"
        />
        <Controls
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(99,179,237,0.2)',
            borderRadius: 8,
          }}
          showInteractive={false}
        />
      </ReactFlow>

      {/* Empty state hint */}
      {fsm.states.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.5))' }}>◎</div>
            <p className="text-slate-500 text-sm">Add states in the sidebar to begin</p>
            <p className="text-slate-600 text-xs mt-1">Nodes will appear here as a graph</p>
          </div>
        </div>
      )}
    </div>
  )
}
