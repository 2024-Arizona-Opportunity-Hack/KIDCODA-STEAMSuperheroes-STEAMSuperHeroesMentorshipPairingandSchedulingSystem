from typing import Dict, List, Optional
from datetime import date, datetime
from app.model_types.enums import AgeBracket, Ethnicity, Gender, Method, Preference, TimeSlot
from app.models.user_preferences import Mentee, Mentor
from pydantic import BaseModel, EmailStr, field_serializer

class UserPreferenceCreate(BaseModel):
    email: EmailStr
    name: str
    ageBracket: AgeBracket
    phoneNumber: str
    city: str
    state: str
    ethnicities: List[Ethnicity]
    ethnicityPreference: Preference
    gender: List[Gender]
    genderPreference: Preference
    dateOfBirth: date
    age: int
    methods: List[Method]
    role: str
    mentor: Mentor | None = None
    mentee: Mentee | None = None
    availability: List[TimeSlot]

    @field_serializer('dateOfBirth')
    def serialize_date(self, date_value: date) -> datetime:
        return datetime(date_value.year, date_value.month, date_value.day).isoformat()

class UserPreferenceUpdate(BaseModel):
    ageBracket: AgeBracket
    phoneNumber: str
    city: str
    state: str
    ethnicities: List[Ethnicity]
    ethnicityPreference: Preference
    gender: List[Gender]
    dateOfBirth: date
    age: int
    genderPreference: Preference
    methods: List[Method]
    role: str
    mentor: Mentor | None = None
    mentee: Mentee | None = None
    availability: List[TimeSlot]

    @field_serializer('dateOfBirth')
    def serialize_date(self, date_value: date) -> datetime:
        return datetime(date_value.year, date_value.month, date_value.day).isoformat()
