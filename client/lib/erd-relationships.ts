// ERD Relationship Auto-Detection
// Automatically generates FK relationships for star schemas

export type TableRelationship = {
  from: string;
  to: string;
  fromColumn?: string;
  toColumn?: string;
};

/**
 * Auto-generate star schema relationships for Gold layer
 * Facts reference dimensions via _key or _id foreign keys
 */
export function generateStarSchemaRelationships(
  dimensions: Array<{ name: string; grain?: string }>,
  facts: Array<{ name: string; grain?: string; measures?: string[] }>,
): TableRelationship[] {
  const relationships: TableRelationship[] = [];

  // For each fact table
  for (const fact of facts) {
    const factName = fact.name;
    const factBaseName = fact.name.replace(/^gold\./, "").replace(/^fact_/, "");

    // For each dimension
    for (const dimension of dimensions) {
      const dimName = dimension.name;
      const dimBaseName = dimension.name
        .replace(/^gold\./, "")
        .replace(/^dim_/, "");

      // Check if this fact likely references this dimension
      const shouldConnect =
        factBaseName.includes(dimBaseName) || // Direct name match
        // Universal dimensions (connect to ALL facts)
        dimBaseName === "date" ||
        dimBaseName === "time" ||
        dimBaseName === "calendar" ||
        // Common business dimensions
        dimBaseName === "customer" ||
        dimBaseName === "borrower" ||
        dimBaseName === "client" ||
        dimBaseName === "account" ||
        dimBaseName === "branch" ||
        dimBaseName === "channel" ||
        dimBaseName === "geography" ||
        dimBaseName === "location" ||
        // Product dimensions (domain-specific but common)
        (dimBaseName.includes("product") &&
          factBaseName.includes(dimBaseName.replace("_product", ""))) ||
        dimBaseName === "product" ||
        // Domain-specific matching
        (dimBaseName === "loan" && factBaseName.includes("loan")) ||
        (dimBaseName === "card" && factBaseName.includes("card")) ||
        (dimBaseName === "deposit" && factBaseName.includes("deposit")) ||
        (dimBaseName === "account" && factBaseName.includes("account")) ||
        (dimBaseName === "transaction" &&
          factBaseName.includes("transaction")) ||
        (dimBaseName === "payment" && factBaseName.includes("payment")) ||
        (dimBaseName === "merchant" &&
          (factBaseName.includes("merchant") ||
            factBaseName.includes("card"))) ||
        // Status/Type dimensions
        (dimBaseName.includes("status") &&
          factBaseName.includes(dimBaseName.replace("_status", ""))) ||
        (dimBaseName.includes("type") &&
          factBaseName.includes(dimBaseName.replace("_type", "")));

      if (shouldConnect) {
        relationships.push({
          from: factName,
          to: dimName,
          fromColumn: `${dimBaseName}_key`,
          toColumn: `${dimBaseName}_key`,
        });
      }
    }
  }

  return relationships;
}

/**
 * Extract key fields from table definition (supports both formats)
 */
function extractKeyFields(table: {
  key_fields?: string[];
  schema?: Record<string, string>;
  columns?: Array<{ name: string; isPK?: boolean; isFK?: boolean }>;
}): string[] {
  // Format 1: Use enriched columns if available
  if (table.columns && table.columns.length > 0) {
    return table.columns.map((c) => c.name);
  }

  // Format 2: Direct key_fields array
  if (table.key_fields && table.key_fields.length > 0) {
    return table.key_fields;
  }

  // Format 3: Schema object - extract field names
  if (table.schema && typeof table.schema === "object") {
    return Object.keys(table.schema);
  }

  return [];
}

/**
 * Get FK fields from table (fields marked as foreign keys)
 */
function getForeignKeyFields(table: {
  columns?: Array<{ name: string; isPK?: boolean; isFK?: boolean }>;
  key_fields?: string[];
}): string[] {
  // Use enriched columns if available
  if (table.columns && table.columns.length > 0) {
    return table.columns.filter((c) => c.isFK).map((c) => c.name);
  }

  // Fallback: use key_fields excluding first one (usually PK)
  if (table.key_fields && table.key_fields.length > 1) {
    return table.key_fields.slice(1);
  }

  return [];
}

