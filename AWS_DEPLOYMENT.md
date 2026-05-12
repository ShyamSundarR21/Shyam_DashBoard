# DineWave — AWS Deployment Guide

## Architecture Overview

```
ESP32-WROOM-32
     │  (MQTT over TLS)
     ▼
AWS IoT Core  ──(Rule Engine)──▶  Lambda (sensorProcessor.js)
                                        │
                              ┌─────────▼──────────┐
                              │   DynamoDB Tables   │
                              │  • waste-entries    │
                              │  • sensor-readings  │
                              │  • immutable-ledger │
                              │  • alerts           │
                              └─────────┬──────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   API Gateway (HTTP)│
                              └─────────┬──────────┘
                                        │
                              ┌─────────▼──────────┐
                              │  EC2 / ECS Fargate  │
                              │  (Node.js Backend)  │
                              └─────────┬──────────┘
                                        │
                              ┌─────────▼──────────┐
                              │  S3 + CloudFront    │
                              │  (Frontend Static)  │
                              └────────────────────┘
```

---

## STEP 1 — Prerequisites

Install these tools locally:

```bash
# AWS CLI
winget install Amazon.AWSCLI

# Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output (json)

# Node.js 20+
winget install OpenJS.NodeJS.LTS

# Docker Desktop
winget install Docker.DockerDesktop
```

---

## STEP 2 — Create DynamoDB Tables

Run this once to create all 4 tables:

```bash
# Waste Entries Table
aws dynamodb create-table \
  --table-name dinewave-waste-entries \
  --attribute-definitions \
    AttributeName=stationId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=stationId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Sensor Readings Table
aws dynamodb create-table \
  --table-name dinewave-sensor-readings \
  --attribute-definitions \
    AttributeName=stationId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=stationId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Immutable Ledger Table
aws dynamodb create-table \
  --table-name dinewave-immutable-ledger \
  --attribute-definitions \
    AttributeName=stationId,AttributeType=S \
    AttributeName=blockNumber,AttributeType=N \
  --key-schema \
    AttributeName=stationId,KeyType=HASH \
    AttributeName=blockNumber,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Alerts Table
aws dynamodb create-table \
  --table-name dinewave-alerts \
  --attribute-definitions \
    AttributeName=alertId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=alertId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

---

## STEP 3 — AWS IoT Core Setup

### 3a. Create IoT Thing (represents your ESP32)

```bash
aws iot create-thing --thing-name "DineWave-Station-001"
```

### 3b. Create Certificate & Keys

```bash
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile "device.crt" \
  --public-key-outfile "device.pub" \
  --private-key-outfile "device.key"

# Note the certificateArn from output
```

### 3c. Create & Attach IoT Policy

```bash
aws iot create-policy \
  --policy-name DineWavePolicy \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Action":["iot:Connect","iot:Publish","iot:Subscribe","iot:Receive"],
      "Resource":"arn:aws:iot:us-east-1:*:*"
    }]
  }'

# Attach policy to certificate (replace CERT_ID)
aws iot attach-policy \
  --policy-name DineWavePolicy \
  --target "arn:aws:iot:us-east-1:YOUR_ACCOUNT:cert/CERT_ID"
```

### 3d. Get Your IoT Endpoint

```bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS
# Copy the endpointAddress → set as IOT_ENDPOINT in .env
```

---

## STEP 4 — Deploy Lambda Function

### 4a. Create IAM Role for Lambda

```bash
aws iam create-role \
  --role-name DineWaveLambdaRole \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"lambda.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy \
  --role-name DineWaveLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy \
  --role-name DineWaveLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### 4b. Package & Deploy Lambda

```bash
cd lambda
npm init -y
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid

# Zip the function
powershell Compress-Archive -Path * -DestinationPath ../dinewave-lambda.zip

# Deploy
aws lambda create-function \
  --function-name DineWaveSensorProcessor \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/DineWaveLambdaRole \
  --handler sensorProcessor.handler \
  --zip-file fileb://../dinewave-lambda.zip \
  --timeout 30 \
  --environment Variables="{AWS_REGION=us-east-1}"
```

### 4c. Create IoT Rule → Lambda Trigger

```bash
aws iot create-topic-rule \
  --rule-name DineWaveWasteRule \
  --topic-rule-payload '{
    "sql": "SELECT *, topic() AS topic FROM '\''dinewave/#'\''",
    "actions": [{
      "lambda": {
        "functionArn": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:DineWaveSensorProcessor"
      }
    }]
  }'

# Grant IoT permission to invoke Lambda
aws lambda add-permission \
  --function-name DineWaveSensorProcessor \
  --statement-id iot-invoke \
  --action lambda:InvokeFunction \
  --principal iot.amazonaws.com
```

---

## STEP 5 — Deploy Backend to EC2

### 5a. Launch EC2 Instance

```bash
# Create security group
aws ec2 create-security-group \
  --group-name DineWaveSG \
  --description "DineWave Backend"

aws ec2 authorize-security-group-ingress \
  --group-name DineWaveSG \
  --protocol tcp --port 3000 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name DineWaveSG \
  --protocol tcp --port 8080 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name DineWaveSG \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

# Launch t3.small instance (Amazon Linux 2023)
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.small \
  --key-name YOUR_KEY_PAIR \
  --security-groups DineWaveSG \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DineWave-Backend}]'
```

