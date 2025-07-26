export function stepsPrompt(text: string) {
  return `Suggest clearer reproduction steps for: "${text}"`
}

export function versionPrompt(text: string) {
  return `Give a hint about providing a valid version instead of "${text}"`
}

export function feedbackTypePrompt(text: string) {
  return `Help the user pick a feedback type when they entered "${text}"`
}
