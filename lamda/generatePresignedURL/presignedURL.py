import boto3
import json
import urllib.parse

s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        print("Event:", json.dumps(event))

        if 'queryStringParameters' not in event or event['queryStringParameters'] is None:
            return {
                'statusCode': 400,
                'body': json.dumps({"error": "Missing query parameters"}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }

        key = urllib.parse.unquote(event['queryStringParameters']['key'])

        upload_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': 'src-bucket99',
                'Key': key,
                'ContentType': 'image/jpeg'
            },
            ExpiresIn=300
        )

        return {
            'statusCode': 200,
            'body': json.dumps({ "uploadUrl": upload_url }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({ "error": str(e) }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
