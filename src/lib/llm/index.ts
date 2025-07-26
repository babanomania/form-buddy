import {
  feedbackTypePrompt,
  stepsPrompt,
  versionPrompt,
} from './prompts'

function stripThinkTags(text: string) {
  return text.replace(/<think>.*?<\/think>/gs, '').trim()
}

const useWebLLM = import.meta.env.VITE_USE_WEBLLM === 'true'
const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

const modelId = import.meta.env.VITE_WEBLLM_MODEL_ID || 'Qwen3-1.7B-q4f32_1-MLC'
const systemPrompt =
  'You are a concise assistant helping users correct and improve short form inputs for a bug report. Avoid long explanations. Reply in under two sentences using clear, direct language.'

export async function loadLLM() {
  if (useWebLLM) {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      const engine = await CreateMLCEngine(modelId)

      console.log('[LLM] Active model:', modelId)
      console.log('[LLM] System prompt:', systemPrompt)

      return {
        explain: async (
          field: string,
          text: string,
          errorType: string | null,
        ) => {
          let prompt: string
          switch (field) {
            case 'steps':
              prompt = stepsPrompt(text, errorType ?? undefined)
              break
            case 'version':
              prompt = versionPrompt(text, errorType ?? undefined)
              break
            case 'feedbackType':
              prompt = feedbackTypePrompt(text, errorType ?? undefined)
              break
            default:
              prompt = `Provide feedback about: "${text}"${
                errorType ? ` The ML model flagged this as ${errorType}.` : ''
              }`
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
            console.log(
              '[LLM] field:',
              field,
              'input:',
              text,
              'type:',
              errorType,
              'output:',
              out,
            )
          }

          return stripThinkTags(out)
        },
      }
    } catch (err) {
      console.error('Failed to load WebLLM', err)
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    explain: async (
      field: string,
      text: string,
      errorType: string | null,
    ) => {
      let out: string
      switch (field) {
        case 'steps':
          out = stepsPrompt(text, errorType ?? undefined)
          break
        case 'version':
          out = versionPrompt(text, errorType ?? undefined)
          break
        case 'feedbackType':
          out = feedbackTypePrompt(text, errorType ?? undefined)
          break
        default:
          out = `Improve: "${text}"${
            errorType ? ` The ML model flagged this as ${errorType}.` : ''
          }`
      }
      if (logIO) {
        console.log(
          '[LLM] field:',
          field,
          'input:',
          text,
          'type:',
          errorType,
          'output:',
          out,
        )
      }
      return stripThinkTags(out)
    },
  }
}
export type LLM = Awaited<ReturnType<typeof loadLLM>>
