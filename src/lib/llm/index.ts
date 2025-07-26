import {
  feedbackTypePrompt,
  stepsPrompt,
  versionPrompt,
} from './prompts'

export async function loadLLM() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    // In a real application this would send the prompt to a local LLM.
    // For the demo we return canned responses based on the field.
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
