function stripThinkTags(text) {
    return text.replace(/<think>.*?<\/think>/gs, '').trim();
}
const useWebLLM = process.env?.REACT_APP_USE_WEBLLM === 'true';
const logIO = process.env?.REACT_APP_LOG_MODEL_IO === 'true';
const envModelId = process.env?.REACT_APP_WEBLLM_MODEL_ID || 'Qwen3-1.7B-q4f32_1-MLC';
const defaultSystemPrompt = 'You are Qwen, an efficient assistant for improving bug report form fields. Provide one short, actionable suggestion.';
export async function loadLLM(id = envModelId) {
    if (useWebLLM) {
        try {
            const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
            const engine = await CreateMLCEngine(id);
            console.log('[LLM] Active model:', id);
            console.log('[LLM] System prompt:', defaultSystemPrompt);
            return {
                modelName: id,
                explain: async (prompt, systemPrompt = defaultSystemPrompt) => {
                    console.log('[LLM] Generating explanation with prompt:', prompt);
                    const reply = await engine.chat.completions.create({
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt },
                        ],
                        temperature: 0.7,
                    });
                    const out = reply.choices?.[0]?.message?.content ?? 'Could not generate suggestion.';
                    if (logIO) {
                        console.log('[LLM] input:', prompt, 'output:', out);
                    }
                    return stripThinkTags(out);
                },
            };
        }
        catch (err) {
            console.error('Failed to load WebLLM', err);
        }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
        modelName: id,
        explain: async (prompt, systemPrompt = defaultSystemPrompt) => {
            void systemPrompt;
            // Simple heuristic fallback when WebLLM is disabled
            const reasonMatch = prompt.match(/Reason:\s*(.+)/);
            const fieldMatch = prompt.match(/Field:\s*(.+)/);
            const reason = reasonMatch ? reasonMatch[1].toLowerCase() : '';
            const field = fieldMatch ? fieldMatch[1].toLowerCase() : 'field';
            let out;
            switch (reason) {
                case 'missing':
                    out = `Please fill in the ${field}.`;
                    break;
                case 'too short':
                    out = `Provide a more detailed ${field}.`;
                    break;
                case 'invalid':
                    out = `The ${field} seems invalid. Please correct it.`;
                    break;
                default:
                    out = `Consider improving the ${field}.`;
            }
            if (logIO) {
                console.log('[LLM] input:', prompt, 'output:', out);
            }
            return stripThinkTags(out);
        },
    };
}
