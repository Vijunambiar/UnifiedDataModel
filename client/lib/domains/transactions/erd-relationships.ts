/**
 * TRANSACTIONS DOMAIN - ENTITY RELATIONSHIP DIAGRAM (ERD)
 * 
 * Defines relationships between all transactions domain tables across Bronze, Silver, and Gold layers
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
// TRANSACTIONS DOMAIN ENTITIES
// ============================================================================
export const transactionsEntities: TableEntity[] = [
  // BRONZE LAYER
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_OZO_MNY_TXN_ARD",
    layer: "Bronze",
    description: "Money transaction details curated view",
    businessKey: "TRN_TRANS_TME_SEQ",
    recordType: "Fact",
    estimatedRows: 2000000000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_OZU_MAINT_ARD",
    layer: "Bronze",
    description: "Maintenance transaction log",
    businessKey: "LG_TRANS_TME_SEQ",
    recordType: "Fact",
    estimatedRows: 500000000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_OZQ_STP_ARD",
    layer: "Bronze",
    description: "Stop payment transactions",
    businessKey: "STP_ID",
    recordType: "Fact",
    estimatedRows: 100000000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_DP_OZV_HLD_ARD",
    layer: "Bronze",
    description: "Hold transactions",
    businessKey: "HD_ID",
    recordType: "Fact",
    estimatedRows: 150000000,
  },

  // SILVER LAYER
  {
    schema: "CORE_DEPOSIT",
    tableName: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    layer: "Silver",
    description: "Deposit certificate transactions fact table",
    businessKey: "TRANSACTION_ID",
    recordType: "Fact",
    estimatedRows: 2000000000,
  },
  {
    schema: "CORE_DEPOSIT",
    tableName: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
    layer: "Silver",
    description: "Maintenance transaction details",
    businessKey: "TRANSACTION_ID",
    recordType: "Fact",
    estimatedRows: 500000000,
  },
  {
    schema: "CORE_DEPOSIT",
    tableName: "FCT_DEPOSIT_STOP_TRANSACTION",
    layer: "Silver",
    description: "Stop payment fact table",
    businessKey: "TRANSACTION_ID",
    recordType: "Fact",
    estimatedRows: 100000000,
  },
  {
    schema: "CORE_DEPOSIT",
    tableName: "FCT_DEPOSIT_HOLD_TRANSACTION",
    layer: "Silver",
    description: "Hold transaction fact table",
    businessKey: "TRANSACTION_ID",
    recordType: "Fact",
    estimatedRows: 150000000,
  },

  // GOLD LAYER
  {
    schema: "ANALYTICS",
    tableName: "CUSTOMER_DEPOSIT_AGGR",
    layer: "Gold",
    description: "Customer and transaction aggregation",
    businessKey: "CUSTOMER_NUMBER",
    recordType: "Aggregate",
    estimatedRows: 5500000,
  },
];

// ============================================================================
// TRANSACTIONS DOMAIN RELATIONSHIPS
// ============================================================================
export const transactionsRelationships: TableRelationship[] = [
  // BRONZE TO SILVER
  {
    relationshipId: "BR001",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_OZO_MNY_TXN_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.TRN_TRANS_TME_SEQ = target.TRANSACTION_ID",
    fromTableKey: "TRN_TRANS_TME_SEQ",
    toTableKey: "TRANSACTION_ID",
    cardinality: "1:1",
    description: "Money transaction mapping to silver layer",
    businessContext: "Each source transaction maps to one silver fact record",
  },
  {
    relationshipId: "BR002",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_OZU_MAINT_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.LG_TRANS_TME_SEQ = target.TRANSACTION_ID",
    fromTableKey: "LG_TRANS_TME_SEQ",
    toTableKey: "TRANSACTION_ID",
    cardinality: "1:1",
    description: "Maintenance transaction mapping to silver layer",
    businessContext: "Each source maintenance record maps to one silver fact record",
  },
  {
    relationshipId: "BR003",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_OZQ_STP_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_STOP_TRANSACTION",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.STP_ID = target.TRANSACTION_ID",
    fromTableKey: "STP_ID",
    toTableKey: "TRANSACTION_ID",
    cardinality: "1:1",
    description: "Stop payment mapping to silver layer",
    businessContext: "Each source stop payment maps to one silver fact record",
  },
  {
    relationshipId: "BR004",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_DP_OZV_HLD_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_HOLD_TRANSACTION",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition: "source.HD_ID = target.TRANSACTION_ID",
    fromTableKey: "HD_ID",
    toTableKey: "TRANSACTION_ID",
    cardinality: "1:1",
    description: "Hold transaction mapping to silver layer",
    businessContext: "Each source hold maps to one silver fact record",
  },

  // SILVER TO GOLD
  {
    relationshipId: "SG001",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "CUSTOMER_DEPOSIT_AGGR",
      layer: "Gold",
    },
    relationshipType: "Many-to-One",
    joinCondition: "silver.CUSTOMER_NUMBER = gold.CUSTOMER_NUMBER",
    fromTableKey: "CUSTOMER_NUMBER",
    toTableKey: "CUSTOMER_NUMBER",
    cardinality: "N:1",
    description: "Transaction to customer aggregation",
    businessContext: "Multiple transactions aggregate to customer level",
  },
  {
    relationshipId: "SG002",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "CUSTOMER_DEPOSIT_AGGR",
      layer: "Gold",
    },
    relationshipType: "Many-to-One",
    joinCondition: "silver.CUSTOMER_NUMBER = gold.CUSTOMER_NUMBER",
    fromTableKey: "CUSTOMER_NUMBER",
    toTableKey: "CUSTOMER_NUMBER",
    cardinality: "N:1",
    description: "Maintenance transaction to customer aggregation",
    businessContext: "Multiple maintenance events aggregate to customer level",
  },
  {
    relationshipId: "SG003",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_STOP_TRANSACTION",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "CUSTOMER_DEPOSIT_AGGR",
      layer: "Gold",
    },
    relationshipType: "Many-to-One",
    joinCondition: "silver.CUSTOMER_NUMBER = gold.CUSTOMER_NUMBER",
    fromTableKey: "CUSTOMER_NUMBER",
    toTableKey: "CUSTOMER_NUMBER",
    cardinality: "N:1",
    description: "Stop payment to customer aggregation",
    businessContext: "Multiple stop payments aggregate to customer level",
  },
  {
    relationshipId: "SG004",
    fromTable: {
      schema: "CORE_DEPOSIT",
      tableName: "FCT_DEPOSIT_HOLD_TRANSACTION",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "CUSTOMER_DEPOSIT_AGGR",
      layer: "Gold",
    },
    relationshipType: "Many-to-One",
    joinCondition: "silver.CUSTOMER_NUMBER = gold.CUSTOMER_NUMBER",
    fromTableKey: "CUSTOMER_NUMBER",
    toTableKey: "CUSTOMER_NUMBER",
    cardinality: "N:1",
    description: "Hold transaction to customer aggregation",
    businessContext: "Multiple holds aggregate to customer level",
  },
];

export const transactionsERDComplete = {
  entities: transactionsEntities,
  relationships: transactionsRelationships,
  totalEntities: transactionsEntities.length,
  totalRelationships: transactionsRelationships.length,
  bronzeEntities: transactionsEntities.filter((e) => e.layer === "Bronze").length,
  silverEntities: transactionsEntities.filter((e) => e.layer === "Silver").length,
  goldEntities: transactionsEntities.filter((e) => e.layer === "Gold").length,
  description: "Transactions domain ERD with complete entity and relationship definitions",
};

export default transactionsERDComplete;
