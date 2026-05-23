# Contributing to Doutor do Trabalho

## Development Setup

### Prerequisites
- Java 21 (Temurin recommended)
- Node.js 20+
- Docker & Docker Compose
- Git

### Getting Started

```bash
git clone https://github.com/diogoarsousa/labor-law-saas.git
cd labor-law-saas
cp .env.example .env  # configure your API keys
docker compose up -d  # start PostgreSQL, Keycloak, Redis
cd backend && ./mvnw spring-boot:run
cd frontend && npm install && npm run dev
```

## Git Workflow

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Make your changes following the coding standards below

3. Commit with conventional commits:
   ```
   feat: add severance calculator endpoint
   fix: correct overtime rate calculation for holidays
   docs: update ADR-002 with reranking decision
   refactor: extract common validation to shared kernel
   test: add integration tests for contract analysis
   ```

4. Push and create a PR to `develop`:
   ```bash
   git push -u origin feature/my-feature
   gh pr create --base develop
   ```

5. After review and CI passes, merge to `develop`
6. Release: merge `develop` to `main` via PR

## Coding Standards

### Backend (Java)
- Follow hexagonal architecture (see docs/architecture/ADR-001)
- Domain objects must not depend on Spring or JPA annotations
- Use records for DTOs
- All public methods must have Javadoc
- Minimum 80% test coverage
- Use `@Tool` annotation for Spring AI tool definitions

### Frontend (TypeScript)
- Use functional components with hooks
- Tailwind CSS for styling (no CSS modules)
- Zod for runtime validation
- React Hook Form for forms
- All components must have TypeScript types (no `any`)

### API Design
- REST with versioning: `/api/v1/doutor-trabalho/...`
- Use HTTP status codes correctly
- All endpoints require authentication (JWT)
- Request/response bodies use camelCase
- Pagination: `?page=0&size=20&sort=createdAt,desc`
- Error response format: `{ "error": "...", "code": "...", "details": [...] }`

## Testing

- **Unit tests**: JUnit 5 + Mockito for domain logic
- **Integration tests**: Testcontainers for database and AI integration
- **E2E tests**: Playwright for critical user flows
- Run all tests: `./mvnw verify`

## Architecture Decisions

All significant decisions must be documented as ADRs in `docs/architecture/`.
See existing ADRs for the format.
