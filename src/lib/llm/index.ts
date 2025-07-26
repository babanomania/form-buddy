import {
  feedbackTypePrompt,
  stepsPrompt,
  versionPrompt,
} from './prompts'

const useWebLLM = import.meta.env.VITE_USE_WEBLLM === 'true'
const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

const modelId = import.meta.env.VITE_WEBLLM_MODEL_ID || 'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC'

export async function loadLLM() {
  if (useWebLLM) {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      const engine = await CreateMLCEngine(modelId)
      
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
          
          console.log('[LLM] Generating explanation for field:', field, 'with prompt:', prompt);
          const reply = await engine.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
          })
          
          if (!reply.choices || reply.choices.length === 0) {
            console.error('[LLM] No choices returned from WebLLM')
            return `⚠️ Unable to provide explanation for "${text}"`
          }
          const out = reply.choices[0].message.content as string

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
          out = `⚠️ ${stepsPrompt(text)}`
          break
        case 'version':
          out = `⚠️ ${versionPrompt(text)}`
          break
        case 'feedbackType':
          out = `⚠️ ${feedbackTypePrompt(text)}`
          break
        default:
          out = `Consider providing more detail about: "${text}"`
      }
      if (logIO) {
        console.log('[LLM] field:', field, 'input:', text, 'output:', out)
      }
      return out
    },
  }
}
export type LLM = Awaited<ReturnType<typeof loadLLM>>
