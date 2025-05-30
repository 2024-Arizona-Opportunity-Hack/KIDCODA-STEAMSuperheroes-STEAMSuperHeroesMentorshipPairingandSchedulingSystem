from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import api_router
from app.core.config import settings


@asynccontextmanager
async def app_init(app: FastAPI):
    app.include_router(api_router, prefix=settings.API_V1_STR)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=app_init,
)

@app.get("/")
async def root():
    return {"message": "STEAM Superheroes API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

