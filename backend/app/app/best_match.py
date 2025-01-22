from haversine import haversine, Unit
from model_types.enums import Preference, MentoringType, Method, AgeBracket
from pymongo import MongoClient
from models.matchings import Match
# Configuration settings
MAX_DISTANCE = 60  # Maximum distance in miles for matching


def is_within_distance(mentor_location, mentee_location, max_distance=MAX_DISTANCE):
    return haversine(mentor_location, mentee_location, unit=Unit.MILES) <= max_distance

def is_age_appropriate(mentor, mentee, mentoring_type):
    if mentoring_type == MentoringType.HOMEWORK_HELP:
        return mentor.mentor.academicLevel >= mentee.mentee.grade
    elif mentoring_type in [MentoringType.CAREER_GUIDANCE, MentoringType.COLLEGE_GUIDANCE]:
        return is_age_bracket_appropriate(mentor.ageBracket, mentee.ageBracket)
    return True

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
            potential_mentors = []
            for mentor in mentors:
                if mentee.email == mentor.email:
                    continue
                mentor_session = next((s for s in mentor.mentor.sessionType if s.type == mentee_session.type), None)
                if mentor_session is None or mentor_session.currentMentees >= mentor_session.willingToAdvise:
                    continue
                if not is_age_appropriate(mentor, mentee, mentee_session.type):
                    continue

                if Method.IN_PERSON in mentee.methods or Method.HYBRID in mentee.methods:
                    mentor_location = (mentor.latitude, mentor.longitude)
                    if not is_within_distance(mentor_location, mentee_location):
                        continue
                   
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
                    session_type=mentee_session.type,
                    session_name=mentee.session_name
                )

                matches.append(match)
                mentee_session.is_match_found = True
                mentor.currentMentees += 1
                updated_mentees.append(mentee)
                updated_mentors.append(best_match)
                matches.append(match)
                break


            

                

    # Write updated mentees and mentors back to the database
    for mentee in updated_mentees:
        collection.update_one({"email": mentee["email"]}, {"$set": mentee})

    for mentor in updated_mentors:
        collection.update_one({"email": mentor["email"]}, {"$set": mentor})

if __name__ == "__main__":
    find_best_match()