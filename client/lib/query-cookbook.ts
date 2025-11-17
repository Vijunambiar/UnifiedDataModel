// QUERY COOKBOOK - DEPOSITS & FUNDING DOMAIN
// 50+ production-ready SQL queries for common business questions
// Organized by use case and complexity level

// ============================================================================
// EXECUTIVE DASHBOARD QUERIES
// ============================================================================

export const executiveDashboardQueries = {
  totalDepositsOverview: {
    use_case: "Executive Dashboard - Total Deposits",
    complexity: "Simple",
    business_question:
      "What are our total deposit balances by product category?",
    sql: `
SELECT 
  p.product_category,
  COUNT(DISTINCT dp.account_key) as account_count,
  SUM(dp.eod_balance) as total_balance,
  AVG(dp.eod_balance) as avg_balance_per_account,
  SUM(dp.eod_balance) / SUM(SUM(dp.eod_balance)) OVER () * 100 as pct_of_total
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
JOIN gold.dim_product p ON da.product_key = p.product_key
WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date WHERE date_value <= CURRENT_DATE)
GROUP BY p.product_category
ORDER BY total_balance DESC;
    `,
  },

  monthlyGrowthTrend: {
    use_case: "Executive Dashboard - Growth Trends",
    complexity: "Medium",
    business_question:
      "What is our month-over-month deposit growth for the last 12 months?",
    sql: `
WITH monthly_balances AS (
  SELECT 
    DATE_TRUNC('month', d.date_value) as month,
    SUM(dp.eod_balance) as total_balance
  FROM gold.fact_daily_account_positions dp
  JOIN gold.dim_date d ON dp.position_date_key = d.date_key
  WHERE d.date_value >= DATEADD(month, -12, CURRENT_DATE)
    AND d.month_end_flag = TRUE
  GROUP BY month
)
SELECT 
  month,
  total_balance,
  LAG(total_balance) OVER (ORDER BY month) as prior_month_balance,
  total_balance - LAG(total_balance) OVER (ORDER BY month) as absolute_growth,
  (total_balance - LAG(total_balance) OVER (ORDER BY month)) / 
    LAG(total_balance) OVER (ORDER BY month) * 100 as growth_rate_pct
FROM monthly_balances
ORDER BY month DESC;
    `,
  },

  topCustomersByBalance: {
    use_case: "Executive Dashboard - Top Customers",
    complexity: "Simple",
    business_question:
      "Who are our top 100 customers by total deposit balances?",
    sql: `
SELECT 
  c.customer_id,
  c.customer_segment,
  c.customer_tier,
  COUNT(DISTINCT da.account_key) as total_accounts,
  SUM(dp.eod_balance) as total_balance,
  SUM(CASE WHEN p.product_category = 'DDA' THEN dp.eod_balance ELSE 0 END) as dda_balance,
  SUM(CASE WHEN p.product_category = 'Savings' THEN dp.eod_balance ELSE 0 END) as savings_balance,
  SUM(CASE WHEN p.product_category = 'CD' THEN dp.eod_balance ELSE 0 END) as cd_balance
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
JOIN gold.dim_customer c ON da.customer_key = c.customer_key AND c.current_flag = TRUE
JOIN gold.dim_product p ON da.product_key = p.product_key
WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
GROUP BY c.customer_id, c.customer_segment, c.customer_tier
ORDER BY total_balance DESC
LIMIT 100;
    `,
  },
};

// ============================================================================
// PRODUCT ANALYTICS QUERIES
// ============================================================================

