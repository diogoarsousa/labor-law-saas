# Feature: AI Legal Q&A (Doutor do Trabalho)

## Overview
RAG-based conversational AI that answers Portuguese labor law questions with citations to specific articles of the Codigo do Trabalho and related legislation.

## User Stories

### US-01: Ask a Legal Question
**As a** HR professional  
**I want to** ask a labor law question in natural language  
**So that** I get an accurate, cited answer without needing to search legislation manually  

**Acceptance Criteria:**
- User can type a question in Portuguese
- Response includes the answer text and citations to specific law articles
- Each citation links to the source article text
- Response time < 5 seconds (streaming)
- Session history is maintained for follow-up questions

### US-02: View Citations
**As a** lawyer  
**I want to** see the exact law articles referenced in an answer  
**So that** I can verify the AI's interpretation  

**Acceptance Criteria:**
- Citations appear as clickable references in the answer
- Clicking a citation shows the full article text
- Article text shows the law name, article number, and effective date
- User can report incorrect citations

### US-03: Conversation History
**As a** user  
**I want to** continue a previous conversation  
**So that** I can ask follow-up questions with context  

**Acceptance Criteria:**
- Sessions are persisted and listed in sidebar
- Previous messages are loaded when reopening a session
- Context from previous messages is used for follow-up answers
- Sessions can be renamed and deleted

## Technical Design
- **Endpoint**: `POST /api/v1/doutor-trabalho/legal-qa/ask`
- **Streaming**: SSE (Server-Sent Events) for real-time response
- **Spring AI**: ChatClient with QuestionAnswerAdvisor + MessageChatMemoryAdvisor
- **Vector Store**: pgvector with metadata filtering by corpus_type
- **Rate Limiting**: 50 questions/hour for free tier, unlimited for paid

## Priority: P0 (MVP Core)
## Complexity: High
## Estimated Effort: 3 sprints
