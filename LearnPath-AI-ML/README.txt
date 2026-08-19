LearnPath AI - ML Recommendation Service

1. Open a terminal in this ml folder.
2. Install dependencies:
   pip install -r requirements.txt

3. Train the model:
   python train_model.py

   This creates model.pkl.

4. Start the ML API:
   python app.py

5. API:
   GET  /
   POST /api/recommend

Test POST body:
{
  "user": {
    "Python": 85,
    "Statistics": 70,
    "ML": 55,
    "DL": 30,
    "NLP": 65,
    "Transformers": 20,
    "quiz_average": 68,
    "study_hours": 8,
    "average_attempts": 2
  },
  "completedCourses": [1, 3, 7]
}

Note:
training_data.csv is synthetic prototype data. Replace it with
real anonymized learner-course interaction data for final evaluation.
