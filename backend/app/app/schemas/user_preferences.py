from typing import List
from app.model_types.enums import Ethnicity, Gender, Method, Preference, SessionType
from app.models.user_preferences import Mentee, Mentor
from pydantic import BaseModel

class UserPreferenceCreate(BaseModel):
    email: str
    name: str
    ageBracket: str
    phoneNumber: str
    city: str
    state: str
    ethnicities: List[Ethnicity]
    ethnicityPreference: Preference
    gender: Gender
    genderPreference: Preference
    sessionType: List[SessionType]
    methods: List[Method]
    role: str
    mentor: Mentor
    mentee: Mentee
    availability: str

class UserPreferenceUpdate(BaseModel):
    ageBracket: str
    phoneNumber: str
    city: str
    state: str
    ethnicities: List[Ethnicity]
    ethnicityPreference: Preference
    gender: Gender
    genderPreference: Preference
    sessionType: List[SessionType]
    methods: List[Method]
    role: str
    mentor: Mentor
    mentee: Mentee
    availability: str
