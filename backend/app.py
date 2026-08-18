from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import router

app = FastAPI(
    title="AI-Powered Learning Path Recommender API",
    description="Backend API for the personalized learning path recommender.",
    version="1.0.0",
)

# Allow the Streamlit frontend to communicate with this backend.
# During development we allow all origins. For deployment, restrict this
# to the deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "AI Learning Path Recommender backend is running",
        "docs": "/docs",
        "health": "/health",
    }
