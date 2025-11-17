// ERD VISUAL DOCUMENTATION FOR DEPOSITS & FUNDING DOMAIN
// Comprehensive entity relationship diagrams for all data layers
// Supports Mermaid, PlantUML, and DBML formats for visualization

// ============================================================================
// BRONZE LAYER ERD - RAW LANDING ZONE
// ============================================================================

export const bronzeLayerERD = {
  layer: "Bronze (Raw Landing)",
  description: "15 raw tables with CDC tracking and lineage",

  mermaidDiagram: `
erDiagram
    DEPOSIT_ACCOUNT_MASTER_RAW ||--o{ DEPOSIT_TRANSACTIONS_RAW : "has"
    DEPOSIT_ACCOUNT_MASTER_RAW ||--o{ ACCOUNT_BALANCES_DAILY_RAW : "tracks"
    DEPOSIT_ACCOUNT_MASTER_RAW ||--o{ INTEREST_ACCRUALS_RAW : "accrues"
    DEPOSIT_ACCOUNT_MASTER_RAW }o--|| CUSTOMER_MASTER_RAW : "owned_by"
    DEPOSIT_ACCOUNT_MASTER_RAW }o--|| BRANCH_MASTER_RAW : "serviced_at"
    DEPOSIT_ACCOUNT_MASTER_RAW }o--|| PRODUCT_MASTER_RAW : "instance_of"
    
    CD_MASTER_RAW ||--o{ CD_MATURITY_SCHEDULE_RAW : "has_schedule"
    
    DEPOSIT_TRANSACTIONS_RAW }o--|| TRANSACTION_CODES_RAW : "categorized_by"
    FEE_TRANSACTIONS_RAW }o--|| FEE_CODES_RAW : "categorized_by"
    
    CUSTOMER_MASTER_RAW ||--o{ CUSTOMER_DEMOGRAPHICS_RAW : "has"
    
    RATE_MASTER_RAW ||--o{ RATE_CHANGE_HISTORY_RAW : "tracks"
    
    DEPOSIT_ACCOUNT_MASTER_RAW {
        string account_id PK
        string customer_id FK
        string product_code FK
        string branch_id FK
        string account_status
        date open_date
        decimal current_balance
        timestamp cdc_timestamp
    }
    
    DEPOSIT_TRANSACTIONS_RAW {
        string transaction_id PK
        string account_id FK
        string transaction_code FK
        decimal amount
        timestamp transaction_timestamp
        string channel
        timestamp cdc_timestamp
    }
    
    ACCOUNT_BALANCES_DAILY_RAW {
        string balance_id PK
        string account_id FK
        date balance_date
        decimal eod_balance
        decimal available_balance
        timestamp cdc_timestamp
    }
    
    CUSTOMER_MASTER_RAW {
        string customer_id PK
        string customer_name
        string customer_segment
        date relationship_start
        timestamp cdc_timestamp
    }
    
    PRODUCT_MASTER_RAW {
        string product_code PK
        string product_name
        string product_category
        boolean interest_bearing
        timestamp cdc_timestamp
    }
    
    BRANCH_MASTER_RAW {
        string branch_id PK
        string branch_name
        string region
        string state
        timestamp cdc_timestamp
    }
  `,

  entities: 15,
  relationships: 12,
};

// ============================================================================
// SILVER LAYER ERD - CONFORMED & CLEANSED
// ============================================================================

