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
    train_model = import_from_path(
        "train_model", TRAIN_DIR / "train_model.py"
    )
    
    return generate_synthetic_data, train_model


def test_model_predictions():
    gen, trainer = load_training_modules()

    # generate dataset and train model in-memory
    gen.main()
    records, labels = trainer.load_data()
    model = trainer.train_model(records, labels)

    # verify classifier identifies vague or invalid inputs
    import pandas as pd

    pred_vague = model.predict(
        pd.DataFrame([{"field": "stepsToReproduce", "value": "can't explain"}])
    )[0]
    pred_invalid = model.predict(
        pd.DataFrame([{"field": "appVersion", "value": "ver42"}])
    )[0]

    assert pred_vague == "vague"
    assert pred_invalid == "invalid"

    # cleanup generated files
    DATA_PATH.unlink(missing_ok=True)

