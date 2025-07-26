import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import StringTensorType

DATA_PATH = Path('data/synthetic_bug_reports.json')
MODEL_PATH = Path('public/models/bug_report_classifier.onnx')


def load_data():
    with DATA_PATH.open() as f:
        data = json.load(f)
    texts = []
    labels = []
    for entry in data:
        text = f"{entry['feedbackType']} {'yes' if entry['screenshotProvided'] else 'no'} " \
               f"{entry['stepsToReproduce']} {entry['expectedBehavior']} {entry['actualBehavior']}"
        texts.append(text)
        labels.append(entry['label'])
    return texts, labels


def train_model(texts, labels):
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000)),
        ("clf", LogisticRegression(max_iter=1000))
    ])
    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)
    print(classification_report(y_test, preds))
    return pipeline


def export_onnx(model):
    initial_type = [('input', StringTensorType([None, 1]))]
    onnx_model = convert_sklearn(model, initial_types=initial_type)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open('wb') as f:
        f.write(onnx_model.SerializeToString())
    print(f"Saved ONNX model to {MODEL_PATH}")


if __name__ == "__main__":
    texts, labels = load_data()
    model = train_model(texts, labels)
    export_onnx(model)
