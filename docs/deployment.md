# 🚀 Deployment Guide

Deploy FocusFlow to production using AWS, Docker, and CI/CD.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Setup](#aws-setup)
3. [Environment Configuration](#environment-configuration)
4. [Docker Deployment](#docker-deployment)
5. [CI/CD Setup](#cicd-setup)
6. [Monitoring](#monitoring)
7. [Scaling](#scaling)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS Account with billing enabled
- Domain name (optional but recommended)
- GitHub account (for CI/CD)
- Docker & Docker Compose
- AWS CLI installed and configured
- Terraform (optional, for IaC)

---

## AWS Setup

### 1. Create VPC

```bash
# Using AWS CLI
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Or use the Terraform configuration
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### 2. Create RDS PostgreSQL Instance

```bash
# Production configuration
aws rds create-db-instance \
  --db-instance-identifier focusflow-prod-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --master-username focusflow \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name focusflow-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible false
```

### 3. Create ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id focusflow-prod-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name focusflow-subnet-group \
  --security-group-ids sg-xxxxx
```

### 4. Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name focusflow-production \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
    capacityProvider=FARGATE_SPOT,weight=4
```

### 5. Create Application Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name focusflow-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Database (use RDS endpoint)
DATABASE_URL=postgresql://focusflow:PASSWORD@focusflow-prod.xxxxx.rds.amazonaws.com:5432/focusflow
DATABASE_REPLICA_URL=postgresql://focusflow:PASSWORD@focusflow-replica.xxxxx.rds.amazonaws.com:5432/focusflow

# Redis (use ElastiCache endpoint)
REDIS_URL=redis://focusflow-prod.xxxxx.cache.amazonaws.com:6379

# JWT Secrets (GENERATE NEW SECURE KEYS!)
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)

# API
NODE_ENV=production
API_PORT=4000
API_URL=https://api.focusflow.com
ALLOWED_ORIGINS=https://focusflow.com,https://www.focusflow.com

# Web
NEXT_PUBLIC_API_URL=https://api.focusflow.com/api/v1

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@focusflow.com

# OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=info

# AWS
AWS_REGION=us-east-1
S3_BUCKET=focusflow-uploads-prod
```

### Store Secrets in AWS Secrets Manager

```bash
# Store database password
aws secretsmanager create-secret \
  --name focusflow/prod/database-password \
  --secret-string "YOUR_DB_PASSWORD"

# Store JWT secret
aws secretsmanager create-secret \
  --name focusflow/prod/jwt-secret \
  --secret-string "$(openssl rand -base64 32)"

# Store Redis URL
aws secretsmanager create-secret \
  --name focusflow/prod/redis-url \
  --secret-string "redis://your-redis-endpoint:6379"
```

---

## Docker Deployment

### Build Images

```bash
# Build API
docker build -t focusflow/api:latest \
  -f infrastructure/docker/Dockerfile.api \
  --target production .

# Build Web
docker build -t focusflow/web:latest \
  -f infrastructure/docker/Dockerfile.web \
  --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.focusflow.com/api/v1 .
```

### Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag focusflow/api:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/focusflow/api:latest

docker tag focusflow/web:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/focusflow/web:latest

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/focusflow/api:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/focusflow/web:latest
```

### Create ECS Task Definitions

**API Task Definition** (`task-definition-api.json`):

```json
{
  "family": "focusflow-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/focusflow/api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "API_PORT", "value": "4000" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:focusflow/prod/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:focusflow/prod/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/focusflow-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition-api.json
```

### Create ECS Services

```bash
# API Service
aws ecs create-service \
  --cluster focusflow-production \
  --service-name api \
  --task-definition focusflow-api:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/focusflow-api/xxx,containerName=api,containerPort=4000" \
  --health-check-grace-period-seconds 60

# Web Service
aws ecs create-service \
  --cluster focusflow-production \
  --service-name web \
  --task-definition focusflow-web:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/focusflow-web/xxx,containerName=web,containerPort=3000"
```

---

## CI/CD Setup

### GitHub Actions (Already Configured)

1. **Add GitHub Secrets:**

Go to: Repository → Settings → Secrets → Actions

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ACCOUNT_ID
NEXT_PUBLIC_API_URL
SENTRY_DSN
SLACK_WEBHOOK (optional)
```

2. **Enable Workflows:**

```bash
git add .github/workflows/ci-cd.yml
git commit -m "Enable CI/CD"
git push origin main
```

3. **Workflow automatically runs on:**
   - Push to `main` → Production deployment
   - Push to `staging` → Staging deployment
   - Pull Request → Tests only

---

## Database Migrations

### Run Migrations in Production

```bash
# Option 1: ECS Task
aws ecs run-task \
  --cluster focusflow-production \
  --task-definition focusflow-migrations \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"

# Option 2: Locally (with production DB credentials)
DATABASE_URL=postgresql://... npx prisma migrate deploy

# Option 3: In CI/CD (automated)
# Already configured in .github/workflows/ci-cd.yml
```

---

## Monitoring

### CloudWatch Logs

```bash
# View API logs
aws logs tail /ecs/focusflow-api --follow

# View Web logs
aws logs tail /ecs/focusflow-web --follow
```

### Sentry Setup

1. Create project at https://sentry.io
2. Add DSN to environment variables
3. Errors automatically tracked

### Prometheus & Grafana

Deploy monitoring stack:

```bash
cd infrastructure/k8s
kubectl apply -f monitoring/
```

Access Grafana:
- http://your-domain:3001
- Default: admin/admin

---

## Scaling

### Auto Scaling Configuration

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/focusflow-production/api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/focusflow-production/api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

**scaling-policy.json:**

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 300
}
```

---

## SSL/TLS Setup

### Using AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name focusflow.com \
  --subject-alternative-names www.focusflow.com api.focusflow.com \
  --validation-method DNS

# Add DNS validation records (from ACM console)

# Attach to Load Balancer
aws elbv2 add-listener-certificates \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --certificates CertificateArn=arn:aws:acm:...
```

---

## Backup Strategy

### Database Backups

```bash
# Automated backups (already configured)
# Daily backups retained for 7 days

# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier focusflow-prod-db \
  --db-snapshot-identifier focusflow-manual-$(date +%Y%m%d)
```

### Restore from Backup

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier focusflow-restored \
  --db-snapshot-identifier focusflow-backup-20240320
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check service events
aws ecs describe-services \
  --cluster focusflow-production \
  --services api

# Check task logs
aws logs tail /ecs/focusflow-api --since 1h
```

### High Latency

1. Check RDS performance insights
2. Review Redis hit rate
3. Check API response times in logs
4. Scale horizontally if needed

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

---

## Cost Optimization

### Current Setup (10K users)

- ECS Fargate: ~$150/month
- RDS (db.t3.medium): ~$80/month
- ElastiCache: ~$35/month
- ALB: ~$20/month
- Data Transfer: ~$50/month
- **Total: ~$335/month**

### Tips to Reduce Costs

1. Use Fargate Spot (70% savings)
2. Enable RDS instance auto-pause
3. Use CloudFront CDN (reduces bandwidth)
4. Right-size instances based on metrics

---

## 🎉 Deployment Checklist

- [ ] AWS infrastructure provisioned
- [ ] Environment variables configured
- [ ] Secrets stored in Secrets Manager
- [ ] Database migrations run
- [ ] Docker images built and pushed
- [ ] ECS services created
- [ ] Load balancer configured
- [ ] SSL certificate attached
- [ ] DNS records updated
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] CI/CD pipeline tested
- [ ] Health checks passing
- [ ] Domain accessible

**You're live! 🚀**
