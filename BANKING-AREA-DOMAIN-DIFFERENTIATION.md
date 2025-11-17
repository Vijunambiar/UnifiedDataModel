# Banking Area Domain Differentiation Strategy

## Analysis & Recommendations for Business Accuracy

### Executive Summary

**Issue Identified:** Current unified domain approach (e.g., single "Customer Core" domain) doesn't accurately reflect how banking areas operate differently in the real world. Retail, Commercial, Wealth, and Corporate banking serve fundamentally different customer types with distinct data models.

**Recommendation:** Implement a **hybrid approach** combining unified cross-cutting domains with area-specific specializations and clear segmentation markers.

---

## 🏦 Real-World Banking Structure Analysis

### How Banks Actually Organize

Top-tier banks typically organize into distinct **business units (LOBs)** with separate:

#### 1. **Retail Banking** (Consumer/Mass Market)

- **Customer Type:** Individual consumers
- **Customer Attributes:**
  - SSN, personal email, home address
  - Consumer credit score (FICO)
  - Household relationships
  - Employment, income
  - Life stage (student, young professional, family, retiree)
- **Products:** Checking accounts, savings, auto loans, mortgages, credit cards
- **Metrics:** Customer acquisition cost, deposit growth, attrition
- **Systems:** Retail core banking (FIS, Jack Henry, etc.)

#### 2. **Commercial Banking** (SMB to Mid-Market)

- **Customer Type:** Business entities
- **Customer Attributes:**
  - EIN/Tax ID, business email, business address
  - D&B number, business credit score
  - Industry (NAICS), annual revenue, employees
  - Ownership structure, entity type (LLC, Corp, Partnership)
  - Business lifecycle stage (startup, growth, mature)
- **Products:** Business checking, lines of credit, commercial real estate loans, treasury services
- **Metrics:** Loan portfolio quality, treasury services revenue, business growth
- **Systems:** Commercial lending platforms, cash management systems

#### 3. **Corporate & Investment Banking** (Large Corporate)

