from typing import List

from pydantic import BaseModel, Field


class LearnerProfile(BaseModel):
    name: str = Field(..., min_length=1)
    goal: str
    experience: str
    study_time: str
    interests: List[str] = []
    skills: List[str] = []
    previous_courses: str = ""
    learning_style: str = "Mixed Learning"


class CourseRecommendation(BaseModel):
    title: str
    level: str
    duration: str
    description: str
    skills: List[str]
    project: str


class RecommendationResponse(BaseModel):
    skill_gaps: List[str]
    learning_path: List[CourseRecommendation]
    projects: List[str]
    assessments: List[str]
    goal: str
