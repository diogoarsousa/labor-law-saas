# Labor Law SaaS -- Project Context

## What we are building
A B2B SaaS platform that helps Portuguese HR teams, employment lawyers and workers 
navigate and apply Portuguese labor law (Codigo do Trabalho).
Core features:
- AI-powered legal Q&A
- Contract analysis
- Compliance checker
- Case tracking
- Labor law calculators
- AI document generation
- Jurisprudence search
- Legislative monitoring

## Tech stack
- Backend: Java 21 + Spring Boot 3 + Spring AI
- RAG: pgvector (PostgreSQL) or Qdrant for vector store
- LLM: Claude via Anthropic API (claude-sonnet-4-6)
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Auth: Keycloak or Spring Security OAuth2
- MCP tools: GitHub, Notion, Google Drive
- Infra: Docker + Railway or Fly.io (MVP), AWS later

## Law corpus

### Primary Sources
- Codigo do Trabalho (Lei n.o 7/2009)
- Portarias
- Decretos-Lei
- Diario da Republica Eletronico (DRE)

---

### Secondary Sources
- ACT guidelines
- CITE decisions
- Collective bargaining agreements
- Labor jurisprudence
- EU labor directives

## Project conventions
- Spring AI agents use @Tool annotation for tool definitions
- API follows REST with versioning: /api/v1/doutor-trabalho/...
- All endpoints require authentication
- Tests: JUnit 5 + Mockito, minimum 80% coverage
- Git branching: main -> develop -> feature/xxx
- OpenAPI/Swagger documentation
- JWT authentication
- Hexagonal architecture
- SOLID Design Principles

## Git branching
- main
- develop
- feature/xxx
- hotfix/xxx


## Team agents

### legal-researcher
Responsibilities:
- RAG queries
- Law interpretation
- Citation retrieval
- Jurisprudence analysis
- Legal summarization

### frontend-dev
Responsibilities:
- Next.js components
- UI/UX implementation
- Tailwind CSS

### architect
Responsibilities:
- System design
- Spring AI patterns
- Multi-agent orchestration
- RAG architecture
- Security architecture

### pm-tasks
Responsibilities:
- GitHub issues
- Project board
- Sprint planning
- Roadmaps

### business-advisor
Responsibilities:
- GTM strategy
- Pricing
- Portuguese market strategy
- Partnerships
- SEO strategy
