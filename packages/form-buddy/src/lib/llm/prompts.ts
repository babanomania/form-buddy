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
