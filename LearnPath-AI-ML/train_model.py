import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

DATA_PATH = "dataset/training_data.csv"
MODEL_PATH = "model.pkl"

features = [
    "python_score",
    "statistics_score",
    "ml_score",
    "dl_score",
    "nlp_score",
    "transformers_score",
    "quiz_average",
    "study_hours",
    "average_attempts",
    "course_difficulty"
]

data = pd.read_csv(DATA_PATH)
X = data[features]
y = data["success"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(random_state=42, max_iter=1000))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print("\n==============================")
print("LEARNPATH AI MODEL PERFORMANCE")
print("==============================")
print(f"Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, predictions, zero_division=0))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

joblib.dump(model, MODEL_PATH)
print(f"\nModel saved as {MODEL_PATH}")
