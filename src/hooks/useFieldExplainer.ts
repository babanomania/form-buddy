import { useEffect, useRef, useState } from 'react'
import { loadLLM, type LLM } from '../lib/llm'

function hasEnoughMemory() {
  const deviceMemory = (navigator as any).deviceMemory || 4
  const heapLimit = (performance as any).memory?.jsHeapSizeLimit || 0
  return deviceMemory >= 4 && heapLimit >= 1.5e9
}

export function useFieldExplainer(enabled = true) {
  const [llm, setLLM] = useState<LLM | null>(null)
  const loading = useRef(false)

  useEffect(() => {
    if (enabled && hasEnoughMemory() && !llm && !loading.current) {
      loading.current = true
      loadLLM().then((m) => setLLM(m))
    }
  }, [enabled, llm])

  return async (value: string) => {
    if (!llm) return null
    if (value.trim().length < 10) {
      return llm.explain(value)
    }
    return null
  }
}

export const memorySufficient = hasEnoughMemory
