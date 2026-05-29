---
name: review-architecture
description: >
  Review a proposed architecture or implementation approach using the architect agent.
  Provides trade-off analysis, Spring AI patterns, and an ADR if needed.
agent: architect
---

Review the following architecture or implementation:

$DESCRIPTION_OR_CODE

Steps:
1. Identify the core design decisions being made
2. Evaluate against Spring AI best practices
3. Highlight trade-offs (simplicity vs scalability, cost vs quality)
4. Suggest improvements with a code example
5. Produce an ADR if this is a significant decision