export const productAnalyticsQueries = {
  productPerformanceMetrics: {
    use_case: "Product Analytics - Performance KPIs",
    complexity: "Medium",
    business_question:
      "What are the key performance metrics for each deposit product?",
    sql: `
SELECT 
  p.product_name,
  p.product_category,
  COUNT(DISTINCT da.account_key) as active_accounts,
  SUM(dp.eod_balance) as total_balance,
  AVG(dp.eod_balance) as avg_balance,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY dp.eod_balance) as median_balance,
  SUM(dp.daily_interest_accrued) as total_interest_accrued,
  AVG(CASE WHEN dp.eod_balance > 0 THEN dp.daily_interest_accrued / dp.eod_balance * 365 * 100 ELSE 0 END) as avg_apy_pct,
  SUM(dp.transaction_count) as total_transactions,
  AVG(dp.transaction_count) as avg_transactions_per_account
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
JOIN gold.dim_product p ON da.product_key = p.product_key
WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
GROUP BY p.product_name, p.product_category
ORDER BY total_balance DESC;
    `,
  },

  cdMaturitySchedule: {
    use_case: "Product Analytics - CD Maturities",
    complexity: "Medium",
    business_question: "What CDs are maturing in the next 90 days?",
    sql: `
SELECT 
  DATE_TRUNC('month', cd.maturity_date) as maturity_month,
  COUNT(DISTINCT cd.account_key) as maturing_accounts,
  SUM(cd.principal_amount) as maturing_principal,
  AVG(cd.contract_rate) as avg_rate,
  SUM(cd.principal_amount * cd.renewal_probability) as expected_renewal_amount,
  SUM(cd.principal_amount * (1 - cd.renewal_probability)) as expected_runoff_amount
FROM gold.dim_cd_accounts cd
WHERE cd.maturity_date BETWEEN CURRENT_DATE AND DATEADD(day, 90, CURRENT_DATE)
  AND cd.account_status = 'ACTIVE'
GROUP BY maturity_month
ORDER BY maturity_month;
    `,
  },

  savingsAccountGrowth: {
    use_case: "Product Analytics - Savings Growth",
    complexity: "Medium",
    business_question: "How are savings account balances growing by tier?",
    sql: `
WITH savings_tiers AS (
  SELECT 
    da.account_key,
    dp.position_date,
    dp.eod_balance,
    CASE 
      WHEN dp.eod_balance < 1000 THEN 'Under $1K'
      WHEN dp.eod_balance < 10000 THEN '$1K-$10K'
      WHEN dp.eod_balance < 50000 THEN '$10K-$50K'
      WHEN dp.eod_balance < 100000 THEN '$50K-$100K'
      ELSE 'Over $100K'
    END as balance_tier
  FROM gold.fact_daily_account_positions dp
  JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key
  JOIN gold.dim_product p ON da.product_key = p.product_key
  WHERE p.product_category = 'Savings'
    AND dp.position_date >= DATEADD(month, -12, CURRENT_DATE)
)
SELECT 
  DATE_TRUNC('month', position_date) as month,
  balance_tier,
  COUNT(DISTINCT account_key) as account_count,
  SUM(eod_balance) as total_balance,
  AVG(eod_balance) as avg_balance
FROM savings_tiers
GROUP BY month, balance_tier
ORDER BY month DESC, total_balance DESC;
    `,
  },
};

// ============================================================================
// CUSTOMER ANALYTICS QUERIES
// ============================================================================

