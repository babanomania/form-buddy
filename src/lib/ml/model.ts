export async function loadModel() {
  // Use a predictable mock when running in test mode
  if (import.meta.env.VITE_TEST_MODE === 'true') {
    return {
      predict: (value: string) => {
        void value
        return 0.9
      },
    }
  }

  // Placeholder: In a real app, you would load a TF.js model from /public/models
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    predict: (input: string) => {
      // Very naive heuristic: flag short or empty input as problematic
      return input.trim().length < 10 ? 0.8 : 0.2
    },
  }
}
export type Model = Awaited<ReturnType<typeof loadModel>>
