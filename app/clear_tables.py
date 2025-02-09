import csv
import boto3
from botocore.exceptions import ClientError
import io

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')  # Specify your region

mentors_table = dynamodb.Table('Mentors')
mentees_table = dynamodb.Table('Mentees')

def clear_table(table):
    scan = table.scan()
    with table.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(
                Key={
                    'PK': each['PK'],
                    'SK': each['SK']  
                }
            )
    print(f"Cleared all data from table: {table.name}")

def lambda_handler(event, context):
    clear_table(mentors_table)
    clear_table(mentees_table)
