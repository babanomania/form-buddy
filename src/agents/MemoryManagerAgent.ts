interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

export interface MemoryManagerAgent {
  checkMemory(): void
  onChange(cb: (enabled: boolean) => void): void
  isLLMEnabled(): boolean
}

export function createMemoryManagerAgent(thresholdMB = 4000): MemoryManagerAgent {
  const listeners: ((enabled: boolean) => void)[] = []
  let llmEnabled = true

  const checkMemory = () => {
    const nav = navigator as NavigatorWithMemory
    const deviceMemory = nav.deviceMemory || 4
    const ok = deviceMemory * 1024 >= thresholdMB
    if (ok !== llmEnabled) {
      llmEnabled = ok
      listeners.forEach((l) => l(llmEnabled))
    }
  }

  return {
    checkMemory,
    onChange(cb) {
      listeners.push(cb)
    },
    isLLMEnabled() {
      return llmEnabled
    },
  }
}
