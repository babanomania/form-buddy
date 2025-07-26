# FormBuddy

**FormBuddy** is an intelligent layer on top of [React Hook Form](https://react-hook-form.com/) that makes form filling smarter, friendlier, and more error-resistant — all on the client-side.

Powered by a hybrid of in-browser machine learning and generative AI, FormBuddy actively:
- Predicts common user errors
- Explains vague or incomplete inputs
- Guides users to submit clear, actionable data

---

## Why FormBuddy?

Form validation is no longer just about red borders and `"This field is required."`

**FormBuddy goes further:**
- Predicts likely mistakes before validation
- Uses a lightweight ML model trained on real-world errors
- Integrates a small language model (LLM) to clarify and rephrase inputs
- Built directly on `react-hook-form`, so it’s composable and idiomatic for React

---

## In-Browser Inference: ML + Gen AI

Modern browsers are surprisingly powerful. FormBuddy proves it by running both:

| Model Type | Technology | Purpose |
|------------|------------|---------|
| ML Classifier | TensorFlow.js or ONNX.js | Predicts missing or error-prone fields |
| LLM (TinyLlama, Qwen1.5-0.5B, etc.) | WebLLM / Transformers.js / WASM+GGUF | Expands vague text, offers natural language guidance |

### Memory-Aware Design
- FormBuddy automatically checks available browser memory
- If the heap size is below a safe threshold, the Gen AI explainer is gracefully disabled
- Ensures smooth UX on low-spec devices (e.g., older phones or shared desktops)

```ts
// Example: Memory check before loading LLM
if (navigator.deviceMemory >= 4 && performance.memory?.jsHeapSizeLimit > 1.5e9) {
  loadLLM(); // Safe to load
} else {
  disableLLM(); // Fallback to classic hints
}
````

This means FormBuddy scales down gracefully on weaker hardware while still offering core predictive validation.

---

## Example Use Case: Bug Reporting Assistant

Bug reports are often vague and frustrating:

> “App crashed.”

With FormBuddy:

* The ML model detects this as an incomplete submission
* The LLM steps in to generate helpful prompts like:

  > "Could you share which screen you were on when the crash happened?"

The user is guided, not blocked.

### Smart Form Fields:

| Field                | Enhancement                                            |
| -------------------- | ------------------------------------------------------ |
| `Steps to Reproduce` | LLM expands or clarifies brief descriptions            |
| `App Version`        | ML model flags outdated or missing version numbers     |
| `Feedback Type`      | ML predicts misclassifications (e.g., bug vs UI issue) |
| `Screenshot`         | Model suggests uploading if it's commonly missing      |

---

## Architecture

```
React Hook Form
     ⬇
FormBuddy Hooks
  ├─ usePredictiveValidation (ML-powered)
  └─ useFieldExplainer (LLM-powered)
     ⬇
Dynamic Hints + Auto-suggestions
```

### All AI logic runs in-browser:

* No API keys, no latency, no server cost
* Private by design — form data never leaves the device

---

## Tech Stack

| Layer        | Tool                                  |
| ------------ | ------------------------------------- |
| UI           | React + React Hook Form               |
| ML Inference | TensorFlow\.js / ONNX.js              |
| Gen AI       | WebLLM, Transformers.js, or WASM LLMs |
| Forms        | Example: Bug Report Form              |
| Deployment   | Vite / Next.js SPA / Static Host      |

---

## Getting Started

```bash
git clone https://github.com/yourname/formbuddy.git
cd formbuddy
npm install
npm run dev
```

Then open `http://localhost:5173` and try the Bug Reporting Assistant.

---

## Want to Extend It?

You can create your own FormBuddy-enhanced forms by wrapping your `react-hook-form` config with:

```tsx
const { register, handleSubmit, watch } = useFormBuddy({
  schema: myValidationSchema,
  onPredict: myMLModel,
  onExplain: myLLMClient,
});
```

---

## License

MIT License. Feel free to fork and adapt!

---

> Built with ❤️ to show just how far the modern browser has come — ML, LLMs, and empathy, all without leaving the tab.
