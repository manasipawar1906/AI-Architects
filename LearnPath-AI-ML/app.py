from fastapi import FastAPI, HTTPException

from recommender import (
    recommend_courses
)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(

    title=
        "LearnPath AI ML Service",

    description=
        "Machine learning recommendation "
        "service for LearnPath AI",

    version=
        "2.0.0"
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {

        "message":
            "LearnPath AI ML service is running",

        "service":
            "ML Recommendation Engine",

        "endpoint":
            "/api/recommend"
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {

        "status":
            "ok",

        "service":
            "ml"
    }


# =========================================================
# RECOMMENDATION
# =========================================================

@app.post("/api/recommend")
def recommend(
    payload: dict
):

    try:

        # -------------------------------------------------
        # USER DATA
        # -------------------------------------------------

        user = payload.get(
            "user",
            {}
        )


        # -------------------------------------------------
        # COMPLETED COURSES
        # -------------------------------------------------

        completed_courses = payload.get(
            "completedCourses",
            []
        )


        # -------------------------------------------------
        # STUDY HOURS
        # -------------------------------------------------

        try:

            study_hours = float(
                payload.get(
                    "studyHours",
                    user.get(
                        "study_hours",
                        5
                    )
                )
            )

        except (
            TypeError,
            ValueError
        ):

            study_hours = 5.0


        # -------------------------------------------------
        # TARGET MONTHS
        # -------------------------------------------------

        try:

            target_months = int(
                payload.get(
                    "targetMonths",
                    6
                )
            )

        except (
            TypeError,
            ValueError
        ):

            target_months = 6


        study_hours = max(
            1.0,
            study_hours
        )

        target_months = max(
            1,
            target_months
        )


        # -------------------------------------------------
        # DETERMINE NUMBER OF ROADMAP STEPS
        # -------------------------------------------------

        # Approximate available study time.
        # 4.33 weeks are considered per month.

        available_hours = (
            study_hours
            * 4.33
            * target_months
        )


        # Each course is treated as roughly
        # 10 hours of learning effort.
        #
        # Minimum = 3
        # Maximum = 10

        number_of_recommendations = max(
            3,
            min(
                10,
                int(
                    available_hours // 10
                )
            )
        )


        # -------------------------------------------------
        # DEBUG INFORMATION
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
            "Goal:",
            user.get(
                "_goal",
                ""
            )
        )

        print(
            "Experience:",
            user.get(
                "_experience",
                ""
            )
        )

        print(
            "Skills:",
            user.get(
                "_all_skills",
                []
            )
        )

        print(
            "Interests:",
            user.get(
                "_interests",
                []
            )
        )

        print(
            "Completed Courses:",
            completed_courses
        )

        print(
            "Study Hours:",
            study_hours
        )

        print(
            "Target Months:",
            target_months
        )

        print(
            "Number of Recommendations:",
            number_of_recommendations
        )

        print(
            "================================"
        )


        # -------------------------------------------------
        # CALL RECOMMENDER
        # -------------------------------------------------

        recommendations = recommend_courses(

            user=user,

            completed_courses=
                completed_courses,

            number_of_recommendations=
                number_of_recommendations

        )


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        print(
            "\nML Recommendations Generated:"
        )

        print(
            len(recommendations)
        )


        return {

            "success":
                True,

            "recommendations":
                recommendations,

            "count":
                len(recommendations)

        }


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as error:

        print(
            "ML Recommendation Error:",
            error
        )


        raise HTTPException(

            status_code=500,

            detail=str(
                error
            )

        )