/**
 * Get PK field from table
 */
function getPrimaryKeyField(table: {
  columns?: Array<{ name: string; isPK?: boolean; isFK?: boolean }>;
  key_fields?: string[];
}): string | null {
  // Use enriched columns if available
  if (table.columns && table.columns.length > 0) {
    const pkColumn = table.columns.find((c) => c.isPK);
    return pkColumn?.name || null;
  }

  // Fallback: first key_field
  if (table.key_fields && table.key_fields.length > 0) {
    return table.key_fields[0];
  }

  return null;
}

/**
 * Generate bronze/silver layer relationships based on table names and key fields
 * Enhanced to detect more relationship patterns
 */
export function generateLayerRelationships(
  tables: Array<{
    name: string;
    key_fields?: string[];
    schema?: Record<string, string>;
  }>,
): TableRelationship[] {
  const relationships: TableRelationship[] = [];

  // Extract base entities and their master tables
  const entityMap = new Map<string, string>();

  // First pass: identify master/golden/enriched tables
  for (const table of tables) {
    if (table.name.includes("_master") ||
        table.name.includes("_golden") ||
        table.name.includes("_enriched") ||
        table.name.includes("_current") ||
        table.name.includes("_performance") ||
        table.name.includes("_journeys") ||
        table.name.includes("_attribution")) {
      const entity = extractEntityFromTable(table.name);
      if (entity) {
        entityMap.set(entity, table.name);
      }
    }
  }

  // Second pass: find FK relationships using enriched column info
  for (const table of tables) {
    const foreignKeyFields = getForeignKeyFields(table);
    if (foreignKeyFields.length === 0) continue;

    for (const field of foreignKeyFields) {
      const fieldLower = field.toLowerCase();

      // Extract the entity name from the FK
      const fkEntity = field
        .replace(/_id$/i, "")
        .replace(/_key$/i, "")
        .replace(/^source_/, "") // Handle source_customer_id -> customer
        .replace(/^parent_/, ""); // Handle parent_loan_id -> loan

      // For marketing tables, add mktg_ prefix to FK entity
      const tableName = table.name.toLowerCase();
      let fkEntityWithPrefix = fkEntity;
      if (tableName.includes("mktg_") && !fkEntity.startsWith("mktg_")) {
        // Try both with and without mktg_ prefix
        // campaign_id -> try "campaign" and "mktg_campaigns"
        const pluralEntity = fkEntity.endsWith('s') ? fkEntity : fkEntity + 's';
        fkEntityWithPrefix = `mktg_${pluralEntity}`;
      }

      // Try to find the master table for this entity
      let targetTable = entityMap.get(fkEntity) || entityMap.get(fkEntityWithPrefix);

      // If not found, try common variations
      if (!targetTable) {
        // Try with common prefixes/suffixes
        for (const [entity, masterTable] of entityMap.entries()) {
          if (
            entity.includes(fkEntity) ||
            fkEntity.includes(entity) ||
            entity.replace("_", "") === fkEntity.replace("_", "")
          ) {
            targetTable = masterTable;
            break;
          }
        }
      }

      // If still not found, look for any table with the entity name
      if (!targetTable) {
        targetTable = tables.find((t) => {
          const tName = t.name.toLowerCase();
          const fkLower = fkEntity.toLowerCase();
          return (
            tName.includes(fkLower) &&
            (tName.includes("master") ||
              tName.includes("golden") ||
              tName.includes("dim_") ||
              tName === `bronze.${fkLower}` ||
              tName === `silver.${fkLower}`)
          );
        })?.name;
      }

      if (targetTable && targetTable !== table.name) {
        relationships.push({
          from: table.name,
          to: targetTable,
          fromColumn: field,
          toColumn: field,
        });
      }
    }
  }

  // Add some common relationship patterns
  const commonPatterns = [
    // Marketing domain - Banking specific
    { from: "mktg_leads_enriched", to: "mktg_campaigns_enriched", field: "campaign_id" },
    { from: "mktg_customer_journeys", to: "mktg_leads_enriched", field: "lead_id" },
    { from: "mktg_customer_journeys", to: "mktg_campaigns_enriched", field: "campaign_id" },
    { from: "mktg_multi_touch_attribution", to: "mktg_customer_journeys", field: "journey_id" },
    { from: "mktg_multi_touch_attribution", to: "mktg_campaigns_enriched", field: "campaign_id" },
    { from: "mktg_campaign_performance_daily", to: "mktg_campaigns_enriched", field: "campaign_id" },
    { from: "mktg_offer_performance", to: "mktg_campaigns_enriched", field: "campaign_id" },

    // Loan domain
    { from: "loan_applications", to: "loan_master", field: "loan_id" },
    { from: "loan_balances", to: "loan_master", field: "loan_id" },
    { from: "loan_transactions", to: "loan_master", field: "loan_id" },
    { from: "loan_payments", to: "loan_master", field: "loan_id" },
    { from: "loan_delinquency", to: "loan_master", field: "loan_id" },
    { from: "loan_collateral", to: "loan_master", field: "loan_id" },

    // Customer domain
    { from: "customer_accounts", to: "customer_master", field: "customer_id" },
    {
      from: "customer_identifiers",
      to: "customer_master",
      field: "source_customer_id",
    },
    {
      from: "customer_relationships",
      to: "customer_master",
      field: "primary_customer_id",
    },

    // Account domain
    { from: "account_transactions", to: "account_master", field: "account_id" },
    { from: "account_balances", to: "account_master", field: "account_id" },

    // Card domain
    { from: "card_transactions", to: "card_master", field: "card_id" },
    { from: "card_authorizations", to: "card_master", field: "card_id" },
  ];

  for (const pattern of commonPatterns) {
    const fromTable = tables.find((t) =>
      t.name.toLowerCase().includes(pattern.from),
    );
    const toTable = tables.find((t) =>
      t.name.toLowerCase().includes(pattern.to),
    );

    if (fromTable && toTable && fromTable.name !== toTable.name) {
      // Check if relationship already exists
      const exists = relationships.some(
        (r) => r.from === fromTable.name && r.to === toTable.name,
      );

      if (!exists) {
        relationships.push({
          from: fromTable.name,
          to: toTable.name,
          fromColumn: pattern.field,
          toColumn: pattern.field,
        });
      }
    }
  }

  return relationships;
}

