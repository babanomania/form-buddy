import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { loadModel } from "./lib/classifier.js";
import { loadLLM } from "./lib/llm.js";
import { logger, loggerError } from "./lib/logger.js";

import { defaultPromptGenerator } from "./defaultPromptGenerator.js";

export function useFormBuddy(
  formDescription,
  fields,
  getSystemPrompt = defaultPromptGenerator,
  options = {}
) {
  logger('useFormBuddy initialized', { formDescription, fields, options });
  const { setError } = useFormContext();
  const {
    validationModelName,
    llmModelName: llmName,
    threshold = 0.7,
    errorTypes,
    errorMessageGenerator,
  } = options;
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState({});
  const [mlModelName, setMLModelName] = useState(null);
  const [llmModelName, setLLMModelName] = useState(null);
  const modelRef = useRef(null);
  const llmRef = useRef(null);
  const cache = useRef(new Map());
  const fieldMap = useRef(Object.fromEntries(fields.map((f) => [f.name, f.description])));

  const MEMORY_LIMIT = 100 * 1024 * 1024; // 100MB
  const lowMemory = (() => {
    if (process.env.REACT_APP_LOW_MEMORY !== 'true') return false;

    const perf = typeof performance !== 'undefined' ? performance : null;
    if (!perf || !perf.memory) return true;

    const free = perf.memory.jsHeapSizeLimit - perf.memory.usedJSHeapSize;
    return free < MEMORY_LIMIT;
    
  })();

  useEffect(() => {
    let canceled = false;
    logger('Loading model and LLM...');

    async function load() {
      const model = await loadModel(validationModelName, errorTypes);
      if (canceled) return;
      modelRef.current = model;
      setMLModelName(model.modelName);

      if (lowMemory) {
        logger('Low memory mode enabled, skipping WebLLM');
        llmRef.current = { explain: async () => null, modelName: 'static' };
        setLLMModelName('static');
        setLoading(false);
        return;
      }

      const llm = await loadLLM(llmName);
      if (canceled) return;
      llmRef.current = llm;
      setLLMModelName(llm.modelName);
      setLoading(false);
      logger('Models loaded', { model, llm });
    }

    load();

    return () => {
      canceled = true;
    };

  }, [validationModelName, llmName, errorTypes, lowMemory]);

  const handleBlur = async (name, value) => {

    logger(`handleBlur called for field: ${name}, value:`, value);
    setChecking((m) => ({ ...m, [name]: true }));
    const key = `${name}|${value}`;
    const cached = cache.current.get(key);

    if (cached) {
      logger(`Using cached message for field: ${name}`);
      setError(name, { type: "formbuddy", message: cached });
      setChecking((m) => ({ ...m, [name]: false }));
      return;
    }

    if (!modelRef.current || (!lowMemory && !llmRef.current)) {
      loggerError('Model or LLM not loaded');
      return;
    }

    const prediction = await modelRef.current.predict(name, value);
    logger(`Prediction for field ${name}:`, prediction);

    if (prediction.score > threshold) {
      const fieldDesc = fieldMap.current[name] || "";
      const text = `${value}\n\nForm: ${formDescription}\nField: ${fieldDesc}`;
      const systemPrompt = getSystemPrompt(formDescription, fieldDesc, prediction.type);

      if (lowMemory) {
        const message = errorMessageGenerator
          ? errorMessageGenerator(prediction.type, fieldDesc)
          : `Please review the "${fieldDesc}" field.`;
        cache.current.set(key, message);
        setError(name, { type: "formbuddy", message });
      } else {
        const prompt = `${text}${prediction.type ? `\n\nReason: ${prediction.type}` : ""}`;
        logger('Prompt for LLM:', prompt);
        const message = await llmRef.current.explain(prompt, systemPrompt);
        logger('LLM message:', message);

        if (message) {
          cache.current.set(key, message);
          setError(name, { type: "formbuddy", message });
        }
      }
    }

    setChecking((m) => ({ ...m, [name]: false }));
    logger(`handleBlur finished for field: ${name}`);
  };

  return {
    handleBlur,
    loading,
    checking,
    mlModelName,
    llmModelName,
  };
}
