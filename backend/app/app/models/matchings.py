from pydantic import BaseModel
from model_types.enums import MentoringType

class Match(BaseModel):
    mentor_email: str
    mentee_email: str
    session_type: MentoringType
    session_name: str