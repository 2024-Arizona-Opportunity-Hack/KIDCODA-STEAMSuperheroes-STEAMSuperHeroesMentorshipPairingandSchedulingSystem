import random
from faker import Faker
import csv
import boto3
from botocore.exceptions import ClientError
import io
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
import uuid

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')  # Specify your region


mentors_table = dynamodb.Table('Mentors')
mentees_table = dynamodb.Table('Mentees')
matches_table = dynamodb.Table('Pairings')
geolocator = Nominatim(user_agent="geoapi")



def get_coordinates(city, state):
    location = geolocator.geocode(f"{city}, {state}, USA")
    if location:
        return (location.latitude, location.longitude)
    return None

def is_within_distance(mentor_location, mentee_location, max_distance=60):
    return mentor_location == mentee_location

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
    
    matches_to_insert = []  # Store matches to insert in batches
    mentors_to_update = []  # Store mentors to update in batches
    mentees_to_update = []

    for mentee in mentees:
        location_filtered_mentors = [mentor for mentor in mentors if mentor["LocationState"] in mentee["LocationState"]]

        for session_type in mentee["SessionTypes"]:
            if session_type["is_match_found"]:
                continue
            
            best_match = None
            for mentor in location_filtered_mentors:
                if mentor["MenteeCount"] >= mentor["MaxMentees"]:
                    continue

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
                    "SessionType": session_type["type"],
                    "AvailabilityMentee": mentee["AvailableTimes"],
                    "AvailabilityMentor": best_match["AvailableTimes"],
                    "Frequency": "",  # Can be filled later
                    "SessionTiming": "",  # Can be filled later
                    "IsActive": True,
                    "Notes": ""
                }
                matches_to_insert.append(match_object)

                for s_type in mentee["SessionTypes"]:
                    if s_type["type"] == session_type["type"]:
                        s_type["is_match_found"] = True
                mentees_to_update.append(mentee)

                best_match["MenteeCount"] += 1
                mentors_to_update.append(best_match)

                continue

    batch_insert_matches(matches_to_insert)
    batch_update_mentors(mentors_to_update)
    batch_update_mentees(mentees_to_update)

def batch_insert_matches(matches):
    with matches_table.batch_writer() as batch:
        for match in matches:
            batch.put_item(Item=match)

def batch_update_mentors(mentors):
    unique_keys = set()
    with mentors_table.batch_writer() as batch:
        for mentor in mentors:
            if mentor["PK"] not in unique_keys:
                batch.put_item(Item=mentor)
                unique_keys.add(mentor["PK"])

def batch_update_mentees(mentees):
    unique_keys = set()
    with mentees_table.batch_writer() as batch:
        for mentee in mentees:
            if mentee["PK"] not in unique_keys:
                batch.put_item(Item=mentee)
                unique_keys.add(mentee["PK"])


def lambda_handler(event, context):
    print("Started inserting dummy data!")
    find_best_match()



            
