from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .utils.limiter import limiter
from .routers import (
    auth_router, places_router, verifications_router,
    users_router, cities_router, media_router, admin_router
)
from .config import settings

app = FastAPI(
    title="Late Night Club API",
    description="Community-powered late-night places — open source, self-hostable.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(places_router)
app.include_router(verifications_router)
app.include_router(users_router)
app.include_router(cities_router)
app.include_router(media_router)
app.include_router(admin_router)


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.ENVIRONMENT}

@app.get("/isAlive")
def is_alive():
    return {"status": "alive"}
