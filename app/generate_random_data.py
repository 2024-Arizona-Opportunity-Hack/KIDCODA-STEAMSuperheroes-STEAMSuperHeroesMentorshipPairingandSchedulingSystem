import random
from faker import Faker
import csv
import boto3
from botocore.exceptions import ClientError
import io

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')  # Specify your region


mentors_table = dynamodb.Table('Mentors')
mentees_table = dynamodb.Table('Mentees')
fake = Faker()

cities = [
    "New York", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", 
    "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth",
    "Columbus", "Charlotte", "Indianapolis", "San Francisco", "Seattle", "Denver",
    "Washington", "Boston", "Nashville", "Detroit", "Oklahoma City", "Portland",
    "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson",
    "Fresno", "Mesa", "Kansas City", "Atlanta", "Miami", "Raleigh", "Omaha",
    "Long Beach", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Arlington",
    "Tampa", "New Orleans", "Cleveland", "Wichita", "Honolulu", "Bakersfield", "Aurora"
]

states = [
    "NY", "IL", "TX", "AZ", "PA", "CA", "FL", "OH", "NC", "IN", "WA", "CO", "DC", "MA", 
    "TN", "MI", "OK", "OR", "NV", "KY", "MD", "WI", "NM", "MO", "GA", "VA", "HI", "NE", 
    "MN", "LA", "KS"
]
session_types = ["Homework Help", "Exposure to STEAM in general", "College guidance", "Career guidance", "Explore a particular field"]
ethnicities = ["South Asian", "Black", "White", "Hispanic", "Middle Eastern", "Native Hawaiian", "American Indian"
                , "Asian"]
genders = ["Cisgender Male", "Cisgender Female", "Transgender Male", "Transgender Female", "Prefer not to disclose"]
ethnicity_preferences = ["Prefer ONLY to be matched within that similarity", "Prefer it, but available to others as needed", "Prefer NOT to be matched within that similarity", "Do not have a preference"]
gender_preferences = ["Prefer ONLY to be matched within that similarity", "Prefer it, but available to others as needed", "Prefer NOT to be matched within that similarity", "Do not have a preference"]
mentoring_methods = ["Web conference (Zoom)", "In Person", "Hybrid (both web and in person)"]

def generate_dummy_mentors(count=20):
    mentors = []
    for _ in range(count):
        mentor = {
            "PK": f"USER#{fake.email()}",
            "SK": "MENTOR_PROFILE",
            "Email": fake.email(),
            "Name": fake.name(),
            "Age": random.randint(20, 60),
            "PhoneNumber": fake.phone_number(),
            "LocationCity": random.choice(cities),
            "LocationState": random.choice(states),
            "SessionTypes": random.sample(session_types, k=random.randint(1, 3)),
            "Ethnicity": random.sample(ethnicities, k=1),
            "EthnicityPref": random.choice(ethnicity_preferences),
            "Gender": random.sample(genders, k=1),
            "GenderPref": random.choice(gender_preferences),
            "MentoringMethods": random.sample(mentoring_methods, k=random.randint(1, 2)),
            "MaxMentees": random.randint(1, 5),
            "MenteeCount": 0,  # Start with no mentees assigned
            "AcademicLevel": random.randint(13, 20),
            "AvailableTimes": {
                "Monday": ["7pm to 9pm"],
                "Tuesday": ["5pm to 7pm"],
                "Wednesday": ["7pm to 9pm"],
                "Thursday": ["7pm to 9pm"],
                "Friday": ["5pm to 7pm"],
                "Saturday": ["3pm to 5pm"],
                "Sunday": ["3pm to 5pm"]
            }
        }
        mentors.append(mentor)
    return mentors

