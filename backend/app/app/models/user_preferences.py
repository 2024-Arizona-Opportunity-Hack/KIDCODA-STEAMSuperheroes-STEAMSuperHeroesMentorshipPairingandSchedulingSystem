from pydantic import BaseModel, EmailStr, model_validator
from odmantic import Field, Model
from datetime import datetime
from typing import List, Optional, Dict
from geopy.geocoders import Nominatim
from app.model_types.enums import Grade, Preference, Ethnicity, Gender, MentoringType, Method, TimeSlot, AgeBracket
from app.db.base_class import Base

geolocator = Nominatim(user_agent="fastapi-geopy")

 

class menteeMentoringType(BaseModel):
    type: MentoringType
    is_match_found: bool = False

class Mentor(BaseModel):
    mentoringType: List[MentoringType]
    willingToAdvise: int = 1
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
    dateOfBirth: datetime
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

     