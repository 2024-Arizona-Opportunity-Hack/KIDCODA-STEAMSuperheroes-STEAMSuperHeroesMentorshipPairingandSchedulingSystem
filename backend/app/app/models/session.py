from app.db.base_class import Base
from datetime import datetime
from app.model_types.enums import StatusEnum

class Session(Base):
    name: str # should be unique
    description: str
    start_time: datetime
    active: bool
    end_time: datetime
    location: str
    session_type: str
    method: str
    pairing_status: StatusEnum = StatusEnum.NOT_STARTED
    scheduling_status: StatusEnum = StatusEnum.NOT_STARTED
