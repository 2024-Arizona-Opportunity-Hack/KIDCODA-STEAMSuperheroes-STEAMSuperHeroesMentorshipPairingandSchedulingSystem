import boto3
from botocore.exceptions import ClientError
import csv
import io

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')  # Specify your region

academic_level_mapping = {
    "5th grade": 5,
    "6th grade": 6,
    "7th grade": 7,
    "8th grade": 8,
    "9th grade": 9,
    "10th grade": 10,
    "11th grade": 11,
    "12th grade": 12,
    "College Freshman": 13,
    "College Sophomore": 14,
    "College Junior": 15,
    "College Senior": 16,
    "Graduate Student": 17,
    "High School Freshman": 9,
    "High School Sophomore": 10,
    "High School Junior": 11,
    "High School Senior": 12,
    "College Undergraduate": 13,
    "Graduate School": 17,
    "Graduated / Working Professional": 18
}

ethnicity_mapping = {
    "South Asian: Includes Indian, Pakistan, Sri Lankan, Bangaladesh": 1,
    "Black or African American: Includes Jamaican, Nigerian, Haitian, and Ethiopian": 2,
    "White or European: Includes German, Irish, English, Italian, Polish, and French": 3,
    "Hispanic or Latino: Includes Puerto Rican, Mexican, Cuban, Salvadoran, and Colombian": 4,
    "Middle Eastern or North African: Includes Lebanese, Iranian, Egyptian, Moroccan, Israeli, and Palestinian": 5,
    "Native Hawaiian or Pacific Islander: Includes Samoan, Buamanian, Chamorro, and Tongan": 6,
    "American Indian or Alaska Native": 7,
    "Asian: Includes Chinese, Japanese, Filipino, Korean, South Asian, and Vietnamese": 8
}

# Map preferences to numbers (1-5)
preference_mapping = {
    "Prefer ONLY to be matched within that similarity": 1,
    "Prefer it, but available to others as needed": 2,
    "Prefer NOT to be matched within that similarity": 3,
    "Do not have a preference. Either is fine.": 4,
    "Other:": 5
}

gender_mapping = {"Cisgender Male": 1, "Cisgender Female": 2, 
                  "Transgender Male":3, "Transgender Female":4, 
                  "Prefer not to disclose":5, "Others":6
}

# References to DynamoDB tables
users_table = dynamodb.Table('Users')
mentors_table = dynamodb.Table('Mentors')
mentees_table = dynamodb.Table('Mentees')

def transform_session_types(session_types_str):
    session_types = session_types_str.split(',')
    session_data = [{"type": session_type.strip(), "is_match_found": False} for session_type in session_types]
    return session_data

def get_state_abbreviation(state_str):
    state_name = state_str.split(":")[0].strip()
    return state_name

def map_academic_level(level_str):
    return academic_level_mapping.get(level_str, 0)

def map_ethnicity(ethnicity_str):
    ethnicities = [ethnicity_mapping[ethnicity] for ethnicity in ethnicity_mapping if ethnicity in ethnicity_str]
    return ethnicities
    
def map_gender(gender):
    return [gender_mapping.get(g.strip(), 0) for g in gender.split(",")]

def map_preference(preference_str):
    return preference_mapping.get(preference_str, 4)

def get_age_average(age_str):
    if "+" in age_str:
        return 70
    elif "-" in age_str:
        age_range = age_str.split("-")
        return (int(age_range[0]) + int(age_range[1])) // 2
    else:
        return int(age_str) 

def insert_user(user_data):
    try:
        print(f"Inserting into {users_table.name}: {user_data}")
        users_table.put_item(Item=user_data)
        print(f"Successfully inserted user: {user_data['PK']}, {user_data['SK']}")
    except ClientError as e:
        print(f"Error inserting user: {e.response['Error']['Message']}")

def insert_mentor(user_data):
    mentor_data = {
        "PK": user_data["PK"],
        "SK": "MENTOR_PROFILE",
        "MaxMentees": int(user_data["NumberOfMentees"]),
        "MenteeCount": 0,
        "AvailableTimes": user_data["AvailableTimes"],
        "SessionTypes": user_data["SessionTypes"],
        "Email": user_data["Email"],
        "Age": get_age_average(user_data["Age"]),
        "Gender": map_gender(user_data["Gender"]),
        "Ethnicity": map_ethnicity(user_data["Ethnicity"]),
        "EthnicityPref": map_preference(user_data["EthnicityPref"]),
        "GenderPref":map_preference(user_data["EthnicityPref"]),
        "LocationCity": user_data["LocationCity"],
        "MentoringMethods": user_data["MentoringMethods"],
        "LocationState": get_state_abbreviation(user_data["LocationState"]),
        "AcademicLevel": map_academic_level(user_data["AcademicLevel"])
    }
    try:
        print(f"Inserting into {mentors_table.name}: {mentor_data}")  # Debug statement
        mentors_table.put_item(Item=mentor_data)
        print(f"Successfully inserted mentor: {mentor_data['PK']}")
    except ClientError as e:
        print(f"Error inserting mentor: {e.response['Error']['Message']}")

