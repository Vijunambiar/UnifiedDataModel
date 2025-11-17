# Complete ERD Implementation Plan

## All Banking Domains & Subdomains - Logical & Physical Data Models

### Overview

Systematic implementation of complete and correct ERDs (Entity Relationship Diagrams) for all 21 banking domains, covering both **Logical** and **Physical** data models across Bronze, Silver, and Gold layers.

---

## Domain List (21 Total)

### Priority P0 - Critical Business Domains (5 domains)

1. **Customer Core** - Unified customer domain with 360/CDP
2. **Loans & Lending** - Complete loan lifecycle management
3. **Deposits & Funding** - Comprehensive deposit account management
4. **Fraud & Security** - Enterprise fraud detection
5. **Compliance & AML** - AML monitoring and regulatory compliance
6. **Enterprise Risk Management** - Integrated risk across all domains

### Priority P1 - High Business Value (8 domains)

7. **Credit Cards** - Credit card portfolio management
8. **Payments & Transfers** - Payment processing and transfers
9. **Treasury & ALM** - Asset-liability management
10. **Collections & Recovery** - Delinquency and recovery operations
11. **Revenue & Profitability** - Revenue analytics and profitability
12. **Mortgages** - End-to-end mortgage lifecycle
13. **Trade Finance & Letters of Credit** - International trade finance
14. **Cash Management Services** - Corporate cash management

### Priority P2 - Standard Business Value (8 domains)

15. **Wealth Management** - Wealth and investment advisory
16. **Foreign Exchange** - FX trading and hedging
17. **Operations & Core Banking** - Core operations
18. **Channels & Digital Banking** - Multi-channel engagement
19. **Merchant Services & Acquiring** - Payment acquiring
20. **Leasing & Equipment Finance** - Equipment leasing
21. **Asset-Based Lending (ABL)** - ABL financing

---

## Current Status Analysis

### ✅ Completed Implementations

Based on code review, the following have comprehensive data models:

- Customer Core (customerCoreBronzeLayer, Silver, Gold)
- Loans & Lending (loansBronzeLayer, Silver, Gold)
- Deposits (depositsBronzeLayer, Silver, Gold)
- Credit Cards (creditCardsBronzeLayer, Silver, Gold)
- Payments (paymentsBronzeLayer, Silver, Gold)
- Treasury/ALM (treasuryBronzeLayer, Silver, Gold)
- Risk (riskBronzeLayer, Silver, Gold)
- Compliance/AML (complianceBronzeLayer, Silver, Gold)
- Fraud (fraudBronzeLayer, Silver, Gold)
- Revenue (revenueBronzeLayer, Silver, Gold)
- Mortgages (mortgageBronzeLayer, Silver, Gold)
- Collections (collectionsBronzeLayer, Silver, Gold)
- Operations (operationsBronzeLayer, Silver, Gold)
- Channels (channelsBronzeLayer, Silver, Gold)
- Wealth (wealthBronzeLayer, Silver, Gold)
- FX (fxBronzeLayer, Silver, Gold)
- Trade Finance (tradeFinanceBronzeLayer, Silver, Gold)
- Cash Management (cashManagementBronzeLayer, Silver, Gold)
- Merchant Services (merchantServicesBronzeLayer, Silver, Gold)
- Leasing (leasingBronzeLayer, Silver, Gold)
- ABL (ablBronzeLayer, Silver, Gold)

### 🔄 ERD Relationship Mapping Status

**Current Issue:** While data models exist, the ERD visualization needs enhanced relationship mapping:

1. **Logical ERDs** - Need relationship mapping between business entities
2. **Physical ERDs - Bronze Layer** - Need FK detection and table relationships
3. **Physical ERDs - Silver Layer** - Need FK detection and master table relationships
4. **Physical ERDs - Gold Layer** - Need star schema fact-to-dimension mapping

---

## Implementation Strategy

### Phase 1: Enhanced Relationship Detection (Current Focus) ✅

**Status:** IN PROGRESS

1. ✅ Install React Flow professional ERD library
2. ✅ Create custom TableNode and EntityNode components
3. ✅ Enhanced relationship detection logic:
   - Star schema relationships (facts → dimensions)
   - FK detection based on field names (\_id, \_key)
   - Master table identification (\_master, \_golden)
   - Common domain patterns (loan_balances → loan_master)

