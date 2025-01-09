from haversine import haversine, Unit
from model_types.enums import Preference, SessionType, Grade, Ethnicity, Gender, Method
from models.user_preferences import UserPreferences, Mentor, Mentee, mentorSessionType, menteeSessionType

# Configuration settings
MAX_DISTANCE = 60  # Maximum distance in miles for matching


def is_within_distance(mentor_location, mentee_location, max_distance=MAX_DISTANCE):
    return haversine(mentor_location, mentee_location, unit=Unit.MILES) <= max_distance

def is_age_appropriate(mentor, mentee, mentoring_type):
    if mentoring_type == SessionType.HOMEWORK_HELP:
        return mentor.mentor.academicLevel >= mentee.mentee.grade
    return mentor.age >= mentee.age + 10

def match_mentoring_type(mentor, mentee):
    return any(mentoring_type.type in [s.type for s in mentee.mentee.sessionType] for mentoring_type in mentor.mentor.sessionType)

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

def find_best_match(mentees, mentors):
    matches = []
    updated_mentees = []
    updated_mentors = []

    for mentee in mentees:
        mentee_location = (mentee.latitude, mentee.longitude)
        for mentee_session in mentee.mentee.sessionType:
            if mentee_session.is_match_found:
                continue
            for mentor in mentors:
                if mentee.email == mentor.email:
                    continue
                mentor_session = next((s for s in mentor.mentor.sessionType if s.type == mentee_session.type), None)
                if mentor_session is None or mentor_session.currentMentees >= mentor_session.willingToAdvise:
                    continue
                if not is_age_appropriate(mentor, mentee, mentee_session.type):
                    continue
                if not match_mentoring_type(mentor, mentee):
                    continue
                if not match_ethnicity(mentor, mentee):
                    continue
                if not match_gender(mentor, mentee):
                    continue
                mentor_location = (mentor.latitude, mentor.longitude)
                if not is_within_distance(mentor_location, mentee_location):
                    continue

                # Create match object
                match = {
                    "mentor_email": mentor.email,
                    "mentee_email": mentee.email,
                    "session_type": mentee_session.type
                }

                # Update mentee session type
                for session in mentee.mentee.sessionType:
                    if session.type == mentee_session.type:
                        session.is_match_found = True
                        break

                # Update mentor current mentees
                for session in mentor.mentor.sessionType:
                    if session.type == mentee_session.type:
                        session.currentMentees += 1
                        break

                updated_mentees.append(mentee)
                updated_mentors.append(mentor)
                matches.append(match)
                break

    return matches, updated_mentees, updated_mentors

# Test data
mentors = [
    UserPreferences(
        email="mentor1@example.com",
        session_name="Session 1",
        name="Mentor One",
        dateOfBirth="1980-01-01",
        age=40,
        phoneNumber="1234567890",
        city="New York",
        state="NY",
        ethnicities=[Ethnicity.ASIAN],
        ethnicityPreference=Preference.NO_PREFERENCE,
        gender=[Gender.CIS_MALE],
        genderPreference=Preference.NO_PREFERENCE,
        methods=[Method.WEB_CONFERENCE],
        role="mentor",
        mentor=Mentor(
            sessionType=[mentorSessionType(type=SessionType.HOMEWORK_HELP, willingToAdvise=2, currentMentees=0)],
            steamBackground="Engineering",
            academicLevel=Grade.COLLEGE_SENIOR,
            professionalTitle="Engineer",
            currentEmployer="Tech Corp"
        ),
        availability="Monday-7am to 9am"
    ),
    UserPreferences(
        email="mentor2@example.com",
        session_name="Session 2",
        name="Mentor Two",
        dateOfBirth="1985-01-01",
        age=35,
        phoneNumber="1234567890",
        city="Los Angeles",
        state="CA",
        ethnicities=[Ethnicity.WHITE_EUROPEAN],
        ethnicityPreference=Preference.NO_PREFERENCE,
        gender=[Gender.CIS_FEMALE],
        genderPreference=Preference.NO_PREFERENCE,
        methods=[Method.WEB_CONFERENCE],
        role="mentor",
        mentor=Mentor(
            sessionType=[mentorSessionType(type=SessionType.CAREER_GUIDANCE, willingToAdvise=1, currentMentees=0)],
            steamBackground="Science",
            academicLevel=Grade.GRADUATE_STUDENT,
            professionalTitle="Scientist",
            currentEmployer="Bio Corp"
        ),
        availability="Tuesday-9am to 11am"
    )
]

mentees = [
    UserPreferences(
        email="mentee1@example.com",
        session_name="Session 1",
        name="Mentee One",
        dateOfBirth="2005-01-01",
        age=16,
        phoneNumber="1234567890",
        city="New York",
        state="NY",
        ethnicities=[Ethnicity.ASIAN],
        ethnicityPreference=Preference.NO_PREFERENCE,
        gender=[Gender.CIS_MALE],
        genderPreference=Preference.NO_PREFERENCE,
        methods=[Method.WEB_CONFERENCE],
        role="mentee",
        mentee=Mentee(
            grade=Grade.GRADE_10,
            sessionType=[menteeSessionType(type=SessionType.HOMEWORK_HELP, is_match_found=False)],
            reasonsForMentor="Career Exploration"
        ),
        availability="Monday-7am to 9am"
    ),
    UserPreferences(
        email="mentee2@example.com",
        session_name="Session 2",
        name="Mentee Two",
        dateOfBirth="2004-01-01",
        age=17,
        phoneNumber="1234567890",
        city="Los Angeles",
        state="CA",
        ethnicities=[Ethnicity.WHITE_EUROPEAN],
        ethnicityPreference=Preference.NO_PREFERENCE,
        gender=[Gender.CIS_FEMALE],
        genderPreference=Preference.NO_PREFERENCE,
        methods=[Method.WEB_CONFERENCE],
        role="mentee",
        mentee=Mentee(
            grade=Grade.GRADE_11,
            sessionType=[menteeSessionType(type=SessionType.CAREER_GUIDANCE, is_match_found=False)],
            reasonsForMentor="College Guidance"
        ),
        availability="Tuesday-9am to 11am"
    )
]

# Run the test
matches, updated_mentees, updated_mentors = find_best_match(mentees, mentors)

# Print the results
print("Matches:")
for match in matches:
    print(match)

print("\nUpdated Mentees:")
for mentee in updated_mentees:
    print(mentee)

print("\nUpdated Mentors:")
for mentor in updated_mentors:
    print(mentor)