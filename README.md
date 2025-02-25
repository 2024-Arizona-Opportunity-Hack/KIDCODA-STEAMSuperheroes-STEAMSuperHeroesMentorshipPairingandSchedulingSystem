# 2024_fall Hackathon Project: **STEAM SuperHeroes Mentorship Matching and Scheduling System**

## Quick Links
- [Hackathon Details](https://www.ohack.dev/hack/2024_fall)
- [Team Slack Channel](https://opportunity-hack.slack.com/app_redirect?channel=team_kidcoda)
- [Nonprofit Partner](https://ohack.dev/nonprofit/Rl2kkn5VRzydq9gE2DjX)
- [Problem Statement](https://ohack.dev/project/KNcxMWT2sfZWxGvcyYe3)

## Team "KIDCODA"
- Rohit Khoja ([GitHub](https://github.com/rohitkhoja))
- Pratyush Kerhalkar ([GitHub](https://github.com/k-pratyush))
- Hari Prakash Vel Murugan ([GitHub](https://github.com/hariprakash619))
- Ramyalakshmi ([GitHub](https://github.com/s-ramyalakshmi))
- Abhinav PY ([GitHub](https://github.com/abhinavpy))

## Project Overview
Our project provides an automated system for matching mentors and mentees based on several customizable criteria such as location, age, availability, and personal preferences. The system is designed for **STEAM SuperHeroes**, which aims to support STEAM (Science, Technology, Engineering, Art, and Math) education through mentorship programs. This tool ensures seamless mentor-mentee matching and schedules meetings according to their common availability.

**Key Features:**
- **Automated Matching**: Match mentors with mentees based on factors like geographic proximity, ethnicity, gender preferences, and mentorship goals.
- **Scheduling System**: Create automated schedules for meetings, notify participants, and track meeting completion.

## Problem Statement
STEAM SuperHeroes is launching a mentoring program in 2025 and needs a system to automate mentor-mentee pairing and meeting scheduling to minimize manual work and errors. The matching system will pair mentors and mentees based on shared criteria and automatically suggest meeting times based on their availability.

For more detailed requirements, refer to the [STEAM SuperHeroes Mentor Program Requirements](https://steamsuperheroes.org/).

## Tech Stack
- **Frontend**: React
- **Backend**: Python, FastAPI
- **Database**: MongoDB
<!-- - **APIs**:  -->

## Architecture

![Architecture Diagram](https://github.com/2024-Arizona-Opportunity-Hack/KIDCODA-STEAMSuperheroes-STEAMSuperHeroesMentorshipPairingandSchedulingSystem/blob/main/architecture.png?raw=true)

## Getting Started

### Prerequisites
- VM (EC2 or equialent), capable of running docker containers
- SMTP server

### Setup Instructions

1. Run `cp .env-example .env` - and add/modify required credentials
2. Run `docker compose up --build`
