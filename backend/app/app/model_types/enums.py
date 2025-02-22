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

GRADE_VALUES = [
    "5th grade",
    "6th grade",
    "7th grade",
    "8th grade",
    "9th grade",
    "10th grade",
    "11th grade",
    "12th grade",
    "College Freshman",
    "College Sophomore",
    "College Junior",
    "College Senior",
    "Graduate Student",
    "High School Freshman",
    "High School Sophomore",
    "High School Junior",
    "High School Senior",
    "College Undergraduate",
    "Graduate School",
    "Graduated / Working Professional"
]

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

class TimeSlot(str, Enum):
    MONDAY_7_9_A = "Monday-7am to 9am"
    MONDAY_9_11_A = "Monday-9am to 11am"
    MONDAY_11_1_A = "Monday-11am to 1pm"
    MONDAY_1_3_P = "Monday-1pm to 3pm"
    MONDAY_3_5_P = "Monday-3pm to 5pm"
    MONDAY_5_7_P = "Monday-5pm to 7pm"
    MONDAY_7_9_P = "Monday-7pm to 9pm"
    TUESDAY_7_9_A = "Tuesday-7am to 9am"
    TUESDAY_9_11_A = "Tuesday-9am to 11am"
    TUESDAY_11_1_A = "Tuesday-11am to 1pm"
    TUESDAY_1_3_P = "Tuesday-1pm to 3pm"
    TUESDAY_3_5_P = "Tuesday-3pm to 5pm"
    TUESDAY_5_7_P = "Tuesday-5pm to 7pm"
    TUESDAY_7_9_P = "Tuesday-7pm to 9pm"
    WEDNESDAY_7_9_A = "Wednesday-7am to 9am"
    WEDNESDAY_9_11_A = "Wednesday-9am to 11am"
    WEDNESDAY_11_1_A = "Wednesday-11am to 1pm"
    WEDNESDAY_1_3_P = "Wednesday-1pm to 3pm"
    WEDNESDAY_3_5_P = "Wednesday-3pm to 5pm"
    WEDNESDAY_5_7_P = "Wednesday-5pm to 7pm"
    WEDNESDAY_7_9_P = "Wednesday-7pm to 9pm"
    THURSDAY_7_9_A = "Thursday-7am to 9am"
    THURSDAY_9_11_A = "Thursday-9am to 11am"
    THURSDAY_11_1_A = "Thursday-11am to 1pm"
    THURSDAY_1_3_P = "Thursday-1pm to 3pm"
    THURSDAY_3_5_P = "Thursday-3pm to 5pm"
    THURSDAY_5_7_P = "Thursday-5pm to 7pm"
    THURSDAY_7_9_P = "Thursday-7pm to 9pm"
    FRIDAY_7_9_A = "Friday-7am to 9am"
    FRIDAY_9_11_A = "Friday-9am to 11am"
    FRIDAY_11_1_A = "Friday-11am to 1pm"
    FRIDAY_1_3_P = "Friday-1pm to 3pm"
    FRIDAY_3_5_P = "Friday-3pm to 5pm"
    FRIDAY_5_7_P = "Friday-5pm to 7pm"
    FRIDAY_7_9_P = "Friday-7pm to 9pm"
    SATURDAY_7_9_A = "Saturday-7am to 9am"
    SATURDAY_9_11_A = "Saturday-9am to 11am"
    SATURDAY_11_1_A = "Saturday-11am to 1pm"
    SATURDAY_1_3_P = "Saturday-1pm to 3pm"
    SATURDAY_3_5_P = "Saturday-3pm to 5pm"
    SATURDAY_5_7_P = "Saturday-5pm to 7pm"
    SATURDAY_7_9_P = "Saturday-7pm to 9pm"
    SUNDAY_7_9_A = "Sunday-7am to 9am"
    SUNDAY_9_11_A = "Sunday-9am to 11am"
    SUNDAY_11_1_A = "Sunday-11am to 1pm"
    SUNDAY_1_3_P = "Sunday-1pm to 3pm"
    SUNDAY_3_5_P = "Sunday-3pm to 5pm"
    SUNDAY_5_7_P = "Sunday-5pm to 7pm"
    SUNDAY_7_9_P = "Sunday-7pm to 9pm"

class AgeBracket(str, Enum):
    AGE_9_13 = "9-13"
    AGE_13_18 = "13-18"
    AGE_18_22 = "18-22"
    AGE_22_30 = "22-30"
    AGE_30_40 = "30-40"
    AGE_40_50 = "40-50"
    AGE_50_60 = "50-60"
    AGE_60_PLUS = "60+"