import re
import pandas as pd
import joblib


# =========================================================
# FILE CONFIGURATION
# =========================================================

MODEL_PATH = "model.pkl"
COURSES_PATH = "dataset/courses.csv"


# =========================================================
# LOAD MODEL
# =========================================================

try:
    model = joblib.load(MODEL_PATH)

    print("================================")
    print("ML MODEL LOADED SUCCESSFULLY")
    print("================================")

except Exception as error:

    print("ERROR: Could not load model.pkl")
    print(error)

    model = None


# =========================================================
# LOAD COURSE DATASET
# =========================================================

try:

    courses = pd.read_csv(
        COURSES_PATH
    )

    print(
        f"Course dataset loaded successfully. "
        f"{len(courses)} courses found."
    )

except Exception as error:

    print("ERROR: Could not load courses.csv")
    print(error)

    courses = pd.DataFrame()


# =========================================================
# NORMALIZATION
# =========================================================

def normalize_text(value):

    if value is None:
        return ""

    value = str(value).strip().lower()

    value = re.sub(
        r"[^a-z0-9]+",
        " ",
        value
    )

    return re.sub(
        r"\s+",
        " ",
        value
    ).strip()


# =========================================================
# NORMALIZE SKILLS
# =========================================================

def normalize_skill(skill):

    value = normalize_text(
        skill
    )

    mapping = {

        # Python
        "python":
            "Python",

        # Statistics
        "statistics":
            "Statistics",

        "statistical":
            "Statistics",

        "statistical analysis":
            "Statistics",

        "probability":
            "Statistics",

        # Machine Learning
        "machine learning":
            "ML",

        "machine learning engineer":
            "ML",

        "ml":
            "ML",

        # Deep Learning
        "deep learning":
            "DL",

        "deep learning engineer":
            "DL",

        "dl":
            "DL",

        # NLP
        "nlp":
            "NLP",

        "natural language processing":
            "NLP",

        "natural language":
            "NLP",

        # Transformers
        "transformer":
            "Transformers",

        "transformers":
            "Transformers",

        # Data Analysis
        "pandas":
            "Data Analysis",

        "data analysis":
            "Data Analysis",

        "data analytics":
            "Data Analysis",

        "data analyst":
            "Data Analysis",

        # AI
        "ai":
            "AI",

        "artificial intelligence":
            "AI"
    }

    return mapping.get(
        value,
        str(skill).strip().title()
    )


# =========================================================
# CAREER GOAL PROFILES
# =========================================================

GOAL_PROFILES = {

    "data_scientist": {

        "keywords": [
            "data scientist",
            "data science",
            "data scientist engineer"
        ],

        "weights": {

            "Python": 0.95,

            "Statistics": 1.00,

            "Data Analysis": 1.00,

            "ML": 0.95,

            "DL": 0.25,

            "NLP": 0.10,

            "Transformers": 0.05,

            "AI": 0.20
        }
    },


    "data_analyst": {

        "keywords": [
            "data analyst",
            "data analytics",
            "business analyst"
        ],

        "weights": {

            "Python": 0.85,

            "Statistics": 1.00,

            "Data Analysis": 1.00,

            "ML": 0.45,

            "DL": 0.05,

            "NLP": 0.05,

            "Transformers": 0.02,

            "AI": 0.10
        }
    },


    "machine_learning": {

        "keywords": [
            "machine learning engineer",
            "machine learning",
            "ml engineer",
            "ml developer"
        ],

        "weights": {

            "Python": 0.95,

            "Statistics": 0.90,

            "ML": 1.00,

            "Data Analysis": 0.45,

            "DL": 0.75,

            "NLP": 0.15,

            "Transformers": 0.15,

            "AI": 0.35
        }
    },


    "nlp": {

        "keywords": [
            "nlp engineer",
            "nlp developer",
            "natural language processing",
            "natural language engineer"
        ],

        "weights": {

            "Python": 0.90,

            "Statistics": 0.65,

            "ML": 0.80,

            "DL": 0.55,

            "NLP": 1.00,

            "Transformers": 1.00,

            "Data Analysis": 0.20,

            "AI": 0.55
        }
    },


    "ai_engineer": {

        "keywords": [
            "ai engineer",
            "ai developer",
            "artificial intelligence engineer",
            "artificial intelligence developer"
        ],

        "weights": {

            "Python": 0.90,

            "Statistics": 0.65,

            "ML": 0.95,

            "DL": 0.90,

            "NLP": 0.65,

            "Transformers": 0.90,

            "Data Analysis": 0.20,

            "AI": 1.00
        }
    },


    "deep_learning": {

        "keywords": [
            "deep learning engineer",
            "deep learning",
            "computer vision engineer",
            "neural network engineer"
        ],

        "weights": {

            "Python": 0.90,

            "Statistics": 0.65,

            "ML": 0.90,

            "DL": 1.00,

            "NLP": 0.35,

            "Transformers": 0.50,

            "Data Analysis": 0.15,

            "AI": 0.55
        }
    }
}


