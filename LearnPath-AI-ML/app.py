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

        completed_courses = (

            payload.get(
                "completedCourses",
                []
            )

        )


        # -------------------------------------------------
        # NUMBER OF RECOMMENDATIONS
        # -------------------------------------------------

        recommendations = recommend_courses(

            user=user,

            completed_courses=
                completed_courses,

            number_of_recommendations=
                10

        )


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success":
                True,

            "recommendations":
                recommendations,

            "count":
                len(recommendations)

        }


    except Exception as error:

        print(
            "ML Recommendation Error:",
            error
        )


        raise HTTPException(

            status_code=500,

            detail=str(error)

        )