from backend.schemas import LearnerProfile, RecommendationResponse


def generate_recommendation(
    profile: LearnerProfile
) -> RecommendationResponse:

    # -----------------------------------------
    # Normalize user input
    # -----------------------------------------

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

    goal = profile.goal.strip().lower()
    experience = profile.experience.strip().lower()


    # -----------------------------------------
    # Calculate skill gaps
    # -----------------------------------------

    skill_gaps = []


    # -----------------------------------------
    # Python
    # -----------------------------------------

    if "python" not in skills:

        skill_gaps.append("Python")


    # -----------------------------------------
    # Statistics
    # -----------------------------------------

    if "statistics" not in skills:

        skill_gaps.append("Statistics")


    # -----------------------------------------
    # Machine Learning
    # -----------------------------------------

    if (
        "machine learning" in goal
        or "machine learning" in interests
        or "ai" in goal
        or "artificial intelligence" in goal
    ):

        if "machine learning" not in skills:

            skill_gaps.append(
                "Machine Learning"
            )


    # -----------------------------------------
    # Deep Learning
    # -----------------------------------------

    if (
        "deep learning" in interests
        or "deep learning" in goal
    ):

        if "deep learning" not in skills:

            skill_gaps.append(
                "Deep Learning"
            )


    # -----------------------------------------
    # NLP
    # -----------------------------------------

    if (
        "nlp" in interests
        or "natural language processing" in interests
        or "nlp" in goal
    ):

        if "nlp" not in skills:

            skill_gaps.append(
                "Natural Language Processing"
            )


    # -----------------------------------------
    # Generative AI
    # -----------------------------------------

    if (
        "generative ai" in interests
        or "generative ai" in goal
        or "genai" in interests
    ):

        if "generative ai" not in skills:

            skill_gaps.append(
                "Generative AI"
            )


    # -----------------------------------------
    # Data Science
    # -----------------------------------------

    if (
        "data science" in goal
        or "data science" in interests
        or "data scientist" in goal
    ):

        if "pandas" not in skills:

            skill_gaps.append("Pandas")


        if "numpy" not in skills:

            skill_gaps.append("NumPy")


    # -----------------------------------------
    # Web Development
    # -----------------------------------------

    if (
        "web development" in goal
        or "web developer" in goal
        or "frontend" in interests
        or "backend" in interests
    ):

        if "html" not in skills:

            skill_gaps.append("HTML")


        if "css" not in skills:

            skill_gaps.append("CSS")


        if "javascript" not in skills:

            skill_gaps.append("JavaScript")


    # -----------------------------------------
    # Remove duplicate skill gaps
    # -----------------------------------------

    skill_gaps = list(
        dict.fromkeys(
            skill_gaps
        )
    )


    # -----------------------------------------
    # Calculate readiness percentage
    # -----------------------------------------

    current_skill_count = len(
        skills
    )


    skill_gap_set = {
        gap.strip().lower()
        for gap in skill_gaps
        if gap.strip()
    }


    skill_gap_count = len(
        skill_gap_set
    )


    total_required_skills = (
        current_skill_count
        + skill_gap_count
    )


    if total_required_skills == 0:

        readiness_percentage = 0

    else:

        readiness_percentage = round(
            (
                current_skill_count
                / total_required_skills
            ) * 100
        )


    # -----------------------------------------
    # Keep percentage between 0 and 100
    # -----------------------------------------

    readiness_percentage = max(
        0,
        min(
            100,
            readiness_percentage
        )
    )


    # -----------------------------------------
    # Course database
    # -----------------------------------------

    courses = {

        "python": {

            "title":
                "Python Programming Fundamentals",

            "level":
                "Beginner",

            "duration":
                "2 weeks",

            "description":
                "Learn Python programming, functions, collections and object-oriented programming.",

            "skills":
                [
                    "Python",
                    "Programming"
                ],

            "project":
                "Build a CLI expense tracker."
        },


        "statistics": {

            "title":
                "Statistics for Data Science",

            "level":
                "Beginner",

            "duration":
                "2 weeks",

            "description":
                "Learn probability, statistics, distributions and hypothesis testing.",

            "skills":
                [
                    "Statistics",
                    "Probability"
                ],

            "project":
                "Analyze a real-world dataset statistically."
        },


        "machine learning": {

            "title":
                "Machine Learning Fundamentals",

            "level":
                "Intermediate",

            "duration":
                "4 weeks",

            "description":
                "Learn supervised and unsupervised machine learning algorithms.",

            "skills":
                [
                    "Regression",
                    "Classification",
                    "Clustering"
                ],

            "project":
                "Build a machine learning prediction system."
        },


        "deep learning": {

            "title":
                "Deep Learning with Neural Networks",

            "level":
                "Advanced",

            "duration":
                "4 weeks",

            "description":
                "Learn neural networks, CNNs, RNNs and deep learning architectures.",

            "skills":
                [
                    "Neural Networks",
                    "CNN",
                    "RNN"
                ],

            "project":
                "Build an image classification model."
        },


        "natural language processing": {

            "title":
                "Natural Language Processing",

            "level":
                "Advanced",

            "duration":
                "3 weeks",

            "description":
                "Learn text processing, NLP pipelines and language models.",

            "skills":
                [
                    "NLP",
                    "Text Processing",
                    "Transformers"
                ],

            "project":
                "Build a text classification system."
        },


        "generative ai": {

            "title":
                "Generative AI Fundamentals",

            "level":
                "Advanced",

            "duration":
                "3 weeks",

            "description":
                "Learn LLMs, prompt engineering, embeddings and RAG.",

            "skills":
                [
                    "LLMs",
                    "Prompt Engineering",
                    "RAG"
                ],

            "project":
                "Build an AI chatbot."
        },


        "pandas": {

            "title":
                "Pandas for Data Analysis",

            "level":
                "Beginner",

            "duration":
                "1 week",

            "description":
                "Learn data cleaning, transformation and analysis using Pandas.",

            "skills":
                [
                    "Pandas",
                    "Data Analysis"
                ],

            "project":
                "Clean and analyze a real-world dataset."
        },


        "numpy": {

            "title":
                "NumPy for Data Science",

            "level":
                "Beginner",

            "duration":
                "1 week",

            "description":
                "Learn arrays, vectorization and numerical computing.",

            "skills":
                [
                    "NumPy",
                    "Numerical Computing"
                ],

            "project":
                "Perform numerical analysis on a dataset."
        },


        "html": {

            "title":
                "HTML Fundamentals",

            "level":
                "Beginner",

            "duration":
                "1 week",

            "description":
                "Learn HTML structure, forms, tables and semantic elements.",

            "skills":
                [
                    "HTML"
                ],

            "project":
                "Build a personal portfolio webpage."
        },


        "css": {

            "title":
                "CSS and Web Design",

            "level":
                "Beginner",

            "duration":
                "1 week",

            "description":
                "Learn styling, layouts, responsive design and animations.",

            "skills":
                [
                    "CSS",
                    "Responsive Design"
                ],

            "project":
                "Create a responsive website."
        },


        "javascript": {

            "title":
                "JavaScript Programming",

            "level":
                "Intermediate",

            "duration":
                "2 weeks",

            "description":
                "Learn JavaScript fundamentals, DOM manipulation and APIs.",

            "skills":
                [
                    "JavaScript",
                    "DOM",
                    "APIs"
                ],

            "project":
                "Build an interactive web application."
        }
    }


    # -----------------------------------------
    # Build personalized learning path
    # -----------------------------------------

    learning_path = []


    for gap in skill_gaps:

        key = gap.lower()


        if key in courses:

            learning_path.append(
                courses[key]
            )


    # -----------------------------------------
    # If no skill gaps are found
    # -----------------------------------------

    if not learning_path:

        learning_path = [

            {
                "title":
                    "Advanced Project Development",

                "level":
                    "Advanced",

                "duration":
                    "3 weeks",

                "description":
                    "Apply your existing skills to a real-world project.",

                "skills":
                    list(profile.skills),

                "project":
                    "Build a complete portfolio project."
            }

        ]


    # -----------------------------------------
    # Projects
    # -----------------------------------------

    projects = [

        course["project"]

        for course in learning_path

    ]


    # -----------------------------------------
    # Assessments
    # -----------------------------------------

    assessments = [

        f"{course['title']} Assessment"

        for course in learning_path

    ]


    # -----------------------------------------
    # Return final recommendation
    # -----------------------------------------

    return RecommendationResponse(

        skill_gaps=skill_gaps,

        learning_path=learning_path,

        projects=projects,

        assessments=assessments,

        goal=profile.goal,

        readiness_percentage=
            readiness_percentage
    )