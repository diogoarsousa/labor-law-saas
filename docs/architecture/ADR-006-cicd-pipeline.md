# ADR-006: CI/CD Pipeline Design

**Status:** Accepted  
**Date:** 2026-05-22  
**Category:** Infra & cloud  
**Deciders:** Diogo Sousa (Architect)  

## Context

We need a CI/CD pipeline that:
1. Runs tests and quality checks on every PR
2. Builds and deploys automatically to staging
3. Supports manual promotion to production
4. Handles both backend (Java) and frontend (Next.js) builds
5. Is cost-effective for a startup

## Decision

We use **GitHub Actions** for CI/CD with the following pipeline:

### Pipeline Overview

```
[Push to feature/*]
  -> Lint + Unit Tests + SAST
  -> Build Docker images
  -> Run integration tests (testcontainers)

[PR to develop]
  -> All of above + Code coverage check (>= 80%)
  -> OWASP dependency check
  -> SonarQube analysis

[Merge to develop]
  -> Build + Push Docker images to GHCR
  -> Deploy to staging (Railway)
  -> Run smoke tests

[PR develop -> main]
  -> Staging verification
  -> Manual approval

[Merge to main]
  -> Deploy to production (Railway/AWS)
  -> Health check
  -> Notify team
```

### Key Workflows

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: ./mvnw verify -Pcoverage
      - uses: codecov/codecov-action@v4

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci && npm run lint && npm test

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./mvnw org.owasp:dependency-check-maven:check
```

## Consequences

### Positive
- GitHub Actions is free for public repos, generous for private
- Tight integration with GitHub (PRs, issues, deployments)
- Testcontainers for realistic integration tests
- Security scanning built into the pipeline

### Negative
- GitHub Actions can be slow for large builds
- Limited caching compared to dedicated CI (e.g., BuildKite)
- YAML-based configuration can become complex

### Mitigations
- Use build caching (Maven/npm) aggressively
- Keep workflows modular (separate files per concern)
- Use reusable workflows for common patterns
