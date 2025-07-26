# Custom Hooks

This project provides small React hooks used by the agent system.

## `usePredictiveValidation`
Loads a lightweight ML model and returns an async function that scores a field's value. If the model is not loaded yet, the function resolves to `null`.

## `useFieldExplainer`
Loads a browser friendly LLM and returns an async function that can provide a short explanation for vague input. The hook checks memory limits before loading the model.
