import { useEffect, useRef, useState } from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { loadModel, type Model, type Prediction } from "../lib/classifier";
import { loadLLM, type LLM } from "../lib/llm";
import type { SystemPromptGenerator } from "../prompts";

const logIO = true || import.meta.env.VITE_LOG_MODEL_IO === "true";

export interface FieldDetail {
  name: string;
  description: string;
}

export interface FormBuddyOptions {
  validationModelName?: string;
  llmModelName?: string;
  threshold?: number;
  errorTypes?: string[];
}

export function useFormBuddy<T extends FieldValues>(
  formDescription: string,
  fields: FieldDetail[],
  getSystemPrompt: SystemPromptGenerator,
  options: FormBuddyOptions = {},
) {
  const { setError } = useFormContext<T>();
  const {
    validationModelName,
    llmModelName: llmName,
    threshold = 0.7,
    errorTypes,
  } = options;
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  const [mlModelName, setMLModelName] = useState<string | null>(null);
  const [llmModelName, setLLMModelName] = useState<string | null>(null);
  const modelRef = useRef<Model | null>(null);
  const llmRef = useRef<LLM | null>(null);
  const cache = useRef(new Map<string, string>());
  const fieldMap = useRef<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, f.description])),
  );

  useEffect(() => {
    let canceled = false;
    Promise.all([
      loadModel(validationModelName, errorTypes),
      loadLLM(llmName),
    ]).then(([model, llm]) => {
      console.log(
        `[ML] Loaded model: ${model.modelName}, LLM: ${llm.modelName}`,
      );

      if (!canceled) {
        modelRef.current = model;
        llmRef.current = llm;
        setMLModelName(model.modelName);
        setLLMModelName(llm.modelName);
        setLoading(false);
      }
    });
    return () => {
      canceled = true;
    };
  }, [validationModelName, llmName, errorTypes]);

  const handleBlur = async (name: Path<T>, value: string) => {
    if (logIO)
      console.log(`[ML] Handling blur for field "${name}" with value:`, value);
    if (!modelRef.current || !llmRef.current) return;

    if (logIO) console.log(`[ML] Starting check for field "${name}"...`);
    setChecking((m) => ({ ...m, [name]: true }));

    const key = `${name}|${value}`;
    const cached = cache.current.get(key);

    if (cached) {
      if (logIO)
        console.log(`[ML] Using cached response for field "${name}":`, cached);
      setError(name, { type: "formbuddy", message: cached });
      setChecking((m) => ({ ...m, [name]: false }));
      return;
    }

    if (logIO) console.log(`[ML] Predicting for field "${name}"...`);
    const prediction: Prediction = modelRef.current.predict(
      name as string,
      value,
    );
    if (logIO) console.log(`[ML] Field "${name}" prediction:`, prediction);

    if (prediction.score > threshold) {
      if (logIO)
        console.log(
          `[ML] Field "${name}" prediction above threshold:`,
          prediction,
        );

      const fieldDesc = fieldMap.current[name] || "";
      const text = `${value}\n\nForm: ${formDescription}\nField: ${fieldDesc}`;
      const systemPrompt = getSystemPrompt(
        formDescription,
        fieldDesc,
        prediction.type,
      );

      const prompt = `${text}${
        prediction.type ? `\n\nReason: ${prediction.type}` : ""
      }`;

      if (logIO) console.log(`Prompt for LLM:`, prompt);
      if (logIO) console.log(`System prompt:`, systemPrompt);

      const message = await llmRef.current.explain(prompt, systemPrompt);
      if (logIO) console.log(`LLM response for field "${name}":`, message);

      if (message) {
        cache.current.set(key, message);
        setError(name, { type: "formbuddy", message });
      }
    }
    setChecking((m) => ({ ...m, [name]: false }));
  };

  return {
    handleBlur,
    loading,
    checking,
    mlModelName,
    llmModelName,
  };
}