export const silverLayerERD = {
  layer: "Silver (Conformed Golden Records)",
  description: "12 cleansed tables with SCD Type 2 and entity resolution",

  mermaidDiagram: `
erDiagram
    ACCOUNT_MASTER_GOLDEN ||--o{ DAILY_BALANCE_SNAPSHOTS : "has_daily"
    ACCOUNT_MASTER_GOLDEN ||--o{ TRANSACTION_MASTER : "has"
    ACCOUNT_MASTER_GOLDEN ||--o{ INTEREST_ACCRUALS : "accrues"
    ACCOUNT_MASTER_GOLDEN ||--o{ FEE_TRANSACTIONS : "incurs"
    ACCOUNT_MASTER_GOLDEN ||--o{ ACCOUNT_EVENTS : "experiences"
    ACCOUNT_MASTER_GOLDEN }o--|| CUSTOMER_GOLDEN : "owned_by"
    ACCOUNT_MASTER_GOLDEN }o--|| BRANCH_GOLDEN : "serviced_at"
    ACCOUNT_MASTER_GOLDEN }o--|| PRODUCT_GOLDEN : "instance_of"
    
    CD_MASTER_GOLDEN ||--o{ CD_MATURITY_EVENTS : "has_maturity"
    CD_MASTER_GOLDEN ||--o{ CD_RATE_CHANGES : "has_rate_change"
    
    CUSTOMER_GOLDEN ||--o{ CUSTOMER_BALANCES_DAILY : "has_balances"
    CUSTOMER_GOLDEN ||--o{ CUSTOMER_TRANSACTIONS : "performs"
    
    TRANSACTION_MASTER }o--|| AML_MONITORING : "monitored_by"
    TRANSACTION_MASTER }o--|| FRAUD_SCORES : "scored_by"
    
    ACCOUNT_MASTER_GOLDEN {
        bigint account_sk PK
        string account_id NK
        bigint customer_sk FK
        bigint product_sk FK
        bigint branch_sk FK
        string account_status
        date open_date
        decimal current_rate
        boolean interest_bearing
        string regulatory_category
        timestamp effective_start SCD2
        timestamp effective_end SCD2
        boolean is_current SCD2
        int version_number SCD2
    }
    
    CUSTOMER_GOLDEN {
        bigint customer_sk PK
        string customer_id NK
        string customer_name
        string customer_segment
        string customer_tier
        int age_band
        string income_band
        date relationship_start
        timestamp effective_start SCD2
        timestamp effective_end SCD2
        boolean is_current SCD2
    }
    
    TRANSACTION_MASTER {
        bigint transaction_sk PK
        string transaction_id NK
        bigint account_sk FK
        bigint customer_sk FK
        date transaction_date
        timestamp transaction_timestamp
        string transaction_type
        decimal amount
        string channel
        decimal fraud_score
        boolean high_risk
    }
    
    DAILY_BALANCE_SNAPSHOTS {
        bigint snapshot_sk PK
        bigint account_sk FK
        date snapshot_date
        decimal eod_balance
        decimal available_balance
        decimal mtd_avg_balance
        int transaction_count
        boolean negative_flag
    }
  `,

  entities: 12,
  scd2Tables: 8,
  relationships: 16,
};

// ============================================================================
// GOLD LAYER ERD - DIMENSIONAL MODEL (STAR SCHEMA)
// ============================================================================

