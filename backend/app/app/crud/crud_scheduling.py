from app.crud.base import CRUDBase
from app.crud.crud_session import session as crud_session
from app.utilities.scheduler import schedule_meetings as utils_schedule_meetings
from motor.core import AgnosticDatabase
from app.models.pairing import Match
from app.model_types.enums import StatusEnum
from app.schemas.pairing import MatchCreate, MatchUpdate


class CRUDScheduling(CRUDBase[Match, MatchCreate, MatchUpdate]):
    async def schedule_meetings(self, db: AgnosticDatabase, session_name: str) -> dict:
        session = await crud_session.get_session_by_name(db, session_name=session_name)
        if not session:
            raise ValueError("Session not found")
        if session.scheduling_status == StatusEnum.NOT_STARTED:
            await crud_session.update_session(db, session_name=session_name, session_in={"scheduling_status": StatusEnum.IN_PROGRESS})
            try:
                matches = await self.engine.find(Match, Match.session_name == session_name)
                if not matches:
                    raise ValueError("No matches found for this session")
                
                scheduled_matches = utils_schedule_meetings(list(matches))

                for match in scheduled_matches:
                    await self.engine.save(match)

            except Exception as e:
                print(str(e))
                await crud_session.update_session(db, session_name=session_name, session_in={"scheduling_status": StatusEnum.NOT_STARTED})
                raise ValueError("Scheduling failed")

            await crud_session.update_session(db, session_name=session_name, session_in={"scheduling_status": StatusEnum.COMPLETED})
            return {"status": "Scheduling completed"}
        else:
            return {"status": session.pairing_status}
        
    async def get_multi_by_session_name(self, db: AgnosticDatabase, session_name: str) -> list[Match]:
        return await self.engine.find(Match, Match.session_name == session_name)

scheduling = CRUDScheduling(Match)
