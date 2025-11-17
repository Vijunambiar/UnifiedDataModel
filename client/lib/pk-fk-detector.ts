/**
 * Primary Key and Foreign Key Detection Utility
 * Accurately identifies PKs and FKs from table schemas and key_fields
 */

export type ColumnInfo = {
  name: string;
  type?: string;
  isPK: boolean;
  isFK: boolean;
};

/**
 * Detect if a field name is likely a Primary Key
 */
function isPrimaryKeyField(
  fieldName: string,
  fieldIndex: number,
  schemaValue?: string,
): boolean {
  const nameLower = fieldName.toLowerCase();

  // Explicit PRIMARY KEY in schema
  if (schemaValue && schemaValue.toUpperCase().includes("PRIMARY KEY")) {
    return true;
  }

  // First field in key_fields array is usually the PK
  if (fieldIndex === 0) {
    return true;
  }

  // Common PK naming patterns (if it's the only one)
  const pkPatterns = [/^id$/, /^.*_id$/, /^.*_key$/, /^.*_pk$/, /^pk_/];

  // Check if it matches PK pattern and doesn't look like an FK
  const matchesPKPattern = pkPatterns.some((pattern) =>
    pattern.test(nameLower),
  );
  const looksLikeFK = isForeignKeyField(fieldName, schemaValue);

  return matchesPKPattern && !looksLikeFK && fieldIndex === 0;
}

/**
 * Detect if a field name is likely a Foreign Key
 */
function isForeignKeyField(fieldName: string, schemaValue?: string): boolean {
  const nameLower = fieldName.toLowerCase();

  // Explicit FOREIGN KEY or REFERENCES in schema
  if (
    schemaValue &&
    (schemaValue.toUpperCase().includes("FOREIGN KEY") ||
      schemaValue.toUpperCase().includes("REFERENCES"))
  ) {
    return true;
  }

  // Skip these common non-FK fields
  const nonFKPatterns = [
    /^id$/,
    /^.*_date$/,
    /^.*_timestamp$/,
    /^.*_time$/,
    /^created_/,
    /^updated_/,
    /^modified_/,
    /^deleted_/,
    /^ingestion_/,
    /^record_/,
    /^source_system$/,
    /^.*_flag$/,
    /^.*_status$/,
    /^.*_type$/,
    /^.*_code$/,
    /^.*_name$/,
    /^.*_text$/,
    /^.*_amount$/,
    /^.*_balance$/,
    /^.*_rate$/,
    /^.*_pct$/,
    /^.*_percent$/,
  ];

  // If it matches a non-FK pattern, it's not an FK
  if (nonFKPatterns.some((pattern) => pattern.test(nameLower))) {
    return false;
  }

  // FK naming patterns
  const fkPatterns = [
    /^customer_id$/,
    /^account_id$/,
    /^loan_id$/,
    /^borrower_id$/,
    /^card_id$/,
    /^merchant_id$/,
    /^product_id$/,
    /^branch_id$/,
    /^channel_id$/,
    /^.*_customer_id$/,
    /^.*_account_id$/,
    /^.*_loan_id$/,
    /^.*_card_id$/,
    /^.*_product_id$/,
    /^source_.*_id$/,
    /^parent_.*_id$/,
    /^.*_key$/, // Most _key fields are FKs
  ];

  return fkPatterns.some((pattern) => pattern.test(nameLower));
}

/**
 * Extract column type from schema value
 */
function extractColumnType(schemaValue: string): string {
  // Remove PRIMARY KEY, FOREIGN KEY, etc. to get clean type
  let type = schemaValue
    .replace(/PRIMARY KEY/gi, "")
    .replace(/FOREIGN KEY/gi, "")
    .replace(/REFERENCES.*/gi, "")
    .replace(/UNIQUE/gi, "")
    .replace(/NOT NULL/gi, "")
    .trim();

  // Shorten common types
  type = type
    .replace(/VARCHAR\((\d+)\)/gi, "VARCHAR")
    .replace(/DECIMAL\(.*?\)/gi, "DECIMAL")
    .replace(/NUMERIC\(.*?\)/gi, "NUMERIC");

  return type || undefined;
}

/**
 * Process key_fields array into column info with PK/FK detection
 */
