from datetime import datetime, timedelta
from app.model_types.enums import TimeSlot
from models.matchings import Match
from pymongo import MongoClient
from collections import defaultdict, deque

client = MongoClient('mongodb://localhost:27017/')
db = client['mentorship']
matches_collection = db['matches']
users_collection = db['users']

def get_common_time_slots(mentor_availability, mentee_availability):
    common_slots = []
    for slot in TimeSlot:
        if mentor_availability.get(slot.value, False) and mentee_availability.get(slot.value, False):
            common_slots.append(slot)
    return common_slots

def bfs(pair_u, pair_v, dist, adj):
    queue = deque()
    for u in pair_u:
        if pair_u[u] == 0:
            dist[u] = 0
            queue.append(u)
        else:
            dist[u] = float('inf')
    dist[0] = float('inf')
    while queue:
        u = queue.popleft()
        if dist[u] < dist[0]:
            for v in adj[u]:
                if dist[pair_v[v]] == float('inf'):
                    dist[pair_v[v]] = dist[u] + 1
                    queue.append(pair_v[v])
    return dist[0] != float('inf')

def dfs(u, pair_u, pair_v, dist, adj):
    if u != 0:
        for v in adj[u]:
            if dist[pair_v[v]] == dist[u] + 1:
                if dfs(pair_v[v], pair_u, pair_v, dist, adj):
                    pair_v[v] = u
                    pair_u[u] = v
                    return True
        dist[u] = float('inf')
        return False
    return True

def hopcroft_karp(adj, U, V):
    pair_u = {u: 0 for u in U}
    pair_v = {v: 0 for v in V}
    dist = {}
    matching = 0
    while bfs(pair_u, pair_v, dist, adj):
        for u in U:
            if pair_u[u] == 0:
                if dfs(u, pair_u, pair_v, dist, adj):
                    matching += 1
    return pair_u, pair_v

def schedule_meetings(frequency, start_date, end_date):
    matches = matches_collection.find({"IsActive": True})
    scheduled_meetings = []

    adj = defaultdict(list)
    U = set()
    V = set()

    for match in matches:
        mentor = users_collection.find_one({"email": match["mentor_email"]})
        mentee = users_collection.find_one({"email": match["mentee_email"]})

        mentor_availability = mentor["availability"]
        mentee_availability = mentee["availability"]

        common_slots = get_common_time_slots(mentor_availability, mentee_availability)
        if not common_slots:
            continue

        for slot in common_slots:
            adj[match["mentor_email"]].append((match["mentee_email"], slot))
            U.add(match["mentor_email"])
            V.add((match["mentee_email"], slot))

    pair_u, pair_v = hopcroft_karp(adj, U, V)

    for u in pair_u:
        if pair_u[u] != 0:
            mentee_email, slot = pair_u[u]
            current_date = start_date
            delta = timedelta(days=7) if frequency == "weekly" else timedelta(days=14) if frequency == "biweekly" else timedelta(days=30)
            while current_date <= end_date:
                scheduled_meetings.append({
                    "mentor_email": u,
                    "mentee_email": mentee_email,
                    "session_name": match["session_name"],
                    "meeting_time": current_date.strftime("%Y-%m-%d") + " " + slot.value
                })
                current_date += delta

    return scheduled_meetings

if __name__ == "__main__":
    start_date = datetime.now()
    end_date = start_date + timedelta(days=90)  # Schedule for the next 3 months
    frequency = "weekly"  # Can be "weekly", "biweekly", or "monthly"
    meetings = schedule_meetings(frequency, start_date, end_date)
    for meeting in meetings:
        print(meeting)