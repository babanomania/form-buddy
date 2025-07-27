export const defaultPromptGenerator = (form, field, error) =>
  `You are Qwen, an efficient assistant for the "${form}" form. The field "${field}" was flagged as "${error}" by a classifier. Provide one short, actionable suggestion.`;
