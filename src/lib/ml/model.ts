const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

export interface Prediction {
  score: number
  type: string
}

export async function loadModel() {
  // Use a predictable mock when running in test mode
  if (import.meta.env.VITE_TEST_MODE === 'true') {
    return {
      predict: (value: string): Prediction => {
        void value
        const result = { score: 0.9, type: 'incomplete' } as Prediction
        if (logIO) {
          console.log('[ML] input:', value, 'score:', result.score, 'type:', result.type)
        }
        return result
      },
    }
  }

  // Placeholder: In a real app, you would load a TF.js model from /public/models
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    predict: (input: string): Prediction => {
      const trimmed = input.trim()
      let score: number
      let type: string
      if (!trimmed) {
        score = 0.9
        type = 'missing'
      } else if (trimmed.length < 10) {
        score = 0.8
        type = 'too short'
      } else {
        score = 0.2
        type = 'ok'
      }
      if (logIO) {
        console.log('[ML] input:', input, 'score:', score, 'type:', type)
      }
      return { score, type }
    },
  }
}
export type Model = Awaited<ReturnType<typeof loadModel>>
