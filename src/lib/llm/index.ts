import {
  feedbackTypePrompt,
  stepsPrompt,
  versionPrompt,
} from './prompts'

const useWebLLM = import.meta.env.VITE_USE_WEBLLM === 'true'

export async function loadLLM() {
  if (useWebLLM) {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      const engine = await CreateMLCEngine('TinyLlama-3B-Chat-q4f32_0')
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
          const reply = await engine.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
          })
          return reply.choices[0].message.content as string
        },
      }
    } catch (err) {
      console.error('Failed to load WebLLM', err)
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    explain: async (field: string, text: string) => {
      switch (field) {
        case 'steps':
          return `⚠️ ${stepsPrompt(text)}`
        case 'version':
          return `⚠️ ${versionPrompt(text)}`
        case 'feedbackType':
          return `⚠️ ${feedbackTypePrompt(text)}`
        default:
          return `Consider providing more detail about: "${text}"`
      }
    },
  }
}
export type LLM = Awaited<ReturnType<typeof loadLLM>>
