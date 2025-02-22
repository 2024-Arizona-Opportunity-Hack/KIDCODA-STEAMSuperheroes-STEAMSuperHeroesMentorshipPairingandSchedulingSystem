from app.model_types.enums import Ethnicity, Gender, Method, Preference, MentoringType, AgeBracket, TimeSlot, GRADE_VALUES
from haversine import haversine, Unit
from app.models.pairing import Match
from faker import Faker
import json

fake = Faker()

# Configuration settings
MAX_DISTANCE = 60  # Maximum distance in miles for matching


def is_within_distance(mentor_location, mentee_location, max_distance=MAX_DISTANCE):
    return haversine(mentor_location, mentee_location, unit=Unit.MILES) <= max_distance

def is_age_appropriate(mentor, mentee, mentoring_type):
    if mentor.mentor.academicLevel and mentee.mentee.grade:
        if mentoring_type == MentoringType.HOMEWORK_HELP:
            return mentor.mentor.academicLevel >= mentee.mentee.grade
        elif mentoring_type in [MentoringType.CAREER_GUIDANCE, MentoringType.COLLEGE_GUIDANCE]:
            return is_age_bracket_appropriate(mentor.ageBracket, mentee.ageBracket)
        return True
    else:
        return False
def is_age_bracket_appropriate(mentor_age_bracket, mentee_age_bracket):
    age_brackets = [
        AgeBracket.AGE_9_13,
        AgeBracket.AGE_13_18,
        AgeBracket.AGE_18_22,
        AgeBracket.AGE_22_30,
        AgeBracket.AGE_30_40,
        AgeBracket.AGE_40_50,
        AgeBracket.AGE_50_60,
        AgeBracket.AGE_60_PLUS
    ]
    mentee_index = age_brackets.index(mentee_age_bracket)
    return age_brackets.index(mentor_age_bracket) >= mentee_index + 2

def match_ethnicity(mentor, mentee):
    if mentor.ethnicityPreference == Preference.PREFER_ONLY or mentee.ethnicityPreference == Preference.PREFER_ONLY:
        return any(eth in mentee.ethnicities for eth in mentor.ethnicities)
    
    if mentee.ethnicityPreference == Preference.PREFER_NOT or mentor.ethnicityPreference == Preference.PREFER_NOT:
        return all(eth not in mentee.ethnicities for eth in mentor.ethnicities)

    return True

def match_gender(mentor, mentee):
    if mentor.genderPreference == Preference.PREFER_ONLY or mentee.genderPreference == Preference.PREFER_ONLY:
        return any(gender in mentee.gender for gender in mentor.gender)
    
    if mentee.genderPreference == Preference.PREFER_NOT or mentor.genderPreference == Preference.PREFER_NOT:
        return all(gender not in mentee.gender for gender in mentor.gender)
    return True

def calculate_priority(mentor, mentee):
    priority = 0
    if match_ethnicity(mentor, mentee):
        priority += 1
    if match_gender(mentor, mentee):
        priority += 1
    return priority



def find_best_match(users):
    matches = []
    updated_mentees = []
    updated_mentors = []

    for mentee in users:
        # mentee_location = (mentee.latitude, mentee.longitude)
        if mentee.mentee is None:
            continue
        for mentee_session in mentee.mentee.mentoringType:
            if mentee_session.is_match_found:
                continue
            potential_mentors = []
            for mentor in users:
                if mentor.mentor is None:
                    continue
                if mentee.email == mentor.email:
                    continue
                mentor_session = next((s for s in mentor.mentor.mentoringType if s == mentee_session.type), None)
                if mentor_session is None or mentor.mentor.currentMentees >= mentor.mentor.willingToAdvise:
                    continue
                if not is_age_appropriate(mentor, mentee, mentee_session.type):
                    continue

                # if Method.IN_PERSON in mentee.methods or Method.HYBRID in mentee.methods:
                #     mentor_location = (mentor.latitude, mentor.longitude)
                #     if not is_within_distance(mentor_location, mentee_location):
                #         continue
                potential_mentors.append(mentor)

            best_match = None
            highest_priority = -1
            for mentor in potential_mentors:
                priority = calculate_priority(mentor, mentee)
                if priority > highest_priority:
                    highest_priority = priority
                    best_match = mentor    
            
            if best_match:
                # Create match object using the Match model
                match = Match(
                    mentor_email=best_match.email,
                    mentee_email=mentee.email,
                    mentoring_type=mentee_session.type,
                    session_name=mentee.session_name,
                    is_active=True,
                    mentor_availability=best_match.availability,
                    mentee_availability=mentee.availability
                )
                print("best match found: ", match)

                matches.append(match)
                mentee_session.is_match_found = True
                best_match.mentor.currentMentees += 1
                updated_mentees.append(mentee)
                updated_mentors.append(best_match)
                matches.append(match)
                break         

    return matches, updated_mentees, updated_mentors



