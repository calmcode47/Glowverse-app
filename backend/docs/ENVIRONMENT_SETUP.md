# Environment Setup Guide

## AWS Infrastructure (Example)

This guide shows how to set up the required AWS infrastructure for the Glowverse backend. Adjust based on your cloud provider (AWS, GCP, Azure, etc.).

---

## Required AWS Resources

### 1. VPC - Virtual Private Cloud

**Purpose:** Network isolation and security

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=glowverse-vpc}]'

# Create public subnets (for load balancer)
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a
  
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b

# Create private subnets (for application)
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.10.0/24 \
  --availability-zone us-east-1a
  
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1b
```

### 2. RDS PostgreSQL - Database

**Staging Configuration:**
- Instance type: `db.t3.medium`
- Storage: 100GB SSD
- Multi-AZ: Disabled
- Backup retention: 7 days

**Production Configuration:**
- Instance type: `db.r5.large`
- Storage: 500GB SSD
- Multi-AZ: Enabled
- Backup retention: 30 days
- Read replicas: 1-2 for scaling

```bash
# Create RDS instance (staging)
aws rds create-db-instance \
  --db-instance-identifier glowverse-staging \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password <strong-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids <sg-id> \
  --db-subnet-group-name <subnet-group> \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00"
```

### 3. ElastiCache Redis - Caching

**Staging Configuration:**
- Node type: `cache.t3.micro`
- Nodes: 1
- Multi-AZ: Disabled

**Production Configuration:**
- Node type: `cache.r5.large`
- Nodes: 2-3
- Multi-AZ: Enabled
- Automatic failover: Enabled

```bash
# Create ElastiCache cluster (staging)
aws elasticache create-cache-cluster \
  --cache-cluster-id glowverse-staging-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name <subnet-group> \
  --security-group-ids <sg-id>
```

### 4. ECS Cluster - Container Orchestration

**Configuration:**
- Launch type: Fargate
- CPU: 1 vCPU (staging), 2 vCPU (production)
- Memory: 2GB (staging), 4GB (production)
- Auto-scaling: Enabled

```bash
# Create ECS cluster
aws ecs create-cluster \
  --cluster-name glowverse-staging \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1 \
    capacityProvider=FARGATE_SPOT,weight=4
```

### 5. ALB - Application Load Balancer

**Configuration:**
- Type: Application
- Scheme: Internet-facing
- IP address type: IPv4
- Listeners: HTTP (80) → redirect to HTTPS, HTTPS (443)

```bash
# Create load balancer
aws elbv2 create-load-balancer \
  --name glowverse-staging-alb \
  --subnets <public-subnet-1> <public-subnet-2> \
  --security-groups <alb-sg> \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4

# Create target group
aws elbv2 create-target-group \
  --name glowverse-staging-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id <vpc-id> \
  --target-type ip \
  --health-check-enabled \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3
```

### 6. ECR - Container Registry

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name glowverse-backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Set lifecycle policy (keep only 10 images)
aws ecr put-lifecycle-policy \
  --repository-name glowverse-backend \
  --lifecycle-policy-text '{
    "rules": [{
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": { "type": "expire" }
    }]
  }'
```

### 7. CloudWatch - Logging and Monitoring

```bash
# Create log group
aws logs create-log-group \
  --log-group-name /ecs/glowverse-backend

# Set retention policy
aws logs put-retention-policy \
  --log-group-name /ecs/glowverse-backend \
  --retention-in-days 30

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name glowverse-high-error-rate \
  --alarm-description "Alert when error rate is high" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=<alb-arn>
```

### 8. Secrets Manager - Secret Storage

```bash
# Store database credentials
aws secretsmanager create-secret \
  --name glowverse/staging/database \
  --secret-string '{
    "username": "postgres",
    "password": "<db-password>",
    "host": "<rds-endpoint>",
    "port": 5432,
    "dbname": "glowverse"
  }'

# Store API keys
aws secretsmanager create-secret \
  --name glowverse/staging/api-keys \
  --secret-string '{
    "jwt_secret": "<jwt-secret>",
    "jwt_refresh_secret": "<jwt-refresh-secret>",
    "cloudinary_api_key": "<cloudinary-key>",
    "cloudinary_api_secret": "<cloudinary-secret>",
    "perfect_corp_api_key": "<perfect-corp-key>",
    "perfect_corp_api_secret": "<perfect-corp-secret>"
  }'
```

---

## GitHub Secrets Required

### Repository Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DOCKER_USERNAME` | Docker Hub username | `glowverse` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxxxx` |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | `https://hooks.slack.com/services/xxx` |
| `SENTRY_AUTH_TOKEN` | Sentry API token | `sntrys_xxxxx` |
| `SENTRY_ORG` | Sentry organization slug | `glowverse` |
| `CODECOV_TOKEN` | Codecov upload token | `xxxxx` |
| `SNYK_TOKEN` | Snyk security scan token | `xxxxx` |

### Staging Environment Secrets

Navigate to: **Settings → Environments → staging → Environment secrets**

| Secret Name | Description |
|------------|-------------|
| `STAGING_AWS_ACCESS_KEY_ID` | AWS access key for staging |
| `STAGING_AWS_SECRET_ACCESS_KEY` | AWS secret key for staging |
| `STAGING_AWS_REGION` | AWS region (e.g., `us-east-1`) |
| `STAGING_DATABASE_URL` | PostgreSQL connection string |
| `STAGING_REDIS_URL` | Redis connection string |

### Production Environment Secrets

Navigate to: **Settings → Environments → production → Environment secrets**

