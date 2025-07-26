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

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to try it out.

The service worker is only registered in production builds. Run `npm run build`
followed by `npm run preview` to test offline support.

### Training the ML model

The repository includes a small Python script that trains a text
classifier on the synthetic bug report dataset and exports it to ONNX
format. Each row of the dataset now contains per-field error labels so
the model can predict issues for individual inputs. The resulting file
is placed in `public/models` and can be loaded by the predictive
validation hook.

Install the Python requirements first:

```bash
pip install -r requirements.txt
```

Then run the training script:

```bash
python scripts/train_model.py
```

## Project Structure

This repo now uses **npm workspaces**.

- `packages/form-buddy` – reusable hooks and agents
- `packages/example` – demo application
- `packages/form-buddy/src/hooks/useFormBuddy.ts` – main helper hook
- `packages/form-buddy/src/lib/ml/model.ts` – placeholder ML implementation
- `packages/form-buddy/src/lib/llm/index.ts` – mock LLM client
- `packages/example/src/components/BugReportForm.tsx` – example form component
- `packages/example/public/models` – place to store local model files

FormBuddy demonstrates how far browser‑native intelligence can go for user friendly bug reports.

## Building for Static Hosting

Generate a production build with:

```bash
npm run build
```

The optimized site is written to `dist/` and includes a service worker for offline usage. Preview it locally with `npm run preview` and deploy the `dist` folder to any static host.
If your bundle is larger than 2 MiB, adjust the Workbox caching limit in
`vite.config.ts` using `workbox.maximumFileSizeToCacheInBytes` so the service
worker can precache all assets.

## Sample Bug Reports

Example bug report data is available in `data/bugReports.json` for demos or testing.
