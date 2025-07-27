export function createFieldExplainerAgent(explain) {
    let current = explain;
    const cache = new Map();
    return {
        async getExplanation(field, value, errorType) {
            const key = `${field}|${value}|${errorType ?? ''}`;
            const cached = cache.get(key);
            if (cached)
                return cached;
            const out = await current(field, value, errorType);
            if (out)
                cache.set(key, out);
            return out;
        },
        setExplainer(fn) {
            current = fn;
            cache.clear();
        },
    };
}
