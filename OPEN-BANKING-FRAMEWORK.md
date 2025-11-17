# Open Banking / Open Finance Data Model Framework

## Version 1.0 | Enterprise Banking Implementation

---

## 📋 Executive Summary

**Purpose:** Define comprehensive data models for Open Banking and Open Finance capabilities, enabling third-party access to customer financial data through secure APIs in compliance with global regulations.

**Regulations Covered:**
- **PSD2** (Payment Services Directive 2) - Europe
- **Dodd-Frank 1033** - United States
- **CDR** (Consumer Data Right) - Australia
- **Open Banking Standard** - UK
- **GDPR** (Data Privacy) - Europe
- **CCPA** (California Consumer Privacy Act) - US

**Scope:**
- Account Information Services (AIS)
- Payment Initiation Services (PIS)
- Confirmation of Funds (COF)
- Consent Management
- Third-Party Provider (TPP) Management
- API Analytics & Monitoring

---

## 🌐 Table of Contents

1. [Open Banking Concepts](#open-banking-concepts)
2. [Regulatory Requirements](#regulatory-requirements)
3. [API Services](#api-services)
4. [Data Models](#data-models)
5. [Consent Framework](#consent-framework)
6. [Security & Authentication](#security--authentication)
7. [Revenue Models](#revenue-models)

---

## 🏦 Open Banking Concepts

### What is Open Banking?

**Definition:** Regulatory framework requiring banks to share customer financial data with authorized third-party providers (TPPs) via secure APIs, with customer consent.

**Key Participants:**

1. **Account Servicing Payment Service Provider (ASPSP):** The bank holding customer accounts
2. **Third-Party Provider (TPP):** External service provider accessing bank data
   - **AISP** (Account Information Service Provider): Read-only account access
   - **PISP** (Payment Initiation Service Provider): Payment initiation
   - **CBPII** (Card-Based Payment Instrument Issuer): Funds confirmation
3. **Payment Service User (PSU):** The customer/account holder
4. **Competent Authority:** Regulatory body overseeing compliance

### Business Value

**For Banks:**
- New revenue streams (API fees, revenue sharing)
- Enhanced digital capabilities
- Regulatory compliance
- Customer retention (ecosystem lock-in)
- Data monetization opportunities

**For Customers:**
- Account aggregation across banks
- Better financial management tools
- Easier payment initiation
- Improved credit access (alternative data)

**For TPPs:**
- Access to customer financial data
- Ability to build innovative services
- Level playing field with banks

---

## 📜 Regulatory Requirements

### PSD2 (Europe) - Payment Services Directive 2

**Effective:** January 2018
**Scope:** EEA (European Economic Area)

**Key Requirements:**

1. **XS2A (Access to Account):** Banks must provide API access
2. **Strong Customer Authentication (SCA):** Two-factor authentication required
3. **Data Access Rights:** Customer consent for 90 days maximum
4. **Performance Standards:** 99.5% API availability
5. **Technical Standards:** Berlin Group, STET, Polish API, Open Banking UK

**APIs Required:**
- Account Information API
- Payment Initiation API
- Confirmation of Funds API

**Data Elements:**
```
- Account details (IBAN, account type, currency)
- Balance information (current, available, credit limit)
- Transaction history (up to 90 days without consent renewal)
- Standing orders
- Direct debits
```

### Dodd-Frank Section 1033 (United States)

**Effective:** Proposed rules 2023-2024
**Scope:** United States financial institutions

**Key Requirements:**

1. **Consumer Access:** Right to access and port financial data
2. **Authorized Third Parties:** Customer can grant TPP access
3. **Data Minimization:** Only necessary data shared
4. **Security Standards:** Strong authentication and encryption
5. **Portability:** Machine-readable formats (JSON, XML)

**Data Categories:**
```
- Account information
- Transaction data
- Payments
- Investments
- Credit products
- Insurance
```

### Consumer Data Right (Australia)

**Effective:** July 2020
**Scope:** Australia (banking first, expanding to energy, telecoms)

**Key Requirements:**

1. **Consumer Control:** Customer owns and controls data
2. **Accredited Data Recipients:** TPPs must be accredited
3. **Data Standards:** FAPI (Financial-grade API) security
4. **Reciprocity:** Banks can also request data from TPPs
5. **Consent Dashboard:** Customer visibility into consents

---

## 🔌 API Services

### 1. Account Information Service (AIS)

**Purpose:** Read-only access to customer account data

**Endpoints:**

```
GET /accounts
GET /accounts/{accountId}
GET /accounts/{accountId}/balances
GET /accounts/{accountId}/transactions
GET /accounts/{accountId}/standing-orders
GET /accounts/{accountId}/direct-debits
GET /accounts/{accountId}/beneficiaries
```

**Use Cases:**
- Account aggregation (view all accounts in one app)
- Personal finance management (budgeting tools)
- Financial planning
- Credit decisioning (alternative data)

**Data Retention:**
- Historical transactions: 90 days (PSD2), 24 months (UK Open Banking)
- Consent validity: 90 days (renewable)

### 2. Payment Initiation Service (PIS)

**Purpose:** Initiate payments on behalf of customer

**Endpoints:**

```
POST /payments/domestic
POST /payments/international
POST /payments/standing-orders
GET /payments/{paymentId}
GET /payments/{paymentId}/status
```

**Payment Types:**
- **Domestic:** Same-country payments
- **International:** Cross-border payments
- **Standing Orders:** Recurring payments
- **Bulk Payments:** Multiple payments in one request

**Use Cases:**
- E-commerce checkout (bank transfer)
- Bill payment
- P2P payments
- Subscription payments

**Payment Statuses:**
```
- Pending
- AcceptedSettlementInProcess
- AcceptedSettlementCompleted
- Rejected
- AcceptedWithoutPosting
```

### 3. Confirmation of Funds (COF)

**Purpose:** Real-time check if sufficient funds available

**Endpoints:**

```
POST /funds-confirmations
```

**Use Cases:**
- Card authorization (reduce declines)
- Real-time payment guarantees
- E-commerce fraud prevention

**Response:**
```json
{
  "fundsAvailable": true,
  "requestId": "uuid",
  "timestamp": "2025-01-08T12:00:00Z"
}
```

### 4. Consent Management

**Purpose:** Manage customer consents for data access

**Endpoints:**

```
POST /consents
GET /consents/{consentId}
DELETE /consents/{consentId}
```

**Consent Attributes:**
```
- Consent ID (unique identifier)
- TPP ID (which TPP has access)
- Scope (which data: accounts, transactions, payments)
- Permissions (read, write)
- Expiration date (max 90 days for PSD2)
- Status (authorized, revoked, expired)
- Creation timestamp
- Last accessed timestamp
```

---

## 📊 Data Models

### Bronze Layer (Raw API Logs)

```typescript
export const openBankingBronzeLayer = {
  tables: [
    {
      name: 'bronze.openbanking_api_requests',
      description: 'Raw API request logs',
      schema: {
        request_id: "STRING PRIMARY KEY COMMENT 'Unique request ID'",
        api_endpoint: "STRING COMMENT '/accounts, /payments, etc.'",
        http_method: "STRING COMMENT 'GET, POST, PUT, DELETE'",
        tpp_id: "STRING COMMENT 'Third-party provider ID'",
        customer_id: "BIGINT COMMENT 'Customer identifier'",
        consent_id: "STRING COMMENT 'Consent reference'",
        request_timestamp: "TIMESTAMP COMMENT 'Request time'",
        response_status: "INTEGER COMMENT 'HTTP status code'",
        response_time_ms: "INTEGER COMMENT 'Response time in milliseconds'",
        ip_address: "STRING COMMENT 'Client IP address'",
        user_agent: "STRING COMMENT 'Client user agent'",
        request_payload: "STRING COMMENT 'Full request JSON'",
        response_payload: "STRING COMMENT 'Full response JSON'",
        error_code: "STRING COMMENT 'Error code if failed'",
        error_message: "STRING COMMENT 'Error description'",
      },
    },
    
    {
      name: 'bronze.openbanking_account_requests',
      description: 'Account information API requests',
      schema: {
        request_id: "STRING PRIMARY KEY",
        tpp_id: "STRING",
        customer_id: "BIGINT",
        consent_id: "STRING",
        account_id: "STRING",
        request_type: "STRING COMMENT 'accounts|balances|transactions'",
        date_from: "DATE COMMENT 'Transaction start date'",
        date_to: "DATE COMMENT 'Transaction end date'",
        request_timestamp: "TIMESTAMP",
        accounts_returned: "INTEGER COMMENT 'Number of accounts in response'",
        transactions_returned: "INTEGER COMMENT 'Number of transactions returned'",
      },
    },
    
    {
      name: 'bronze.openbanking_payment_requests',
      description: 'Payment initiation API requests',
      schema: {
        request_id: "STRING PRIMARY KEY",
        payment_id: "STRING COMMENT 'Unique payment ID'",
        tpp_id: "STRING",
        customer_id: "BIGINT",
        consent_id: "STRING",
        payment_type: "STRING COMMENT 'domestic|international|standing-order'",
        creditor_account: "STRING COMMENT 'Beneficiary account (IBAN)'",
        creditor_name: "STRING",
        amount: "DECIMAL(18,2)",
        currency: "STRING",
        payment_status: "STRING COMMENT 'Pending|Accepted|Rejected'",
        request_timestamp: "TIMESTAMP",
        execution_date: "DATE",
      },
    },
    
    {
      name: 'bronze.openbanking_consent_events',
      description: 'Consent lifecycle events',
      schema: {
        event_id: "STRING PRIMARY KEY",
        consent_id: "STRING",
        customer_id: "BIGINT",
        tpp_id: "STRING",
        event_type: "STRING COMMENT 'Created|Authorized|Revoked|Expired|Accessed'",
        event_timestamp: "TIMESTAMP",
        consent_status: "STRING",
        permissions_granted: "ARRAY<STRING> COMMENT 'Array of permissions'",
        expiration_date: "TIMESTAMP",
        revocation_reason: "STRING",
      },
    },
  ],
};
```

### Silver Layer (Cleansed & Enriched)

```typescript
export const openBankingSilverLayer = {
  tables: [
    {
      name: 'silver.openbanking_consents_golden',
      description: 'Golden record of customer consents',
      schema: {
        consent_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
        consent_id: "STRING UNIQUE",
        customer_id: "BIGINT",
        customer_sk: "BIGINT COMMENT 'FK to dim_customer'",
        tpp_id: "STRING",
        consent_type: "STRING COMMENT 'AIS|PIS|COF'",
        status: "STRING COMMENT 'Active|Revoked|Expired'",
        permissions: "ARRAY<STRING>",
        scopes: "ARRAY<STRING> COMMENT 'accounts|payments|funds-confirmation'",
        created_date: "TIMESTAMP",
        authorized_date: "TIMESTAMP",
        expiration_date: "TIMESTAMP",
        revoked_date: "TIMESTAMP",
        last_accessed_date: "TIMESTAMP",
        access_count: "INTEGER COMMENT 'Number of times accessed'",
        is_active: "BOOLEAN",
        // SCD2
        effective_date: "DATE",
        expiration_date_scd: "DATE",
        is_current: "BOOLEAN",
      },
    },
    
    {
      name: 'silver.openbanking_tpp_master',
      description: 'Third-party provider master data',
      schema: {
        tpp_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
        tpp_id: "STRING UNIQUE",
        tpp_name: "STRING",
        tpp_type: "STRING COMMENT 'AISP|PISP|CBPII|Hybrid'",
        authorization_number: "STRING COMMENT 'Regulatory authorization ID'",
        competent_authority: "STRING COMMENT 'FCA|BaFin|etc.'",
        country_code: "STRING",
        registration_date: "DATE",
        status: "STRING COMMENT 'Active|Suspended|Revoked'",
        api_key: "STRING COMMENT 'API key (encrypted)'",
        certificate_thumbprint: "STRING COMMENT 'X.509 certificate'",
        certificate_expiry: "DATE",
        website_url: "STRING",
        support_email: "STRING",
        // SCD2
        effective_date: "DATE",
        expiration_date: "DATE",
        is_current: "BOOLEAN",
      },
    },
  ],
};
```

### Gold Layer (Analytics)

```typescript
export const openBankingGoldLayer = {
  dimensions: [
    {
      name: 'gold.dim_open_banking_provider',
      description: 'Third-party provider dimension',
      schema: {
        tpp_key: "BIGINT PRIMARY KEY",
        tpp_id: "STRING",
        tpp_name: "STRING",
        tpp_type: "STRING COMMENT 'AISP|PISP|CBPII'",
        tpp_category: "STRING COMMENT 'Fintech|Big Tech|Bank|Credit Union'",
        authorization_status: "STRING",
        country: "STRING",
        region: "STRING",
      },
    },
    
    {
      name: 'gold.dim_consent_scope',
      description: 'Consent scope and permissions dimension',
      schema: {
        consent_scope_key: "BIGINT PRIMARY KEY",
        consent_type: "STRING COMMENT 'AIS|PIS|COF'",
        permission_name: "STRING",
        data_category: "STRING COMMENT 'Accounts|Transactions|Payments'",
        access_level: "STRING COMMENT 'Read|Write'",
      },
    },
    
    {
      name: 'gold.dim_api_endpoint',
      description: 'API endpoint catalog',
      schema: {
        api_endpoint_key: "BIGINT PRIMARY KEY",
        endpoint_path: "STRING COMMENT '/accounts, /payments/domestic'",
        http_method: "STRING",
        api_version: "STRING COMMENT 'v1, v2, v3'",
        service_type: "STRING COMMENT 'AIS|PIS|COF'",
        endpoint_category: "STRING",
      },
    },
  ],
  
  facts: [
    {
      name: 'gold.fact_api_requests',
      description: 'API request activity fact table',
      schema: {
        api_request_key: "BIGINT PRIMARY KEY",
        request_date_key: "INTEGER COMMENT 'FK to dim_date'",
        tpp_key: "BIGINT COMMENT 'FK to dim_open_banking_provider'",
        customer_key: "BIGINT COMMENT 'FK to dim_customer'",
        api_endpoint_key: "BIGINT COMMENT 'FK to dim_api_endpoint'",
        consent_key: "BIGINT COMMENT 'FK to dim_consent'",
        
        // Degenerate dimensions
        request_id: "STRING",
        
        // Measures
        request_count: "BIGINT COMMENT 'Count of requests (usually 1)'",
        response_time_ms: "INTEGER",
        data_volume_kb: "DECIMAL(12,2) COMMENT 'Response payload size'",
        is_successful: "BOOLEAN",
        is_error: "BOOLEAN",
        
        created_timestamp: "TIMESTAMP",
      },
    },
    
    {
      name: 'gold.fact_open_banking_transactions',
      description: 'Transactions accessed via Open Banking APIs',
      schema: {
        ob_transaction_key: "BIGINT PRIMARY KEY",
        transaction_date_key: "INTEGER",
        access_date_key: "INTEGER COMMENT 'When accessed via API'",
        tpp_key: "BIGINT",
        customer_key: "BIGINT",
        account_key: "BIGINT",
        consent_key: "BIGINT",
        
        transaction_id: "STRING",
        transaction_amount: "DECIMAL(18,2)",
        transaction_currency: "STRING",
        transaction_type: "STRING",
        
        access_count: "INTEGER COMMENT 'Times this transaction accessed via API'",
        first_access_timestamp: "TIMESTAMP",
        last_access_timestamp: "TIMESTAMP",
      },
    },
    
    {
      name: 'gold.fact_revenue_share',
      description: 'Open Banking revenue sharing and monetization',
      schema: {
        revenue_key: "BIGINT PRIMARY KEY",
        transaction_date_key: "INTEGER",
        tpp_key: "BIGINT",
        product_key: "BIGINT",
        
        api_call_volume: "BIGINT",
        revenue_amount: "DECIMAL(18,2)",
        revenue_share_amount: "DECIMAL(18,2) COMMENT 'Bank share of TPP revenue'",
        api_fee_amount: "DECIMAL(18,2) COMMENT 'Direct API usage fees'",
        referral_revenue: "DECIMAL(18,2)",
      },
    },
  ],
};
```

---

## 🔐 Consent Framework

### Consent Lifecycle

```
1. Consent Request (TPP → Bank)
   └→ Customer redirected to bank authentication

2. Customer Authentication
   └→ Strong Customer Authentication (SCA)
   
3. Consent Authorization
   └→ Customer reviews and approves permissions
   
4. Consent Active
   └→ TPP can access data within scope
   
5. Consent Expiration/Revocation
   └→ Automatic expiry (90 days) or customer revokes
```

### Consent Attributes

```typescript
interface OpenBankingConsent {
  consentId: string;                    // Unique identifier
  customerId: string;                   // Customer reference
  tppId: string;                        // Third-party provider
  consentType: 'AIS' | 'PIS' | 'COF';  // Service type
  
  permissions: {
    readAccounts: boolean;
    readBalances: boolean;
    readTransactions: boolean;
    initiatePayments: boolean;
    confirmFunds: boolean;
  };
  
  scope: {
    accounts: string[];                 // Specific accounts or "all"
    transactionHistoryDays: number;     // e.g., 90
  };
  
  status: 'Pending' | 'Authorized' | 'Rejected' | 'Revoked' | 'Expired';
  
  timestamps: {
    created: Date;
    authorized: Date | null;
    expiresAt: Date;                    // Max 90 days for PSD2
    revokedAt: Date | null;
    lastAccessed: Date | null;
  };
  
  accessLog: {
    accessCount: number;
    lastEndpoint: string;
    lastIPAddress: string;
  };
}
```

### Consent Dashboard (Customer View)

```
Customer should see:
- Which TPPs have access
- What data they can access
- When consent expires
- Last accessed date
- Ability to revoke instantly
```

---

## 🔒 Security & Authentication

### Strong Customer Authentication (SCA)

**Requirements (PSD2):**
- **Two of three factors:**
  1. **Knowledge:** Password, PIN
  2. **Possession:** Mobile device, hardware token
  3. **Inherence:** Biometric (fingerprint, face ID)

**Implementation:**
```
1. Customer initiates consent at TPP
2. Redirect to bank authentication
3. Customer enters username/password (knowledge)
4. Bank sends OTP to mobile (possession)
5. Customer approves consent
6. Redirect back to TPP with authorization code
```

### API Security Standards

**Transport Layer:**
- TLS 1.2+ (HTTPS only)
- Certificate pinning
- Mutual TLS (mTLS) for high-security scenarios

**Application Layer:**
- OAuth 2.0 (Authorization Code Grant)
- OpenID Connect (OIDC) for identity
- JSON Web Tokens (JWT) for session management
- FAPI (Financial-grade API) security profile

**Data Protection:**
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.2+)
- PII tokenization
- Data masking for non-essential fields

---

## 💰 Revenue Models

### 1. Direct API Fees

**Pricing Models:**
- **Per API Call:** $0.001 - $0.01 per request
- **Monthly Subscription:** Tiered pricing (e.g., $500/month for 100K calls)
- **Freemium:** Free tier + paid premium features

**Example Pricing:**
```
Tier 1: 0-10,000 calls/month    - Free
Tier 2: 10K-100K calls/month    - $500/month
Tier 3: 100K-1M calls/month     - $3,000/month
Tier 4: 1M+ calls/month         - Custom pricing
```

### 2. Revenue Sharing

**Model:** Bank receives commission on products sold via TPP referrals

**Examples:**
- TPP refers customer for mortgage → Bank pays 0.5% of loan value
- TPP facilitates investment → Bank pays 10% of management fees
- TPP enables bill pay → Bank earns payment processing fees

### 3. Data Monetization

**Model:** Aggregated, anonymized insights sold to third parties

**Use Cases:**
- Credit bureaus (lending trends)
- Merchants (consumer spending patterns)
- Fintech startups (market research)

**Privacy Compliance:**
- GDPR compliant (anonymized, aggregated)
- Opt-in consent required
- Transparent data usage policies

### 4. Ecosystem Lock-In

**Strategy:** Provide superior Open Banking APIs to attract TPPs, increasing customer stickiness

**Benefits:**
- Customer less likely to switch banks
- Bank becomes platform (not just product provider)
- Access to innovation without R&D costs

---

## 📈 Metrics & KPIs

### API Performance Metrics

```typescript
export const openBankingMetrics = {
  categories: [
    {
      name: 'API Performance',
      metrics: [
        {
          id: 'OB-PERF-001',
          name: 'API Availability',
          formula: '(Total Uptime / Total Time) * 100',
          target: '99.5%',
          regulatory: 'PSD2 requirement',
        },
        {
          id: 'OB-PERF-002',
          name: 'Average Response Time',
          formula: 'AVG(response_time_ms)',
          target: '<500ms for 95% of requests',
        },
        {
          id: 'OB-PERF-003',
          name: 'Error Rate',
          formula: '(Failed Requests / Total Requests) * 100',
          target: '<0.5%',
        },
      ],
    },
    
    {
      name: 'Adoption Metrics',
      metrics: [
        {
          id: 'OB-ADOPT-001',
          name: 'Active Consents',
          formula: 'COUNT(consents WHERE status = Active)',
        },
        {
          id: 'OB-ADOPT-002',
          name: 'Registered TPPs',
          formula: 'COUNT(DISTINCT tpp_id WHERE status = Active)',
        },
        {
          id: 'OB-ADOPT-003',
          name: 'API Call Volume',
          formula: 'SUM(api_requests)',
          granularity: 'Daily',
        },
      ],
    },
    
    {
      name: 'Revenue Metrics',
      metrics: [
        {
          id: 'OB-REV-001',
          name: 'API Fee Revenue',
          formula: 'SUM(api_fee_amount)',
        },
        {
          id: 'OB-REV-002',
          name: 'Revenue Share Income',
          formula: 'SUM(revenue_share_amount)',
        },
      ],
    },
  ],
};
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

- [ ] Set up Open Banking folder structure
- [ ] Define API schemas (OpenAPI/Swagger)
- [ ] Create Bronze/Silver/Gold data models
- [ ] Design consent management framework

### Phase 2: Core APIs (Weeks 3-4)

- [ ] Account Information API (AIS)
- [ ] Payment Initiation API (PIS)
- [ ] Funds Confirmation API (COF)
- [ ] Consent Management API

### Phase 3: Security & Compliance (Weeks 5-6)

- [ ] OAuth 2.0 / OpenID Connect implementation
- [ ] Strong Customer Authentication (SCA)
- [ ] TPP registration and management
- [ ] Regulatory reporting (PSD2/Dodd-Frank)

### Phase 4: Analytics & Monetization (Weeks 7-8)

- [ ] API analytics dashboard
- [ ] Revenue tracking and reporting
- [ ] SLA monitoring
- [ ] TPP relationship management

---

_Framework Version: 1.0_
_Date: 2025-01-08_
_Status: Ready for Implementation_
_Compliance: PSD2, Dodd-Frank 1033, CDR, GDPR, CCPA_
