import * as ort from 'onnxruntime-web'

const logIO = import.meta.env.VITE_LOG_MODEL_IO === 'true'

export interface Prediction {
  score: number
  type: string
}

const defaultModelName = 'bug_report_classifier.onnx'

export async function loadModel(
  name: string = defaultModelName,
  errorTypes: string[] = ['missing', 'too short', 'vague', 'ok'],
) {
  const orderedTypes = [...errorTypes].sort()
  const response = await fetch(`/models/${name}`)
  const buffer = await response.arrayBuffer()
  
  // ensure the WASM backend can locate its binaries
  if (!ort.env.wasm.wasmPaths) {
    ort.env.wasm.wasmPaths = '/wasm/'
  }

  const session = await ort.InferenceSession.create(buffer)

  return {
    modelName: name,
    async predict(field: string, value: string): Promise<Prediction> {
      const feeds: Record<string, ort.Tensor> = {
        field: new ort.Tensor('string', [field], [1, 1]),
        value: new ort.Tensor('string', [value], [1, 1]),
      }
      const results = await session.run(feeds)
      const label = (results.label.data as string[])[0]
      let score = 0
      if (results.probabilities && orderedTypes.includes(label)) {
        const probs = results.probabilities.data as Float32Array
        const idx = orderedTypes.indexOf(label)
        score = probs[idx]
      }
      if (logIO) {
        console.log('[ML] field:', field, 'value:', value, 'score:', score, 'type:', label)
      }
      return { score, type: label }
    },
  }
}

export type Model = Awaited<ReturnType<typeof loadModel>>
