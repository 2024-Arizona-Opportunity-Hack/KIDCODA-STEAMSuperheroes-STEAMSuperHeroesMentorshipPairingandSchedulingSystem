import time
import uuid
from datetime import datetime, timedelta

def get_start_end_time(availability):
    return [int(i) for i in availability["time"].split("-")]

def is_time_overlap(availability_a, availability_b):
    start1, end1 = get_start_end_time(availability_a)
    start2, end2 = get_start_end_time(availability_b)
    return (max(start1, start2) <= min(end1, end2)) and (availability_a["day"].lower() == availability_b["day"].lower())

def get_overlap_availability(availability_a, availability_b):
    start1, end1 = get_start_end_time(availability_a)
    start2, end2 = get_start_end_time(availability_b)
    overlap_start = max(start1, start2)
    overlap_end = min(end1, end2)
    return {
        "day": availability_a["day"],
        "time": f"{overlap_start}-{overlap_end}"
    }

def get_pairings():
    return [{
        "PK": f"PAIR#{str(uuid.uuid4())}",
        "MentorID": "1",
        "MenteeID": "2",
        "MentorName": "Apple",
        "MenteeName": "Banana",
        "MentorEmail": "Apple@gmail.com",
        "MenteeEmail": "banana@gmail.com",
        "SessionType": "meeting",
        "AvailabilityofMentee": [
            {"day": "Monday", "time": "8-11"},
            {"day": "Tuesday", "time": "6-12"}
        ],
        "AvailabilityofMentor": [
            {"day": "Monday", "time": "8-11"},
            {"day": "Wednesday", "time": "6-12"}
        ],
        "cadence": "monthly",
        "session_start_date": "20250103", 
        "session_end_date": "20250701",
        "IsActive": True,
        "Notes": f"Scheduled meeting."
    },{
        "PK": f"PAIR#{str(uuid.uuid4())}",
        "MentorID": "3",
        "MenteeID": "4",
        "MentorName": "Apple1",
        "MenteeName": "Banana1",
        "MentorEmail": "Apple1@gmail.com",
        "MenteeEmail": "banana1@gmail.com",
        "SessionType": "meeting",
        "AvailabilityofMentee": [
            {"day": "Wednesday", "time": "8-10"},
            {"day": "Thursday", "time": "6-12"}
        ],
        "AvailabilityofMentor": [
            {"day": "Wednesday", "time": "8-11"}
        ],
        "cadence": "monthly",
        "session_start_date": "20250103", 
        "session_end_date": "20250701",
        "IsActive": True,
        "Notes": f"Scheduled meeting."
    }]


def create_meeting(overlap_availability, current_date, matched_pair):
    meeting = {
        "MentorID": matched_pair["MentorID"],
        "MenteeID": matched_pair["MenteeID"],
        "time": overlap_availability["time"]
    }
    weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday',    
        'saturday', 'sunday']
    day = overlap_availability["day"]
    weekday = weekdays.index(day.lower())

    day_shift = (weekday - current_date.weekday()) % 7
    meeting["date"] = current_date + timedelta(days=day_shift)
    return meeting


def get_meetings_for_pair(start_date, end_date, overlap_availability, matched_pair):
    meetings = []
    current_date = start_date
    cadence = matched_pair["cadence"]

    delta = 30
    if cadence.lower() == "monthly":
        delta = 30
    elif cadence.lower() == "biweekly":
        delta = 14
    elif cadence.lower() == "weekly":
        delta = 7

    while current_date <= end_date:
        meeting = create_meeting(overlap_availability, current_date, matched_pair)
        meetings.append(meeting)

        current_date += timedelta(delta)
    return meetings

def find_meeting_times(start_date, end_date):
    pairings = get_pairings()
    pair_meetings = {}

    for record in pairings:
        for mentor_avail in record["AvailabilityofMentor"]:
            for mentee_avail in record["AvailabilityofMentee"]:
                if record["PK"] not in pair_meetings and is_time_overlap(mentee_avail, mentor_avail):
                    overlap_availability = get_overlap_availability(mentor_avail, mentee_avail)
                    pair_meetings[record["PK"]] = get_meetings_for_pair(start_date, end_date, overlap_availability, record)
    return pair_meetings


def schedule_meetings(start_date, end_date):
    scheduled_meetings = find_meeting_times(start_date, end_date)
    print(scheduled_meetings)

session_start_date = datetime(2025, 1, 3)
session_end_date = datetime(2025, 7, 1)

schedule_meetings(session_start_date, session_end_date)
