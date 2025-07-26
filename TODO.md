# FormBuddy TODOs

This document tracks implementation tasks, features, and enhancements.

## ✅ Core MVP

- [x] Scaffold React Hook Form structure
- [x] Build Bug Report form UI
- [x] Integrate basic predictive validation hook
- [x] Add memory-aware LLM loader logic

## 🧠 ML Model

 - [x] Create synthetic bug report dataset (complete vs incomplete)
 - [x] Train TF.js / ONNX model for predictive validation
- [x] Add live prediction on field blur or debounce

## 💬 Gen AI Integration

- [ ] Load TinyLlama or WebLLM model in browser
- [x] Generate error explanations for:
  - Vague “Steps to Reproduce”
  - Invalid or missing version number
  - Unclassified feedback type
- [x] Disable LLM if memory is below threshold
- [x] Create reusable prompt templates

## 🧩 Agent System

 - [x] Implement InputWatcherAgent
 - [x] Implement PredictiveValidatorAgent
 - [x] Implement FieldExplainerAgent
 - [x] Implement MemoryManagerAgent
 - [x] Implement SubmissionAdvisorAgent

## 🧪 Testing

- [x] Add test mode with mock predictions
- [x] Memory limit simulation mode
- [x] Verify fallback to static rules on low-end devices

## 📦 Deployment

- [ ] Vite + static hosting
- [ ] Offline-first build via service workers (optional)
- [ ] Sample bug reports for demo

## 📚 Documentation

- [x] Create `README.md` with architecture
- [x] Create `agents.md`
- [x] Create `todo.md`
 - [x] Add `hooks.ts` documentation
 - [x] Add contributor guidelines
