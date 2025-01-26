from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import List, Optional, Dict
from geopy.geocoders import Nominatim
from model_types.enums import Grade, Preference, Ethnicity, Gender, MentoringType, Method, TimeSlot, AgeBracket

geolocator = Nominatim(user_agent="fastapi-geopy")

def default_availability():
    return {slot: False for slot in TimeSlot}

def parse_availability_string(availability_str: str) -> Dict[TimeSlot, bool]:
    availability = default_availability()
    slots = availability_str.split("; ")
    for slot in slots:
        slot = slot.strip()
        for time_slot in TimeSlot:
            if time_slot.value == slot:
                availability[time_slot] = True
                break
    return availability

class menteeMentoringType(BaseModel):
    type: MentoringType
    is_match_found: bool

class Mentor(BaseModel):
    mentoringType: List[MentoringType]
    willingToAdvise: Optional[int] = None
    currentMentees: Optional[int] = None
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

class UserPreferences(BaseModel):
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
    availability: Dict[TimeSlot, bool] = Field(default_factory=default_availability)
    availability_str: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ageBracket: AgeBracket

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

    @model_validator(mode='before')
    def populate_availability(cls, values):
        availability_str = values.get('availability_str')
        if availability_str:
            values['availability'] = parse_availability_string(availability_str)
        return values
