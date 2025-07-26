import { useEffect, useRef, useState } from 'react'
import { loadLLM, type LLM } from '../lib/llm'

interface NavigatorWithMemory extends Navigator { deviceMemory?: number }
interface PerformanceWithMemory extends Performance { memory?: { jsHeapSizeLimit: number } }

function hasEnoughMemory() {
  const nav = navigator as NavigatorWithMemory
  const perf = performance as PerformanceWithMemory
  const deviceMemory = nav.deviceMemory || 4
  const heapLimit = perf.memory?.jsHeapSizeLimit || 0
  return deviceMemory >= 4 && heapLimit >= 1.5e9
}

export function useFieldExplainer(enabled = true) {
  const [llm, setLLM] = useState<LLM | null>(null)
  const loading = useRef(false)

  useEffect(() => {
    if (enabled && hasEnoughMemory() && !llm && !loading.current) {
      loading.current = true
      loadLLM().then((m) => setLLM(m))
    } else if ((!enabled || !hasEnoughMemory()) && llm) {
      setLLM(null)
      loading.current = false
    }
  }, [enabled, llm])

  return async (value: string) => {
    if (!llm || !hasEnoughMemory()) return null
    if (value.trim().length < 10) {
      return llm.explain(value)
    }
    return null
  }
}

export const memorySufficient = hasEnoughMemory
