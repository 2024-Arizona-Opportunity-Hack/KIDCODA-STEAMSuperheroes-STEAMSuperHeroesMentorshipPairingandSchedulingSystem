from pydantic import BaseModel
from app.db.base_class import Base

from app.model_types.enums import MentoringType


class Match(Base):
    mentor_email: str
    mentee_email: str
    mentoring_type: MentoringType
    session_name: str