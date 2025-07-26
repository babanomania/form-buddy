export interface SubmissionAdvisorAgent {
  canSubmit(hints: Record<string, string>): boolean
}

export function createSubmissionAdvisorAgent(requiredFields: string[]): SubmissionAdvisorAgent {
  return {
    canSubmit(hints) {
      return requiredFields.every((f) => !hints[f])
    },
  }
}
