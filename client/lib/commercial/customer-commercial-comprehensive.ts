/**
 * CUSTOMER-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (20), Silver (15), Gold (10 dims + 6 facts)
 * 
 * Business Entity Management for Commercial Banking
 * Supports Small Business, Middle Market, and Large Corporate segments
 */

import customerCommercialBronzeTables from './customer-commercial-bronze-layer';
import { customerCommercialSilverTables } from './customer-commercial-silver-layer';
import { customerCommercialGoldDimensions, customerCommercialGoldFacts } from './customer-commercial-gold-layer';

// BRONZE LAYER - 20 tables
export const customerCommercialBronzeLayer = {
  description: 'Bronze layer for commercial customer domain - raw business entity data from multiple sources',
  layer: 'BRONZE',
  tables: customerCommercialBronzeTables,
  totalTables: 20,
  dataSources: [
    'Salesforce Commercial CRM',
    'Dun & Bradstreet',
    'Experian Business',
    'Equifax Business',
    'Financial Spreading System',
    'KYB Compliance Platform',
    'OFAC/Sanctions Databases',
    'UCC Filing Services',
    'SEC EDGAR',
    'State Business Registries',
    'Account Opening Platform',
    'Data Governance Platform',
  ],
  tableList: [
    'bronze.commercial_business_entities',
    'bronze.commercial_entity_relationships',
    'bronze.commercial_business_identifiers',
    'bronze.commercial_business_addresses',
    'bronze.commercial_business_contacts',
    'bronze.commercial_credit_ratings',
    'bronze.commercial_financial_statements',
    'bronze.commercial_industry_classification',
    'bronze.commercial_ownership_structure',
    'bronze.commercial_guarantors',
    'bronze.commercial_business_lifecycle',
    'bronze.commercial_kyb_records',
    'bronze.commercial_ucc_filings',
    'bronze.commercial_licenses_permits',
    'bronze.commercial_tax_documents',
    'bronze.commercial_financial_ratios',
    'bronze.commercial_industry_benchmarks',
    'bronze.commercial_relationship_managers',
    'bronze.commercial_business_events',
    'bronze.commercial_sanctions_screening',
  ],
};

// SILVER LAYER - 15 tables
export const customerCommercialSilverLayer = {
  description: 'Silver layer for commercial customer domain - cleansed, conformed, and enriched business entity data',
  layer: 'SILVER',
  tables: customerCommercialSilverTables,
  totalTables: 15,
  transformations: [
    'Entity deduplication and golden record creation',
    'Name standardization and fuzzy matching',
    'Address validation and geocoding',
    'EIN/DUNS/LEI verification',
    'NAICS code validation',
    'Credit score normalization',
    'Financial statement spreading and ratio calculation',
    'Ownership hierarchy calculation (multi-level)',
    'KYB status tracking and expiration monitoring',
    'Data quality scoring',
  ],
  tableList: [
    'silver.commercial_business_entities_cleansed',
    'silver.commercial_entity_relationships_cleansed',
    'silver.commercial_credit_profiles_cleansed',
    'silver.commercial_financial_statements_cleansed',
    'silver.commercial_ownership_structure_cleansed',
    'silver.commercial_guarantors_cleansed',
    'silver.commercial_kyb_records_cleansed',
    'silver.commercial_financial_ratios_cleansed',
    'silver.commercial_business_golden_record',
    'silver.commercial_entity_hierarchy_agg',
    'silver.commercial_credit_trends_agg',
    'silver.commercial_financial_health_agg',
    'silver.commercial_industry_metrics_agg',
    'silver.commercial_relationship_coverage_agg',
    'silver.commercial_risk_profile_agg',
  ],
};

