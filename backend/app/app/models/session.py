from pydantic import BaseModel, Field
from model_types.types import PyObjectId

class Session(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: str
    start_time: str
    end_time: str
    location: str
    session_type: str
    method: str