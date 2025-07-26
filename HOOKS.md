# Custom Hooks

This project provides small React hooks used by the agent system.

## `usePredictiveValidation`
Loads a lightweight ML model and returns an async function that scores a field's value. If the model is not loaded yet, the function resolves to `null`.
Set `VITE_LOG_MODEL_IO=true` to log model inputs and outputs for debugging.

## `useFieldExplainer`
Loads a browser friendly LLM and returns an async function that can provide a short explanation for vague input. The hook checks memory limits before loading the model. Set `VITE_LOW_MEMORY=true` to simulate a low-memory environment during development.
`VITE_LOG_MODEL_IO=true` will also log explanation prompts and responses.

## `useFormBuddy`
Combines the predictive validator and field explainer into one helper. Pass the form description and an array of field details. It returns an `onBlur` callback and a `loading` flag. Call the callback with the field name and value from your input's `onBlur` handler. The hook loads the ONNX model and WebLLM engine in parallel and updates the RHF error state with any generated message. Results are cached by `field|value` to avoid duplicate LLM calls.
