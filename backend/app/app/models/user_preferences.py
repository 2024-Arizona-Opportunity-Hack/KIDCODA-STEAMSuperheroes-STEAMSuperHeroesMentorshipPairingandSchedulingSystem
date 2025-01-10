from pydantic import BaseModel, model_validator
from odmantic import Field
from app.db.base_class import Base
from typing import List, Optional, Dict
from geopy.geocoders import Nominatim
from app.model_types.enums import (
    Grade,
    Preference,
    Ethnicity,
    Gender,
    SessionType,
    Method,
    TimeSlot,
)

geolocator = Nominatim(user_agent="fastapi-geopy")

def default_availability():
    return {slot: False for slot in TimeSlot}


class mentorSessionType(BaseModel):
    type: SessionType
    willingToAdvise: Optional[int] = None
    currentMentees: Optional[int] = None

class menteeSessionType(BaseModel):
    type: SessionType
    is_match_found: bool

class Mentor(BaseModel):
    sessionType: List[mentorSessionType]
    steamBackground: str
    academicLevel: Grade
    professionalTitle: str
    currentEmployer: str
    reasonsForMentoring: Optional[str] = None

class Mentee(BaseModel):
    grade: Grade
    sessionType: List[menteeSessionType]
    reasonsForMentor: Optional[str] = None
    reasonsForMentorOther: Optional[str] = None
    interests: Optional[str] = None
    interestsOther: Optional[str] = None

class UserPreference(Base):
    email: str
    session_name: str
    name: str
    dateOfBirth: str
    age: int
    phoneNumber: str
    city: str
    state: str
    ethnicities: List[Ethnicity]
    ethnicityPreference: Preference
    gender: List[Gender]
    genderPreference: Preference
    methods: List[Method]
    role: str
    mentor: Optional[Mentor] = None
    mentee: Optional[Mentee] = None
    availability: Dict[TimeSlot, bool] = Field(default_factory=default_availability)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @model_validator(mode='before')
    def calculate_coordinates(cls, values):
        if values.get('latitude') is None or values.get('longitude') is None:
            city = values.get('city')
            state = values.get('state')
            if city and state:
                location = geolocator.geocode(f"{city}, {state}, USA")
            if location:
                values['latitude'] = location.latitude
                values['longitude'] = location.longitude
        return values
