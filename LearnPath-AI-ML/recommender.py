import pandas as pd
import joblib


# =========================================================
# FILE CONFIGURATION
# =========================================================

MODEL_PATH = "model.pkl"
COURSES_PATH = "dataset/courses.csv"


# =========================================================
# LOAD MODEL AND COURSE DATA
# =========================================================

try:

    model = joblib.load(
        MODEL_PATH
    )

    print(
        "ML model loaded successfully."
    )

except Exception as error:

    print(
        "ERROR: Could not load model.pkl"
    )

    print(
        error
    )

    model = None


try:

    courses = pd.read_csv(
        COURSES_PATH
    )

    print(
        f"Course dataset loaded successfully. "
        f"{len(courses)} courses found."
    )

except Exception as error:

    print(
        "ERROR: Could not load courses.csv"
    )

    print(
        error
    )

    courses = pd.DataFrame()


# =========================================================
# SKILL → MODEL FEATURE MAPPING
# =========================================================

SKILL_COLUMNS = {

    "Python":
        "python_score",

    "Statistics":
        "statistics_score",

    "ML":
        "ml_score",

    "DL":
        "dl_score",

    "NLP":
        "nlp_score",

    "Transformers":
        "transformers_score"

}


# =========================================================
# NORMALIZE SKILL NAME
# =========================================================

def normalize_skill(skill):

    if not skill:

        return ""

    skill = skill.strip().lower()


    mapping = {

        "python":
            "Python",

        "statistics":
            "Statistics",

        "statistical":
            "Statistics",

        "machine learning":
            "ML",

        "ml":
            "ML",

        "deep learning":
            "DL",

        "dl":
            "DL",

        "nlp":
            "NLP",

        "natural language processing":
            "NLP",

        "transformers":
            "Transformers"

    }


    return mapping.get(
        skill,
        skill.title()
    )


# =========================================================
# CALCULATE SKILL GAPS
# =========================================================

def calculate_skill_gap(user):

    gaps = {}


    for skill in SKILL_COLUMNS:

        score = user.get(
            skill,
            0
        )


        try:

            score = float(
                score
            )

        except (TypeError, ValueError):

            score = 0


        score = max(
            0,
            min(
                100,
                score
            )
        )


        gaps[skill] = round(
            100 - score,
            2
        )


    return gaps


# =========================================================
# GET CURRENT SKILL SCORE
# =========================================================

def get_skill_score(
    user,
    skill
):

    normalized_skill = normalize_skill(
        skill
    )


    score = user.get(
        normalized_skill,
        0
    )


    try:

        score = float(
            score
        )

    except (TypeError, ValueError):

        score = 0


    return max(
        0,
        min(
            100,
            score
        )
    )


# =========================================================
# PREDICT SUCCESS PROBABILITY
# =========================================================

def predict_success(
    user,
    difficulty
):

    # -----------------------------------------------------
    # Check whether model exists
    # -----------------------------------------------------

    if model is None:

        return 0.5


    # -----------------------------------------------------
    # Build exactly the same features that were used
    # during model training.
    # -----------------------------------------------------

    features = pd.DataFrame([{

        "python_score":
            user.get(
                "Python",
                0
            ),

        "statistics_score":
            user.get(
                "Statistics",
                0
            ),

        "ml_score":
            user.get(
                "ML",
                0
            ),

        "dl_score":
            user.get(
                "DL",
                0
            ),

        "nlp_score":
            user.get(
                "NLP",
                0
            ),

        "transformers_score":
            user.get(
                "Transformers",
                0
            ),

        "quiz_average":
            user.get(
                "quiz_average",
                0
            ),

        "study_hours":
            user.get(
                "study_hours",
                0
            ),

        "average_attempts":
            user.get(
                "average_attempts",
                1
            ),

        "course_difficulty":
            difficulty

    }])


    # -----------------------------------------------------
    # Predict probability
    # -----------------------------------------------------

    try:

        probability = model.predict_proba(
            features
        )[0][1]


        return float(
            probability
        )

    except Exception as error:

        print(
            "Prediction error:",
            error
        )

        return 0.5


