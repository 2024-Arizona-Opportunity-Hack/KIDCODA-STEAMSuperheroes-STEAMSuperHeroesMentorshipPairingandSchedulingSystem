import time
import uuid
from datetime import datetime, timedelta

def convert24(str1): 
    if str1[-2:] == "am" and str1[:2] == "12":
        return "0"
    elif str1[-2:] == "am": 
        return str1[:-2]
    elif str1[-2:] == "pm" and str1[:2] == "12":
        return str1[:-2]
    else: 
        return str(int(str1[:-2]) + 12)

def get_start_end_time(availability_time):
    start_str, end_str = availability_time.split('to')
    start = convert24(start_str.strip().lower())
    end = convert24(end_str.strip().lower())
    return (int(start),int(end))

def find_overlap(intervals1, intervals2):
    overlaps = []
    for start1, end1 in intervals1:
        for start2, end2 in intervals2:
            # Find overlap
            start_overlap = max(start1, start2)
            end_overlap = min(end1, end2)
            if start_overlap < end_overlap:  # There's an overlap
                overlaps.append((start_overlap, end_overlap))
    return overlaps

def get_overlaps(availability_a, availability_b):
    av_a = {}
    av_b = {}
    for k, arr in availability_a.items():
        arr1 = []
        for dur in arr:
            arr1.append(get_start_end_time(dur))
        av_a[k] = arr1

    for k, arr in availability_b.items():
        arr2 = []
        for dur in arr:
            arr2.append(get_start_end_time(dur))
        av_b[k] = arr2

    overlap_times = {}
    for day in av_a.keys():
        if day in av_b:
            overlap_times[day] = find_overlap(av_a[day], av_b[day])
    return overlap_times


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
        "AvailabilityofMentee": {
            "Monday": ["8am to 11am"],
            "Tuesday": ["6am to 11 pm", "1pm to 3pm"],
            "Wednesday": ["6am to 12pm"],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": []
        },
        "AvailabilityofMentor": {
            "Monday": ["7am to 9am"],
            "Tuesday": [],
            "Wednesday": ["6am to 12pm"],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": []
        },
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
        "AvailabilityofMentee": {
            "Monday": ["9am to 11am"],
            "Tuesday": [],
            "Wednesday": ["6am to 12pm"],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": []
        },
        "AvailabilityofMentor": {
            "Monday": [],
            "Tuesday": [],
            "Wednesday": ["6am to 10am"],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": []
        },
        "cadence": "monthly",
        "session_start_date": "20250103", 
        "session_end_date": "20250701",
        "IsActive": True,
        "Notes": f"Scheduled meeting."
    }]


def create_meeting(meet, current_date, matched_pair):
    meeting = {
        "MentorID": matched_pair["MentorID"],
        "MenteeID": matched_pair["MenteeID"],
        "Availability": meet
    }

    available_weekdays = meet.keys()

    while True:
        if current_date.strftime('%A') in available_weekdays:
            meeting["date"] = current_date
            break
        current_date += timedelta(days=1)

    return meeting


def get_meetings_for_pair(start_date, end_date, meet, matched_pair):
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
        meeting = create_meeting(meet, current_date, matched_pair)
        meetings.append(meeting)

        current_date += timedelta(delta)
    return meetings

def find_meeting_times(start_date, end_date):
    pairings = get_pairings()
    pair_meetings = {}

    for record in pairings:
        overlaps = get_overlaps(record["AvailabilityofMentor"], record["AvailabilityofMentee"])
        meet = {}
        for k,v in overlaps.items():
            if len(v) > 0:
                meet[k] = v
        pair_meetings[record["PK"]] = get_meetings_for_pair(start_date, end_date, meet, record)
    return pair_meetings

def schedule_meetings(start_date, end_date):
    scheduled_meetings = find_meeting_times(start_date, end_date)
    print(scheduled_meetings)

session_start_date = datetime(2025, 1, 3)
session_end_date = datetime(2025, 7, 1)

schedule_meetings(session_start_date, session_end_date)