# =========================================================
# GET GOAL PROFILE
# =========================================================

def get_goal_profile(
    goal,
    interests
):

    normalized_goal = normalize_text(
        goal
    )

    normalized_interests = [

        normalize_text(item)

        for item in (
            interests or []
        )
    ]


    # -----------------------------------------------------
    # EXACT GOAL MATCH
    # -----------------------------------------------------

    for profile in GOAL_PROFILES.values():

        for keyword in profile["keywords"]:

            if keyword in normalized_goal:

                return dict(
                    profile["weights"]
                )


    # -----------------------------------------------------
    # INTEREST-BASED FALLBACK
    # -----------------------------------------------------

    inferred = {

        "Python": 0.20,

        "Statistics": 0.20,

        "ML": 0.20,

        "DL": 0.10,

        "NLP": 0.10,

        "Transformers": 0.05,

        "Data Analysis": 0.10,

        "AI": 0.15
    }


    interest_text = " ".join(
        normalized_interests
    )


    if (
        "nlp" in interest_text
        or
        "natural language" in interest_text
    ):

        inferred["NLP"] = 0.90

        inferred["Transformers"] = 0.80


    if (
        "machine learning" in interest_text
        or
        " ml " in f" {interest_text} "
    ):

        inferred["ML"] = 0.90


    if "deep learning" in interest_text:

        inferred["DL"] = 0.90


    if (
        "generative ai" in interest_text
        or
        "genai" in interest_text
    ):

        inferred["AI"] = 0.90

        inferred["Transformers"] = 0.90


    if (
        "data science" in interest_text
        or
        "data analysis" in interest_text
    ):

        inferred["Data Analysis"] = 0.90

        inferred["Statistics"] = 0.85


    return inferred


# =========================================================
# BUILD SKILL MASTERY
# =========================================================

def build_skill_mastery(user):

    skills = [

        normalize_skill(skill)

        for skill in user.get(
            "_all_skills",
            []
        )
    ]


    skill_set = set(
        skills
    )


    mastery = {

        "Python":
            100 if "Python" in skill_set else 0,

        "Statistics":
            100 if "Statistics" in skill_set else 0,

        "ML":
            100 if "ML" in skill_set else 0,

        "DL":
            100 if "DL" in skill_set else 0,

        "NLP":
            100 if "NLP" in skill_set else 0,

        "Transformers":
            100
            if "Transformers" in skill_set
            else 0,

        "Data Analysis":
            100
            if "Data Analysis" in skill_set
            else 0,

        "AI":
            100 if "AI" in skill_set else 0
    }


    return mastery


# =========================================================
# ML SUCCESS PREDICTION
# =========================================================

def predict_success(
    user,
    difficulty
):

    if model is None:

        return 0.50


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


    try:

        probability = model.predict_proba(
            features
        )[0][1]

        return float(
            max(
                0.0,
                min(
                    1.0,
                    probability
                )
            )
        )

    except Exception as error:

        print(
            "Prediction error:",
            error
        )

        return 0.50


# =========================================================
# COURSE DIFFICULTY
# =========================================================

def get_course_difficulty(
    course
):

    try:

        difficulty = int(
            course.get(
                "difficulty",
                3
            )
        )

    except (
        TypeError,
        ValueError
    ):

        difficulty = 3


    return max(
        1,
        min(
            5,
            difficulty
        )
    )