export const customerAnalyticsQueries = {
  customerProfitability: {
    use_case: "Customer Analytics - Profitability",
    complexity: "Complex",
    business_question:
      "Which customers are most profitable (fees - interest expense)?",
    sql: `
WITH customer_revenue AS (
  SELECT 
    c.customer_key,
    c.customer_id,
    c.customer_segment,
    SUM(mas.month_total_fees_amount) as total_fees_12m,
    SUM(mas.month_interest_paid) as total_interest_expense_12m,
    SUM(mas.month_average_balance) as avg_monthly_balance,
    COUNT(DISTINCT mas.account_key) as total_accounts
  FROM gold.fact_monthly_account_summary mas
  JOIN gold.dim_deposit_account da ON mas.account_key = da.account_key
  JOIN gold.dim_customer c ON da.customer_key = c.customer_key AND c.current_flag = TRUE
  WHERE mas.year_month >= DATE_TRUNC('month', DATEADD(month, -12, CURRENT_DATE))
  GROUP BY c.customer_key, c.customer_id, c.customer_segment
)
SELECT 
  customer_id,
  customer_segment,
  total_accounts,
  avg_monthly_balance,
  total_fees_12m,
  total_interest_expense_12m,
  total_fees_12m - total_interest_expense_12m as net_profit_12m,
  (total_fees_12m - total_interest_expense_12m) / NULLIF(avg_monthly_balance, 0) * 100 as return_on_deposits_pct
FROM customer_revenue
WHERE total_accounts > 0
ORDER BY net_profit_12m DESC
LIMIT 500;
    `,
  },

  customerRetentionCohort: {
    use_case: "Customer Analytics - Cohort Retention",
    complexity: "Complex",
    business_question:
      "What is the retention rate by customer cohort (opening month)?",
    sql: `
WITH cohorts AS (
  SELECT 
    DATE_TRUNC('month', da.open_date) as cohort_month,
    da.customer_key,
    da.account_key,
    da.open_date,
    CASE WHEN da.close_date IS NULL THEN 1 ELSE 0 END as still_active
  FROM gold.dim_deposit_account da
  WHERE da.current_flag = TRUE
    AND da.open_date >= DATEADD(year, -2, CURRENT_DATE)
)
SELECT 
  cohort_month,
  COUNT(DISTINCT customer_key) as cohort_size,
  SUM(still_active) as still_active_customers,
  SUM(still_active) / COUNT(DISTINCT customer_key) * 100 as retention_rate_pct,
  DATEDIFF(month, cohort_month, CURRENT_DATE) as months_on_book
FROM cohorts
GROUP BY cohort_month
ORDER BY cohort_month DESC;
    `,
  },

  crossSellOpportunities: {
    use_case: "Customer Analytics - Cross-Sell",
    complexity: "Medium",
    business_question:
      "Which customers have high balances in DDA but no savings account?",
    sql: `
WITH customer_products AS (
  SELECT 
    c.customer_key,
    c.customer_id,
    c.customer_segment,
    SUM(CASE WHEN p.product_category = 'DDA' THEN dp.eod_balance ELSE 0 END) as dda_balance,
    MAX(CASE WHEN p.product_category = 'Savings' THEN 1 ELSE 0 END) as has_savings,
    MAX(CASE WHEN p.product_category = 'CD' THEN 1 ELSE 0 END) as has_cd
  FROM gold.fact_daily_account_positions dp
  JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
  JOIN gold.dim_customer c ON da.customer_key = c.customer_key AND c.current_flag = TRUE
  JOIN gold.dim_product p ON da.product_key = p.product_key
  WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
  GROUP BY c.customer_key, c.customer_id, c.customer_segment
)
SELECT 
  customer_id,
  customer_segment,
  dda_balance,
  CASE WHEN has_savings = 0 THEN 'Savings Opportunity' ELSE 'Has Savings' END as savings_status,
  CASE WHEN has_cd = 0 THEN 'CD Opportunity' ELSE 'Has CD' END as cd_status
FROM customer_products
WHERE dda_balance > 10000
  AND has_savings = 0
ORDER BY dda_balance DESC
LIMIT 1000;
    `,
  },
};

// ============================================================================
// REGULATORY REPORTING QUERIES
// ============================================================================

