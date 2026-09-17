# 📁 FocusFlow Production - Complete File Structure

## Overview

This is a **production-ready monorepo** with everything needed to deploy a scalable productivity application.

## Root Files

```
focusflow-production/
├── README.md                 # Main documentation
├── QUICKSTART.md            # Get started in 5 minutes
├── MIGRATION.md             # Migrate from MVP to production
├── PROJECT_STRUCTURE.md     # This file
├── package.json             # Monorepo configuration
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Local development orchestration
└── setup.sh                 # Automated setup script
```

## Apps

### API (`apps/api/`)

Backend Node.js/Express application with TypeScript.

```
apps/api/
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── src/
│   ├── main.ts             # Entry point
│   ├── app.ts              # Express app configuration
│   ├── config/             # Configuration files
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validators.ts
│   │   ├── tasks/          # Task management
│   │   │   ├── task.controller.ts
│   │   │   ├── task.service.ts
│   │   │   ├── task.repository.ts
│   │   │   ├── task.routes.ts
│   │   │   └── task.validators.ts
│   │   ├── sessions/       # Focus sessions
│   │   ├── stats/          # Statistics
│   │   └── users/          # User management
│   └── shared/             # Shared utilities
│       ├── database/       # DB clients (Prisma, Redis)
│       ├── middleware/     # Express middleware
│       │   ├── authenticate.ts
│       │   ├── error-handler.ts
│       │   ├── rate-limit.ts
│       │   ├── validate.ts
│       │   └── request-logger.ts
│       ├── utils/          # Utilities
│       │   ├── logger.ts
│       │   ├── errors.ts
│       │   └── metrics.ts
│       └── services/       # Shared services
│           └── cache.service.ts
└── logs/                   # Application logs
```

### Web (`apps/web/`)

Next.js 14 frontend with React 18 and TypeScript.

```
apps/web/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/                 # Static assets
└── src/
    ├── app/               # App Router (Next.js 14)
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── providers.tsx
    │   ├── (auth)/        # Auth routes
    │   └── dashboard/     # Dashboard routes
    ├── components/        # React components
    │   ├── features/      # Feature components
    │   ├── ui/            # Reusable UI components
    │   └── layouts/       # Layout components
    ├── lib/               # Utilities
    │   ├── api/           # API client
    │   │   ├── client.ts
    │   │   ├── auth.ts
    │   │   ├── tasks.ts
    │   │   ├── sessions.ts
    │   │   └── stats.ts
    │   ├── hooks/         # React hooks
    │   │   ├── use-tasks.ts
    │   │   ├── use-auth.ts
    │   │   └── use-sessions.ts
    │   └── utils/         # Helper functions
    └── store/             # State management (Zustand)
        └── app-store.ts
```

### Mobile (`apps/mobile/`)

Expo SDK 57 / React Native app with a focus timer **and Android app blocking**,
mirroring the web app (Dashboard, Tasks, Sessions, Analytics).

```
apps/mobile/
├── package.json
├── app.json                 # Expo config + plugins (expo-audio, with-focusblock, datetimepicker)
├── App.tsx                 # Navigation: bottom tabs (Dashboard/Tasks/Focus/Sessions/Analytics) + stack (NewTask, Blocklist modals)
├── modules/
│   └── focus-block/        # Local native module "react-native-focus-block"
│       ├── android/        # AccessibilityService + overlay + RN bridge (Java)
│       └── index.js
├── plugins/                 # Expo config plugins
│   └── with-focusblock.js
├── scripts/generate-beep.js # Generates the alarm asset (assets/beep.wav)
└── src/
    ├── config.ts           # API base URL
    ├── theme/              # COLORS theme (aligned with the web design)
    ├── api/                # API client + endpoints (client, tasks, sessions, stats)
    ├── hooks/              # React Query hooks (use-tasks, use-sessions, use-stats)
    ├── store/app-store.ts  # Zustand (activeSession, selectedTask)
    ├── providers/query-provider.tsx
    ├── utils/format.ts     # Date/duration helpers
    ├── components/         # ui/, charts/, features/tasks
    ├── storage/blocklist.ts# Persisted blocked-app list (AsyncStorage)
    ├── modules/focusBlock.ts # Typed wrapper around native FocusBlock module
    ├── screens/            # Dashboard/Tasks/Sessions/Analytics/NewTask/Timer/Blocklist
    └── types/assets.d.ts
```

> **How it works**: quando o timer de foco arranca, a app chama o módulo nativo
> `startBlocking(packages)`. O `FocusFlowAccessibilityService` (Android
> AccessibilityService) deteta a app em primeiro plano e, se estiver na lista
> bloqueada, mostra um overlay de ecrã inteiro. O utilizador pode desbloquear
> temporariamente (30s, máx 2 por sessão); esgotado o limite, o bloqueio é
> rígido até o timer terminar.

## Packages (Shared)

```
packages/
├── types/                 # Shared TypeScript types
│   ├── package.json
│   └── src/
│       └── index.ts
├── ui/                    # Shared UI components
│   ├── package.json
│   └── src/
└── utils/                 # Shared utilities
    ├── package.json
    └── src/
```

