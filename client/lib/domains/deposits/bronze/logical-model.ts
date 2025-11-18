/**
 * DEPOSITS DOMAIN - BRONZE LAYER - LOGICAL DATA MODEL
 * 
 * Business entities and their relationships from FIS source system
 * This represents the conceptual model before physical implementation
 * 
 * Source System: FIS Core Banking
 * Domain: Deposits
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
// ACCOUNT MASTER ENTITY
// ============================================================================
export const accountMasterEntity: LogicalEntity = {
  entityName: "Account Master",
  businessDefinition: "Core deposit account entity representing checking, savings, money market, and time deposit accounts",
  businessOwner: "Deposit Operations",
  
  attributes: [
    {
      attributeName: "Account Number",
      businessDefinition: "Unique identifier assigned to each deposit account",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: [
        "Must be unique across all deposit accounts",
        "Cannot be changed once assigned",
        "Format: Branch code + Account sequence"
      ],
      exampleValues: ["1001234567", "2009876543"]
    },
    {
      attributeName: "Account Type",
      businessDefinition: "Classification of deposit account product",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Must be from approved account type list",
        "Determines interest calculation and fee structure"
      ],
      exampleValues: ["CHECKING", "SAVINGS", "MONEY_MARKET", "CD", "TIME_DEPOSIT"]
    },
    {
      attributeName: "Account Status",
      businessDefinition: "Current operational status of the account",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: ACTIVE, DORMANT, CLOSED, RESTRICTED, FROZEN",
        "Status changes trigger workflow notifications and transaction restrictions"
      ],
      exampleValues: ["ACTIVE", "DORMANT", "CLOSED", "FROZEN"]
    },
    {
      attributeName: "Open Date",
      businessDefinition: "Date when the account was originally opened",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Cannot be in the future",
        "Used for account age and tenure calculations"
      ]
    },
    {
      attributeName: "Close Date",
      businessDefinition: "Date when the account was closed",
      dataType: "Date",
      isMandatory: false,
      businessRules: [
        "Must be after or equal to open date",
        "Required when account status is CLOSED"
      ]
    },
    {
      attributeName: "Interest Plan",
      businessDefinition: "Interest calculation and crediting plan assigned to account",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Determines interest rate and calculation frequency",
        "Different plans for different balance tiers"
      ]
    },
    {
      attributeName: "Interest Rate",
      businessDefinition: "Current annual percentage rate for interest calculation",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: [
        "Expressed as percentage (e.g., 2.50 for 2.50%)",
        "May change based on market conditions and product type"
      ]
    },
    {
      attributeName: "Branch Number",
      businessDefinition: "Branch where account was opened and is serviced",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: [
        "Must be a valid branch in branch master",
        "Determines statement mailing and service location"
      ]
    }
  ],
  
  businessRules: [
    "Each account must have a unique Account Number",
    "Account Type determines available features and transaction limits",
    "Closed accounts cannot have new transactions posted",
    "FROZEN accounts allow deposits but restrict withdrawals",
    "DORMANT accounts have no activity for specified period (typically 12-24 months)",
    "Interest is calculated daily and credited per interest plan schedule",
    "Account records are subject to SCD Type 2 tracking for audit history"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Group",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple accounts can belong to one account group (household/entity)",
      foreignKey: "Account Group Number"
    },
    {
      relatedEntity: "Customer to Account Relationship",
      relationshipType: "One-to-Many",
      businessDescription: "An account can have multiple customer relationships (owners, signers)",
      foreignKey: "Account Number"
    },
    {
      relatedEntity: "Daily Balance",
      relationshipType: "One-to-Many",
      businessDescription: "An account has daily balance snapshots",
      foreignKey: "Account Number"
    },
    {
      relatedEntity: "Transaction",
      relationshipType: "One-to-Many",
      businessDescription: "An account has multiple financial transactions",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// ACCOUNT GROUP ENTITY
// ============================================================================
export const accountGroupEntity: LogicalEntity = {
  entityName: "Account Group",
  businessDefinition: "Grouping of related accounts for a customer or household, enabling combined statement and relationship management",
  businessOwner: "Customer Operations",
  
  attributes: [
    {
      attributeName: "Account Group Number",
      businessDefinition: "Unique identifier for the account group",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: [
        "Must be unique across all account groups",
        "Cannot be changed once assigned"
      ]
    },
    {
      attributeName: "Tax ID",
      businessDefinition: "Primary tax identification number for the account group",
      dataType: "Encrypted Alphanumeric",
      isMandatory: true,
      businessRules: [
        "PII - must be encrypted at rest and in transit",
        "Required for IRS reporting (1099-INT)",
        "Format validation based on tax ID type"
      ]
    },
    {
      attributeName: "Customer Short Name",
      businessDefinition: "Abbreviated name for statements and correspondence",
      dataType: "Text",
      isMandatory: true,
      businessRules: [
        "Maximum 50 characters",
        "Used on statements and notices"
      ]
    },
    {
      attributeName: "Account Class",
      businessDefinition: "Classification for relationship management (Personal, Business, Trust)",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: PERSONAL, BUSINESS, TRUST, NON_PROFIT",
        "Determines reporting and regulatory requirements"
      ],
      exampleValues: ["PERSONAL", "BUSINESS", "TRUST"]
    },
    {
      attributeName: "Combined Statement Indicator",
      businessDefinition: "Flag indicating if accounts in group receive combined statements",
      dataType: "Boolean",
      isMandatory: true,
      businessRules: [
        "When true, all accounts in group appear on single statement",
        "Reduces mailing costs and improves customer experience"
      ]
    },
    {
      attributeName: "Risk Rating",
      businessDefinition: "AML/BSA risk rating for the account group",
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
    "Each Account Group must have a unique identifier",
    "Tax ID is required for interest reporting compliance",
    "Risk Rating drives AML monitoring rules and transaction limits",
    "Account Class determines applicable products and services",
    "Combined statements can only be produced for groups with same mailing address"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master",
      relationshipType: "One-to-Many",
      businessDescription: "An account group can contain multiple deposit accounts",
      foreignKey: "Account Group Number"
    },
    {
      relatedEntity: "Customer Master (Customer Domain)",
      relationshipType: "Many-to-Many",
      businessDescription: "Account groups can have multiple customers, customers can have multiple groups",
      foreignKey: "Customer Number"
    }
  ]
};

// ============================================================================
// DAILY BALANCE ENTITY
// ============================================================================
export const dailyBalanceEntity: LogicalEntity = {
  entityName: "Daily Balance",
  businessDefinition: "Daily snapshot of account balances including ledger, available, and collected balances",
  businessOwner: "Deposit Operations",
  
  attributes: [
    {
      attributeName: "Account Number",
      businessDefinition: "Reference to the deposit account",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master"]
    },
    {
      attributeName: "Balance Date",
      businessDefinition: "Business date for which the balance is reported",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Combination of Account Number and Balance Date must be unique",
        "Cannot be future dated"
      ]
    },
    {
      attributeName: "Ledger Balance",
      businessDefinition: "Total account balance including all posted transactions",
      dataType: "Decimal",
      isMandatory: true,
      businessRules: [
        "Sum of all debits and credits",
        "Used for interest calculations"
      ]
    },
    {
      attributeName: "Available Balance",
      businessDefinition: "Ledger balance minus holds and pending restrictions",
      dataType: "Decimal",
      isMandatory: true,
      businessRules: [
        "Cannot be greater than ledger balance",
        "Used for withdrawal authorization"
      ]
    },
    {
      attributeName: "Collected Balance",
      businessDefinition: "Amount available after float/availability holds clear",
      dataType: "Decimal",
      isMandatory: true,
      businessRules: [
        "Used for earnings credit calculations",
        "Factors in deposit float schedules"
      ]
    },
    {
      attributeName: "Interest Paid MTD",
      businessDefinition: "Interest paid month-to-date",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: ["Resets to zero at month end"]
    },
    {
      attributeName: "Interest Paid YTD",
      businessDefinition: "Interest paid year-to-date",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: ["Resets to zero at year end", "Used for 1099-INT reporting"]
    },
    {
      attributeName: "Average Ledger Balance MTD",
      businessDefinition: "Month-to-date average ledger balance",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: ["Calculated as sum of daily balances / days in month"]
    }
  ],
  
  businessRules: [
    "Daily balance records are created for each business day",
    "Available Balance = Ledger Balance - Holds - Float",
    "Interest calculations use ledger balance and applicable interest rate",
    "Weekend and holiday balances carry forward from previous business day",
    "Average balances used for fee waivers and tier qualification"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple daily balances for one account",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// HOLD TRANSACTION ENTITY
// ============================================================================
export const holdTransactionEntity: LogicalEntity = {
  entityName: "Hold Transaction",
  businessDefinition: "Temporary restrictions placed on account funds for compliance, fraud prevention, or availability management",
  businessOwner: "Operations Risk Management",
  
  attributes: [
    {
      attributeName: "Account Number",
      businessDefinition: "Reference to the deposit account",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master"]
    },
    {
      attributeName: "Hold ID",
      businessDefinition: "Unique identifier for the hold transaction",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must be unique within account"]
    },
    {
      attributeName: "Hold Type",
      businessDefinition: "Classification of hold reason",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: CHECK_HOLD, LEGAL_HOLD, FRAUD_HOLD, AVAILABILITY_HOLD",
        "Determines release rules and authorization requirements"
      ],
      exampleValues: ["CHECK_HOLD", "LEGAL_HOLD", "FRAUD_HOLD"]
    },
    {
      attributeName: "Hold Amount",
      businessDefinition: "Dollar amount of funds placed on hold",
      dataType: "Decimal",
      isMandatory: true,
      businessRules: [
        "Must be positive",
        "Cannot exceed available balance at time of placement"
      ]
    },
    {
      attributeName: "Hold Reason",
      businessDefinition: "Detailed explanation for the hold",
      dataType: "Text",
      isMandatory: true,
      businessRules: ["Required for compliance and customer service"]
    },
    {
      attributeName: "Entered Date",
      businessDefinition: "Date when hold was placed",
      dataType: "Date",
      isMandatory: true,
      businessRules: ["Cannot be future dated"]
    },
    {
      attributeName: "Expiration Date",
      businessDefinition: "Date when hold automatically releases",
      dataType: "Date",
      isMandatory: false,
      businessRules: [
        "Must be after entered date",
        "Required for availability holds per Reg CC"
      ]
    }
  ],
  
  businessRules: [
    "Holds reduce available balance but not ledger balance",
    "Legal holds require court order documentation",
    "Check holds follow Regulation CC availability schedules",
    "Fraud holds require management override to release",
    "Expired holds automatically release during nightly processing",
    "Multiple holds can exist simultaneously on same account"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple holds can exist for one account",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// ACCOUNT PACKAGE ENTITY
// ============================================================================
export const accountPackageEntity: LogicalEntity = {
  entityName: "Account Package",
  businessDefinition: "Bundled product offering that combines multiple accounts with benefits, fee waivers, and tiered services",
  businessOwner: "Product Management",
  
  attributes: [
    {
      attributeName: "Package ID",
      businessDefinition: "Unique identifier for the account package",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must be unique across all packages"]
    },
    {
      attributeName: "Package Name",
      businessDefinition: "Marketing name for the package offering",
      dataType: "Text",
      isMandatory: true,
      businessRules: ["Must align with product marketing materials"],
      exampleValues: ["Premium Banking", "Business Advantage", "Student Package"]
    },
    {
      attributeName: "Account Number",
      businessDefinition: "Account enrolled in the package",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master"]
    },
    {
      attributeName: "Tier Level",
      businessDefinition: "Service tier within the package based on balance or relationship",
      dataType: "Code",
      isMandatory: false,
      businessRules: [
        "Valid values: STANDARD, PREFERRED, PREMIUM, PRIVATE",
        "Determines fee waivers and enhanced services"
      ],
      exampleValues: ["STANDARD", "PREFERRED", "PREMIUM"]
    },
    {
      attributeName: "Enrollment Date",
      businessDefinition: "Date when account was enrolled in package",
      dataType: "Date",
      isMandatory: true,
      businessRules: ["Cannot be before account open date"]
    }
  ],
  
  businessRules: [
    "Package enrollment can provide fee waivers on multiple accounts",
    "Tier levels determined by combined balance across package accounts",
    "Customers can change packages with proper notification",
    "Package benefits apply to all accounts in the relationship",
    "Tier upgrades/downgrades processed monthly based on average balances"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master",
      relationshipType: "Many-to-Many",
      businessDescription: "Packages can include multiple accounts, accounts can be in multiple packages",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// DEBIT CARD ENTITY
// ============================================================================
export const debitCardEntity: LogicalEntity = {
  entityName: "Debit Card",
  businessDefinition: "Payment card linked to deposit account for ATM access and point-of-sale transactions",
  businessOwner: "Card Services",
  
  attributes: [
    {
      attributeName: "Card Number",
      businessDefinition: "16-digit card number (encrypted)",
      dataType: "Encrypted Alphanumeric",
      isMandatory: true,
      businessRules: [
        "PCI DSS compliance required",
        "Must be encrypted at rest and in transit",
        "Unique across all cards"
      ]
    },
    {
      attributeName: "Account Number",
      businessDefinition: "Linked deposit account for transaction funding",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master"]
    },
    {
      attributeName: "Card Type",
      businessDefinition: "Classification of card (Primary, Secondary)",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "PRIMARY cards belong to account owner",
        "SECONDARY cards for authorized users"
      ],
      exampleValues: ["PRIMARY", "SECONDARY"]
    },
    {
      attributeName: "Card Status",
      businessDefinition: "Current operational status of the card",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: ACTIVE, INACTIVE, LOST, STOLEN, CLOSED",
        "LOST/STOLEN cards are immediately blocked"
      ],
      exampleValues: ["ACTIVE", "LOST", "STOLEN", "CLOSED"]
    },
    {
      attributeName: "Expiration Date",
      businessDefinition: "Card expiration month and year",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Cards automatically reissued 30 days before expiration",
        "Expired cards decline at authorization"
      ]
    },
    {
      attributeName: "Issue Date",
      businessDefinition: "Date when card was issued or reissued",
      dataType: "Date",
      isMandatory: true,
      businessRules: ["Tracked for card lifecycle management"]
    }
  ],
  
  businessRules: [
    "Each card must be linked to an active deposit account",
    "Card numbers are PCI DSS protected and encrypted",
    "Daily ATM withdrawal limits enforced at authorization",
    "Lost or stolen cards must be reported and replaced immediately",
    "Card status changes trigger real-time authorization network updates",
    "Multiple cards can link to same account (primary + authorized users)"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple cards can link to one account",
      foreignKey: "Account Number"
    },
    {
      relatedEntity: "Transaction (Transactions Domain)",
      relationshipType: "One-to-Many",
      businessDescription: "Cards generate ATM and POS transactions",
      foreignKey: "Card Number"
    }
  ]
};

// ============================================================================
// LOGICAL MODEL SUMMARY
// ============================================================================
export const depositsLogicalModel = {
  domainName: "Deposits",
  version: "1.0",
  lastUpdated: "2024",
  entities: [
    accountMasterEntity,
    accountGroupEntity,
    dailyBalanceEntity,
    holdTransactionEntity,
    accountPackageEntity,
    debitCardEntity
  ],
  entityCount: 6,
  businessOwners: ["Deposit Operations", "Customer Operations", "Operations Risk Management", "Product Management", "Card Services"],
  dataClassification: "PII - High Sensitivity (Tax ID, Card Numbers)",
  retentionPolicy: "7 years after account closure, per regulatory requirements (Reg D, Reg CC, BSA/AML)",
  regulatoryCompliance: [
    "Regulation D - Reserve Requirements",
    "Regulation CC - Funds Availability",
    "Regulation E - Electronic Fund Transfers",
    "BSA/AML - Transaction Monitoring",
    "Regulation P - Privacy of Consumer Financial Information"
  ]
};

export default depositsLogicalModel;
