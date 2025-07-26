# FormBuddy

FormBuddy is a demo bug reporting form that showcases in-browser machine learning and generative AI helpers. It is built with React, TypeScript and Vite and runs entirely offline.

## Features

- **React Hook Form** for standard form management and validation
- **Predictive Validation** using a lightweight TensorFlow.js model
- **Field Explanation** powered by a mocked WebLLM client with reusable prompt templates
- **Memory Aware** – the LLM features are automatically disabled on devices with low memory (use `VITE_LOW_MEMORY=true` in development to simulate) and fall back to static hints
- **WebLLM Support** – set `VITE_USE_WEBLLM=true` to enable WebLLM. The model can
  be changed with `VITE_WEBLLM_MODEL_ID` if you want to load a different
  prebuilt model. By default it uses a TinyLlama variant.
- **Debug Logging** – set `VITE_LOG_MODEL_IO=true` to print ML and LLM inputs and outputs to the console

## Bug Report Form Fields

- Full Name
- Email
- Feedback Type (Bug, Feature, UI Issue)
- App Version
- Steps to Reproduce
- Expected Behavior
- Actual Behavior
- Screenshot Upload (optional)

When a field looks incomplete, the predictive model flags it and the field explainer offers a short hint. Everything happens in the browser with no network calls.

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

This repo now uses **npm workspaces**.

- `packages/form-buddy` – reusable hooks and agents
- `packages/example` – demo application
- `packages/form-buddy/src/hooks/useFormBuddy.ts` – main helper hook
- `packages/form-buddy/src/lib/classifier.ts` – placeholder ML implementation
- `packages/form-buddy/src/lib/llm.ts` – mock LLM client
- `packages/example/src/components/BugReportForm.tsx` – example form component
- `packages/example/public/models` – place to store local model files

FormBuddy demonstrates how far browser‑native intelligence can go for user friendly bug reports.
