export async function loadLLM() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    explain: async (text: string) => {
      // Mock explanation that rephrases the input
      return `Consider providing more detail about: "${text}"`
    },
  }
}
export type LLM = Awaited<ReturnType<typeof loadLLM>>