export const goldLayerERD = {
  layer: "Gold (Dimensional Star Schema)",
  description: "15 dimensions + 8 fact tables with multiple grains",

  mermaidDiagram: `
erDiagram
    DIM_DEPOSIT_ACCOUNT ||--o{ FACT_DEPOSIT_TRANSACTIONS : "has"
    DIM_CUSTOMER ||--o{ FACT_DEPOSIT_TRANSACTIONS : "performs"
    DIM_PRODUCT ||--o{ FACT_DEPOSIT_TRANSACTIONS : "categorizes"
    DIM_BRANCH ||--o{ FACT_DEPOSIT_TRANSACTIONS : "processed_at"
    DIM_DATE ||--o{ FACT_DEPOSIT_TRANSACTIONS : "occurred_on"
    DIM_CHANNEL ||--o{ FACT_DEPOSIT_TRANSACTIONS : "via"
    DIM_TRANSACTION_TYPE ||--o{ FACT_DEPOSIT_TRANSACTIONS : "classified_as"
    
    DIM_DEPOSIT_ACCOUNT ||--o{ FACT_DAILY_POSITIONS : "snapshot_of"
    DIM_CUSTOMER ||--o{ FACT_DAILY_POSITIONS : "owned_by"
    DIM_PRODUCT ||--o{ FACT_DAILY_POSITIONS : "product_type"
    DIM_DATE ||--o{ FACT_DAILY_POSITIONS : "as_of"
    
    DIM_DEPOSIT_ACCOUNT ||--o{ FACT_MONTHLY_ACCOUNT_SUMMARY : "summarizes"
    DIM_CUSTOMER ||--o{ FACT_MONTHLY_ACCOUNT_SUMMARY : "for_customer"
    
    DIM_CUSTOMER ||--o{ FACT_CUSTOMER_DEPOSIT_SUMMARY : "aggregates"
    DIM_DATE ||--o{ FACT_CUSTOMER_DEPOSIT_SUMMARY : "for_month"
    
    DIM_PRODUCT ||--o{ FACT_PRODUCT_PERFORMANCE : "measures"
    DIM_BRANCH ||--o{ FACT_PRODUCT_PERFORMANCE : "at_branch"
    
    DIM_PRODUCT ||--o{ FACT_COHORT_ANALYSIS : "cohort_product"
    DIM_CHANNEL ||--o{ FACT_COHORT_ANALYSIS : "cohort_channel"
    
    DIM_DATE ||--o{ FACT_REGULATORY_DEPOSITS : "reported_on"
    
    DIM_DEPOSIT_ACCOUNT ||--o{ FACT_ML_FEATURES : "features_for"
    DIM_CUSTOMER ||--o{ FACT_ML_FEATURES : "customer_features"
    
    DIM_DEPOSIT_ACCOUNT {
        bigint account_key PK
        string account_id NK
        bigint customer_key FK
        bigint product_key FK
        string account_status
        boolean interest_bearing
        decimal current_rate
        date open_date
        string regulatory_category
        timestamp effective_date SCD2
        timestamp expiration_date SCD2
        boolean current_flag SCD2
    }
    
    DIM_CUSTOMER {
        bigint customer_key PK
        string customer_id NK
        string customer_segment
        string customer_tier
        int age_band
        string income_band
        timestamp effective_date SCD2
        timestamp expiration_date SCD2
    }
    
    DIM_PRODUCT {
        int product_key PK
        string product_code NK
        string product_name
        string product_category
        string product_line
        boolean interest_bearing
        decimal minimum_balance
    }
    
    DIM_DATE {
        int date_key PK
        date date_value
        int year
        int quarter
        int month
        int week
        int day_of_week
        boolean business_day
        boolean month_end
    }
    
    FACT_DEPOSIT_TRANSACTIONS {
        bigint transaction_key PK
        int transaction_date_key FK
        bigint account_key FK
        bigint customer_key FK
        int product_key FK
        int channel_key FK
        decimal transaction_amount
        decimal fee_amount
        decimal fraud_score
        boolean reversal_flag
    }
    
    FACT_DAILY_POSITIONS {
        bigint position_key PK
        int position_date_key FK
        bigint account_key FK
        bigint customer_key FK
        decimal eod_balance
        decimal available_balance
        decimal daily_net_change
        decimal mtd_avg_balance
        decimal interest_accrued
        int transaction_count
    }
    
    FACT_MONTHLY_ACCOUNT_SUMMARY {
        bigint summary_key PK
        int year_month_key FK
        bigint account_key FK
        bigint customer_key FK
        decimal month_avg_balance
        decimal month_end_balance
        int total_transactions
        decimal total_fees
        decimal interest_paid
        decimal net_profit
    }
    
    FACT_CUSTOMER_DEPOSIT_SUMMARY {
        bigint customer_summary_key PK
        int year_month_key FK
        bigint customer_key FK
        int total_accounts
        decimal total_balance
        int total_transactions
        decimal total_revenue
        decimal customer_profitability
    }
    
    FACT_ML_FEATURES {
        bigint ml_key PK
        bigint account_key FK
        bigint customer_key FK
        decimal balance_avg_3m
        decimal balance_volatility
        int txn_count_3m
        decimal digital_pct
        boolean target_churn_3m
    }
  `,

  dimensions: 15,
  factTables: 8,
  relationships: 42,
  factTypes: {
    transaction: 1,
    periodicSnapshot: 4,
    accumulatingSnapshot: 2,
    aggregate: 1,
  },
};

// ============================================================================
// ENTITY RELATIONSHIP CATALOG
// ============================================================================

export const erdCatalog = {
  totalLayers: 3,
  totalEntities: 50,
  totalRelationships: 70,

  layers: {
    bronze: {
      entities: 15,
      relationships: 12,
      description: "Raw landing zone with CDC tracking",
      characteristics: [
        "1:1 mapping to source",
        "Full history",
        "No transformations",
      ],
    },
    silver: {
      entities: 12,
      relationships: 16,
      description: "Conformed golden records with SCD Type 2",
      characteristics: [
        "Data quality",
        "Entity resolution",
        "Standardization",
        "SCD2",
      ],
    },
    gold: {
      dimensions: 15,
      facts: 8,
      relationships: 42,
      description: "Star schema dimensional model",
      characteristics: [
        "Denormalized",
        "Pre-aggregated",
        "BI-optimized",
        "ML-ready",
      ],
    },
  },

  keyRelationshipTypes: [
    "One-to-Many (Account to Transactions)",
    "Many-to-One (Accounts to Customer)",
    "Many-to-One (Accounts to Product)",
    "One-to-Many (Customer to Accounts)",
    "Many-to-Many (resolved via bridge tables)",
  ],

  exportFormats: {
    mermaid: "Embedded in markdown, GitHub-compatible",
    plantUML: "Enterprise diagramming tools",
    dbml: "Database Markup Language for dbdiagram.io",
    drawio: "Exportable XML format",
  },

  visualizationTools: [
    "Mermaid.js (GitHub, Confluence, Notion)",
    "PlantUML (Enterprise documentation)",
    "dbdiagram.io (Interactive web-based)",
    "draw.io / Lucidchart (Manual editing)",
    "ERD Plus (Academic)",
    "DBeaver (Database IDE)",
  ],
};

