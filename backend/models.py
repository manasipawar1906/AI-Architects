from backend.schemas import LearnerProfile, RecommendationResponse


def generate_recommendation(profile: LearnerProfile) -> RecommendationResponse:
    """
    Temporary backend recommendation engine.

    This is intentionally simple so the frontend/backend can be connected
    before Sanket finishes the ML module.

    Later, replace this function with:
        from ml.recommender import recommend_learning_path

    and return the ML result in the same response format.
    """

    skills = {skill.lower() for skill in profile.skills}
    interests = {item.lower() for item in profile.interests}

    skill_gaps = []

    if "python" not in skills:
        skill_gaps.append("Python")

    if "statistics" not in skills:
        skill_gaps.append("Statistics")

    if "machine learning" not in skills:
        skill_gaps.append("Machine Learning")

    if "deep learning" not in skills:
        skill_gaps.append("Deep Learning")

    if "nlp" in interests and "nlp" not in skills:
        skill_gaps.append("Natural Language Processing")

    if "generative ai" in interests:
        skill_gaps.append("Generative AI")

    # Remove duplicates while preserving order.
    skill_gaps = list(dict.fromkeys(skill_gaps))

    learning_path = [
        {
            "title": "Python for AI",
            "level": "Beginner",
            "duration": "2 weeks",
            "description": "Strengthen Python programming skills required for AI development.",
            "skills": ["Python", "NumPy", "Pandas"],
            "project": "Build a data analysis project.",
        },
        {
            "title": "Statistics for Machine Learning",
            "level": "Beginner",
            "duration": "2 weeks",
            "description": "Learn probability, statistics and mathematical concepts used in ML.",
            "skills": ["Statistics", "Probability"],
            "project": "Analyze a real-world dataset.",
        },
        {
            "title": "Machine Learning",
            "level": "Intermediate",
            "duration": "4 weeks",
            "description": "Learn supervised and unsupervised machine learning algorithms.",
            "skills": ["Regression", "Classification", "Clustering"],
            "project": "Build a machine learning prediction system.",
        },
        {
            "title": "Deep Learning",
            "level": "Advanced",
            "duration": "4 weeks",
            "description": "Learn neural networks and deep learning architectures.",
            "skills": ["Neural Networks", "CNN", "RNN"],
            "project": "Build an image classification model.",
        },
        {
            "title": "Natural Language Processing",
            "level": "Advanced",
            "duration": "3 weeks",
            "description": "Learn how machines understand and process human language.",
            "skills": ["NLP", "Transformers", "Text Processing"],
            "project": "Build a text classification system.",
        },
        {
            "title": "Generative AI",
            "level": "Advanced",
            "duration": "3 weeks",
            "description": "Learn LLMs, prompt engineering and generative AI applications.",
            "skills": ["LLMs", "Prompt Engineering", "RAG"],
            "project": "Build an AI chatbot.",
        },
    ]

    projects = [
        "Data Analysis Project",
        "Machine Learning Prediction System",
        "Image Classification Project",
        "AI Chatbot using NLP/Generative AI",
    ]

    assessments = [
        "Python Assessment",
        "Statistics and Machine Learning Quiz",
        "Deep Learning Assessment",
        "NLP and Generative AI Assessment",
    ]

    return RecommendationResponse(
        skill_gaps=skill_gaps,
        learning_path=learning_path,
        projects=projects,
        assessments=assessments,
        goal=profile.goal,
    )