# =========================================================
# COURSE HOURS
# =========================================================

def get_course_hours(
    course
):

    try:

        hours = int(
            course.get(
                "estimated_hours",
                5
            )
        )

    except (
        TypeError,
        ValueError
    ):

        hours = 5


    return max(
        1,
        hours
    )


# =========================================================
# PREREQUISITES
# =========================================================

def get_prerequisite_ids(
    prerequisites
):

    if prerequisites is None:

        return []


    try:

        if pd.isna(
            prerequisites
        ):

            return []

    except Exception:

        pass


    text = str(
        prerequisites
    ).strip()


    if not text:

        return []


    result = []


    for value in text.split(","):

        value = value.strip()


        if not value:

            continue


        try:

            result.append(
                int(value)
            )

        except ValueError:

            return []


    return result


# =========================================================
# CHECK PREREQUISITES
# =========================================================

def prerequisites_satisfied(
    prerequisites,
    completed_courses
):

    required = get_prerequisite_ids(
        prerequisites
    )


    completed = set()


    for course_id in (
        completed_courses or []
    ):

        try:

            completed.add(
                int(course_id)
            )

        except (
            TypeError,
            ValueError
        ):

            continue


    return all(

        course_id in completed

        for course_id in required

    )


# =========================================================
# RESOLVE COMPLETED COURSES
# =========================================================

def resolve_completed_courses(
    completed_ids,
    completed_names
):

    completed = set()


    # -----------------------------------------------------
    # COURSE IDS
    # -----------------------------------------------------

    for course_id in (
        completed_ids or []
    ):

        try:

            completed.add(
                int(course_id)
            )

        except (
            TypeError,
            ValueError
        ):

            pass


    # -----------------------------------------------------
    # COURSE NAMES
    # -----------------------------------------------------

    normalized_names = {

        normalize_text(name)

        for name in (
            completed_names or []
        )

        if normalize_text(name)
    }


    if courses.empty:

        return completed


    for _, course in courses.iterrows():

        try:

            course_id = int(
                course["course_id"]
            )

        except (
            TypeError,
            ValueError
        ):

            continue


        course_name = normalize_text(
            course.get(
                "course_name",
                ""
            )
        )


        if (
            course_name
            in normalized_names
        ):

            completed.add(
                course_id
            )


    return completed


# =========================================================
# INFER COMPLETED FOUNDATION COURSES
# =========================================================

def infer_completed_from_skills(
    user,
    completed
):

    mastery = build_skill_mastery(
        user
    )


    inferred = set(
        completed
    )


    foundation_courses = {

        "Python": 1,

        "Statistics": 3,

        "ML": 7,

        "DL": 11,

        "NLP": 15,

        "Transformers": 17,

        "Data Analysis": 5
    }


    for skill, course_id in (
        foundation_courses.items()
    ):

        if mastery.get(
            skill,
            0
        ) >= 95:

            inferred.add(
                course_id
            )


    return inferred


# =========================================================
# FUTURE RELEVANCE
# =========================================================

def future_relevance(
    course_id,
    goal_weights,
    visited=None
):

    if courses.empty:

        return 0.0


    if visited is None:

        visited = set()


    if course_id in visited:

        return 0.0


    visited.add(
        course_id
    )


    best = 0.0


    for _, future_course in (
        courses.iterrows()
    ):

        try:

            future_id = int(
                future_course.get(
                    "course_id"
                )
            )

        except (
            TypeError,
            ValueError
        ):

            continue


        required = get_prerequisite_ids(
            future_course.get(
                "prerequisites",
                ""
            )
        )


        if course_id not in required:

            continue


        future_skill = normalize_skill(
            future_course.get(
                "primary_skill",
                ""
            )
        )


        direct_score = goal_weights.get(
            future_skill,
            0.0
        )


        transitive_score = future_relevance(

            future_id,

            goal_weights,

            visited.copy()

        )


        best = max(
            best,
            direct_score,
            transitive_score
        )


    return best


# =========================================================
# INTEREST BONUS
# =========================================================

