from pydantic import BaseModel, field_serializer
from datetime import date, datetime
from app.model_types.enums import StatusEnum

class SessionCreate(BaseModel):
    session_name: str # should be unique
    description: str
    start_time: date
    active: bool
    end_time: date
    location: str
    session_type: str
    pairing_status: StatusEnum = StatusEnum.NOT_STARTED
    scheduling_status: StatusEnum = StatusEnum.NOT_STARTED
    
    
    @field_serializer('start_time', 'end_time')
    def serialize_date(self, date_value: date) -> datetime:
        return datetime(date_value.year, date_value.month, date_value.day)

class SessionUpdate(BaseModel):
    session_name: str # should be unique
    description: str
    start_time: date
    active: bool
    end_time: date
    location: str
    session_type: str
    pairing_status: StatusEnum = StatusEnum.NOT_STARTED
    scheduling_status: StatusEnum = StatusEnum.NOT_STARTED
    
    
    @field_serializer('start_time', 'end_time')
    def serialize_date(self, date_value: date) -> datetime:
        return datetime(date_value.year, date_value.month, date_value.day)