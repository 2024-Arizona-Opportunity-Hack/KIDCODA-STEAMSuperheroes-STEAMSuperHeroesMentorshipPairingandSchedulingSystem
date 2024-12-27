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
- **Frontend**: Flask, HTML, CSS
- **Backend**: Python, Flask, AWS Lambda, AWS S3, AWS IAM
- **Database**: AWS DynamoDB
- **APIs**: AWS SES (for email notifications)

## Architecture

![Architecture Diagram](https://github.com/2024-Arizona-Opportunity-Hack/KIDCODA-STEAMSuperheroes-STEAMSuperHeroesMentorshipPairingandSchedulingSystem/blob/main/architecture.png?raw=true)

## Getting Started

### Prerequisites
- AWS account for setting up Lambda, S3, DynamoDB, and SES.
- Basic knowledge of Flask and AWS services.

### Setup Instructions

1. **AWS Lambda Functions**:
   - `ProcessParticipantCSV`: Reads and imports participant data from a CSV file.
   - `MatchMentorMentees`: Matches participants using defined rules.
   - `CreateMeetingSchedules`: Automates meeting schedules between mentors and mentees.

2. **S3 Bucket**:  
   Create a bucket for CSV uploads (`steam-csv-file-upload`).

3. **DynamoDB Tables**:  
   Create the following tables:
   - `Meetings`
   - `Mentees`
   - `Mentors`
   - `Pairings`
   - `Users`

4. **IAM Permissions**:
   Ensure that the Lambda functions have permissions to interact with:
   - DynamoDB
   - AWS SES (for sending notifications)


## Future Scope

As we move forward, there are several enhancements planned for the system to increase its functionality, scalability, and user experience. Below are the key areas of future development:

### 1. User-Based Access to the Frontend Dashboard
To improve the security and personalization of the dashboard, we will implement user-based access control. This will allow different types of users (mentors, mentees, admins) to log in and see tailored views and functionality.

### 2. Edit Access for Admins to Manage Mentor-Mentee Pairs/Meetings
To ensure flexibility and allow manual adjustments, we will build a feature that grants admin-level users the ability to manage mentor-mentee pairs and their associated meetings directly from the dashboard.

### 3. Generate Reports and Analytics on Uploaded CSV Data
The system will generate reports and analytics to provide insights into the mentoring program's success and areas for improvement. This feature will be particularly useful for admins, stakeholders, and nonprofit organizations looking to evaluate the program's performance.

### 4. Clustering "Other" Categories into Fixed Subsets
Many participants may select "Other" when specifying their mentoring preferences. To improve the pairing algorithm and ensure these users are accurately matched, we will implement clustering to group "Other" responses into meaningful subsets.

### 5. Improve Matching and Scheduling Algorithm for Scalability
As the mentoring program grows, the system will need to scale to handle thousands of mentor-mentee pairs while ensuring quick and accurate matching. This requires improvements to the existing algorithm to support scalability, flexibility, and efficiency.
