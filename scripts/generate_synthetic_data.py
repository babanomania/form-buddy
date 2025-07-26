import json
import random
from pathlib import Path
from faker import Faker

faker = Faker()

FEEDBACK_TYPES = ["Bug", "Feature", "UI Issue"]
DEVICES = ["Android 13", "iOS 17", "Windows 11", "macOS 14", "Ubuntu 22.04"]
ACTIONS = [
    "tap the Save button",
    "open the settings page",
    "log out",
    "upload a file",
    "enter text in the search bar",
    "start the app",
    "switch accounts",
    "change the theme",
    "select a menu item",
    "resize the window",
]
ISSUES = [
    "crashes with error code 500",
    "freezes after login",
    "shows a blank screen",
    "does not respond",
    "crashed imediately",
    "bttn not responsive",
    "screen go blank",
    "resets the form",
    "closes unexpectedly",
    "shows garbled text",
]


def valid_version() -> str:
    major = random.randint(0, 5)
    minor = random.randint(0, 9)
    patch = random.randint(0, 9)
    suffix = random.choice(["", "-beta", "-rc1"])
    return f"v{major}.{minor}.{patch}{suffix}"


def invalid_version() -> str:
    return random.choice([
        "v1",
        "1.0",
        "version" + str(random.randint(6, 99)),
        f"v{faker.word()}",
        "",
    ])


def sentence_with_issue() -> str:
    device = random.choice(DEVICES)
    action = random.choice(ACTIONS)
    issue = random.choice(ISSUES)
    return f"On {device}, when I {action}, the app {issue}."


def short_issue() -> str:
    return random.choice([
        "app crashed",
        "it froze",
        "something broke",
        "not sure",
        "",
    ])


def generate_entry(label: str) -> dict:
    if label == "invalid" and random.random() < 0.3:
        full_name = f"{faker.word()} {faker.word()}"
    else:
        full_name = faker.name()

    if label == "invalid":
        email = faker.word() + ".com"
    elif label == "incomplete" and random.random() < 0.3:
        email = ""
    else:
        email = faker.email()

    feedback_type = random.choice(FEEDBACK_TYPES)
    screenshot_provided = random.choice([True, False])

    app_version = valid_version()
    steps = sentence_with_issue()
    expected = f"The app should {faker.word()} without errors."
    actual = f"Instead, it {random.choice(ISSUES)}."

    if label == "vague":
        steps = short_issue()
        expected = random.choice(["should work", "should not crash", ""])
        actual = random.choice(["didn't", "crashed", ""])
    elif label == "incomplete":
        app_version = valid_version() if random.random() < 0.5 else invalid_version()
        steps = short_issue() if random.random() < 0.5 else ""
        expected = "" if random.random() < 0.5 else "should work"
        actual = "" if random.random() < 0.5 else random.choice(["didn't", "crashed"])
    elif label == "invalid":
        app_version = invalid_version()
        steps = f"{faker.word()} {faker.word()}"
        expected = f"{faker.word()} {faker.word()} {faker.word()}"
        actual = f"{faker.word()} {faker.word()}"

    return {
        "fullName": full_name,
        "email": email,
        "feedbackType": feedback_type,
        "appVersion": app_version,
        "stepsToReproduce": steps,
        "expectedBehavior": expected,
        "actualBehavior": actual,
        "screenshotProvided": screenshot_provided,
        "label": label,
    }


def main() -> None:
    labels = (
        ["complete"] * 800
        + ["vague"] * 600
        + ["incomplete"] * 400
        + ["invalid"] * 200
    )
    random.shuffle(labels)
    reports = [generate_entry(label) for label in labels]

    output_path = Path("data/synthetic_bug_reports.json")
    output_path.write_text(json.dumps(reports, indent=2))
    print(f"Wrote {len(reports)} reports to {output_path}")
    print("Sample:", reports[:5])


if __name__ == "__main__":
    main()
