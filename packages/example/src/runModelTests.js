import { loadModel } from 'form-buddy/src/lib/classifier.js';

const TEST_CASES = [
  ['fullName', 'John Doe', 'ok'],
  ['fullName', 'foo123', 'invalid'],
  ['email', 'john@example.com', 'ok'],
  ['email', 'user.com', 'invalid'],
  ['email', '', 'missing'],
  ['appVersion', 'v2.1.3', 'ok'],
  ['appVersion', 'ver42', 'invalid'],
  [
    'stepsToReproduce',
    'On Android 13, when I open the settings page, the app crashes with error code 500.',
    'ok',
  ],
  ['stepsToReproduce', 'app crashed', 'vague'],
  ['stepsToReproduce', '', 'missing'],
  ['expectedBehavior', 'The app should work without errors.', 'ok'],
  ['expectedBehavior', 'foo bar baz', 'vague'],
  ['expectedBehavior', '', 'missing'],
  ['actualBehavior', 'Instead, it shows a blank screen.', 'ok'],
  ['actualBehavior', 'foo bar', 'vague'],
  ['actualBehavior', '', 'missing'],
];

export async function runModelTests() {
  const { predict } = await loadModel('bug_report_classifier.onnx', [
    'invalid',
    'missing',
    'vague',
    'ok',
  ]);
  let passed = 0;
  for (const [field, value, expected] of TEST_CASES) {
    const { type } = await predict(field, value);
    const ok = type === expected;
    const msg = `${field}: "${value}" => ${type}`;
    if (ok) {
      console.log('✅', msg);
      passed++;
    } else {
      console.error('❌', msg, `(expected ${expected})`);
    }
  }
  console.log(`Model tests: ${passed}/${TEST_CASES.length} passed`);
}

// Expose for manual usage in the browser console
if (typeof window !== 'undefined') {
  window.runModelTests = runModelTests;
}
