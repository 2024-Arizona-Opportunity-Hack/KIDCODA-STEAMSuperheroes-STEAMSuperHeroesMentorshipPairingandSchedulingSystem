import json
import time
import uuid
from datetime import datetime, timedelta

import boto3

dynamodb = boto3.resource('dynamodb')
pairings_table = dynamodb.Table('Pairings')
meetings_table = dynamodb.Table('Meetings')

def get_pairings():
    response = pairings_table.scan()
    data = response['Items']

    while 'LastEvaluatedKey' in response:
        response = pairings_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        data.extend(response['Items'])
    return data

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


def create_meeting(meet, current_date, matched_pair):
    # meeting = {
    #     "Availability": meet
    # }
    meeting = {}

    available_weekdays = meet.keys()

    while True:
        if current_date.strftime('%A') in available_weekdays:
            meeting["date"] = str(current_date)
            meeting["day"] = current_date.strftime("%A")
            meeting["Availability"] = meet[meeting["day"]]
            break
        current_date += timedelta(days=1)

    return meeting


def get_meetings_for_pair(start_date, end_date, meet, matched_pair):
    meetings = []
    current_date = start_date
    cadence = matched_pair["Frequency"]

    if cadence == "":
        cadence = "monthly"

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
        overlaps = get_overlaps(record["AvailabilityMentor"], record["AvailabilityMentee"])
        meet = {}
        for k,v in overlaps.items():
            if len(v) > 0:
                meet[k] = v
        pair_meetings[record["PairID"]] = {
            "Meetings": get_meetings_for_pair(start_date, end_date, meet, record),
            "MentorEmail": record["MentorEmail"],
            "MenteeEmail": record["MenteeEmail"],
            "MentorName": record["MentorName"],
            "MenteeName": record["MenteeName"]
        }

    return pair_meetings

def schedule_meetings(start_date, end_date):
    return find_meeting_times(start_date, end_date)

def lambda_handler(event, context):
    session_start_date = datetime(2025, 1, 3)
    session_end_date = datetime(2025, 7, 1)

    meetings = schedule_meetings(session_start_date, session_end_date)
    for meeting_id, meeting in meetings.items():
        meetings_table.put_item(Item={"MeetingID": meeting_id, "Meeting": meeting})