**Files Updated:**

- `client/lib/erd-relationships.ts` - Enhanced detection algorithms
- `client/components/PhysicalERD.tsx` - React Flow implementation
- `client/components/LogicalERD.tsx` - React Flow implementation
- `client/components/TableNode.tsx` - Custom table visualization
- `client/components/EntityNode.tsx` - Custom entity visualization

### Phase 2: Domain-by-Domain Verification (Next)

**Goal:** Verify each domain has complete and accurate relationships

#### Verification Checklist (Per Domain):

**Logical ERD:**

- [ ] All key entities mapped
- [ ] Relationships defined (1:1, 1:M, M:M)
- [ ] Relationship labels accurate
- [ ] Business-meaningful connections

**Physical ERD - Bronze Layer:**

- [ ] All raw tables listed
- [ ] Primary keys identified
- [ ] Foreign keys detected
- [ ] Relationships to master tables mapped

**Physical ERD - Silver Layer:**

- [ ] All curated tables listed
- [ ] SCD2 tables identified
- [ ] Golden record relationships
- [ ] Cross-table FKs mapped

**Physical ERD - Gold Layer:**

- [ ] All dimensions listed
- [ ] All facts listed
- [ ] Fact-to-dimension relationships (star schema)
- [ ] Dimension hierarchies (if applicable)

### Phase 3: Domain-Specific Enhancements

**Custom Patterns by Domain:**

1. **Customer Core**
   - Customer → Account (1:M)
   - Customer → Household (M:M)
   - Customer → Contact (1:1)

2. **Loans & Lending**
   - Loan → Customer/Borrower (M:1)
   - Loan → Collateral (1:M)
   - Loan → Payments (1:M)
   - Loan → Modifications (1:M)

3. **Deposits & Funding**
   - Account → Customer (M:1)
   - Account → Transactions (1:M)
   - Account → Interest Accruals (1:M)

4. **Credit Cards**
   - Card → Customer (M:1)
   - Card → Transactions (1:M)
   - Card → Authorizations (1:M)
   - Card → Rewards (1:1)

5. **Treasury & ALM**
   - Security → Holdings (1:M)
   - Security → Trades (1:M)
   - Position → Valuations (1:M)

6. **Gold Layer - Star Schema Patterns**
   - All facts → dim_date
   - All facts → dim_customer
   - Product-specific facts → dim_product
   - Transaction facts → dim_channel
   - Geographic facts → dim_branch

---

## Success Criteria

### Logical ERD Quality Metrics:

- ✅ All keyEntities rendered as nodes
- ✅ Relationships detected and visualized
- ✅ Relationship types labeled (1:1, 1:M, M:M)
- ✅ Interactive navigation (pan, zoom)

### Physical ERD Quality Metrics:

- ✅ All tables from Bronze/Silver/Gold rendered
- ✅ Table columns displayed (up to 6 visible)
- ✅ PK/FK badges shown correctly
- ✅ Relationships drawn between tables
- ✅ Star schema layout for Gold layer
- ✅ Grid layout for Bronze/Silver layers

### Relationship Detection Metrics:

- Target: 80%+ relationship detection rate
- Bronze: Detect FK → Master table relationships
- Silver: Detect Golden record → Detail relationships
- Gold: Detect 100% of star schema fact→dim relationships

---

## Technical Implementation Details

### Relationship Detection Algorithms

**1. Star Schema (Gold Layer):**

```typescript
// Pattern matching:
fact_loan_originations + dim_loan → loan_key FK
fact_transactions + dim_date → date_key FK
fact_* + dim_customer → customer_key FK (common dimension)
```

**2. Bronze/Silver FK Detection:**

```typescript
// Field name patterns:
*_id → FK to *_master table
*_key → FK to *_golden table
customer_id → customer_master
loan_id → loan_master
```

**3. Logical Relationships:**

```typescript
// Entity name matching:
"Customer" + "Account" → 1:M relationship
"Loan" + "Collateral" → 1:M relationship
"Customer" + "Household" → M:M relationship
```

### Console Debugging

Enhanced logging at each layer:

- Bronze layer relationship count
- Silver layer relationship count
- Gold layer relationship count
- Node matching success/failure
- Edge creation confirmation

---

## Next Steps

