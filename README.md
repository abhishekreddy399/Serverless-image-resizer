# 🖼️ Serverless Image Resizer with AWS Lambda, S3, and API Gateway

This is a **fully serverless image resizer application** built with AWS Lambda, API Gateway, and S3. Users can upload an image from the frontend, which is resized using a Lambda function and made available via a downloadable URL.

---

## 🚀 Features

- Upload images securely using **pre-signed URLs**
- Automatically resize images on upload using **Sharp**
- Store resized images in a separate S3 bucket
- Return the resized image URL to the frontend
- Fully serverless architecture — no backend servers!

---

## 🧾 Project Structure
├── frontend/
│ ├── index.html
│ ├── index.css
│ └── index.js
│
├── lambda/
│ ├── generatePresignedURL/
│ │ ├── presignedURL.js
│ │ └── package.json
│ └── resizeImage/
│ ├── resize.js
│ ├── package.json
│ └── Dockerfile
│
├── README.md
└── .gitignore


## 🧰 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: AWS Lambda (Node.js)
- **Image Processing**: Sharp (via Docker)
- **Storage**: Amazon S3
- **API**: AWS API Gateway

## 🛠️ Setup Instructions

Lambda Function 1: `generatePresignedURL`

- Node.js Lambda that returns a pre-signed S3 upload URL
- Defined in: `lambda/generatePresignedURL/index.js`
- Dependencies managed via `package.json`

Lambda Function 2: `resizeImage`

- Triggered on S3 upload (src-bucket)
- Uses the `sharp` library to resize the image
- Deployed using Docker (for Amazon Linux compatibility)
- Files: `index.js`, `package.json`, `Dockerfile`

---

🐳 Docker Setup for Sharp in Lambda

The `resizeImage` Lambda uses native Node modules, so it must be built for **Amazon Linux 2**. Here's how to build the deployment package:

### 🛠️ Build Instructions (from `lambda/resizeImage/` folder):

```bash
docker run -it --rm -v "$PWD":/var/task amazonlinux:2 bash

# Inside container:
yum install -y gcc-c++ make curl unzip
curl -sL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs
npm install sharp
exit
zip -r resizeImage.zip index.js node_modules/
```

Upload to AWS Lambda:
Go to AWS Console → Lambda → resizeImage
Upload resizeImage.zip and save


🌐 How It Works

-Frontend calls an API to get a pre-signed S3 URL
-User uploads an image directly to S3 using that URL
-Upload triggers the resize Lambda
-Lambda resizes the image using sharp and saves it to a second bucket
-Frontend gets the URL of the resized image to display or download





