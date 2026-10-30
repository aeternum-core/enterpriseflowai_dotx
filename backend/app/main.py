from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.router import api_router
from app.services.seed_data import seed_database
import app.models # Ensure all models are loaded

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed initial enterprise data
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous Multi-Agent Enterprise Operations Platform with Human-in-the-Loop Governance",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api") # convenience alias

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "platform": settings.PROJECT_NAME,
        "version": "2.4.0",
        "philosophy": "AI agents execute the work. Humans retain authority. Every action is accountable."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

