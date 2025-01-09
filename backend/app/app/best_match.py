from haversine import haversine, Unit
from model_types.enums import Preference, SessionType
from pymongo import MongoClient
from models.matchings import Match
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



# Database connection
client = MongoClient('mongodb://localhost:27017/')
db = client['mentorship']
collection = db['users']

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

                # Create match object using the Match model
                match = Match(
                    mentor_email=mentor.email,
                    mentee_email=mentee.email,
                    session_type=mentee_session.type,
                    session_name=mentee.session_name
                )

                matches.append(match)
                mentee_session.is_match_found = True
                mentor_session.currentMentees += 1
                updated_mentees.append(mentee)
                updated_mentors.append(mentor)
                matches.append(match)
                break

    # Write updated mentees and mentors back to the database
    for mentee in updated_mentees:
        collection.update_one({"email": mentee["email"]}, {"$set": mentee})

    for mentor in updated_mentors:
        collection.update_one({"email": mentor["email"]}, {"$set": mentor})

if __name__ == "__main__":
    find_best_match()