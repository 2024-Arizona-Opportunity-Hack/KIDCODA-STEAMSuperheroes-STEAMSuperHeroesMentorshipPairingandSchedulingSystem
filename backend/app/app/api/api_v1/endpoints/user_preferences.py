from app import crud
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from app.api import deps
from pydantic.networks import EmailStr


router = APIRouter()

@router.get("/", dependencies=[Depends(deps.get_current_active_superuser)])
async def get_preferences_by_session(*, session_name: str, db: AgnosticDatabase = Depends(deps.get_db)):
    """
    Retrieve user preferences.
    """
    user_preferences = await crud.user_preferences.get_all_users_by_session_name(db, session_name=session_name)
    return user_preferences