import random
from faker import Faker
import csv
import boto3
from botocore.exceptions import ClientError
import io
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
import uuid
from concurrent.futures import ThreadPoolExecutor 

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')

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
    return mentor["Age"] >= mentee["Age"] + 10

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

def match_mentee(mentee, mentors):
    matches_to_insert = []
    location_filtered_mentors = [mentor for mentor in mentors if mentor["LocationState"] in mentee["LocationState"]]
    for session_type in mentee["MentoringTypes"]:
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
                "MentoringType": session_type["type"],
                "AvailabilityMentee": mentee["AvailableTimes"],
                "AvailabilityMentor": best_match["AvailableTimes"],
                "Frequency": "", 
                "SessionTiming": "",
                "IsActive": True,
                "Notes": ""
            }

            matches_to_insert.append(match_object)

            for s_type in mentee["MentoringTypes"]:
                if s_type["type"] == session_type["type"]:
                    s_type["is_match_found"] = True

            best_match["MenteeCount"] += 1

    return matches_to_insert, best_match

def find_best_match():
    mentees_response = mentees_table.scan()
    mentees = mentees_response['Items']

    mentors_response = mentors_table.scan()
    mentors = mentors_response['Items']

    all_matches = []

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(match_mentee, mentee, mentors) for mentee in mentees]
        for future in futures:
            matches, _ = future.result()
            all_matches.extend(matches)
    batch_insert_matches(all_matches)

def batch_insert_matches(matches):
    if matches:
        with matches_table.batch_writer() as batch:
            for match in matches:
                batch.put_item(Item=match)

def lambda_handler(event, context):
    print("Started inserting dummy data!")
    find_best_match()
