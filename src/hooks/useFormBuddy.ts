import { useEffect, useRef, useState } from 'react'
import { useFormContext, type FieldValues, type Path } from 'react-hook-form'
import { loadModel, type Model, type Prediction } from '../lib/ml/model'
import { loadLLM, type LLM } from '../lib/llm'

export interface FieldDetail {
  name: string
  description: string
}

export function useFormBuddy<T extends FieldValues>(
  formDescription: string,
  fields: FieldDetail[],
) {
  const { setError } = useFormContext<T>()
  const [loading, setLoading] = useState(true)
  const modelRef = useRef<Model | null>(null)
  const llmRef = useRef<LLM | null>(null)
  const cache = useRef(new Map<string, string>())
  const fieldMap = useRef<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, f.description])),
  )

  useEffect(() => {
    let canceled = false
    Promise.all([loadModel(), loadLLM()]).then(([model, llm]) => {
      if (!canceled) {
        modelRef.current = model
        llmRef.current = llm
        setLoading(false)
      }
    })
    return () => {
      canceled = true
    }
  }, [])

  const handleBlur = async (name: Path<T>, value: string) => {
    if (!modelRef.current || !llmRef.current) return
    const key = `${name}|${value}`
    const cached = cache.current.get(key)
    if (cached) {
      setError(name, { type: 'formbuddy', message: cached })
      return
    }
    const prediction: Prediction = modelRef.current.predict(value)
    if (prediction.score > 0.7) {
      const fieldDesc = fieldMap.current[name] || ''
      const text = `${value}\n\nForm: ${formDescription}\nField: ${fieldDesc}`
      const message = await llmRef.current.explain(
        name,
        text,
        prediction.type,
      )
      if (message) {
        cache.current.set(key, message)
        setError(name, { type: 'formbuddy', message })
      }
    }
  }

  return { handleBlur, loading }
}
