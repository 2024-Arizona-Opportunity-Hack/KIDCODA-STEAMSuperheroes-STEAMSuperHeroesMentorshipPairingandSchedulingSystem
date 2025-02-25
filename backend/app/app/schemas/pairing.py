from app.model_types.enums import MentoringType, TimeSlot
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class MatchBase(BaseModel):
    mentor_email: EmailStr
    mentee_email: EmailStr
    session_name: str
    mentoring_type: MentoringType
    is_active: bool
    meeting_timeslot: Optional[TimeSlot] = None
    mentor_availability: List[TimeSlot]
    mentee_availability: List[TimeSlot]

class MatchCreate(MatchBase):
    pass

class MatchUpdate(MatchBase):
    pass
