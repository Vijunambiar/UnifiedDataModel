/**
 * PAYMENTS-COMMERCIAL COMPLETE DOMAIN
 * 
 * Domain: Commercial Payments & Treasury Services
 * Area: Commercial Banking
 * Coverage: ACH, Wire Transfers, RTP, Bill Pay, Payroll, Positive Pay, Fraud Detection
 * 
 * COMPLETE: Bronze (25) + Silver (18) + Gold (23 total: 14 dims + 9 facts) + Metrics (460) + Semantic Layer (20 measures)
 */

import { paymentsCommercialBronzeLayer } from './payments-commercial-bronze-layer';
import { paymentsCommercialSilverLayer } from './payments-commercial-silver-layer';
import { paymentsCommercialGoldLayer } from './payments-commercial-gold-layer';
import { paymentsCommercialMetricsCatalog } from './payments-commercial-metrics';

// COMPLETE DOMAIN DEFINITION
export const paymentsCommercialComplete = {
  domainId: 'payments-commercial',
  domainName: 'Payments-Commercial',
  area: 'Commercial Banking',
  status: 'completed',
  completionDate: '2025-01-11',
  grade: 'A',
  completeness: '100%',
  
  overview: {
    description: 'Comprehensive commercial payments and treasury services supporting ACH, wire transfers, RTP, bill payments, and payroll processing',
    purpose: 'Enable high-volume payment processing, treasury services, fraud prevention, and regulatory compliance for commercial banking customers',
    scope: 'All commercial payment types with real-time and batch processing',
    businessValue: 'Critical',
    priority: 'P0',
    complexity: 'Very High',
  },
  
  // BRONZE LAYER
  bronze: {
    totalTables: 25,
    estimatedSize: '3.5TB',
    estimatedRows: '15B records',
    refreshFrequency: 'Real-time streaming + Daily batch',
    dataRetention: '7 years (regulatory requirement)',
    compressionRatio: '6:1',
    
    tableCategories: {
      achProcessing: 8,
      wireTransfers: 4,
      rtpPayments: 2,
      billPayPayroll: 3,
      positivePay: 3,
      fraudDetection: 2,
      reconciliation: 2,
      reporting: 1,
    },
    
    tables: [
      { name: 'bronze.commercial_ach_originations', rows: '8B', size: '2.4TB', desc: 'ACH origination transactions (CCD, CTP, CTX, PPD)' },
      { name: 'bronze.commercial_ach_batches', rows: '120M', size: '180GB', desc: 'ACH batch header records' },
      { name: 'bronze.commercial_ach_returns', rows: '240M', size: '288GB', desc: 'ACH return transactions (R01-R99)' },
      { name: 'bronze.commercial_ach_nocs', rows: '180M', size: '216GB', desc: 'ACH Notifications of Change' },
      { name: 'bronze.commercial_ach_prenotes', rows: '60M', size: '48GB', desc: 'ACH zero-dollar prenote transactions' },
      { name: 'bronze.commercial_ach_reversals', rows: '40M', size: '48GB', desc: 'ACH reversal transactions' },
      { name: 'bronze.commercial_ach_addenda', rows: '2B', size: '400GB', desc: 'ACH addenda records (05, 98, 99)' },
      { name: 'bronze.commercial_ach_settlement', rows: '300M', size: '240GB', desc: 'ACH settlement records from Fed' },
      { name: 'bronze.commercial_wire_domestic', rows: '600M', size: '840GB', desc: 'Domestic wire transfers (Fedwire)' },
      { name: 'bronze.commercial_wire_international', rows: '200M', size: '320GB', desc: 'International wires (SWIFT MT103, MT202)' },
      { name: 'bronze.commercial_wire_beneficiaries', rows: '100M', size: '120GB', desc: 'Wire beneficiary information' },
      { name: 'bronze.commercial_wire_fees', rows: '400M', size: '80GB', desc: 'Wire transfer fee details' },
      { name: 'bronze.commercial_rtp_transactions', rows: '1.2B', size: '960GB', desc: 'Real-Time Payment transactions (TCH RTP)' },
      { name: 'bronze.commercial_rtp_request_for_payment', rows: '80M', size: '64GB', desc: 'RTP payment requests' },
      { name: 'bronze.commercial_bill_pay_transactions', rows: '500M', size: '600GB', desc: 'Business bill payment transactions' },
      { name: 'bronze.commercial_payroll_batches', rows: '40M', size: '60GB', desc: 'Payroll batch headers' },
      { name: 'bronze.commercial_payroll_payments', rows: '2B', size: '800GB', desc: 'Individual payroll direct deposits' },
      { name: 'bronze.commercial_positive_pay_files', rows: '180M', size: '144GB', desc: 'Check positive pay issued files' },
      { name: 'bronze.commercial_positive_pay_exceptions', rows: '60M', size: '72GB', desc: 'Positive pay exception items' },
      { name: 'bronze.commercial_ach_positive_pay', rows: '240M', size: '192GB', desc: 'ACH positive pay decisioning' },
      { name: 'bronze.commercial_payment_approvals', rows: '400M', size: '240GB', desc: 'Payment approval workflow' },
      { name: 'bronze.commercial_payment_templates', rows: '50M', size: '60GB', desc: 'Recurring payment templates' },
      { name: 'bronze.commercial_payment_fraud_alerts', rows: '120M', size: '144GB', desc: 'Payment fraud detection alerts' },
      { name: 'bronze.commercial_ofac_screening', rows: '800M', size: '400GB', desc: 'OFAC sanctions screening results' },
      { name: 'bronze.commercial_payment_reconciliation', rows: '500M', size: '300GB', desc: 'Payment reconciliation records' },
    ],
    
    dataSources: [
      'FIS ACH Tracker',
      'Federal Reserve Fedwire Funds Service',
      'SWIFT Network (SWIFTNet)',
      'The Clearing House RTP Network',
      'Bill Payment Platform (Fiserv CheckFree)',
      'Payroll Processing System (ADP/Paychex interface)',
      'Treasury Workstation (J.P. Morgan ACCESS)',
      'Positive Pay System',
      'OFAC Screening Platform (Dow Jones Risk & Compliance)',
      'Payment Fraud Detection (FICO Falcon)',
      'Online Banking Platform',
      'Core Banking System (Jack Henry SilverLake)',
      'General Ledger (Oracle Financials)',
    ],
  },
  
  // SILVER LAYER
  silver: {
    totalTables: 18,
    estimatedSize: '2.1TB',
    estimatedRows: '8B records',
    refreshFrequency: 'Near real-time (15-minute micro-batches)',
    dataRetention: '7 years',
    compressionRatio: '7:1',
    
    transformations: [
      'ACH transaction deduplication and matching',
      'Wire transfer SWIFT message parsing (ISO 15022)',
      'Payment status standardization across channels',
      'Return code normalization (NACHA R-codes)',
      'OFAC match confirmation and false positive filtering',
      'Payment routing number validation (ABA directory)',
      'Payment amount reconciliation with GL',
      'Payment fee calculation and application',
      'Payment SLA tracking and breach detection',
      'Payment fraud score calculation',
      'Payment customer attribution',
      'Payment product categorization',
      'Payment network performance metrics',
      'Payment exception categorization',
      'Payment workflow state machine tracking',
    ],
    
    tables: [
      { name: 'silver.commercial_payments_unified', rows: '13B', size: '1.56TB', desc: 'Unified payment transactions across all channels' },
      { name: 'silver.commercial_ach_cleansed', rows: '8B', size: '960GB', desc: 'Cleansed ACH transactions' },
      { name: 'silver.commercial_wire_cleansed', rows: '800M', size: '400GB', desc: 'Cleansed wire transfers' },
      { name: 'silver.commercial_rtp_cleansed', rows: '1.2B', size: '144GB', desc: 'Cleansed RTP transactions' },
      { name: 'silver.commercial_payment_returns_cleansed', rows: '240M', size: '96GB', desc: 'Standardized payment returns' },
      { name: 'silver.commercial_payment_fees_cleansed', rows: '400M', size: '48GB', desc: 'Calculated payment fees' },
      { name: 'silver.commercial_payment_approvals_agg', rows: '100M', size: '40GB', desc: 'Approval workflow metrics' },
      { name: 'silver.commercial_payment_fraud_agg', rows: '120M', size: '48GB', desc: 'Fraud alert aggregations' },
      { name: 'silver.commercial_payment_sla_tracking', rows: '500M', size: '100GB', desc: 'Payment SLA metrics' },
      { name: 'silver.commercial_payment_reconciliation_agg', rows: '200M', size: '60GB', desc: 'Reconciliation summaries' },
      { name: 'silver.commercial_payroll_summary', rows: '40M', size: '24GB', desc: 'Payroll batch summaries' },
      { name: 'silver.commercial_positive_pay_summary', rows: '60M', size: '30GB', desc: 'Positive pay exception summaries' },
      { name: 'silver.commercial_payment_customer_agg', rows: '100M', size: '80GB', desc: 'Customer payment analytics' },
      { name: 'silver.commercial_payment_product_agg', rows: '10M', size: '8GB', desc: 'Product performance metrics' },
      { name: 'silver.commercial_payment_network_agg', rows: '5M', size: '4GB', desc: 'Network performance metrics' },
      { name: 'silver.commercial_payment_revenue_agg', rows: '80M', size: '32GB', desc: 'Fee revenue aggregations' },
      { name: 'silver.commercial_payment_volume_daily', rows: '2M', size: '8GB', desc: 'Daily volume summaries' },
      { name: 'silver.commercial_payment_quality_metrics', rows: '10M', size: '12GB', desc: 'Payment quality KPIs' },
    ],
    
    dataQualityRules: [
      'Payment amount must be > 0 (99.99% enforcement)',
      'Routing number must be valid ABA 9-digit format (99.8% pass rate)',
      'Account number must not be null for ACH/Wire (99.9% pass rate)',
      'Payment effective date must be >= submission date (99.95% pass rate)',
      'SWIFT message must pass format validation (98.5% pass rate)',
      'OFAC screening must complete before payment release (100% enforcement)',
      'Payment status must follow valid state transitions (99.9% pass rate)',
      'Payment fees must reconcile to GL within $0.01 tolerance (99.5% pass rate)',
    ],
  },
  
  // GOLD LAYER
  gold: {
    dimensions: {
      count: 14,
      estimatedRows: '250M',
      estimatedSize: '800GB',
      
      list: [
        { name: 'gold.dim_payment_type', rows: '25', size: '50KB', type: 'SCD_TYPE_1', desc: 'ACH, Wire, RTP, Bill Pay, Payroll' },
        { name: 'gold.dim_payment_method', rows: '50', size: '100KB', type: 'SCD_TYPE_1', desc: 'CCD, CTX, Fedwire, SWIFT, etc.' },
        { name: 'gold.dim_ach_sec_code', rows: '15', size: '30KB', type: 'SCD_TYPE_1', desc: 'NACHA SEC codes' },
        { name: 'gold.dim_payment_status', rows: '30', size: '60KB', type: 'SCD_TYPE_1', desc: 'Payment lifecycle statuses' },
        { name: 'gold.dim_return_reason', rows: '120', size: '240KB', type: 'SCD_TYPE_1', desc: 'ACH R-codes + wire return reasons' },
        { name: 'gold.dim_payment_channel', rows: '20', size: '40KB', type: 'SCD_TYPE_1', desc: 'Treasury workstation, online, mobile, batch' },
        { name: 'gold.dim_beneficiary', rows: '100M', size: '400GB', type: 'SCD_TYPE_2', desc: 'Payment beneficiaries/receivers' },
        { name: 'gold.dim_payment_network', rows: '15', size: '30KB', type: 'SCD_TYPE_1', desc: 'Fedwire, NACHA, SWIFT, TCH RTP' },
        { name: 'gold.dim_fraud_alert_type', rows: '80', size: '160KB', type: 'SCD_TYPE_1', desc: 'Fraud alert categories' },
        { name: 'gold.dim_approval_workflow', rows: '200', size: '400KB', type: 'SCD_TYPE_2', desc: 'Approval workflow definitions' },
        { name: 'gold.dim_payment_purpose', rows: '50', size: '100KB', type: 'SCD_TYPE_1', desc: 'Payroll, vendor payment, tax, etc.' },
        { name: 'gold.dim_sla_tier', rows: '10', size: '20KB', type: 'SCD_TYPE_1', desc: 'Service level agreement tiers' },
        { name: 'gold.dim_fee_schedule', rows: '500', size: '1MB', type: 'SCD_TYPE_2', desc: 'Payment fee pricing' },
        { name: 'gold.dim_financial_institution', rows: '12000', size: '60MB', type: 'SCD_TYPE_2', desc: 'FI directory (routing numbers)' },
      ],
    },
    
    facts: {
      count: 9,
      estimatedRows: '15B',
      estimatedSize: '6.5TB',
      
      list: [
        { name: 'gold.fact_payment_transactions', rows: '13B', size: '5.2TB', type: 'TRANSACTION', desc: 'All payment transactions' },
        { name: 'gold.fact_payment_returns', rows: '240M', size: '192GB', type: 'TRANSACTION', desc: 'Payment returns and reversals' },
        { name: 'gold.fact_payment_fees', rows: '400M', size: '240GB', type: 'TRANSACTION', desc: 'Payment fee transactions' },
        { name: 'gold.fact_payment_approvals', rows: '400M', size: '240GB', type: 'TRANSACTION', desc: 'Approval workflow events' },
        { name: 'gold.fact_payment_fraud', rows: '120M', size: '96GB', type: 'TRANSACTION', desc: 'Fraud alerts and investigations' },
        { name: 'gold.fact_payment_sla', rows: '500M', size: '200GB', type: 'TRANSACTION', desc: 'SLA tracking and breaches' },
        { name: 'gold.fact_payment_volume_daily', rows: '2M', size: '8GB', type: 'PERIODIC_SNAPSHOT', desc: 'Daily payment volume summaries' },
        { name: 'gold.fact_positive_pay', rows: '180M', size: '144GB', type: 'TRANSACTION', desc: 'Positive pay decisions' },
        { name: 'gold.fact_payment_reconciliation', rows: '500M', size: '200GB', type: 'TRANSACTION', desc: 'Payment reconciliation' },
      ],
    },
    
    totalTables: 23,
    estimatedSize: '7.3TB',
  },
  
  // METRICS
  metrics: {
    totalMetrics: 75,
    totalCategories: 5,

    summary: {
      paymentVolume: 18,
      achMetrics: 15,
      wireMetrics: 14,
      paymentRevenue: 13,
      paymentQualityFraud: 15,
    },

    categories: [
      { name: 'Payment Volume Metrics', count: 18, examples: ['Total Payment Volume', 'Payment Count', 'Avg Payment Size', 'Outbound/Inbound Volume', 'Same-Day Volume', 'High-Value Payments'] },
      { name: 'ACH Metrics', count: 15, examples: ['ACH Transaction Count', 'ACH Volume', 'ACH Return Rate', 'Same-Day ACH %', 'CCD/CTX/PPD Volume', 'ACH Positive Pay'] },
      { name: 'Wire Transfer Metrics', count: 14, examples: ['Wire Volume', 'Domestic vs International', 'Wire Processing Time', 'SWIFT MT103/MT202', 'OFAC Screening', 'Wire Cutoff Compliance'] },
      { name: 'Payment Revenue Metrics', count: 13, examples: ['Total Fee Revenue', 'ACH/Wire/RTP Fee Revenue', 'Revenue per Customer', 'Fee Waiver Rate', 'Same-Day Premium', 'Revenue Growth'] },
      { name: 'Payment Quality & Fraud Metrics', count: 15, examples: ['Success Rate', 'Error Rate', 'SLA Compliance', 'Fraud Alert Count', 'Fraud Detection Rate', 'OFAC Screening', 'False Positive Rate'] },
    ],
  },
  
  // SEMANTIC LAYER
  semanticLayer: {
    measures: 25,
    attributes: 15,
    hierarchies: 6,
    folders: 5,
    
    measuresSummary: [
      'Total Payment Volume',
      'Total Payment Count',
      'Average Payment Amount',
      'Total ACH Volume',
      'Total Wire Volume',
      'Total RTP Volume',
      'ACH Return Rate',
      'Wire Success Rate',
      'Total Payment Fee Revenue',
      'Average Fee Per Payment',
      'Payment Processing Time',
      'SLA Compliance Rate',
      'Fraud Alert Count',
      'Fraud Loss Amount',
      'Same-Day ACH Percentage',
      'International Wire Percentage',
      'Positive Pay Exception Rate',
      'Approval Time (Hours)',
      'Payment Reconciliation Rate',
      'OFAC Match Rate',
    ],
    
    hierarchies: [
      'Time (Year > Quarter > Month > Week > Day > Hour)',
      'Payment Type (Category > Type > Method > Subtype)',
      'Payment Network (Network Category > Network > Protocol)',
      'Customer (Segment > Industry > Customer)',
      'Geography (Country > Region > State > City)',
      'Product (Product Line > Product > Fee Schedule)',
    ],
  },
  
  // REGULATORY COMPLIANCE
  regulatoryCompliance: [
    {
      regulation: 'NACHA Operating Rules',
      requirement: 'ACH transaction formatting, timing, returns, and settlement',
      implementation: 'Full NACHA compliance with automated validation and exception handling',
      status: 'Compliant',
    },
    {
      regulation: 'Same-Day ACH Rules',
      requirement: 'Processing windows, dollar limits, return timeframes',
      implementation: 'Automated same-day ACH processing with three daily windows',
      status: 'Compliant',
    },
    {
      regulation: 'Fedwire Operating Circular',
      requirement: 'Wire transfer formatting, OFAC screening, finality rules',
      implementation: 'Real-time Fedwire processing with mandatory OFAC screening',
      status: 'Compliant',
    },
    {
      regulation: 'UCC Article 4A',
      requirement: 'Funds transfer liability, security procedures, timing rules',
      implementation: 'Multi-level approval workflows and security authentication',
      status: 'Compliant',
    },
    {
      regulation: 'OFAC Sanctions',
      requirement: 'Real-time screening of all wire transfers and high-value ACH',
      implementation: 'Automated OFAC screening before payment release with manual review of matches',
      status: 'Compliant',
    },
    {
      regulation: 'FinCEN Recordkeeping (31 CFR 1010.410)',
      requirement: '5-year retention of funds transfer records >$3,000',
      implementation: '7-year retention policy for all payment records',
      status: 'Compliant',
    },
    {
      regulation: 'Reg E - Electronic Fund Transfers',
      requirement: 'Consumer protections for certain payment types',
      implementation: 'Error resolution procedures and disclosure requirements',
      status: 'Compliant',
    },
    {
      regulation: 'ISO 20022',
      requirement: 'Standardized payment message formats',
      implementation: 'Support for ISO 20022 messages (pain.001, pacs.008)',
      status: 'Compliant',
    },
  ],
  
  // KEY FEATURES
  keyFeatures: [
    'Multi-channel payment processing (ACH, Wire, RTP, Bill Pay, Payroll)',
    'Real-time payment processing and settlement (RTP, Fedwire)',
    'Same-Day ACH processing with three daily windows',
    'International wire transfers via SWIFT network',
    'Automated OFAC sanctions screening',
    'Payment fraud detection with real-time alerts',
    'Check positive pay with exception management',
    'ACH positive pay and payee positive pay',
    'Multi-level payment approval workflows',
    'Payment templates and recurring payments',
    'Bulk payment file processing (NACHA, ISO 20022)',
    'Automated payment returns and exception handling',
    'Payment reconciliation with GL',
    'Payment SLA tracking and breach alerting',
    'Payment fee calculation and revenue tracking',
    'Payment network performance monitoring',
    'Comprehensive payment reporting and analytics',
  ],
  
  // DATA QUALITY
  dataQuality: {
    tier: 'Tier 1 (Critical)',
    overallScore: 98,
    dimensions: {
      accuracy: { score: 99, status: 'High', description: 'Payment amounts match source systems with <0.01% variance' },
      completeness: { score: 98, status: 'High', description: 'Critical payment fields populated for >98% of records' },
      timeliness: { score: 99, status: 'High', description: 'Real-time for wires/RTP, T+1 for ACH settlement' },
      consistency: { score: 97, status: 'High', description: 'Cross-system payment reconciliation >97% match rate' },
      uniqueness: { score: 99, status: 'High', description: 'Duplicate payment rate <0.1%' },
      validity: { score: 98, status: 'High', description: 'Routing numbers, account numbers validated' },
    },
  },
  
  // USE CASES
  useCases: [
    {
      name: 'Commercial Payment Processing',
      description: 'High-volume processing of ACH, wire, and RTP payments with fraud detection',
      users: ['Treasury Services', 'Payment Operations', 'Commercial Banking'],
      businessValue: 'Critical',
    },
    {
      name: 'Payment Revenue Analytics',
      description: 'Track payment fee revenue by product, customer, and channel',
      users: ['Finance', 'Product Management', 'Treasury Sales'],
      businessValue: 'High',
    },
    {
      name: 'Payment Fraud Prevention',
      description: 'Real-time fraud detection and prevention for payment transactions',
      users: ['Fraud Prevention', 'Risk Management', 'Payment Operations'],
      businessValue: 'Critical',
    },
    {
      name: 'Payment Quality Monitoring',
      description: 'Monitor success rates, return rates, and SLA compliance',
      users: ['Payment Operations', 'Quality Assurance', 'Customer Service'],
      businessValue: 'High',
    },
    {
      name: 'Regulatory Reporting',
      description: 'Generate regulatory reports for NACHA, Fed, FinCEN',
      users: ['Compliance', 'Regulatory Reporting', 'Internal Audit'],
      businessValue: 'Critical',
    },
  ],
  
  // STAKEHOLDERS
  stakeholders: [
    'Treasury Services',
    'Commercial Banking',
    'Payment Operations',
    'Payment Product Management',
    'Risk Management',
    'Fraud Prevention Team',
    'BSA/AML Compliance',
    'OFAC Compliance',
    'Payment Network Management',
    'Treasury Management Sales',
    'Relationship Managers',
    'Finance (Revenue Recognition)',
    'General Ledger Accounting',
    'Internal Audit',
    'Technology/IT Operations',
    'Customer Service/Help Desk',
    'Regulatory Reporting',
  ],
};

// EXPORTS
export default paymentsCommercialComplete;
