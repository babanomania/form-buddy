export function createMemoryManagerAgent(thresholdMB = 4000) {
    const simulateLowMemory = process.env.REACT_APP_LOW_MEMORY === 'true';
    const listeners = [];
    let llmEnabled = true;
    const checkMemory = () => {
        const nav = navigator;
        const deviceMemory = nav.deviceMemory || 4;
        const ok = !simulateLowMemory && deviceMemory * 1024 >= thresholdMB;
        if (ok !== llmEnabled) {
            llmEnabled = ok;
            listeners.forEach((l) => l(llmEnabled));
        }
    };
    return {
        checkMemory,
        onChange(cb) {
            listeners.push(cb);
        },
        isLLMEnabled() {
            return llmEnabled;
        },
    };
}
