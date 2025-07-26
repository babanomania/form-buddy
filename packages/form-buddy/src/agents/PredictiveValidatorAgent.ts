import type { Prediction } from '../lib/classifier'

export type Validator = (value: string) => Promise<Prediction | null>

export interface PredictiveValidatorAgent {
  check(field: string, value: string): Promise<Prediction | null>
}

export function createPredictiveValidatorAgent(validate: Validator): PredictiveValidatorAgent {
  return {
    check(_field, value) {
      return validate(value)
    },
  }
}
