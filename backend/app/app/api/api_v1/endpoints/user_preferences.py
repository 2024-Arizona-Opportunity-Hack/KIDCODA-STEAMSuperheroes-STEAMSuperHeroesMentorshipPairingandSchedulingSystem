from app.crud.user_preferences import user_preference as pref_crud
from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from app.api import deps
from pydantic.networks import EmailStr
from app.schemas.user_preferences import UserPreferenceCreate, UserPreferenceUpdate


router = APIRouter()

@router.get("/", dependencies=[Depends(deps.get_current_active_superuser)])
async def get_preferences_by_session(*, email: str | None = None, session_name: str, db: AgnosticDatabase = Depends(deps.get_db)):
    """
    Retrieve user preferences.
    """
    if email:
        try:
            user_preferences = await pref_crud.get_by_email_and_session_name(db, email=email, session_name=session_name)
        except Exception as e:
            raise HTTPException(status_code=404, detail="User preferences not found")
    else:
        try:
            user_preferences = await pref_crud.get_all_users_by_session_name(db, session_name=session_name)
        except Exception as e:
            raise HTTPException(status_code=404, detail="User preferences not found")
    return user_preferences

@router.post("/", dependencies=[Depends(deps.get_current_active_user)])
async def upsert_user_preferences(*, user_preference_in: UserPreferenceCreate, db: AgnosticDatabase = Depends(deps.get_db)):
    """
    Create new user preferences.
    """
    try:
        user_preferences = await pref_crud.upsert(db, obj_in=user_preference_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail="No session is currently active")
    return user_preferences

@router.delete("/", dependencies=[Depends(deps.get_current_active_superuser)])
async def delete_user_preferences(*, email: EmailStr, session_name: str, db: AgnosticDatabase = Depends(deps.get_db)):
    """
    Delete user preferences.
    """
    try:
        await pref_crud.delete_by_email_and_session_name(db, email=email, session_name=session_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail="User preferences not found")

@router.put("/", dependencies=[Depends(deps.get_current_active_superuser)])
async def update_user_preferences(*, email: EmailStr, session_name: str, user_preference_in: UserPreferenceUpdate, db: AgnosticDatabase = Depends(deps.get_db)):
    """
    Update user preferences.
    """
    try:
        user_preferences = await pref_crud.update_user_preferences(db, email=email, session_name=session_name, obj_in=user_preference_in)
    except Exception as e:
        raise HTTPException(status_code=404, detail="User preferences not found")
    return user_preferences
