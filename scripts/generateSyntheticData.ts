import { faker } from '@faker-js/faker';
import { writeFile } from 'fs/promises';

interface BugReport {
  fullName: string;
  email: string;
  feedbackType: 'Bug' | 'Feature' | 'UI Issue';
  appVersion: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  screenshotProvided: boolean;
  label: 'complete' | 'incomplete' | 'vague' | 'invalid';
}

const FEEDBACK_TYPES = ['Bug', 'Feature', 'UI Issue'] as const;
const DEVICES = ['Android 13', 'iOS 17', 'Windows 11', 'macOS 14', 'Ubuntu 22.04'];
const ACTIONS = [
  'tap the Save button',
  'open the settings page',
  'log out',
  'upload a file',
  'enter text in the search bar',
  'start the app',
  'switch accounts',
  'change the theme',
  'select a menu item',
  'resize the window'
];
const ISSUES = [
  'crashes with error code 500',
  'freezes after login',
  'shows a blank screen',
  'does not respond',
  'crashed imediately',
  'bttn not responsive',
  'screen go blank',
  'resets the form',
  'closes unexpectedly',
  'shows garbled text'
];

function shuffle<T>(arr: T[]): T[] {
  return faker.helpers.shuffle(arr);
}

function validVersion(): string {
  const major = faker.number.int({ min: 0, max: 5 });
  const minor = faker.number.int({ min: 0, max: 9 });
  const patch = faker.number.int({ min: 0, max: 9 });
  const suffix = faker.helpers.arrayElement(['', '-beta', '-rc1']);
  return `v${major}.${minor}.${patch}${suffix}`;
}

function invalidVersion(): string {
  return faker.helpers.arrayElement([
    'v1',
    '1.0',
    'version' + faker.number.int({ min: 6, max: 99 }),
    `v${faker.word.words(1)}`,
    ''
  ]);
}

function sentenceWithIssue(): string {
  const device = faker.helpers.arrayElement(DEVICES);
  const action = faker.helpers.arrayElement(ACTIONS);
  const issue = faker.helpers.arrayElement(ISSUES);
  return `On ${device}, when I ${action}, the app ${issue}.`;
}

function shortIssue(): string {
  return faker.helpers.arrayElement([
    'app crashed',
    'it froze',
    'something broke',
    'not sure',
    ''
  ]);
}

function generateEntry(label: BugReport['label']): BugReport {
  const fullName = label === 'invalid' && Math.random() < 0.3
    ? faker.word.words(2)
    : faker.person.fullName();

  const email = label === 'invalid'
    ? faker.word.words(1) + '.com'
    : label === 'incomplete' && Math.random() < 0.3
      ? ''
      : faker.internet.email();

  const feedbackType = faker.helpers.arrayElement(FEEDBACK_TYPES);
  const screenshotProvided = faker.datatype.boolean();

  let appVersion = validVersion();
  let steps = sentenceWithIssue();
  let expected = `The app should ${faker.word.verb()} without errors.`;
  let actual = `Instead, it ${faker.helpers.arrayElement(ISSUES)}.`;

  if (label === 'vague') {
    steps = shortIssue();
    expected = faker.helpers.arrayElement(['should work', 'should not crash', '']);
    actual = faker.helpers.arrayElement(['didn\'t', 'crashed', '']);
  } else if (label === 'incomplete') {
    appVersion = Math.random() < 0.5 ? validVersion() : invalidVersion();
    steps = Math.random() < 0.5 ? shortIssue() : '';
    expected = Math.random() < 0.5 ? '' : 'should work';
    actual = Math.random() < 0.5 ? '' : faker.helpers.arrayElement(['didn\'t', 'crashed']);
  } else if (label === 'invalid') {
    appVersion = invalidVersion();
    steps = faker.word.words(2);
    expected = faker.word.words(3);
    actual = faker.word.words(2);
  }

  return {
    fullName,
    email,
    feedbackType,
    appVersion,
    stepsToReproduce: steps,
    expectedBehavior: expected,
    actualBehavior: actual,
    screenshotProvided,
    label
  };
}

async function main() {
  const labels = [
    ...Array(800).fill('complete'),
    ...Array(600).fill('vague'),
    ...Array(400).fill('incomplete'),
    ...Array(200).fill('invalid')
  ] as BugReport['label'][];

  const shuffled = shuffle(labels);
  const reports = shuffled.map((label) => generateEntry(label));

  const outputPath = 'data/synthetic_bug_reports.json';
  await writeFile(outputPath, JSON.stringify(reports, null, 2));
  console.log(`Wrote ${reports.length} reports to ${outputPath}`);
  console.log('Sample:', reports.slice(0, 5));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
