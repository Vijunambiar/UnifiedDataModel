// Gold Layer Aggregation Strategies for Banking Domains
// Logically designed aggregations following Star Schema principles
// Focus: Business value, performance optimization, regulatory compliance

export const GoldLayerAggregations = {
  architecture: {
    description: "Gold Layer aggregations follow Star Schema design with conformed dimensions",
    principles: [
      "Aggregate at business-relevant grains (daily → weekly → monthly)",
      "Use surrogate keys from Silver conformed dimensions",
      "Pre-compute metrics to avoid runtime calculations",
      "Maintain audit columns (created_date, updated_date, source_count)",
      "Build hierarchies: atomic facts → daily summaries → higher granularities",
      "Implement slowly changing dimension Type 1 for current metrics",
      "Use partitioning for performance and maintenance",
    ],
  },

  customerCore: {
    name: "Customer Core Domain - Gold Layer Aggregations",
    description: "Customer-centric aggregations for 360° view and lifecycle analysis",

    tables: {
      customerSnapshot: {
        name: "FCT_CUSTOMER_SNAPSHOT",
        grain: "Customer x Day",
        description: "Daily point-in-time customer metrics snapshot",
        businessLogic: `Captures daily customer state: active accounts, total balances, products used, 
                       risk scores, lifecycle stage. Used for trend analysis and customer journey tracking.`,
        columns: [
          "snapshot_date",
          "customer_key",
          "total_accounts",
          "active_accounts",
          "total_balance_amount",
          "total_limit_amount",
          "total_deposits",
          "total_loans",
          "total_investments",
          "num_products_active",
          "lifecycle_stage (NEW, ACTIVE, DORMANT, AT_RISK, CHURNED)",
          "risk_score",
          "compliance_status",
          "last_transaction_date",
          "days_since_activity",
          "customer_segment",
          "record_count (from bronze)",
          "source_system",
          "created_date",
        ],
        sql: `CREATE TABLE ANALYTICS.FCT_CUSTOMER_SNAPSHOT (
  snapshot_date DATE,
  customer_key INT,
  total_accounts INT,
  active_accounts INT,
  total_balance_amount DECIMAL(18,2),
  total_limit_amount DECIMAL(18,2),
  total_deposits DECIMAL(18,2),
  total_loans DECIMAL(18,2),
  total_investments DECIMAL(18,2),
  num_products_active INT,
  lifecycle_stage VARCHAR(50),
  risk_score DECIMAL(5,2),
  compliance_status VARCHAR(50),
  last_transaction_date DATE,
  days_since_activity INT,
  customer_segment VARCHAR(50),
  record_count INT,
  source_system VARCHAR(50),
  created_date DATETIME2,
  CONSTRAINT PK_CUST_SNAPSHOT PRIMARY KEY (snapshot_date, customer_key),
  FOREIGN KEY (customer_key) REFERENCES SILVER.DIM_CUSTOMER_GOLDEN(customer_key)
);
CREATE INDEX IX_CUST_SNAP_DATE ON ANALYTICS.FCT_CUSTOMER_SNAPSHOT(snapshot_date);
CREATE INDEX IX_CUST_SNAP_SEGMENT ON ANALYTICS.FCT_CUSTOMER_SNAPSHOT(customer_segment, snapshot_date);`,
      },

      customerMonthlyMetrics: {
        name: "DIM_CUSTOMER_MONTHLY_METRICS",
        grain: "Customer x Month",
        description: "Monthly aggregated customer metrics for trend analysis and reporting",
        businessLogic: `Aggregates daily snapshots into monthly summaries. Calculates averages, 
                       highs, lows for key metrics. Used for trend detection and period-over-period analysis.`,
        columns: [
          "year_month",
          "customer_key",
          "avg_balance",
          "max_balance",
          "min_balance",
          "avg_active_accounts",
          "total_transactions",
          "total_transaction_amount",
          "avg_transaction_amount",
          "deposit_in_amount",
          "deposit_out_amount",
          "loan_disbursals",
          "loan_repayments",
          "new_products_opened",
          "products_closed",
          "churn_risk_flag",
          "segment_at_month_start",
          "segment_at_month_end",
        ],
        sql: `INSERT INTO ANALYTICS.DIM_CUSTOMER_MONTHLY_METRICS (year_month, customer_key, avg_balance, max_balance, min_balance, avg_active_accounts, ...)
SELECT 
  DATEFROMPARTS(YEAR(snapshot_date), MONTH(snapshot_date), 1) AS year_month,
  customer_key,
  AVG(total_balance_amount) AS avg_balance,
  MAX(total_balance_amount) AS max_balance,
  MIN(total_balance_amount) AS min_balance,
  AVG(active_accounts) AS avg_active_accounts,
  SUM(CASE WHEN transaction_count > 0 THEN transaction_count ELSE 0 END) AS total_transactions,
  SUM(transaction_amount) AS total_transaction_amount,
  AVG(transaction_amount) AS avg_transaction_amount,
  SUM(CASE WHEN transaction_type = 'DEPOSIT' THEN amount ELSE 0 END) AS deposit_in_amount,
  SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) AS deposit_out_amount,
  SUM(CASE WHEN transaction_type = 'LOAN_DISBURSAL' THEN 1 ELSE 0 END) AS loan_disbursals,
  SUM(CASE WHEN transaction_type = 'LOAN_REPAYMENT' THEN amount ELSE 0 END) AS loan_repayments,
  COUNT(DISTINCT CASE WHEN products_opened > 0 THEN 1 END) AS new_products_opened,
  COUNT(DISTINCT CASE WHEN products_closed > 0 THEN 1 END) AS products_closed,
  CASE WHEN risk_score > 70 THEN 1 ELSE 0 END AS churn_risk_flag,
  FIRST_VALUE(customer_segment) OVER (PARTITION BY customer_key, YEAR(snapshot_date), MONTH(snapshot_date) ORDER BY snapshot_date) AS segment_at_month_start,
  LAST_VALUE(customer_segment) OVER (PARTITION BY customer_key, YEAR(snapshot_date), MONTH(snapshot_date) ORDER BY snapshot_date) AS segment_at_month_end
FROM ANALYTICS.FCT_CUSTOMER_SNAPSHOT
GROUP BY DATEFROMPARTS(YEAR(snapshot_date), MONTH(snapshot_date), 1), customer_key;`,
      },

      customerSegmentAggr: {
        name: "DIM_CUSTOMER_SEGMENT_DAILY",
        grain: "Customer Segment x Day",
        description: "Rolled-up metrics by customer segment for segment performance analysis",
        businessLogic: `Aggregates individual customer metrics to segment level. Used for segment-level 
                       KPIs, marketing analysis, and profitability metrics by segment tier.`,
        sql: `INSERT INTO ANALYTICS.DIM_CUSTOMER_SEGMENT_DAILY
SELECT 
  snapshot_date,
  customer_segment,
  COUNT(DISTINCT customer_key) AS num_customers,
  SUM(total_balance_amount) AS total_segment_balance,
  AVG(total_balance_amount) AS avg_customer_balance,
  SUM(active_accounts) AS total_active_accounts,
  SUM(num_products_active) AS total_products,
  COUNT(DISTINCT CASE WHEN days_since_activity <= 30 THEN customer_key END) AS active_customers_30d,
  COUNT(DISTINCT CASE WHEN churn_risk_flag = 1 THEN customer_key END) AS at_risk_customers,
  AVG(risk_score) AS avg_risk_score,
  SUM(CASE WHEN lifecycle_stage = 'ACTIVE' THEN 1 ELSE 0 END) AS active_stage_count,
  SUM(CASE WHEN lifecycle_stage = 'AT_RISK' THEN 1 ELSE 0 END) AS at_risk_stage_count,
  SUM(CASE WHEN compliance_status = 'COMPLIANT' THEN 1 ELSE 0 END) AS compliant_count
FROM ANALYTICS.FCT_CUSTOMER_SNAPSHOT
GROUP BY snapshot_date, customer_segment;`,
      },
    },
  },

  deposits: {
    name: "Deposits Domain - Gold Layer Aggregations",
    description: "Account and deposit-centric aggregations for deposits management and regulatory reporting",

    tables: {
      dailyAccountBalance: {
        name: "FCT_DEPOSIT_DAILY_BALANCE",
        grain: "Account x Day",
        description: "Daily point-in-time account balance and activity metrics",
        businessLogic: `Captures daily account state: opening/closing balances, transactions, interest accrual.
                       This is the atomic fact table - all higher granularities aggregate from this.`,
        columns: [
          "balance_date",
          "account_key",
          "customer_key",
          "product_key",
          "branch_key",
          "opening_balance",
          "closing_balance",
          "daily_change_amount",
          "num_deposits (count of deposit transactions)",
          "num_withdrawals",
          "total_deposits_amount",
          "total_withdrawals_amount",
          "interest_accrued",
          "fees_charged",
          "min_balance_during_day",
          "max_balance_during_day",
          "account_status (ACTIVE, DORMANT, CLOSED)",
          "days_with_zero_balance",
        ],
        sql: `CREATE TABLE ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE (
  balance_date DATE,
  account_key INT,
  customer_key INT,
  product_key INT,
  branch_key INT,
  opening_balance DECIMAL(18,2),
  closing_balance DECIMAL(18,2),
  daily_change_amount DECIMAL(18,2),
  num_deposits INT,
  num_withdrawals INT,
  total_deposits_amount DECIMAL(18,2),
  total_withdrawals_amount DECIMAL(18,2),
  interest_accrued DECIMAL(10,2),
  fees_charged DECIMAL(10,2),
  min_balance_during_day DECIMAL(18,2),
  max_balance_during_day DECIMAL(18,2),
  account_status VARCHAR(50),
  days_with_zero_balance INT,
  CONSTRAINT PK_DEP_DAILY PRIMARY KEY (balance_date, account_key),
  FOREIGN KEY (account_key) REFERENCES SILVER.DIM_ACCOUNT(account_key),
  FOREIGN KEY (customer_key) REFERENCES SILVER.DIM_CUSTOMER_GOLDEN(customer_key),
  FOREIGN KEY (product_key) REFERENCES SILVER.DIM_DEPOSIT_PRODUCT(product_key)
);
CREATE INDEX IX_DEP_DAILY_DATE ON ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE(balance_date);
CREATE INDEX IX_DEP_DAILY_CUST ON ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE(customer_key, balance_date);`,
      },

      monthlyAccountSummary: {
        name: "DIM_DEPOSIT_MONTHLY_SUMMARY",
        grain: "Account x Month",
        description: "Monthly aggregated account metrics for trend analysis and regulatory reporting",
        businessLogic: `Aggregates daily account balances into monthly periods. Calculates average balance 
                       (required for interest calculations and regulatory metrics like LCR). Groups 
                       transactions by type and amount band.`,
        sql: `INSERT INTO ANALYTICS.DIM_DEPOSIT_MONTHLY_SUMMARY
SELECT 
  DATEFROMPARTS(YEAR(balance_date), MONTH(balance_date), 1) AS month_end,
  account_key,
  customer_key,
  product_key,
  AVG(closing_balance) AS avg_monthly_balance,
  MAX(closing_balance) AS max_monthly_balance,
  MIN(closing_balance) AS min_monthly_balance,
  AVG(CASE WHEN closing_balance > 0 THEN closing_balance END) AS avg_balance_when_positive,
  SUM(CASE WHEN closing_balance < 0 THEN 1 ELSE 0 END) AS days_overdrawn,
  SUM(num_deposits) AS total_deposits_count,
  SUM(num_withdrawals) AS total_withdrawals_count,
  SUM(total_deposits_amount) AS total_deposits_amount,
  SUM(total_withdrawals_amount) AS total_withdrawals_amount,
  SUM(interest_accrued) AS total_interest_accrued,
  SUM(fees_charged) AS total_fees_charged,
  COUNT(DISTINCT CASE WHEN daily_change_amount > 0 THEN balance_date END) AS days_with_inflow,
  COUNT(DISTINCT CASE WHEN daily_change_amount < 0 THEN balance_date END) AS days_with_outflow,
  COUNT(DISTINCT CASE WHEN closing_balance = 0 THEN balance_date END) AS days_with_zero_balance,
  LAST_VALUE(account_status) OVER (PARTITION BY account_key ORDER BY balance_date) AS account_status_at_month_end,
  CASE WHEN AVG(closing_balance) >= 100000 THEN 'HIGH_BALANCE' 
       WHEN AVG(closing_balance) >= 10000 THEN 'MEDIUM_BALANCE'
       ELSE 'LOW_BALANCE' END AS balance_tier
FROM ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE
WHERE balance_date >= DATEADD(MONTH, -36, GETDATE())
GROUP BY DATEFROMPARTS(YEAR(balance_date), MONTH(balance_date), 1), account_key, customer_key, product_key;`,
      },

      productPerformance: {
        name: "DIM_PRODUCT_PERFORMANCE_DAILY",
        grain: "Product x Branch x Day",
        description: "Product-level performance aggregations for portfolio analysis",
        businessLogic: `Aggregates account metrics to product level across branches. Used for product 
                       profitability, market share analysis, and product mix planning.`,
        sql: `INSERT INTO ANALYTICS.DIM_PRODUCT_PERFORMANCE_DAILY
SELECT 
  balance_date,
  product_key,
  branch_key,
  COUNT(DISTINCT account_key) AS num_active_accounts,
  COUNT(DISTINCT customer_key) AS num_unique_customers,
  SUM(closing_balance) AS total_product_balance,
  AVG(closing_balance) AS avg_account_balance,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY closing_balance) OVER (PARTITION BY product_key, branch_key, balance_date) AS median_balance,
  SUM(interest_accrued) AS total_interest_earned,
  SUM(fees_charged) AS total_fees_collected,
  SUM(num_deposits) AS total_deposit_transactions,
  SUM(total_deposits_amount) AS total_deposits_inflow,
  COUNT(DISTINCT CASE WHEN closing_balance > opening_balance THEN account_key END) AS accounts_with_growth,
  COUNT(DISTINCT CASE WHEN account_status = 'DORMANT' THEN account_key END) AS dormant_accounts,
  CASE WHEN SUM(closing_balance) >= 1000000 THEN 'HIGH_AUM' 
       WHEN SUM(closing_balance) >= 100000 THEN 'MEDIUM_AUM'
       ELSE 'LOW_AUM' END AS aum_category
FROM ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE
GROUP BY balance_date, product_key, branch_key;`,
      },

      regulatoryMetrics: {
        name: "FCT_REGULATORY_METRICS",
        grain: "Scenario x Day (for LCR/NSFR calculation)",
        description: "Aggregations for regulatory compliance reporting (LCR, NSFR)",
        businessLogic: `Calculates liquid assets, funding liabilities, and cash outflows required for 
                       regulatory metrics. Segment deposits by stability class for regulation.`,
        sql: `INSERT INTO ANALYTICS.FCT_REGULATORY_METRICS
SELECT 
  balance_date,
  'LCR' AS metric_type,
  SUM(CASE WHEN closing_balance > 0 AND account_tenure_months > 24 THEN closing_balance ELSE 0 END) AS stable_deposits,
  SUM(CASE WHEN closing_balance > 0 AND account_tenure_months <= 24 THEN closing_balance ELSE 0 END) AS less_stable_deposits,
  SUM(CASE WHEN closing_balance > 0 THEN closing_balance ELSE 0 END) AS total_customer_deposits,
  SUM(CASE WHEN days_since_activity > 90 THEN closing_balance ELSE 0 END) AS dormant_deposit_balance,
  SUM(CASE WHEN closing_balance > 250000 THEN closing_balance ELSE 0 END) AS large_deposits,
  SUM(CASE WHEN closing_balance <= 250000 AND closing_balance > 0 THEN closing_balance ELSE 0 END) AS small_deposits,
  COUNT(DISTINCT account_key) AS total_deposit_accounts,
  COUNT(DISTINCT customer_key) AS num_depositors
FROM ANALYTICS.FCT_DEPOSIT_DAILY_BALANCE
GROUP BY balance_date;`,
      },
    },
  },

  transactions: {
    name: "Transactions Domain - Gold Layer Aggregations",
    description: "Transaction-centric aggregations for payment flows, fraud detection, and patterns",

    tables: {
      transactionFact: {
        name: "FCT_TRANSACTION_DETAIL",
        grain: "Individual Transaction",
        description: "Atomic transaction fact table - lowest grain, source for all aggregations",
        businessLogic: `Stores every transaction with classification. Includes fraud flags, value bands, 
                       time dimensions. This is the source truth for all transaction aggregations.`,
        columns: [
          "transaction_date",
          "transaction_key",
          "account_key",
          "customer_key",
          "counterparty_key",
          "transaction_type (DEBIT, CREDIT, TRANSFER, ACH, WIRE)",
          "transaction_amount",
          "transaction_amount_band (MICRO <100, SMALL 100-1K, MEDIUM 1K-10K, LARGE 10K-100K, JUMBO >100K)",
          "currency_code",
          "channel (ONLINE, ATM, BRANCH, MOBILE, API)",
          "merchant_category",
          "fraud_flag",
          "fraud_probability_score",
          "compliance_screening_status",
          "transaction_status (COMPLETED, PENDING, FAILED, REVERSED)",
          "processing_time_seconds",
          "day_of_week",
          "hour_of_day",
        ],
        sql: `CREATE TABLE ANALYTICS.FCT_TRANSACTION_DETAIL (
  transaction_date DATE,
  transaction_key BIGINT PRIMARY KEY,
  account_key INT,
  customer_key INT,
  counterparty_key INT,
  transaction_type VARCHAR(50),
  transaction_amount DECIMAL(18,2),
  transaction_amount_band VARCHAR(50),
  currency_code VARCHAR(3),
  channel VARCHAR(50),
  merchant_category VARCHAR(100),
  fraud_flag BIT,
  fraud_probability_score DECIMAL(5,2),
  compliance_screening_status VARCHAR(50),
  transaction_status VARCHAR(50),
  processing_time_seconds INT,
  day_of_week INT,
  hour_of_day INT,
  FOREIGN KEY (account_key) REFERENCES SILVER.DIM_ACCOUNT(account_key),
  FOREIGN KEY (customer_key) REFERENCES SILVER.DIM_CUSTOMER_GOLDEN(customer_key)
);
CREATE INDEX IX_TXN_DATE ON ANALYTICS.FCT_TRANSACTION_DETAIL(transaction_date);
CREATE INDEX IX_TXN_FRAUD ON ANALYTICS.FCT_TRANSACTION_DETAIL(fraud_flag, transaction_date);`,
      },

      dailyTransactionSummary: {
        name: "DIM_TRANSACTION_DAILY_SUMMARY",
        grain: "Account x Day",
        description: "Daily transaction activity aggregation",
        businessLogic: `Aggregates all transactions for an account on a given day. Groups by type, 
                       amount band, channel. Used for transaction pattern analysis and fraud detection.`,
        sql: `INSERT INTO ANALYTICS.DIM_TRANSACTION_DAILY_SUMMARY
SELECT 
  transaction_date,
  account_key,
  customer_key,
  SUM(CASE WHEN transaction_type = 'DEBIT' THEN 1 ELSE 0 END) AS debit_count,
  SUM(CASE WHEN transaction_type = 'CREDIT' THEN 1 ELSE 0 END) AS credit_count,
  SUM(CASE WHEN transaction_type = 'TRANSFER' THEN 1 ELSE 0 END) AS transfer_count,
  SUM(CASE WHEN transaction_type = 'ACH' THEN 1 ELSE 0 END) AS ach_count,
  SUM(CASE WHEN transaction_type = 'WIRE' THEN 1 ELSE 0 END) AS wire_count,
  SUM(CASE WHEN transaction_type = 'DEBIT' THEN transaction_amount ELSE 0 END) AS debit_amount,
  SUM(CASE WHEN transaction_type = 'CREDIT' THEN transaction_amount ELSE 0 END) AS credit_amount,
  SUM(CASE WHEN transaction_type = 'TRANSFER' THEN transaction_amount ELSE 0 END) AS transfer_amount,
  AVG(CASE WHEN transaction_type IN ('DEBIT', 'CREDIT') THEN transaction_amount END) AS avg_transaction_amount,
  MAX(CASE WHEN transaction_type IN ('DEBIT', 'CREDIT') THEN transaction_amount END) AS max_transaction_amount,
  COUNT(DISTINCT CASE WHEN fraud_flag = 1 THEN transaction_key END) AS fraud_transaction_count,
  SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END) AS fraud_transaction_amount,
  COUNT(DISTINCT channel) AS num_channels_used,
  SUM(CASE WHEN channel = 'ONLINE' THEN 1 ELSE 0 END) AS online_transactions,
  SUM(CASE WHEN channel = 'ATM' THEN 1 ELSE 0 END) AS atm_transactions,
  SUM(CASE WHEN channel = 'MOBILE' THEN 1 ELSE 0 END) AS mobile_transactions,
  AVG(processing_time_seconds) AS avg_processing_time_seconds,
  COUNT(*) AS total_transactions
FROM ANALYTICS.FCT_TRANSACTION_DETAIL
GROUP BY transaction_date, account_key, customer_key;`,
      },

      monthlyTransactionTrends: {
        name: "DIM_TRANSACTION_MONTHLY_TRENDS",
        grain: "Customer x Month",
        description: "Monthly transaction patterns and behavioral trends",
        businessLogic: `Aggregates daily summaries into monthly periods. Detects behavioral changes: 
                       transaction velocity, amount escalations, new channels, fraud patterns. Used for 
                       AML monitoring, fraud risk scoring, and customer behavior analysis.`,
        sql: `INSERT INTO ANALYTICS.DIM_TRANSACTION_MONTHLY_TRENDS
SELECT 
  DATEFROMPARTS(YEAR(transaction_date), MONTH(transaction_date), 1) AS month_end,
  customer_key,
  COUNT(DISTINCT account_key) AS active_accounts,
  SUM(total_transactions) AS total_transactions_count,
  AVG(total_transactions) AS avg_daily_transactions,
  MAX(total_transactions) AS max_daily_transactions,
  STDEV(total_transactions) AS transaction_volatility,
  SUM(CASE WHEN transaction_type = 'DEBIT' THEN transaction_amount ELSE 0 END) AS total_debits,
  SUM(CASE WHEN transaction_type = 'CREDIT' THEN transaction_amount ELSE 0 END) AS total_credits,
  SUM(debit_amount) / NULLIF(SUM(CASE WHEN transaction_type = 'DEBIT' THEN 1 ELSE 0 END), 0) AS avg_debit_amount,
  SUM(CASE WHEN fraud_flag = 1 THEN fraud_transaction_count ELSE 0 END) AS monthly_fraud_transactions,
  SUM(CASE WHEN fraud_flag = 1 THEN fraud_transaction_amount ELSE 0 END) AS monthly_fraud_amount,
  COUNT(DISTINCT CASE WHEN fraud_flag = 1 THEN transaction_date END) AS fraud_days,
  COUNT(DISTINCT CASE WHEN channel = 'WIRE' THEN transaction_date END) AS days_with_wire_activity,
  SUM(CASE WHEN transaction_amount_band = 'JUMBO' THEN 1 ELSE 0 END) AS jumbo_transactions,
  CASE WHEN SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) > 3 THEN 'HIGH_RISK' 
       WHEN SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) > 0 THEN 'MEDIUM_RISK'
       ELSE 'LOW_RISK' END AS fraud_risk_category
FROM ANALYTICS.DIM_TRANSACTION_DAILY_SUMMARY
GROUP BY DATEFROMPARTS(YEAR(transaction_date), MONTH(transaction_date), 1), customer_key;`,
      },

      fraudAnalytics: {
        name: "FCT_FRAUD_RISK_DAILY",
        grain: "Customer x Day",
        description: "Daily fraud risk metrics for monitoring and investigation",
        businessLogic: `Calculates fraud indicators: unusual transaction patterns, amount escalations, 
                       new merchants, off-hours activity. Aggregates fraud scores and risk flags. Used 
                       for real-time fraud alerts and investigative analytics.`,
        sql: `INSERT INTO ANALYTICS.FCT_FRAUD_RISK_DAILY
SELECT 
  transaction_date,
  customer_key,
  COUNT(DISTINCT CASE WHEN fraud_flag = 1 THEN transaction_key END) AS flagged_transactions,
  SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END) AS flagged_amount,
  AVG(fraud_probability_score) AS avg_fraud_score,
  MAX(fraud_probability_score) AS max_fraud_score,
  COUNT(DISTINCT merchant_category) AS unique_merchants,
  COUNT(DISTINCT CASE WHEN hour_of_day BETWEEN 23 AND 5 THEN transaction_key END) AS off_hours_transactions,
  MAX(transaction_amount) AS max_transaction_today,
  CASE WHEN MAX(transaction_amount) > (SELECT AVG(max_transaction_amount) FROM ANALYTICS.DIM_TRANSACTION_DAILY_SUMMARY 
                                        WHERE customer_key = d.customer_key AND transaction_date >= DATEADD(DAY, -30, d.transaction_date)) 
       THEN 'AMOUNT_SPIKE' ELSE 'NORMAL' END AS amount_escalation_flag,
  COUNT(DISTINCT CASE WHEN compliance_screening_status = 'BLOCKED' THEN transaction_key END) AS compliance_blocked_count
FROM ANALYTICS.FCT_TRANSACTION_DETAIL d
GROUP BY transaction_date, customer_key;`,
      },
    },
  },

  bestPractices: {
    aggregationStrategy: [
      "Start with atomic fact tables (lowest grain): each transaction, daily account balance, daily customer state",
      "Use surrogate keys from conformed dimensions to enable efficient joins",
      "Pre-compute common queries at 2-3 granularity levels: daily → weekly/monthly → quarterly/yearly",
      "Partition tables by date for efficient archival and query performance",
      "Denormalize (flatten) frequently accessed dimension attributes into fact tables",
      "Include source record counts and audit columns for data quality tracking",
      "Use amount bands, balance tiers, risk categories for dimensional analysis",
      "Implement slowly changing dimensions Type 1 (overwrite) for current state metrics",
      "Calculate ratios, percentiles, and statistical measures at aggregation time (not at query time)",
      "Build business-logic-driven aggregations (lifecycle stages, risk scores) not mechanical sums",
    ],
    performanceOptimization: [
      "Partition fact tables by transaction_date or balance_date for parallel processing",
      "Cluster dimension tables by commonly filtered attributes (customer_segment, product_type)",
      "Create non-clustered indexes on foreign keys and frequently filtered columns",
      "Use materialized views for complex aggregations with many joins",
      "Archive historical data (>2 years) to separate tables/storage for performance",
      "Run aggregations incrementally: today's facts → update daily → roll to monthly",
      "Use column statistics to guide query optimizer for large joins",
      "Implement incremental fact table loads with change data capture (CDC)",
    ],
    dataQualityChecks: [
      "Reconcile aggregations: daily aggregations ≠ sum of atomic facts = data loss",
      "Check for NULL handling: COUNT(*) vs COUNT(column) to detect incomplete data",
      "Validate customer-level totals: sum of accounts should match customer snapshot",
      "Monitor aggregation latency: track time between source update and aggregation completion",
      "Audit trail: maintain created_date, updated_date, record_count in all aggregations",
      "Time zone consistency: ensure all timestamps use consistent timezone handling",
    ],
  },
};

export default GoldLayerAggregations;
