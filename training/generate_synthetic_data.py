import json
import random
from pathlib import Path
from faker import Faker

faker = Faker()

FEEDBACK_TYPES = ["Bug", "Feature", "UI Issue", "Performance", "Other"]
DEVICES = [
    "Android 13",
    "iOS 17",
    "Windows 11",
    "macOS 14",
    "Ubuntu 22.04",
    "iPadOS 17",
    "ChromeOS",
]
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
    "scroll down",
    "drag an item",
]
ISSUES = [
    "crashes with error code 500",
    "freezes after login",
    "shows a blank screen",
    "does not respond",
    "crashed immediately",
    "bttn not responsive",
    "screen go blank",
    "resets the form",
    "closes unexpectedly",
    "shows garbled text",
    "runs very slowly",
    "fails with an unknown error",
]


def valid_version() -> str:
    major = random.randint(0, 5)
    minor = random.randint(0, 9)
    patch = random.randint(0, 9)
    suffix = random.choice(["", "-beta", "-rc1"])
    return f"v{major}.{minor}.{patch}{suffix}"


def invalid_version() -> str:
    return random.choice(
        [
            "v1",
            "1.0",
            "ver" + str(random.randint(6, 99)),
            "version" + str(random.randint(100, 999)),
            f"v{faker.word()}",
            "",
        ]
    )


def sentence_with_issue() -> str:
    device = random.choice(DEVICES)
    action = random.choice(ACTIONS)
    issue = random.choice(ISSUES)
    return f"On {device}, when I {action}, the app {issue}."


def short_issue() -> str:
    return random.choice(
        [
            "app crashed",
            "it froze",
            "something broke",
            "not sure",
            "can't explain",
            "",
        ]
    )


def generate_entry(label: str) -> dict:
    errors = {}

    if label == "invalid" and random.random() < 0.6:
        # produce clearly malformed names to help the classifier
        full_name = f"{faker.word()}{random.randint(100,999)}"
        errors["fullName"] = "invalid"
    else:
        full_name = faker.name()
        errors["fullName"] = "ok"

    if label == "invalid":
        email = faker.word() + ".com"
        errors["email"] = "invalid"
    elif label == "incomplete" and random.random() < 0.3:
        email = ""
        errors["email"] = "missing"
    else:
        email = faker.email()
        errors["email"] = "ok"

    feedback_type = random.choice(FEEDBACK_TYPES)
    screenshot_provided = random.choice([True, False])

    app_version = valid_version()
    errors["appVersion"] = "ok"
    steps = sentence_with_issue()
    errors["stepsToReproduce"] = "ok"
    expected = f"The app should {faker.word()} without errors."
    errors["expectedBehavior"] = "ok"
    actual = f"Instead, it {random.choice(ISSUES)}."
    errors["actualBehavior"] = "ok"

    if label == "vague":
        steps = short_issue()
        errors["stepsToReproduce"] = "vague"
        expected = random.choice(["should work", "should not crash", ""])
        errors["expectedBehavior"] = "vague" if not expected else "ok"
        actual = random.choice(["didn't", "crashed", ""])
        errors["actualBehavior"] = "vague" if not actual else "ok"
    elif label == "incomplete":
        if random.random() < 0.5:
            app_version = invalid_version()
            errors["appVersion"] = "invalid"
        else:
            app_version = valid_version()
            errors["appVersion"] = "ok"
        steps = short_issue() if random.random() < 0.5 else ""
        errors["stepsToReproduce"] = "missing" if not steps else "vague"
        expected = "" if random.random() < 0.5 else "should work"
        errors["expectedBehavior"] = "missing" if not expected else "ok"
        actual = "" if random.random() < 0.5 else random.choice(["didn't", "crashed"])
        errors["actualBehavior"] = "missing" if not actual else "ok"
    elif label == "invalid":
        app_version = invalid_version()
        errors["appVersion"] = "invalid"
        steps = f"{faker.word()} {faker.word()}"
        errors["stepsToReproduce"] = "vague"
        expected = f"{faker.word()} {faker.word()} {faker.word()}"
        errors["expectedBehavior"] = "vague"
        actual = f"{faker.word()} {faker.word()}"
        errors["actualBehavior"] = "vague"

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
        "errors": errors,
    }


def main() -> None:
    labels = (
        ["complete"] * 1200 + ["vague"] * 900 + ["incomplete"] * 600 + ["invalid"] * 300
    )
    random.shuffle(labels)
    reports = [generate_entry(label) for label in labels]

    output_path = Path("bug_reports_data.json")
    output_path.write_text(json.dumps(reports, indent=2))
    print(f"Wrote {len(reports)} reports to {output_path}")
    # print("Sample:", reports[:1])


if __name__ == "__main__":
    main()
