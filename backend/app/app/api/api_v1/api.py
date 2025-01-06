from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    login,
    users,
)

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(user_preferences.router, prefix="/user_preferences", tags=["user_preferences"])
api_router.include_router(session.router, prefix="/session", tags=["session"])