def interest_bonus(
    skill,
    interests
):

    text = " ".join(

        normalize_text(item)

        for item in (
            interests or []
        )
    )


    if skill == "NLP":

        return 1.0 if (

            "nlp" in text

            or
            "natural language" in text

        ) else 0.0


    if skill == "Transformers":

        return 1.0 if (

            "transformer" in text

            or
            "generative ai" in text

            or
            "genai" in text

        ) else 0.0


    if skill == "ML":

        return 1.0 if (
            "machine learning"
            in text
        ) else 0.0


    if skill == "DL":

        return 1.0 if (
            "deep learning"
            in text
        ) else 0.0


    if skill == "Data Analysis":

        return 1.0 if (

            "data analysis" in text

            or
            "data science" in text

        ) else 0.0


    if skill == "AI":

        return 1.0 if (

            "artificial intelligence"
            in text

            or
            "generative ai"
            in text

            or
            "genai"
            in text

        ) else 0.0


    return 0.0


# =========================================================
# COURSE SCORE
# =========================================================

def calculate_course_score(
    course,
    user,
    goal_weights,
    mastery,
    interests
):

    skill = normalize_skill(
        course.get(
            "primary_skill",
            ""
        )
    )


    difficulty = get_course_difficulty(
        course
    )


    # -----------------------------------------------------
    # CURRENT SKILL GAP
    # -----------------------------------------------------

    current_skill = mastery.get(
        skill,
        0
    )


    skill_gap = max(
        0.0,
        (
            100.0
            - current_skill
        ) / 100.0
    )


    # -----------------------------------------------------
    # GOAL RELEVANCE
    # -----------------------------------------------------

    goal_relevance = goal_weights.get(
        skill,
        0.0
    )


    # -----------------------------------------------------
    # INTEREST BONUS
    # -----------------------------------------------------

    bonus = interest_bonus(
        skill,
        interests
    )


    goal_relevance = min(
        1.0,
        goal_relevance
        + (
            0.15
            * bonus
        )
    )


    # -----------------------------------------------------
    # FUTURE RELEVANCE
    # -----------------------------------------------------

    try:

        course_id = int(
            course.get(
                "course_id"
            )
        )

    except (
        TypeError,
        ValueError
    ):

        course_id = -1


    future_goal_relevance = future_relevance(

        course_id,

        goal_weights

    )


    # -----------------------------------------------------
    # ML SUCCESS PROBABILITY
    # -----------------------------------------------------

    success_probability = predict_success(

        user,

        difficulty

    )


    # -----------------------------------------------------
    # DIFFICULTY FIT
    # -----------------------------------------------------

    experience = normalize_text(
        user.get(
            "_experience",
            ""
        )
    )


    if "beginner" in experience:

        target_difficulty = 2

    elif "intermediate" in experience:

        target_difficulty = 3

    else:

        target_difficulty = 4


    difficulty_fit = 1 / (

        1
        +
        abs(
            difficulty
            - target_difficulty
        )

    )


    # -----------------------------------------------------
    # FINAL SCORE
    # -----------------------------------------------------

    score = (

        0.45
        * goal_relevance

        +

        0.20
        * skill_gap

        +

        0.15
        * future_goal_relevance

        +

        0.15
        * success_probability

        +

        0.05
        * difficulty_fit

    )


    return {

        "goal_relevance":
            round(
                goal_relevance * 100,
                2
            ),

        "skill_gap":
            round(
                skill_gap * 100,
                2
            ),

        "future_relevance":
            round(
                future_goal_relevance * 100,
                2
            ),

        "predicted_success":
            round(
                success_probability * 100,
                2
            ),

        "recommendation_score":
            round(
                score * 100,
                2
            )
    }


# =========================================================
# BUILD CANDIDATES
# =========================================================