def insert_mentee(user_data):
    gender = map_gender(user_data["Gender"])
    print("Gender : ", gender)
    mentee_data = {
        "PK": user_data["PK"],
        "SK": "MENTEE_PROFILE",
        "AvailableTimes": user_data["AvailableTimes"],
        "SessionTypes": user_data["SessionTypes"],
        "Email": user_data["Email"],
        "Age": get_age_average(user_data["Age"]),
        "Gender": map_gender(user_data["Gender"]),
        "Ethnicity": map_ethnicity(user_data["Ethnicity"]),
        "EthnicityPref": map_preference(user_data["EthnicityPref"]),
        "GenderPref": map_preference(user_data["EthnicityPref"]),
        "LocationCity": user_data["LocationCity"],
        "MentoringMethods": user_data["MentoringMethods"],
        "LocationState": get_state_abbreviation(user_data["LocationState"]),
        "Grade": map_academic_level(user_data["GradeLevel"])
    }
    try:
        print(f"Inserting into {mentees_table.name}: {mentee_data}")
        mentees_table.put_item(Item=mentee_data)
        print(f"Successfully inserted mentee: {mentee_data['PK']}")
    except ClientError as e:
        print(f"Error inserting mentee: {e.response['Error']['Message']}")


# Lambda handler function (assuming you are getting the data from S3)
def lambda_handler(event, context):
    print("Started!")
    
    # Get the bucket name and CSV file key from the event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    csv_file_key = event['Records'][0]['s3']['object']['key']
    print(f"Bucket: {bucket_name}, Key: {csv_file_key}")
    
    try:
        # Fetch the CSV file from S3
        s3_client = boto3.client('s3')
        csv_object = s3_client.get_object(Bucket=bucket_name, Key=csv_file_key)
        csv_content = csv_object['Body'].read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))

        # Process each row and insert into DynamoDB
        for row in csv_reader:
            print(row)
            # Get the session types and transform them
            session_types_str = row["Session Type Preferences"]
            session_types = transform_session_types(session_types_str)

            # Prepare the base user object
            user_data = {
                "PK": f"USER#{row['Email']}",  # Using Email as unique PK
                "SK": "MENTEE_PROFILE" if row["Choose the role you are signing up for"].split(" ")[0] == "Mentee" else "MENTOR_PROFILE",
                "Email": row["Email"],
                "Name": row["Name (First, Last)"],
                "Age": row["Age"],
                "PhoneNumber": row["Phone Number"],
                "LocationCity": row["Location: City"],
                "LocationState": row["Location: State"],
                "SessionTypes": session_types,  # Insert transformed session types here
                "Ethnicity": row["Ethnicity"],
                "EthnicityPref": row["What is your preference in being matched with a person of the same ethnicity?"],
                "Gender": row["Gender"],
                "GenderPref": row["What is your preference regarding being matched with a person of the same gender identity?"],
                "MentoringMethods": row["What methods of mentoring are you open to?"].split(','),
                "Role": row["Choose the role you are signing up for"].split(" ")[0],
                "GradeLevel": row["Grade"] if "Grade" in row else None,
                "ReasonsForWantingMentoring": row["Reasons for wanting a mentor"] if "Reasons for wanting a mentor" in row else [],
                "ReasonsForMentoring": row["Reasons for Mentoring"] if "Reasons for Mentoring" in row else [],
                "AcademicLevel": row["Current Academic level"] if "Current Academic level" in row else None,
                "Interests": row["Interests"].split(',') if "Interests" in row else [],
                "SteamBackground": row["STEAM background"] if "STEAM background" in row else None,
                "Profession": row["Profession / Job Title  (Enter N/A if not graduated)Your answer"] if "Profession / Job Title  (Enter N/A if not graduated)Your answer" in row else "",
                "CurrentEmployer": row["Current EmployerYour answer"] if "Current EmployerYour answer" in row else "",
                "NumberOfMentees": row["How many individual mentees are you willing to advise?"] if "How many individual mentees are you willing to advise?" in row else None,
                "AvailableTimes": {
                    "Monday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Monday]"].split(",")],
                    "Tuesday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Tuesday]"].split(",")],
                    "Wednesday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Wednesday]"].split(",")],
                    "Thursday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Thursday]"].split(",")],
                    "Friday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Friday]"].split(",")],
                    "Saturday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Saturday]"].split(",")],
                    "Sunday": [time.strip() for time in row["What day/times are good for regular meetings? (Must choose at least 3) [Sunday]"].split(",")]
                },
                "UnavailableDates": row["What are specific date ranges that you are NOT available? Please enter in YYYYMMDD format with a comma between each unique date, and a - to specify a range."]
            }

            # Insert the user into DynamoDB
            insert_user(user_data)
            if user_data["Role"] == "Mentor":
                insert_mentor(user_data)
            else:
                insert_mentee(user_data)

    except ClientError as e:
        print(f"Error: {e}")
        raise e
