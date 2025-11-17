# Customer-Retail Metrics Table Mappings

## Overview
All 200 Customer-Retail metrics should include `silverTable` and `goldTable` properties that map to the appropriate data tables based on their category.

## Table Mapping by Category

### 1. Acquisition Metrics (CRM-ACQ-001 to CRM-ACQ-040)
**40 metrics** related to new customer acquisition, onboarding, and source tracking

**Silver Table:** `silver.retail_customer_lifecycle_events_golden`
- Contains customer lifecycle events including acquisition events
- Tracks customer_since_date, acquisition_channel, acquisition_source
- SCD Type 2 for historical tracking

**Gold Table:** `gold.fact_customer_acquisition`
- Fact table for customer acquisition events
- Grain: One row per customer acquisition
- Measures: acquisition_cost, initial_deposit, products_at_opening, time_to_first_transaction

**Example:**
```typescript
{
  id: 'CRM-ACQ-001',
  name: 'New Customer Acquisitions',
  description: 'Number of new retail customers acquired in period',
  category: 'Acquisition',
  subcategory: 'Volume',
  formula: "COUNT(DISTINCT customer_id WHERE customer_since_date BETWEEN period_start AND period_end)",
  unit: 'count',
  aggregation: 'SUM',
  silverTable: 'silver.retail_customer_lifecycle_events_golden',
  goldTable: 'gold.fact_customer_acquisition',
}
```

---

### 2. Retention Metrics (CRM-RET-001 to CRM-RET-040)
**40 metrics** related to customer retention, churn, and loyalty

**Silver Table:** `silver.retail_customer_lifecycle_events_golden`
- Contains churn events, reactivation events, dormancy status
- Tracks account closure reasons, voluntary vs involuntary attrition
- Customer tenure and lifecycle stage transitions

**Gold Table:** `gold.fact_customer_churn`
- Fact table for customer churn and retention events
- Grain: One row per customer churn event or retention period
- Measures: churn_reason, churn_type (voluntary/involuntary), days_to_churn, products_at_churn

**Example:**
```typescript
{
  id: 'CRM-RET-001',
  name: 'Customer Retention Rate',
  description: 'Percentage of customers retained over period',
  category: 'Retention',
  subcategory: 'Core',
  formula: "(customers_end - new_customers) / customers_start * 100",
  unit: 'percentage',
  aggregation: 'CALCULATED',
  silverTable: 'silver.retail_customer_lifecycle_events_golden',
  goldTable: 'gold.fact_customer_churn',
}
```

---

### 3. Engagement Metrics (CRM-ENG-001 to CRM-ENG-040)
**40 metrics** related to customer interaction frequency, channel usage, and activity

**Silver Table:** `silver.retail_customer_interactions_golden`
- Contains all customer interactions across channels (digital, branch, call center, ATM)
- Tracks logins, transactions, feature usage, channel preferences
- Session data, app usage, digital adoption metrics

**Gold Table:** `gold.fact_customer_interactions`
- Fact table for customer interactions and engagement events
- Grain: One row per interaction event
- Measures: interaction_count, session_duration, transaction_volume, channel, interaction_type

**Example:**
```typescript
{
  id: 'CRM-ENG-001',
  name: 'Average Monthly Logins',
  description: 'Mean number of digital banking logins per customer',
  category: 'Engagement',
  subcategory: 'Digital',
  formula: "AVG(login_count)",
  unit: 'count',
  aggregation: 'AVG',
  silverTable: 'silver.retail_customer_interactions_golden',
  goldTable: 'gold.fact_customer_interactions',
}
```

---

### 4. Value/Profitability Metrics (CRM-PROF-001 to CRM-PROF-040)
**40 metrics** related to customer profitability, lifetime value, and revenue

**Silver Table:** `silver.retail_customer_master_golden`
- Contains customer financial profiles, product holdings, balance aggregates
- Tracks customer value scores, profitability tiers, revenue contributions
- Account balances, loan balances, deposit balances by customer

**Gold Table:** `gold.fact_customer_profitability`
- Fact table for customer profitability and value metrics
- Grain: One row per customer per month/quarter
- Measures: revenue, cost_to_serve, net_profit, lifetime_value, products_count, balance_total

**Example:**
```typescript
{
  id: 'CRM-PROF-001',
  name: 'Customer Lifetime Value (CLV)',
  description: 'Predicted total value of customer relationship',
  category: 'Profitability',
  subcategory: 'Lifetime Value',
  formula: "NPV(future_revenue_stream) - NPV(future_cost_stream)",
  unit: 'USD',
  aggregation: 'AVG',
  silverTable: 'silver.retail_customer_master_golden',
  goldTable: 'gold.fact_customer_profitability',
}
```

---

### 5. Satisfaction Metrics (CRM-SAT-001 to CRM-SAT-040)
**40 metrics** related to customer satisfaction, NPS, and feedback

**Silver Table:** `silver.retail_customer_interactions_golden`
- Contains customer feedback, surveys, NPS responses, CSAT scores
- Tracks complaints, issue resolutions, service ratings
- Sentiment analysis from various touchpoints

**Gold Table:** `gold.fact_customer_satisfaction`
- Fact table for customer satisfaction and feedback events
- Grain: One row per survey response or feedback event
- Measures: nps_score, csat_score, ces_score, complaint_count, resolution_time

**Example:**
```typescript
{
  id: 'CRM-SAT-001',
  name: 'Net Promoter Score (NPS)',
  description: 'Customer recommendation likelihood',
  category: 'Satisfaction',
  subcategory: 'Advocacy',
  formula: "((Promoters - Detractors) / Total Respondents) * 100",
  unit: 'score',
  aggregation: 'AVG',
  silverTable: 'silver.retail_customer_interactions_golden',
  goldTable: 'gold.fact_customer_satisfaction',
}
```

---

## Implementation Notes

1. **All 200 metrics** in `client/lib/retail/customer-retail-metrics.ts` should have these two properties added
2. The `silverTable` property indicates the source silver layer table containing cleansed, deduplicated data
3. The `goldTable` property indicates the destination gold layer fact table where the metric is calculated
4. These mappings ensure proper data lineage and make it clear which physical tables support each calculated metric

## Verification

After implementation, verify:
- All 200 metrics have `silverTable` and `goldTable` properties
- Metrics in each category map to the correct tables as documented above
- No metrics are missing table mappings
- Table names match the actual table definitions in the bronze/silver/gold layer files
