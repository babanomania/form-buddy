import * as ort from 'onnxruntime-web';
import { logger } from './logger.js';

// Simple in-memory cache for ONNX sessions by model name
const modelSessionCache = new Map();

function makePredict(session, orderedTypes) {
  return async function predict(field, value) {

    logger('predict called', { field, value });
    const feeds = {
      field: new ort.Tensor('string', [field], [1, 1]),
      value: new ort.Tensor('string', [value], [1, 1]),
    };

    const results = await session.run(feeds);
    const label = results.label.data[0];
    let score = 0;

    if (results.probabilities && orderedTypes.includes(label)) {
      const probs = results.probabilities.data;
      const idx = orderedTypes.indexOf(label);
      score = probs[idx];
    }

    logger('predict result', { label, score });
    return { score, type: label };
  };
}

export async function loadModel(name, errorTypes) {
  logger('loadModel called', { name, errorTypes });
  const orderedTypes = [...errorTypes].sort();

  // Check cache first
  if (modelSessionCache.has(name)) {
    
    logger('Returning cached ONNX model session', { name });
    const session = modelSessionCache.get(name);

    return {
      modelName: name,
      predict: makePredict(session, orderedTypes),
    };
  }

  // Not cached: fetch and create session
  const response = await fetch(`/models/${name}`);
  const buffer = await response.arrayBuffer();
  
  logger('ONNX model loaded', { name });
  const session = await ort.InferenceSession.create(buffer);
  
  logger('ONNX model session created');
  modelSessionCache.set(name, session);

  return {
    modelName: name,
    predict: makePredict(session, orderedTypes),
  };
}
