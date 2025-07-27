import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { loadModel } from "../lib/classifier";
import { loadLLM } from "../lib/llm";
const logIO = process.env?.REACT_APP_LOG_MODEL_IO === "true";
export function useFormBuddy(formDescription, fields, getSystemPrompt, options = {}) {
    const { setError } = useFormContext();
    const { validationModelName, llmModelName: llmName, threshold = 0.7, errorTypes, } = options;
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState({});
    const [mlModelName, setMLModelName] = useState(null);
    const [llmModelName, setLLMModelName] = useState(null);
    const modelRef = useRef(null);
    const llmRef = useRef(null);
    const cache = useRef(new Map());
    const fieldMap = useRef(Object.fromEntries(fields.map((f) => [f.name, f.description])));
    useEffect(() => {
        let canceled = false;
        Promise.all([
            loadModel(validationModelName, errorTypes),
            loadLLM(llmName),
        ]).then(([model, llm]) => {
            console.log(`[ML] Loaded model: ${model.modelName}, LLM: ${llm.modelName}`);
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
    const handleBlur = async (name, value) => {
        if (logIO)
            console.log(`[ML] Handling blur for field "${name}" with value:`, value);
        if (!modelRef.current || !llmRef.current)
            return;
        if (logIO)
            console.log(`[ML] Starting check for field "${name}"...`);
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
        if (logIO)
            console.log(`[ML] Predicting for field "${name}"...`);
        const prediction = await modelRef.current.predict(name, value);
        if (logIO)
            console.log(`[ML] Field "${name}" prediction:`, prediction);
        if (prediction.score > threshold && prediction.type !== 'ok') {
            if (logIO)
                console.log(`[ML] Field "${name}" prediction above threshold:`, prediction);
            const fieldDesc = fieldMap.current[name] || "";
            const text = `${value}\n\nForm: ${formDescription}\nField: ${fieldDesc}`;
            const systemPrompt = getSystemPrompt(formDescription, fieldDesc, prediction.type);
            const prompt = `${text}${prediction.type ? `\n\nReason: ${prediction.type}` : ""}`;
            if (logIO)
                console.log(`Prompt for LLM:`, prompt);
            if (logIO)
                console.log(`System prompt:`, systemPrompt);
            const message = await llmRef.current.explain(prompt, systemPrompt);
            if (logIO)
                console.log(`LLM response for field "${name}":`, message);
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
