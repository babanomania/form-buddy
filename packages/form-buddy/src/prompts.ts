

export type SystemPromptGenerator = (
  formDescription: string,
  fieldName: string,
  errorType: string,
) => string

export const defaultPromptGenerator: SystemPromptGenerator = (
  form,
  field,
  error,
) =>
  `You are Qwen, an efficient assistant for the "${form}" form. The field "${field}" was flagged as "${error}" by a classifier. Provide one short, actionable suggestion.`
