from pydantic import BaseModel, Field
from typing import List


# =========================================================
# LEARNER PROFILE
# =========================================================

class LearnerProfile(BaseModel):
    name: str = ""

    email: str = ""

    goal: str = ""

    experience: str = "Beginner"

    skills: List[str] = Field(
        default_factory=list
    )

    interests: List[str] = Field(
        default_factory=list
    )

    completed: List[str] = Field(
        default_factory=list
    )

    learning_style: str = "Mixed"

    study_time: str = "4"

    target_months: int = 6


# =========================================================
# COURSE RECOMMENDATION
# =========================================================

class CourseRecommendation(BaseModel):
    title: str

    level: str

    duration: str

    description: str

    skills: List[str] = Field(
        default_factory=list
    )

    project: str = ""

    # -----------------------------------------------------
    # MASTERY INFORMATION
    # -----------------------------------------------------

    mastery_before: float = 0.0

    mastery_gain: float = 0.0

    mastery_after: float = 0.0


# =========================================================
# RECOMMENDATION RESPONSE
# =========================================================

class RecommendationResponse(BaseModel):
    skill_gaps: List[str] = Field(
        default_factory=list
    )

    learning_path: List[
        CourseRecommendation
    ] = Field(
        default_factory=list
    )

    projects: List[str] = Field(
        default_factory=list
    )

    assessments: List[str] = Field(
        default_factory=list
    )

    goal: str = ""

    readiness_percentage: int = 0


# =========================================================
# AI CHAT MESSAGE
# =========================================================

class ChatMessage(BaseModel):
    role: str

    content: str


# =========================================================
# AI CHAT REQUEST
# =========================================================

class ChatRequest(BaseModel):
    question: str

    profile: LearnerProfile = Field(
        default_factory=LearnerProfile
    )

    roadmap: RecommendationResponse | None = None

    history: List[ChatMessage] = Field(
        default_factory=list
    )


# =========================================================
# AI CHAT RESPONSE
# =========================================================

class ChatResponse(BaseModel):
    answer: str