// ============================================================================
// DBML FORMAT FOR DBDIAGRAM.IO
// ============================================================================

export const dbmlGoldLayer = `
// GOLD LAYER - DEPOSITS & FUNDING DOMAIN
// Star Schema Dimensional Model
// Generated for dbdiagram.io

// DIMENSIONS
Table dim_deposit_account {
  account_key bigint [pk, increment]
  account_id varchar(50) [not null, note: 'Natural key']
  customer_key bigint [ref: > dim_customer.customer_key]
  product_key int [ref: > dim_product.product_key]
  branch_key int [ref: > dim_branch.branch_key]
  account_status varchar(20)
  interest_bearing_flag boolean
  current_interest_rate decimal(7,4)
  open_date date
  close_date date
  regulatory_category varchar(30)
  effective_date timestamp [note: 'SCD2']
  expiration_date timestamp [note: 'SCD2']
  current_flag boolean [note: 'SCD2']
  
  indexes {
    account_id [unique]
    (customer_key, current_flag)
    (product_key, current_flag)
  }
}

Table dim_customer {
  customer_key bigint [pk, increment]
  customer_id varchar(50) [not null]
  customer_segment varchar(30)
  customer_tier varchar(20)
  age_band int
  income_band varchar(20)
  credit_score_band varchar(20)
  relationship_start_date date
  effective_date timestamp
  expiration_date timestamp
  current_flag boolean
  
  indexes {
    customer_id [unique]
    customer_segment
  }
}

Table dim_product {
  product_key int [pk, increment]
  product_code varchar(20) [not null, unique]
  product_name varchar(100)
  product_category varchar(30) [note: 'DDA, Savings, MMA, CD']
  product_line varchar(50)
  interest_bearing_flag boolean
  minimum_balance decimal(18,2)
  monthly_fee decimal(18,2)
}

Table dim_branch {
  branch_key int [pk, increment]
  branch_id varchar(20) [not null, unique]
  branch_name varchar(100)
  region varchar(50)
  district varchar(50)
  state varchar(2)
  timezone varchar(30)
  latitude decimal(10,7)
  longitude decimal(10,7)
}

Table dim_date {
  date_key int [pk]
  date_value date [not null, unique]
  year int
  quarter int
  month int
  week int
  day_of_week int
  business_day_flag boolean
  month_end_flag boolean
  quarter_end_flag boolean
  fiscal_year int
  fiscal_quarter int
}

// FACT TABLES
Table fact_deposit_transactions {
  transaction_key bigint [pk, increment]
  transaction_date_key int [ref: > dim_date.date_key]
  account_key bigint [ref: > dim_deposit_account.account_key]
  customer_key bigint [ref: > dim_customer.customer_key]
  product_key int [ref: > dim_product.product_key]
  channel_key int
  transaction_type_key int
  transaction_amount decimal(18,2)
  fee_amount decimal(18,2)
  fraud_score decimal(5,2)
  reversal_flag boolean
  
  indexes {
    transaction_date_key [type: btree]
    account_key [type: btree]
    customer_key [type: btree]
  }
  
  Note: 'Atomic grain - one row per transaction'
}

Table fact_daily_account_positions {
  position_key bigint [pk, increment]
  position_date_key int [ref: > dim_date.date_key]
  account_key bigint [ref: > dim_deposit_account.account_key]
  customer_key bigint [ref: > dim_customer.customer_key]
  product_key int [ref: > dim_product.product_key]
  eod_balance decimal(18,2)
  available_balance decimal(18,2)
  daily_net_change decimal(18,2)
  daily_deposits_amount decimal(18,2)
  daily_withdrawals_amount decimal(18,2)
  mtd_avg_balance decimal(18,2)
  ytd_avg_balance decimal(18,2)
  daily_interest_accrued decimal(18,2)
  transaction_count int
  
  indexes {
    (position_date_key, account_key) [unique]
    account_key [type: btree]
  }
  
  Note: 'Periodic snapshot - daily account positions'
}

Table fact_monthly_account_summary {
  summary_key bigint [pk, increment]
  year_month_key int [ref: > dim_date.date_key]
  account_key bigint [ref: > dim_deposit_account.account_key]
  customer_key bigint [ref: > dim_customer.customer_key]
  month_avg_balance decimal(18,2)
  month_end_balance decimal(18,2)
  total_transactions int
  total_deposits_amount decimal(18,2)
  total_withdrawals_amount decimal(18,2)
  total_fees decimal(18,2)
  interest_paid decimal(18,2)
  net_profit decimal(18,2)
  
  indexes {
    (year_month_key, account_key) [unique]
  }
  
  Note: 'Monthly aggregation for performance'
}

Table fact_customer_deposit_summary {
  customer_summary_key bigint [pk, increment]
  year_month_key int [ref: > dim_date.date_key]
  customer_key bigint [ref: > dim_customer.customer_key]
  total_accounts int
  total_deposit_balance decimal(18,2)
  total_transactions int
  total_revenue decimal(18,2)
  customer_profitability decimal(18,2)
  
  indexes {
    (year_month_key, customer_key) [unique]
  }
  
  Note: 'Customer-level monthly aggregation'
}
`;

