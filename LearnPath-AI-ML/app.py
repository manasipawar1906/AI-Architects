from flask import Flask, request, jsonify
from recommender import recommend_courses

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "LearnPath AI ML Service is running"
    })


@app.route("/api/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No learner data provided"
            }), 400

        user = data.get("user", {})
        completed_courses = data.get("completedCourses", [])

        recommendations = recommend_courses(
            user,
            completed_courses
        )

        return jsonify({
            "success": True,
            "recommendations": recommendations
        })

    except Exception as error:
        print("Recommendation Error:", error)

        return jsonify({
            "success": False,
            "message": "Recommendation failed",
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
