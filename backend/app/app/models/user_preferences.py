from pydantic import BaseModel, EmailStr, model_validator
from odmantic import Field, Model
from typing import List, Optional, Dict
from geopy.geocoders import Nominatim
from app.model_types.enums import Grade, Preference, Ethnicity, Gender, MentoringType, Method, TimeSlot, AgeBracket
from app.db.base_class import Base

geolocator = Nominatim(user_agent="fastapi-geopy")

def parse_availability_string(availability_str: str) -> List[TimeSlot]:
    slots = availability_str.split("; ")
    availability = [TimeSlot(slot.strip()) for slot in slots if slot.strip() in TimeSlot.__members__]
    return availability

class menteeMentoringType(BaseModel):
    type: MentoringType
    is_match_found: bool

class Mentor(BaseModel):
    mentoringType: List[MentoringType]
    willingToAdvise: int = 0
    currentMentees: int = 0
    steamBackground: str
    academicLevel: Grade
    professionalTitle: str
    currentEmployer: str
    reasonsForMentoring: Optional[str] = None

class Mentee(BaseModel):
    grade: Grade
    mentoringType: List[menteeMentoringType]
    reasonsForMentor: Optional[str] = None
    reasonsForMentorOther: Optional[str] = None
    interests: Optional[str] = None
    interestsOther: Optional[str] = None

class UserPreference(Model):
    email: EmailStr
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
    availability: List[TimeSlot]
    availability_str: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ageBracket: AgeBracket


    # @model_validator(mode='before')
    # def calculate_coordinates(cls, values):
    #     if values.get('latitude') is None or values.get('longitude') is None:
    #         city = values.get('city')
    #         state = values.get('state')
    #         if city and state:
    #             location = geolocator.geocode(f"{city}, {state}, USA")
    #             if location:
    #                 values['latitude'] = location.latitude
    #                 values['longitude'] = location.longitude
    #     return values

    @model_validator(mode='before')
    def populate_availability(cls, values):
        availability_str = values.get('availability_str')
        if availability_str:
            values['availability'] = parse_availability_string(availability_str)
        return values
