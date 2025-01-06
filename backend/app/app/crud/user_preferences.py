from typing import Any, Dict, Union

from app.app.model_types.types import PyObjectId
from app.app.schemas.user_preferences import UserPreferenceCreate, UserPreferenceUpdate
from motor.core import AgnosticDatabase

from app.crud.base import CRUDBase
from app.models.user_preferences import UserPreference


class CRUDUserPreference(CRUDBase[UserPreference, UserPreferenceCreate, UserPreferenceUpdate]):
    async def get_by_email_and_session_id(self, db: AgnosticDatabase, *, email: str, session_id: PyObjectId) -> UserPreference | None: # noqa
        return await self.engine.find_one(UserPreference, UserPreference.email == email, UserPreference.session_id == session_id)

    async def get_all_users_by_session_name(self, db: AgnosticDatabase, *, session_name: str) -> list[UserPreference]: # noqa
        return await self.engine.find(UserPreference, UserPreference.sesion_name == session_name)

    async def create(self, db: AgnosticDatabase, *, obj_in: UserPreferenceCreate) -> UserPreference: # noqa
        # Get latest active session ID, throw an error if it doesn't exist
        user_preference = {
            **obj_in.model_dump(),
            "email": obj_in.email,
        }

        return await self.engine.save(UserPreference(**user_preference))

    async def update(self, db: AgnosticDatabase, *, db_obj: UserPreference, obj_in: Union[UserPreferenceUpdate, Dict[str, Any]]) -> UserPreference: # noqa
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        return await super().update(db, db_obj=db_obj, obj_in=update_data)

user_preference = CRUDUserPreference(UserPreference)