def generate_random_user():
    email = fake.email()
    session_name = "test session"
    name = fake.name()
    age_bracket = fake.random_element(elements=AgeBracket)
    phone_number = fake.phone_number()
    city = fake.city()
    state = fake.state()
    ethnicities = [fake.random_element(elements=Ethnicity)]
    ethnicity_preference = fake.random_element(elements=Preference)
    gender = [fake.random_element(elements=Gender)]
    menteeGrade = fake.random_element(elements=GRADE_VALUES)
    gender_preference = fake.random_element(elements=Preference)
    mentoring_type = [fake.random_element(elements=[mtype.value for mtype in MentoringType]) for _ in range(3)]
    menteeMentoringType1 = {
        "type": fake.random_element(elements=[mtype.value for mtype in MentoringType]),
        "is_match_found": False
    }
    menteeMentoringType2 = {
        "type": fake.random_element(elements=[mtype.value for mtype in MentoringType]),
        "is_match_found": False
    }
    menteeMentoringType3 = {
        "type": fake.random_element(elements=[mtype.value for mtype in MentoringType]),
        "is_match_found": False
    }
    menteeMentoringTypes = [menteeMentoringType1, menteeMentoringType2, menteeMentoringType3]
    date_of_birth = fake.date_of_birth().strftime("%Y-%m-%d")
    age = fake.random_int(min=18, max=60)
    methods = [fake.random_element(elements=Method)]
    role = fake.random_element(elements=["mentor", "mentee"])
    availability = [fake.random_element(elements=TimeSlot).value for _ in range(5)]
    macadmiclevel = fake.random_element(elements=GRADE_VALUES)
    
    
    if role == "mentor":
        mentor = {
            "mentoringType": mentoring_type,
            "steamBackground": fake.job(),
            "academicLevel": macadmiclevel,
            "professionalTitle": fake.job(),
            "currentEmployer": fake.company(),
            "reasonsForMentoring": fake.sentence(),
            "currentMentees": 0,
            "willingToAdvise": fake.random_int(min=1, max=5) 
        }
        mentee = None
    else:
        mentor = None
        mentee = {
            "grade": menteeGrade,
            "mentoringType": menteeMentoringTypes,
            "reasonsForMentor": fake.sentence(),
            "reasonsForMentorOther": fake.sentence(),
            "interests": fake.sentence(),
            "interestsOther": fake.sentence()
        }

    user_preference = {
        "email": email,
        "session_name": session_name,
        "name": name,
        "ageBracket": age_bracket.value,
        "phoneNumber": phone_number,
        "city": city,
        "state": state,
        "ethnicities": [ethnicity.value for ethnicity in ethnicities],
        "ethnicityPreference": ethnicity_preference.value,
        "gender": [g.value for g in gender],
        "genderPreference": gender_preference.value,
        "dateOfBirth": date_of_birth,
        "age": age,
        "methods": [method.value for method in methods],
        "role": role,
        "mentor": mentor if mentor else None,
        "mentee": mentee if mentee else None,
        "availability": availability
    }
    return user_preference

def add_random_users(count=2):
    users = [generate_random_user() for _ in range(count)]
    # print(json.dumps(users))
    return users

if __name__ == "__main__":
    add_random_users()
