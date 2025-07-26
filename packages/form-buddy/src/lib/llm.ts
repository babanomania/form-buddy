function stripThinkTags(text: string) {
  return text.replace(/<think>.*?<\/think>/gs, '').trim()
}

const useWebLLM = import.meta.env.VITE_USE_WEBLLM === 'true'
const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

const envModelId = import.meta.env.VITE_WEBLLM_MODEL_ID || 'Qwen3-1.7B-q4f32_1-MLC'
const defaultSystemPrompt =
  'You are a concise assistant helping users correct and improve short form inputs for a bug report. Avoid long explanations.'

export async function loadLLM(id: string = envModelId) {
  if (useWebLLM) {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      const engine = await CreateMLCEngine(id)

      console.log('[LLM] Active model:', id)
      console.log('[LLM] System prompt:', defaultSystemPrompt)

      return {
        modelName: id,
        explain: async (
          prompt: string,
          systemPrompt: string = defaultSystemPrompt,
        ) => {
          console.log('[LLM] Generating explanation with prompt:', prompt)
          const reply = await engine.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          })

          const out = reply.choices?.[0]?.message?.content ?? 'Could not generate suggestion.'

          if (logIO) {
            console.log('[LLM] input:', prompt, 'output:', out)
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
    modelName: id,
    explain: async (
      prompt: string,
      systemPrompt: string = defaultSystemPrompt,
    ) => {
      void systemPrompt
      const out = `Improve: "${prompt}"`
      if (logIO) {
        console.log('[LLM] input:', prompt, 'output:', out)
      }
      return stripThinkTags(out)
    },
  }
}
export type LLM = Awaited<ReturnType<typeof loadLLM>>
