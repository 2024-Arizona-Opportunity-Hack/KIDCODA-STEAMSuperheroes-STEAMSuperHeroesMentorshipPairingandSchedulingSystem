from pydantic import BaseModel
from model_types.enums import SessionType

class Match(BaseModel):
    mentor_email: str
    mentee_email: str
    session_type: SessionType
    session_name: str