| Secret Name | Description |
|------------|-------------|
| `PRODUCTION_AWS_ACCESS_KEY_ID` | AWS access key for production |
| `PRODUCTION_AWS_SECRET_ACCESS_KEY` | AWS secret key for production |
| `PRODUCTION_AWS_REGION` | AWS region |
| `PRODUCTION_DATABASE_URL` | PostgreSQL connection string |
| `PRODUCTION_REDIS_URL` | Redis connection string |

---

## Environment Variables

### Staging (.env.staging)

```env
# Application
NODE_ENV=staging
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:pass@staging-db.xxxxx.us-east-1.rds.amazonaws.com:5432/glowverse

# Redis
REDIS_URL=redis://staging-redis.xxxxx.cache.amazonaws.com:6379
REDIS_TTL=900

# Authentication
JWT_SECRET=<staging-jwt-secret>
JWT_REFRESH_SECRET=<staging-refresh-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
CLOUDINARY_CLOUD_NAME=glowverse-staging
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# External APIs
PERFECT_CORP_API_KEY=<api-key>
PERFECT_CORP_API_SECRET=<api-secret>
PERFECT_CORP_API_URL=https://api.perfectcorp.com/v1

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=staging
SENTRY_TRACES_SAMPLE_RATE=0.5

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
CORS_ORIGIN=https://staging.glowverse.app

# Features
ENABLE_AR_FEATURES=true
ENABLE_REWARDS=true
```

### Production (.env.production)

```env
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@prod-db.xxxxx.us-east-1.rds.amazonaws.com:5432/glowverse

# Redis
REDIS_URL=redis://prod-redis.xxxxx.cache.amazonaws.com:6379
REDIS_TTL=1800

# Authentication
JWT_SECRET=<production-jwt-secret>
JWT_REFRESH_SECRET=<production-refresh-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
CLOUDINARY_CLOUD_NAME=glowverse-production
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# External APIs
PERFECT_CORP_API_KEY=<api-key>
PERFECT_CORP_API_SECRET=<api-secret>
PERFECT_CORP_API_URL=https://api.perfectcorp.com/v1

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
CORS_ORIGIN=https://glowverse.com,https://www.glowverse.com

# Features
ENABLE_AR_FEATURES=true
ENABLE_REWARDS=true
```

---

## ECS Task Definition

Example task definition for Fargate:

```json
{
  "family": "glowverse-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/glowverse-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3000" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:glowverse/production/database:DatabaseUrl::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:glowverse/production/api-keys:jwt_secret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/glowverse-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

---

## Security Groups

### ALB Security Group

**Inbound Rules:**
- HTTP (80) from 0.0.0.0/0
- HTTPS (443) from 0.0.0.0/0

**Outbound Rules:**
- All traffic to ECS security group

### ECS Security Group

**Inbound Rules:**
- Port 3000 from ALB security group

**Outbound Rules:**
- PostgreSQL (5432) to RDS security group
- Redis (6379) to ElastiCache security group
- HTTPS (443) to 0.0.0.0/0 (for external APIs)

### RDS Security Group

**Inbound Rules:**
- PostgreSQL (5432) from ECS security group

### ElastiCache Security Group

**Inbound Rules:**
- Redis (6379) from ECS security group

---

## Cost Estimation (Monthly)

### Staging Environment

| Resource | Configuration | Estimated Cost |
|----------|--------------|----------------|
| RDS (db.t3.medium) | 100GB storage | ~$70 |
| ElastiCache (cache.t3.micro) | 1 node | ~$15 |
| ECS Fargate | 1 vCPU, 2GB RAM | ~$30 |
| ALB | Standard | ~$20 |
| Data transfer | 100GB/month | ~$10 |
| **Total** | | **~$145/month** |

### Production Environment

| Resource | Configuration | Estimated Cost |
|----------|--------------|----------------|
| RDS (db.r5.large) | 500GB, Multi-AZ | ~$500 |
| ElastiCache (cache.r5.large) | 2 nodes, Multi-AZ | ~$250 |
| ECS Fargate | 2 vCPU, 4GB RAM, 3 tasks | ~$200 |
| ALB | Standard | ~$20 |
| Data transfer | 1TB/month | ~$90 |
| **Total** | | **~$1,060/month** |

---

## Setup Checklist

**Infrastructure:**
- [ ] VPC created with public/private subnets
- [ ] RDS PostgreSQL instance created
- [ ] ElastiCache Redis cluster created
- [ ] ECS cluster created
- [ ] ALB configured with target groups
- [ ] ECR repository created
- [ ] Security groups configured
- [ ] CloudWatch log groups created
- [ ] Secrets Manager secrets created

**GitHub:**
- [ ] Repository secrets configured
- [ ] Staging environment created with secrets
- [ ] Production environment created with secrets
- [ ] Environment protection rules set

**DNS:**
- [ ] Domain registered
- [ ] SSL certificate obtained
- [ ] Route53 records created
- [ ] ALB configured with SSL

**Monitoring:**
- [ ] Sentry project created
- [ ] CloudWatch alarms configured
- [ ] Slack webhook configured
- [ ] PagerDuty integration (optional)

---

## Support Resources

**AWS Documentation:**
- ECS: https://docs.aws.amazon.com/ecs/
- RDS: https://docs.aws.amazon.com/rds/
- ElastiCache: https://docs.aws.amazon.com/elasticache/

**Tools:**
- AWS CLI: https://aws.amazon.com/cli/
- Terraform (IaC): https://www.terraform.io/
- AWS CDK: https://aws.amazon.com/cdk/
