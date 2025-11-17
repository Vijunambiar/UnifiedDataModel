/**
 * Logical Model Attribute Mapper
 * Maps logical business entities to their key attributes from physical data models
 */

type EntityWithAttributes = {
  name: string;
  attributes: string[];
};

/**
 * Extract logical attributes from a table's schema
 * Returns key business attributes (not technical fields)
 */
function extractBusinessAttributes(
  schema: Record<string, string> | undefined,
): string[] {
  if (!schema) return [];

  const technicalFields = [
    "ingestion_timestamp",
    "raw_payload",
    "record_timestamp",
    "source_system",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "deleted_at",
    "is_deleted",
    "version",
    "hash",
    "checksum",
    "partition_key",
    "effective_from",
    "effective_to",
    "is_current",
    "valid_from",
    "valid_to",
    "record_id",
    "record_attributes",
    "metadata",
    "audit_timestamp",
  ];

  const businessAttributes = Object.keys(schema).filter((field) => {
    const fieldLower = field.toLowerCase();

    // Skip technical/audit fields
    if (technicalFields.some((tech) => fieldLower.includes(tech))) return false;

    // Keep business fields
    return true;
  });

  // Limit to top 8-10 most important business attributes
  return businessAttributes.slice(0, 10);
}

/**
 * Map logical entity name to physical table and extract attributes
 */
function mapEntityToAttributes(
  entityName: string,
  silverTables: any[] = [],
  goldDimensions: any[] = [],
): string[] {
  // Normalize entity name for matching
  const normalizedEntity = entityName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  // Try to find matching silver table
  for (const table of silverTables) {
    const tableName = table.name?.toLowerCase() || "";
    const tableBaseName = tableName
      .replace(/^silver\./, "")
      .replace(/_golden_record$/, "")
      .replace(/_master$/, "");

    if (
      tableBaseName.includes(normalizedEntity) ||
      normalizedEntity.includes(tableBaseName) ||
      tableName.includes(normalizedEntity.split("_")[0])
    ) {
      const attrs = extractBusinessAttributes(table.schema);
      if (attrs.length > 0) return attrs;
    }
  }

  // Try to find matching gold dimension
  for (const dim of goldDimensions) {
    const dimName = dim.name?.toLowerCase() || "";
    const dimBaseName = dimName.replace(/^gold\.dim_/, "");

    if (
      dimBaseName.includes(normalizedEntity) ||
      normalizedEntity.includes(dimBaseName)
    ) {
      const attrs = extractBusinessAttributes(dim.schema);
      if (attrs.length > 0) return attrs;
    }
  }

  // Default attributes based on common entity patterns
  return getDefaultAttributesForEntity(entityName);
}

/**
 * Provide default logical attributes for common banking entities
 */
function getDefaultAttributesForEntity(entityName: string): string[] {
  const entityLower = entityName.toLowerCase();

  // Customer entities
  if (entityLower.includes("customer")) {
    return [
      "customer_id",
      "full_name",
      "customer_type",
      "customer_status",
      "email_address",
      "phone_number",
      "date_of_birth",
      "customer_since_date",
    ];
  }

  // Account entities
  if (entityLower.includes("account")) {
    return [
      "account_id",
      "account_number",
      "account_type",
      "account_status",
      "balance",
      "currency",
      "open_date",
      "customer_id",
    ];
  }

  // Loan entities
  if (entityLower.includes("loan")) {
    return [
      "loan_id",
      "loan_type",
      "loan_status",
      "original_amount",
      "current_balance",
      "interest_rate",
      "origination_date",
      "maturity_date",
      "borrower_id",
    ];
  }

  // Card entities
  if (entityLower.includes("card")) {
    return [
      "card_id",
      "card_number",
      "card_type",
      "card_status",
      "credit_limit",
      "available_credit",
      "expiration_date",
      "customer_id",
    ];
  }

  // Transaction entities
  if (entityLower.includes("transaction")) {
    return [
      "transaction_id",
      "transaction_type",
      "transaction_amount",
      "transaction_date",
      "description",
      "account_id",
      "status",
    ];
  }

  // Payment entities
  if (entityLower.includes("payment")) {
    return [
      "payment_id",
      "payment_type",
      "payment_amount",
      "payment_date",
      "payment_method",
      "status",
      "account_id",
    ];
  }

  // Branch entities
  if (entityLower.includes("branch")) {
    return [
      "branch_id",
      "branch_name",
      "branch_type",
      "address",
      "city",
      "state",
      "phone_number",
    ];
  }

  // Product entities
  if (entityLower.includes("product")) {
    return [
      "product_id",
      "product_name",
      "product_type",
      "product_category",
      "interest_rate",
      "fees",
      "active_flag",
    ];
  }

  // Segment entities
  if (entityLower.includes("segment")) {
    return [
      "segment_id",
      "segment_name",
      "segment_type",
      "segment_criteria",
      "segment_size",
    ];
  }

  // Event entities
  if (entityLower.includes("event")) {
    return [
      "event_id",
      "event_type",
      "event_timestamp",
      "customer_id",
      "channel",
      "event_data",
    ];
  }

  // Generic fallback
  return [
    `${entityLower.split(" ")[0]}_id`,
    "name",
    "type",
    "status",
    "description",
    "created_date",
  ];
}

/**
 * Main function: Map all logical entities to their attributes
 */
export function enrichLogicalEntitiesWithAttributes(
  entityNames: string[],
  silverLayer?: { tables?: any[] },
  goldLayer?: { dimensions?: any[] },
): EntityWithAttributes[] {
  const silverTables = silverLayer?.tables || [];
  const goldDimensions = goldLayer?.dimensions || [];

  return entityNames.map((name) => ({
    name,
    attributes: mapEntityToAttributes(name, silverTables, goldDimensions),
  }));
}
