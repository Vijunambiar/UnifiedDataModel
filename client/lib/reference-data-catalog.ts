/**
 * REFERENCE DATA CATALOG
 * Foundational data model elements: relationship types, application statuses, enumerations
 */

export interface ReferenceDataCategory {
  id: string;
  name: string;
  description: string;
  domain: string[];
  values: ReferenceDataValue[];
}

export interface ReferenceDataValue {
  code: string;
  name: string;
  description: string;
  businessRules?: string[];
  examples?: string[];
  upstreamSource?: string;
}

export const referenceDataCatalog: ReferenceDataCategory[] = [
  {
    id: "customer-relationship-types",
    name: "Customer Relationship Types",
    description: "Types of relationships between customers (account holders, beneficiaries, authorized signers)",
    domain: ["customer-retail", "deposits-retail", "loans-retail"],
    values: [
      {
        code: "JOINT_OWNER",
        name: "Joint Account Owner",
        description: "Customer with equal ownership rights to an account",
        businessRules: [
          "Both parties have full withdrawal authority",
          "Requires both signatures for certain transactions based on account settings",
          "Equal liability for overdrafts and fees"
        ],
        examples: ["Married couples with joint checking", "Business partners with joint savings"],
        upstreamSource: "Core Banking System - Account Setup Module"
      },
      {
        code: "BENEFICIARY",
        name: "Beneficiary",
        description: "Person designated to receive account funds upon primary holder's death",
        businessRules: [
          "Primary beneficiary receives full distribution unless percentage specified",
          "Contingent beneficiary receives if primary is deceased",
          "Requires death certificate to process distribution"
        ],
        examples: ["Spouse as beneficiary on IRA", "Children as beneficiaries on life insurance"],
        upstreamSource: "Core Banking System - Beneficiary Module"
      },
      {
        code: "AUTHORIZED_SIGNER",
        name: "Authorized Signer",
        description: "Person with authority to conduct transactions but no ownership rights",
        businessRules: [
          "Can make withdrawals and deposits",
          "Cannot change account ownership or close account",
          "Authority can be limited (e.g., maximum transaction amount)"
        ],
        examples: ["Adult child managing elderly parent's account", "Office manager on business account"],
        upstreamSource: "Core Banking System - Signatory Management"
      },
      {
        code: "POA",
        name: "Power of Attorney",
        description: "Legal authority to act on behalf of account owner",
        businessRules: [
          "Requires legal POA document on file",
          "Can perform all account functions based on POA scope",
          "Authority terminates on account holder's death (unless durable POA)"
        ],
        examples: ["Attorney managing disabled person's finances"],
        upstreamSource: "Legal Documentation System"
      },
      {
        code: "GUARDIAN",
        name: "Legal Guardian",
        description: "Court-appointed guardian for minor or incapacitated person",
        businessRules: [
          "Requires court order documentation",
          "Full fiduciary responsibility",
          "May require court approval for large withdrawals"
        ],
        examples: ["Parent as guardian on minor's UTMA account"],
        upstreamSource: "Legal Documentation System"
      },
      {
        code: "CUSTODIAN",
        name: "Custodian",
        description: "Adult managing account on behalf of minor (UTMA/UGMA)",
        businessRules: [
          "Control transfers to minor at age of majority (18-21 depending on state)",
          "Must act in minor's best interest",
          "Taxable income attributed to minor"
        ],
        examples: ["Parent managing child's savings account"],
        upstreamSource: "Core Banking System - Custodial Account Module"
      }
    ]
  },
  {
    id: "account-application-status",
    name: "Account Application Status",
    description: "Lifecycle stages of account opening application from initial contact to account activation",
    domain: ["deposits-retail", "loans-retail", "cards-retail"],
    values: [
      {
        code: "MARKETING_MAILER",
        name: "Marketing Mailer Sent",
        description: "Pre-filled application sent via direct mail",
        businessRules: [
          "Tracking code links mailer to eventual application",
          "Offer valid for 30-60 days typically"
        ],
        examples: ["Pre-approved credit card offer", "High-yield savings account promotion"],
        upstreamSource: "Marketing Automation Platform"
      },
      {
        code: "LEAD_GENERATED",
        name: "Lead Generated",
        description: "Prospect expressed interest but hasn't started application",
        businessRules: [
          "Captured via web form, branch visit, or phone inquiry",
          "Assigned to sales/retention team for follow-up",
          "Expires after 90 days if no activity"
        ],
        examples: ["Website form submission", "Branch inquiry about mortgage"],
        upstreamSource: "CRM System - Lead Management"
      },
      {
        code: "APPLICATION_STARTED",
        name: "Application Started",
        description: "Customer began but hasn't completed application",
        businessRules: [
          "Save-and-resume functionality available for 30 days",
          "Automated reminders sent at 24hr, 3 day, 7 day intervals",
          "Partial data captured for marketing analysis"
        ],
        examples: ["Online application abandoned at ID verification"],
        upstreamSource: "Digital Account Opening Platform"
      },
      {
        code: "APPLICATION_SUBMITTED",
        name: "Application Submitted",
        description: "Complete application submitted for review",
        businessRules: [
          "All required fields completed",
          "Customer disclosure acknowledgments captured",
          "Automated decisioning rules applied for eligible products"
        ],
        examples: ["Checking account application submitted online"],
        upstreamSource: "Account Opening System"
      },
      {
        code: "PENDING_VERIFICATION",
        name: "Pending Verification",
        description: "Application requires identity or document verification",
        businessRules: [
          "ID scan upload required for online applications",
          "Address verification via credit bureau",
          "ChexSystems or Early Warning Services check for deposit accounts"
        ],
        examples: ["ID verification flagged for manual review"],
        upstreamSource: "Identity Verification Service"
      },
      {
        code: "PENDING_APPROVAL",
        name: "Pending Approval",
        description: "Application in underwriting or manual review queue",
        businessRules: [
          "Assigned to underwriter/relationship manager",
          "SLA: 24-48 hours for standard products, 3-5 days for complex products",
          "May request additional documentation"
        ],
        examples: ["High-value account flagged for AML review"],
        upstreamSource: "Underwriting Workbench"
      },
      {
        code: "APPROVED",
        name: "Approved",
        description: "Application approved, pending customer acceptance",
        businessRules: [
          "Account terms finalized and disclosed",
          "Customer has 7-14 days to accept or decline",
          "Initial funding instructions provided"
        ],
        examples: ["Credit card approved with $5,000 limit"],
        upstreamSource: "Decisioning Engine"
      },
      {
        code: "APPROVED_CONDITIONAL",
        name: "Conditionally Approved",
        description: "Approved subject to additional conditions or documentation",
        businessRules: [
          "Conditions must be satisfied within specified timeframe",
          "Common conditions: proof of income, asset verification, co-signer required"
        ],
        examples: ["Loan approved pending appraisal report"],
        upstreamSource: "Underwriting System"
      },
      {
        code: "FUNDING_PENDING",
        name: "Funding Pending",
        description: "Account opened, awaiting initial deposit",
        businessRules: [
          "Account number assigned but not yet active",
          "Funding must occur within 30 days to avoid closure",
          "ACH, wire, check, or in-branch cash deposit accepted"
        ],
        examples: ["New checking account awaiting initial $25 deposit"],
        upstreamSource: "Core Banking System"
      },
      {
        code: "ACCOUNT_ACTIVE",
        name: "Account Active",
        description: "Account fully opened and operational",
        businessRules: [
          "Customer can perform all account functions",
          "Debit card issued (3-5 business days)",
          "Online/mobile banking credentials activated"
        ],
        examples: ["Checking account with $500 balance"],
        upstreamSource: "Core Banking System"
      },
      {
        code: "DECLINED",
        name: "Declined",
        description: "Application denied",
        businessRules: [
          "Adverse action notice sent within 30 days (Reg B)",
          "Reason codes provided (e.g., insufficient credit history)",
          "Customer can reapply after 60-90 days"
        ],
        examples: ["Credit card declined due to low credit score"],
        upstreamSource: "Decisioning Engine"
      },
      {
        code: "WITHDRAWN",
        name: "Withdrawn",
        description: "Customer withdrew application",
        businessRules: [
          "Customer initiated cancellation",
          "No adverse action notice required",
          "Data retained for 25 months per ECOA"
        ],
        examples: ["Customer found better rate elsewhere"],
        upstreamSource: "Account Opening System"
      },
      {
        code: "EXPIRED",
        name: "Expired",
        description: "Application expired due to inactivity",
        businessRules: [
          "Typically 30-60 day expiration window",
          "Customer can restart application with updated information"
        ],
        examples: ["Pre-approval offer not acted upon within 60 days"],
        upstreamSource: "Application Management System"
      }
    ]
  },
  {
    id: "customer-lifecycle-stage",
    name: "Customer Lifecycle Stage",
    description: "Customer journey stages from acquisition to retention",
    domain: ["customer-retail", "marketing-retail"],
    values: [
      {
        code: "PROSPECT",
        name: "Prospect",
        description: "Potential customer not yet acquired",
        businessRules: [
          "Marketing campaigns targeted at acquisition",
          "No accounts or relationships yet"
        ],
        examples: ["Lead from marketing campaign"],
        upstreamSource: "CRM - Lead Management"
      },
      {
        code: "NEW_CUSTOMER",
        name: "New Customer",
        description: "Customer acquired within last 90 days",
        businessRules: [
          "Onboarding campaigns active",
          "Focused on first product engagement"
        ],
        examples: ["Customer opened first checking account 30 days ago"],
        upstreamSource: "Customer Lifecycle Engine"
      },
      {
        code: "GROWING",
        name: "Growing",
        description: "Actively adding products and deepening relationship",
        businessRules: [
          "Cross-sell opportunities prioritized",
          "Product penetration increasing"
        ],
        examples: ["Customer added savings, then credit card within 6 months"],
        upstreamSource: "Customer Lifecycle Engine"
      },
      {
        code: "MATURE",
        name: "Mature",
        description: "Stable, multi-product relationship",
        businessRules: [
          "Retention-focused marketing",
          "Premium service offerings"
        ],
        examples: ["Customer with 4+ products for 3+ years"],
        upstreamSource: "Customer Lifecycle Engine"
      },
      {
        code: "DECLINING",
        name: "Declining",
        description: "Reducing engagement or products",
        businessRules: [
          "At-risk for attrition",
          "Retention campaigns triggered"
        ],
        examples: ["Balance declining, closed one product"],
        upstreamSource: "Customer Lifecycle Engine"
      },
      {
        code: "DORMANT",
        name: "Dormant",
        description: "No activity for 6+ months",
        businessRules: [
          "Reactivation campaigns",
          "Account maintenance fees may apply"
        ],
        examples: ["No transactions in 180 days"],
        upstreamSource: "Customer Activity Monitor"
      }
    ]
  },
  {
    id: "account-status",
    name: "Account Status",
    description: "Operational status of deposit and loan accounts",
    domain: ["deposits-retail", "loans-retail"],
    values: [
      {
        code: "ACTIVE",
        name: "Active",
        description: "Account is open and operational",
        businessRules: [
          "All transactions permitted",
          "Statements generated monthly"
        ],
        upstreamSource: "Core Banking System"
      },
      {
        code: "FROZEN",
        name: "Frozen",
        description: "Account temporarily restricted",
        businessRules: [
          "No withdrawals permitted",
          "Deposits may be allowed",
          "Typically due to fraud investigation or legal hold"
        ],
        upstreamSource: "Core Banking System - Restriction Module"
      },
      {
        code: "DORMANT",
        name: "Dormant",
        description: "Inactive for extended period",
        businessRules: [
          "Typically 12+ months with no activity",
          "May be subject to dormancy fees",
          "Customer can reactivate"
        ],
        upstreamSource: "Core Banking System"
      },
      {
        code: "CLOSED",
        name: "Closed",
        description: "Account permanently closed",
        businessRules: [
          "No transactions permitted",
          "Balance must be zero",
          "Cannot be reopened (new account required)"
        ],
        upstreamSource: "Core Banking System"
      },
      {
        code: "CHARGED_OFF",
        name: "Charged Off",
        description: "Debt written off as uncollectible",
        businessRules: [
          "Typically after 180 days delinquent",
          "Reported to credit bureaus",
          "Collections may continue"
        ],
        upstreamSource: "Loan Servicing System"
      }
    ]
  },
  {
    id: "kyc-status",
    name: "KYC/AML Status",
    description: "Customer due diligence and compliance status",
    domain: ["customer-retail", "compliance-retail"],
    values: [
      {
        code: "NOT_STARTED",
        name: "Not Started",
        description: "KYC process not yet initiated",
        upstreamSource: "Compliance Management System"
      },
      {
        code: "IN_PROGRESS",
        name: "In Progress",
        description: "KYC verification underway",
        businessRules: [
          "Account may have transaction limits until complete",
          "Customer may be prompted for documents"
        ],
        upstreamSource: "KYC Verification Platform"
      },
      {
        code: "COMPLETED",
        name: "Completed",
        description: "KYC requirements satisfied",
        businessRules: [
          "Valid for 12-24 months depending on risk rating",
          "Full account functionality enabled"
        ],
        upstreamSource: "KYC Verification Platform"
      },
      {
        code: "EXPIRED",
        name: "Expired",
        description: "KYC certification requires refresh",
        businessRules: [
          "Customer must provide updated information",
          "Account restrictions may apply"
        ],
        upstreamSource: "Compliance Management System"
      },
      {
        code: "FAILED",
        name: "Failed",
        description: "Unable to verify customer identity",
        businessRules: [
          "Account may be restricted or closed",
          "SAR filing may be required"
        ],
        upstreamSource: "KYC Verification Platform"
      }
    ]
  },
  {
    id: "transaction-types",
    name: "Transaction Types",
    description: "Core banking transaction classifications",
    domain: ["deposits-retail", "payments-retail"],
    values: [
      {
        code: "DEPOSIT_CASH",
        name: "Cash Deposit",
        description: "Cash deposited at branch or ATM",
        upstreamSource: "Core Banking - Teller System"
      },
      {
        code: "DEPOSIT_CHECK",
        name: "Check Deposit",
        description: "Paper check or mobile check deposit",
        businessRules: [
          "Funds may be held per Reg CC",
          "Large checks ($5,000+) may require verification"
        ],
        upstreamSource: "Core Banking - Check Processing"
      },
      {
        code: "WITHDRAWAL_CASH",
        name: "Cash Withdrawal",
        description: "Cash withdrawal at branch or ATM",
        upstreamSource: "Core Banking - Teller System / ATM Network"
      },
      {
        code: "TRANSFER_INTERNAL",
        name: "Internal Transfer",
        description: "Transfer between accounts at same bank",
        upstreamSource: "Core Banking - Transfer Module"
      },
      {
        code: "TRANSFER_EXTERNAL",
        name: "External Transfer",
        description: "ACH transfer to/from external bank",
        businessRules: [
          "ACH processing schedule (T+1 or T+2)",
          "Daily limits typically apply"
        ],
        upstreamSource: "ACH Processing System"
      },
      {
        code: "WIRE_OUTBOUND",
        name: "Wire Transfer Out",
        description: "Outgoing wire transfer",
        businessRules: [
          "Same-day processing",
          "Typically non-reversible",
          "Fee usually applies"
        ],
        upstreamSource: "Wire Transfer System"
      },
      {
        code: "CARD_PURCHASE",
        name: "Card Purchase",
        description: "Debit or credit card purchase",
        upstreamSource: "Card Processing Network"
      },
      {
        code: "BILL_PAYMENT",
        name: "Bill Payment",
        description: "Online bill pay transaction",
        upstreamSource: "Bill Pay Platform"
      },
      {
        code: "FEE_CHARGE",
        name: "Fee Charge",
        description: "Bank fee assessed to account",
        examples: ["Overdraft fee", "Monthly maintenance fee", "ATM fee"],
        upstreamSource: "Core Banking - Fee Engine"
      },
      {
        code: "INTEREST_CREDIT",
        name: "Interest Credit",
        description: "Interest earned on account",
        upstreamSource: "Core Banking - Interest Engine"
      }
    ]
  }
];

// Helper functions
export function getReferenceDataByDomain(domainId: string): ReferenceDataCategory[] {
  return referenceDataCatalog.filter(cat => cat.domain.includes(domainId));
}

export function getReferenceDataById(id: string): ReferenceDataCategory | undefined {
  return referenceDataCatalog.find(cat => cat.id === id);
}

export function searchReferenceData(query: string): ReferenceDataCategory[] {
  const lowerQuery = query.toLowerCase();
  return referenceDataCatalog.filter(cat => 
    cat.name.toLowerCase().includes(lowerQuery) ||
    cat.description.toLowerCase().includes(lowerQuery) ||
    cat.values.some(val => 
      val.name.toLowerCase().includes(lowerQuery) ||
      val.description.toLowerCase().includes(lowerQuery)
    )
  );
}
