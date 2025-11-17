// Transactions Domain Glossary
// Business definitions and semantic layer terminology

export interface GlossaryTerm {
  name: string;
  definition: string;
  businessMeaning: string;
  technicalDefinition: string;
  source: string;
  relatedTerms: string[];
}

export const transactionsGlossary: GlossaryTerm[] = [
  {
    name: "Transaction",
    definition: "Any debit, credit, or neutral financial event affecting a customer account",
    businessMeaning:
      "Core unit of analysis; every transaction is a data point for fraud detection, compliance, and revenue",
    technicalDefinition:
      "fct_transaction WHERE transaction_status IN ('Completed', 'Failed', 'Pending')",
    source: "Gold layer: fct_transaction",
    relatedTerms: ["Payment", "Transfer", "Deposit", "Withdrawal"],
  },
  {
    name: "Payment Type",
    definition:
      "Classification of transaction method (ACH, Wire, RTP, Debit, ATM, POS, Check)",
    businessMeaning:
      "Determines processing time, fees, and regulatory treatment. ACH = 1-3 days, RTP = <1 second",
    technicalDefinition:
      "payment_type IN ('ACH', 'Wire', 'RTP', 'Debit', 'ATM', 'POS', 'Check')",
    source: "Gold layer: dim_payment_types.payment_type",
    relatedTerms: ["Channel", "Clearing Method", "Settlement"],
  },
  {
    name: "Channel",
    definition: "Method customer used to initiate transaction (Mobile, Online, Branch, ATM, Kiosk)",
    businessMeaning: "Drives digital transformation strategy; mobile preferred (lower cost, higher NPS)",
    technicalDefinition:
      "channel IN ('Mobile', 'Online', 'Branch', 'ATM', 'Kiosk', 'IVR')",
    source: "Gold layer: fct_transaction.channel",
    relatedTerms: ["Device Type", "Digital Channel", "Physical Channel"],
  },
  {
    name: "ACH (Automated Clearing House)",
    definition: "Electronic payment system for low-value, batch-processed transactions",
    businessMeaning:
      "Primary payment type for bill pay, payroll, P2P; typical 1-3 day settlement; low fee (~$0.25)",
    technicalDefinition:
      "payment_type='ACH' with settlement_date = transaction_date + 1-3 days",
    source: "Gold layer: fct_transaction_ach",
    relatedTerms: ["Wire", "RTP", "Clearing Method"],
  },
  {
    name: "RTP (Real-Time Payments)",
    definition: "Modern instant payment system with settlement in <1 second",
    businessMeaning:
      "Next-generation payment method; improves customer experience; enables real-time business workflows",
    technicalDefinition:
      "payment_type='RTP' with settlement_date = transaction_date (same-day settlement)",
    source: "Gold layer: fct_transaction_rtp",
    relatedTerms: ["Instant Payment", "Same-Day Settlement", "Fast Payments"],
  },
  {
    name: "Wire Transfer",
    definition:
      "High-value payment with guaranteed funds and finality; settled same-day through Federal Reserve",
    businessMeaning:
      "High fees ($20-30); used for large/urgent transfers; regulatory scrutiny for international wires",
    technicalDefinition:
      "payment_type='Wire' with amount > $2,500 typically; settlement_date = transaction_date",
    source: "Gold layer: fct_transaction_wire",
    relatedTerms: ["SWIFT", "Federal Wire", "International Payment"],
  },
  {
    name: "Fraud Detection",
    definition:
      "Process of identifying transactions that violate business rules or exhibit suspicious patterns",
    businessMeaning:
      "Critical risk management; real-time detection prevents fraud before completion; reduces fraud loss to <$1M annually",
    technicalDefinition:
      "fraud_flag = true WHERE transaction matches rules OR ML_fraud_probability > 0.75",
    source: "Gold layer: fct_transaction.fraud_flag, fraud_probability",
    relatedTerms: ["Suspicious Activity", "AML", "Compliance", "Risk Scoring"],
  },
  {
    name: "AML/CFT (Anti-Money Laundering / Counter-Financing of Terrorism)",
    definition:
      "Regulatory framework requiring monitoring and reporting of suspicious transactions",
    businessMeaning:
      "Mandatory compliance; failure = criminal liability + massive fines; requires real-time monitoring",
    technicalDefinition:
      "Automated rules engine checking: transaction size, frequency, counterparty, geographic anomalies",
    source: "Gold layer: agg_aml_compliance",
    relatedTerms: ["SAR", "OFAC", "Sanctions", "Compliance"],
  },
  {
    name: "SAR (Suspicious Activity Report)",
    definition: "Federal filing required when bank suspects money laundering or terrorist financing",
    businessMeaning:
      "Legal requirement within 30 days of detection; filed to FinCEN; triggers investigation",
    technicalDefinition:
      "SAR_filed_date must be <= transaction_date + 30 days; requires validation and escalation",
    source: "Gold layer: agg_sar_filings",
    relatedTerms: ["Compliance Reporting", "AML", "Regulatory Filing"],
  },
  {
    name: "OFAC (Office of Foreign Assets Control)",
    definition:
      "U.S. government agency maintaining sanctions lists; banks must screen transactions against lists",
    businessMeaning:
      "Non-compliance = criminal penalties; routine screening required on all customer and counterparty names",
    technicalDefinition:
      "transaction blocked if counterparty name matches OFAC SDN list OR high similarity score",
    source: "Gold layer: fct_transaction.ofac_match_flag",
    relatedTerms: ["Sanctions", "Screening", "AML Compliance"],
  },
  {
    name: "Transaction Volume",
    description: "Sum of all transaction amounts processed",
    businessMeaning:
      "Key profitability driver; impacts NII, fee income, capital requirements; managed by treasury",
    technicalDefinition: "SUM(fct_transaction.amount) by period, channel, payment type",
    source: "Gold layer: agg_transaction_volume",
    relatedTerms: ["Transaction Count", "Revenue", "Activity Metrics"],
  },
];