def build_candidates(
    user,
    completed_courses,
    selected_courses,
    goal_weights,
    mastery,
    interests
):

    candidates = []


    effective_completed = set(
        completed_courses
    )


    # Selected roadmap courses behave as
    # completed for prerequisite purposes.

    for course_id in (
        selected_courses or []
    ):

        try:

            effective_completed.add(
                int(course_id)
            )

        except (
            TypeError,
            ValueError
        ):

            pass


    for _, course in courses.iterrows():

        # -------------------------------------------------
        # COURSE ID
        # -------------------------------------------------

        try:

            course_id = int(
                course.get(
                    "course_id"
                )
            )

        except (
            TypeError,
            ValueError
        ):

            continue


        # -------------------------------------------------
        # SKIP COMPLETED COURSES
        # -------------------------------------------------

        if course_id in effective_completed:

            continue


        # -------------------------------------------------
        # COURSE SKILL
        # -------------------------------------------------

        skill = normalize_skill(
            course.get(
                "primary_skill",
                ""
            )
        )


        if not skill:

            continue


        # -------------------------------------------------
        # SKIP MASTERED SKILLS
        # -------------------------------------------------

        if mastery.get(
            skill,
            0
        ) >= 95:

            continue


        # -------------------------------------------------
        # PREREQUISITES
        # -------------------------------------------------

        prerequisites = course.get(
            "prerequisites",
            ""
        )


        if not prerequisites_satisfied(

            prerequisites,

            effective_completed

        ):

            continue


        # -------------------------------------------------
        # DIFFICULTY
        # -------------------------------------------------

        difficulty = get_course_difficulty(
            course
        )


        # -------------------------------------------------
        # SCORE
        # -------------------------------------------------

        metrics = calculate_course_score(

            course,

            user,

            goal_weights,

            mastery,

            interests

        )


        candidates.append({

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
                get_course_hours(
                    course
                ),

            "skill_gap":
                metrics[
                    "skill_gap"
                ],

            "predicted_success":
                metrics[
                    "predicted_success"
                ],

            "recommendation_score":
                metrics[
                    "recommendation_score"
                ],

            "goal_relevance":
                metrics[
                    "goal_relevance"
                ],

            "reason":
                (
                    "Recommended for your "
                    "career goal."
                )
        })


    # -----------------------------------------------------
    # SORT
    # -----------------------------------------------------

    candidates.sort(

        key=lambda item: (

            item[
                "recommendation_score"
            ],

            item[
                "goal_relevance"
            ],

            item[
                "predicted_success"
            ]

        ),

        reverse=True

    )


    return candidates


# =========================================================
# CALCULATE SKILL GAPS
# =========================================================

def calculate_skill_gaps(
    goal_weights,
    mastery
):

    gaps = []


    for skill, weight in sorted(

        goal_weights.items(),

        key=lambda item:
            item[1],

        reverse=True

    ):

        if weight < 0.40:

            continue


        if mastery.get(
            skill,
            0
        ) < 95:

            gaps.append(
                skill
            )


    return gaps


# =========================================================
# CALCULATE MASTERY GAIN
# =========================================================

def calculate_mastery_gain(
    difficulty,
    course_name
):

    # Base gain according to difficulty.

    if difficulty <= 2:

        gain = 30

    elif difficulty == 3:

        gain = 25

    elif difficulty == 4:

        gain = 20

    else:

        gain = 15


    # Foundational courses give a small
    # additional mastery benefit.

    normalized_name = normalize_text(
        course_name
    )


    foundation_words = [

        "basic",

        "basics",

        "fundamental",

        "fundamentals",

        "introduction",

        "beginner"
    ]


    if any(

        word in normalized_name

        for word in foundation_words

    ):

        gain += 5


    return min(
        gain,
        35
    )


# =========================================================
# RECOMMEND COURSES
# =========================================================

