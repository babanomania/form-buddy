export type SystemPromptFn = (
  formDescription: string,
  fieldName: string,
) => string

export type SystemPromptMap = Record<string, SystemPromptFn>

export const defaultSystemPrompts: SystemPromptMap = {
  missing: (form, field) =>
    `You are a concise assistant helping users fill out the "${form}" form. The field "${field}" is missing details. Provide short guidance.`,
  "too short": (form, field) =>
    `You are a concise assistant for the "${form}" form. Encourage the user to add more detail to "${field}".`,
  default: (form, field) =>
    `You are a concise assistant helping users correct and improve the "${field}" field in the "${form}" form.`,
}
