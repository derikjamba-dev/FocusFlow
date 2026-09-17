#!/bin/bash

# Create complete folder structure
mkdir -p apps/web/src/{app,components/{features,ui,layouts},lib/{api,hooks,utils},store}
mkdir -p apps/web/public
mkdir -p apps/api/src/{modules/{auth,tasks,users,sessions,stats},shared/{database,middleware,utils,types,services,queues},config}
mkdir -p apps/api/prisma/{migrations}
mkdir -p apps/api/logs
mkdir -p packages/{types,ui,utils}/src
mkdir -p infrastructure/{docker,k8s,terraform,nginx}
mkdir -p scripts/{migrations,seeds}
mkdir -p .github/workflows
mkdir -p docs

echo "✅ Folder structure created"
