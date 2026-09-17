# 🚀 Quick Start Guide

Get FocusFlow running in **5 minutes**!

## Prerequisites

- **Docker** & **Docker Compose** installed
- **Node.js 20+** (for local development)
- **Git**

## Option 1: Docker (Recommended)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd focusflow-production
cp .env.example .env
```

### 2. Start Everything

```bash
docker-compose up -d
```

This starts:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ API Server (port 4000)
- ✅ Web App (port 3000)
- ✅ Adminer (port 8080) - Database UI
- ✅ Redis Commander (port 8081) - Redis UI

### 3. Check Status

```bash
docker-compose ps
```

All services should show "Up" status.

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### 5. Access the App

- **Web App**: http://localhost:3000
- **API**: http://localhost:4000
- **API Health**: http://localhost:4000/health
- **Database UI**: http://localhost:8080
- **Redis UI**: http://localhost:8081

### 6. Create Account

Open http://localhost:3000 and click "Sign Up"

Or use the API:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@focusflow.com",
    "password": "SecurePassword123",
    "name": "Demo User"
  }'
```

### 7. Stop Services

```bash
docker-compose down

# To also remove volumes (deletes all data)
docker-compose down -v
```

---

## Option 2: Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

```bash
# Start just PostgreSQL and Redis
docker-compose up postgres redis -d
```

### 3. Setup Database

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 4. Start Dev Servers

```bash
# In root directory
npm run dev
```

This starts:
- API on http://localhost:4000
- Web on http://localhost:3000

### 5. Open Browser

Navigate to http://localhost:3000

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```bash
# Database
DATABASE_URL=postgresql://focusflow:dev_password@localhost:5432/focusflow_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-minimum-32-characters

# API
API_PORT=4000

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Custom Ports

Edit `docker-compose.yml`:

```yaml
services:
  api:
    ports:
      - "YOUR_PORT:4000"  # Change YOUR_PORT
  
  web:
    ports:
      - "YOUR_PORT:3000"  # Change YOUR_PORT
```

---

## 📊 Database Management

### Prisma Studio (GUI)

```bash
cd apps/api
npx prisma studio
```

Opens at http://localhost:5555

### Adminer (Web UI)

Already running at http://localhost:8080 (if using Docker)

Credentials:
- System: PostgreSQL
- Server: postgres
- Username: focusflow
- Password: dev_password
- Database: focusflow_dev

### Command Line

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U focusflow -d focusflow_dev

# Common queries
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM users;
SELECT * FROM daily_stats ORDER BY date DESC LIMIT 10;
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm run test:cov
```

### Manual API Testing

```bash
# Health check
curl http://localhost:4000/health

# Register user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'

# Login (save the token)
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Create task (replace YOUR_TOKEN)
curl -X POST http://localhost:4000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test task","priority":"HIGH"}'

# Get tasks
curl http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# View logs
docker-compose logs postgres
```

### Redis Connection Failed

```bash
# Check Redis
docker-compose exec redis redis-cli ping

# Should return: PONG

# Restart Redis
docker-compose restart redis
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Common issues:
# 1. Database not ready - wait 10 seconds and try again
# 2. .env file missing - copy .env.example to .env
# 3. Port in use - change port in docker-compose.yml
```

### Web App Not Loading

```bash
# Check web logs
docker-compose logs web

# Rebuild web container
docker-compose build web
docker-compose up -d web
```

---

## 📦 Useful Commands

```bash
# View all containers
docker-compose ps

# Restart a service
docker-compose restart api

# Rebuild a service
docker-compose build api
docker-compose up -d api

# Execute command in container
docker-compose exec api sh

# View real-time logs
docker-compose logs -f --tail=100

# Clean up everything
docker-compose down -v
docker system prune -a
```

---

## 🎯 Next Steps

1. ✅ App running locally
2. 📝 Read [MIGRATION.md](./MIGRATION.md) to import MVP data
3. 🔐 Change JWT secrets in `.env`
4. 🚀 Deploy to staging (see [docs/deployment.md](./docs/deployment.md))
5. 📊 Set up monitoring (see [docs/monitoring.md](./docs/monitoring.md))

---

## 💡 Tips

- Use `docker-compose logs -f api web` to see both API and Web logs
- Access Prisma Studio to inspect data visually
- Check `/health` endpoint to verify API is running
- Use Redis Commander to inspect cache data
- Keep `.env` file secure and never commit it!

---

## 🆘 Need Help?

- 📖 [Full Documentation](./docs/)
- 🐛 [Report an Issue](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

**Happy coding! 🎉**
