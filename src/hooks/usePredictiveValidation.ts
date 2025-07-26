import { useEffect, useRef, useState } from 'react'
import { loadModel, type Model } from '../lib/ml/model'

export function usePredictiveValidation(enabled = true) {
  const [model, setModel] = useState<Model | null>(null)
  const loading = useRef(false)

  useEffect(() => {
    if (enabled && !model && !loading.current) {
      loading.current = true
      loadModel().then((m) => setModel(m))
    }
  }, [enabled, model])

  return async (value: string) => {
    if (!model) return null
    const score = model.predict(value)
    return score > 0.7 ? score : null
  }
}
