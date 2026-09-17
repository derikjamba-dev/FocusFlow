# 🚀 FocusFlow - Production Architecture

A scalable, production-ready productivity application built with modern best practices.

## 📁 Project Structure

```
focusflow/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Node.js/Express backend
│   └── mobile/       # Expo/React Native (Android focus blocker)
├── packages/         # Shared packages
├── infrastructure/   # Docker, K8s, Terraform
└── scripts/         # Utility scripts
```

## 🛠️ Tech Stack

- **Web**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Mobile**: Expo SDK 57, React Native 0.86, TypeScript, React Query, Zustand, React Navigation, `react-native-svg`, `expo-audio`
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 16, Prisma ORM
- **Cache**: Redis 7
- **Queue**: BullMQ
- **Auth**: JWT
- **Monitoring**: Winston, Sentry, Prometheus

> O app mobile replica as funcionalidades da web (Dashboard, Tasks, Sessions,
> Analytics) e adiciona o **bloqueio de apps em Android** durante o modo foco.
> Detalhes em [Mobile - Focus App Blocking](./docs/mobile-focus-block.md).

## 🚀 Quick Start

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Local Development
```bash
# Install dependencies
npm install

# Setup database
cd apps/api && npx prisma migrate dev

# Start development servers
npm run dev
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Mobile - Focus App Blocking](./docs/mobile-focus-block.md)

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values.

## 📦 Migration from MVP

See [MIGRATION.md](./MIGRATION.md) for step-by-step migration guide.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE)
