# Feature: Labor Law Calculators

## Overview
Accurate calculators for common labor law computations: severance pay, overtime, vacation entitlement, seniority, and more.

## User Stories

### US-01: Severance Pay Calculator
**As a** HR professional  
**I want to** calculate severance pay for an employee termination  
**So that** I ensure the correct legal amount is paid  

**Acceptance Criteria:**
- Input: monthly salary, start date, end date, termination type
- Output: severance amount with calculation breakdown
- Shows the applicable law articles and formula
- Handles different eras of legislation (pre-2011, 2011-2012, post-2013)

### US-02: Overtime Calculator
**As a** HR professional  
**I want to** calculate overtime pay  
**So that** I comply with legal overtime rates  

**Acceptance Criteria:**
- Input: base hourly rate, overtime hours, day type (normal/holiday/rest day)
- Output: overtime pay with rate breakdown
- Handles night work surcharge
- References CT articles 226-231

### US-03: Vacation Entitlement Calculator
**As a** worker  
**I want to** calculate my vacation days entitlement  
**So that** I know my rights  

**Acceptance Criteria:**
- Input: employment start date, reference year
- Output: vacation days with breakdown (base + seniority bonus)
- Handles first year of employment (proportional)
- References CT articles 237-247

## Technical Design
- **Endpoints**: `POST /api/v1/doutor-trabalho/calculators/{type}`
- **Types**: severance, overtime, vacation, seniority, night-work, holiday-pay
- **AI Integration**: Available as @Tool for the Legal Q&A agent
- **Validation**: Strict input validation with clear error messages

## Priority: P1
## Complexity: Medium
## Estimated Effort: 1 sprint
