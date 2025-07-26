export function stepsPrompt(text: string, reason?: string) {
  return `The user wrote "${text}" in the Steps to Reproduce field.${
    reason ? ` The ML model flagged this as ${reason}.` : ''
  } Suggest clearer, step-by-step instructions.`
}

export function versionPrompt(text: string, reason?: string) {
  return `The user entered "${text}" as the app version.${
    reason ? ` The ML model flagged this as ${reason}.` : ''
  } Suggest a valid semantic version like 1.2.3.`
}

export function feedbackTypePrompt(text: string, reason?: string) {
  return `The user chose "${text}" for feedback type.${
    reason ? ` The ML model flagged this as ${reason}.` : ''
  } Suggest one of: Bug, Feature, or UI Issue.`
}

export type SystemPromptFn = (
  formDescription: string,
  fieldName: string,
) => string

export type SystemPromptMap = Record<string, SystemPromptFn>

export const defaultSystemPrompts: SystemPromptMap = {
  missing: (form, field) =>
    `You are a concise assistant helping users fill out the "${form}" form. The field "${field}" is missing details. Provide short guidance in one sentence.`,
  "too short": (form, field) =>
    `You are a concise assistant for the "${form}" form. Encourage the user to add more detail to "${field}" in one short sentence.`,
  default: (form, field) =>
    `You are a concise assistant helping users correct and improve the "${field}" field in the "${form}" form. Reply in one short sentence.`,
}
