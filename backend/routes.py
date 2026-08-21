from fastapi import APIRouter, HTTPException
import requests

from backend.schemas import (
    LearnerProfile,
    RecommendationResponse,
    CourseRecommendation,
    ChatRequest,
    ChatResponse
)

from backend.ai_service import ask_groq


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# ML SERVICE
# =========================================================

ML_SERVICE_URL = (
    "http://127.0.0.1:8001"
)


# =========================================================
# HEALTH CHECK
# =========================================================

@router.get(
    "/health"
)
def health_check():

    return {
        "status":
            "ok",

        "message":
            "Backend is running"
    }


# =========================================================
# EXTRACT STUDY HOURS
# =========================================================

def extract_study_hours(
    study_time
):

    try:

        if study_time is None:
            return 5.0


        text = str(
            study_time
        )


        number = ""


        for character in text:

            if (
                character.isdigit()
                or
                character == "."
            ):

                number += character

            elif number:

                break


        return (
            float(number)
            if number
            else 5.0
        )


    except Exception:

        return 5.0


# =========================================================
# NORMALIZE SKILLS
# =========================================================

def normalize_skills(
    skill_list
):

    if not skill_list:

        return set()


    return {
        str(skill)
        .strip()
        .lower()

        for skill in skill_list

        if str(skill).strip()
    }


# =========================================================
# PREPARE ML DATA
# =========================================================

def prepare_ml_data(
    profile: LearnerProfile
):

    skills = normalize_skills(
        profile.skills
    )


    interests = normalize_skills(
        profile.interests
    )


    experience = str(
        profile.experience or ""
    ).strip().lower()


    goal = str(
        profile.goal or ""
    ).strip().lower()


    # =====================================================
    # PYTHON
    # =====================================================

    python_score = (

        100

        if any(

            s == "python"
            or
            "python" in s

            for s in skills

        )

        else 0
    )


    # =====================================================
    # STATISTICS
    # =====================================================

    statistics_score = (

        100

        if any(

            "statistics" in s
            or
            "statistical" in s

            for s in skills

        )

        else 0
    )


    # =====================================================
    # MACHINE LEARNING
    # =====================================================

    ml_score = (

        100

        if any(

            s in {
                "ml",
                "machine learning",
                "machine-learning"
            }

            for s in skills

        )

        else 0
    )


    # =====================================================
    # DEEP LEARNING
    # =====================================================

    dl_score = (

        100

        if any(

            s in {
                "dl",
                "deep learning",
                "deep-learning"
            }

            for s in skills

        )

        else 0
    )


    # =====================================================
    # NLP
    # =====================================================

    nlp_score = (

        100

        if any(

            s == "nlp"
            or
            "natural language processing" in s
            or
            "natural language" in s

            for s in skills

        )

        else 0
    )


    # =====================================================
    # TRANSFORMERS
    # =====================================================

    transformers_score = (

        100

        if any(

            "transformer" in s

            for s in skills

        )

        else 0
    )


    # =====================================================
    # STUDY HOURS
    # =====================================================

    study_hours = extract_study_hours(
        profile.study_time
    )


    # =====================================================
    # QUIZ AVERAGE
    # =====================================================

    skill_scores = [

        python_score,

        statistics_score,

        ml_score,

        dl_score,

        nlp_score,

        transformers_score

    ]


    quiz_average = (

        sum(skill_scores)
        /
        len(skill_scores)

        if skill_scores

        else 50.0
    )


    # =====================================================
    # ATTEMPTS
    # =====================================================

    if "beginner" in experience:

        average_attempts = 3

    elif "intermediate" in experience:

        average_attempts = 2

    else:

        average_attempts = 1


    # =====================================================
    # COMPLETED COURSE IDS
    # =====================================================

    completed_ids = []


    for course in (
        profile.completed or []
    ):

        try:

            completed_ids.append(
                int(course)
            )

        except (
            TypeError,
            ValueError
        ):

            # Course names such as
            # "Python Basics" are kept separately
            # in _completed_names.
            pass


    # =====================================================
    # RETURN ML PAYLOAD
    # =====================================================

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
                average_attempts,

            # ---------------------------------------------
            # RECOMMENDER METADATA
            # ---------------------------------------------

            "_goal":
                goal,

            "_interests":
                list(interests),

            "_experience":
                experience,

            "_all_skills":
                list(skills),

            "_completed_names":
                list(
                    profile.completed or []
                )
        },


        "completedCourses":
            completed_ids
    }