### 5b. SSH & Deploy

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Install Node.js & Docker
sudo dnf install -y nodejs npm docker git
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Clone/upload your project
git clone YOUR_REPO_URL /home/ec2-user/dinewave
cd /home/ec2-user/dinewave

# Create .env file
cp .env.example .env
nano .env   # fill in your AWS credentials + IoT endpoint

# Install & start
npm install
npm start

# OR use Docker
docker build -t dinewave .
docker run -d -p 3000:3000 -p 8080:8080 --env-file .env dinewave
```

### 5c. Keep Running with PM2

```bash
npm install -g pm2
pm2 start backend/server.js --name dinewave
pm2 startup
pm2 save
```

---

## STEP 6 — Deploy Frontend to S3 + CloudFront

```bash
# Create S3 bucket for frontend
aws s3 mb s3://dinewave-dashboard-frontend --region us-east-1

aws s3 website s3://dinewave-dashboard-frontend \
  --index-document index.html \
  --error-document index.html

# Upload frontend files
aws s3 sync ./frontend s3://dinewave-dashboard-frontend --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name dinewave-dashboard-frontend.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

---

## STEP 7 — (Optional) ECS Fargate Deployment

For production-grade containerized deployment:

```bash
# Push Docker image to ECR
aws ecr create-repository --repository-name dinewave-backend

aws ecr get-login-password | docker login \
  --username AWS \
  --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag dinewave:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dinewave-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dinewave-backend:latest

# Create ECS Cluster
aws ecs create-cluster --cluster-name dinewave-cluster

# Create task definition and service (use AWS Console or CDK for easier setup)
```

---

## STEP 8 — ESP32 Arduino Code Snippet

Flash this on your ESP32-WROOM-32:

```cpp
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <HX711.h>           // Load Cell
#include <MFRC522.h>         // RFID
#include <NewPing.h>         // Ultrasonic

// WiFi & MQTT
const char* ssid     = "YOUR_WIFI";
const char* password = "YOUR_PASS";
const char* mqtt_server = "YOUR_IOT_ENDPOINT";

// Pin config
#define RFID_SS_PIN  5
#define RFID_RST_PIN 22
#define LC_DOUT_PIN  34
#define LC_SCK_PIN   33
#define US_TRIG_PIN  26
#define US_ECHO_PIN  25
#define UV_PIN       18
#define MIST_PIN     19

MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
HX711   scale;
NewPing sonar(US_TRIG_PIN, US_ECHO_PIN, 200);

WiFiClientSecure wifiClient;
PubSubClient     client(wifiClient);

void publishSensorData() {
  float weightKg  = scale.get_units(5) / 1000.0;
  int   distCm    = sonar.ping_cm();
  int   binPct    = max(0, min(100, (int)((60 - distCm) / 60.0 * 100)));

  String payload = "{";
  payload += "\"stationId\":\"STATION-001\",";
  payload += "\"loadCell\":{\"weightKg\":" + String(weightKg,2) + ",\"weightGrams\":" + String(weightKg*1000,0) + "},";
  payload += "\"ultrasonic\":{\"distanceCm\":" + String(distCm) + ",\"binCapacityPercent\":" + String(binPct) + "},";
  payload += "\"rfid\":{\"wasteType\":\"FOOD\",\"tagId\":\"TAG-001\"}";
  payload += "}";

  client.publish("dinewave/waste", payload.c_str());
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) delay(500);
  // Load certificates from SPIFFS
  // wifiClient.setCACert(ca_cert);
  // wifiClient.setCertificate(client_cert);
  // wifiClient.setPrivateKey(client_key);
  client.setServer(mqtt_server, 8883);
  scale.begin(LC_DOUT_PIN, LC_SCK_PIN);
  scale.set_scale(2280.0);
  SPI.begin(); rfid.PCD_Init();
  pinMode(UV_PIN, OUTPUT);
  pinMode(MIST_PIN, OUTPUT);
}

void loop() {
  if (!client.connected()) {
    client.connect("ESP32-DineWave");
    client.subscribe("dinewave/uvmist");
  }
  client.loop();
  publishSensorData();
  delay(5000);
}
```

---

## Cost Estimate (AWS Free Tier Eligible)

| Service | Usage | Monthly Cost |
|---------|-------|-------------|
| DynamoDB | On-demand, <25GB | ~$0–5 |
| Lambda | <1M requests | Free tier |
| IoT Core | <500K messages | ~$1 |
| EC2 t3.small | Always-on | ~$15 |
| S3 + CloudFront | Static hosting | ~$1 |
| **Total** | | **~$17–22/mo** |

---

## Quick Start (Local Dev)

```bash
cd C:\Users\ragus\Shyam-Dashboard
npm install
copy .env.example .env
# Edit .env with your AWS credentials
npm run dev

# Visit: http://localhost:3000
```