/**
 * Extract entity name from table name
 * Examples:
 * - "bronze.loan_balances_raw" -> "loan"
 * - "silver.customer_master" -> "customer"
 * - "gold.fact_transactions" -> "transaction"
 */
function extractEntityFromTable(tableName: string): string | null {
  // Remove layer prefix (bronze./silver./gold.)
  let name = tableName.replace(/^(bronze|silver|gold)\./, "");

  // Remove common suffixes (banking-specific + standard)
  name = name.replace(
    /_raw$|_master$|_golden$|_cleansed$|_history$|_daily$|_tracking$|_enriched$|_current$|_performance$|_agg$|_aggregated$/i,
    "",
  );

  // Remove fact_ prefix
  name = name.replace(/^fact_/, "");

  // For marketing tables, return the full entity name (e.g., "mktg_campaigns", "mktg_leads")
  // For other tables, return the first significant part
  if (name.startsWith("mktg_")) {
    // Return full name like "mktg_campaigns", "mktg_leads", "mktg_customer_journeys"
    return name;
  }

  // Get first word before underscore for main entity
  const parts = name.split("_");
  return parts[0] || null;
}

/**
 * Generate logical ERD relationships from entity names
 * Based on common banking domain patterns
 */
export function generateLogicalRelationships(
  entities: string[],
): Array<{
  from: string;
  to: string;
  type: "1:1" | "1:M" | "M:M";
  label?: string;
}> {
  const relationships: Array<{
    from: string;
    to: string;
    type: "1:1" | "1:M" | "M:M";
    label?: string;
  }> = [];

  // Normalize entity names for comparison
  const normalizedEntities = entities.map((e) => ({
    original: e,
    normalized: e.toLowerCase().replace(/[^a-z]/g, ""),
  }));

  // Common banking relationship patterns
  const patterns: Array<{
    from: string;
    to: string;
    type: "1:1" | "1:M" | "M:M";
    label?: string;
    keywords: string[]; // Multiple possible matches
  }> = [
    // Customer relationships
    {
      from: "customer",
      to: "account",
      type: "1:M",
      label: "owns",
      keywords: ["customer", "account"],
    },
    {
      from: "customer",
      to: "household",
      type: "M:M",
      label: "member of",
      keywords: ["customer", "household"],
    },
    {
      from: "customer",
      to: "contact",
      type: "1:1",
      label: "has",
      keywords: ["customer", "contact"],
    },
    {
      from: "customer",
      to: "product",
      type: "M:M",
      label: "holds",
      keywords: ["customer", "product"],
    },
    {
      from: "customer",
      to: "loan",
      type: "1:M",
      label: "borrows",
      keywords: ["customer", "loan"],
    },
    {
      from: "customer",
      to: "card",
      type: "1:M",
      label: "holds",
      keywords: ["customer", "card"],
    },

    // Account relationships
    {
      from: "account",
      to: "transaction",
      type: "1:M",
      label: "has",
      keywords: ["account", "transaction"],
    },
    {
      from: "account",
      to: "balance",
      type: "1:M",
      label: "has",
      keywords: ["account", "balance"],
    },
    {
      from: "account",
      to: "product",
      type: "M:1",
      label: "is of type",
      keywords: ["account", "product"],
    },

    // Loan relationships
    {
      from: "loan",
      to: "collateral",
      type: "1:M",
      label: "secured by",
      keywords: ["loan", "collateral"],
    },
    {
      from: "loan",
      to: "payment",
      type: "1:M",
      label: "has",
      keywords: ["loan", "payment"],
    },
    {
      from: "loan",
      to: "borrower",
      type: "M:1",
      label: "belongs to",
      keywords: ["loan", "borrower"],
    },

    // Card relationships
    {
      from: "card",
      to: "transaction",
      type: "1:M",
      label: "has",
      keywords: ["card", "transaction"],
    },
    {
      from: "card",
      to: "account",
      type: "M:1",
      label: "linked to",
      keywords: ["card", "account"],
    },

    // Payment relationships
    {
      from: "payment",
      to: "account",
      type: "M:1",
      label: "from",
      keywords: ["payment", "account"],
    },
    {
      from: "transaction",
      to: "account",
      type: "M:1",
      label: "on",
      keywords: ["transaction", "account"],
    },

    // Branch/Channel relationships
    {
      from: "branch",
      to: "account",
      type: "1:M",
      label: "manages",
      keywords: ["branch", "account"],
    },
    {
      from: "channel",
      to: "transaction",
      type: "1:M",
      label: "processes",
      keywords: ["channel", "transaction"],
    },
  ];

  // Match entities with patterns using fuzzy matching
  for (const pattern of patterns) {
    let fromEntity: string | undefined;
    let toEntity: string | undefined;

    // Find matching entities
    for (const entity of normalizedEntities) {
      if (
        entity.normalized.includes(pattern.keywords[0]) ||
        pattern.keywords[0].includes(entity.normalized)
      ) {
        fromEntity = entity.original;
      }
      if (
        entity.normalized.includes(pattern.keywords[1]) ||
        pattern.keywords[1].includes(entity.normalized)
      ) {
        toEntity = entity.original;
      }
    }

    if (fromEntity && toEntity && fromEntity !== toEntity) {
      // Check if relationship already exists
      const exists = relationships.some(
        (r) => r.from === fromEntity && r.to === toEntity,
      );

      if (!exists) {
        relationships.push({
          from: fromEntity,
          to: toEntity,
          type: pattern.type,
          label: pattern.label,
        });
      }
    }
  }

  return relationships;
}