def generate_dummy_mentees(count=20):
    mentees = []
    for _ in range(count):
        mentee = {
            "PK": f"USER#{fake.email()}",
            "SK": "MENTEE_PROFILE",
            "Email": fake.email(),
            "Name": fake.name(),
            "Age": random.randint(14, 25),
            "PhoneNumber": fake.phone_number(),
            "LocationCity": random.choice(cities),
            "LocationState": random.choice(states),
            "SessionTypes": random.sample(session_types, k=random.randint(1, 3)),
            "Ethnicity": random.sample(ethnicities, k=1),
            "EthnicityPref": random.choice(ethnicity_preferences),
            "Gender": random.sample(genders, k=1),
            "GenderPref": random.choice(gender_preferences),
            "MentoringMethods": random.sample(mentoring_methods, k=random.randint(1, 2)),
            "GradeLevel": random.randint(5, 17),
            "AvailableTimes": {
                "Monday": ["7pm to 9pm"],
                "Tuesday": ["5pm to 7pm"],
                "Wednesday": ["7pm to 9pm"],
                "Thursday": ["7pm to 9pm"],
                "Friday": ["5pm to 7pm"],
                "Saturday": ["3pm to 5pm"],
                "Sunday": ["3pm to 5pm"]
            }
        }
        mentees.append(mentee)
    return mentees
    
# Insert mentor data into the Mentors table
def insert_mentor(user_data):
    mentor_data = {
        "PK": user_data["PK"],
        "SK": "MENTOR_PROFILE",
        "MaxMentees": user_data["MaxMentees"],
        "MenteeCount": 0,
        "AvailableTimes": user_data["AvailableTimes"],
        "SessionTypes": user_data["SessionTypes"],
        "Email": user_data["Email"],
        "Name": user_data["Name"],
        "Age": user_data["Age"],
        "Gender": user_data["Gender"],
        "Ethnicity": user_data["Ethnicity"],
        "EthnicityPref": user_data["EthnicityPref"],
        "GenderPref": user_data["GenderPref"],
        "LocationCity": user_data["LocationCity"],
        "MentoringMethods": user_data["MentoringMethods"],
        "LocationState": user_data["LocationState"],
        "AcademicLevel": user_data["AcademicLevel"]
    }
    try:
        print(f"Inserting into {mentors_table.name}: {mentor_data}")  # Debug statement
        mentors_table.put_item(Item=mentor_data)
        # print(f"Successfully inserted mentor: {mentor_data['PK']}")
    except ClientError as e:
        print(f"Error inserting mentor: {e.response['Error']['Message']}")

# Insert mentee data into the Mentees table
def insert_mentee(user_data):
    mentee_data = {
        "PK": user_data["PK"],
        "SK": "MENTEE_PROFILE",
        "AvailableTimes": user_data["AvailableTimes"],
        "SessionTypes": [{"type": t, "is_match_found": False} for t in user_data["SessionTypes"]],
        "Email": user_data["Email"],
        "Name": user_data["Name"],
        "Age": user_data["Age"],
        "Gender": user_data["Gender"],
        "Ethnicity": user_data["Ethnicity"],
        "EthnicityPref": user_data["EthnicityPref"],
        "GenderPref": user_data["GenderPref"],
        "LocationCity": user_data["LocationCity"],
        "MentoringMethods": user_data["MentoringMethods"],
        "LocationState": user_data["LocationState"],
        "Grade": user_data["GradeLevel"]
    }
    try:
        print(f"Inserting into {mentees_table.name}: {mentee_data}")  # Debug statement
        mentees_table.put_item(Item=mentee_data)
        # print(f"Successfully inserted mentee: {mentee_data['PK']}")
    except ClientError as e:
        print(f"Error inserting mentee: {e.response['Error']['Message']}")


def insert_dummy_data():
    mentors = generate_dummy_mentors(20)
    mentees = generate_dummy_mentees(20)
    
    for mentor in mentors:
        insert_mentor(mentor)
    
    for mentee in mentees:
        insert_mentee(mentee)

def lambda_handler(event, context):
    print("Started inserting dummy data!")
    insert_dummy_data()

