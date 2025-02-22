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
            # TODO: Move this to a single transaction
            await crud_session.update_session(db, session_name=session.name, session_in={"pairing_status": StatusEnum.IN_PROGRESS})
            try:
                users = await self.engine.find(UserPreference, UserPreference.session_name == session.name)
                matches, updated_mentees, updated_mentors = find_best_match(list(users))
                for mentee in updated_mentees:
                    await self.engine.save(mentee)

                for mentor in updated_mentors:
                    await self.engine.save(mentor)

                for match in matches:
                    await self.engine.save(match)

            except Exception as e:
                print(str(e))
                await crud_session.update_session(db, session_name=session.name, session_in={"pairing_status": StatusEnum.NOT_STARTED})
                raise ValueError("Pairing failed")
            await crud_session.update_session(db, session_name=session.name, session_in={"pairing_status": StatusEnum.COMPLETED})

        return {"status": session.pairing_status}
    
    async def get_multi_by_session_name(self, db: AgnosticDatabase, session_name: str) -> list[Match]:
        return await self.engine.find(Match, Match.session_name == session_name)
    
    async def get_multi(self, db: AgnosticDatabase) -> list[Match]:
        return await self.engine.find(Match)
    
    async def get_match(self, db: AgnosticDatabase, session_name: str, mentor_email: str, mentee_email: str) -> Match | None:
        return await self.engine.find_one(Match, Match.session_name == session_name, Match.mentor_email == mentor_email, Match.mentee_email == mentee_email)

pairing = CRUDPairing(Match)