# =========================================================
# RECOMMEND
# =========================================================

@router.post(
    "/recommend",
    response_model=
        RecommendationResponse
)
def recommend(
    profile: LearnerProfile
):

    try:

        # -------------------------------------------------
        # PREPARE DATA
        # -------------------------------------------------

        ml_data = prepare_ml_data(
            profile
        )


        # -------------------------------------------------
        # DEBUG LOG
        # -------------------------------------------------

        print(
            "\n================================"
        )

        print(
            "LEARNPATH AI - ML REQUEST"
        )

        print(
            "================================"
        )

        print(
            "Learner:",
            profile.name
        )

        print(
            "Email:",
            profile.email
        )

        print(
            "Goal:",
            profile.goal
        )

        print(
            "Experience:",
            profile.experience
        )

        print(
            "Skills:",
            profile.skills
        )

        print(
            "Interests:",
            profile.interests
        )

        print(
            "Completed:",
            profile.completed
        )

        print(
            "Learning Style:",
            profile.learning_style
        )

        print(
            "Study Time:",
            profile.study_time
        )

        print(
            "Target Months:",
            profile.target_months
        )

        print(
            "================================"
        )


        # -------------------------------------------------
        # CALL ML SERVICE
        # -------------------------------------------------

        response = requests.post(

            f"{ML_SERVICE_URL}"
            "/api/recommend",

            json=ml_data,

            timeout=30
        )


        # -------------------------------------------------
        # ML ERROR
        # -------------------------------------------------

        if response.status_code != 200:

            print(
                "ML Service Error:",
                response.text
            )


            raise HTTPException(

                status_code=500,

                detail=(
                    "ML service returned "
                    f"an error: "
                    f"{response.text}"
                )

            )


        # -------------------------------------------------
        # READ RESPONSE
        # -------------------------------------------------

        ml_result = response.json()


        if not ml_result.get(
            "success"
        ):

            raise HTTPException(

                status_code=500,

                detail=(
                    "ML recommendation failed"
                )

            )


        recommendations = (

            ml_result.get(
                "recommendations",
                []
            )

        )


        print(
            "\nML Recommendations:"
        )

        print(
            recommendations
        )


        print(
            "Number of recommendations:",
            len(recommendations)
        )


        # =================================================
        # BUILD RESPONSE
        # =================================================

        learning_path = []

        projects = []

        assessments = []

        skill_gaps = []


        learner_skills = normalize_skills(
            profile.skills
        )


        for recommendation in (
            recommendations
        ):

            # ---------------------------------------------
            # BASIC COURSE DATA
            # ---------------------------------------------

            course_name = (

                recommendation.get(

                    "course_name",

                    "Recommended Course"

                )

            )


            skill = (

                recommendation.get(

                    "skill",

                    "General"

                )

            )


            difficulty = (

                recommendation.get(

                    "difficulty",

                    3

                )

            )


            estimated_hours = (

                recommendation.get(

                    "estimated_hours",

                    5

                )

            )


            predicted_success = (

                recommendation.get(

                    "predicted_success",

                    0

                )

            )


            reason = (

                recommendation.get(

                    "reason",

                    "Recommended based on "
                    "your learning profile."

                )

            )


            # ---------------------------------------------
            # MASTERY DATA
            # ---------------------------------------------

            mastery_before = (

                recommendation.get(

                    "mastery_before",

                    0

                )

            )


            mastery_gain = (

                recommendation.get(

                    "mastery_gain",

                    0

                )

            )


            mastery_after = (

                recommendation.get(

                    "mastery_after",

                    0

                )

            )


            # ---------------------------------------------
            # DIFFICULTY
            # ---------------------------------------------

            try:

                difficulty = int(
                    difficulty
                )

            except (
                TypeError,
                ValueError
            ):

                difficulty = 3


            if difficulty <= 2:

                level = "Beginner"

            elif difficulty <= 3:

                level = "Intermediate"

            else:

                level = "Advanced"


            # ---------------------------------------------
            # COURSE
            # ---------------------------------------------

            course = CourseRecommendation(

                title=course_name,

                level=level,

                duration=(
                    f"{estimated_hours} hours"
                ),

                description=(
                    f"{reason} "
                    f"Predicted success "
                    f"probability: "
                    f"{predicted_success}%."
                ),

                skills=[
                    skill
                ],

                project=(
                    f"Complete a practical "
                    f"{skill} project."
                ),

                mastery_before=
                    mastery_before,

                mastery_gain=
                    mastery_gain,

                mastery_after=
                    mastery_after
            )


            learning_path.append(
                course
            )


            projects.append(

                f"Build a practical "
                f"{skill} project."

            )


            assessments.append(

                f"{course_name} "
                f"Assessment"

            )


            # ---------------------------------------------
            # SKILL GAP
            # ---------------------------------------------

            normalized_skill = (

                str(skill)
                .strip()
                .lower()

            )


            if (
                normalized_skill
                not in learner_skills
            ):

                if (
                    skill
                    not in skill_gaps
                ):

                    skill_gaps.append(
                        skill
                    )


        # =================================================
        # READINESS
        # =================================================

        current_skills = len(
            profile.skills or []
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

                * 100

            )


        readiness = max(

            0,

            min(

                100,

                readiness

            )

        )


        # =================================================
        # LOG
        # =================================================

        print(
            "\n================================"
        )

        print(
            "ROADMAP GENERATED"
        )

        print(
            "================================"
        )

        print(
            "Total Steps:",
            len(learning_path)
        )


        for index, course in enumerate(

            learning_path,

            start=1

        ):

            print(

                f"Step {index}: "
                f"{course.title} | "
                f"{course.mastery_before}% -> "
                f"{course.mastery_after}%"

            )


        print(
            "Skill Gaps:",
            skill_gaps
        )


        print(
            "Readiness:",
            readiness
        )


        print(
            "================================\n"
        )


        # =================================================
        # RETURN
        # =================================================

        return RecommendationResponse(

            skill_gaps=
                skill_gaps,

            learning_path=
                learning_path,

            projects=
                projects,

            assessments=
                assessments,

            goal=
                profile.goal,

            readiness_percentage=
                readiness

        )


    # =====================================================
    # CONNECTION ERROR
    # =====================================================

    except requests.exceptions.ConnectionError:

        raise HTTPException(

            status_code=503,

            detail=(

                "ML service is not running. "
                "Please start the ML service "
                "on port 8001."

            )

        )


    # =====================================================
    # TIMEOUT
    # =====================================================

    except requests.exceptions.Timeout:

        raise HTTPException(

            status_code=504,

            detail=(

                "ML service request timed out."

            )

        )


    # =====================================================
    # HTTP EXCEPTION
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


# =========================================================
# AI CHAT ASSISTANT
# =========================================================

@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(
    request: ChatRequest
):

    try:

        print(
            "\n================================"
        )

        print(
            "LEARNPATH AI - GROQ CHAT REQUEST"
        )

        print(
            "================================"
        )


        print(
            "Student:",
            request.profile.name
        )


        print(
            "Goal:",
            request.profile.goal
        )


        print(
            "Question:",
            request.question
        )


        # -------------------------------------------------
        # CALL GROQ
        # -------------------------------------------------

        answer = ask_groq(

            question=
                request.question,

            profile=
                request.profile,

            roadmap=
                request.roadmap,

            history=
                request.history

        )


        print(
            "\nGroq response generated successfully."
        )

        print(
            "================================\n"
        )


        return ChatResponse(

            answer=answer

        )


    except Exception as error:

        print(
            "\n================================"
        )

        print(
            "GROQ CHAT ERROR"
        )

        print(
            "================================"
        )

        print(
            error
        )

        print(
            "================================\n"
        )


        raise HTTPException(

            status_code=500,

            detail=(

                "The AI Assistant could not "
                "generate a response. "
                "Please try again."

            )

        )