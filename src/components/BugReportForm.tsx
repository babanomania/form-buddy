import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePredictiveValidation } from '../hooks/usePredictiveValidation'
import { useFieldExplainer, memorySufficient } from '../hooks/useFieldExplainer'

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

  const onBlur = async (field: keyof FormValues, value: string) => {
    const score = await predict(value)
    if (score) {
      let message = 'This field may be incomplete.'
      if (memorySufficient()) {
        const explanation = await explain(value)
        if (explanation) message = explanation
      }
      setHints((h) => ({ ...h, [field]: message }))
    } else {
      setHints((h) => ({ ...h, [field]: '' }))
    }
  }

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Full Name</label>
        <input
          {...register('fullName', { required: true })}
          onBlur={(e) => onBlur('fullName', e.target.value)}
        />
        {errors.fullName && <span>Required</span>}
        {hints.fullName && <small>{hints.fullName}</small>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          {...register('email', { required: true })}
          onBlur={(e) => onBlur('email', e.target.value)}
        />
        {errors.email && <span>Required</span>}
        {hints.email && <small>{hints.email}</small>}
      </div>

      <div>
        <label>Feedback Type</label>
        <select
          {...register('feedbackType', { required: true })}
          onBlur={(e) => onBlur('feedbackType', e.target.value)}
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
          {...register('version', { required: true })}
          onBlur={(e) => onBlur('version', e.target.value)}
        />
        {errors.version && <span>Required</span>}
        {hints.version && <small>{hints.version}</small>}
      </div>

      <div>
        <label>Steps to Reproduce</label>
        <textarea
          {...register('steps', { required: true })}
          onBlur={(e) => onBlur('steps', e.target.value)}
        />
        {errors.steps && <span>Required</span>}
        {hints.steps && <small>{hints.steps}</small>}
      </div>

      <div>
        <label>Expected Behavior</label>
        <textarea
          {...register('expected', { required: true })}
          onBlur={(e) => onBlur('expected', e.target.value)}
        />
        {errors.expected && <span>Required</span>}
        {hints.expected && <small>{hints.expected}</small>}
      </div>

      <div>
        <label>Actual Behavior</label>
        <textarea
          {...register('actual', { required: true })}
          onBlur={(e) => onBlur('actual', e.target.value)}
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
