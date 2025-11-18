/**
 * CUSTOMER DOMAIN - GOLD LAYER - DDL SPECIFICATIONS
 * 
 * Cross-domain aggregated analytics layer
 * Contains AGGREGATE table for comprehensive customer 360° view
 * Source: CORE_CUSTOMERS (Silver) + CORE_DEPOSIT (Silver)
 */

export interface GoldTableColumn {
  columnName: string;
  dataType: string;
  sourceSchema: string;
  sourceTable: string;
  sourceColumn: string;
  businessMeaning: string;
  nullable: boolean;
}

export interface GoldTable {
  name: string;
  schema: string;
  type: "FACT" | "DIMENSION" | "AGGREGATE";
  grain: string;
  description: string;
  columns: GoldTableColumn[];
  estimatedRows: number;
  updateFrequency: string;
}

// ============================================================================
// AGG_CUSTOMER_360_VIEW - Customer 360 Degree View Aggregate
// ============================================================================
export const aggCustomer360ViewTable: GoldTable = {
  name: "AGG_CUSTOMER_360_VIEW",
  schema: "ANALYTICS",
  type: "AGGREGATE",
  grain: "One row per customer with comprehensive 360° metrics",
  description: "Comprehensive customer profile combining demographics, account metrics, transaction behavior, deposit patterns, and relationship indicators",
  estimatedRows: 5500000,
  updateFrequency: "Daily",
  columns: [
    // IDENTIFIERS
    {
      columnName: "CUSTOMER_ID",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_CUSTOMERS",
      sourceTable: "DIM_CUSTOMER",
      sourceColumn: "CUSTOMER_NUMBER",
      businessMeaning: "Unique customer identifier",
      nullable: false,
    },
    {
      columnName: "TAX_ID",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_CUSTOMERS",
      sourceTable: "DIM_CUSTOMER_IDENTIFIER",
      sourceColumn: "TAX_IDENTIFICATION_NUMBER",
      businessMeaning: "Tax identification number (encrypted)",
      nullable: true,
    },
    {
      columnName: "PROCESS_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "SYSTEM",
      sourceColumn: "CURRENT_DATE",
      businessMeaning: "Processing date for the snapshot",
      nullable: false,
    },

    // DEMOGRAPHICS
    {
      columnName: "AGE_BRACKET",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN AGE < 30 THEN '18-30' ELSE '50+' END",
      businessMeaning: "Age bracket classification",
      nullable: true,
    },
    {
      columnName: "EDUCATION_LEVEL",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_CUSTOMERS",
      sourceTable: "DIM_CUSTOMER_DEMOGRAPHY",
      sourceColumn: "EDUCATION_LEVEL",
      businessMeaning: "Education level",
      nullable: true,
    },
    {
      columnName: "MARITAL_STATUS",
      dataType: "VARCHAR(20)",
      sourceSchema: "CORE_CUSTOMERS",
      sourceTable: "DIM_CUSTOMER_DEMOGRAPHY",
      sourceColumn: "MARITAL_STATUS",
      businessMeaning: "Marital status",
      nullable: true,
    },
    {
      columnName: "EMPLOYMENT_STATUS",
      dataType: "VARCHAR(50)",
      sourceSchema: "CORE_CUSTOMERS",
      sourceTable: "DIM_CUSTOMER_DEMOGRAPHY",
      sourceColumn: "EMPLOYMENT_STATUS",
      businessMeaning: "Employment status",
      nullable: true,
    },

    // ACCOUNT METRICS
    {
      columnName: "TOTAL_ACCOUNTS",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT ACCOUNT_NUMBER)",
      businessMeaning: "Total number of active accounts",
      nullable: true,
    },
    {
      columnName: "CHECKING_ACCOUNT_COUNT",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT ACCOUNT_NUMBER WHERE ACCOUNT_TYPE='CHECKING')",
      businessMeaning: "Count of checking accounts",
      nullable: true,
    },
    {
      columnName: "SAVINGS_ACCOUNT_COUNT",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT ACCOUNT_NUMBER WHERE ACCOUNT_TYPE='SAVINGS')",
      businessMeaning: "Count of savings accounts",
      nullable: true,
    },
    {
      columnName: "CD_ACCOUNT_COUNT",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT ACCOUNT_NUMBER WHERE ACCOUNT_TYPE='CD')",
      businessMeaning: "Count of CD accounts",
      nullable: true,
    },
    {
      columnName: "AVERAGE_ACCOUNT_TENURE_YEARS",
      dataType: "DECIMAL(5,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(DATEDIFF(year, ACCOUNT_OPEN_DATE, CURRENT_DATE))",
      businessMeaning: "Average account tenure in years",
      nullable: true,
    },

    // BALANCE METRICS
    {
      columnName: "TOTAL_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(CURRENT_BALANCE)",
      businessMeaning: "Total balance across all accounts",
      nullable: true,
    },
    {
      columnName: "CHECKING_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(CURRENT_BALANCE WHERE ACCOUNT_TYPE='CHECKING')",
      businessMeaning: "Total checking account balance",
      nullable: true,
    },
    {
      columnName: "SAVINGS_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(CURRENT_BALANCE WHERE ACCOUNT_TYPE='SAVINGS')",
      businessMeaning: "Total savings account balance",
      nullable: true,
    },
    {
      columnName: "CD_BALANCE",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(CURRENT_BALANCE WHERE ACCOUNT_TYPE='CD')",
      businessMeaning: "Total CD balance",
      nullable: true,
    },
    {
      columnName: "AVERAGE_BALANCE_90D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(CURRENT_BALANCE) OVER 90 DAYS",
      businessMeaning: "Average daily balance over last 90 days",
      nullable: true,
    },
    {
      columnName: "BALANCE_GROWTH_90D_PCT",
      dataType: "DECIMAL(10,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "(CURRENT_BALANCE - BALANCE_90D_AGO) / BALANCE_90D_AGO * 100",
      businessMeaning: "Percentage balance growth over last 90 days",
      nullable: true,
    },

    // TRANSACTION BEHAVIOR
    {
      columnName: "TOTAL_TRANSACTIONS_30D",
      dataType: "NUMBER(10,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(*)",
      businessMeaning: "Total transaction count in last 30 days",
      nullable: true,
    },
    {
      columnName: "TOTAL_TRANSACTION_AMOUNT_30D",
      dataType: "DECIMAL(18,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(TRANSACTION_AMOUNT)",
      businessMeaning: "Total transaction volume in last 30 days",
      nullable: true,
    },
    {
      columnName: "AVERAGE_TRANSACTION_AMOUNT_30D",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "AVG(TRANSACTION_AMOUNT)",
      businessMeaning: "Average transaction size",
      nullable: true,
    },
    {
      columnName: "PRIMARY_TRANSACTION_CHANNEL",
      dataType: "VARCHAR(50)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MODE(TRANSACTION_CHANNEL)",
      businessMeaning: "Most frequently used transaction channel",
      nullable: true,
    },
    {
      columnName: "DIGITAL_TRANSACTION_PCT",
      dataType: "DECIMAL(5,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(CHANNEL IN ('ONLINE','MOBILE')) / COUNT(*) * 100",
      businessMeaning: "Percentage of transactions via digital channels",
      nullable: true,
    },

    // DEPOSIT PATTERNS
    {
      columnName: "DAYS_SINCE_LAST_DEPOSIT",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATEDIFF(day, MAX(TRANSACTION_DATE), CURRENT_DATE)",
      businessMeaning: "Days since last deposit transaction",
      nullable: true,
    },
    {
      columnName: "AVERAGE_DEPOSITS_PER_MONTH_6M",
      dataType: "DECIMAL(5,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DEPOSITS) / 6",
      businessMeaning: "Average deposits per month over 6 months",
      nullable: true,
    },
    {
      columnName: "MEDIAN_DEPOSIT_AMOUNT",
      dataType: "DECIMAL(15,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "PERCENTILE_CONT(0.5)",
      businessMeaning: "Median deposit amount",
      nullable: true,
    },
    {
      columnName: "PAYROLL_DEPOSIT_FLAG",
      dataType: "BOOLEAN",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(TRANSACTION_CODE='PAYROLL') > 0",
      businessMeaning: "Has direct deposit payroll",
      nullable: true,
    },

    // CD METRICS
    {
      columnName: "NEXT_CD_MATURITY_DATE",
      dataType: "DATE",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "MIN(MATURITY_DATE)",
      businessMeaning: "Next upcoming CD maturity date",
      nullable: true,
    },
    {
      columnName: "CD_RETENTION_SEGMENT",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN CD_BALANCE > 100000 THEN 'HIGH' ELSE 'LOW' END",
      businessMeaning: "CD retention priority segment",
      nullable: true,
    },

    // RISK & HEALTH INDICATORS
    {
      columnName: "OVERDRAFT_COUNT_90D",
      dataType: "NUMBER(5,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(BALANCE < 0) OVER 90 DAYS",
      businessMeaning: "Overdraft occurrences in last 90 days",
      nullable: true,
    },
    {
      columnName: "TOTAL_FEES_90D",
      dataType: "DECIMAL(12,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "SUM(FEE_AMOUNT) OVER 90 DAYS",
      businessMeaning: "Total fees paid in last 90 days",
      nullable: true,
    },
    {
      columnName: "FRAUD_INCIDENTS_12M",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(FRAUD_FLAG=TRUE) OVER 12 MONTHS",
      businessMeaning: "Fraud incidents in last 12 months",
      nullable: true,
    },
    {
      columnName: "CHURN_RISK_SCORE",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CALCULATED SCORE 0-100",
      businessMeaning: "Customer churn risk score (0-100, higher = more risk)",
      nullable: true,
    },
    {
      columnName: "HIGH_VALUE_CUSTOMER_FLAG",
      dataType: "BOOLEAN",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "TOTAL_BALANCE > 500000",
      businessMeaning: "Flag for high-value customer ($500K+)",
      nullable: true,
    },

    // RELATIONSHIP METRICS
    {
      columnName: "CUSTOMER_TENURE_YEARS",
      dataType: "DECIMAL(5,2)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "DATEDIFF(year, CUSTOMER_SINCE_DATE, CURRENT_DATE)",
      businessMeaning: "Years as a customer",
      nullable: true,
    },
    {
      columnName: "PRODUCT_PENETRATION_SCORE",
      dataType: "NUMBER(3,0)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "COUNT(DISTINCT PRODUCT_TYPES) * 10",
      businessMeaning: "Product penetration score (0-100)",
      nullable: true,
    },
    {
      columnName: "MULTI_PRODUCT_HOLDER_FLAG",
      dataType: "BOOLEAN",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "TOTAL_ACCOUNTS > 1",
      businessMeaning: "Has multiple products",
      nullable: true,
    },
    {
      columnName: "RELATIONSHIP_TIER",
      dataType: "VARCHAR(20)",
      sourceSchema: "ANALYTICS",
      sourceTable: "CALCULATED",
      sourceColumn: "CASE WHEN TOTAL_BALANCE > 1000000 THEN 'PLATINUM' ELSE 'BRONZE' END",
      businessMeaning: "Customer relationship tier",
      nullable: true,
    },
  ],
};

// Re-export dimensions and facts for compatibility with metadata
export const customerGoldDimensions = [];

export const customerGoldFacts = [];

export const customerGoldLayerComplete = {
  dimensions: customerGoldDimensions,
  facts: customerGoldFacts,
  tables: [aggCustomer360ViewTable],
  totalTables: 1,
  totalDimensions: customerGoldDimensions.length,
  totalFacts: customerGoldFacts.length,
  description: "Customer domain gold layer - Aggregated analytics table with comprehensive customer and deposit metrics",
};

// ============================================================================
// GOLD TABLE CATALOG
// ============================================================================
export const customerGoldTableCatalog = {
  facts: [],
  dimensions: [],
  aggregates: [aggCustomer360ViewTable],
  totalTables: 1,
  description: "Gold Layer DDL specifications for Customer domain - Cross-domain 360° customer view aggregate",
};

export default customerGoldTableCatalog;
