import { useRef } from 'react'
import { loadModel, type Model, type Prediction } from '../lib/ml/model'

export function usePredictiveValidation(enabled = true) {
  const modelRef = useRef<Model | null>(null)
  const loading = useRef<Promise<Model> | null>(null)

  const getModel = async () => {
    if (modelRef.current) return modelRef.current
    if (!enabled) return null
    if (!loading.current) {
      loading.current = loadModel().then((m) => {
        modelRef.current = m
        return m
      })
    }
    return loading.current
  }

  return async (value: string): Promise<Prediction | null> => {
    const model = await getModel()
    if (!model) return null
    const result = model.predict(value)
    return result.score > 0.7 ? result : null
  }
}
