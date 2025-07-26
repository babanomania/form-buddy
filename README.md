# FormBuddy

**FormBuddy** is an intelligent layer on top of [React Hook Form](https://react-hook-form.com/) that makes form filling smarter, friendlier, and more error-resistant — all on the client-side.

Powered by a hybrid of in-browser machine learning and generative AI, FormBuddy actively:
- Predicts common user errors
- Explains vague or incomplete inputs
- Guides users to submit clear, actionable data

(Old) Static Errors        |  (New) Dynamic Errors
:-------------------------:|:-------------------------:
![](old_error.png)         |  ![](new_error.png)


## Why FormBuddy?

Because forms deserve better than boring red borders and vague error messages.

FormBuddy enhances [React Hook Form](https://react-hook-form.com/) by adding:

* **Predictive Validation** — A lightweight ML model (via TensorFlow\.js or ONNX.js) flags missing or invalid fields *before* traditional validation kicks in.
* **Field-Level Explanations** — A small LLM (like TinyLlama or Qwen3-1.7B) offers concise, human-like feedback using WebLLM, Transformers.js, or even GGUF+WASM backends.
* **Memory Awareness** — When memory is tight, FormBuddy gracefully disables LLM features and falls back to static hints (`VITE_LOW_MEMORY=true`).
* **Composable Design** — Built directly on React Hook Form, FormBuddy works as a hook (`useFormBuddy`) and can be integrated without changing your existing form code.
* **Customizable Prompts** — You control how prompts are constructed using field-specific templates.
* **Zero Network Calls** — All inference happens inside the browser. No servers, no tokens, no privacy leaks.
* **Debug Logging** — Enable `VITE_LOG_MODEL_IO=true` to log what your ML and LLM models are thinking.

FormBuddy is proof that modern browsers aren’t just Chrome—they’re Chrome with an ML sidekick.

## Using FormBuddy

1. **Identify your form.** Determine the form description and list of fields. For a bug report form we use:

   ```ts
   const FORM_DESCRIPTION = 'Bug report submission form for an application. It collects user feedback on bugs, features, and UI issues.'
   const FIELDS: FieldDetail[] = [
      { name: 'fullName', description: 'full name' },
      { name: 'email', description: 'contact email address' },
      { name: 'feedbackType', description: 'Bug, Feature or UI Issue' },
      { name: 'version', description: 'application version number' },
      { name: 'steps', description: 'steps to reproduce the problem' },
      { name: 'expected', description: 'expected behaviour of the application' },
      { name: 'actual', description: 'actual behaviour observed' },
    ]
   ```

2. **Create labelled data.** A small synthetic dataset is generated with `training/generate_synthetic_data.py` and looks like:

   ```json
   {
     "fullName": "Hannah Stevens",
     "email": "rebecca75@example.org",
     "feedbackType": "UI Issue",
     "appVersion": "v1",
     "stepsToReproduce": "",
     "expectedBehavior": "",
     "actualBehavior": "",
     "screenshotProvided": false,
     "label": "incomplete",
     "errors": {
       "fullName": "ok",
       "email": "ok",
       "appVersion": "invalid",
       "stepsToReproduce": "missing",
       "expectedBehavior": "missing",
       "actualBehavior": "missing"
     }
   }
   ```

   The full dataset is saved to `training/bug_reports_data.json` and is used to train the classifier.

3. **Train the classifier.** Run `python training/train_model.py` to produce an ONNX model. The script reads the dataset, trains a logistic regression pipeline and writes `bug_report_classifier.onnx` to `packages/example/public/models`.

4. **Define system prompts.** Prompts are generated dynamically based on form description, field description and the ML error type. The example application defines a helper:

   ```ts
   const getPrompt = (
      form: string,
      field: string,
      error: string,
    ) => {
      const base = `You are assisting with the "${form}" form.`
      switch (error) {
        case 'missing':
          return `${base} The user left the "${field}" field empty. Explain in one sentence what information should be provided.`
        case 'invalid':
          return `${base} The value for "${field}" looks invalid. Give a brief example of a valid entry.`
        case 'too short':
          return `${base} The input in "${field}" is too short. Suggest how to make it more descriptive.`
        default:
          return defaultPromptGenerator(form, field, error)
      }
    }
   ```

5. **Use the hook.** Call `useFormBuddy` inside your form component:

   ```tsx
   const { handleBlur } = useFormBuddy(FORM_DESCRIPTION, FIELDS, getPrompt, {
     validationModelName: 'bug_report_classifier.onnx',
     llmModelName: import.meta.env.VITE_WEBLLM_MODEL_ID,
     errorTypes: ['missing', 'too short', 'ok'],
   })
   ```


## Training the ML model

The repository includes a small Python script that trains a text
classifier on the synthetic bug report dataset and exports it to ONNX
format. Each row of the dataset now contains per-field error labels so
the model can predict issues for individual inputs. The resulting file
is placed in `packages/example/public/models` and can be loaded by the predictive
validation hook.

1. Install the change to training directory:

```bash
cd training
```

2. Create a virtual environment

```bash
python -m venv venv
. venv/bin/activate
```

3. Next Install the Python requirements:

```bash
pip install -r requirements.txt
```

4. Then run the training script:

```bash
python train_model.py
```

## Testing

Run the example project locally with:

```bash
npm install
npm --workspace packages/example run dev
```

Open `http://localhost:5173` to try it out.

To verify the service worker and production build, run:

```bash
npm --workspace packages/example run build
npm --workspace packages/example run preview
```

## Project Structure

This repo uses **npm workspaces**.

- `packages/form-buddy` – reusable hooks and agents
- `packages/form-buddy/src/hooks/useFormBuddy.ts` – main helper hook
- `packages/form-buddy/src/lib/classifier.ts` – placeholder ML implementation
- `packages/form-buddy/src/lib/llm.ts` – mock LLM client
---
- `packages/example` – demo application
- `packages/example/src/components/BugReportForm.tsx` – example form component
- `packages/example/public/models` – place to store local model files
---
- `training/generate_synthetic_data.py` – script to generate synthetic bug report data for training
- `training/train_model.py` – script to train the bug report classifier and export ONNX model
- `training/requirements.txt` – Python dependencies for training scripts

## License

MIT License. Feel free to fork and adapt!

> Built with ❤️ to show just how far the modern browser has come — ML, LLMs, and empathy, all without leaving the tab.