import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
TRAIN_DIR = ROOT_DIR / "training"
DATA_PATH = ROOT_DIR / "bug_reports_data.json"


def load_training_modules():
    sys.path.insert(0, str(TRAIN_DIR))
    import generate_synthetic_data  # type: ignore
    import train_model  # type: ignore

    return generate_synthetic_data, train_model


def test_model_predictions():
    gen, trainer = load_training_modules()

    # generate dataset and train model in-memory
    gen.main()
    texts, labels = trainer.load_data()
    model = trainer.train_model(texts, labels)

    # verify classifier identifies vague or invalid inputs
    pred_vague = model.predict(["stepsToReproduce: can't explain"])[0]
    pred_invalid = model.predict(["appVersion: ver42"])[0]

    assert pred_vague == "vague"
    assert pred_invalid == "invalid"

    # cleanup generated files
    DATA_PATH.unlink(missing_ok=True)

