# FormBuddy TODOs

This document tracks implementation tasks, features, and enhancements.

## ✅ Core MVP

- [x] Scaffold React Hook Form structure
- [x] Build Bug Report form UI
- [x] Integrate basic predictive validation hook
- [x] Add memory-aware LLM loader logic

## 🧠 ML Model

- [ ] Create synthetic bug report dataset (complete vs incomplete)
- [ ] Train TF.js / ONNX model for predictive validation
- [ ] Add live prediction on field blur or debounce

## 💬 Gen AI Integration

- [ ] Load TinyLlama or WebLLM model in browser
- [ ] Generate error explanations for:
  - Vague “Steps to Reproduce”
  - Invalid or missing version number
  - Unclassified feedback type
- [ ] Disable LLM if memory is below threshold
- [ ] Create reusable prompt templates

## 🧩 Agent System

- [ ] Implement InputWatcherAgent
- [ ] Implement PredictiveValidatorAgent
- [ ] Implement FieldExplainerAgent
- [ ] Implement MemoryManagerAgent
- [ ] Implement SubmissionAdvisorAgent

## 🧪 Testing

- [ ] Add test mode with mock predictions
- [ ] Memory limit simulation mode
- [ ] Verify fallback to static rules on low-end devices

## 📦 Deployment

- [ ] Vite + static hosting
- [ ] Offline-first build via service workers (optional)
- [ ] Sample bug reports for demo

## 📚 Documentation

- [x] Create `README.md` with architecture
- [x] Create `agents.md`
- [x] Create `todo.md`
- [ ] Add `hooks.ts` documentation
- [ ] Add contributor guidelines
