export type Explainer = (
  field: string,
  value: string,
  errorType: string | null,
) => Promise<string | null>

export interface FieldExplainerAgent {
  getExplanation(
    field: string,
    value: string,
    errorType: string | null,
  ): Promise<string | null>
  setExplainer(fn: Explainer): void
}

export function createFieldExplainerAgent(explain: Explainer): FieldExplainerAgent {
  let current = explain
  const cache = new Map<string, string>()
  return {
    async getExplanation(field, value, errorType) {
      const key = `${field}|${value}|${errorType ?? ''}`
      const cached = cache.get(key)
      if (cached) return cached
      const out = await current(field, value, errorType)
      if (out) cache.set(key, out)
      return out
    },
    setExplainer(fn) {
      current = fn
      cache.clear()
    },
  }
}
