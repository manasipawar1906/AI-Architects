from fastapi import APIRouter

from backend.schemas import LearnerProfile, RecommendationResponse
from backend.models import generate_recommendation

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(profile: LearnerProfile):
    """
    Receive a learner profile and return a personalized learning path.

    For now this calls the backend demo recommendation engine.
    Sanket can later replace generate_recommendation() with the ML module.
    """
    return generate_recommendation(profile)
