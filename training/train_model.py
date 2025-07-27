import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from sklearn.compose import ColumnTransformer
import pandas as pd
import onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import StringTensorType

DATA_PATH = Path("bug_reports_data.json")
MODEL_PATH = Path("../packages/example/public/models/bug_report_classifier.onnx")


FIELDS = [
    "fullName",
    "email",
    "feedbackType",
    "appVersion",
    "stepsToReproduce",
    "expectedBehavior",
    "actualBehavior",
]


def load_data():
    """Load dataset and return records split into field/value pairs."""
    with DATA_PATH.open() as f:
        data = json.load(f)
    records = []
    labels = []
    for entry in data:
        errors = entry.get("errors")
        if errors:
            for field in FIELDS:
                value = entry.get(field, "")
                label = errors.get(field, "ok")
                records.append({"field": field, "value": value})
                labels.append(label)
        else:
            label = entry.get("label", "ok")
            for field in FIELDS:
                value = entry.get(field, "")
                records.append({"field": field, "value": value})
                labels.append(label)
    # normalize empty values so the model can learn a representation for missing fields
    for r in records:
        if r["value"] == "":
            r["value"] = "<EMPTY>"
        if r["field"] == "fullName" and any(ch.isdigit() for ch in r["value"]):
            r["value"] += " <HAS_DIGIT>"
    return records, labels


def train_model(records, labels):
    """Train classifier using field and value as separate text inputs."""
    df = pd.DataFrame(records)
    X_train, X_test, y_train, y_test = train_test_split(
        df, labels, test_size=0.2, random_state=42
    )

    transformer = ColumnTransformer(
        [
            ("field", TfidfVectorizer(), "field"),
            ("value", TfidfVectorizer(max_features=10000, ngram_range=(1, 2)), "value"),
        ]
    )

    pipeline = Pipeline(
        [
            ("features", transformer),
            ("clf", LogisticRegression(max_iter=2000, class_weight="balanced")),
        ]
    )

    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)
    print(classification_report(y_test, preds))
    return pipeline


def export_onnx(model):
    """Export the trained scikit-learn model to ONNX format."""
    initial_type = [
        ("field", StringTensorType([None, 1])),
        ("value", StringTensorType([None, 1])),
    ]
    options = {id(model): {"zipmap": False}}
    onnx_model = convert_sklearn(model, initial_types=initial_type, options=options)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"Saved ONNX model to {MODEL_PATH}")


if __name__ == "__main__":
    records, labels = load_data()
    model = train_model(records, labels)
    export_onnx(model)
