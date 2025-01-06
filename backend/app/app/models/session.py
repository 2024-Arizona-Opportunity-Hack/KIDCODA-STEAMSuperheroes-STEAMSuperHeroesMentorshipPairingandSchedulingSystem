from app.db.base_class import Base

class Session(Base):
    name: str # name of the session, should be unique
    description: str
    start_time: str
    active: bool
    end_time: str
    location: str
    session_type: str
    method: str