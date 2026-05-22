# ADR-003: Vector Store Selection -- pgvector

**Status:** Accepted  
**Date:** 2026-05-22  
**Category:** Vector Store  
**Deciders:** Diogo Sousa (Architect)  

## Context

We need a vector store to persist embeddings for the Portuguese labor law corpus (estimated ~50,000 chunks at MVP, growing to ~500,000 with jurisprudence). Requirements:

1. **Spring AI integration**: Must have a Spring AI VectorStore implementation
2. **Metadata filtering**: Filter by law type, article number, effective date
3. **Operational simplicity**: Minimize infrastructure complexity for MVP
4. **Cost**: Keep costs low for early stage
5. **Scalability**: Must handle production load (100+ concurrent users)
6. **Portuguese text support**: Store and retrieve Portuguese content correctly

### Options Considered

| Criteria | pgvector | Qdrant | Pinecone | Weaviate |
|----------|----------|--------|----------|----------|
| Spring AI support | Yes | Yes | Yes | Yes |
| Metadata filtering | SQL WHERE | Native | Native | GraphQL |
| Ops complexity | Low (same DB) | Medium | Low (managed) | Medium |
| Cost (MVP) | Free (shared PG) | Free tier | $70+/mo | Free tier |
| Scale to 500K | Good with HNSW | Excellent | Excellent | Good |
| Self-hostable | Yes | Yes | No | Yes |

## Decision

We choose **pgvector** (PostgreSQL extension) as the vector store for both MVP and initial production.

### Rationale

1. **Single database**: We already need PostgreSQL for domain data, auth, and audit. Using pgvector means one database to manage, back up, and monitor.
2. **Transactional consistency**: Embeddings and metadata can participate in the same transaction as domain data.
3. **SQL metadata filtering**: We can use standard SQL WHERE clauses for filtering, which is natural for the team.
4. **Cost**: Zero additional infrastructure cost -- pgvector is a free PostgreSQL extension.
5. **Spring AI PgVectorStore**: First-class support in Spring AI with automatic schema creation.

### Schema Design

```sql
-- pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Spring AI managed table (auto-created by PgVectorStore)
-- We customize with additional indexes
CREATE TABLE IF NOT EXISTS vector_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),  -- text-embedding-3-small dimensions
    created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_vector_store_embedding
    ON vector_store
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200);

-- Metadata indexes for filtered search
CREATE INDEX IF NOT EXISTS idx_vector_store_corpus_type
    ON vector_store ((metadata->>'corpus_type'));

CREATE INDEX IF NOT EXISTS idx_vector_store_law_number
    ON vector_store ((metadata->>'law_number'));

CREATE INDEX IF NOT EXISTS idx_vector_store_article
    ON vector_store ((metadata->>'article'));

-- GIN index for full JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_vector_store_metadata
    ON vector_store USING gin (metadata);
```

### Spring AI Configuration

```java
@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore(
            JdbcTemplate jdbcTemplate,
            EmbeddingModel embeddingModel) {
        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
            .dimensions(1536)
            .distanceType(PgVectorStore.PgDistanceType.COSINE_DISTANCE)
            .indexType(PgVectorStore.PgIndexType.HNSW)
            .initializeSchema(true)
            .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return new OpenAiEmbeddingModel(
            new OpenAiApi(System.getenv("OPENAI_API_KEY")),
            OpenAiEmbeddingOptions.builder()
                .model("text-embedding-3-small")
                .build()
        );
    }
}
```

### Performance Considerations

- **HNSW parameters**: `m=16, ef_construction=200` balances recall (~98%) vs. build time
- **Query ef_search**: Default 40, increase to 100 for production accuracy
- **Connection pooling**: Use HikariCP with dedicated pool for vector queries
- **Corpus size**: 50K chunks with 1536-dim vectors ~ 300MB, well within single-node PostgreSQL

### Migration Path

If pgvector becomes a bottleneck (>1M vectors, >50 QPS):
1. Migrate to Qdrant (Spring AI has `QdrantVectorStore`)
2. Export embeddings from pgvector, import to Qdrant
3. Change one Spring `@Bean` definition
4. Hexagonal architecture makes this a single adapter swap

## Consequences

### Positive
- **Simplicity**: One database for everything, one backup strategy, one monitoring stack
- **Cost**: Zero incremental cost for vector storage
- **Transactions**: Embeddings can be updated atomically with metadata
- **SQL power**: Full SQL expressiveness for metadata queries and analytics
- **Team familiarity**: The team already knows PostgreSQL

### Negative
- **Scale ceiling**: Single-node PostgreSQL has limits (~1M vectors before performance degrades)
- **No built-in replication for vectors**: PostgreSQL streaming replication works but is not vector-aware
- **Resource contention**: Vector searches and transactional queries share the same PostgreSQL instance

### Mitigations
- Use a read replica for vector searches in production
- Monitor query latency and set alerts for p95 > 200ms
- Plan migration to dedicated vector store at 500K+ vectors or 30+ QPS
