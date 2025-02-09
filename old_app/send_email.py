import boto3
import os

# Initialize boto3 clients
dynamodb = boto3.client('dynamodb')
ses = boto3.client('ses')

def convert_to_12_hour_format(hour):
    """Convert 24-hour format to 12-hour format with AM/PM."""
    if hour == 0:
        return "12 AM"
    elif hour == 12:
        return "12 PM"
    elif hour > 12:
        return f"{hour - 12} PM"
    else:
        return f"{hour} AM"

def lambda_handler(event, context):
    # Extract the keys (MenteeName, MentorName) from the event
    mentee_name = event['MenteeName']['S']
    mentor_name = event['MentorName']['S']
    mentee_email = event['MenteeEmail']['S']
    mentor_email = event['MentorEmail']['S']
    
    # Retrieve meetings data from DynamoDB
    meetings = event['Meetings']['L']
    
    # Format the meeting details
    mentee_meeting_message = f'Hello {mentee_name},\n\n'
    mentor_meeting_message = f'Hello {mentor_name},\n\n'
    
    mentee_meeting_message += f'We have scheduled meetings with your mentor, {mentor_name}, as follows:\n\n'
    mentor_meeting_message += f'We have scheduled meetings with your mentee, {mentee_name}, as follows:\n\n'
    
    for meeting in meetings:
        meeting_date = meeting['M']['date']['S']
        day = meeting['M']['day']['S']
        
        mentee_meeting_message += f'Meeting Date: {meeting_date} ({day})\n'
        mentor_meeting_message += f'Meeting Date: {meeting_date} ({day})\n'
        
        # Iterate over each time slot for meetings
        for time_slot in meeting['M']['Availability']['L']:
            start_time = convert_to_12_hour_format(int(time_slot['L'][0]['N']))
            end_time = convert_to_12_hour_format(int(time_slot['L'][1]['N']))
            mentee_meeting_message += f'- Scheduled Time: {start_time} to {end_time}\n'
            mentor_meeting_message += f'- Scheduled Time: {start_time} to {end_time}\n'
        
        mentee_meeting_message += '\n'
        mentor_meeting_message += '\n'
    
    # Add Zoom link to both messages
    zoom_link = "Join the meeting using this URL: https://us04web.zoom.us/j/77216192184?pwd=kmXYauQptmbquw1ansYd1BgRr8Qaki."
    mentee_meeting_message += zoom_link + '\n'
    mentor_meeting_message += zoom_link + '\n'
    
    # Set up the email subject and body for mentee
    mentee_subject = f'Meeting Scheduled with Mentor {mentor_name}'
    mentee_body_text = mentee_meeting_message + '\n\nBest Regards,\nSTEAM'

    # Set up the SES email parameters for mentee
    mentee_email_params = {
        'Source': 'hariprakash.619@gmail.com',  # Replace with your verified email in SES
        'Destination': {
            'ToAddresses': ['hariprakash.619@gmail.com']  # Mentee email
        },
        'Message': {
            'Subject': {
                'Data': mentee_subject
            },
            'Body': {
                'Text': {
                    'Data': mentee_body_text
                }
            }
        }
    }
    
    # Set up the email subject and body for mentor
    mentor_subject = f'Meeting Scheduled with Mentee {mentee_name}'
    mentor_body_text = mentor_meeting_message + '\n\nBest Regards,\nSTEAM'

    # Set up the SES email parameters for mentor
    mentor_email_params = {
        'Source': 'hariprakash.619@gmail.com',  # Replace with your verified email in SES
        'Destination': {
            'ToAddresses': ['hariprakash.619@gmail.com']  # Mentor email
        },
        'Message': {
            'Subject': {
                'Data': mentor_subject
            },
            'Body': {
                'Text': {
                    'Data': mentor_body_text
                }
            }
        }
    }

    # Send the email using SES for mentee
    try:
        mentee_response = ses.send_email(**mentee_email_params)
        print(f'Mentee Email sent! Message ID: {mentee_response["MessageId"]}')
    except Exception as e:
        print(f'Error sending mentee email: {str(e)}')

    # Send the email using SES for mentor
    try:
        mentor_response = ses.send_email(**mentor_email_params)
        print(f'Mentor Email sent! Message ID: {mentor_response["MessageId"]}')
    except Exception as e:
        print(f'Error sending mentor email: {str(e)}')

    return {
        'statusCode': 200,
        'body': 'Emails sent successfully!'
    }
