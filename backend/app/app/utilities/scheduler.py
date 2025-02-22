from datetime import datetime, timedelta
from app.model_types.enums import TimeSlot
from app.models.pairing import Match
from pymongo import MongoClient
from collections import defaultdict, deque

def get_common_time_slots(mentor_availability, mentee_availability):
    # Since availability is now a list of TimeSlot enums,
    # treat any TimeSlot that appears in both lists as available.
    return list(set(mentor_availability) & set(mentee_availability))

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

def schedule_meetings(matches):
    adj = defaultdict(list)
    U = set()
    V = set()
    scheduled_matches = []

    for match in matches:
        common_slots = get_common_time_slots(match.mentor_availability, match.mentee_availability)
        if not common_slots:
            continue

        # For each common slot, add an edge in the bipartite graph
        for slot in common_slots:
            adj[match.mentor_email].append((match.mentee_email, slot))
            U.add(match.mentor_email)
            V.add((match.mentee_email, slot))

    pair_u, pair_v = hopcroft_karp(adj, U, V)

    for u in pair_u:
        if pair_u[u] != 0:
            mentee_email, slot = pair_u[u]
            # Find the original match object
            match = next((m for m in matches if m.mentor_email == u and m.mentee_email == mentee_email), None)
            if match:
                match.meeting_timeslot = slot  # Update the meeting_timeslot
                scheduled_matches.append(match)

    return scheduled_matches

