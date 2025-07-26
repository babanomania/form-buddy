# FormBuddy Agents

This document describes the agents that make up the FormBuddy system — a browser-based AI assistant that enhances bug report forms using a combination of local ML predictions and LLM-generated explanations.

## 1. InputWatcherAgent

**Purpose:**  
Monitors user input fields in real-time and triggers analysis when a field changes.

**Responsibilities:**
- Debounce user input
- Track field focus/blur events
- Send structured input to ML predictor
- Call LLM explainer if high-probability issue detected

---

## 2. PredictiveValidatorAgent

**Purpose:**  
Uses an ML model (TF.js or ONNX) to detect likely user mistakes or incomplete fields before final validation.

**Responsibilities:**
- Accepts field-level features
- Predicts error types (e.g., missing info, vague content)
- Flags fields for further review
- Triggers FieldExplainerAgent if confidence > threshold

---

## 3. FieldExplainerAgent

**Purpose:**  
Uses a browser-compatible LLM (e.g., TinyLlama via WebLLM) to explain vague or incorrect input and suggest improvements.

**Responsibilities:**
- Accepts input + ML prediction context
- Generates plain language suggestions
- Highlights or annotates fields
- Fallbacks gracefully if memory is low

---

## 4. MemoryManagerAgent

**Purpose:**  
Monitors available device memory and dynamically disables the LLM if memory usage exceeds safe thresholds.

**Responsibilities:**
- Check `navigator.deviceMemory` and `performance.memory.jsHeapSizeLimit`
- Toggle LLM availability flag
- Notify other agents if LLM support changes

---

## 5. SubmissionAdvisorAgent

**Purpose:**  
Final pre-submit check to ensure all required corrections have been addressed.

**Responsibilities:**
- Scan all ML and LLM feedback flags
- Provide user summary: “Ready to submit” or “Please fix the highlighted issues”
- Gate submission or allow override
