/**
 * TRANSACTIONS DOMAIN - BRONZE LAYER - LOGICAL DATA MODEL
 * 
 * Business entities and their relationships from FIS source system
 * This represents the conceptual model before physical implementation
 * 
 * Source System: FIS Core Banking
 * Domain: Transactions
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
// TRANSACTION MASTER ENTITY
// ============================================================================
export const transactionMasterEntity: LogicalEntity = {
  entityName: "Transaction Master",
  businessDefinition: "Core transaction entity representing all financial movements across deposit accounts including deposits, withdrawals, transfers, fees, and interest",
  businessOwner: "Transaction Operations",
  
  attributes: [
    {
      attributeName: "Transaction ID",
      businessDefinition: "Unique system-generated identifier for each transaction",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: [
        "Must be unique across all transactions",
        "System-generated sequence number",
        "Cannot be changed once assigned"
      ]
    },
    {
      attributeName: "Account Number",
      businessDefinition: "Deposit account affected by the transaction",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: [
        "Must exist in Account Master (Deposits domain)",
        "Required for transaction posting"
      ]
    },
    {
      attributeName: "Transaction Code",
      businessDefinition: "Standardized code identifying the transaction type",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Must be from approved transaction code table",
        "Determines GL account mapping and reporting category"
      ],
      exampleValues: ["DEP", "WD", "INT", "FEE", "XFER", "ACH", "ATM"]
    },
    {
      attributeName: "Transaction Description",
      businessDefinition: "Human-readable description of the transaction",
      dataType: "Text",
      isMandatory: true,
      businessRules: [
        "Appears on customer statements",
        "Maximum 70 characters"
      ],
      exampleValues: ["ATM Withdrawal", "Direct Deposit", "Monthly Service Fee", "Interest Credit"]
    },
    {
      attributeName: "Transaction Amount",
      businessDefinition: "Dollar amount of the transaction",
      dataType: "Decimal",
      isMandatory: true,
      businessRules: [
        "Must be non-zero",
        "Sign indicates debit (negative) or credit (positive)",
        "Precision: 2 decimal places"
      ]
    },
    {
      attributeName: "Debit/Credit Indicator",
      businessDefinition: "Flag indicating if transaction debits or credits the account",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: DEBIT, CREDIT",
        "DEBIT decreases balance, CREDIT increases balance"
      ],
      exampleValues: ["DEBIT", "CREDIT"]
    },
    {
      attributeName: "Transaction Date",
      businessDefinition: "Date when the transaction was initiated or entered",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Cannot be future dated beyond current business date",
        "Used for customer-facing reporting"
      ]
    },
    {
      attributeName: "Effective Date",
      businessDefinition: "Date when transaction impacts account balance",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Used for interest calculations and balance reporting",
        "Can differ from transaction date for backdated corrections"
      ]
    },
    {
      attributeName: "Post Date",
      businessDefinition: "Date when transaction was posted to the account ledger",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "System-assigned during batch posting",
        "Typically current business date"
      ]
    },
    {
      attributeName: "Delivery Channel",
      businessDefinition: "Channel through which transaction was initiated",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: BRANCH, ATM, ONLINE, MOBILE, ACH, WIRE, IVR",
        "Used for channel analytics and fraud detection"
      ],
      exampleValues: ["BRANCH", "ATM", "ONLINE", "MOBILE", "ACH"]
    }
  ],
  
  businessRules: [
    "Each transaction must have a unique Transaction ID",
    "Transaction Code determines general ledger posting",
    "Effective Date determines impact on interest calculations",
    "Debit transactions reduce account balance, Credit transactions increase balance",
    "Transactions are immutable once posted; corrections require reversing entries",
    "All monetary transactions subject to BSA/AML monitoring thresholds",
    "Transaction history retained for 7 years per regulatory requirements"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master (Deposits Domain)",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple transactions post to one account",
      foreignKey: "Account Number"
    },
    {
      relatedEntity: "Transaction Float",
      relationshipType: "One-to-One",
      businessDescription: "Each transaction may have associated float schedule",
      foreignKey: "Transaction ID"
    },
    {
      relatedEntity: "ACH Transaction Detail",
      relationshipType: "One-to-One",
      businessDescription: "ACH transactions have additional detail records",
      foreignKey: "Transaction ID"
    }
  ]
};

// ============================================================================
// TRANSACTION FLOAT ENTITY
// ============================================================================
export const transactionFloatEntity: LogicalEntity = {
  entityName: "Transaction Float",
  businessDefinition: "Availability schedule for deposited items showing when funds become available per Regulation CC",
  businessOwner: "Deposit Operations",
  
  attributes: [
    {
      attributeName: "Transaction ID",
      businessDefinition: "Reference to the parent transaction",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must exist in Transaction Master"]
    },
    {
      attributeName: "Float Day 1 Amount",
      businessDefinition: "Amount available on day 1 after deposit",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: ["Sum of all float day amounts should equal transaction amount"]
    },
    {
      attributeName: "Float Day 2 Amount",
      businessDefinition: "Additional amount available on day 2",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: ["Cumulative availability increases each day"]
    },
    {
      attributeName: "Float Day 3-12 Amounts",
      businessDefinition: "Progressive availability through day 12",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: [
        "Float schedules extend up to 12 days for certain deposit types",
        "Most deposits clear within 2-5 business days"
      ]
    },
    {
      attributeName: "Total Float Amount",
      businessDefinition: "Total amount subject to availability delay",
      dataType: "Decimal",
      isMandatory: true,
      businessRules: ["Should equal deposit amount for check deposits"]
    }
  ],
  
  businessRules: [
    "Float schedules follow Regulation CC availability requirements",
    "Local checks typically have 2-day float, non-local checks 5-day float",
    "First $225 of check deposits available next business day",
    "ATM deposits may have extended holds",
    "New accounts subject to extended availability periods",
    "Float amounts reduce daily as funds become available"
  ],
  
  relationships: [
    {
      relatedEntity: "Transaction Master",
      relationshipType: "One-to-One",
      businessDescription: "Float detail for deposit transactions",
      foreignKey: "Transaction ID"
    }
  ]
};

// ============================================================================
// STOP PAYMENT ENTITY
// ============================================================================
export const stopPaymentEntity: LogicalEntity = {
  entityName: "Stop Payment",
  businessDefinition: "Customer request to prevent payment of a specific check or range of checks",
  businessOwner: "Operations Risk Management",
  
  attributes: [
    {
      attributeName: "Stop Payment ID",
      businessDefinition: "Unique identifier for the stop payment request",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must be unique within account"]
    },
    {
      attributeName: "Account Number",
      businessDefinition: "Account on which stop payment is placed",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master"]
    },
    {
      attributeName: "Check Number Start",
      businessDefinition: "Beginning check number for stop payment range",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must be valid check number format"]
    },
    {
      attributeName: "Check Number End",
      businessDefinition: "Ending check number for stop payment range",
      dataType: "Numeric",
      isMandatory: false,
      businessRules: [
        "If provided, must be >= Check Number Start",
        "Single check stops have same start and end"
      ]
    },
    {
      attributeName: "Stop Amount",
      businessDefinition: "Exact or maximum amount of check being stopped",
      dataType: "Decimal",
      isMandatory: false,
      businessRules: ["If provided, must match exactly for stop to trigger"]
    },
    {
      attributeName: "Payee Name",
      businessDefinition: "Name of the check payee",
      dataType: "Text",
      isMandatory: false,
      businessRules: ["Additional matching criteria for stop payment"]
    },
    {
      attributeName: "Stop Reason",
      businessDefinition: "Reason for stop payment request",
      dataType: "Text",
      isMandatory: true,
      businessRules: ["Required for audit and dispute resolution"],
      exampleValues: ["Lost check", "Fraudulent activity", "Dispute with payee", "Incorrect amount"]
    },
    {
      attributeName: "Entered Date",
      businessDefinition: "Date when stop payment was requested",
      dataType: "Date",
      isMandatory: true,
      businessRules: ["Cannot be future dated"]
    },
    {
      attributeName: "Expiration Date",
      businessDefinition: "Date when stop payment automatically expires",
      dataType: "Date",
      isMandatory: true,
      businessRules: [
        "Typically 6 months from entered date per UCC",
        "Can be renewed by customer before expiration"
      ]
    },
    {
      attributeName: "Stop Type",
      businessDefinition: "Classification of stop payment",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: SINGLE_CHECK, CHECK_RANGE, ACH_STOP",
        "Determines matching logic during check processing"
      ],
      exampleValues: ["SINGLE_CHECK", "CHECK_RANGE", "ACH_STOP"]
    }
  ],
  
  businessRules: [
    "Stop payments are subject to service fees unless waived",
    "Verbal stop payments valid for 14 days, written stops for 6 months",
    "Stop payments can be renewed before expiration",
    "Expired stops automatically removed from active monitoring",
    "Bank not liable if check pays due to stop payment error by customer",
    "Stop payments processed in real-time during check clearing"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master (Deposits Domain)",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple stop payments can exist for one account",
      foreignKey: "Account Number"
    },
    {
      relatedEntity: "Transaction Master",
      relationshipType: "One-to-Many",
      businessDescription: "Stop payment may generate fee transactions",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// MAINTENANCE TRANSACTION ENTITY
// ============================================================================
export const maintenanceTransactionEntity: LogicalEntity = {
  entityName: "Maintenance Transaction",
  businessDefinition: "Non-monetary account maintenance activities including holds, status changes, and account updates",
  businessOwner: "Operations Support",
  
  attributes: [
    {
      attributeName: "Maintenance ID",
      businessDefinition: "Unique identifier for the maintenance transaction",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must be unique across all maintenance transactions"]
    },
    {
      attributeName: "Account Number",
      businessDefinition: "Account affected by maintenance activity",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must exist in Account Master"]
    },
    {
      attributeName: "Transaction Code",
      businessDefinition: "Code identifying type of maintenance",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Must be from maintenance transaction code table",
        "Determines workflow and authorization requirements"
      ],
      exampleValues: ["HOLD_PLACE", "HOLD_RELEASE", "ADDRESS_CHANGE", "NAME_CHANGE", "STATUS_CHANGE"]
    },
    {
      attributeName: "Old Value",
      businessDefinition: "Previous value before maintenance change",
      dataType: "Text",
      isMandatory: false,
      businessRules: ["Required for audit trail on data changes"]
    },
    {
      attributeName: "New Value",
      businessDefinition: "Updated value after maintenance change",
      dataType: "Text",
      isMandatory: false,
      businessRules: ["Required for audit trail on data changes"]
    },
    {
      attributeName: "Maintenance Description",
      businessDefinition: "Detailed description of the maintenance activity",
      dataType: "Text",
      isMandatory: true,
      businessRules: ["Provides context for audit and customer service"]
    },
    {
      attributeName: "User ID",
      businessDefinition: "Employee or system ID that performed the maintenance",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must be valid employee or system ID"]
    },
    {
      attributeName: "Transaction Date",
      businessDefinition: "Date when maintenance was performed",
      dataType: "Date",
      isMandatory: true,
      businessRules: ["System-assigned, cannot be backdated"]
    },
    {
      attributeName: "Authorization Level",
      businessDefinition: "Required authorization level for the change",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: TELLER, SUPERVISOR, MANAGER, SYSTEM",
        "Ensures proper segregation of duties"
      ],
      exampleValues: ["TELLER", "SUPERVISOR", "MANAGER"]
    }
  ],
  
  businessRules: [
    "All maintenance transactions create audit trail entries",
    "Certain changes require dual authorization",
    "Account name changes require documentation verification",
    "Status changes may trigger customer notifications",
    "System-generated maintenance logged with SYSTEM user ID",
    "Maintenance history retained for regulatory compliance"
  ],
  
  relationships: [
    {
      relatedEntity: "Account Master (Deposits Domain)",
      relationshipType: "Many-to-One",
      businessDescription: "Multiple maintenance transactions for one account",
      foreignKey: "Account Number"
    }
  ]
};

// ============================================================================
// ACH TRANSACTION DETAIL ENTITY
// ============================================================================
export const achTransactionDetailEntity: LogicalEntity = {
  entityName: "ACH Transaction Detail",
  businessDefinition: "Automated Clearing House transaction details for electronic fund transfers including direct deposits and payments",
  businessOwner: "ACH Operations",
  
  attributes: [
    {
      attributeName: "Transaction ID",
      businessDefinition: "Reference to parent transaction in Transaction Master",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must exist in Transaction Master"]
    },
    {
      attributeName: "ACH Trace ID",
      businessDefinition: "NACHA-assigned trace number for ACH transaction",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: [
        "Unique identifier for ACH network",
        "Used for returns and exception processing"
      ]
    },
    {
      attributeName: "Company ID",
      businessDefinition: "Originating company identification number",
      dataType: "Alphanumeric",
      isMandatory: true,
      businessRules: ["Must be valid IRS Employer Identification Number"]
    },
    {
      attributeName: "Company Name",
      businessDefinition: "Name of the originating company",
      dataType: "Text",
      isMandatory: true,
      businessRules: ["Appears on customer statement"]
    },
    {
      attributeName: "Entry Class Code",
      businessDefinition: "NACHA standard entry class code",
      dataType: "Code",
      isMandatory: true,
      businessRules: [
        "Valid values: PPD, CCD, WEB, TEL, CTX, etc.",
        "Determines authorization requirements and return rights"
      ],
      exampleValues: ["PPD", "CCD", "WEB", "TEL"]
    },
    {
      attributeName: "Individual ID",
      businessDefinition: "Receiver's identification number",
      dataType: "Alphanumeric",
      isMandatory: false,
      businessRules: ["May contain customer account number or other identifier"]
    },
    {
      attributeName: "Addenda Record",
      businessDefinition: "Optional additional information about the transaction",
      dataType: "Text",
      isMandatory: false,
      businessRules: ["Up to 80 characters of additional detail"]
    },
    {
      attributeName: "Originating DFI",
      businessDefinition: "Routing number of originating financial institution",
      dataType: "Numeric",
      isMandatory: true,
      businessRules: ["Must be valid 9-digit ABA routing number"]
    }
  ],
  
  businessRules: [
    "ACH transactions follow NACHA Operating Rules",
    "Unauthorized ACH can be returned within 60 days",
    "Entry Class Code determines return timeframes and authorization",
    "ACH Trace ID required for network-level research and returns",
    "Company ID validated against ACH originator database",
    "Prenote transactions validate account before live debits",
    "Returns must include original ACH Trace ID"
  ],
  
  relationships: [
    {
      relatedEntity: "Transaction Master",
      relationshipType: "One-to-One",
      businessDescription: "Additional detail for ACH transactions",
      foreignKey: "Transaction ID"
    }
  ]
};

// ============================================================================
// LOGICAL MODEL SUMMARY
// ============================================================================
export const transactionsLogicalModel = {
  domainName: "Transactions",
  version: "1.0",
  lastUpdated: "2024",
  entities: [
    transactionMasterEntity,
    transactionFloatEntity,
    stopPaymentEntity,
    maintenanceTransactionEntity,
    achTransactionDetailEntity
  ],
  entityCount: 5,
  businessOwners: ["Transaction Operations", "Deposit Operations", "Operations Risk Management", "Operations Support", "ACH Operations"],
  dataClassification: "Confidential - Customer Financial Data",
  retentionPolicy: "7 years for all transaction records per BSA/AML and tax reporting requirements",
  regulatoryCompliance: [
    "Regulation E - Electronic Fund Transfer Dispute Rights",
    "Regulation CC - Funds Availability",
    "NACHA Operating Rules - ACH Network",
    "UCC Article 4 - Bank Deposits and Collections",
    "BSA/AML - Currency Transaction Reporting (CTR) and Suspicious Activity Reporting (SAR)",
    "Regulation P - Privacy of Consumer Financial Information"
  ],
  volumeProfile: {
    dailyTransactions: "2-5 million",
    peakHours: "8 AM - 11 AM, 5 PM - 8 PM",
    seasonalPeaks: "Tax season (Jan-Apr), Holiday shopping (Nov-Dec)",
    retentionYears: 7
  }
};

export default transactionsLogicalModel;
