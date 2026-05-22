# ADR-002: Spring AI RAG Pipeline Design

**Status:** Accepted  
**Date:** 2026-05-22  
**Category:** RAG Strategy  
**Deciders:** Diogo Sousa (Architect)  

## Context

The core value proposition of Doutor do Trabalho is accurate, cited answers to Portuguese labor law questions. This requires a Retrieval-Augmented Generation (RAG) pipeline that:

1. Ingests the full Portuguese labor law corpus (Codigo do Trabalho, Portarias, Decretos-Lei, jurisprudence)
2. Chunks documents in a way that preserves legal structure (articles, paragraphs, alineas)
3. Retrieves relevant legal text with high recall
4. Generates answers with proper citations back to specific articles
5. Handles Portuguese language well

Spring AI 1.0 provides built-in RAG support through `QuestionAnswerAdvisor`, `VectorStore` abstraction, and `DocumentReader`/`DocumentTransformer` pipeline.

## Decision

We use **Spring AI's built-in RAG pipeline** with a custom ingestion strategy optimized for Portuguese legal documents.

### Ingestion Pipeline (Offline)

```java
@Component
public class LegalCorpusIngestionService {

    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;

    public void ingestLegislation(Resource resource, LegislationMetadata metadata) {
        // 1. Read document
        var reader = new TikaDocumentReader(resource);
        List<Document> documents = reader.get();

        // 2. Transform: structural chunking by legal article
        var splitter = new LegalArticleSplitter();  // Custom splitter
        List<Document> chunks = splitter.split(documents);

        // 3. Enrich metadata
        chunks.forEach(chunk -> {
            chunk.getMetadata().put("source", metadata.source());
            chunk.getMetadata().put("law_number", metadata.lawNumber());
            chunk.getMetadata().put("article", metadata.articleNumber());
            chunk.getMetadata().put("effective_date", metadata.effectiveDate());
            chunk.getMetadata().put("corpus_type", metadata.corpusType().name());
        });

        // 4. Store with embeddings
        vectorStore.add(chunks);
    }
}
```

### Custom Legal Article Splitter

Portuguese labor law has a specific structure:
- **Artigo** (Article) -- the primary unit
- **Numero** (Paragraph within article)
- **Alinea** (Sub-paragraph, labeled a), b), c)...)

Our custom splitter preserves this hierarchy:

```java
public class LegalArticleSplitter implements DocumentTransformer {

    // Splits on "Artigo N.o" boundaries
    // Keeps article number + title as metadata
    // Preserves parent article context for sub-paragraphs
    // Target chunk size: 512-1024 tokens
    // Overlap: includes article header in every chunk
}
```

### Query Pipeline (Online)

```java
@Bean
public ChatClient legalQaChatClient(
        ChatClient.Builder builder,
        VectorStore vectorStore,
        ChatMemory chatMemory) {

    // Search request with metadata filtering
    var searchRequest = SearchRequest.builder()
        .topK(20)
        .similarityThreshold(0.7)
        .build();

    return builder
        .defaultSystem("""
            Voce e o Doutor do Trabalho, um assistente juridico especializado
            em Direito do Trabalho portugues. Responda SEMPRE com base nos
            artigos da lei fornecidos no contexto. Cite os artigos especificos.
            Se nao tiver informacao suficiente, diga explicitamente.
            Responda em portugues.
            """)
        .defaultAdvisors(
            new QuestionAnswerAdvisor(vectorStore, searchRequest),
            new MessageChatMemoryAdvisor(chatMemory, 10),
            new SafetyAdvisor(),
            new CitationExtractionAdvisor()
        )
        .defaultTools(new LaborLawCalculatorTools())
        .build();
}
```

### Advisor Chain

1. **MessageChatMemoryAdvisor** -- maintains conversation context (last 10 messages)
2. **QuestionAnswerAdvisor** -- retrieves relevant law chunks from pgvector
3. **SafetyAdvisor** -- filters non-legal queries, prevents jailbreaks
4. **CitationExtractionAdvisor** -- post-processes response to extract and validate citations

### Tool Definitions

```java
public class LaborLawCalculatorTools {

    @Tool(description = "Calculate severance pay (indemnizacao por despedimento) "
        + "based on employment duration, salary, and termination type")
    public SeveranceResult calculateSeverance(
            BigDecimal monthlySalary,
            LocalDate startDate,
            LocalDate endDate,
            TerminationType terminationType) {
        // Implementation with proper legal formula
    }

    @Tool(description = "Calculate overtime pay (trabalho suplementar) "
        + "based on hours worked and applicable rates")
    public OvertimeResult calculateOvertime(
            BigDecimal hourlyRate,
            int normalHours,
            int overtimeHours,
            boolean isHoliday,
            boolean isNightWork) {
        // Implementation per CT articles 226-231
    }

    @Tool(description = "Calculate vacation days (ferias) entitlement "
        + "based on employment start date and current year")
    public VacationResult calculateVacation(
            LocalDate employmentStartDate,
            int referenceYear) {
        // Implementation per CT articles 237-247
    }
}
```

### Embedding Model Selection

For the MVP, we use OpenAI's `text-embedding-3-small` (1536 dimensions) due to:
- Good multilingual (Portuguese) support
- Cost-effective for MVP
- Spring AI has built-in support

For production, evaluate:
- `voyage-3` (better for legal text)
- `multilingual-e5-large` (open-source, self-hosted)

## Consequences

### Positive
- **Legal accuracy**: Structural chunking preserves article context, improving retrieval quality
- **Citations**: Every answer can reference specific articles, building user trust
- **Spring AI native**: Uses framework abstractions, making upgrades straightforward
- **Extensible**: New tools, advisors, and document types can be added independently
- **Cost-efficient**: Metadata filtering reduces unnecessary vector comparisons

### Negative
- **Custom splitter maintenance**: The legal article splitter must be updated when law formatting changes
- **Embedding model lock-in**: Changing embedding models requires re-indexing the entire corpus
- **Portuguese language**: Some embedding models perform worse on Portuguese than English
- **Latency**: Full advisor chain adds latency to each query (~2-5s total)

### Mitigations
- Cache embeddings aggressively -- the law corpus changes infrequently
- Implement a re-indexing pipeline that can run in background
- Benchmark embedding models on a Portuguese legal test set before committing
- Use streaming responses to improve perceived latency
