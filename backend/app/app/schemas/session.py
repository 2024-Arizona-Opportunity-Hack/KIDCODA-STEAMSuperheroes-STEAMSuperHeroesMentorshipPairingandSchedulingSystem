from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.model_types.enums import MeetingCadence, SessionType, Timezone

class SessionBase(BaseModel):
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

class SessionCreate(SessionBase):
    session_name: str

class SessionUpdate(BaseModel):
    description: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[Timezone] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    active: Optional[bool] = None
    session_type: Optional[SessionType] = None
    number_of_meetings: Optional[int] = None
    meeting_duration: Optional[List[str]] = None
    cadence: Optional[MeetingCadence] = None
