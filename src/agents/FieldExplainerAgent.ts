export type Explainer = (field: string, value: string) => Promise<string | null>

export interface FieldExplainerAgent {
  getExplanation(field: string, value: string): Promise<string | null>
}

export function createFieldExplainerAgent(
  explain: Explainer,
): FieldExplainerAgent {
  return {
    getExplanation(field, value) {
      return explain(field, value)
    },
  }
}
