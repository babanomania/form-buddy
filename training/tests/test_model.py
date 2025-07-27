import importlib.util
from pathlib import Path


TRAIN_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = TRAIN_DIR.parent
DATA_PATH = ROOT_DIR / "bug_reports_data.json"


def load_training_modules():
    def import_from_path(module_name, file_path):
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)  # type: ignore
        return module

    generate_synthetic_data = import_from_path(
        "generate_synthetic_data", TRAIN_DIR / "generate_synthetic_data.py"
    )
    train_model = import_from_path("train_model", TRAIN_DIR / "train_model.py")

    return generate_synthetic_data, train_model


def test_model_predictions():
    gen, trainer = load_training_modules()

    # generate dataset and train model in-memory
    gen.main()
    records, labels = trainer.load_data()
    model = trainer.train_model(records, labels)

    import pandas as pd

    def predict(field: str, value: str) -> str:
        if value == "":
            value = "<EMPTY>"
        if field == "fullName" and any(ch.isdigit() for ch in value):
            value += " <HAS_DIGIT>"
        df = pd.DataFrame([{"field": field, "value": value}])
        return model.predict(df)[0]

    cases = [
        ("fullName", "John Doe", "ok"),
        ("fullName", "foo123", "invalid"),
        ("email", "john@example.com", "ok"),
        ("email", "user.com", "invalid"),
        ("email", "", "missing"),
        ("appVersion", "v2.1.3", "ok"),
        ("appVersion", "ver42", "invalid"),
        (
            "stepsToReproduce",
            "On Android 13, when I open the settings page, the app crashes with error code 500.",
            "ok",
        ),
        ("stepsToReproduce", "app crashed", "vague"),
        ("stepsToReproduce", "", "missing"),
        ("expectedBehavior", "The app should work without errors.", "ok"),
        ("expectedBehavior", "foo bar baz", "vague"),
        ("expectedBehavior", "", "missing"),
        ("actualBehavior", "Instead, it shows a blank screen.", "ok"),
        ("actualBehavior", "foo bar", "vague"),
        ("actualBehavior", "", "missing"),
    ]

    for field, value, expected in cases:
        assert predict(field, value) == expected

    # cleanup generated files
    DATA_PATH.unlink(missing_ok=True)
    trainer.MODEL_PATH.unlink(missing_ok=True)
