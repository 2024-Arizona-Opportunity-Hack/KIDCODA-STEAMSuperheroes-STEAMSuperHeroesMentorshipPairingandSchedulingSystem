import pytz
from typing import Any, Dict, Union
from app.crud.base import CRUDBase
from app.models.session import Session
from app.schemas.session import SessionCreate, SessionUpdate
from motor.core import AgnosticDatabase

class CRUDSession(CRUDBase[Session, SessionCreate, SessionUpdate]):
    async  def get_session_by_name(self, db: AgnosticDatabase, *, session_name: str) -> Session | None:
        return await self.engine.find_one(Session, Session.session_name == session_name)

    async def get_all_sessions(self, db: AgnosticDatabase) -> list[Session]:
        return await self.engine.find(Session)
    
    async def get_active_session(self, db: AgnosticDatabase) -> Session | None:
        return await self.engine.find_one(Session, Session.active == True)
    
    async def create_session(self, db: AgnosticDatabase, *, session_in: SessionCreate) -> Session:
        if await self.get_active_session(db):
            raise ValueError("There is already an active session")

        try:
            timezone = pytz.timezone(session_in.timezone)
            session_in.start_date = session_in.start_date.astimezone(timezone).replace(tzinfo=None)
            session_in.end_date = session_in.end_date.astimezone(timezone).replace(tzinfo=None)
            session = Session(**session_in.dict())
        except pytz.exceptions.UnknownTimeZoneError:
            raise ValueError("Invalid timezone")
        return await self.engine.save(session)

    async def update_session(self, db: AgnosticDatabase, *, session_name, session_in: Union[SessionUpdate, Dict[str, Any]]) -> Session:
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")
        
        session_data = session_in.dict(exclude_unset=True)

        if "timezone" in session_data and session_data["timezone"]:
            try:
                timezone = pytz.timezone(session_data["timezone"])
                if "start_date" in session_data and session_data["start_date"]:
                    session_data["start_date"] = session_data["start_date"].astimezone(timezone).replace(tzinfo=None)
                if "end_date" in session_data and session_data["end_date"]:
                    session_data["end_date"] = session_data["end_date"].astimezone(timezone).replace(tzinfo=None)
            except pytz.exceptions.UnknownTimeZoneError:
                raise ValueError("Invalid timezone")

        return await self.update(db, db_obj=session, obj_in=session_data)
    
    async def remove(self, db: AgnosticDatabase, *, session_name: str) -> Session:
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")
        await self.engine.delete(session)

session = CRUDSession(Session)
