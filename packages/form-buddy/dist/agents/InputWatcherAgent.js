function isEventTarget(el) {
    return !!el && typeof el.addEventListener === 'function';
}
export function createInputWatcherAgent(delay = 300) {
    const callbacks = [];
    const timers = new WeakMap();
    return {
        register(cb) {
            callbacks.push(cb);
        },
        watch(element, field) {
            if (!isEventTarget(element)) {
                console.warn('InputWatcherAgent.watch: invalid element', element);
                return () => { };
            }
            const run = (value) => {
                callbacks.forEach((cb) => cb(field, value));
            };
            const onInput = (e) => {
                const target = e.target;
                const existing = timers.get(element);
                if (existing)
                    clearTimeout(existing);
                timers.set(element, setTimeout(() => {
                    run(target.value);
                }, delay));
            };
            const onBlur = (e) => {
                const target = e.target;
                const existing = timers.get(element);
                if (existing)
                    clearTimeout(existing);
                run(target.value);
            };
            element.addEventListener('input', onInput);
            element.addEventListener('blur', onBlur);
            return () => {
                element.removeEventListener('input', onInput);
                element.removeEventListener('blur', onBlur);
                const t = timers.get(element);
                if (t)
                    clearTimeout(t);
            };
        },
    };
}