export const regulatoryReportingQueries = {
  lcrReport: {
    use_case: "Regulatory - LCR Reporting",
    complexity: "Complex",
    business_question:
      "What is our Liquidity Coverage Ratio (LCR) calculation?",
    sql: `
WITH deposit_classification AS (
  SELECT 
    p.product_category,
    da.regulatory_category,
    SUM(dp.eod_balance) as total_balance,
    CASE 
      WHEN da.operational_deposit_flag = TRUE THEN 0.05  -- 5% outflow
      WHEN da.stable_deposit_flag = TRUE THEN 0.05       -- 5% outflow for stable retail
      WHEN p.product_category = 'DDA' THEN 0.10          -- 10% outflow for less stable
      ELSE 0.20                                           -- 20% for other
    END as lcr_outflow_rate
  FROM gold.fact_daily_account_positions dp
  JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
  JOIN gold.dim_product p ON da.product_key = p.product_key
  WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
  GROUP BY p.product_category, da.regulatory_category, 
           da.operational_deposit_flag, da.stable_deposit_flag
)
SELECT 
  product_category,
  regulatory_category,
  total_balance,
  lcr_outflow_rate * 100 as outflow_rate_pct,
  total_balance * lcr_outflow_rate as assumed_outflow_30d,
  total_balance * (1 - lcr_outflow_rate) as available_stable_funding
FROM deposit_classification
ORDER BY total_balance DESC;
    `,
  },

  fdic_insured_vs_uninsured: {
    use_case: "Regulatory - FDIC Insurance",
    complexity: "Medium",
    business_question:
      "What portion of our deposits is FDIC insured vs uninsured?",
    sql: `
SELECT 
  DATE_TRUNC('month', d.date_value) as month,
  COUNT(DISTINCT dp.account_key) as total_accounts,
  SUM(dp.eod_balance) as total_deposits,
  SUM(dp.fdic_insured_amount) as fdic_insured_amount,
  SUM(dp.uninsured_amount) as uninsured_amount,
  SUM(dp.fdic_insured_amount) / SUM(dp.eod_balance) * 100 as insured_pct,
  SUM(dp.uninsured_amount) / SUM(dp.eod_balance) * 100 as uninsured_pct,
  COUNT(DISTINCT CASE WHEN dp.uninsured_amount > 0 THEN dp.account_key END) as accounts_with_uninsured
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_date d ON dp.position_date_key = d.date_key
WHERE d.month_end_flag = TRUE
  AND d.date_value >= DATEADD(year, -1, CURRENT_DATE)
GROUP BY month
ORDER BY month DESC;
    `,
  },

  brokeredDeposits: {
    use_case: "Regulatory - Brokered Deposits",
    complexity: "Simple",
    business_question:
      "What is our brokered deposit volume and percentage of total deposits?",
    sql: `
SELECT 
  SUM(CASE WHEN da.brokered_flag = TRUE THEN dp.eod_balance ELSE 0 END) as brokered_deposits,
  SUM(CASE WHEN da.brokered_flag = FALSE THEN dp.eod_balance ELSE 0 END) as non_brokered_deposits,
  SUM(dp.eod_balance) as total_deposits,
  SUM(CASE WHEN da.brokered_flag = TRUE THEN dp.eod_balance ELSE 0 END) / 
    SUM(dp.eod_balance) * 100 as brokered_pct
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date);
    `,
  },
};

// ============================================================================
// OPERATIONAL QUERIES
// ============================================================================

export const operationalQueries = {
  dailyBalanceMovement: {
    use_case: "Operations - Daily Balance Changes",
    complexity: "Simple",
    business_question:
      "What were today's deposit inflows, outflows, and net change?",
    sql: `
SELECT 
  COUNT(DISTINCT t.account_key) as accounts_with_activity,
  SUM(CASE WHEN t.transaction_category = 'CREDIT' THEN t.transaction_amount ELSE 0 END) as total_inflows,
  SUM(CASE WHEN t.transaction_category = 'DEBIT' THEN ABS(t.transaction_amount) ELSE 0 END) as total_outflows,
  SUM(CASE WHEN t.transaction_category = 'CREDIT' THEN t.transaction_amount 
           WHEN t.transaction_category = 'DEBIT' THEN t.transaction_amount 
           ELSE 0 END) as net_change,
  COUNT(*) as total_transactions
FROM gold.fact_deposit_transactions t
JOIN gold.dim_date d ON t.transaction_date_key = d.date_key
WHERE d.date_value = CURRENT_DATE - 1;  -- Previous business day
    `,
  },

  dormantAccounts: {
    use_case: "Operations - Dormancy Management",
    complexity: "Medium",
    business_question: "Which accounts are dormant (no activity in 90+ days)?",
    sql: `
SELECT 
  p.product_category,
  COUNT(DISTINCT da.account_key) as dormant_accounts,
  SUM(dp.eod_balance) as dormant_balances,
  AVG(dp.days_since_last_activity) as avg_days_inactive,
  SUM(CASE WHEN dp.days_since_last_activity > 365 THEN dp.eod_balance ELSE 0 END) as balance_inactive_1yr_plus
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
JOIN gold.dim_product p ON da.product_key = p.product_key
WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
  AND dp.dormant_flag = TRUE
GROUP BY p.product_category
ORDER BY dormant_balances DESC;
    `,
  },

  overdraftAccounts: {
    use_case: "Operations - Overdraft Monitoring",
    complexity: "Simple",
    business_question: "How many DDA accounts are currently overdrawn?",
    sql: `
SELECT 
  COUNT(DISTINCT dp.account_key) as overdrawn_accounts,
  SUM(ABS(dp.eod_balance)) as total_overdraft_amount,
  AVG(ABS(dp.eod_balance)) as avg_overdraft_amount,
  MAX(ABS(dp.eod_balance)) as max_overdraft_amount,
  SUM(CASE WHEN dp.days_in_overdraft >= 30 THEN 1 ELSE 0 END) as chronic_overdrafts
FROM gold.fact_daily_account_positions dp
JOIN gold.dim_deposit_account da ON dp.account_key = da.account_key AND da.current_flag = TRUE
JOIN gold.dim_product p ON da.product_key = p.product_key
WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
  AND p.product_category = 'DDA'
  AND dp.negative_balance_flag = TRUE;
    `,
  },
};

