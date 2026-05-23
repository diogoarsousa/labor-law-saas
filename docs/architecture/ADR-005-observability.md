# ADR-005: Observability Strategy

**Status:** Accepted  
**Date:** 2026-05-22  
**Category:** Observabilidade  
**Deciders:** Diogo Sousa (Architect)  

## Context

An AI-powered application has unique observability needs beyond traditional metrics:
1. LLM call latency, token usage, and cost tracking
2. RAG retrieval quality (recall, precision, relevance scores)
3. User satisfaction and answer accuracy
4. Vector store query performance
5. Standard application metrics (latency, errors, throughput)

## Decision

We adopt a **three-pillar observability stack** (metrics, logs, traces) with AI-specific extensions.

### Stack

| Pillar | Tool | Purpose |
|--------|------|--------|
| Metrics | Micrometer + Prometheus | Application and AI metrics |
| Logs | SLF4J + Logback + JSON | Structured logging |
| Traces | OpenTelemetry + Jaeger | Distributed tracing across AI pipeline |
| AI Observability | Custom Spring AI Advisor | LLM cost, tokens, latency per call |
| Dashboards | Grafana | Visualization |

### AI-Specific Metrics

```java
@Component
public class AiObservabilityAdvisor implements CallAroundAdvisor {

    private final MeterRegistry registry;

    @Override
    public AdvisedResponse aroundCall(AdvisedRequest request, 
            CallAroundAdvisorChain chain) {
        var timer = Timer.start(registry);
        try {
            var response = chain.nextAroundCall(request);
            recordMetrics(response, timer);
            return response;
        } catch (Exception e) {
            registry.counter("ai.llm.errors").increment();
            throw e;
        }
    }

    private void recordMetrics(AdvisedResponse response, Timer.Sample timer) {
        var usage = response.response().getMetadata().getUsage();
        registry.counter("ai.llm.tokens.input").increment(usage.getPromptTokens());
        registry.counter("ai.llm.tokens.output").increment(usage.getGenerationTokens());
        timer.stop(registry.timer("ai.llm.latency"));
        // Estimate cost based on model pricing
        registry.counter("ai.llm.cost.usd").increment(estimateCost(usage));
    }
}
```

### Key Dashboards

1. **AI Performance**: LLM latency p50/p95/p99, token usage, cost/day
2. **RAG Quality**: Retrieval scores, citation accuracy, user feedback
3. **Application Health**: Request latency, error rates, active users
4. **Infrastructure**: CPU, memory, database connections, vector store latency

## Consequences

### Positive
- Full visibility into AI pipeline performance and cost
- Early detection of RAG quality degradation
- Cost tracking prevents budget surprises

### Negative
- Additional infrastructure (Prometheus, Grafana, Jaeger)
- Custom advisor adds small latency overhead
- Metrics cardinality management needed

### Mitigations
- Use Docker Compose for local observability stack
- Use managed services (Grafana Cloud free tier) for MVP
- Keep metric cardinality low by avoiding high-cardinality labels
