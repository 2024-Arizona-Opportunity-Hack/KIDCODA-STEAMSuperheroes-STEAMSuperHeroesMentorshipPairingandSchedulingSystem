from typing import Any, Dict, Union
from app.crud.base import CRUDBase
from app.models.session import Session
from app.models.pairing import Match
from app.schemas.session import SessionCreate, SessionUpdate
from motor.core import AgnosticDatabase
from app.crud.user_preferences import user_preference as pref_crud


class CRUDSession(CRUDBase[Session, SessionCreate, SessionUpdate]):
    async def get_session_by_name(self, db: AgnosticDatabase, *, session_name: str) -> Session | None:
        return await self.engine.find_one(Session, Session.session_name == session_name)

    async def get_all_sessions(self, db: AgnosticDatabase) -> list[Session]:
        return await self.engine.find(Session)
    
    async def get_active_session(self, db: AgnosticDatabase) -> Session | None:
        return await self.engine.find_one(Session, Session.active == True)
    
    async def handle_active_session(self, db: AgnosticDatabase) -> None:
        """
        Helper function to handle active session state.
        Finds and deactivates any existing active session.
        """
        active_session = await self.get_active_session(db)
        if active_session:
            active_session.active = False
            await self.engine.save(active_session)
    
    async def create_session(self, db: AgnosticDatabase, *, session_in: SessionCreate) -> Session:
        # If the new session is to be active, handle existing active sessions
        if session_in.active:
            await self.handle_active_session(db)

        # Create and save the new session
        session = Session(**session_in.dict())
        return await self.engine.save(session)
    
    async def update_session(self, db: AgnosticDatabase, *, session_name, session_in: Union[SessionUpdate, Dict[str, Any]]) -> Session:
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")

        # If updating to active state, handle existing active sessions
        if isinstance(session_in, dict):
            is_active = session_in.get('active', False)
        else:
            is_active = session_in.active if hasattr(session_in, 'active') else False

        if is_active and not session.active:
            await self.handle_active_session(db)

        return await self.update(db, db_obj=session, obj_in=session_in)
    
    async def remove(self, db: AgnosticDatabase, *, session_name: str) -> Session:
        session = await self.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")
        await self.engine.delete(session)

session = CRUDSession(Session)
