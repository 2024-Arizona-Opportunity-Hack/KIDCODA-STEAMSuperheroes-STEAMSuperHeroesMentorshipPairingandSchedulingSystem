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

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')

# References to DynamoDB tables
mentors_table = dynamodb.Table('Mentors')
mentees_table = dynamodb.Table('Mentees')
matches_table = dynamodb.Table('Pairings')
geolocator = Nominatim(user_agent="geoapi")

# Function to get coordinates for a city and state (if needed later)
def get_coordinates(city, state):
    location = geolocator.geocode(f"{city}, {state}, USA")
    if location:
        return (location.latitude, location.longitude)
    return None

# Function to check if the mentor's age is appropriate based on mentoring type
def is_age_appropriate(mentor, mentee, mentoring_type):
    if mentoring_type == "homework help":
        return mentor["AcademicLevel"] >= mentee["Grade"]
    return mentor["Age"] >= mentee["Age"] + 10

def match_mentoring_type(mentor, mentee):
    return any(mentoring_type in mentee["MentoringMethods"] for mentoring_type in mentor["MentoringMethods"])

# Function to check ethnicity matching based on preferences
def match_ethnicity(mentor, mentee):
    if mentor["EthnicityPref"] == "Prefer ONLY to be matched within that similarity" or mentee["EthnicityPref"] == "Prefer ONLY to be matched within that similarity":
        return any(eth in mentee["EthnicityPref"] for eth in mentor["EthnicityPref"])
    if mentee["EthnicityPref"] == "Prefer NOT to be matched within that similarity" or mentor["EthnicityPref"] == "Prefer NOT to be matched within that similarity":
        return all(eth not in mentee["Ethnicity"] for eth in mentor["Ethnicity"])
    return True

# Function to check gender matching based on preferences
def match_gender(mentor, mentee):
    if mentor["GenderPref"] == "Prefer ONLY to be matched within that similarity" or mentee["GenderPref"] == "Prefer ONLY to be matched within that similarity":
        return any(eth in mentee["GenderPref"] for eth in mentor["GenderPref"])
    if mentee["GenderPref"] == "Prefer NOT to be matched within that similarity" or mentor["GenderPref"] == "Prefer NOT to be matched within that similarity":
        return all(eth not in mentee["GenderPref"] for eth in mentor["GenderPref"])
    return True

# Function to filter mentors based on initial conditions (location, age, gender, ethnicity)
def filter_mentors(mentee, mentors):
    eligible_mentors = []
    for mentor in mentors:
        if mentor["LocationState"] != mentee["LocationState"]:
            continue
        if mentor["MenteeCount"] >= mentor["MaxMentees"]:
            continue
        if not is_age_appropriate(mentor, mentee, "general"):
            continue
        if not match_mentoring_type(mentor, mentee):
            continue
        if not match_ethnicity(mentor, mentee):
            continue
        if not match_gender(mentor, mentee):
            continue
        eligible_mentors.append(mentor)
    print(f"Mentee {mentee['Name']} has {len(eligible_mentors)} eligible mentors")
    return eligible_mentors

# Main matching function for a single mentee
def match_mentee(mentee, mentors, updated_mentors, updated_mentees):
    matches_to_insert = []

    # Filter mentors once based on conditions like age, gender, and ethnicity
    eligible_mentors = filter_mentors(mentee, mentors)

    for session_type in mentee["MentoringTypes"]:
        if session_type["is_match_found"]:
            continue

        best_match = None
        # Now check for matching session types from eligible mentors
        for mentor in eligible_mentors:
            print(f"Mentee {mentee['Name']} has {len(eligible_mentors)} eligible mentors")
            print(f"Mentee {session_type["type"]} has, Mentor {mentor["MentoringTypes"]} has  ")
            if any(mentoring_type == session_type["type"] for mentoring_type in mentor["MentoringTypes"]):
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

            # Mark the matched session type as found
            for s_type in mentee["MentoringTypes"]:
                if s_type["type"] == session_type["type"]:
                    s_type["is_match_found"] = True

            best_match["MenteeCount"] += 1  # Update mentee count for mentor

            # Add the mentor and mentee to the updated lists (to be updated later in batch)
            updated_mentors.add(best_match["PK"])
            updated_mentees.add(mentee["PK"])

    print(f"Mentee {mentee['Name']} found {len(matches_to_insert)} matches")
    return matches_to_insert

# Function to find the best matches for all mentees
def find_best_match():
    mentees_response = mentees_table.scan()
    mentees = mentees_response['Items']

    mentors_response = mentors_table.scan()
    mentors = mentors_response['Items']

    all_matches = []
    updated_mentors = set()  # Keep track of mentors that need updating
    updated_mentees = set()  # Keep track of mentees that need updating

    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(match_mentee, mentee, mentors, updated_mentors, updated_mentees) for mentee in mentees]
        for future in futures:
            matches = future.result()
            all_matches.extend(matches)
    
    # Batch insert all matches found
    print(f"Total matches found: {len(all_matches)}")
    batch_insert_matches(all_matches)

    # Now batch update all changed mentors and mentees
    batch_update_mentors_and_mentees(updated_mentors, updated_mentees)

# Batch insert matches into DynamoDB
def batch_insert_matches(matches):
    if matches:
        with matches_table.batch_writer() as batch:
            for match in matches:
                print(f"Inserting match: {match['MentorName']} with {match['MenteeName']}")
                batch.put_item(Item=match)

# Batch update mentors and mentees
def batch_update_mentors_and_mentees(updated_mentors, updated_mentees):
    # Batch update mentors
    with mentors_table.batch_writer() as batch:
        for mentor_key in updated_mentors:
            # Fetch mentor from database (to update MenteeCount)
            mentor = mentors_table.get_item(Key={"PK": mentor_key, "SK": "MENTOR_PROFILE"})['Item']
            print(f"Updating mentor: {mentor['Name']}, new MenteeCount: {mentor['MenteeCount']}")
            batch.put_item(Item=mentor)

    # Batch update mentees
    with mentees_table.batch_writer() as batch:
        for mentee_key in updated_mentees:
            # Fetch mentee from database (to update MentoringTypes)
            mentee = mentees_table.get_item(Key={"PK": mentee_key, "SK": "MENTEE_PROFILE"})['Item']
            print(f"Updating mentee: {mentee['Name']}")
            batch.put_item(Item=mentee)

# Lambda handler
def lambda_handler(event, context):
    print("Started inserting dummy data!")
    find_best_match()
