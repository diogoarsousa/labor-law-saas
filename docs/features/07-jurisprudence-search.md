# Feature: Jurisprudence Search

## Overview
Semantic search over Portuguese labor court decisions (STJ, TRL, TRP, TRC, TRE) to find relevant case law.

## User Stories

### US-01: Search Jurisprudence
**As a** lawyer  
**I want to** search labor court decisions semantically  
**So that** I can find relevant precedents for my case  

**Acceptance Criteria:**
- Natural language search query
- Results ranked by relevance with snippet preview
- Filter by court, date range, topic, outcome
- Each result links to full decision text
- AI-generated summary of each decision

### US-02: Related Jurisprudence
**As a** lawyer  
**I want to** see jurisprudence related to a specific law article  
**So that** I understand how courts interpret that article  

**Acceptance Criteria:**
- From any law article, see related court decisions
- Decisions are ordered by relevance and recency
- Summary shows the court's interpretation of the article

## Technical Design
- **Endpoint**: `POST /api/v1/doutor-trabalho/jurisprudence/search`
- **Vector Store**: Separate pgvector table for jurisprudence embeddings
- **Ingestion**: Scrape from dgsi.pt (public court database)
- **Metadata**: Court, date, judges, topic, outcome, referenced articles

## Priority: P2
## Complexity: High
## Estimated Effort: 3 sprints
