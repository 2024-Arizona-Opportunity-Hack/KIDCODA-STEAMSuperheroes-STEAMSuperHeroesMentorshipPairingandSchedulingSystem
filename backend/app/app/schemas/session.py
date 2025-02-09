from pydantic import BaseModel
from app.model_types.enums import StatusEnum

class SessionCreate(BaseModel):
    name: str
    description: str
    start_time: str
    active: bool
    end_time: str
    location: str
    session_type: str
    method: str

class SessionUpdate(BaseModel):
    active: bool
    end_time: str
    location: str
    session_type: str
    method: str
    pairing_status: StatusEnum
    scheduling_status: StatusEnum
