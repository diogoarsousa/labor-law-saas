# Feature: Contract Analysis

## Overview
AI-powered analysis of Portuguese employment contracts to identify risks, missing clauses, non-compliant terms, and improvement suggestions.

## User Stories

### US-01: Upload and Analyze Contract
**As a** HR manager  
**I want to** upload an employment contract for AI analysis  
**So that** I can identify compliance issues before signing  

**Acceptance Criteria:**
- Support PDF and DOCX uploads (max 10MB)
- Analysis completes within 30 seconds
- Results show: compliant clauses, risks, missing clauses, suggestions
- Each finding references the relevant law article

### US-02: Risk Score
**As a** lawyer  
**I want to** see an overall compliance risk score for a contract  
**So that** I can quickly prioritize which contracts need attention  

**Acceptance Criteria:**
- Risk score from 0-100 (0 = fully compliant, 100 = high risk)
- Score breakdown by category (duration, compensation, termination, etc.)
- Color-coded risk levels (green/yellow/red)

### US-03: Generate Improved Contract
**As a** HR manager  
**I want to** generate an improved version of a non-compliant contract  
**So that** I can fix issues without starting from scratch  

**Acceptance Criteria:**
- AI generates a corrected version with changes highlighted
- Each change includes the legal justification
- User can accept/reject individual changes
- Final version can be exported as PDF/DOCX

## Technical Design
- **Endpoint**: `POST /api/v1/doutor-trabalho/contracts/analyze`
- **Upload**: Multipart file upload with async processing
- **AI Pipeline**: Document parsing -> Clause extraction -> Compliance check -> Report generation
- **Storage**: S3/MinIO for contract files, PostgreSQL for analysis results

## Priority: P1
## Complexity: High
## Estimated Effort: 3 sprints
