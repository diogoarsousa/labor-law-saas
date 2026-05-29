# Agent Coordination Guide

## Overview
Your agents (`frontend-dev`, `backend-dev`, `legal-researcher`, `architect`, `pm-tasks`, `business-advisor`) can communicate through the `runSubagent` mechanism. This enables parallel development workflows where frontend and backend are designed together.

## Communication Patterns

### Pattern 1: Frontend → Backend Feature Request
**When:** Frontend developer needs a new API endpoint.

```
Frontend Developer:
"I'm building a contract review form. I need:
- POST /api/v1/doutor-trabalho/contracts/analyze
- Request: { contractText: string, analysisType: 'compliance' | 'risks' }
- Response: { violations: [], riskScore: number, recommendations: [] }"

You invoke:
runSubagent("backend-dev", "Design POST /api/v1/doutor-trabalho/contracts/analyze endpoint. 
Request DTO: { contractText: string, analysisType: 'compliance' | 'risks' }
Response DTO: { violations: [], riskScore: number, recommendations: [] }
Include Spring Boot @RestController, @Service, unit tests, and database schema if needed.")

Backend-dev responds with:
- Complete Spring Boot controller + service
- Request/Response DTOs (records)
- Database schema DDL
- Integration test example
- JWT auth guard code

You then implement:
- React form component (Next.js)
- TanStack Query hook to call the API
- Error handling + loading states
```

### Pattern 2: Backend → Frontend Dependency
**When:** Backend needs UI design for a feature.

```
Backend Developer:
"I've built the legal document API. What UI should I build endpoints for?
Fields: [title, content, status: 'draft' | 'reviewed' | 'signed', createdAt]"

You invoke:
runSubagent("frontend-dev", "Design a legal document list page with sorting/filtering.
Columns: [title, status, createdAt, actions]. 
Support bulk actions (review, archive). Show document preview on row click.")

Frontend-dev responds with:
- Next.js page component
- Data table with shadcn/ui
- Filter/sort hooks
- API integration points (endpoints expected)

You then implement:
- Spring Boot endpoints matching the expected API contract
- Database queries with sorting/pagination
- Business logic (status transitions, archiving)
```

### Pattern 3: Frontend + Backend + Legal Research
**When:** Building a feature that needs legal compliance checks.

```
Feature: "Compliance checker for dismissal letters"

Frontend-dev:
"I need a form UI where users input [employeeData, dismissalReason, timeline].
Returns compliance report with violations."

You invoke:
runSubagent("backend-dev", "Implement POST /api/v1/doutor-trabalho/compliance/dismissal-check
that validates dismissal compliance with Código do Trabalho. 
Call legal research agent for current dismissal law rules.")

Backend-dev:
"I'll create the endpoint. But I need to know: What are the current legal requirements for valid dismissals?
Invoke runSubagent("legal-researcher", "What are the legal requirements for valid dismissals under Código do Trabalho? 
Include: notice periods, valid grounds, severance calculations, ACT approval triggers.") "

Legal-researcher returns:
- Article citations (e.g., Art. 230.º CT)
- Current dismissal rules
- Edge cases (pregnancy, union activity, etc.)

You implement:
- Spring Boot service that applies legal rules
- Compliance scoring logic
- Database storage of checks (audit trail)

Frontend-dev implements:
- Form component with dismissal scenarios
- Results display showing violations + citations
```

## Invocation Template

When calling another agent, use this structure:

```typescript
// Option 1: Simple runSubagent call
runSubagent("backend-dev", 
  `Design a Spring Boot endpoint for feature X.
   Request: { field1: string, field2: number }
   Response: { result: string, status: 'success' | 'error' }
   Include: @RestController, @Service, DTOs, tests, schema.`)

// Option 2: Multi-agent coordination
runSubagent("backend-dev",
  `Build feature Y. First, call legal-researcher:
   "What does Código do Trabalho say about Z?"
   Then implement the backend using those legal rules.`)
```

## Best Practices

1. **Be Specific:** Include exact field names, types, API paths.
2. **Chain Agents:** If backend needs legal info, it can invoke legal-researcher itself.
3. **Share Context:** Reference the [CLAUDE.md](../CLAUDE.md) project context for conventions.
4. **Agree on Contracts:** Frontend and backend must align on API DTOs before coding.
5. **Test Together:** After coordination, verify the integration works end-to-end.

## Agent Capabilities

| Agent | Can invoke | Best used for |
|-------|-----------|---------------|
| `frontend-dev` | `backend-dev`, `architect` | UI/UX, component design, forms |
| `backend-dev` | `legal-researcher`, `architect`, `frontend-dev` | APIs, schemas, tool definitions |
| `legal-researcher` | `architect` | Legal interpretation, compliance |
| `architect` | all agents | System design reviews, trade-offs |
| `pm-tasks` | all agents | Breaking features into GitHub issues |

## Example Feature Flow

**Feature:** "Case tracker with legal research integration"

1. `pm-tasks`: Break into issues → frontend, backend, legal research subtasks
2. `frontend-dev`: Design case list UI → ask `backend-dev` for API contract
3. `backend-dev`: Implement case APIs → ask `legal-researcher` for case law rules
4. `legal-researcher`: Provide relevant jurisprudence → backend integrates it
5. `frontend-dev`: Connect form to API → test full flow
6. `architect`: Review for scaling + RAG efficiency (vector caching, async processing)

## Summary

✅ **You have inter-agent communication enabled via `runSubagent`.** Use it to:
- Design APIs together (frontend ↔ backend)
- Inject legal rules into business logic (backend ↔ legal-researcher)
- Review architecture (any agent ↔ architect)
- Plan sprints (pm-tasks coordinates all)
- Test compliance (backend + legal-researcher + frontend)
