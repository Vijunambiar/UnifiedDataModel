/**
 * CUSTOMER DOMAIN - BRONZE LAYER - LOGICAL DATA MODEL
 * 
 * Business entities and their relationships from FIS source system
 * This represents the conceptual model before physical implementation
 * 
 * Source System: FIS (Fiserv)
 * Domain: Customer Core
 * Layer: Bronze (Raw/Landing)
 */

export interface LogicalEntity {
  entityName: string;
  businessDefinition: string;
  businessOwner: string;
  attributes: LogicalAttribute[];
  businessRules: string[];
  relationships: EntityRelationship[];
}

export interface LogicalAttribute {
  attributeName: string;
  businessDefinition: string;
  dataType: string;
  isMandatory: boolean;
  businessRules: string[];
  exampleValues?: string[];
}

export interface EntityRelationship {
  relatedEntity: string;
  relationshipType: "One-to-One" | "One-to-Many" | "Many-to-Many";
  businessDescription: string;
  foreignKey?: string;
}

// ============================================================================
// CUSTOMER MASTER ENTITY
// ============================================================================
export const customerMasterEntity: LogicalEntity = {
  entityName: "Customer Master",
  businessDefinition: "Core customer entity representing individual or business account holders",
  businessOwner: "Customer Operations",
  
  attributes: [
    {
      attributeName: "Customer Number",
      businessDefinition: "Unique identifier assigned to each customer by the bank",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: [
        "Must be unique across all customers",
        "Cannot be changed once assigned",
        "Format: CID followed by 10 digits"
      ],
      exampleValues: ["CID1234567890", "CID9876543210"]
    },
    {
      attributeName: "Customer Type",
      businessDefinition: "Classification of customer (Individual, Business, Trust, etc.)",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Must be from approved customer type list",
        "Determines applicable products and services"
      ],
      exampleValues: ["INDIVIDUAL", "BUSINESS", "TRUST"]
    },
    {
      attributeName: "Customer Name",
      businessDefinition: "Full legal name of the customer",
      dataType: "Text",
      isMandatory: true,
      businessRules: [
        "Must match government-issued identification",
        "PII - requires encryption in Silver layer"
      ]
    },
    {
      attributeName: "Date of Birth",
      businessDefinition: "Customer's date of birth (for individuals)",
      dataType: "Date",
      isMandatory: false,
      businessRules: [
        "Must be at least 18 years ago for individual accounts",
        "Not applicable for business entities"
      ]
    },
    {
      attributeName: "Tax ID / SSN",
      businessDefinition: "Government-issued tax identification number",
      dataType: "Encrypted Alphanumeric",
      isMandatory: true,
      businessRules: [
        "PII - must be encrypted at rest and in transit",
        "Required for regulatory compliance (KYC/AML)",
        "Format validation based on country"
      ]
    },
    {
      attributeName: "Customer Status",
      businessDefinition: "Current status of the customer relationship",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: ACTIVE, INACTIVE, CLOSED, DECEASED",
        "Determines product eligibility and account access"
      ],
      exampleValues: ["ACTIVE", "INACTIVE", "CLOSED"]
    },
    {
      attributeName: "Customer Since Date",
      businessDefinition: "Date when customer relationship was established",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Cannot be in the future",
        "Used for tenure and loyalty calculations"
      ]
    },
    {
      attributeName: "Risk Rating",
      businessDefinition: "AML/Compliance risk rating assigned to customer",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: LOW, MEDIUM, HIGH, PROHIBITED",
        "Determines transaction monitoring thresholds",
        "Must be reviewed annually"
      ],
      exampleValues: ["LOW", "MEDIUM", "HIGH"]
    }
  ],
  
  businessRules: [
    "Each customer must have a unique Customer Number",
    "Customer Type determines available product offerings",
    "PII fields must be encrypted in accordance with data privacy regulations",
    "Customer Status changes trigger workflow notifications",
    "Risk Rating must be reviewed and updated annually or upon significant events",
    "Deceased customers cannot have new accounts opened",
    "Customer records are subject to SCD Type 2 tracking for audit history"
  ],
  
  relationships: [
    {
      relatedEntity: "Customer Identifiers",
      relationshipType: "One-to-Many",
      businessDescription: "A customer can have multiple identification documents (passport, driver's license, etc.)",
      foreignKey: "Customer Number"
    },
    {
      relatedEntity: "Customer Addresses",
      relationshipType: "One-to-Many",
      businessDescription: "A customer can have multiple addresses (mailing, physical, work)",
      foreignKey: "Customer Number"
    },
    {
      relatedEntity: "Customer Contact Information",
      relationshipType: "One-to-Many",
      businessDescription: "A customer can have multiple contact methods (email, phone)",
      foreignKey: "Customer Number"
    },
    {
      relatedEntity: "Customer to Account Relationship",
      relationshipType: "One-to-Many",
      businessDescription: "A customer can own or be associated with multiple accounts",
      foreignKey: "Customer Number"
    }
  ]
};