1. **Run Verification** - Check console logs for each domain
2. **Identify Gaps** - Find domains with 0 relationships
3. **Enhance Patterns** - Add domain-specific relationship rules
4. **Test Coverage** - Verify all 21 domains render correctly
5. **Document Findings** - Create domain-by-domain ERD status report

---

## Domain Subdomain Breakdown

### 1. Customer Core (13 subdomains)

- Customer 360 & CDP
- Identity Resolution
- Customer Lifecycle Management
- Customer Segmentation
- Customer Journey Orchestration
- Event Streaming & Processing
- Next-Best-Action Engine
- Digital Analytics (Web & Mobile)
- Touchpoint Analytics
- Multi-touch Attribution
- A/B Testing & Experimentation
- Feature Adoption Tracking
- Preference & Consent Management

### 2. Loans & Lending (8 subdomains)

- Retail Lending
- Commercial Lending
- Mortgage Lending
- Auto Loans
- Personal Loans
- Student Loans
- Loan Servicing
- Delinquency Management

### 3. Deposits & Funding (8 subdomains)

- Demand Deposits (DDA)
- Savings Accounts
- Money Market Accounts
- Certificates of Deposit (CD)
- Sweep Accounts
- Escrow Accounts
- Interest Bearing Accounts
- Non-Interest Bearing Accounts

### 4. Credit Cards (10 subdomains)

- Consumer Cards
- Business Cards
- Co-branded Cards
- Secured Cards
- Card Authorizations
- Card Transactions
- Revolving Balances
- Rewards Programs
- Interchange
- Chargebacks

### 5. Payments & Transfers (10 subdomains)

- ACH Payments
- Wire Transfers
- Real-time Payments (RTP)
- P2P Transfers
- Bill Pay
- Cross-border Payments
- SWIFT Transactions
- Check Processing
- Payment Rails
- Settlement

### 6. Treasury & ALM (8 subdomains)

- Asset-Liability Management
- Investment Securities
- Trading Portfolio
- Funding & Liquidity
- Interest Rate Risk
- Capital Markets
- Derivatives & Hedging
- Balance Sheet Management

### 7. Fraud & Security (9 subdomains)

- Transaction Fraud
- Identity Fraud
- Account Takeover (ATO)
- Card Fraud
- Wire Fraud
- Check Fraud
- Digital Channel Fraud
- Synthetic Identity Fraud
- Insider Fraud

### 8. Compliance & AML (8 subdomains)

- AML Monitoring
- KYC (Know Your Customer)
- Sanctions Screening
- Customer Due Diligence (CDD)
- Enhanced Due Diligence (EDD)
- Suspicious Activity Reporting
- Transaction Monitoring
- Watchlist Screening

### 9. Collections & Recovery (8 subdomains)

- Early Delinquency
- Late Stage Collections
- Charge-off Processing
- Recovery Operations
- Legal Collections
- Third-party Collections
- Repossession
- Bankruptcy Management

### 10. Enterprise Risk Management (8 subdomains)

- Credit Risk
- Market Risk
- Operational Risk
- Liquidity Risk
- Concentration Risk
- Model Risk
- Stress Testing
- CCAR/DFAST

### 11-21. Additional Domains

All have similar subdomain structures documented in enterprise-domains.ts

---

## Files to Monitor

**Data Model Files:**

- `client/lib/*-comprehensive.ts` (21 files)

**ERD Component Files:**

- `client/components/LogicalERD.tsx`
- `client/components/PhysicalERD.tsx`
- `client/components/TableNode.tsx`
- `client/components/EntityNode.tsx`

**Relationship Logic:**

- `client/lib/erd-relationships.ts`
- `client/lib/domain-evaluation.ts`

**UI Pages:**

- `client/pages/DataModels.tsx`

---

## Quality Assurance Checklist

For each of 21 domains, verify:

- [ ] Logical ERD renders
- [ ] Logical relationships visible
- [ ] Physical Bronze ERD renders
- [ ] Bronze relationships visible
- [ ] Physical Silver ERD renders
- [ ] Silver relationships visible
- [ ] Physical Gold ERD renders
- [ ] Gold star schema relationships visible
- [ ] All PK/FK badges correct
- [ ] Interactive features work (pan, zoom, minimap)

**Total Verification Points:** 21 domains × 10 checks = 210 verification points

---

## Status: Phase 1 Complete ✅

Next: Domain-by-domain verification and enhancement
