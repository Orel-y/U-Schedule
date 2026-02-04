
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import curriculum, spatial, assignment, auth
from .core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="2.1",
        description="Unified Scheduling and Spatial Mapping API with OAuth2 Auth"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(auth.router, prefix=settings.API_V1_STR)
    app.include_router(curriculum.router, prefix=settings.API_V1_STR)
    app.include_router(spatial.router, prefix=settings.API_V1_STR)
    app.include_router(assignment.router, prefix=settings.API_V1_STR)

    @app.get("/")
    async def health_check():
        return {
            "status": "online",
            "system": settings.PROJECT_NAME,
            "modules": ["Auth", "Curriculum", "Spatial"]
        }

    return app

app = create_app()
