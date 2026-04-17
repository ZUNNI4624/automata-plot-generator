import { useState, useCallback, useRef, useEffect } from 'react'

function now() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function useFSMSimulation(fsm, inputStr) {
  const [logs, setLogs] = useState([
    { type: 'system', msg: 'FSA Simulator ready. Configure automaton and press Run.', time: now() }
  ])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [activeState, setActiveState] = useState(null)
  const [visitedStates, setVisitedStates] = useState([])
  const [activeEdgeKey, setActiveEdgeKey] = useState(null)
  const [simSteps, setSimSteps] = useState([]) // precomputed
  const timerRef = useRef(null)

  const log = useCallback((type, msg) => {
    setLogs(l => [...l, { type, msg, time: now() }])
  }, [])

  // Precompute all simulation steps
  const buildSimSteps = useCallback(() => {
    const { states, transitions, startState, acceptStates } = fsm
    const chars = inputStr.split('')

    if (!startState) return []
    if (chars.length === 0) return [{ state: startState, charIdx: -1, edgeKey: null }]

    const steps = [{ state: startState, charIdx: -1, edgeKey: null }]
    let cur = startState

    for (let i = 0; i < chars.length; i++) {
      const sym = chars[i]
      const key = `${cur}--${sym}`
      const next = transitions[key]
      if (!next) {
        steps.push({ state: null, charIdx: i, edgeKey: null, dead: true, deadFrom: cur, deadSym: sym })
        return steps
      }
      const edgeKey = `${cur}=>${next}`
      steps.push({ state: next, charIdx: i, edgeKey })
      cur = next
    }

    return steps
  }, [fsm, inputStr])

  const run = useCallback(() => {
    setLogs([])
    setStep(0)
    setVisitedStates([])
    setActiveEdgeKey(null)

    const steps = buildSimSteps()
    setSimSteps(steps)

    if (steps.length === 0) {
      log('error', 'No start state defined.')
      return
    }

    log('system', `── Simulation start ──`)
    log('info', `Input: "${inputStr || '(empty)'}"  |  Start: ${fsm.startState}`)
    setActiveState(steps[0].state)
    setStep(0)
    log('info', `Initial state → ${steps[0].state}`)
  }, [buildSimSteps, inputStr, fsm, log])

  const applyStep = useCallback((idx, steps, currentVisited) => {
    const s = steps[idx]
    if (!s) return currentVisited

    if (s.dead) {
      log('error', `Step ${idx}: No transition from ${s.deadFrom} on '${s.deadSym}' — REJECT`)
      setActiveState(null)
      setActiveEdgeKey(null)
      setPlaying(false)
      return currentVisited
    }

    setActiveState(s.state)
    setActiveEdgeKey(s.edgeKey || null)

    const chars = inputStr.split('')
    if (s.charIdx >= 0) {
      const prev = steps[idx - 1]?.state || fsm.startState
      log('info', `Step ${idx}: '${chars[s.charIdx]}' → ${prev} → ${s.state}`)
    }

    const next = [...new Set([...currentVisited, s.state])]
    setVisitedStates(next)

    // Final step
    if (idx === steps.length - 1) {
      const accepted = fsm.acceptStates.includes(s.state)
      log(accepted ? 'success' : 'error',
        accepted
          ? `✓ ACCEPTED — ended in accept state ${s.state}`
          : `✗ REJECTED — ${s.state} is not an accept state`
      )
      setPlaying(false)
    }

    return next
  }, [fsm, inputStr, log])

  // Manual step
  const doStep = useCallback(() => {
    setStep(prev => {
      const next = prev + 1
      if (next >= simSteps.length) return prev
      applyStep(next, simSteps, visitedStates)
      return next
    })
  }, [simSteps, visitedStates, applyStep])

  // Auto-play
  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setStep(prev => {
        const next = prev + 1
        if (next >= simSteps.length) { setPlaying(false); clearInterval(timerRef.current); return prev }
        setVisitedStates(v => {
          applyStep(next, simSteps, v)
          return v
        })
        return next
      })
    }, 700)
    return () => clearInterval(timerRef.current)
  }, [playing, simSteps, applyStep])

  const stop = useCallback(() => {
    setPlaying(false)
    setActiveState(null)
    setActiveEdgeKey(null)
    setVisitedStates([])
    setStep(0)
    setSimSteps([])
    log('system', '── Simulation stopped ──')
  }, [log])

  const reset = useCallback(() => {
    stop()
    setLogs([{ type: 'system', msg: 'FSA Simulator ready. Configure automaton and press Run.', time: now() }])
  }, [stop])

  return {
    logs, step, playing, activeState, visitedStates, activeEdgeKey,
    totalSteps: simSteps.length - 1,
    currentCharIdx: simSteps[step]?.charIdx ?? -1,
    run, doStep, stop, reset,
    setPlaying,
  }
}
