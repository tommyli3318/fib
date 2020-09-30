import json
import boto3
from datetime import datetime as dt

# setting up client for dynamodb
table_name = 'gsa-fibonacci-table'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

def lambda_handler(message, context):
    
    sum = message['firstVal'] + message['secondVal']
    sequence_label = message['sequenceLabel']
    
    response = table.put_item(
        Item = {
            'fib_value': sum,
            'sequence_label': sequence_label
        }
    )
    
    return response

