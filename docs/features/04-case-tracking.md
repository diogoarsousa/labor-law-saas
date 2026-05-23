# Feature: Case Tracking

## Overview
Track labor law cases, disputes, disciplinary proceedings, and associated deadlines.

## User Stories

### US-01: Create and Manage Cases
**As a** lawyer  
**I want to** create and track labor law cases  
**So that** I never miss a deadline or important event  

**Acceptance Criteria:**
- Create case with: parties, type, status, documents, notes
- Track case events chronologically
- Automatic deadline calculation based on case type
- Email/push notifications for approaching deadlines

### US-02: Case Timeline
**As a** lawyer  
**I want to** see a visual timeline of a case  
**So that** I can quickly understand the case history  

**Acceptance Criteria:**
- Timeline view with all events, deadlines, and documents
- Color-coded by event type
- Filterable by date range and event type

## Technical Design
- **Endpoints**: CRUD at `/api/v1/doutor-trabalho/cases`
- **Deadlines**: Scheduled job for deadline notifications
- **Storage**: PostgreSQL with full-text search
- **Notifications**: Email via SendGrid, push via web notifications

## Priority: P2
## Complexity: Medium
## Estimated Effort: 2 sprints
