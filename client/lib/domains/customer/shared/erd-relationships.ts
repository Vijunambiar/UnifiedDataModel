/**
 * CUSTOMER DOMAIN - ENTITY RELATIONSHIP DIAGRAM (ERD)
 *
 * Defines relationships between all customer domain tables across Bronze, Silver, and Gold layers
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
  relationshipType:
    | "One-to-One"
    | "One-to-Many"
    | "Many-to-One"
    | "Many-to-Many";
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
// CUSTOMER DOMAIN ENTITIES
// ============================================================================
export const customerEntities: TableEntity[] = [
  // BRONZE LAYER
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_CI_OZ6_CUST_ARD",
    layer: "Bronze",
    description: "Customer demographics and attributes curated view",
    businessKey: "CID_CUST_CUST_NBR",
    recordType: "Dimension",
    estimatedRows: 5500000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_CI_OZ4_CUST_ID_ARD",
    layer: "Bronze",
    description: "Customer identification and KYC details",
    businessKey: "CI_DMV21_ID_NUMBER",
    recordType: "Dimension",
    estimatedRows: 5500000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_CI_OZ5_CUST_NAAD_ARD",
    layer: "Bronze",
    description: "Customer name and address information",
    businessKey: "CID_NAAD_APPL_ID",
    recordType: "Dimension",
    estimatedRows: 5500000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_CI_OZ3_EMAIL_ARD",
    layer: "Bronze",
    description: "Customer email contact information",
    businessKey: "CID_EMLREL_CUST_NMB",
    recordType: "Dimension",
    estimatedRows: 8000000,
  },
  {
    schema: "SNOWFLAKE_CURATED",
    tableName: "VW_TB_CI_OZW_CUST_ACCT_RLT_ARD",
    layer: "Bronze",
    description: "Customer to account relationships",
    businessKey: "CID_RELA_R_APPL_ID",
    recordType: "Bridge",
    estimatedRows: 12000000,
  },

  // SILVER LAYER
  {
    schema: "silver",
    tableName: "silver.customer_master_golden",
    layer: "Silver",
    description:
      "Golden customer record with MDM deduplication, standardization, and SCD Type 2 history",
    businessKey: "customer_id",
    recordType: "Dimension",
    estimatedRows: 5500000,
  },
  {
    schema: "silver",
    tableName: "silver.customer_relationships",
    layer: "Silver",
    description:
      "Customer-to-Customer and Customer-to-Account relationships with SCD Type 2",
    businessKey: "customer_id",
    recordType: "Bridge",
    estimatedRows: 12000000,
  },
  {
    schema: "silver",
    tableName: "silver.customer_contact_history",
    layer: "Silver",
    description:
      "Longitudinal history of all customer contact information changes",
    businessKey: "customer_id",
    recordType: "Dimension",
    estimatedRows: 8000000,
  },

  // GOLD LAYER
  {
    schema: "ANALYTICS",
    tableName: "CUSTOMER_DEPOSIT_AGGR",
    layer: "Gold",
    description: "Comprehensive customer and deposit aggregation",
    businessKey: "CUSTOMER_NUMBER",
    recordType: "Aggregate",
    estimatedRows: 5500000,
  },
];

// ============================================================================
// CUSTOMER DOMAIN RELATIONSHIPS
// ============================================================================
export const customerRelationships: TableRelationship[] = [
  // BRONZE TO SILVER RELATIONSHIPS
  {
    relationshipId: "BR001",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_CI_OZ6_CUST_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_master_golden",
      layer: "Silver",
    },
    relationshipType: "Many-to-One",
    joinCondition: "source.CID_CUST_CUST_NBR = target.customer_id",
    fromTableKey: "CID_CUST_CUST_NBR",
    toTableKey: "customer_id",
    cardinality: "N:1",
    description: "Customer demographics mapping from source to golden record",
    businessContext:
      "Multiple source records deduplicated into one golden customer record",
  },
  {
    relationshipId: "BR002",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_CI_OZ4_CUST_ID_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_master_golden",
      layer: "Silver",
    },
    relationshipType: "Many-to-One",
    joinCondition: "source.CI_DMV21_ID_NUMBER = target.customer_id",
    fromTableKey: "CI_DMV21_ID_NUMBER",
    toTableKey: "customer_id",
    cardinality: "N:1",
    description: "Customer identification mapping to golden record",
    businessContext: "Customer ID records merged into golden customer master",
  },
  {
    relationshipId: "BR003",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_CI_OZ5_CUST_NAAD_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_master_golden",
      layer: "Silver",
    },
    relationshipType: "Many-to-One",
    joinCondition: "source.CID_NAAD_APPL_ID = target.customer_id",
    fromTableKey: "CID_NAAD_APPL_ID",
    toTableKey: "customer_id",
    cardinality: "N:1",
    description: "Customer name and address mapping to golden record",
    businessContext:
      "Name and address records deduplicated and standardized in golden record",
  },
  {
    relationshipId: "BR004",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_CI_OZ3_EMAIL_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_contact_history",
      layer: "Silver",
    },
    relationshipType: "One-to-Many",
    joinCondition: "source.CID_EMLREL_CUST_NMB = target.customer_id",
    fromTableKey: "CID_EMLREL_CUST_NMB",
    toTableKey: "customer_id",
    cardinality: "1:N",
    description: "Customer email addresses to contact history",
    businessContext: "Email changes tracked in contact history table",
  },
  {
    relationshipId: "BR005",
    fromTable: {
      schema: "SNOWFLAKE_CURATED",
      tableName: "VW_TB_CI_OZW_CUST_ACCT_RLT_ARD",
      layer: "Bronze",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_relationships",
      layer: "Silver",
    },
    relationshipType: "One-to-One",
    joinCondition:
      "source.CID_RELA_R_APPL_ID = target.customer_id AND source.CID_RELA_APPL_ID = target.account_id",
    fromTableKey: "CID_RELA_R_APPL_ID",
    toTableKey: "customer_id",
    cardinality: "1:1",
    description: "Customer to account relationship mapping",
    businessContext:
      "Maps customer to account relationships with role information",
  },

  // SILVER TO SILVER RELATIONSHIPS
  {
    relationshipId: "SS001",
    fromTable: {
      schema: "silver",
      tableName: "silver.customer_master_golden",
      layer: "Silver",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_relationships",
      layer: "Silver",
    },
    relationshipType: "One-to-Many",
    joinCondition: "master.customer_id = relationships.customer_id",
    fromTableKey: "customer_id",
    toTableKey: "customer_id",
    cardinality: "1:N",
    description: "Customer master to relationships",
    businessContext:
      "One customer can have multiple relationships with accounts or other customers",
  },
  {
    relationshipId: "SS002",
    fromTable: {
      schema: "silver",
      tableName: "silver.customer_master_golden",
      layer: "Silver",
    },
    toTable: {
      schema: "silver",
      tableName: "silver.customer_contact_history",
      layer: "Silver",
    },
    relationshipType: "One-to-Many",
    joinCondition: "master.customer_id = contact_history.customer_id",
    fromTableKey: "customer_id",
    toTableKey: "customer_id",
    cardinality: "1:N",
    description: "Customer master to contact history",
    businessContext:
      "One customer can have multiple contact information changes over time",
  },

  // SILVER TO GOLD RELATIONSHIPS
  {
    relationshipId: "SG001",
    fromTable: {
      schema: "silver",
      tableName: "silver.customer_master_golden",
      layer: "Silver",
    },
    toTable: {
      schema: "ANALYTICS",
      tableName: "CUSTOMER_DEPOSIT_AGGR",
      layer: "Gold",
    },
    relationshipType: "One-to-One",
    joinCondition: "silver.customer_id = gold.CUSTOMER_NUMBER",
    fromTableKey: "customer_id",
    toTableKey: "CUSTOMER_NUMBER",
    cardinality: "1:1",
    description: "Customer master golden record to gold aggregation",
    businessContext:
      "Gold aggregate consolidates customer demographics and behavioral data",
  },
];

export const customerERDComplete = {
  entities: customerEntities,
  relationships: customerRelationships,
  totalEntities: customerEntities.length,
  totalRelationships: customerRelationships.length,
  bronzeEntities: customerEntities.filter((e) => e.layer === "Bronze").length,
  silverEntities: customerEntities.filter((e) => e.layer === "Silver").length,
  goldEntities: customerEntities.filter((e) => e.layer === "Gold").length,
  description:
    "Customer domain ERD with complete entity and relationship definitions",
};

export default customerERDComplete;
