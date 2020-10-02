# Lambda A: 
# read DB to avoid used names
# read S3 to get first unused name, then return it to step function

import json
import boto3

def lambda_handler(event, context):
    s3 = boto3.resource('s3')
    obj = s3.Object('gsa-fibonacci-s3-bucket', 'names.txt')
    body = obj.get()['Body'].read().decode("utf-8")
    
    names = body.splitlines()
    
    # setting up client for dynamodb
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('gsa-fibonacci-table')
    
    for name in names:
        response = table.get_item(
            Key={
                'sequence_label': name
            }
        )
        
        # skip already used names
        if not response.get("Item"):
            return {
                'statusCode': 200,
                'sequenceLabel': name
            }
    
    # reached the end of file, all names were used
    return {
        'statusCode': 200,
        'sequenceLabel': None
    }
