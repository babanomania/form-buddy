export type InputCallback = (field: string, value: string) => void

export interface InputWatcherAgent {
  register(cb: InputCallback): void
  watch(element: HTMLElement, field: string): () => void
}

export function createInputWatcherAgent(): InputWatcherAgent {
  const callbacks: InputCallback[] = []
  return {
    register(cb) {
      callbacks.push(cb)
    },
    watch(element, field) {
      const handler = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        callbacks.forEach((cb) => cb(field, target.value))
      }
      element.addEventListener('blur', handler)
      element.addEventListener('input', handler)
      return () => {
        element.removeEventListener('blur', handler)
        element.removeEventListener('input', handler)
      }
    },
  }
}