def recommend_courses(
    user,
    completed_courses,
    number_of_recommendations=10
):

    if courses.empty:

        return []


    goal = user.get(
        "_goal",
        ""
    )


    interests = user.get(
        "_interests",
        []
    )


    completed_names = user.get(
        "_completed_names",
        []
    )


    # -----------------------------------------------------
    # GOAL PROFILE
    # -----------------------------------------------------

    goal_weights = get_goal_profile(

        goal,

        interests

    )


    # -----------------------------------------------------
    # INITIAL MASTERY
    # -----------------------------------------------------

    mastery = build_skill_mastery(
        user
    )


    # -----------------------------------------------------
    # COMPLETED COURSES
    # -----------------------------------------------------

    completed = resolve_completed_courses(

        completed_courses,

        completed_names

    )


    # -----------------------------------------------------
    # STRONG DECLARED SKILLS
    # COUNT AS FOUNDATIONS
    # -----------------------------------------------------

    completed = infer_completed_from_skills(

        user,

        completed

    )


    # -----------------------------------------------------
    # VIRTUAL MASTERY
    #
    # This is the critical Fix.
    #
    # It changes while building the roadmap,
    # but never changes the user's actual profile.
    # -----------------------------------------------------

    virtual_mastery = dict(
        mastery
    )


    roadmap = []

    selected_course_ids = []

    skill_counts = {}


    # =====================================================
    # BUILD ROADMAP
    # =====================================================

    for step in range(
        number_of_recommendations
    ):

        # -------------------------------------------------
        # BUILD CURRENT CANDIDATES
        # -------------------------------------------------

        candidates = build_candidates(

            user=user,

            completed_courses=completed,

            selected_courses=
                selected_course_ids,

            goal_weights=
                goal_weights,

            mastery=
                virtual_mastery,

            interests=
                interests
        )


        if not candidates:

            break


        # -------------------------------------------------
        # SELECT BEST COURSE
        # -------------------------------------------------

        selected = None


        for candidate in candidates:

            skill = candidate[
                "skill"
            ]


            count = skill_counts.get(
                skill,
                0
            )


            strong_goal_skill = (

                goal_weights.get(
                    skill,
                    0
                ) >= 0.75

            )


            # Avoid excessive repetition.

            if count >= 3:

                continue


            if (
                count >= 2
                and
                not strong_goal_skill
            ):

                continue


            selected = candidate

            break


        if selected is None:

            selected = candidates[0]


        # -------------------------------------------------
        # COURSE INFORMATION
        # -------------------------------------------------

        skill = selected[
            "skill"
        ]


        course_name = selected[
            "course_name"
        ]


        difficulty = selected[
            "difficulty"
        ]


        # -------------------------------------------------
        # MASTERY BEFORE
        # -------------------------------------------------

        mastery_before = virtual_mastery.get(

            skill,

            0

        )


        # -------------------------------------------------
        # MASTERY GAIN
        # -------------------------------------------------

        mastery_gain = calculate_mastery_gain(

            difficulty,

            course_name

        )


        # -------------------------------------------------
        # MASTERY AFTER
        # -------------------------------------------------

        mastery_after = min(

            100,

            mastery_before
            + mastery_gain

        )


        actual_gain = (

            mastery_after
            - mastery_before

        )


        # -------------------------------------------------
        # SAVE MASTERY DATA
        # -------------------------------------------------

        selected[
            "mastery_before"
        ] = round(

            mastery_before,

            1

        )


        selected[
            "mastery_gain"
        ] = round(

            actual_gain,

            1

        )


        selected[
            "mastery_after"
        ] = round(

            mastery_after,

            1

        )


        # -------------------------------------------------
        # CREATE REASON
        # -------------------------------------------------

        selected[
            "reason"
        ] = (

            f"Recommended for your "
            f"career goal. Your "
            f"{skill} mastery was "
            f"{mastery_before:.0f}% "
            f"before this course. "
            f"Completing this course "
            f"is estimated to increase "
            f"your {skill} mastery by "
            f"{actual_gain:.0f} percentage "
            f"points, reaching "
            f"approximately "
            f"{mastery_after:.0f}%. "
            f"Predicted success "
            f"probability: "
            f"{selected['predicted_success']:.2f}%."
        )


        # -------------------------------------------------
        # UPDATE VIRTUAL MASTERY
        # -------------------------------------------------

        virtual_mastery[
            skill
        ] = mastery_after


        # -------------------------------------------------
        # ADD TO ROADMAP
        # -------------------------------------------------

        roadmap.append(
            selected
        )


        selected_course_ids.append(

            selected[
                "course_id"
            ]

        )


        # -------------------------------------------------
        # UPDATE SKILL COUNT
        # -------------------------------------------------

        skill_counts[
            skill
        ] = (

            skill_counts.get(
                skill,
                0
            )

            + 1

        )


        print(
            f"Step {step + 1}: "
            f"{course_name} | "
            f"{skill}: "
            f"{mastery_before:.0f}% -> "
            f"{mastery_after:.0f}%"
        )


    return roadmap[
        :number_of_recommendations
    ]