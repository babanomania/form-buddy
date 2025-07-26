import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useFormBuddy, type FieldDetail, defaultPromptGenerator } from 'form-buddy'

interface FormValues {
  fullName: string
  email: string
  feedbackType: 'Bug' | 'Feature' | 'UI Issue'
  version: string
  steps: string
  expected: string
  actual: string
  screenshot?: FileList | null
}

const FORM_DESCRIPTION = 'Bug report submission form for the FormBuddy demo application.'

const FIELDS: FieldDetail[] = [
  { name: 'fullName', description: 'Your full name' },
  { name: 'email', description: 'Contact email address' },
  { name: 'feedbackType', description: 'Bug, Feature or UI Issue' },
  { name: 'version', description: 'Application version number' },
  { name: 'steps', description: 'Steps to reproduce the problem' },
  { name: 'expected', description: 'Expected behaviour of the application' },
  { name: 'actual', description: 'Actual behaviour observed' },
]

const schema: yup.ObjectSchema<FormValues> = yup.object({
  fullName: yup.string().required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
  feedbackType: yup
    .string()
    .oneOf(['Bug', 'Feature', 'UI Issue'], 'Invalid type')
    .required('Required'),
  version: yup
    .string()
    .matches(/\d+\.\d+\.\d+/, 'Invalid version')
    .required('Required'),
  steps: yup.string().min(10, 'Too short').required('Required'),
  expected: yup.string().required('Required'),
  actual: yup.string().required('Required'),
  screenshot: yup.mixed<FileList>().nullable(),
})

function InnerForm() {
  const { register, handleSubmit, trigger, formState: { errors } } = useFormContext<FormValues>()
  const getPrompt = (
    form: string,
    field: string,
    error: string,
  ) => {
    switch (error) {
      case 'missing':
        return `You are assisting with the "${form}" form. The field "${field}" is missing information. Provide a short suggestion.`
      case 'invalid':
        return `You are assisting with the "${form}" form. The field "${field}" looks invalid. Explain briefly how to fix it.`
      default:
        return defaultPromptGenerator(form, field, error)
    }
  }

  const { handleBlur, loading, checking } = useFormBuddy<FormValues>(
    FORM_DESCRIPTION,
    FIELDS,
    getPrompt,
    {
      validationModelName: 'bug_report_classifier.onnx',
      llmModelName: import.meta.env.VITE_WEBLLM_MODEL_ID,
      threshold: 0.7,
    },
  )

  const fullNameField = register('fullName')
  const emailField = register('email')
  const feedbackTypeField = register('feedbackType')
  const versionField = register('version')
  const stepsField = register('steps')
  const expectedField = register('expected')
  const actualField = register('actual')
  const screenshotField = register('screenshot')

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {loading && <small>Initializing assistant...</small>}
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          {...fullNameField}
          onBlur={async (e) => {
            fullNameField.onBlur(e)
            const valid = await trigger('fullName')
            if (valid) await handleBlur('fullName', e.target.value)
          }}
          error={!!errors.fullName}
          helperText={checking.fullName ? 'Checking...' : errors.fullName?.message || ' '}
        />

        <TextField
          label="Email"
          type="email"
          {...emailField}
          onBlur={async (e) => {
            emailField.onBlur(e)
            const valid = await trigger('email')
            if (valid) await handleBlur('email', e.target.value)
          }}
          error={!!errors.email}
          helperText={checking.email ? 'Checking...' : errors.email?.message || ' '}
        />

        <FormControl fullWidth error={!!errors.feedbackType}>
          <InputLabel id="feedback-type-label">Feedback Type</InputLabel>
          <Select
            labelId="feedback-type-label"
            label="Feedback Type"
            defaultValue="Bug"
            {...feedbackTypeField}
            onBlur={async (e) => {
              feedbackTypeField.onBlur(e)
              const valid = await trigger('feedbackType')
              if (valid) await handleBlur('feedbackType', (e.target as HTMLInputElement).value)
            }}
          >
            <MenuItem value="Bug">Bug</MenuItem>
            <MenuItem value="Feature">Feature</MenuItem>
            <MenuItem value="UI Issue">UI Issue</MenuItem>
          </Select>
          <small>{checking.feedbackType ? 'Checking...' : errors.feedbackType?.message || ' '}</small>
        </FormControl>

        <TextField
          label="App Version"
          {...versionField}
          onBlur={async (e) => {
            versionField.onBlur(e)
            const valid = await trigger('version')
            if (valid) await handleBlur('version', e.target.value)
          }}
          error={!!errors.version}
          helperText={checking.version ? 'Checking...' : errors.version?.message || ' '}
        />

        <TextField
          label="Steps to Reproduce"
          multiline
          minRows={3}
          {...stepsField}
          onBlur={async (e) => {
            stepsField.onBlur(e)
            const valid = await trigger('steps')
            if (valid) await handleBlur('steps', e.target.value)
          }}
          error={!!errors.steps}
          helperText={checking.steps ? 'Checking...' : errors.steps?.message || ' '}
        />

        <TextField
          label="Expected Behavior"
          multiline
          minRows={2}
          {...expectedField}
          onBlur={async (e) => {
            expectedField.onBlur(e)
            const valid = await trigger('expected')
            if (valid) await handleBlur('expected', e.target.value)
          }}
          error={!!errors.expected}
          helperText={checking.expected ? 'Checking...' : errors.expected?.message || ' '}
        />

        <TextField
          label="Actual Behavior"
          multiline
          minRows={2}
          {...actualField}
          onBlur={async (e) => {
            actualField.onBlur(e)
            const valid = await trigger('actual')
            if (valid) await handleBlur('actual', e.target.value)
          }}
          error={!!errors.actual}
          helperText={checking.actual ? 'Checking...' : errors.actual?.message || ' '}
        />

        <Button variant="outlined" component="label">
          Upload Screenshot
          <input type="file" hidden {...screenshotField} />
        </Button>

        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </Box>
  )
}

export function BugReportForm() {
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  return (
    <FormProvider {...methods}>
      <InnerForm />
    </FormProvider>
  )
}

export default BugReportForm
