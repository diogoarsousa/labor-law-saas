# Architecture Overview - Doutor do Trabalho

## System Architecture

The platform follows a **hexagonal architecture** (ports and adapters) pattern, organized into bounded contexts aligned with domain capabilities.

### High-Level System Diagram

```
                          +------------------+
                          |   Next.js 14     |
                          |   Frontend       |
                          |   (TypeScript)   |
                          +--------+---------+
                                   |
                              HTTPS/REST
                                   |
                          +--------+---------+
                          |   API Gateway    |
                          |   Spring Boot 3  |
                          | /api/v1/doutor-  |
                          |    trabalho/     |
                          +--------+---------+
                                   |
              +--------------------+--------------------+
              |                    |                    |
    +---------+--------+ +---------+--------+ +--------+---------+
    |  Legal QA        | | Contract Analysis| | Compliance       |
    |  Bounded Context | | Bounded Context  | | Bounded Context  |
    |                  | |                  | |                  |
    |  - ChatClient    | | - DocParser      | | - RuleEngine     |
    |  - RAG Advisor   | | - ClauseAnalyzer | | - PolicyChecker  |
    |  - Citation Tool | | - RiskScorer     | | - AlertService   |
    +---------+--------+ +---------+--------+ +--------+---------+
              |                    |                    |
    +---------+--------+ +---------+--------+ +--------+---------+
    |  Case Tracking   | | Doc Generation   | | Jurisprudence    |
    |  Bounded Context | | Bounded Context  | | Bounded Context  |
    |                  | |                  | |                  |
    |  - CaseService   | | - TemplateEngine | | - SearchService  |
    |  - DeadlineCalc  | | - DocAssembler   | | - CaseExtractor  |
    |  - Notifications | | - ComplianceChk  | | - Summarizer     |
    +---------+--------+ +---------+--------+ +--------+---------+
              |                    |                    |
              +--------------------+--------------------+
                                   |
                     +-------------+-------------+
                     |                           |
            +--------+---------+       +---------+--------+
            |  Spring AI Layer |       |  Shared Kernel   |
            |                  |       |                  |
            |  - ChatClient    |       |  - Auth (JWT)    |
            |  - Advisors      |       |  - Multi-tenancy |
            |  - Tool Calling  |       |  - Audit Log     |
            |  - RAG Pipeline  |       |  - Events        |
            |  - Embeddings    |       |  - Exceptions    |
            +--------+---------+       +---------+--------+
                     |                           |
         +-----------+-----------+     +---------+--------+
         |           |           |     |  PostgreSQL 16   |
    +----+---+ +-----+----+ +---+--+  |  - Domain tables |
    |pgvector| | Claude   | |Redis |  |  - Audit tables  |
    |        | | API      | |Cache |  |  - Keycloak DB   |
    +--------+ +----------+ +------+  +------------------+
```

### Bounded Contexts

| Context | Responsibility | Key Aggregates |
|---------|---------------|----------------|
| **LegalQA** | RAG-based Q&A over labor law corpus | Session, Question, Answer, Citation |
| **ContractAnalysis** | Employment contract review | Contract, Clause, Risk, Recommendation |
| **Compliance** | HR policy validation | Policy, Rule, Violation, Report |
| **CaseTracking** | Labor dispute management | Case, Party, Event, Deadline, Document |
| **Documents** | AI-generated legal documents | Template, Document, Field, Version |
| **Jurisprudence** | Court decision search | Decision, Court, Summary, Topic |
| **Monitoring** | Legislative change tracking | LegislativeSource, Change, Alert, Subscription |

### Hexagonal Architecture per Bounded Context

Each bounded context follows the same internal structure:

```
bounded-context/
  domain/
    model/           # Entities, Value Objects, Aggregates
    port/
      in/             # Driving ports (use cases)
      out/            # Driven ports (repositories, external services)
    service/         # Domain services
  application/
    usecase/         # Use case implementations
    dto/             # Input/Output DTOs
  infrastructure/
    adapter/
      in/
        rest/         # REST controllers (driving adapter)
        event/        # Event listeners (driving adapter)
      out/
        persistence/  # JPA repositories (driven adapter)
        ai/           # Spring AI clients (driven adapter)
        external/     # External API clients (driven adapter)
```

### Spring AI Integration

The AI layer is a cross-cutting concern that multiple bounded contexts consume through well-defined ports:

```java
// Driving port - use case interface
public interface AskLegalQuestion {
    LegalAnswer ask(LegalQuestion question, SessionId sessionId);
}

// Spring AI ChatClient configuration
@Bean
public ChatClient legalQaChatClient(ChatClient.Builder builder) {
    return builder
        .defaultSystem(LEGAL_QA_SYSTEM_PROMPT)
        .defaultAdvisors(
            new QuestionAnswerAdvisor(vectorStore, searchRequest),
            new MessageChatMemoryAdvisor(chatMemory),
            new SafetyAdvisor()  // prevent non-legal queries
        )
        .defaultTools(new LaborLawTools())
        .build();
}
```

### RAG Pipeline

```
[Law Corpus]  -->  [Chunking]  -->  [Embedding]  -->  [pgvector]
     |                 |                |                  |
  PDF/HTML       Semantic +         Anthropic          HNSW index
  from DRE     Structural         voyage-3 or         cosine sim
               chunking          text-embedding-3
               (by article)

[User Query]  -->  [Embed Query]  -->  [Vector Search]  -->  [Rerank]
     |                                      |                  |
  Natural           Top-k=20          pgvector            Cross-encoder
  language          candidates        <=> search          or Claude rerank
                                                              |
                                                     [Augmented Prompt]
                                                              |
                                                     [Claude Response]
                                                     with citations
```

### Authentication Flow

```
[Browser] --> [Next.js] --> [Keycloak] --> [JWT Token]
                                               |
                              [Spring Security Filter]
                                               |
                              [Role-based access control]
                              ROLE_WORKER, ROLE_HR, ROLE_LAWYER, ROLE_ADMIN
```

### Infrastructure

**Local Development (Docker Compose):**
- PostgreSQL 16 + pgvector
- Keycloak
- Redis (session cache + rate limiting)
- Backend (Spring Boot)
- Frontend (Next.js)

**MVP Deployment (Railway):**
- Railway PostgreSQL + pgvector
- Railway Redis
- Backend container on Railway
- Frontend on Vercel
- Keycloak on Railway

**Production (AWS):**
- ECS Fargate or EKS for containers
- RDS PostgreSQL with pgvector
- ElastiCache Redis
- CloudFront + S3 for frontend
- Cognito or self-hosted Keycloak
- CloudWatch for monitoring

## ADRs

- [ADR-001: Hexagonal Architecture](ADR-001-hexagonal-architecture.md)
- [ADR-002: Spring AI RAG Pipeline](ADR-002-spring-ai-rag.md)
- [ADR-003: Vector Store Selection](ADR-003-vector-store.md)
