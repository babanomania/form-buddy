export type Validator = (value: string) => Promise<number | null>

export interface PredictiveValidatorAgent {
  check(field: string, value: string): Promise<number | null>
}

export function createPredictiveValidatorAgent(validate: Validator): PredictiveValidatorAgent {
  return {
    check(_field, value) {
      return validate(value)
    },
  }
}
