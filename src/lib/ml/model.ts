export async function loadModel() {
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
