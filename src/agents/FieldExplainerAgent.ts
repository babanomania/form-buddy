export type Explainer = (value: string) => Promise<string | null>

export interface FieldExplainerAgent {
  getExplanation(value: string): Promise<string | null>
}

export function createFieldExplainerAgent(explain: Explainer): FieldExplainerAgent {
  return {
    getExplanation(value) {
      return explain(value)
    },
  }
}