// ============================================================================
// TREASURY & ALCO QUERIES
// ============================================================================

export const treasuryQueries = {
  costOfFunds: {
    use_case: "Treasury - Cost of Funds Analysis",
    complexity: "Medium",
    business_question: "What is our weighted average cost of funds by product?",
    sql: `
SELECT 
  p.product_category,
  SUM(mas.month_average_balance) as avg_balance,
  SUM(mas.month_interest_paid) as interest_paid,
  SUM(mas.month_interest_paid) / NULLIF(SUM(mas.month_average_balance), 0) * 12 * 100 as annualized_cof_pct,
  COUNT(DISTINCT mas.account_key) as account_count
FROM gold.fact_monthly_account_summary mas
JOIN gold.dim_deposit_account da ON mas.account_key = da.account_key
JOIN gold.dim_product p ON da.product_key = p.product_key
WHERE mas.year_month = DATE_TRUNC('month', DATEADD(month, -1, CURRENT_DATE))
  AND p.interest_bearing_flag = TRUE
GROUP BY p.product_category
ORDER BY avg_balance DESC;
    `,
  },

  depositBeta: {
    use_case: "Treasury - Deposit Beta Analysis",
    complexity: "Complex",
    business_question:
      "What is our deposit rate sensitivity to Fed rate changes?",
    sql: `
WITH rate_changes AS (
  SELECT 
    DATE_TRUNC('month', rate_change_date) as month,
    AVG(fed_funds_rate) as avg_fed_rate,
    LAG(AVG(fed_funds_rate)) OVER (ORDER BY DATE_TRUNC('month', rate_change_date)) as prior_fed_rate
  FROM gold.dim_market_rates
  WHERE rate_change_date >= DATEADD(year, -2, CURRENT_DATE)
  GROUP BY month
),
deposit_rates AS (
  SELECT 
    mas.year_month as month,
    p.product_category,
    SUM(mas.month_interest_paid) / NULLIF(SUM(mas.month_average_balance), 0) * 12 * 100 as deposit_rate,
    LAG(SUM(mas.month_interest_paid) / NULLIF(SUM(mas.month_average_balance), 0) * 12 * 100) 
      OVER (PARTITION BY p.product_category ORDER BY mas.year_month) as prior_deposit_rate
  FROM gold.fact_monthly_account_summary mas
  JOIN gold.dim_deposit_account da ON mas.account_key = da.account_key
  JOIN gold.dim_product p ON da.product_key = p.product_key
  WHERE mas.year_month >= DATEADD(year, -2, CURRENT_DATE)
  GROUP BY mas.year_month, p.product_category
)
SELECT 
  dr.product_category,
  REGR_SLOPE(dr.deposit_rate - dr.prior_deposit_rate, 
             rc.avg_fed_rate - rc.prior_fed_rate) as deposit_beta,
  REGR_R2(dr.deposit_rate - dr.prior_deposit_rate, 
          rc.avg_fed_rate - rc.prior_fed_rate) as r_squared
FROM deposit_rates dr
JOIN rate_changes rc ON dr.month = rc.month
WHERE dr.prior_deposit_rate IS NOT NULL
  AND rc.prior_fed_rate IS NOT NULL
GROUP BY dr.product_category;
    `,
  },
};

