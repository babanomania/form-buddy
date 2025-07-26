import { useEffect, useRef, useState } from 'react'
import { loadLLM, type LLM } from '../lib/llm'

interface NavigatorWithMemory extends Navigator { deviceMemory?: number }
interface PerformanceWithMemory extends Performance { memory?: { jsHeapSizeLimit: number } }

const simulateLowMemory = import.meta.env.VITE_LOW_MEMORY === 'true'

function hasEnoughMemory() {
  if (simulateLowMemory) return false
  const nav = navigator as NavigatorWithMemory
  const perf = performance as PerformanceWithMemory
  const deviceMemory = nav.deviceMemory || 4
  const heapLimit = perf.memory?.jsHeapSizeLimit || 0
  return deviceMemory >= 4 && heapLimit >= 1.5e9
}

export function useFieldExplainer(enabled = true) {
  const [llm, setLLM] = useState<LLM | null>(null)
  const loading = useRef(false)
  const cache = useRef(new Map<string, string>())

  useEffect(() => {
    if (enabled && hasEnoughMemory() && !llm && !loading.current) {
      loading.current = true
      loadLLM().then((m) => setLLM(m))
    } else if ((!enabled || !hasEnoughMemory()) && llm) {
      setLLM(null)
      loading.current = false
    }
  }, [enabled, llm])

  const fallbackExplain = (field: string, value: string) => {
    if (field === 'steps' && value.trim().length < 10)
      return 'Please provide detailed steps to reproduce the issue.'
    if (field === 'version' && !/\d+\.\d+\.\d+/.test(value))
      return 'Please enter a valid version like 1.2.3.'
    if (field === 'feedbackType' && !['Bug', 'Feature', 'UI Issue'].includes(value))
      return 'Choose a feedback type: Bug, Feature, or UI Issue.'
    return null
  }

  return async (
    field: string,
    value: string,
    errorType: string | null,
  ): Promise<string | null> => {
    const key = `${field}|${value}|${errorType ?? ''}`
    const cached = cache.current.get(key)
    if (cached) return cached
    let res: string | null
    if (llm && hasEnoughMemory()) {
      res = await llm.explain(field, value, errorType)
    } else {
      res = fallbackExplain(field, value)
    }
    if (res) cache.current.set(key, res)
    return res
  }
}

export const memorySufficient = hasEnoughMemory
