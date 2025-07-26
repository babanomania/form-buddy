import {
  feedbackTypePrompt,
  stepsPrompt,
  versionPrompt,
} from './prompts'

const useWebLLM = import.meta.env.VITE_USE_WEBLLM === 'true'
const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

const modelId = import.meta.env.VITE_WEBLLM_MODEL_ID || 'Qwen3-0.5B-Chat-q4f32_0'
const fallbackModelId = 'RedPajama-INCITE-Chat-3B-v1-q4f32_0'
const systemPrompt =
  'You are a concise assistant helping users correct and improve short form inputs for a bug report. Avoid long explanations. Reply in under two sentences using clear, direct language.'

export async function loadLLM() {
  if (useWebLLM) {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      let engine
      let activeModel = modelId
      try {
        engine = await CreateMLCEngine(modelId)
      } catch (err) {
        console.warn(
          `[LLM] Failed to load model ${modelId}, falling back to ${fallbackModelId}`,
          err,
        )
        engine = await CreateMLCEngine(fallbackModelId)
        activeModel = fallbackModelId
      }

      console.log('[LLM] Active model:', activeModel)
      console.log('[LLM] System prompt:', systemPrompt)

      return {
        explain: async (field: string, text: string) => {
          let prompt: string
          switch (field) {
            case 'steps':
              prompt = stepsPrompt(text)
              break
            case 'version':
              prompt = versionPrompt(text)
              break
            case 'feedbackType':
              prompt = feedbackTypePrompt(text)
              break
            default:
              prompt = `Provide feedback about: "${text}"`
          }
          
          console.log('[LLM] Generating explanation for field:', field, 'with prompt:', prompt)
          const reply = await engine.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            max_tokens: 150,
            temperature: 0.7,
          })

          const out =
            reply.choices?.[0]?.message?.content ?? 'Could not generate suggestion.'

          if (logIO) {
            console.log('[LLM] field:', field, 'input:', text, 'output:', out)
          }
          
          return out
        },
      }
    } catch (err) {
      console.error('Failed to load WebLLM', err)
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    explain: async (field: string, text: string) => {
      let out: string
      switch (field) {
        case 'steps':
          out = stepsPrompt(text)
          break
        case 'version':
          out = versionPrompt(text)
          break
        case 'feedbackType':
          out = feedbackTypePrompt(text)
          break
        default:
          out = `Improve: "${text}"`
      }
      if (logIO) {
        console.log('[LLM] field:', field, 'input:', text, 'output:', out)
      }
      return out
    },
  }
}
export type LLM = Awaited<ReturnType<typeof loadLLM>>
