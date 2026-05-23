# Doutor do Trabalho - Labor Law SaaS

> AI-powered Portuguese Labor Law platform for HR teams, employment lawyers, and workers.

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-green)](https://spring.io/projects/spring-boot)
[![Spring AI](https://img.shields.io/badge/Spring%20AI-1.0-blue)](https://docs.spring.io/spring-ai/reference/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

## Overview

**Doutor do Trabalho** is a B2B SaaS platform that helps Portuguese HR teams, employment lawyers, and workers navigate and apply Portuguese labor law (Codigo do Trabalho). It uses RAG-powered AI to provide accurate, cited legal answers grounded in the actual law corpus.

## Core Features

| Feature | Description | Status |
|---------|------------|--------|
| AI Legal Q&A | RAG-based Q&A over Portuguese labor law corpus | Planned |
| Contract Analysis | AI-powered employment contract review and risk detection | Planned |
| Compliance Checker | Validate HR policies against current labor law | Planned |
| Case Tracking | Track labor disputes, deadlines, and outcomes | Planned |
| Labor Law Calculators | Severance, overtime, vacation, seniority calculations | Planned |
| AI Document Generation | Generate compliant HR documents from templates | Planned |
| Jurisprudence Search | Semantic search over Portuguese labor court decisions | Planned |
| Legislative Monitoring | Track changes to labor legislation in real-time | Planned |

## Tech Stack

### Backend
- **Runtime**: Java 21 + Spring Boot 3.4
- **AI Framework**: Spring AI 1.0 (advisors, tool calling, RAG)
- **LLM**: Claude claude-sonnet-4-6 via Anthropic API
- **Vector Store**: PostgreSQL + pgvector
- **Auth**: Keycloak + Spring Security OAuth2 (JWT)
- **Architecture**: Hexagonal (Ports & Adapters)

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation

### Infrastructure
- **Local Dev**: Docker Compose
- **MVP Deploy**: Railway or Fly.io
- **Production**: AWS (ECS/EKS, RDS, CloudFront)
- **CI/CD**: GitHub Actions

## Architecture

The system follows a **hexagonal architecture** (ports & adapters) with clearly separated bounded contexts:

```
+--------------------------------------------------+
|                   API Gateway                      |
|              /api/v1/doutor-trabalho               |
+--------------------------------------------------+
         |          |          |          |
   +----------+ +--------+ +--------+ +----------+
   | Legal QA | |Contract| |Compli- | |  Case    |
   | Context  | |Analysis| |ance    | | Tracking |
   +----------+ +--------+ +--------+ +----------+
         |          |          |          |
+--------------------------------------------------+
|              Spring AI Layer                       |
|    Advisors | Tool Calling | RAG Pipeline          |
+--------------------------------------------------+
         |                    |
   +-----------+      +--------------+
   | pgvector  |      |  Claude API  |
   | (vectors) |      |  (LLM)       |
   +-----------+      +--------------+
```

See [docs/architecture/README.md](docs/architecture/README.md) for the full architecture documentation.

## Project Structure

```
labor-law-saas/
  backend/
    src/main/java/pt/doutortrabalho/
      legalqa/           # Legal Q&A bounded context
      contract/          # Contract analysis bounded context
      compliance/        # Compliance checker bounded context
      casetracking/      # Case tracking bounded context
      documents/         # Document generation bounded context
      jurisprudence/     # Jurisprudence search bounded context
      monitoring/        # Legislative monitoring bounded context
      shared/            # Shared kernel (auth, config, common)
      infrastructure/    # Adapters (REST, persistence, AI)
  frontend/
    src/
      app/               # Next.js app router pages
      components/        # Reusable UI components
      lib/               # Utilities and API client
  docs/
    architecture/        # ADRs and architecture docs
    features/            # Feature specifications
  infra/
    docker/              # Docker Compose files
    k8s/                 # Kubernetes manifests (production)
```

## Getting Started

### Prerequisites
- Java 21+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ with pgvector extension

### Local Development

```bash
# Clone the repository
git clone https://github.com/diogoarsousa/labor-law-saas.git
cd labor-law-saas

# Start infrastructure
docker compose up -d

# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install && npm run dev
```

## API

Base path: `/api/v1/doutor-trabalho/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/legal-qa/ask` | POST | Ask a labor law question |
| `/legal-qa/sessions` | GET | List conversation sessions |
| `/contracts/analyze` | POST | Analyze an employment contract |
| `/compliance/check` | POST | Check policy compliance |
| `/cases` | CRUD | Manage labor law cases |
| `/calculators/{type}` | POST | Run a labor law calculation |
| `/documents/generate` | POST | Generate a legal document |
| `/jurisprudence/search` | POST | Search court decisions |
| `/monitoring/alerts` | GET | Get legislative change alerts |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Git Workflow

- `main` - production-ready code
- `develop` - integration branch
- `feature/xxx` - feature branches
- `hotfix/xxx` - production hotfixes

## Team

Built by **Diogo Sousa** with AI-powered development agents.

## License

Proprietary - All rights reserved.
