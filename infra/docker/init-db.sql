-- Initialize databases for Doutor do Trabalho

-- Create Keycloak database
CREATE DATABASE keycloak;

-- Enable pgvector extension on main database
\c doutortrabalho;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Vector store table (Spring AI PgVectorStore will also auto-create this)
CREATE TABLE IF NOT EXISTS vector_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HNSW index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_vector_store_embedding
    ON vector_store
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200);

-- Metadata indexes
CREATE INDEX IF NOT EXISTS idx_vector_store_corpus_type
    ON vector_store ((metadata->>'corpus_type'));

CREATE INDEX IF NOT EXISTS idx_vector_store_law_number
    ON vector_store ((metadata->>'law_number'));

CREATE INDEX IF NOT EXISTS idx_vector_store_article
    ON vector_store ((metadata->>'article'));

CREATE INDEX IF NOT EXISTS idx_vector_store_metadata
    ON vector_store USING gin (metadata);