// ============================================================================
// CUSTOMER IDENTIFIERS ENTITY
// ============================================================================
export const customerIdentifiersEntity: LogicalEntity = {
  entityName: "Customer Identifiers",
  businessDefinition: "Government-issued and other identification documents for customer verification",
  businessOwner: "Compliance",
  
  attributes: [
    {
      attributeName: "Customer Number",
      businessDefinition: "Reference to the customer master record",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Customer Master"]
    },
    {
      attributeName: "ID Type",
      businessDefinition: "Type of identification document",
      dataType: "Code",
      isMandatory: true,
      businessRules: ["Valid values: PASSPORT, DRIVERS_LICENSE, NATIONAL_ID, SSN"],
      exampleValues: ["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"]
    },
    {
      attributeName: "ID Number",
      businessDefinition: "Identification document number",
      dataType: "Encrypted Alphanumeric",
      isMandatory: true,
      businessRules: [
        "PII - must be encrypted",
        "Format validation based on ID Type"
      ]
    },
    {
      attributeName: "Issuing Country",
      businessDefinition: "Country that issued the identification",
      dataType: "Code",
      isMandatory: true,
      businessRules: ["Must be valid ISO country code"]
    },
    {
      attributeName: "Expiration Date",
      businessDefinition: "When the identification document expires",
      dataType: "Date",
      isMandatory: false,
      businessRules: [
        "System should alert when approaching expiration",
        "Expired IDs may trigger compliance review"
      ]
    }
  ],
  
  businessRules: [
    "At least one valid, non-expired ID required per customer",
    "All ID numbers must be encrypted at rest",
    "Expired IDs should trigger customer contact for update"
  ],
  
  relationships: [
    {
      relatedEntity: "Customer Master",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple IDs belong to one customer",
      foreignKey: "Customer Number"
    }
  ]
};

// ============================================================================
// CUSTOMER ADDRESSES ENTITY
// ============================================================================
export const customerAddressesEntity: LogicalEntity = {
  entityName: "Customer Addresses",
  businessDefinition: "Physical and mailing addresses associated with customers",
  businessOwner: "Customer Operations",
  
  attributes: [
    {
      attributeName: "Customer Number",
      businessDefinition: "Reference to the customer master record",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Customer Master"]
    },
    {
      attributeName: "Address Type",
      businessDefinition: "Purpose/classification of the address",
      dataType: "Code",
      isMandatory: true,
      businessRules: ["Valid values: PRIMARY, MAILING, WORK, PREVIOUS"],
      exampleValues: ["PRIMARY", "MAILING", "WORK"]
    },
    {
      attributeName: "Address Line 1",
      businessDefinition: "Street address",
      dataType: "Text",
      isMandatory: true,
      businessRules: ["Should be standardized using postal service validation"]
    },
    {
      attributeName: "City",
      businessDefinition: "City name",
      dataType: "Text",
      isMandatory: true,
      businessRules: []
    },
    {
      attributeName: "State/Province",
      businessDefinition: "State or province code",
      dataType: "Code",
      isMandatory: true,
      businessRules: ["Must be valid state/province for the country"]
    },
    {
      attributeName: "Postal Code",
      businessDefinition: "ZIP or postal code",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Format validation based on country"]
    },
    {
      attributeName: "Country",
      businessDefinition: "Country code",
      dataType: "Code",
      isMandatory: true,
      businessRules: ["Must be valid ISO country code"]
    }
  ],
  
  businessRules: [
    "Each customer must have at least one PRIMARY address",
    "Addresses should be validated against postal service databases",
    "Address changes trigger regulatory reporting for certain account types"
  ],
  
  relationships: [
    {
      relatedEntity: "Customer Master",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple addresses belong to one customer",
      foreignKey: "Customer Number"
    }
  ]
};

// ============================================================================
// CUSTOMER TO ACCOUNT RELATIONSHIP ENTITY
// ============================================================================
export const customerAccountRelationshipEntity: LogicalEntity = {
  entityName: "Customer to Account Relationship",
  businessDefinition: "Defines the relationship between customers and their deposit accounts",
  businessOwner: "Customer Operations",
  
  attributes: [
    {
      attributeName: "Customer Number",
      businessDefinition: "Reference to the customer",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Customer Master"]
    },
    {
      attributeName: "Account Number",
      businessDefinition: "Reference to the deposit account",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master (Deposits domain)"]
    },
    {
      attributeName: "Relationship Type",
      businessDefinition: "Type of relationship customer has with account",
      dataType: "Code",
      isMandatory: true,
      businessRules: ["Valid values: PRIMARY_OWNER, JOINT_OWNER, AUTHORIZED_SIGNER, BENEFICIARY"],
      exampleValues: ["PRIMARY_OWNER", "JOINT_OWNER", "AUTHORIZED_SIGNER"]
    },
    {
      attributeName: "Relationship Start Date",
      businessDefinition: "When this relationship was established",
      dataType: "Date",
      isMandatory: true,
      businessRules: ["Cannot be before customer since date"]
    },
    {
      attributeName: "Relationship End Date",
      businessDefinition: "When this relationship was terminated",
      dataType: "Date",
      isMandatory: false,
      businessRules: ["Must be after start date if populated"]
    }
  ],
  
  businessRules: [
    "Each account must have at least one PRIMARY_OWNER",
    "Joint accounts require multiple JOINT_OWNER relationships",
    "Authorized signers have transaction authority but no ownership",
    "Relationship changes require appropriate authorization and documentation"
  ],
  
  relationships: [
    {
      relatedEntity: "Customer Master",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple relationships for one customer",
      foreignKey: "Customer Number"
    },
    {
      relatedEntity: "Account Master (Deposits Domain)",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple customer relationships to one account",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// LOGICAL MODEL SUMMARY
// ============================================================================
export const customerLogicalModel = {
  domainName: "Customer Core",
  version: "1.0",
  lastUpdated: "2024",
  entities: [
    customerMasterEntity,
    customerIdentifiersEntity,
    customerAddressesEntity,
    customerAccountRelationshipEntity
  ],
  entityCount: 4,
  businessOwners: ["Customer Operations", "Compliance"],
  dataClassification: "PII - High Sensitivity",
  retentionPolicy: "7 years after relationship end, per regulatory requirements"
};

export default customerLogicalModel;
