const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

export interface Prediction {
  score: number
  type: string
}

const defaultModelName = 'bug_report_classifier.onnx'

export async function loadModel(
  name: string = defaultModelName,
  errorTypes: string[] = ['missing', 'too short', 'ok'],
) {
  // Use a predictable mock when running in test mode
  if (import.meta.env.VITE_TEST_MODE === 'true') {
    return {
      modelName: name,
      predict: (value: string): Prediction => {
        void value
        const result = { score: 0.9, type: errorTypes[0] || 'incomplete' } as Prediction
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
    modelName: name,
    predict: (input: string): Prediction => {
      const trimmed = input.trim()
      let score: number
      let type: string = errorTypes[errorTypes.length - 1] || 'ok'
      if (!trimmed && errorTypes[0]) {
        score = 0.9
        type = errorTypes[0]
      } else if (trimmed.length < 10 && errorTypes[1]) {
        score = 0.8
        type = errorTypes[1]
      } else {
        score = 0.2
      }
      if (logIO) {
        console.log('[ML] input:', input, 'score:', score, 'type:', type)
      }
      return { score, type }
    },
  }
}
export type Model = Awaited<ReturnType<typeof loadModel>>
