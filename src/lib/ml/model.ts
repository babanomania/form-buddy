const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

export async function loadModel() {
  // Use a predictable mock when running in test mode
  if (import.meta.env.VITE_TEST_MODE === 'true') {
    return {
      predict: (value: string) => {
        void value
        const score = 0.9
        if (logIO) {
          console.log('[ML] input:', value, 'score:', score)
        }
        return score
      },
    }
  }

  // Placeholder: In a real app, you would load a TF.js model from /public/models
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    predict: (input: string) => {
      // Very naive heuristic: flag short or empty input as problematic
      const score = input.trim().length < 10 ? 0.8 : 0.2
      if (logIO) {
        console.log('[ML] input:', input, 'score:', score)
      }
      return score
    },
  }
}
export type Model = Awaited<ReturnType<typeof loadModel>>
