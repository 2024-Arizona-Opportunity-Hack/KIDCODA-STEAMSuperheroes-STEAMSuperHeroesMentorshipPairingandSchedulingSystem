import random
from faker import Faker
import csv
import boto3
from botocore.exceptions import ClientError
import io
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
import uuid


# def get_coordinates(city, state):
#     location = geolocator.geocode(f"{city}, {state}, USA")
#     if location:
#         return (location.latitude, location.longitude)
#     return None

# def is_within_distance(mentor_location, mentee_location, max_distance = 60):
#     return mentor_location == mentee_location

def is_age_appropriate(mentor, mentee, mentoring_type):
    if mentoring_type == "homework help":
        return mentor["AcademicLevel"] >= mentee["Grade"]
    return mentor["Age"] >= mentee["Age"]  + 10

def match_mentoring_type(mentor, mentee):
    return any(mentoring_type in mentee["MentoringMethods"] for mentoring_type in mentor["MentoringMethods"])

def match_ethnicity(mentor, mentee):
    if mentor["EthnicityPref"] == "Prefer ONLY to be matched within that similarity" or mentee["EthnicityPref"] == "Prefer ONLY to be matched within that similarity":
        return any(eth in mentee["EthnicityPref"] for eth in mentor["EthnicityPref"])
    
    if mentee["EthnicityPref"] == "Prefer NOT to be matched within that similarity" or mentor["EthnicityPref"] == "Prefer NOT to be matched within that similarity":
        return all(eth not in mentee["Ethnicity"] for eth in mentor["Ethnicity"])

    return True

def match_gender(mentor, mentee):
    if mentor["GenderPref"] == "Prefer ONLY to be matched within that similarity" or mentee["GenderPref"] == "Prefer ONLY to be matched within that similarity":
        return any(eth in mentee["GenderPref"] for eth in mentor["GenderPref"])
    
    if mentee["GenderPref"] == "Prefer NOT to be matched within that similarity" or mentor["GenderPref"] == "Prefer NOT to be matched within that similarity":
        return all(eth not in mentee["GenderPref"] for eth in mentor["GenderPref"])

    return True

def find_best_match():
    mentees_response = mentees_table.scan()
    mentees = mentees_response['Items']

    mentors_response = mentors_table.scan()
    mentors = mentors_response['Items']

    for mentee in mentees:

        for session_type in mentee["MentoringTypes"]:
            if session_type["is_match_found"]:
                continue
            
            best_match = None
            for mentor in mentors:
                if mentor["MenteeCount"] >= mentor["MaxMentees"]:
                    continue
                # if not is_within_distance(mentor["LocationState"], mentee["LocationState"]):
                #     continue

                if not is_age_appropriate(mentor, mentee, session_type["type"]):
                    continue

                if not match_mentoring_type(mentor, mentee):
                    continue

                if not match_ethnicity(mentor, mentee):
                    continue

                if not match_gender(mentor, mentee):
                    continue

                best_match = mentor
                break

            if best_match:
                match_object = {
                    "PairID": f"PAIR#{str(uuid.uuid4())}",
                    "MentorName": best_match["Name"],
                    "MenteeName": mentee["Name"],
                    "MentorEmail": best_match["Email"],
                    "MenteeEmail": mentee["Email"],
                    "MentoringType": session_type["type"],
                    "AvailabilityMentee": mentee["AvailableTimes"],
                    "AvailabilityMentor": best_match["AvailableTimes"],
                    "Frequency": "",  # Can be filled later
                    "SessionTiming": "",  # Can be filled later
                    "IsActive": True,
                    "Notes": ""
                }

                insert_match(match_object)

                for s_type in mentee["MentoringTypes"]:
                    if s_type["type"] == session_type["type"]:
                        s_type["is_match_found"] = True
                update_mentee_session(mentee)

                best_match["MenteeCount"] += 1
                update_mentor_mentee_count(best_match)

                continue

def insert_match(match_item):
    try:
        matches_table.put_item(Item=match_item)
        print(f"Match created: Mentor: {match_item['MentorName']} and Mentee: {match_item['MenteeName']}")
    except Exception as e:
        print(f"Failed to insert match: {e}")

def update_mentee_session(mentee):
    try:
        mentees_table.update_item(
            Key={"PK": mentee["PK"], "SK": mentee["SK"]},
            UpdateExpression="SET MentoringTypes = :new_sessions",
            ExpressionAttributeValues={":new_sessions": mentee["MentoringTypes"]}
        )
        print(f"Updated mentee session for {mentee['Name']}")
    except Exception as e:
        print(f"Failed to update mentee session: {e}")

def update_mentor_mentee_count(mentor):
    try:
        mentors_table.update_item(
            Key={"PK": mentor["PK"], "SK": mentor["SK"]},
            UpdateExpression="SET MenteeCount = :new_count",
            ExpressionAttributeValues={":new_count": mentor["MenteeCount"]}
        )
        print(f"Updated mentee count for mentor: {mentor['Name']}")
    except Exception as e:
        print(f"Failed to update mentor mentee count: {e}")


if __name__ == "__main__":
    find_best_match()

