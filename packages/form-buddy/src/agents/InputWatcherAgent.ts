export type InputCallback = (field: string, value: string) => void

export interface InputWatcherAgent {
  register(cb: InputCallback): void
  watch(element: EventTarget | null, field: string): () => void
}

function isEventTarget(el: unknown): el is EventTarget {
  return !!el && typeof (el as EventTarget).addEventListener === 'function'
}

export function createInputWatcherAgent(delay = 300): InputWatcherAgent {
  const callbacks: InputCallback[] = []
  const timers = new WeakMap<EventTarget, ReturnType<typeof setTimeout>>()

  return {
    register(cb) {
      callbacks.push(cb)
    },
    watch(element, field) {
      if (!isEventTarget(element)) {
        console.warn('InputWatcherAgent.watch: invalid element', element)
        return () => {}
      }

      const run = (value: string) => {
        callbacks.forEach((cb) => cb(field, value))
      }

      const onInput = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        const existing = timers.get(element)
        if (existing) clearTimeout(existing)
        timers.set(
          element,
          setTimeout(() => {
            run(target.value)
          }, delay),
        )
      }

      const onBlur = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        const existing = timers.get(element)
        if (existing) clearTimeout(existing)
        run(target.value)
      }

      element.addEventListener('input', onInput)
      element.addEventListener('blur', onBlur)

      return () => {
        element.removeEventListener('input', onInput)
        element.removeEventListener('blur', onBlur)
        const t = timers.get(element)
        if (t) clearTimeout(t)
      }
    },
  }
}
