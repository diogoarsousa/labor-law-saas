# ADR-001: Hexagonal Architecture (Ports & Adapters)

**Status:** Accepted  
**Date:** 2026-05-22  
**Category:** Architecture  
**Deciders:** Diogo Sousa (Architect)  

## Context

We are building a multi-feature legal SaaS platform with several bounded contexts (Legal Q&A, Contract Analysis, Compliance, Case Tracking, Documents, Jurisprudence, Monitoring). Each context has different external dependencies:

- AI services (Claude API, embedding models)
- Vector stores (pgvector)
- External APIs (DRE, court databases)
- Messaging (event-driven communication between contexts)
- Persistence (PostgreSQL)

We need an architecture that:
1. Keeps domain logic independent of infrastructure concerns
2. Makes it easy to swap infrastructure components (e.g., switch vector stores)
3. Enables independent testing of business logic
4. Supports the team working on different bounded contexts in parallel
5. Follows SOLID principles strictly

## Decision

We adopt **Hexagonal Architecture** (Ports & Adapters) as the foundational architectural pattern for all bounded contexts.

### Structure per Bounded Context

```
context/
  domain/
    model/           # Entities, Value Objects, Aggregates
      LegalQuestion.java
      LegalAnswer.java
      Citation.java
    port/
      in/             # Driving ports (use case interfaces)
        AskLegalQuestionUseCase.java
        GetSessionHistoryUseCase.java
      out/            # Driven ports (repository/service interfaces)
        LegalCorpusSearchPort.java
        LlmGenerationPort.java
        SessionPersistencePort.java
    service/         # Domain services implementing driving ports
      LegalQADomainService.java
  application/
    usecase/         # Application services (thin orchestration)
    dto/             # Input/Output DTOs (anti-corruption layer)
  infrastructure/
    adapter/
      in/
        rest/         # @RestController (driving adapter)
        event/        # @EventListener (driving adapter)
      out/
        persistence/  # @Repository JPA (driven adapter)
        ai/           # Spring AI ChatClient (driven adapter)
        external/     # External API clients (driven adapter)
    config/          # Spring @Configuration for this context
```

### Key Rules

1. **Domain layer has zero framework dependencies** -- no Spring annotations in domain model or ports
2. **Ports are interfaces** defined in the domain layer
3. **Adapters implement ports** and live in the infrastructure layer
4. **Dependencies point inward** -- infrastructure depends on domain, never the reverse
5. **DTOs at the boundary** -- REST controllers map DTOs to domain objects, never expose domain entities
6. **Each bounded context is a separate Java package** (not a separate module in MVP, but structured for future extraction)

### Spring AI as a Driven Adapter

```java
// Domain port (no Spring dependency)
public interface LlmGenerationPort {
    LegalAnswer generate(LegalQuestion question, List<LegalChunk> context);
}

// Infrastructure adapter (Spring AI dependency)
@Component
public class SpringAiLlmAdapter implements LlmGenerationPort {
    private final ChatClient chatClient;

    @Override
    public LegalAnswer generate(LegalQuestion question, List<LegalChunk> context) {
        // Use Spring AI ChatClient with advisors
    }
}
```

## Consequences

### Positive
- **Testability**: Domain logic can be tested with simple unit tests using mock ports
- **Flexibility**: Easy to swap pgvector for Qdrant, or Claude for GPT, by replacing adapters
- **Clarity**: Clear separation of concerns makes the codebase navigable
- **Parallel development**: Teams can work on different bounded contexts independently
- **Future-proofing**: Each context can be extracted into a microservice if needed

### Negative
- **More boilerplate**: Interface + implementation for every port adds code
- **Learning curve**: Team members unfamiliar with hexagonal architecture need onboarding
- **Over-engineering risk for MVP**: Some bounded contexts may be simple CRUD and don't benefit much from full hexagonal treatment

### Mitigations
- For simple CRUD contexts (e.g., Case Tracking), we allow a simplified structure that skips the full port/adapter ceremony
- We use records for DTOs to minimize boilerplate
- We provide a reference implementation (LegalQA) as the template for other contexts
