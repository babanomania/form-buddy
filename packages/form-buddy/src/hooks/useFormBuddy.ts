import { useEffect, useRef, useState } from 'react'
import { useFormContext, type FieldValues, type Path } from 'react-hook-form'
import { loadModel, type Model, type Prediction } from '../lib/classifier'
import { loadLLM, type LLM } from '../lib/llm'
import type { SystemPromptGenerator } from '../prompts'
import {
  feedbackTypePrompt,
  stepsPrompt,
  versionPrompt,
} from '../prompts'

export interface FieldDetail {
  name: string
  description: string
}

export interface FormBuddyOptions {
  validationModelName?: string
  llmModelName?: string
  threshold?: number
}

export function useFormBuddy<T extends FieldValues>(
  formDescription: string,
  fields: FieldDetail[],
  getSystemPrompt: SystemPromptGenerator,
  options: FormBuddyOptions = {},
) {
  const { setError } = useFormContext<T>()
  const {
    validationModelName,
    llmModelName: llmName,
    threshold = 0.7,
  } = options
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState<Record<string, boolean>>({})
  const [mlModelName, setMLModelName] = useState<string | null>(null)
  const [llmModelName, setLLMModelName] = useState<string | null>(null)
  const modelRef = useRef<Model | null>(null)
  const llmRef = useRef<LLM | null>(null)
  const cache = useRef(new Map<string, string>())
  const fieldMap = useRef<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, f.description])),
  )

  useEffect(() => {
    let canceled = false
    Promise.all([loadModel(validationModelName), loadLLM(llmName)]).then(([model, llm]) => {
      if (!canceled) {
        modelRef.current = model
        llmRef.current = llm
        setMLModelName(model.modelName)
        setLLMModelName(llm.modelName)
        setLoading(false)
      }
    })
    return () => {
      canceled = true
    }
  }, [validationModelName, llmName])

  const handleBlur = async (name: Path<T>, value: string) => {

    if (!modelRef.current || !llmRef.current) return
    setChecking((m) => ({ ...m, [name]: true }))

    const key = `${name}|${value}`
    const cached = cache.current.get(key)
    if (cached) {
      setError(name, { type: 'formbuddy', message: cached })
      setChecking((m) => ({ ...m, [name]: false }))
      return
    }

    const prediction: Prediction = modelRef.current.predict(value)
    if (prediction.score > threshold) {
      const fieldDesc = fieldMap.current[name] || ''
      const text = `${value}\n\nForm: ${formDescription}\nField: ${fieldDesc}`
      const systemPrompt = getSystemPrompt(
        formDescription,
        fieldDesc,
        prediction.type,
      )
      
      let prompt: string
      switch (name) {
        case 'steps':
          prompt = stepsPrompt(text, prediction.type)
          break
        case 'version':
          prompt = versionPrompt(text, prediction.type)
          break
        case 'feedbackType':
          prompt = feedbackTypePrompt(text, prediction.type)
          break
        default:
          prompt = `Provide feedback about: "${text}"${
            prediction.type ? ` The ML model flagged this as ${prediction.type}.` : ''
          }`
      }
      const message = await llmRef.current.explain(prompt, systemPrompt)
      if (message) {
        cache.current.set(key, message)
        setError(name, { type: 'formbuddy', message })
      }
    }
    setChecking((m) => ({ ...m, [name]: false }))
  }

  return {
    handleBlur,
    loading,
    checking,
    mlModelName,
    llmModelName,
  }
}
