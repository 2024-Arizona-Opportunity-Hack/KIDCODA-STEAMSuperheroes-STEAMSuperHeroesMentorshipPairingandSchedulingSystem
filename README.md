# 2024_fall Hackathon Project

## Quick Links
- [Hackathon Details](https://www.ohack.dev/hack/2024_fall)
- [Team Slack Channel](https://opportunity-hack.slack.com/app_redirect?channel=team_kidcoda)
- [Nonprofit Partner](https://ohack.dev/nonprofit/Rl2kkn5VRzydq9gE2DjX)
- [Problem Statement](https://ohack.dev/project/KNcxMWT2sfZWxGvcyYe3)

## Creator
@Rohit Khoja (on Slack)

## Team "KIDCODA"
- Rohit Khoja (https://github.com/rohitkhoja)
- Pratyush Kerhalkar (https://github.com/k-pratyush)
- Hari Prakash Vel Murugan (https://github.com/hariprakash619)
- Ramyalakshmi (https://github.com/s-ramyalakshmi)
- Abhinav PY (https://github.com/abhinavpy)

## Project Overview
Our project aims to improve efficiency for STEAM Superheroes by automating mentor-mentee matching and scheduling meetings based on common availability times.

## Tech Stack
- Frontend: HTML, CSS
- Backend: Python, Flask, AWS Lambda, AWS S3, AWS IAM
- Database: AWS DynamoDB
- APIs: AWS SES


## Getting Started
#### To setup and run the project:
The following AWS lambda functions need to be created:
- ProcessParticipantCSV - app/import_data.py
- MatchMentorMentees - app/batch_and_parallel_best_match.py
- CreateMeetingSchedules - app/schedule.py

The following S3 bucket needs to be created:
- steam-csv-file-upload

The following tables are required in DynamoDB:
- Meetings
- Mentees
- Mentors
- Pairings
- Users

The following IAMs need to be added and the lambda functions should be granted with:
- DynamoDB
- AWS SES

## Architecture
![alt text](https://github.com/2024-Arizona-Opportunity-Hack/KIDCODA-STEAMSuperheroes-STEAMSuperHeroesMentorshipPairingandSchedulingSystem/blob/main/architecture.png?raw=true)
