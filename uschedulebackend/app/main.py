
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import curriculum, spatial, assignment
from .core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="2.1",
        description="Unified Scheduling and Spatial Mapping API"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registering all logical modules
    app.include_router(curriculum.router, prefix=settings.API_V1_STR)
    app.include_router(spatial.router, prefix=settings.API_V1_STR)
    
    # Keeping the original assignment router for backward compatibility or shared views
    app.include_router(assignment.router, prefix=settings.API_V1_STR)

    @app.get("/")
    async def health_check():
        return {
            "status": "online",
            "system": settings.PROJECT_NAME,
            "modules": ["Curriculum", "Spatial", "Auth"]
        }

    return app

app = create_app()
