export type Explainer = (field: string, value: string) => Promise<string | null>

export interface FieldExplainerAgent {
  getExplanation(field: string, value: string): Promise<string | null>
  setExplainer(fn: Explainer): void
}

export function createFieldExplainerAgent(
  explain: Explainer,
): FieldExplainerAgent {
  let current = explain
  return {
    getExplanation(field, value) {
      return current(field, value)
    },
    setExplainer(fn) {
      current = fn
    },
  }
}
