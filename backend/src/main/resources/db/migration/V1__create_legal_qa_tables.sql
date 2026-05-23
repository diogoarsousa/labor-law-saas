-- V1: Create Legal Q&A domain tables
-- Bounded Context: LegalQA (P0 - MVP Core)

-- QA Sessions (aggregate root)
CREATE TABLE IF NOT EXISTS qa_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         VARCHAR(255) NOT NULL,
    title           VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_qa_sessions_tenant_user
    ON qa_sessions (tenant_id, user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_qa_sessions_updated
    ON qa_sessions (updated_at DESC)
    WHERE deleted_at IS NULL;

-- QA Exchanges (question-answer pairs within a session)
CREATE TABLE IF NOT EXISTS qa_exchanges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES qa_sessions(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    tokens_input    INTEGER,
    tokens_output   INTEGER,
    latency_ms      BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qa_exchanges_session
    ON qa_exchanges (session_id, created_at ASC);

-- Citations (legal references in answers)
CREATE TABLE IF NOT EXISTS citations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id     UUID NOT NULL REFERENCES qa_exchanges(id) ON DELETE CASCADE,
    law_number      VARCHAR(100) NOT NULL,
    article         VARCHAR(50) NOT NULL,
    article_text    TEXT,
    source_url      VARCHAR(500),
    corpus_type     VARCHAR(30) NOT NULL
);

CREATE INDEX idx_citations_exchange
    ON citations (exchange_id);

CREATE INDEX idx_citations_article
    ON citations (law_number, article);
