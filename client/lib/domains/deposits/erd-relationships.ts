/**
 * DEPOSITS DOMAIN - ENTITY RELATIONSHIP DIAGRAM (ERD)
 * 
 * Defines relationships between all deposits domain tables across Bronze, Silver, and Gold layers
 * Shows cardinality, join keys, and relationship types
 */

export interface TableRelationship {
  relationshipId: string;
  fromTable: {
    schema: string;
    tableName: string;
    layer: "Bronze" | "Silver" | "Gold";
  };
  toTable: {
    schema: string;
    tableName: string;
    layer: "Bronze" | "Silver" | "Gold";
  };
  relationshipType: "One-to-One" | "One-to-Many" | "Many-to-One" | "Many-to-Many";
  joinCondition: string;
  fromTableKey: string;
  toTableKey: string;
  cardinality: string;
  description: string;
  businessContext: string;
}

export interface TableEntity {
  schema: string;
  tableName: string;
  layer: "Bronze" | "Silver" | "Gold";
  description: string;
  businessKey: string;
  recordType: "Dimension" | "Fact" | "Bridge" | "Aggregate";
  estimatedRows: number;
}

// ============================================================================
// DEPOSITS DOMAIN ENTITIES
// ============================================================================
export const depositsEntities: TableEntity[] = [
  // BRONZE LAYER
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_OZZ_ACCT_ARD",
    layer: "Bronze",
    description: "Deposit account master data curated view",
    businessKey: "AC_ACCT_NBR",
    recordType: "Dimension",
    estimatedRows: 18000000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_OZX_BAL_ARD",
    layer: "Bronze",
    description: "Account balance daily snapshot",
    businessKey: "BL_ACCT_NBR",
    recordType: "Fact",
    estimatedRows: 6570000000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_SZ9_DP_ACCT_D_FACT",
    layer: "Bronze",
    description: "Daily deposit account facts",
    businessKey: "ACCT_NBR",
    recordType: "Fact",
    estimatedRows: 6570000000,
  },

  // SILVER LAYER
  {
    schema: "CORE_DEPOSIT",
    tableName: "DIM_ACCOUNT",
    layer: "Silver",
    description: "Account dimension with SCD Type 2",
    businessKey: "ACCOUNT_NUMBER",
    recordType: "Dimension",
    estimatedRows: 18000000,
  },
  {
    schema: "CORE_DEPOSIT",
    tableName: "DIM_DEPOSIT",
    layer: "Silver",
    description: "Deposit product dimension",
    businessKey: "ACCOUNT_NUMBER",
    recordType: "Dimension",
    estimatedRows: 18000000,
  },
  {
    schema: "CORE_DEPOSIT",
    tableName: "FCT_DEPOSIT_DAILY_BALANCE",
    layer: "Silver",
    description: "Daily deposit balance fact table",
    businessKey: "ACCOUNT_NUMBER",
    recordType: "Fact",
    estimatedRows: 6570000000,
  },

  // GOLD LAYER
  {
    schema: "ANALYTICS",
    tableName: "CUSTOMER_DEPOSIT_AGGR",
    layer: "Gold",
    description: "Customer and deposit aggregation",
    businessKey: "CUSTOMER_NUMBER",
    recordType: "Aggregate",
    estimatedRows: 5500000,
  },
  {
    schema: "ANALYTICS",
    tableName: "FCT_DEPOSIT_DAILY_BALANCE",
    layer: "Gold",
    description: "Gold layer daily balance analytics",
    businessKey: "ACCOUNT_NUMBER",
    recordType: "Fact",
    estimatedRows: 6570000000,
  },
];

// ============================================================================
// DEPOSITS DOMAIN RELATIONSHIPS
// ============================================================================
export const depositsRelationships: TableRelationship[] = [
  // BRONZE TO SILVER
  {
    relationshipId: "BR001",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_OZZ_ACCT_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "DIM_ACCOUNT",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.AC_ACCT_NBR = target.ACCOUNT_NUMBER",
    fromTableKey: "AC_ACCT_NBR",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "1:1",
    description: "Account master to dimension mapping",
    businessContext: "Each source account maps to one silver dimension record",
  },
  {
    relationshipId: "BR002",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_OZX_BAL_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_DAILY_BALANCE",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.BL_ACCT_NBR = target.ACCOUNT_NUMBER AND source.BALANCE_DATE = target.BALANCE_DATE",
    fromTableKey: "BL_ACCT_NBR",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "1:1",
    description: "Daily balance mapping to silver layer",
    businessContext: "Each source balance record maps to one silver fact record",
  },
  {
    relationshipId: "BR003",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_SZ9_DP_ACCT_D_FACT",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_DAILY_BALANCE",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.ACCT_NBR = target.ACCOUNT_NUMBER AND source.BUSINESS_DATE = target.BALANCE_DATE",
    fromTableKey: "ACCT_NBR",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "1:1",
    description: "Daily facts mapping to silver layer",
    businessContext: "Daily fact records from source map to silver layer",
  },

  // SILVER TO SILVER
  {
    relationshipId: "SS001",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "DIM_ACCOUNT",
      layer: "Silver",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "DIM_DEPOSIT",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "account.ACCOUNT_NUMBER = deposit.ACCOUNT_NUMBER",
    fromTableKey: "ACCOUNT_NUMBER",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "1:1",
    description: "Account to deposit product relationship",
    businessContext: "Each account has one associated deposit product",
  },
  {
    relationshipId: "SS002",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "DIM_ACCOUNT",
      layer: "Silver",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_DAILY_BALANCE",
      layer: "Silver",
    },
    relationshipType: "One-to-Many",
    joinCondition: "account.ACCOUNT_NUMBER = fact.ACCOUNT_NUMBER",
    fromTableKey: "ACCOUNT_NUMBER",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "1:N",
    description: "Account to daily balance relationship",
    businessContext: "One account has many daily balance records",
  },

  // SILVER TO GOLD
  {
    relationshipId: "SG001",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "DIM_ACCOUNT",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "CUSTOMER_DEPOSIT_AGGR",
      layer: "Gold",
    },
    relationshipType: "Many-to-One",
    joinCondition: "silver.ACCOUNT_NUMBER = gold.ACCOUNT_NUMBER",
    fromTableKey: "ACCOUNT_NUMBER",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "N:1",
    description: "Account to customer aggregation",
    businessContext: "Multiple accounts aggregate to customer level",
  },
  {
    relationshipId: "SG002",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_DAILY_BALANCE",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "FCT_DEPOSIT_DAILY_BALANCE",
      layer: "Gold",
    },
    relationshipType: "One-to-One",
    joinCondition: "silver.ACCOUNT_NUMBER = gold.ACCOUNT_NUMBER AND silver.BALANCE_DATE = gold.BALANCE_DATE",
    fromTableKey: "ACCOUNT_NUMBER",
    toTableKey: "ACCOUNT_NUMBER",
    cardinality: "1:1",
    description: "Silver to gold balance mapping",
    businessContext: "Direct mapping from silver to gold daily balances",
  },
];

export const depositsERDComplete = {
  entities: depositsEntities,
  relationships: depositsRelationships,
  totalEntities: depositsEntities.length,
  totalRelationships: depositsRelationships.length,
  bronzeEntities: depositsEntities.filter((e) => e.layer === "Bronze").length,
  silverEntities: depositsEntities.filter((e) => e.layer === "Silver").length,
  goldEntities: depositsEntities.filter((e) => e.layer === "Gold").length,
  description: "Deposits domain ERD with complete entity and relationship definitions",
};

export default depositsERDComplete;
