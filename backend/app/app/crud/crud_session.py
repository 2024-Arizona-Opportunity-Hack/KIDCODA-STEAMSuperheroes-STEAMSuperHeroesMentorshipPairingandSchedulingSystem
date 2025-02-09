from typing import Any, Dict, Union
from app.crud.base import CRUDBase
from app.models.session import Session
from app.models.user_preferences import UserPreference
from app.schemas.session import SessionCreate, SessionUpdate
from motor.core import AgnosticDatabase
from app.best_match import find_best_match, add_random_users
from app.model_types.enums import StatusEnum
from app.crud.user_preferences import user_preference as pref_crud
from odmantic import Model



class CRUDSession(CRUDBase[Session, SessionCreate, SessionUpdate]):
    async  def get_session_by_name(self, db: AgnosticDatabase, *, session_name: str) -> Session | None:
        return await self.engine.find_one(Session, Session.name == session_name)

    async def get_all_sessions(self, db: AgnosticDatabase) -> list[Session]:
        return await self.engine.find(Session)
    
    async def get_active_session(self, db: AgnosticDatabase) -> Session | None:
        return await self.engine.find_one(Session, Session.active == True)
    
    async def create_session(self, db: AgnosticDatabase, *, session_in: SessionCreate) -> Session:
        if await self.get_active_session(db):
            raise ValueError("There is already an active session")

        session = Session(**session_in.dict())
        return await self.engine.save(session)
    
    async def update_session(self, db: AgnosticDatabase, *, session_name, session_in: Union[SessionUpdate, Dict[str, Any]]) -> Session:
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")

        return await self.update(db, db_obj=session, obj_in=session_in)
    
    async def remove(self, db: AgnosticDatabase, *, session_name: str) -> Session:
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")
        await self.engine.delete(session)
    async def pairing_session(self, db: AgnosticDatabase, *, session_name: str):
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")
        try:
            users = add_random_users(1)
            for user in users:
                print(user)
                await self.engine.save(UserPreference(**user))
            return 1
        except Exception as e:
            return {"error": str(e)}
        # if session.pairing_status == StatusEnum.NOT_STARTED:
        #     await self.update_session(db, session_name=session_name, session_in={"pairing_status": StatusEnum.IN_PROGRESS})
            
        #     try:
        #         # Load user preferences with the given session name
        #         users = await self.engine.find(UserPreference, UserPreference.session_name == session_name)
        #         # Call the find_best_match function
        #         users = add_random_users(200)
        #         for user in users:
        #             await pref_crud.create(db, obj_in=user)
                
        #         matches, updated_mentees, updated_mentors = find_best_match(list(users))
        #         for mentee in updated_mentees:
        #             pref_crud.update_user_preferences(db, email=mentee.email, session_name=mentee.session_name, obj_in=mentee)

        #         for mentor in updated_mentors:
        #             pref_crud.update_user_preferences(db, email=mentor.email, session_name=mentor.session_name, obj_in=mentor)
                
        #         for match in matches:
        #             await self.engine.save(match)

        #     except Exception as e:
        #         await self.update_session(db, session_name=session_name, session_in={"pairing_status": StatusEnum.NOT_STARTED})
        #         raise ValueError("Pairing failed")

        #     await self.update_session(db, session_name=session_name, session_in={"pairing_status": StatusEnum.COMPLETED})
        #     return {"status": "Pairing completed"}
        # else:
        #     return {"status": session.pairing_status}

session = CRUDSession(Session)
