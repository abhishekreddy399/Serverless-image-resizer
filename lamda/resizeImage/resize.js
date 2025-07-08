import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
  import sharp from "sharp";
  import { PassThrough } from "stream";
  
  // Create S3 client
  const s3 = new S3Client({ region: "us-east-1" });
  
  export const handler = async (event) => {
    try {
      const params = event.queryStringParameters;
      const srcBucket = 'src-bucket99';
      const destBucket = 'dest-bucket99';
      const key = decodeURIComponent(params.key);
      const width = parseInt(params.width);
      const height = parseInt(params.height);
  
      // Get image from source bucket
      const getCommand = new GetObjectCommand({ Bucket: srcBucket, Key: key });
      const data = await s3.send(getCommand);
      const inputStream = data.Body;
  
      // Resize image using Sharp
      const resizedBuffer = await sharp(await streamToBuffer(inputStream))
        .resize(width, height)
        .jpeg()
        .toBuffer();
  
      const outputKey = `resized-${key}`;
  
      // Upload to destination bucket
      const putCommand = new PutObjectCommand({
        Bucket: destBucket,
        Key: outputKey,
        Body: resizedBuffer,
        ContentType: 'image/jpeg',
      });
  
      await s3.send(putCommand);
  
      const publicUrl = `https://${destBucket}.s3.amazonaws.com/${outputKey}`;
      return {
        statusCode: 200,
        body: publicUrl,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: err.message || 'Something went wrong',
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  };
  
  function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }
  