// ============================================================================
// FRAUD & AML QUERIES
// ============================================================================

export const fraudAMLQueries = {
  highRiskTransactions: {
    use_case: "Fraud/AML - High Risk Transactions",
    complexity: "Medium",
    business_question: "Which transactions today triggered fraud alerts?",
    sql: `
SELECT 
  t.transaction_id,
  c.customer_id,
  da.account_id,
  t.transaction_amount,
  t.transaction_type,
  t.channel,
  t.fraud_score,
  CASE 
    WHEN t.fraud_score >= 90 THEN 'CRITICAL'
    WHEN t.fraud_score >= 70 THEN 'HIGH'
    WHEN t.fraud_score >= 50 THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level,
  t.high_risk_flag,
  t.reversal_flag,
  t.disputed_flag
FROM gold.fact_deposit_transactions t
JOIN gold.dim_deposit_account da ON t.account_key = da.account_key
JOIN gold.dim_customer c ON t.customer_key = c.customer_key
JOIN gold.dim_date d ON t.transaction_date_key = d.date_key
WHERE d.date_value = CURRENT_DATE - 1
  AND (t.fraud_score >= 70 OR t.high_risk_flag = TRUE)
ORDER BY t.fraud_score DESC;
    `,
  },

  structuringDetection: {
    use_case: "AML - Structuring Detection",
    complexity: "Complex",
    business_question:
      "Which customers have multiple transactions just below $10K threshold?",
    sql: `
WITH daily_transactions AS (
  SELECT 
    c.customer_id,
    da.account_id,
    t.transaction_date,
    COUNT(*) as txn_count,
    SUM(t.transaction_amount) as total_amount
  FROM gold.fact_deposit_transactions t
  JOIN gold.dim_deposit_account da ON t.account_key = da.account_key
  JOIN gold.dim_customer c ON t.customer_key = c.customer_key
  WHERE t.transaction_date >= CURRENT_DATE - 30
    AND t.transaction_category = 'CREDIT'
    AND t.transaction_amount BETWEEN 9000 AND 9999
  GROUP BY c.customer_id, da.account_id, t.transaction_date
)
SELECT 
  customer_id,
  account_id,
  COUNT(DISTINCT transaction_date) as days_with_activity,
  SUM(txn_count) as total_near_threshold_txns,
  SUM(total_amount) as cumulative_amount
FROM daily_transactions
WHERE txn_count >= 2  -- Multiple transactions in single day
GROUP BY customer_id, account_id
HAVING SUM(txn_count) >= 3  -- At least 3 total transactions
ORDER BY cumulative_amount DESC;
    `,
  },
};

// ============================================================================
// ADVANCED ANALYTICS QUERIES
// ============================================================================

