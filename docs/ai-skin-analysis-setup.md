# AI Skin Analysis Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the AI skin analysis feature with your chosen ML provider.

---

## Option 1: AWS Rekognition Custom Labels (Recommended)

### Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- Training dataset of labeled facial images

### Step 1: Prepare Training Data

1. **Collect Images** (minimum 1000):
   - Diverse skin types and tones
   - Various lighting conditions
   - Different angles and expressions
   
2. **Label Images**:
   ```json
   {
     "source-ref": "s3://bucket/image.jpg",
     "skin-type": "combination",
     "skin-tone": "#F5D0A9",
     "acne": {
       "bounding-box": {...},
       "severity": "mild"
     }
   }
   ```

3. **Upload to S3**:
   ```bash
   aws s3 sync ./training-data s3://glowverse-training-data/
   ```

### Step 2: Create Custom Labels Project

```bash
# Create project
aws rekognition create-project \
  --project-name glowverse-skin-analysis

# Create dataset
aws rekognition create-dataset \
  --dataset-type TRAIN \
  --dataset-source '{
    "GroundTruthManifest": {
      "S3Object": {
        "Bucket": "glowverse-training-data",
        "Name": "manifest.json"
      }
    }
  }'
```

### Step 3: Train Model

```bash
aws rekognition create-project-version \
  --project-arn "arn:aws:rekognition:us-east-1:ACCOUNT_ID:project/glowverse-skin-analysis/VERSION" \
  --version-name "v1" \
  --output-config '{
    "S3Bucket": "glowverse-models",
    "S3KeyPrefix": "skin-analysis/"
  }'
```

**Training Time**: 2-4 hours

**Cost**: ~$1/hour of training

### Step 4: Deploy Model

```bash
aws rekognition start-project-version \
  --project-version-arn "YOUR_PROJECT_VERSION_ARN" \
  --min-inference-units 1
```

### Step 5: Test Model

```bash
aws rekognition detect-custom-labels \
  --project-version-arn "YOUR_PROJECT_VERSION_ARN" \
  --image '{
    "S3Object": {
      "Bucket": "test-images",
      "Name": "test-face.jpg"
    }
  }'
```

### Step 6: Backend Integration

Install SDK:
```bash
cd backend
npm install @aws-sdk/client-rekognition
```

Create service:
```typescript
// backend/src/services/ai/AWSRekognitionProvider.ts
import { RekognitionClient, DetectCustomLabelsCommand } from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function analyzeSkin(imageBuffer: Buffer) {
  const command = new DetectCustomLabelsCommand({
    ProjectVersionArn: process.env.REKOGNITION_MODEL_ARN,
    Image: { Bytes: imageBuffer },
    MinConfidence: 70,
  });
  
  const response = await client.send(command);
  return transformResponse(response.CustomLabels);
}
```

Environment variables:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
REKOGNITION_MODEL_ARN=arn:aws:rekognition:us-east-1:...
```

---

## Option 2: Google Cloud Vision AI

### Prerequisites

- Google Cloud account
- Service account with Vision AI permissions

### Step 1: Enable APIs

```bash
gcloud services enable vision.googleapis.com
gcloud services enable automl.googleapis.com
```

### Step 2: Create Service Account

```bash
gcloud iam service-accounts create glowverse-vision \
  --display-name="Glowverse Vision AI"

gcloud iam service-accounts keys create credentials.json \
  --iam-account=glowverse-vision@PROJECT_ID.iam.gserviceaccount.com
```

### Step 3: Train Custom Model (AutoML)

1. Go to Google Cloud Console > Vision AI > AutoML
2. Create new dataset
3. Upload labeled images
4. Train model (4-24 hours)
5. Deploy model

### Step 4: Backend Integration

```bash
npm install @google-cloud/vision
```

```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function analyzeSkin(imageBuffer: Buffer) {
  const [result] = await client.annotateImage({
    image: { content: imageBuffer },
    features: [
      { type: 'LABEL_DETECTION' },
      { type: 'FACE_DETECTION' },
    ],
  });
  
  return transformResponse(result);
}
```

---

## Option 3: Third-Party API (Face++)

### Step 1: Sign Up

1. Visit https://www.faceplusplus.com/
2. Create account
3. Get API key and secret

### Step 2: Test API

```bash
curl -X POST "https://api-us.faceplusplus.com/facepp/v3/detect" \
  -F "api_key=YOUR_API_KEY" \
  -F "api_secret=YOUR_API_SECRET" \
  -F "image_file=@test.jpg" \
  -F "return_attributes=skinstatus"
```

### Step 3: Backend Integration

```typescript
import axios from 'axios';
import FormData from 'form-data';

export async function analyzeSkin(imageBuffer: Buffer) {
  const form = new FormData();
  form.append('api_key', process.env.FACEPP_API_KEY);
  form.append('api_secret', process.env.FACEPP_API_SECRET);
  form.append('image_file', imageBuffer, 'image.jpg');
  form.append('return_attributes', 'skinstatus');
  
  const response = await axios.post(
    'https://api-us.faceplusplus.com/facepp/v3/detect',
    form,
    { headers: form.getHeaders() }
  );
  
  return transformResponse(response.data);
}
```

---

## Database Setup

### Create Tables

```sql
-- Skin analyses table
CREATE TABLE skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  processed_image_url TEXT,
  skin_type VARCHAR(20),
  skin_type_confidence DECIMAL(3,2),
  skin_tone VARCHAR(10),
  concerns JSONB,
  recommendations JSONB,
  overall_confidence DECIMAL(3,2),
  processing_time_ms INTEGER,
  ml_provider VARCHAR(20),
  model_version VARCHAR(20),
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_analyses_user ON skin_analyses(user_id, analyzed_at DESC);
CREATE INDEX idx_analyses_deleted ON skin_analyses(deleted_at);

-- AI consents table
CREATE TABLE ai_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  consented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  policy_version VARCHAR(10)
);

CREATE INDEX idx_consents_user ON ai_consents(user_id);
```

---

## Testing

### Test with Sample Images

```bash
# Upload test image
curl -X POST http://localhost:3000/api/v1/ai/skin-analysis \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-face.jpg"

# Check response
{
  "success": true,
  "data": {
    "analysisId": "analysis_123",
    "skinType": "combination",
    "concerns": [...],
    "recommendations": [...]
  }
}
```

---

## Monitoring & Optimization

### Cost Tracking

- AWS Rekognition: ~$4/1000 images
- Google Vision: ~$5/1000 images
- Set up billing alerts

### Performance Metrics

- Target processing time: < 5 seconds
- Accuracy target: > 85%
- Monitor via CloudWatch/Stackdriver

### Error Handling

- Retry failed analyses (3 attempts)
- Queue for manual review if confidence < 0.7
- Alert on error rate > 5%

---

## Production Checklist

- [ ] ML model trained and deployed
- [ ] Backend API endpoints implemented
- [ ] Database schema created
- [ ] Environment variables configured
- [ ] Image storage (S3/Cloud Storage) set up
- [ ] Consent flow implemented
- [ ] Privacy policy updated
- [ ] Error monitoring configured
- [ ] Cost alerts set up
- [ ] Load testing completed
- [ ] Legal review approved

---

## Support

For issues:
1. Check CloudWatch/Stackdriver logs
2. Verify API credentials
3. Test with sample images
4. Contact ML provider support
