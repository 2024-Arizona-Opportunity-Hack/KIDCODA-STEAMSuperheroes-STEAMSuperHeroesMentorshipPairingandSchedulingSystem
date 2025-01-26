from datetime import datetime
from typing import List
from app.db.base_class import Base
from app.model_types.enums import SessionType, MeetingCadence, Timezone

class Session(Base):
    session_name: str # name of the session, should be unique
    description: str
    location: str
    timezone: Timezone
    start_date: datetime
    end_date: datetime
    active: bool
    session_type: SessionType
    number_of_meetings: int
    meeting_duration: List[str]
    cadence: MeetingCadence
