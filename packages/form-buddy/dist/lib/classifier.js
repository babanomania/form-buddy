import * as ort from 'onnxruntime-web';
// ESM import only. Do not set wasmPaths or use UMD build.
const logIO = process.env?.REACT_APP_LOG_MODEL_IO === 'true';
function preprocess(field, value) {
    let v = value;
    if (v === '')
        v = '<EMPTY>';
    if (field === 'fullName' && /\d/.test(v)) {
        v += ' <HAS_DIGIT>';
    }
    return v;
}
export async function loadModel(name, errorTypes) {
    const orderedTypes = [...errorTypes].sort();
    const response = await fetch(`/models/${name}`);
    const buffer = await response.arrayBuffer();
    const session = await ort.InferenceSession.create(buffer);
    return {
        modelName: name,
        async predict(field, value) {
            const preValue = preprocess(field, value);
            const feeds = {
                field: new ort.Tensor('string', [field], [1, 1]),
                value: new ort.Tensor('string', [preValue], [1, 1]),
            };
            const results = await session.run(feeds);
            const label = results.label.data[0];
            let score = 0;
            if (results.probabilities && orderedTypes.includes(label)) {
                const probs = results.probabilities.data;
                const idx = orderedTypes.indexOf(label);
                score = probs[idx];
            }
            if (logIO) {
                console.log('[ML] field:', field, 'value:', value, 'score:', score, 'type:', label);
            }
            return { score, type: label };
        },
    };
}
