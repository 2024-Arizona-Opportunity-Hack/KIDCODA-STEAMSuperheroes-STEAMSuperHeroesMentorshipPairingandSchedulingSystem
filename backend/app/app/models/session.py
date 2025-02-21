from app.db.base_class import Base
from app.model_types.enums import StatusEnum

class Session(Base):
    name: str # name of the session, should be unique
    description: str
    start_time: str
    active: bool
    end_time: str
    location: str
    session_type: str
    method: str
    pairing_status: StatusEnum = StatusEnum.NOT_STARTED
    scheduling_status: StatusEnum = StatusEnum.NOT_STARTED