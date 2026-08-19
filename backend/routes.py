from fastapi import APIRouter, HTTPException
import requests

from backend.schemas import (
    LearnerProfile,
    RecommendationResponse,
    CourseRecommendation
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# ML SERVICE CONFIGURATION
# =========================================================

# FastAPI backend runs on port 8000
# ML Flask service runs on port 8001

ML_SERVICE_URL = "http://127.0.0.1:8001"


# =========================================================
# HEALTH CHECK
# =========================================================

@router.get("/health")
def health_check():

    return {
        "status": "ok",
        "message": "Backend is running"
    }


# =========================================================
# CONVERT LEARNER PROFILE INTO ML DATA
# =========================================================

def prepare_ml_data(profile: LearnerProfile):

    # -----------------------------------------------------
    # Normalize skills and interests
    # -----------------------------------------------------

    skills = {
        skill.strip().lower()
        for skill in profile.skills
        if skill.strip()
    }

    interests = {
        interest.strip().lower()
        for interest in profile.interests
        if interest.strip()
    }

    experience = profile.experience.lower()
    goal = profile.goal.lower()


    # -----------------------------------------------------
    # CALCULATE SKILL SCORES
    #
    # Current prototype:
    # If the learner declares a skill, we give it 100%.
    #
    # Later:
    # These values should come from actual quiz scores,
    # course completion and learner activity.
    # -----------------------------------------------------

    python_score = (
        100
        if "python" in skills
        else 0
    )

    statistics_score = (
        100
        if "statistics" in skills
        else 0
    )

    ml_score = (
        100
        if (
            "machine learning" in skills
            or "ml" in skills
        )
        else 0
    )

    dl_score = (
        100
        if (
            "deep learning" in skills
            or "dl" in skills
        )
        else 0
    )

    nlp_score = (
        100
        if (
            "nlp" in skills
            or "natural language processing" in skills
        )
        else 0
    )

    transformers_score = (
        100
        if "transformers" in skills
        else 0
    )


    # -----------------------------------------------------
    # STUDY HOURS
    #
    # Extract a number from values such as:
    # "8 hours/week"
    # "10 hours"
    # "5"
    # -----------------------------------------------------

    study_hours = 5.0

    try:

        number = ""

        for character in profile.study_time:

            if character.isdigit() or character == ".":

                number += character

            elif number:

                break

        if number:

            study_hours = float(number)

    except Exception:

        study_hours = 5.0


    # -----------------------------------------------------
    # QUIZ AVERAGE
    #
    # Current prototype:
    # Estimate quiz performance from declared skills.
    #
    # Later:
    # Replace this with real quiz scores.
    # -----------------------------------------------------

    skill_scores = [
        python_score,
        statistics_score,
        ml_score,
        dl_score,
        nlp_score,
        transformers_score
    ]

    quiz_average = (
        sum(skill_scores) /
        len(skill_scores)
    )


    # -----------------------------------------------------
    # AVERAGE ATTEMPTS
    #
    # Current prototype:
    # Estimate attempts using experience level.
    #
    # Later:
    # Calculate from real course attempts.
    # -----------------------------------------------------

    if "beginner" in experience:

        average_attempts = 3

    elif "intermediate" in experience:

        average_attempts = 2

    else:

        average_attempts = 1


    # -----------------------------------------------------
    # COURSE DIFFICULTY
    #
    # 1 = Beginner
    # 3 = Intermediate
    # 5 = Advanced
    # -----------------------------------------------------

    if "beginner" in experience:

        course_difficulty = 2

    elif "intermediate" in experience:

        course_difficulty = 3

    else:

        course_difficulty = 4


    # -----------------------------------------------------
    # INFER COMPLETED FOUNDATIONAL COURSES
    #
    # Current ML course dataset:
    #
    # Course 1 = Python Basics
    # Course 3 = Statistics for Data Science
    #
    # If the learner already has a strong declared skill,
    # we treat the corresponding foundation as completed.
    #
    # Later:
    # This will come from actual course completion records.
    # -----------------------------------------------------

    completed_courses = []

    if python_score >= 80:

        completed_courses.append(1)

    if statistics_score >= 80:

        completed_courses.append(3)


    # -----------------------------------------------------
    # RETURN DATA FOR ML SERVICE
    # -----------------------------------------------------

    return {

        "user": {

            "Python":
                python_score,

            "Statistics":
                statistics_score,

            "ML":
                ml_score,

            "DL":
                dl_score,

            "NLP":
                nlp_score,

            "Transformers":
                transformers_score,

            "quiz_average":
                quiz_average,

            "study_hours":
                study_hours,

            "average_attempts":
                average_attempts

        },

        "completedCourses":
            completed_courses

    }


# =========================================================
# RECOMMENDATION ENDPOINT
# =========================================================

@router.post(
    "/recommend",
    response_model=RecommendationResponse
)
def recommend(profile: LearnerProfile):

    try:

        # -------------------------------------------------
        # STEP 1
        # Convert learner profile into ML input
        # -------------------------------------------------

        ml_data = prepare_ml_data(
            profile
        )


        print("\n================================")
        print("LEARNPATH AI - ML REQUEST")
        print("================================")

        print(
            "Learner:",
            profile.name
        )

        print(
            "Goal:",
            profile.goal
        )

        print(
            "Skills:",
            profile.skills
        )

        print(
            "ML Data:",
            ml_data
        )


        # -------------------------------------------------
        # STEP 2
        # Send learner data to ML service
        # -------------------------------------------------

        response = requests.post(

            f"{ML_SERVICE_URL}/api/recommend",

            json=ml_data,

            timeout=10

        )


        # -------------------------------------------------
        # STEP 3
        # Check ML service response
        # -------------------------------------------------

        if response.status_code != 200:

            print(
                "ML Service Error:",
                response.text
            )

            raise HTTPException(

                status_code=500,

                detail=(
                    "ML service returned an error: "
                    f"{response.text}"
                )

            )


        ml_result = response.json()


        # -------------------------------------------------
        # STEP 4
        # Verify ML response
        # -------------------------------------------------

        if not ml_result.get("success"):

            raise HTTPException(

                status_code=500,

                detail="ML recommendation failed"

            )


        recommendations = (
            ml_result.get(
                "recommendations",
                []
            )
        )


        print(
            "ML Recommendations:",
            recommendations
        )


        # -------------------------------------------------
        # STEP 5
        # Prepare response lists
        # -------------------------------------------------

        learning_path = []

        projects = []

        assessments = []

        skill_gaps = []


        # -------------------------------------------------
        # STEP 6
        # Convert ML recommendations into the existing
        # CourseRecommendation schema
        # -------------------------------------------------

        for recommendation in recommendations:

            course_name = recommendation.get(

                "course_name",

                "Recommended Course"

            )


            skill = recommendation.get(

                "skill",

                "General"

            )


            difficulty = recommendation.get(

                "difficulty",

                3

            )


            estimated_hours = recommendation.get(

                "estimated_hours",

                5

            )


            predicted_success = recommendation.get(

                "predicted_success",

                0

            )


            reason = recommendation.get(

                "reason",

                "Recommended based on your learning profile."

            )


            # -------------------------------------------------
            # Convert numerical difficulty to level
            # -------------------------------------------------

            if difficulty <= 2:

                level = "Beginner"

            elif difficulty <= 3:

                level = "Intermediate"

            else:

                level = "Advanced"


            # -------------------------------------------------
            # Create CourseRecommendation object
            # -------------------------------------------------

            course = CourseRecommendation(

                title=course_name,

                level=level,

                duration=(
                    f"{estimated_hours} hours"
                ),

                description=(
                    f"{reason} "
                    f"Predicted success probability: "
                    f"{predicted_success}%."
                ),

                skills=[
                    skill
                ],

                project=(
                    f"Complete a practical "
                    f"{skill} project."
                )

            )


            learning_path.append(
                course
            )


            # -------------------------------------------------
            # Project suggestion
            # -------------------------------------------------

            projects.append(

                f"Build a practical "
                f"{skill} project."

            )


            # -------------------------------------------------
            # Assessment suggestion
            # -------------------------------------------------

            assessments.append(

                f"{course_name} Assessment"

            )


            # -------------------------------------------------
            # Skill gap
            #
            # Only add a skill if the learner does NOT
            # already have it as a strong declared skill.
            # -------------------------------------------------

            learner_skills = {

                item.strip().lower()

                for item in profile.skills

            }

            if skill.lower() not in learner_skills:

                if skill not in skill_gaps:

                    skill_gaps.append(
                        skill
                    )


        # -------------------------------------------------
        # STEP 7
        # Calculate readiness percentage
        #
        # Current prototype:
        # Number of declared skills compared with
        # declared skills + identified skill gaps.
        #
        # Later:
        # Use actual ML mastery predictions.
        # -------------------------------------------------

        current_skills = len(
            profile.skills
        )

        total_skill_count = (
            current_skills
            +
            len(skill_gaps)
        )


        if total_skill_count == 0:

            readiness = 0

        else:

            readiness = round(

                (
                    current_skills
                    /
                    total_skill_count
                )
                *
                100

            )


        # Keep value between 0 and 100

        readiness = max(

            0,

            min(
                100,
                readiness
            )

        )


        # -------------------------------------------------
        # STEP 8
        # Return response in your existing format
        # -------------------------------------------------

        return RecommendationResponse(

            skill_gaps=skill_gaps,

            learning_path=learning_path,

            projects=projects,

            assessments=assessments,

            goal=profile.goal,

            readiness_percentage=readiness

        )


    # =====================================================
    # ERROR: ML SERVICE NOT RUNNING
    # =====================================================

    except requests.exceptions.ConnectionError:

        raise HTTPException(

            status_code=503,

            detail=(
                "ML service is not running. "
                "Please start LearnPath-AI-ML/app.py "
                "on port 8001."
            )

        )


    # =====================================================
    # ERROR: ML SERVICE TIMEOUT
    # =====================================================

    except requests.exceptions.Timeout:

        raise HTTPException(

            status_code=504,

            detail=(
                "ML service request timed out."
            )

        )


    # =====================================================
    # RE-RAISE HTTP EXCEPTIONS
    # =====================================================

    except HTTPException:

        raise


    # =====================================================
    # GENERAL ERROR
    # =====================================================

    except Exception as error:

        print(
            "\nRecommendation Error:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=str(error)

        )