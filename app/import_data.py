import boto3
from botocore.exceptions import ClientError
import csv
import io

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')  # Specify your region

# References to DynamoDB tables
users_table = dynamodb.Table('Users')

# Function to transform session types into the desired format
def transform_session_types(session_types_str):
    session_types = session_types_str.split(';')
    session_data = [{"Session Type": session_type.strip(), "isSessionMatched": False} for session_type in session_types]
    return session_data

def insert_user(user_data):
    try:
        print(f"Inserting into {users_table.name}: {user_data}")  # Debug statement
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
        print(f"Successfully inserted mentor: {mentor_data['PK']}")
    except ClientError as e:
        print(f"Error inserting mentor: {e.response['Error']['Message']}")

def insert_mentee(user_data):
    mentee_data = {
        "PK": user_data["PK"],
        "SK": "MENTEE_PROFILE",
        "AvailableTimes": user_data["AvailableTimes"],
        "SessionTypes": user_data["SessionTypes"],
        "Email": user_data["Email"],
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
                "SK": "MENTEE_PROFILE" if row["Choose the role you are signing up for"] == "Mentee" else "MENTOR_PROFILE",
                "Email": row["Email"],
                "Name": row["Name (First, Last)"],
                "Age": row["Age"],
                "PhoneNumber": row["Phone Number"],
                "LocationCity": row["Location: City"],
                "LocationState": row["Location: State"],
                "SessionTypes": session_types,  # Insert transformed session types here
                "Ethnicity": row["Ethnicity"].split(','),
                "EthnicityPref": row["What is your preference in being matched with a person of the same ethnicity?"],
                "Gender": row["Gender"].split(','),
                "GenderPref": row["What is your preference regarding being matched with a person of the same gender identity?"],
                "MentoringMethods": row["What methods of mentoring are you open to?"].split(','),
                "Role": row["Choose the role you are signing up for"],
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

    except ClientError as e:
        print(f"Error: {e}")
        raise e