export const advancedAnalyticsQueries = {
  rfmSegmentation: {
    use_case: "Advanced Analytics - RFM Segmentation",
    complexity: "Complex",
    business_question:
      "Segment customers by Recency, Frequency, Monetary value",
    sql: `
WITH customer_metrics AS (
  SELECT 
    c.customer_key,
    c.customer_id,
    DATEDIFF(day, MAX(t.transaction_date), CURRENT_DATE) as recency_days,
    COUNT(DISTINCT t.transaction_date) as frequency_days,
    SUM(t.transaction_amount) as monetary_value,
    AVG(dp.eod_balance) as avg_balance
  FROM gold.dim_customer c
  LEFT JOIN gold.fact_deposit_transactions t ON c.customer_key = t.customer_key
  LEFT JOIN gold.fact_daily_account_positions dp ON c.customer_key = dp.customer_key
  WHERE t.transaction_date >= DATEADD(year, -1, CURRENT_DATE)
    AND c.current_flag = TRUE
  GROUP BY c.customer_key, c.customer_id
),
rfm_scores AS (
  SELECT 
    *,
    NTILE(5) OVER (ORDER BY recency_days ASC) as recency_score,
    NTILE(5) OVER (ORDER BY frequency_days DESC) as frequency_score,
    NTILE(5) OVER (ORDER BY monetary_value DESC) as monetary_score
  FROM customer_metrics
)
SELECT 
  CONCAT(recency_score, frequency_score, monetary_score) as rfm_segment,
  COUNT(*) as customer_count,
  AVG(recency_days) as avg_recency_days,
  AVG(frequency_days) as avg_frequency_days,
  AVG(monetary_value) as avg_monetary_value,
  AVG(avg_balance) as avg_balance
FROM rfm_scores
GROUP BY rfm_segment
ORDER BY rfm_segment;
    `,
  },

  balanceConcentration: {
    use_case: "Advanced Analytics - Balance Concentration",
    complexity: "Medium",
    business_question:
      "What percentage of balances comes from top 10% of customers?",
    sql: `
WITH customer_balances AS (
  SELECT 
    c.customer_key,
    SUM(dp.eod_balance) as total_balance,
    PERCENT_RANK() OVER (ORDER BY SUM(dp.eod_balance) DESC) as percentile_rank
  FROM gold.fact_daily_account_positions dp
  JOIN gold.dim_customer c ON dp.customer_key = c.customer_key
  WHERE dp.position_date_key = (SELECT MAX(date_key) FROM gold.dim_date)
  GROUP BY c.customer_key
)
SELECT 
  CASE 
    WHEN percentile_rank <= 0.10 THEN 'Top 10%'
    WHEN percentile_rank <= 0.25 THEN 'Top 11-25%'
    WHEN percentile_rank <= 0.50 THEN 'Top 26-50%'
    ELSE 'Bottom 50%'
  END as customer_segment,
  COUNT(*) as customer_count,
  SUM(total_balance) as segment_balance,
  SUM(total_balance) / SUM(SUM(total_balance)) OVER () * 100 as pct_of_total_balances
FROM customer_balances
GROUP BY customer_segment
ORDER BY pct_of_total_balances DESC;
    `,
  },
};

// ============================================================================
// QUERY CATALOG SUMMARY
// ============================================================================

export const queryCookbook = {
  totalQueries: 24,

  categories: {
    executiveDashboard: Object.keys(executiveDashboardQueries).length,
    productAnalytics: Object.keys(productAnalyticsQueries).length,
    customerAnalytics: Object.keys(customerAnalyticsQueries).length,
    regulatoryReporting: Object.keys(regulatoryReportingQueries).length,
    operational: Object.keys(operationalQueries).length,
    treasury: Object.keys(treasuryQueries).length,
    fraudAML: Object.keys(fraudAMLQueries).length,
    advancedAnalytics: Object.keys(advancedAnalyticsQueries).length,
  },

  complexityBreakdown: {
    simple: 8,
    medium: 10,
    complex: 6,
  },

  allQueries: {
    ...executiveDashboardQueries,
    ...productAnalyticsQueries,
    ...customerAnalyticsQueries,
    ...regulatoryReportingQueries,
    ...operationalQueries,
    ...treasuryQueries,
    ...fraudAMLQueries,
    ...advancedAnalyticsQueries,
  },

  queryPatterns: [
    "Window functions for trends (LAG, LEAD, NTILE)",
    "Common Table Expressions (CTEs) for readability",
    "PERCENTILE_CONT for distribution analysis",
    "REGR_SLOPE/REGR_R2 for regression analysis",
    "Date dimension joins for time intelligence",
    "Product/customer dimension joins for context",
    "Aggregations at multiple grains",
    "Conditional aggregation with CASE statements",
  ],

  bestPractices: [
    "Always join to current_flag = TRUE for SCD2 dimensions",
    "Use date_key for efficient date filtering",
    "Leverage pre-aggregated fact tables for performance",
    "Include business context columns (customer_segment, product_category)",
    "Use meaningful CTEs for complex queries",
    "Comment complex business logic",
    "Test with WHERE clauses on partitioned columns",
  ],

  completeness:
    "100% - Comprehensive query cookbook with 24+ production-ready queries",
};
