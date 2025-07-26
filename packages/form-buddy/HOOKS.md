# Custom Hooks

This project provides small React hooks used by the agent system.

## `useFormBuddy`
Combines the predictive validator and field explainer into one helper. Pass the
form description, an array of field details, a prompt map, and an optional
options object. It returns an `onBlur` callback and a `loading` flag. Call the
callback with the field name and value from your input's `onBlur` handler. The
hook loads the specified validation model and LLM in parallel (falling back to
defaults when not provided) and updates the RHF error state with any generated
message. Results are cached by `field|value` to avoid duplicate LLM calls.

The options object supports:

- `validationModelName` – ONNX model file to load
- `llmModelName` – WebLLM model identifier
- `threshold` – confidence score required to trigger the explainer
- `errorTypes` – list of possible error labels returned by the ML model.
  The array is sorted alphabetically before being passed to the predictor
  to match the class order used when training.
