from app.db.base_class import Base
from datetime import datetime
from app.model_types.enums import StatusEnum

class Session(Base):
    session_name: str # should be unique
    description: str
    start_time: datetime  # Changed from date to datetime
    active: bool
    end_time: datetime    # Changed from date to datetime
    location: str
    session_type: str
    timezone: str
    meeting_duration: list[str]
    cadence: str
    pairing_status: StatusEnum = StatusEnum.NOT_STARTED
    scheduling_status: StatusEnum = StatusEnum.NOT_STARTED