## Infrastructure

### Docker (`infrastructure/docker/`)

```
infrastructure/docker/
├── Dockerfile.api         # Multi-stage API build
├── Dockerfile.web         # Multi-stage Web build
└── .dockerignore
```

### Kubernetes (`infrastructure/k8s/`)

```
infrastructure/k8s/
├── deployment-api.yaml    # API deployment
├── deployment-web.yaml    # Web deployment
├── service-api.yaml       # API service
├── service-web.yaml       # Web service
├── ingress.yaml           # Ingress configuration
├── hpa-api.yaml           # Horizontal Pod Autoscaler
└── monitoring/            # Prometheus & Grafana
    ├── prometheus.yaml
    └── grafana.yaml
```

### Terraform (`infrastructure/terraform/`)

```
infrastructure/terraform/
├── main.tf                # Main configuration
├── variables.tf           # Variable definitions
├── outputs.tf             # Output values
├── vpc.tf                 # VPC configuration
├── rds.tf                 # RDS PostgreSQL
├── elasticache.tf         # Redis
├── ecs.tf                 # ECS cluster & services
├── alb.tf                 # Application Load Balancer
└── cloudfront.tf          # CDN configuration
```

### Nginx (`infrastructure/nginx/`)

```
infrastructure/nginx/
├── nginx.conf             # Nginx configuration
└── ssl/                   # SSL certificates
```

## Scripts

```
scripts/
├── migrations/            # Data migration scripts
│   ├── import-mvp-data.js
│   └── data.json (sample)
└── seeds/                 # Database seeds
    └── seed.ts
```

## CI/CD

```
.github/
└── workflows/
    └── ci-cd.yml          # Complete CI/CD pipeline
```

## Documentation

```
docs/
├── API.md                 # Complete API documentation
├── deployment.md          # Production deployment guide
├── architecture.md        # System architecture
└── monitoring.md          # Monitoring & observability
```

## Configuration Files

```
.eslintrc.json            # ESLint configuration
.prettierrc               # Prettier configuration
jest.config.js            # Jest testing configuration
.editorconfig             # Editor configuration
```

## Key Features Implemented

✅ **Backend (Node.js + Express + TypeScript)**
- JWT authentication with refresh tokens
- RESTful API with pagination & filtering
- Rate limiting (Redis-based)
- Input validation (Zod)
- Error handling & logging (Winston)
- Database ORM (Prisma)
- Caching (Redis)
- Background jobs (BullMQ)
- Metrics (Prometheus)

✅ **Frontend (Next.js 14 + React 18)**
- Server-side rendering
- API client with React Query
- State management (Zustand)
- Responsive design (Tailwind CSS)
- Code splitting & lazy loading
- Optimistic updates

✅ **Database (PostgreSQL + Prisma)**
- Normalized schema
- Proper indexes
- Migrations
- Soft deletes
- Cascading deletes

✅ **DevOps**
- Docker containerization
- Docker Compose for local dev
- Kubernetes manifests
- Terraform for AWS
- CI/CD with GitHub Actions
- Nginx reverse proxy

✅ **Security**
- Password hashing (bcrypt)
- JWT with expiration
- CORS configuration
- Helmet security headers
- Input sanitization
- Rate limiting
- SQL injection prevention

✅ **Monitoring & Logging**
- Winston logging
- Prometheus metrics
- Health checks
- Error tracking ready (Sentry)

✅ **Testing**
- Unit test setup
- Integration test setup
- Test database configuration

✅ **Documentation**
- Complete API documentation
- Deployment guide
- Migration guide
- Quick start guide

## File Count

- **Total TypeScript files**: ~80
- **Configuration files**: ~20
- **Documentation files**: ~10
- **Infrastructure files**: ~30

## Lines of Code

- **Backend**: ~5,000 lines
- **Frontend**: ~3,000 lines
- **Infrastructure**: ~2,000 lines
- **Documentation**: ~3,000 lines
- **Total**: ~13,000 lines

## Technologies Used

### Backend
- Node.js 20
- Express 4.18
- TypeScript 5.3
- Prisma 5.8
- PostgreSQL 16
- Redis 7
- BullMQ 5.1
- JWT (jsonwebtoken)
- Bcrypt
- Zod (validation)
- Winston (logging)
- Prometheus (metrics)

### Frontend
- Next.js 14
- React 18
- TypeScript 5.3
- Tailwind CSS 3.4
- React Query 5.17
- Zustand 4.4
- Axios 1.6

### DevOps
- Docker
- Docker Compose
- Kubernetes
- Terraform
- GitHub Actions
- Nginx
- AWS (ECS, RDS, ElastiCache, ALB)

## Getting Started

1. **Quick Start**: Read `QUICKSTART.md`
2. **Setup**: Run `./setup.sh`
3. **Migrate Data**: Follow `MIGRATION.md`
4. **Deploy**: Follow `docs/deployment.md`

## Support

- 📖 Full documentation in `./docs/`
- 🐛 Report issues on GitHub
- 💬 Join discussions

**This is a production-grade, scalable application ready for real-world use!** 🚀
