import asyncio
from app.crud.base import CRUDBase
from app.models.pairing import Match
from app.model_types.enums import StatusEnum
from app.utilities.best_match import find_best_match
from app.models.user_preferences import UserPreference
from app.schemas.pairing import MatchCreate, MatchUpdate
from app.crud.crud_session import session as crud_session
from motor.core import AgnosticDatabase


class CRUDPairing(CRUDBase[Match, MatchCreate, MatchUpdate]):
    async def make_pairs(self, db: AgnosticDatabase):
        session = await crud_session.get_active_session(db)
        if not session:
            raise ValueError("Session not found")
        if session.pairing_status == StatusEnum.NOT_STARTED:
            async with await db.client.start_session() as db_session:
                async with db_session.start_transaction():
                        try:
                            await crud_session.update_session(db, session_name=session.session_name, session_in={"pairing_status": StatusEnum.IN_PROGRESS})
                            users = await self.engine.find(UserPreference, UserPreference.session_name == session.session_name)
                            matches, updated_mentees, updated_mentors = find_best_match(list(users))
                            # save_operations = []
                            for mentee in updated_mentees:
                                await self.engine.save(mentee)
                            for mentor in updated_mentors:
                                await self.engine.save(mentor)
                            for match in matches:
                                await self.engine.save(match)
                            await crud_session.update_session(db, session_name=session.name, session_in={"pairing_status": StatusEnum.COMPLETED})
                        except Exception as e:
                            print(f"Error during pairing: {str(e)}")
                            raise ValueError("Pairing failed")
        return {"status": session.pairing_status}

    async def get_multi_by_session_name(self, db: AgnosticDatabase, session_name: str) -> list[Match]:
        return await self.engine.find(Match, Match.session_name == session_name)
    
    async def get_multi(self, db: AgnosticDatabase) -> list[Match]:
        return await self.engine.find(Match)
    
    async def get_match(self, db: AgnosticDatabase, session_name: str, mentor_email: str, mentee_email: str) -> Match | None:
        return await self.engine.find_one(Match, Match.session_name == session_name, Match.mentor_email == mentor_email, Match.mentee_email == mentee_email)

pairing = CRUDPairing(Match)
