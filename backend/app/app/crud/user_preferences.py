from typing import Any, Dict, Union

from app.schemas.user_preferences import UserPreferenceCreate, UserPreferenceUpdate
from app.models.session import Session
from motor.core import AgnosticDatabase

from app.crud.base import CRUDBase
from app.models.user_preferences import UserPreference


class CRUDUserPreference(CRUDBase[UserPreference, UserPreferenceCreate, UserPreferenceUpdate]):
    async def get_by_email_and_session_name(self, db: AgnosticDatabase, *, email: str, session_name: str) -> UserPreference | None: # noqa
        return await self.engine.find_one(UserPreference, UserPreference.email == email, UserPreference.session_name == session_name)

    async def get_all_users_by_session_name(self, db: AgnosticDatabase, *, session_name: str) -> list[UserPreference]: # noqa
        return await self.engine.find(UserPreference, UserPreference.session_name == session_name)

    async def create(self, db: AgnosticDatabase, *, obj_in: UserPreferenceCreate) -> UserPreference: # noqa
        session = await self.engine.find_one(Session, Session.active == True)
        if session:
            user_preference = {
                **obj_in.model_dump(),
                "session_name": session.name,
            }
            return await self.engine.save(UserPreference(**user_preference))
        else:
            raise Exception("No active session found")
    
    async def upsert(self, db: AgnosticDatabase, *, obj_in: UserPreferenceCreate) -> UserPreference: # noqa
        session = await self.engine.find_one(Session, Session.active == True)
        if session:
            # if email exists in user preferences, update the record
            user_preference_obj = await self.engine.find_one(UserPreference, UserPreference.email == obj_in.email)
            if user_preference_obj:
                user_preference = {
                    **obj_in.model_dump(),
                    "session_name": session.name,
                }
                return await self.update(db, db_obj=user_preference_obj, obj_in=user_preference)
            else:
                user_preference = {
                    **obj_in.model_dump(),
                    "session_name": session.name,
                }
                return await self.engine.save(UserPreference(**user_preference))
        else:
            raise Exception("No active session found")
        
    async def update_user_preferences(self, db: AgnosticDatabase, *, email: str, session_name: str, obj_in: Union[UserPreferenceUpdate, Dict[str, Any]]) -> UserPreference: # noqa
        user_preference = await self.get_by_email_and_session_name(db, email=email, session_name=session_name)


        if user_preference:
            return await self.update(db, db_obj=user_preference, obj_in=obj_in)
        else:
            raise Exception("User preferences not found")

    async def update(self, db: AgnosticDatabase, *, db_obj: UserPreference, obj_in: Union[UserPreferenceUpdate, Dict[str, Any]]) -> UserPreference: # noqa
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        return await super().update(db, db_obj=db_obj, obj_in=update_data)
    
    async def delete_by_email_and_session_name(self, db: AgnosticDatabase, email: str, session_name: str):
        obj = await self.get_by_email_and_session_name(db, email=email, session_name=session_name)
        return await self.engine.delete(obj)

user_preference = CRUDUserPreference(UserPreference)
