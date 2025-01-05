import numpy as np
from haversine import haversine

def calculate_distance(loc1, loc2):
    # Haversine formula to calculate distance in miles
    return haversine(loc1, loc2, unit='mi')

def calculate_score(mentor, mentee):
    # Define weights
    weights = {
        "distance": 2,
        "age": 3,
        "mentoring_type": 2,
        "ethnicity": 1,
        "gender": 1,
        "schedule": 1
    }
    score = 0
    
    # Distance-based score
    distance = calculate_distance(mentor['location'], mentee['location'])
    score += weights["distance"] * (1 if distance <= 60 else 0)
    
    # Age-based score
    score += weights["age"] * (1 if mentor['age'] >= mentee['age'] + 10 else 0)
    
    # Mentoring type compatibility
    if mentor['mentoring_type'] == mentee['mentoring_type']:
        score += weights["mentoring_type"]
    
    # Ethnicity preference
    if mentor['ethnicity'] == mentee['ethnicity']:
        score += weights["ethnicity"]
    
    # Gender preference
    if mentor['gender'] == mentee['gender']:
        score += weights["gender"]
    
    # Schedule compatibility (simplified as boolean overlap check)
    if set(mentor['schedule']) & set(mentee['schedule']):
        score += weights["schedule"]
    
    return score

def match_mentors_to_mentees(mentors, mentees):
    n = len(mentors)
    m = len(mentees)
    
    # Compatibility matrix
    scores = np.zeros((n, m))
    for i, mentor in enumerate(mentors):
        for j, mentee in enumerate(mentees):
            scores[i][j] = calculate_score(mentor, mentee)
    
    # Find maximum weight matching
    from scipy.optimize import linear_sum_assignment
    mentor_indices, mentee_indices = linear_sum_assignment(-scores)
    
    matches = []
    for i, j in zip(mentor_indices, mentee_indices):
        matches.append((mentors[i], mentees[j], scores[i][j]))
    
    return matches

mentors = [
    {"age": 40, "location": (40.7128, -74.0060), "mentoring_type": "career", 
     "ethnicity": "A", "gender": "M", "schedule": ["Mon", "Wed"]},
    {"age": 35, "location": (34.0522, -118.2437), "mentoring_type": "technical", 
     "ethnicity": "B", "gender": "F", "schedule": ["Tue", "Thu"]}
]

mentees = [
    {"age": 20, "location": (40.7306, -73.9352), "mentoring_type": "career", 
     "ethnicity": "A", "gender": "M", "schedule": ["Mon", "Wed"]},
    {"age": 22, "location": (34.0522, -118.2437), "mentoring_type": "technical", 
     "ethnicity": "B", "gender": "F", "schedule": ["Tue", "Thu"]},
    {"age": 25, "location": (36.7783, -119.4179), "mentoring_type": "career", 
     "ethnicity": "A", "gender": "F", "schedule": ["Fri"]}
]

matches = match_mentors_to_mentees(mentors, mentees)
for mentor, mentee, score in matches:
    print(f"Mentor: {mentor}, Mentee: {mentee}, Score: {score}")
