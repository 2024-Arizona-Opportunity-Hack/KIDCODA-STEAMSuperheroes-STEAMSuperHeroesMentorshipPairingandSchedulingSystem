from enum import Enum

class StatusEnum(str, Enum):
    NOT_STARTED = "not started"
    IN_PROGRESS = "in progress"
    COMPLETED = "completed"


class Grade(str, Enum):
    GRADE_5 = "5th grade"
    GRADE_6 = "6th grade"
    GRADE_7 = "7th grade"
    GRADE_8 = "8th grade"
    GRADE_9 = "9th grade"
    GRADE_10 = "10th grade"
    GRADE_11 = "11th grade"
    GRADE_12 = "12th grade"
    COLLEGE_FRESHMAN = "College Freshman"
    COLLEGE_SOPHOMORE = "College Sophomore"
    COLLEGE_JUNIOR = "College Junior"
    COLLEGE_SENIOR = "College Senior"
    GRADUATE_STUDENT = "Graduate Student"
    HIGH_SCHOOL_FRESHMAN = "High School Freshman"
    HIGH_SCHOOL_SOPHOMORE = "High School Sophomore"
    HIGH_SCHOOL_JUNIOR = "High School Junior"
    HIGH_SCHOOL_SENIOR = "High School Senior"
    COLLEGE_UNDERGRADUATE = "College Undergraduate"
    GRADUATE_SCHOOL = "Graduate School"
    WORKING_PROFESSIONAL = "Graduated / Working Professional"

class Ethnicity(str, Enum):
    SOUTH_ASIAN = "South Asian: Includes Indian, Pakistan, Sri Lankan, Bangaladesh"
    BLACK_AFRICAN_AMERICAN = "Black or African American: Includes Jamaican, Nigerian, Haitian, and Ethiopian"
    WHITE_EUROPEAN = "White or European: Includes German, Irish, English, Italian, Polish, and French"
    HISPANIC_LATINO = "Hispanic or Latino: Includes Puerto Rican, Mexican, Cuban, Salvadoran, and Colombian"
    MIDDLE_EASTERN_NORTH_AFRICAN = "Middle Eastern or North African: Includes Lebanese, Iranian, Egyptian, Moroccan, Israeli, and Palestinian"
    NATIVE_HAWAIIAN_PACIFIC_ISLANDER = "Native Hawaiian or Pacific Islander: Includes Samoan, Buamanian, Chamorro, and Tongan"
    AMERICAN_INDIAN_ALASKA_NATIVE = "American Indian or Alaska Native"
    ASIAN = "Asian: Includes Chinese, Japanese, Filipino, Korean, South Asian, and Vietnamese"

class Preference(str, Enum):
    PREFER_ONLY = "Prefer ONLY to be matched within that similarity"
    PREFER_IT = "Prefer it, but available to others as needed"
    PREFER_NOT = "Prefer NOT to be matched within that similarity"
    NO_PREFERENCE = "Do not have a preference. Either is fine."
    OTHER = "Other:"

class Gender(str, Enum):
    CIS_MALE = "Cisgender Male"
    CIS_FEMALE = "Cisgender Female"
    TRANS_MALE = "Transgender Male"
    TRANS_FEMALE = "Transgender Female"
    PREFER_NOT_DISCLOSE = "Prefer not to disclose"
    OTHERS = "Others"

class MentoringType(str, Enum):
    HOMEWORK_HELP = "Homework Help"
    EXPOSURE_STEAM = "Exposure to STEAM in general"
    COLLEGE_GUIDANCE = "College guidance"
    CAREER_GUIDANCE = "Career guidance"
    EXPLORE_FIELD = "Explore a particular field"

class Method(str, Enum):
    WEB_CONFERENCE = "Web conference (ie. Zoom video conference)"
    IN_PERSON = "In person"
    HYBRID = "Hybrid (both web and in person)"
    OTHER = "Other:"