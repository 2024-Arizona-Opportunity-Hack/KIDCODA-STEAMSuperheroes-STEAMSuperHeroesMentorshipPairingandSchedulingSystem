from pydantic import BaseModel
from app.db.base_class import Base
from app.model_types.enums import TimeSlot
from typing import List, Optional
from pydantic import EmailStr

from app.model_types.enums import MentoringType


class Match(Base):
    mentor_email: EmailStr
    mentee_email: EmailStr
    mentoring_type: MentoringType
    session_name: str
    is_active: bool
    meeting_timeslot: Optional[TimeSlot] = None
    mentor_availability: List[TimeSlot]
    mentee_availability: List[TimeSlot]