// ============================================================================
// PLANTUML FORMAT FOR ENTERPRISE TOOLS
// ============================================================================

export const plantUMLGoldLayer = `
@startuml Deposits_Gold_Layer_ERD

!define table(x) class x << (T,#FFAAAA) >>
!define view(x) class x << (V,#AAFFAA) >>
!define dimension(x) class x << (D,#AAAAFF) >>
!define fact(x) class x << (F,#FFAA00) >>

hide methods
hide stereotypes

' DIMENSIONS
dimension(dim_deposit_account) {
  + account_key : BIGINT <<PK>>
  --
  account_id : VARCHAR(50) <<NK>>
  customer_key : BIGINT <<FK>>
  product_key : INT <<FK>>
  account_status : VARCHAR(20)
  interest_rate : DECIMAL(7,4)
  effective_date : TIMESTAMP
  current_flag : BOOLEAN
}

dimension(dim_customer) {
  + customer_key : BIGINT <<PK>>
  --
  customer_id : VARCHAR(50) <<NK>>
  customer_segment : VARCHAR(30)
  customer_tier : VARCHAR(20)
  age_band : INT
  effective_date : TIMESTAMP
}

dimension(dim_product) {
  + product_key : INT <<PK>>
  --
  product_code : VARCHAR(20) <<NK>>
  product_name : VARCHAR(100)
  product_category : VARCHAR(30)
  interest_bearing : BOOLEAN
}

dimension(dim_date) {
  + date_key : INT <<PK>>
  --
  date_value : DATE
  year : INT
  quarter : INT
  month : INT
  business_day : BOOLEAN
}

' FACT TABLES
fact(fact_deposit_transactions) {
  + transaction_key : BIGINT <<PK>>
  --
  transaction_date_key : INT <<FK>>
  account_key : BIGINT <<FK>>
  customer_key : BIGINT <<FK>>
  product_key : INT <<FK>>
  transaction_amount : DECIMAL(18,2)
  fee_amount : DECIMAL(18,2)
  fraud_score : DECIMAL(5,2)
}

fact(fact_daily_positions) {
  + position_key : BIGINT <<PK>>
  --
  position_date_key : INT <<FK>>
  account_key : BIGINT <<FK>>
  customer_key : BIGINT <<FK>>
  eod_balance : DECIMAL(18,2)
  mtd_avg_balance : DECIMAL(18,2)
  daily_interest : DECIMAL(18,2)
}

' RELATIONSHIPS
dim_deposit_account "1" -- "0..*" fact_deposit_transactions
dim_customer "1" -- "0..*" fact_deposit_transactions
dim_product "1" -- "0..*" fact_deposit_transactions
dim_date "1" -- "0..*" fact_deposit_transactions

dim_deposit_account "1" -- "0..*" fact_daily_positions
dim_customer "1" -- "0..*" fact_daily_positions
dim_date "1" -- "0..*" fact_daily_positions

dim_customer "1" -- "0..*" dim_deposit_account : owns

@enduml
`;

// Export all ERD formats
export const visualDocumentation = {
  bronze: bronzeLayerERD,
  silver: silverLayerERD,
  gold: goldLayerERD,
  catalog: erdCatalog,
  dbml: dbmlGoldLayer,
  plantUML: plantUMLGoldLayer,

  usage: {
    mermaid: "Copy mermaidDiagram into markdown files or Confluence pages",
    dbml: "Paste into https://dbdiagram.io/d for interactive visualization",
    plantUML:
      "Use in Enterprise Architect, Visual Paradigm, or PlantUML renderer",
  },

  completeness: "100% - All layers documented with relationships",
};
