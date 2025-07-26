import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePredictiveValidation } from '../hooks/usePredictiveValidation'
import { useFieldExplainer } from '../hooks/useFieldExplainer'
import {
  createInputWatcherAgent,
  createPredictiveValidatorAgent,
  createFieldExplainerAgent,
  createMemoryManagerAgent,
  createSubmissionAdvisorAgent,
} from '../agents'

interface FormValues {
  fullName: string
  email: string
  feedbackType: 'Bug' | 'Feature' | 'UI Issue'
  version: string
  steps: string
  expected: string
  actual: string
  screenshot?: FileList
}

export function BugReportForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const predict = usePredictiveValidation(true)
  const explain = useFieldExplainer(true)
  const [hints, setHints] = useState<Record<string, string>>({})

  const watcher = useRef(createInputWatcherAgent())
  const validator = useRef(createPredictiveValidatorAgent(predict))
  const explainer = useRef(createFieldExplainerAgent(explain))
  const memory = useRef(createMemoryManagerAgent())
  const advisor = useRef(
    createSubmissionAdvisorAgent([
      'fullName',
      'email',
      'feedbackType',
      'version',
      'steps',
      'expected',
      'actual',
    ])
  )

  useEffect(() => {
    const handle = async (field: string, value: string) => {
      const score = await validator.current.check(field, value)
      if (score) {
        let message = 'This field may be incomplete.'
        memory.current.checkMemory()
        if (memory.current.isLLMEnabled()) {
          const ex = await explainer.current.getExplanation(value)
          if (ex) message = ex
        }
        setHints((h) => ({ ...h, [field]: message }))
      } else {
        setHints((h) => ({ ...h, [field]: '' }))
      }
    }
    watcher.current.register(handle)
  }, [])

  const onSubmit = (data: FormValues) => {
    if (advisor.current.canSubmit(hints)) {
      alert(JSON.stringify(data, null, 2))
    } else {
      alert('Please fix the highlighted issues before submitting.')
    }
  }

  const fullNameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const feedbackTypeRef = useRef<HTMLSelectElement | null>(null)
  const versionRef = useRef<HTMLInputElement | null>(null)
  const stepsRef = useRef<HTMLTextAreaElement | null>(null)
  const expectedRef = useRef<HTMLTextAreaElement | null>(null)
  const actualRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const refs: [React.RefObject<HTMLElement | null>, keyof FormValues][] = [
      [fullNameRef, 'fullName'],
      [emailRef, 'email'],
      [feedbackTypeRef, 'feedbackType'],
      [versionRef, 'version'],
      [stepsRef, 'steps'],
      [expectedRef, 'expected'],
      [actualRef, 'actual'],
    ]
    const cleanups = refs
      .filter(([r]) => r.current)
      .map(([r, field]) => watcher.current.watch(r.current!, field))
    return () => {
      cleanups.forEach((c) => c())
    }
  }, [])

  const {
    ref: fullNameRegRef,
    ...fullNameRest
  } = register('fullName', { required: true })
  const { ref: emailRegRef, ...emailRest } = register('email', { required: true })
  const { ref: feedbackRegRef, ...feedbackRest } = register('feedbackType', { required: true })
  const { ref: versionRegRef, ...versionRest } = register('version', { required: true })
  const { ref: stepsRegRef, ...stepsRest } = register('steps', { required: true })
  const { ref: expectedRegRef, ...expectedRest } = register('expected', { required: true })
  const { ref: actualRegRef, ...actualRest } = register('actual', { required: true })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Full Name</label>
        <input
          {...fullNameRest}
          ref={(el) => {
            fullNameRef.current = el
            fullNameRegRef(el)
          }}
        />
        {errors.fullName && <span>Required</span>}
        {hints.fullName && <small>{hints.fullName}</small>}
      </div>

      <div>
        <label>Email</label>
        <input
          {...emailRest}
          type="email"
          ref={(el) => {
            emailRef.current = el
            emailRegRef(el)
          }}
        />
        {errors.email && <span>Required</span>}
        {hints.email && <small>{hints.email}</small>}
      </div>

      <div>
        <label>Feedback Type</label>
        <select
          {...feedbackRest}
          ref={(el) => {
            feedbackTypeRef.current = el
            feedbackRegRef(el)
          }}
        >
          <option value="Bug">Bug</option>
          <option value="Feature">Feature</option>
          <option value="UI Issue">UI Issue</option>
        </select>
        {errors.feedbackType && <span>Required</span>}
        {hints.feedbackType && <small>{hints.feedbackType}</small>}
      </div>

      <div>
        <label>App Version</label>
        <input
          {...versionRest}
          ref={(el) => {
            versionRef.current = el
            versionRegRef(el)
          }}
        />
        {errors.version && <span>Required</span>}
        {hints.version && <small>{hints.version}</small>}
      </div>

      <div>
        <label>Steps to Reproduce</label>
        <textarea
          {...stepsRest}
          ref={(el) => {
            stepsRef.current = el
            stepsRegRef(el)
          }}
        />
        {errors.steps && <span>Required</span>}
        {hints.steps && <small>{hints.steps}</small>}
      </div>

      <div>
        <label>Expected Behavior</label>
        <textarea
          {...expectedRest}
          ref={(el) => {
            expectedRef.current = el
            expectedRegRef(el)
          }}
        />
        {errors.expected && <span>Required</span>}
        {hints.expected && <small>{hints.expected}</small>}
      </div>

      <div>
        <label>Actual Behavior</label>
        <textarea
          {...actualRest}
          ref={(el) => {
            actualRef.current = el
            actualRegRef(el)
          }}
        />
        {errors.actual && <span>Required</span>}
        {hints.actual && <small>{hints.actual}</small>}
      </div>

      <div>
        <label>Screenshot (optional)</label>
        <input type="file" {...register('screenshot')} />
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
export default BugReportForm
