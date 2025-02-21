from typing import Dict, List
from app.model_types.enums import Ethnicity, Gender, Method, Preference, MentoringType
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
    gender: List[Gender]
    genderPreference: Preference
    dateOfBirth: str
    age: int
    methods: List[Method]
    role: str
    mentor: Mentor
    mentee: Mentee
    availability: List

class UserPreferenceUpdate(BaseModel):
    ageBracket: str
    phoneNumber: str
    city: str
    state: str
    ethnicities: List[Ethnicity]
    ethnicityPreference: Preference
    gender: List[Gender]
    dateOfBirth: str
    age: int
    genderPreference: Preference
    methods: List[Method]
    role: str
    mentor: Mentor
    mentee: Mentee
    availability: List
