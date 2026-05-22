# Feature: Compliance Checker

## Overview
Validate HR policies, internal regulations, and workplace practices against current Portuguese labor law.

## User Stories

### US-01: Check Policy Compliance
**As a** HR director  
**I want to** check if our internal policies comply with labor law  
**So that** I can avoid penalties from ACT inspections  

**Acceptance Criteria:**
- Upload policy document or paste text
- AI identifies compliant and non-compliant sections
- Each finding cites the relevant law article
- Severity levels: Critical (legal violation), Warning (best practice), Info
- Export compliance report as PDF

### US-02: Compliance Dashboard
**As a** HR director  
**I want to** see an overview of our company's compliance status  
**So that** I can track improvement over time  

**Acceptance Criteria:**
- Dashboard shows compliance score by category
- Historical trend chart
- List of open compliance issues with deadlines
- Alerts for new legislative changes affecting compliance

## Technical Design
- **Endpoint**: `POST /api/v1/doutor-trabalho/compliance/check`
- **Rule Engine**: Configurable compliance rules mapped to law articles
- **AI**: Claude for natural language policy analysis
- **Reports**: PDF generation with charts

## Priority: P1
## Complexity: Medium
## Estimated Effort: 2 sprints