// GOLD LAYER - 10 dimensions + 6 facts
export const customerCommercialGoldLayer = {
  description: 'Gold layer for commercial customer domain - dimensional model for analytics and BI',
  layer: 'GOLD',
  dimensions: customerCommercialGoldDimensions,
  facts: customerCommercialGoldFacts,
  totalDimensions: 10,
  totalFacts: 6,
  
  dimensionList: [
    'gold.dim_commercial_customer',
    'gold.dim_business_entity_type',
    'gold.dim_industry',
    'gold.dim_revenue_bracket',
    'gold.dim_business_lifecycle_stage',
    'gold.dim_credit_rating',
    'gold.dim_entity_relationship_type',
    'gold.dim_ownership_type',
    'gold.dim_relationship_manager',
    'gold.dim_geographic_market',
  ],
  
  factList: [
    'gold.fact_commercial_customer_profile',
    'gold.fact_financial_performance',
    'gold.fact_credit_worthiness',
    'gold.fact_entity_relationships',
    'gold.fact_rm_coverage',
    'gold.fact_business_events',
  ],
};

// METRICS CATALOG
export { customerCommercialMetricsCatalog } from './customer-commercial-metrics';

// SEMANTIC LAYER
export { customerCommercialSemanticLayer } from './customer-commercial-semantic-layer';

// DOMAIN SUMMARY
export const customerCommercialDomainSummary = {
  domainId: 'customer-commercial',
  domainName: 'Customer-Commercial',
  area: 'Commercial Banking',
  
  overview: {
    description: 'Comprehensive business entity management for commercial banking including business profiles, ownership structures, credit ratings, financial statements, KYB compliance, and relationship management.',
    purpose: 'Enable effective commercial customer relationship management, credit risk assessment, regulatory compliance, and data-driven commercial banking decisions.',
    scope: 'Small Business (<$5M revenue), Middle Market ($5M-$500M), Large Corporate (>$500M)',
  },
  
  coverage: {
    bronze: { tables: 20, description: 'Raw business entity data from multiple sources' },
    silver: { tables: 15, description: 'Cleansed and enriched business entities with golden records' },
    gold: { dimensions: 10, facts: 6, description: 'Dimensional model for commercial customer analytics' },
    metrics: { total: 450, description: 'Comprehensive business entity and relationship KPIs' },
    semanticLayer: { measures: 18, attributes: 10, hierarchies: 5, folders: 7 },
  },
  
  keyFeatures: [
    'Business Entity Golden Record (MDM)',
    'Multi-level Ownership Hierarchy (10+ levels)',
    'Beneficial Ownership Tracking (FinCEN CDD)',
    'Credit Bureau Integration (D&B, Experian, Equifax)',
    'Financial Statement Spreading & Analysis',
    'Financial Ratio Calculation (30+ ratios)',
    'KYB Compliance & Monitoring',
    'OFAC & Sanctions Screening',
    'UCC Filing & Lien Tracking',
    'Relationship Manager Coverage',
    'Industry Benchmarking',
    'Data Lineage (BCBS 239)',
    'Data Governance Controls',
  ],
  
  regulatoryCompliance: [
    'FinCEN CDD Rule - Beneficial Ownership',
    'USA PATRIOT Act - CIP for Businesses',
    'Bank Secrecy Act - KYB',
    'OFAC Sanctions',
    'BCBS 239 - Risk Data Aggregation',
    'Dodd-Frank - Enhanced Prudential Standards',
    'SOX 302/404 - Financial Controls',
    'GDPR/CCPA - Business Data Privacy',
  ],
  
  useCases: [
    'Commercial Customer 360 View',
    'Credit Risk Assessment',
    'KYB Compliance & Monitoring',
    'Financial Health Analysis',
    'Relationship Profitability',
    'Portfolio Management',
    'Regulatory Reporting',
    'Cross-Sell Analytics',
  ],
  
  dataQuality: {
    tier: 'Tier 1 (Critical)',
    accuracy: 'High',
    completeness: 'High',
    timeliness: 'Daily',
    consistency: 'High',
    uniqueness: 'High',
  },
};

// COMPLETE EXPORT
export default {
  bronze: customerCommercialBronzeLayer,
  silver: customerCommercialSilverLayer,
  gold: customerCommercialGoldLayer,
  summary: customerCommercialDomainSummary,
};
