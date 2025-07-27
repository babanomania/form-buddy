
import { logger, loggerError } from './logger.js';

// Simple in-memory cache for WebLLM engines by model id
const engineCache = new Map();

function stripThinkTags(text) {
  return text.replace(/<think>.*?<\/think>/gs, '').trim();
}

const envModelId = process.env.REACT_APP_WEBLLM_MODEL_ID || 'Qwen3-1.7B-q4f32_1-MLC';
const defaultSystemPrompt =
  'You are Qwen, an efficient assistant for improving input form fields. Provide one short, actionable suggestion.';

export async function loadLLM(id = envModelId) {
  logger('loadLLM called', { id });

  // Check cache first
  if (engineCache.has(id)) {
    logger('Returning cached WebLLM engine', { id });
    const engine = engineCache.get(id);

    return {
      modelName: id,
      explain: async (
        prompt,
        systemPrompt = defaultSystemPrompt,
      ) => {

        logger('WebLLM explain called', { prompt, systemPrompt });
        const reply = await engine.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        });

        const out = reply.choices?.[0]?.message?.content ?? 'Could not generate suggestion.';
        logger('WebLLM output', { out });

        return stripThinkTags(out);
      },
    };
  }

  return {
    modelName: id,
    explain: async (
      prompt,
      systemPrompt = defaultSystemPrompt,
    ) => {
      
      let engine = engineCache.get(id);
      if (!engine) {
        try {
          const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
          engine = await CreateMLCEngine(id);

          logger('WebLLM engine created', { id });
          engineCache.set(id, engine);

        } catch (err) {
          loggerError('Failed to load WebLLM', err);
          return 'Could not generate suggestion.';
        }
      }

      logger('WebLLM explain called', { prompt, systemPrompt });
      const reply = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const out = reply.choices?.[0]?.message?.content ?? 'Could not generate suggestion.';
      logger('WebLLM output', { out });

      return stripThinkTags(out);
    },
  };
}
