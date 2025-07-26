import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useFormBuddy, type FieldDetail } from '../hooks/useFormBuddy'

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

function InnerForm() {
  const { register, handleSubmit, formState: { errors } } = useFormContext<FormValues>()
  const { handleBlur, loading } = useFormBuddy<FormValues>(FORM_DESCRIPTION, FIELDS)

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2))
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {loading && <small>Initializing assistant...</small>}
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          {...register('fullName', { required: 'Required' })}
          onBlur={(e) => handleBlur('fullName', e.target.value)}
          error={!!errors.fullName}
          helperText={errors.fullName?.message || ' '}
        />

        <TextField
          label="Email"
          type="email"
          {...register('email', { required: 'Required' })}
          onBlur={(e) => handleBlur('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email?.message || ' '}
        />

        <FormControl fullWidth error={!!errors.feedbackType}>
          <InputLabel id="feedback-type-label">Feedback Type</InputLabel>
          <Select
            labelId="feedback-type-label"
            label="Feedback Type"
            defaultValue="Bug"
            {...register('feedbackType', { required: 'Required' })}
            onBlur={(e) => handleBlur('feedbackType', (e.target as HTMLInputElement).value)}
          >
            <MenuItem value="Bug">Bug</MenuItem>
            <MenuItem value="Feature">Feature</MenuItem>
            <MenuItem value="UI Issue">UI Issue</MenuItem>
          </Select>
          <small>{errors.feedbackType?.message || ' '}</small>
        </FormControl>

        <TextField
          label="App Version"
          {...register('version', { required: 'Required' })}
          onBlur={(e) => handleBlur('version', e.target.value)}
          error={!!errors.version}
          helperText={errors.version?.message || ' '}
        />

        <TextField
          label="Steps to Reproduce"
          multiline
          minRows={3}
          {...register('steps', { required: 'Required' })}
          onBlur={(e) => handleBlur('steps', e.target.value)}
          error={!!errors.steps}
          helperText={errors.steps?.message || ' '}
        />

        <TextField
          label="Expected Behavior"
          multiline
          minRows={2}
          {...register('expected', { required: 'Required' })}
          onBlur={(e) => handleBlur('expected', e.target.value)}
          error={!!errors.expected}
          helperText={errors.expected?.message || ' '}
        />

        <TextField
          label="Actual Behavior"
          multiline
          minRows={2}
          {...register('actual', { required: 'Required' })}
          onBlur={(e) => handleBlur('actual', e.target.value)}
          error={!!errors.actual}
          helperText={errors.actual?.message || ' '}
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

export function BugReportForm() {
  const methods = useForm<FormValues>()

  return (
    <FormProvider {...methods}>
      <InnerForm />
    </FormProvider>
  )
}

export default BugReportForm
