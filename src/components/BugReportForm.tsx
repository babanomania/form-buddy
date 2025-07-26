import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
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
  const [checking, setChecking] = useState<Record<string, boolean>>({})

  const watcher = useRef(createInputWatcherAgent())
  const validator = useRef(createPredictiveValidatorAgent(predict))
  const explainer = useRef(createFieldExplainerAgent(explain))
  const memory = useRef(createMemoryManagerAgent())

  useEffect(() => {
    explainer.current.setExplainer(explain)
  }, [explain])
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
      setChecking((c) => ({ ...c, [field]: true }))
      const result = await validator.current.check(field, value)
      if (result) {
        let message = 'This field may be incomplete.'
        memory.current.checkMemory()
        const ex = await explainer.current.getExplanation(
          field,
          value,
          result.type,
        )
        if (ex) message = ex
        setHints((h) => ({ ...h, [field]: message }))
      } else {
        setHints((h) => ({ ...h, [field]: '' }))
      }
      setChecking((c) => ({ ...c, [field]: false }))
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
      .map(([r, field]) => {
        const el = r.current
        return el && 'addEventListener' in el
          ? watcher.current.watch(el, field)
          : () => {}
      })
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          {...fullNameRest}
          inputRef={(el) => {
            fullNameRef.current = el
            fullNameRegRef(el)
          }}
          error={!!errors.fullName}
          helperText={
            checking.fullName
              ? 'Checking...'
              : errors.fullName
                ? 'Required'
                : hints.fullName || ' '
          }
        />

        <TextField
          label="Email"
          type="email"
          {...emailRest}
          inputRef={(el) => {
            emailRef.current = el
            emailRegRef(el)
          }}
          error={!!errors.email}
          helperText={
            checking.email ? 'Checking...' : errors.email ? 'Required' : hints.email || ' '
          }
        />

        <FormControl fullWidth error={!!errors.feedbackType}>
          <InputLabel id="feedback-type-label">Feedback Type</InputLabel>
          <Select
            labelId="feedback-type-label"
            label="Feedback Type"
            {...feedbackRest}
            inputRef={(el) => {
              feedbackTypeRef.current = el
              feedbackRegRef(el)
            }}
          >
            <MenuItem value="Bug">Bug</MenuItem>
            <MenuItem value="Feature">Feature</MenuItem>
            <MenuItem value="UI Issue">UI Issue</MenuItem>
          </Select>
          {errors.feedbackType || hints.feedbackType ? (
            <small>
              {checking.feedbackType
                ? 'Checking...'
                : errors.feedbackType
                  ? 'Required'
                  : hints.feedbackType}
            </small>
          ) : null}
        </FormControl>

        <TextField
          label="App Version"
          {...versionRest}
          inputRef={(el) => {
            versionRef.current = el
            versionRegRef(el)
          }}
          error={!!errors.version}
          helperText={
            checking.version ? 'Checking...' : errors.version ? 'Required' : hints.version || ' '
          }
        />

        <TextField
          label="Steps to Reproduce"
          multiline
          minRows={3}
          {...stepsRest}
          inputRef={(el) => {
            stepsRef.current = el
            stepsRegRef(el)
          }}
          error={!!errors.steps}
          helperText={
            checking.steps ? 'Checking...' : errors.steps ? 'Required' : hints.steps || ' '
          }
        />

        <TextField
          label="Expected Behavior"
          multiline
          minRows={2}
          {...expectedRest}
          inputRef={(el) => {
            expectedRef.current = el
            expectedRegRef(el)
          }}
          error={!!errors.expected}
          helperText={
            checking.expected
              ? 'Checking...'
              : errors.expected
                ? 'Required'
                : hints.expected || ' '
          }
        />

        <TextField
          label="Actual Behavior"
          multiline
          minRows={2}
          {...actualRest}
          inputRef={(el) => {
            actualRef.current = el
            actualRegRef(el)
          }}
          error={!!errors.actual}
          helperText={
            checking.actual ? 'Checking...' : errors.actual ? 'Required' : hints.actual || ' '
          }
        />

        <Button variant="outlined" component="label">
          Upload Screenshot
          <input type="file" hidden {...register('screenshot')} />
        </Button>

        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </Box>
  )
}
export default BugReportForm