# =========================================================
# CHECK COURSE PREREQUISITES
# =========================================================

def prerequisites_satisfied(
    prerequisites,
    completed_courses
):

    # -----------------------------------------------------
    # No prerequisites
    # -----------------------------------------------------

    if (
        pd.isna(prerequisites)
        or
        str(prerequisites).strip() == ""
    ):

        return True


    # -----------------------------------------------------
    # Convert completed course IDs to integers
    # -----------------------------------------------------

    completed_courses = [

        int(course)

        for course in completed_courses

    ]


    # -----------------------------------------------------
    # Read prerequisite IDs
    # -----------------------------------------------------

    try:

        required_courses = [

            int(course.strip())

            for course
            in str(prerequisites).split(",")

            if course.strip()

        ]

    except ValueError:

        return False


    # -----------------------------------------------------
    # Check whether ALL prerequisites are completed
    # -----------------------------------------------------

    return all(

        course in completed_courses

        for course in required_courses

    )


# =========================================================
# GENERATE RECOMMENDATION REASON
# =========================================================

def generate_reason(
    skill,
    current_skill,
    skill_gap,
    success_probability,
    difficulty
):

    # -----------------------------------------------------
    # Skill status
    # -----------------------------------------------------

    if current_skill < 30:

        skill_status = (
            f"Your {skill} skill is currently "
            f"very low at {current_skill:.0f}%."
        )

    elif current_skill < 60:

        skill_status = (
            f"Your {skill} skill is currently "
            f"developing at {current_skill:.0f}%."
        )

    elif current_skill < 80:

        skill_status = (
            f"Your {skill} skill is currently "
            f"at {current_skill:.0f}% and can be improved."
        )

    else:

        skill_status = (
            f"Your {skill} skill is already strong "
            f"at {current_skill:.0f}%."
        )


    # -----------------------------------------------------
    # Success status
    # -----------------------------------------------------

    success_percentage = (
        success_probability * 100
    )


    if success_percentage >= 75:

        success_status = (
            f"The model predicts a high "
            f"success probability of "
            f"{success_percentage:.1f}%."
        )

    elif success_percentage >= 50:

        success_status = (
            f"The model predicts a moderate "
            f"success probability of "
            f"{success_percentage:.1f}%."
        )

    else:

        success_status = (
            f"The model predicts a lower "
            f"success probability of "
            f"{success_percentage:.1f}%, "
            f"so this may be challenging."
        )


    # -----------------------------------------------------
    # Difficulty
    # -----------------------------------------------------

    difficulty_names = {

        1: "Beginner",

        2: "Beginner",

        3: "Intermediate",

        4: "Advanced",

        5: "Advanced"

    }


    difficulty_name = (
        difficulty_names.get(
            difficulty,
            "Intermediate"
        )
    )


    return (

        f"{skill_status} "

        f"This course targets a "
        f"{skill_gap:.0f}% skill gap. "

        f"{success_status} "

        f"Course difficulty: "
        f"{difficulty_name}."

    )


# =========================================================
# RECOMMEND COURSES
# =========================================================