export function processKeyFields(keyFields: string[]): ColumnInfo[] {
  if (!keyFields || keyFields.length === 0) return [];

  return keyFields.map((field, idx) => {
    const isPK = isPrimaryKeyField(field, idx);
    const isFK = !isPK && isForeignKeyField(field);

    return {
      name: field,
      type: undefined,
      isPK,
      isFK,
    };
  });
}

/**
 * Process schema object into column info with PK/FK detection
 */
export function processSchema(schema: Record<string, string>): ColumnInfo[] {
  if (!schema || typeof schema !== "object") return [];

  const fields = Object.keys(schema);

  return fields.map((field, idx) => {
    const schemaValue = schema[field];
    const isPK = isPrimaryKeyField(field, idx, schemaValue);
    const isFK = !isPK && isForeignKeyField(field, schemaValue);
    const type = extractColumnType(schemaValue);

    return {
      name: field,
      type,
      isPK,
      isFK,
    };
  });
}

/**
 * Process table definition and return enriched column info
 */
export function processTableColumns(table: {
  name?: string;
  key_fields?: string[];
  schema?: Record<string, string>;
}): ColumnInfo[] {
  // Priority 1: Use schema if available
  if (table.schema) {
    return processSchema(table.schema);
  }

  // Priority 2: Use key_fields
  if (table.key_fields) {
    return processKeyFields(table.key_fields);
  }

  // No column info available
  return [];
}

/**
 * Infer columns for Silver/Gold tables that don't have explicit schemas
 * Based on table name and common patterns
 */
export function inferColumnsForTable(
  tableName: string,
  layer: "silver" | "gold",
): ColumnInfo[] {
  const normalizedName = tableName
    .toLowerCase()
    .replace(/^(silver|gold)\./, "");

  // Base columns all tables should have
  const baseColumns: ColumnInfo[] = [];

  // Determine primary key based on table name
  if (
    normalizedName.includes("_master") ||
    normalizedName.includes("_golden")
  ) {
    const entity = normalizedName
      .replace(/_master|_golden/, "")
      .replace(/_/g, "_");
    baseColumns.push({
      name: `${entity}_id`,
      type: "BIGINT",
      isPK: true,
      isFK: false,
    });
  } else if (normalizedName.startsWith("dim_")) {
    const dim = normalizedName.replace(/^dim_/, "");
    baseColumns.push({
      name: `${dim}_key`,
      type: "BIGINT",
      isPK: true,
      isFK: false,
    });
  } else if (normalizedName.startsWith("fact_")) {
    baseColumns.push({
      name: "fact_key",
      type: "BIGINT",
      isPK: true,
      isFK: false,
    });
  } else {
    // Generic ID
    baseColumns.push({ name: "id", type: "BIGINT", isPK: true, isFK: false });
  }

  // Add common FK fields based on domain
  const commonFKs: Record<string, string[]> = {
    loan: ["loan_id", "borrower_id", "customer_id"],
    customer: ["customer_id"],
    account: ["account_id", "customer_id"],
    card: ["card_id", "customer_id", "account_id"],
    transaction: ["transaction_id", "account_id", "customer_id"],
    payment: ["payment_id", "account_id"],
    deposit: ["account_id", "customer_id"],
  };

  // Find matching FKs
  for (const [domain, fks] of Object.entries(commonFKs)) {
    if (normalizedName.includes(domain)) {
      fks.forEach((fk) => {
        // Don't add if it's already the PK
        if (!baseColumns.some((col) => col.name === fk && col.isPK)) {
          baseColumns.push({
            name: fk,
            type: "BIGINT",
            isPK: false,
            isFK: true,
          });
        }
      });
      break;
    }
  }

  // Add SCD2 fields for silver layer
  if (layer === "silver") {
    baseColumns.push(
      { name: "effective_from", type: "TIMESTAMP", isPK: false, isFK: false },
      { name: "effective_to", type: "TIMESTAMP", isPK: false, isFK: false },
      { name: "is_current", type: "BOOLEAN", isPK: false, isFK: false },
    );
  }

  // Add common date fields for gold facts
  if (layer === "gold" && normalizedName.startsWith("fact_")) {
    baseColumns.push(
      { name: "date_key", type: "INTEGER", isPK: false, isFK: true },
      { name: "customer_key", type: "BIGINT", isPK: false, isFK: true },
    );
  }

  return baseColumns;
}
