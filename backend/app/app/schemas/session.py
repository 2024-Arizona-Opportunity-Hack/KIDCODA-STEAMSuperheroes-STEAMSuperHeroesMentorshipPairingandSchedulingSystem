from pydantic import BaseModel
from datetime import datetime
from app.model_types.enums import StatusEnum

class SessionCreate(BaseModel):
    name: str
    description: str
    start_time: datetime
    active: bool
    end_time: datetime
    location: str
    session_type: str
    method: str

class SessionUpdate(BaseModel):
    active: bool
    end_time: datetime
    location: str
    session_type: str
    method: str
    pairing_status: StatusEnum
    scheduling_status: StatusEnum