- **Customer Type:** Large corporations, institutional clients
- **Customer Attributes:**
  - Global entity structure, ticker symbol
  - Credit rating (S&P, Moody's)
  - Industry sector, market cap
  - Treasury/CFO relationships
- **Products:** Syndicated loans, bond underwriting, M&A advisory, derivatives
- **Metrics:** Deal flow, trading revenue, advisory fees
- **Systems:** Capital markets platforms, institutional trading systems

#### 4. **Wealth Management** (High-Net-Worth)

- **Customer Type:** High-net-worth individuals, families
- **Customer Attributes:**
  - Assets under management (AUM)
  - Investment preferences, risk tolerance
  - Trust relationships, estate planning
  - Tax strategy, philanthropic interests
  - Family office relationships
- **Products:** Portfolio management, trust services, private banking, estate planning
- **Metrics:** AUM growth, fee revenue, client satisfaction
- **Systems:** Wealth platforms (Salesforce Financial Services, Tamarac, etc.)

#### 5. **Mortgage Banking**

- **Customer Type:** Homebuyers, real estate investors
- **Customer Attributes:**
  - Property details (appraisal, LTV)
  - Borrower debt-to-income (DTI)
  - Occupancy type (primary, investment, second home)
  - Loan purpose (purchase, refinance)
- **Products:** Residential mortgages, home equity loans, reverse mortgages
- **Metrics:** Origination volume, servicing rights value, delinquency rates
- **Systems:** Mortgage origination systems (Encompass, Calyx Point)

---

## 🎯 Current State Analysis

### What We Have Now

```typescript
// Single unified domain
{
  id: "customer-core",
  name: "Customer Core",
  description: "Unified customer-focused domain...",
  keyEntities: [
    "Customer Golden Record",
    "Customer Identifiers",
    "Customer Relationships & Households",
    // ... generic entities
  ]
}
```

**Problem:** This treats all customers the same, ignoring fundamental differences:

- Retail customer has SSN, commercial customer has EIN
- Retail has FICO score, commercial has business credit rating
- Retail has household, commercial has entity structure

### Banking Area Mapping (Current)

```typescript
const domainToBankingAreaMap = {
  "customer-core": ["retail", "commercial", "wealth"], // ❌ Same domain for all
  loans: ["retail", "commercial", "mortgage", "corporate"], // ❌ Same domain for all
  deposits: ["retail", "commercial", "wealth"], // ❌ Same domain for all
};
```

---

## 💡 Proposed Solution: Hybrid Approach

### Strategy: Unified Framework + Area-Specific Variations

Implement **three-tier domain taxonomy:**

1. **Tier 1: Cross-Cutting Domains** (truly universal)
   - Risk & Compliance
   - Fraud & Security
   - Operations
   - Channels & Digital (partially)

2. **Tier 2: Area-Segmented Domains** (same logical domain, different physical implementations)
   - Customer Core → Customer-Retail, Customer-Commercial, Customer-Wealth
   - Loans → Loans-Retail, Loans-Commercial, Loans-Mortgage, Loans-Corporate
   - Deposits → Deposits-Retail, Deposits-Commercial, Deposits-Wealth

3. **Tier 3: Area-Exclusive Domains** (only exist in one area)
   - Credit Cards (Retail only)
   - Trade Finance (Commercial/Corporate only)
   - Investment Advisory (Wealth only)

---

## 📊 Detailed Differentiation by Domain

### **Customer Core Domain Variations**

#### **Customer-Retail (Individuals)**

```typescript
{
  id: "customer-retail",
  name: "Customer Core - Retail",
  areaSpecific: "retail",
  keyEntities: [
    "Individual Customer",
    "Household",
    "Personal Identifiers (SSN, DL)",
    "Consumer Credit Profile (FICO)",
    "Employment & Income",
    "Life Events",
    "Household Budget",
    "Digital Preferences"
  ],
  silverSchema: {
    customer_id: "BIGINT PRIMARY KEY",
    ssn_encrypted: "STRING",
    first_name: "STRING",
    last_name: "STRING",
    date_of_birth: "DATE",
    fico_score: "INTEGER",
    household_id: "BIGINT FK",
    employment_status: "STRING",
    annual_income: "DECIMAL",
    marital_status: "STRING",
    number_of_dependents: "INTEGER"
  },
  goldDimensions: [
    "dim_retail_customer",
    "dim_household",
    "dim_life_stage",
    "dim_income_bracket"
  ]
}
```

#### **Customer-Commercial (Businesses)**

```typescript
{
  id: "customer-commercial",
  name: "Customer Core - Commercial",
  areaSpecific: "commercial",
  keyEntities: [
    "Business Entity",
    "Entity Structure & Ownership",
    "Business Identifiers (EIN, DUNS)",
    "Business Credit Profile (D&B)",
    "Industry Classification (NAICS)",
    "Financial Statements",
    "Business Lifecycle",
    "Relationships & Guarantors"
  ],
  silverSchema: {
    business_id: "BIGINT PRIMARY KEY",
    ein: "STRING",
    duns_number: "STRING",
    legal_name: "STRING",
    dba_name: "STRING",
    entity_type: "STRING", // LLC, S-Corp, C-Corp, Partnership
    naics_code: "STRING",
    annual_revenue: "DECIMAL",
    employee_count: "INTEGER",
    business_credit_score: "INTEGER",
    industry_risk_rating: "STRING",
    years_in_business: "INTEGER",
    parent_company_id: "BIGINT FK"
  },
  goldDimensions: [
    "dim_commercial_customer",
    "dim_business_entity_type",
    "dim_industry (NAICS)",
    "dim_revenue_bracket"
  ]
}
```

#### **Customer-Wealth (HNW Clients)**

```typescript
{
  id: "customer-wealth",
  name: "Customer Core - Wealth",
  areaSpecific: "wealth",
  keyEntities: [
    "Wealth Client",
    "Family Office",
    "Trust & Estate",
    "Investment Profile",
    "Risk Tolerance",
    "Advisor Relationships",
    "Tax Strategy",
    "Philanthropic Interests"
  ],
  silverSchema: {
    client_id: "BIGINT PRIMARY KEY",
    individual_customer_id: "BIGINT FK", // Links to retail customer
    total_aum: "DECIMAL",
    investable_assets: "DECIMAL",
    risk_tolerance_score: "INTEGER",
    investment_objective: "STRING",
    tax_bracket: "STRING",
    estate_plan_flag: "BOOLEAN",
    trust_relationships: "ARRAY<STRUCT>",
    primary_advisor_id: "BIGINT FK",
    family_office_id: "BIGINT FK"
  },
  goldDimensions: [
    "dim_wealth_client",
    "dim_risk_tolerance",
    "dim_investment_objective",
    "dim_aum_bracket"
  ]
}
```

---

### **Loans Domain Variations**

#### **Loans-Retail (Consumer Lending)**

```typescript
{
  id: "loans-retail",
  name: "Loans & Lending - Retail",
  areaSpecific: "retail",
  productTypes: [
    "Personal Loans",
    "Auto Loans",
    "Student Loans",
    "Home Equity Lines of Credit (HELOC)",
    "Credit Builder Loans"
  ],
  keyAttributes: {
    borrower_type: "Individual",
    underwriting_criteria: ["FICO score", "DTI ratio", "Employment", "Income"],
    loan_sizes: "$1K - $100K",
    decision_speed: "Automated/Same-day",
    collateral: "Auto, Home Equity"
  },
  facts: [
    "fact_retail_loan_originations",
    "fact_retail_loan_balances",
    "fact_retail_loan_payments"
  ]
}
```

#### **Loans-Commercial (Business Lending)**

```typescript
{
  id: "loans-commercial",
  name: "Loans & Lending - Commercial",
  areaSpecific: "commercial",
  productTypes: [
    "Commercial & Industrial (C&I) Loans",
    "Commercial Real Estate (CRE)",
    "Lines of Credit",
    "Equipment Financing",
    "Working Capital Loans",
    "SBA Loans"
  ],
  keyAttributes: {
    borrower_type: "Business Entity",
    underwriting_criteria: ["Business credit score", "Financial statements", "Industry risk", "Cash flow analysis"],
    loan_sizes: "$100K - $50M",
    decision_speed: "Manual/1-2 weeks",
    collateral: "Real estate, Equipment, AR, Inventory"
  },
  facts: [
    "fact_commercial_loan_originations",
    "fact_commercial_loan_balances",
    "fact_commercial_loan_covenants"
  ]
}
```

#### **Loans-Corporate (Syndicated/Large Corporate)**

```typescript
{
  id: "loans-corporate",
  name: "Loans & Lending - Corporate",
  areaSpecific: "corporate",
  productTypes: [
    "Syndicated Term Loans",
    "Revolving Credit Facilities",
    "Bridge Financing",
    "Acquisition Financing",
    "Project Finance"
  ],
  keyAttributes: {
    borrower_type: "Large Corporation",
    underwriting_criteria: ["Credit rating", "Market cap", "Industry position", "Syndicate commitment"],
    loan_sizes: "$50M - $5B+",
    decision_speed: "Manual/4-8 weeks",
    collateral: "Often unsecured, sometimes asset-backed"
  }
}
```

---

## 🏗️ Implementation Options

### **Option 1: Separate Domain Definitions** ⭐ **RECOMMENDED**

Create distinct domain files for each variation:

```
client/lib/
  customer-retail-comprehensive.ts
  customer-commercial-comprehensive.ts
  customer-wealth-comprehensive.ts
  loans-retail-comprehensive.ts
  loans-commercial-comprehensive.ts
  loans-mortgage-comprehensive.ts
  loans-corporate-comprehensive.ts
  deposits-retail-comprehensive.ts
  deposits-commercial-comprehensive.ts
```

**Pros:**

- ✅ Accurately reflects business reality
- ✅ Clear separation of concerns
- ✅ Area-specific schemas and metrics
- ✅ Better governance (separate owners)

**Cons:**

- ❌ More files to maintain
- ❌ Some duplication in common structures

---

### **Option 2: Single Domain with Area Segments**

Keep unified domains but add explicit segmentation:

```typescript
{
  id: "customer-core",
  name: "Customer Core",
  segments: {
    retail: {
      keyEntities: ["Individual", "Household"],
      silverTables: ["silver.retail_customer_golden"],
      goldDimensions: ["gold.dim_retail_customer"]
    },
    commercial: {
      keyEntities: ["Business Entity", "Industry"],
      silverTables: ["silver.commercial_customer_golden"],
      goldDimensions: ["gold.dim_commercial_customer"]
    },
    wealth: {
      keyEntities: ["Wealth Client", "Portfolio"],
      silverTables: ["silver.wealth_client_golden"],
      goldDimensions: ["gold.dim_wealth_client"]
    }
  }
}
```

**Pros:**

- ✅ Single domain definition
- ✅ Easier to manage common elements
- ✅ Clear segmentation markers

**Cons:**

- ❌ Complex nested structure
- ❌ Less clear ownership
- ❌ Harder to navigate

---

### **Option 3: Hybrid (Base + Specializations)**

Create base domains with optional specializations:

```typescript
// Base domain
{
  id: "customer-core-base",
  name: "Customer Core (Base)",
  type: "base",
  commonEntities: ["Customer Identifier", "Contact Information"],
  specializations: ["customer-retail", "customer-commercial", "customer-wealth"]
}

// Specialization
{
  id: "customer-retail",
  name: "Customer Core - Retail",
  type: "specialization",
  baseId: "customer-core-base",
  areaSpecific: "retail",
  additionalEntities: ["Household", "FICO Score"],
  // ... retail-specific details
}
```

**Pros:**

- ✅ Avoids duplication of common elements
- ✅ Clear inheritance model
- ✅ Extensible

**Cons:**

- ❌ More complex architecture
- ❌ Requires careful design

---

## 📋 Recommended Action Plan

### Phase 1: Assess & Document (Week 1)

1. **Audit Current Domains**
   - Identify which domains should be area-specific
   - Document common vs. specialized attributes

2. **Stakeholder Input**
   - Interview retail, commercial, wealth, and corporate banking teams
   - Validate differences in data models and use cases

### Phase 2: Redesign Taxonomy (Week 2)

1. **Categorize Domains**
   - **Cross-Cutting:** Risk, Fraud, Compliance, Operations
   - **Area-Segmented:** Customer, Loans, Deposits, Payments
   - **Area-Exclusive:** Cards (Retail), Trade Finance (Commercial), Wealth Advisory

2. **Design Schema Variations**
   - Create area-specific entity definitions
   - Map relationships between areas (e.g., commercial customer can also be wealth client)

### Phase 3: Implement (Weeks 3-4)

1. **Create Domain Variations** (Option 1 recommended)

   ```
   customer-retail-comprehensive.ts
   customer-commercial-comprehensive.ts
   customer-wealth-comprehensive.ts
   ```

2. **Update Domain Registry**

   ```typescript
   export const bankingDomains: BankingDomain[] = [
     customerRetailDomain,
     customerCommercialDomain,
     customerWealthDomain,
     loansRetailDomain,
     loansCommercialDomain,
     // ...
   ];
   ```

3. **Update UI Navigation**
   - Show area-specific domains in context
   - Add "Applies to:" badges showing banking areas
   - Filter domains by selected area

### Phase 4: Documentation & Training (Week 5)

1. **Document Differences**
   - Create comparison matrices
   - Document cross-area data flows
   - Explain when to use which domain

2. **Update ERDs**
   - Area-specific logical ERDs
   - Physical ERDs with proper segmentation
   - Relationship diagrams between areas

---

## 🎯 Success Metrics

### Business Accuracy

- ✅ Each banking area has appropriate customer model
- ✅ Product definitions match actual offerings
- ✅ Metrics align with area-specific KPIs

### User Experience

- ✅ Clear which domains apply to which areas
- ✅ Easy to find area-relevant information
- ✅ Reduced confusion about data applicability

### Data Quality

- ✅ Schemas match source systems
- ✅ Metrics calculated correctly by area
- ✅ Better data governance (clear ownership)

---

## 📊 Comparison Matrix Example

### Customer Core Across Areas

| Attribute          | Retail           | Commercial       | Wealth         | Corporate          |
| ------------------ | ---------------- | ---------------- | -------------- | ------------------ |
| **Identifier**     | SSN              | EIN              | Client ID      | Global LEI         |
| **Credit Score**   | FICO (300-850)   | D&B Paydex       | N/A            | S&P Rating         |
| **Primary Metric** | Household Income | Annual Revenue   | AUM            | Market Cap         |
| **Relationship**   | Household        | Entity Structure | Family Office  | Subsidiary Network |
| **Lifecycle**      | Life Stage       | Business Stage   | Wealth Stage   | Corp Lifecycle     |
| **Risk Model**     | Consumer Risk    | Business Risk    | Portfolio Risk | Credit Rating      |

---

## 🚀 Quick Win: UI Enhancements (Immediate)

While planning full redesign, implement these quick improvements:

1. **Add Area Badges to Domains**

   ```tsx
   <Badge className="bg-blue-100">Retail</Badge>
   <Badge className="bg-green-100">Commercial</Badge>
   <Badge className="bg-purple-100">Wealth</Badge>
   ```

2. **Show Context in Domain Details**

   ```tsx
   <Alert>
     <InfoIcon />
     <AlertTitle>Multi-Area Domain</AlertTitle>
     <AlertDescription>
       This domain applies differently across Retail, Commercial, and Wealth
       banking. Customer attributes and schemas vary by area.
     </AlertDescription>
   </Alert>
   ```

3. **Area-Specific ERD Views**
   ```tsx
   <Tabs>
     <TabsList>
       <TabsTrigger>Retail View</TabsTrigger>
       <TabsTrigger>Commercial View</TabsTrigger>
       <TabsTrigger>Wealth View</TabsTrigger>
     </TabsList>
   </Tabs>
   ```

---

## 💡 Conclusion

**The current unified approach is conceptually clean but business-inaccurate.** Real banks treat retail, commercial, wealth, and corporate customers very differently, with distinct:

- Data models and schemas
- Metrics and KPIs
- Regulatory requirements
- Organizational structures
- Technology systems

**Recommendation:** Implement **Option 1 (Separate Domain Definitions)** for maximum business accuracy and clarity, starting with the most critical domains (Customer, Loans, Deposits).

This will transform the platform from a technical data catalog into a **true business-aligned data model** that accurately reflects how modern banks actually operate.

---

_Next Steps: Review this analysis with stakeholders and proceed with Phase 1 assessment._
