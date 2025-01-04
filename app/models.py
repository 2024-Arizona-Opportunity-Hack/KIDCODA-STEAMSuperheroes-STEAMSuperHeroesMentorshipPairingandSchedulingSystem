from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .enums import Grade, Ethnicity, Preference, Gender, SessionType, Method

class Mentor(BaseModel):
    steamBackground: str
    academicLevel: Grade
    professionalTitle: str
    currentEmployer: str
    reasonsForMentoring: Optional[str] = None
    willingToAdvise: Optional[int] = None

class Mentee(BaseModel):
    grade: Grade
    reasonsForMentor: Optional[str] = None
    reasonsForMentorOther: Optional[str] = None
    interests: Optional[str] = None
    interestsOther: Optional[str] = None

class UserData(BaseModel):
    email: EmailStr
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