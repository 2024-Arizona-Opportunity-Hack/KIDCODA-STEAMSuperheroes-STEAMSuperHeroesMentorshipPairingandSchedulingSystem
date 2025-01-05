import random

# Generate synthetic data
def generate_mentor_mentee_pairs(n_pairs):
    pairs = []
    for _ in range(n_pairs):
        mentor = {
            "age": random.randint(30, 60),
            "location": (random.uniform(-90, 90), random.uniform(-180, 180)),
            "mentoring_type": random.choice(["career", "technical"]),
            "ethnicity": random.choice(["A", "B", "C"]),
            "gender": random.choice(["M", "F"]),
            "schedule": random.sample(["Mon", "Tue", "Wed", "Thu", "Fri"], 3)
        }
        mentee = {
            "age": random.randint(20, 29),
            "location": (random.uniform(-90, 90), random.uniform(-180, 180)),
            "mentoring_type": random.choice(["career", "technical"]),
            "ethnicity": random.choice(["A", "B", "C"]),
            "gender": random.choice(["M", "F"]),
            "schedule": random.sample(["Mon", "Tue", "Wed", "Thu", "Fri"], 3)
        }
        # Assign synthetic compatibility score
        compatibility = random.uniform(0, 1)  # Score between 0 and 1
        pairs.append((mentor, mentee, compatibility))
    return pairs

pairs = generate_mentor_mentee_pairs(1000)
print(pairs[:5])  # Example pairs