def recommend_courses(
    user,
    completed_courses,
    number_of_recommendations=5
):

    # -----------------------------------------------------
    # Check course data
    # -----------------------------------------------------

    if courses.empty:

        return []


    # -----------------------------------------------------
    # Normalize completed courses
    # -----------------------------------------------------

    try:

        completed_courses = [

            int(course)

            for course in completed_courses

        ]

    except (TypeError, ValueError):

        completed_courses = []


    # -----------------------------------------------------
    # Calculate skill gaps
    # -----------------------------------------------------

    skill_gaps = calculate_skill_gap(
        user
    )


    recommendations = []


    # =====================================================
    # EXAMINE EVERY COURSE
    # =====================================================

    for _, course in courses.iterrows():

        # -------------------------------------------------
        # Course ID
        # -------------------------------------------------

        try:

            course_id = int(
                course["course_id"]
            )

        except (TypeError, ValueError):

            continue


        # -------------------------------------------------
        # Don't recommend completed courses
        # -------------------------------------------------

        if course_id in completed_courses:

            continue


        # -------------------------------------------------
        # Primary skill
        # -------------------------------------------------

        skill = normalize_skill(
            course.get(
                "primary_skill",
                ""
            )
        )


        # -------------------------------------------------
        # If the course doesn't map to one of our ML
        # skills, skip it for this model.
        # -------------------------------------------------

        if skill not in SKILL_COLUMNS:

            continue


        # -------------------------------------------------
        # Current learner skill
        # -------------------------------------------------

        current_skill = get_skill_score(
            user,
            skill
        )


        # -------------------------------------------------
        # Don't recommend a skill that is already mastered
        #
        # 80%+ = considered strong for this prototype.
        # -------------------------------------------------

        if current_skill >= 80:

            continue


        # -------------------------------------------------
        # Skill gap
        # -------------------------------------------------

        skill_gap = max(
            0,
            100 - current_skill
        )


        # -------------------------------------------------
        # Difficulty
        # -------------------------------------------------

        try:

            difficulty = int(
                course.get(
                    "difficulty",
                    3
                )
            )

        except (TypeError, ValueError):

            difficulty = 3


        difficulty = max(
            1,
            min(
                5,
                difficulty
            )
        )


        # -------------------------------------------------
        # Estimated hours
        # -------------------------------------------------

        try:

            estimated_hours = int(
                course.get(
                    "estimated_hours",
                    5
                )
            )

        except (TypeError, ValueError):

            estimated_hours = 5


        # -------------------------------------------------
        # Check prerequisites
        # -------------------------------------------------

        prerequisites = course.get(
            "prerequisites",
            ""
        )


        if not prerequisites_satisfied(

            prerequisites,

            completed_courses

        ):

            continue


        # -------------------------------------------------
        # Predict probability of success
        # -------------------------------------------------

        success_probability = predict_success(

            user,

            difficulty

        )


        # -------------------------------------------------
        # Convert skill gap to 0-1
        # -------------------------------------------------

        gap_score = (
            skill_gap / 100
        )


        # -------------------------------------------------
        # Difficulty score
        #
        # Easier courses receive a small bonus.
        # -------------------------------------------------

        difficulty_score = (
            1 / difficulty
        )


        # -------------------------------------------------
        # RECOMMENDATION SCORE
        #
        # 45% → Skill gap
        # 35% → Predicted success
        # 20% → Difficulty suitability
        # -------------------------------------------------

        recommendation_score = (

            0.45 * gap_score

            +

            0.35 * success_probability

            +

            0.20 * difficulty_score

        )


        # -------------------------------------------------
        # Generate explanation
        # -------------------------------------------------

        reason = generate_reason(

            skill,

            current_skill,

            skill_gap,

            success_probability,

            difficulty

        )


        # -------------------------------------------------
        # Store recommendation
        # -------------------------------------------------

        recommendations.append({

            "course_id":
                course_id,

            "course_name":
                str(
                    course.get(
                        "course_name",
                        "Recommended Course"
                    )
                ),

            "skill":
                skill,

            "difficulty":
                difficulty,

            "estimated_hours":
                estimated_hours,

            "skill_gap":
                round(
                    skill_gap,
                    2
                ),

            "predicted_success":
                round(
                    success_probability * 100,
                    2
                ),

            "recommendation_score":
                round(
                    recommendation_score * 100,
                    2
                ),

            "reason":
                reason

        })


    # =====================================================
    # SORT BY RECOMMENDATION SCORE
    # =====================================================

    recommendations.sort(

        key=lambda item:
            item[
                "recommendation_score"
            ],

        reverse=True

    )


    # =====================================================
    # RETURN TOP N
    # =====================================================

    return recommendations[
        :number_of_recommendations
    ]