/**
 * COMPLIANCE-COMMERCIAL COMPREHENSIVE FILE
 * Complete implementation with Bronze (26), Silver (18), Gold (14 dims + 10 facts)
 * 
 * Domain: Commercial Banking Compliance & AML
 * Coverage: BSA/AML, KYB, OFAC Sanctions, Beneficial Ownership, CTR, SAR, CDD/EDD, Transaction Monitoring
 */

// BRONZE LAYER - 26 tables
export const complianceCommercialBronzeLayer = {
  description: 'Bronze layer for commercial compliance domain - raw compliance and AML data',
  layer: 'BRONZE',
  tables: [
    { 
      name: 'bronze.kyb_verifications', 
      description: 'Know Your Business verification records', 
      sourceSystem: 'KYB_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per KYB check',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.cdd_assessments', 
      description: 'Customer Due Diligence assessments', 
      sourceSystem: 'CDD_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per CDD assessment',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.edd_reviews', 
      description: 'Enhanced Due Diligence reviews', 
      sourceSystem: 'EDD_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per EDD review',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.beneficial_ownership', 
      description: 'FinCEN beneficial ownership records', 
      sourceSystem: 'KYB_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per beneficial owner',
      estimatedRows: 1000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.ofac_screening', 
      description: 'OFAC sanctions screening results', 
      sourceSystem: 'SANCTIONS_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per screening',
      estimatedRows: 50000000,
      estimatedSize: '200GB'
    },
    { 
      name: 'bronze.sanctions_alerts', 
      description: 'Sanctions screening alerts and hits', 
      sourceSystem: 'SANCTIONS_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per alert',
      estimatedRows: 5000000,
      estimatedSize: '20GB'
    },
    { 
      name: 'bronze.pep_screening', 
      description: 'Politically Exposed Persons screening', 
      sourceSystem: 'PEP_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per PEP check',
      estimatedRows: 1000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.transaction_monitoring_alerts', 
      description: 'AML transaction monitoring alerts', 
      sourceSystem: 'TM_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per alert',
      estimatedRows: 10000000,
      estimatedSize: '40GB'
    },
    { 
      name: 'bronze.transaction_monitoring_scenarios', 
      description: 'AML scenario configurations', 
      sourceSystem: 'TM_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per scenario',
      estimatedRows: 500,
      estimatedSize: '10MB'
    },
    { 
      name: 'bronze.ctr_filings', 
      description: 'Currency Transaction Reports (CTR)', 
      sourceSystem: 'FINCEN_FILING', 
      loadType: 'BATCH', 
      grain: 'One row per CTR',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.sar_filings', 
      description: 'Suspicious Activity Reports (SAR)', 
      sourceSystem: 'FINCEN_FILING', 
      loadType: 'BATCH', 
      grain: 'One row per SAR',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.sar_investigations', 
      description: 'SAR investigation case files', 
      sourceSystem: 'INVESTIGATION_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per investigation',
      estimatedRows: 100000,
      estimatedSize: '1GB'
    },
    { 
      name: 'bronze.alert_dispositions', 
      description: 'Alert investigation outcomes', 
      sourceSystem: 'INVESTIGATION_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per disposition',
      estimatedRows: 10000000,
      estimatedSize: '40GB'
    },
    { 
      name: 'bronze.risk_ratings', 
      description: 'Customer AML risk ratings', 
      sourceSystem: 'CDD_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per risk rating',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.watchlist_screening', 
      description: 'Third-party watchlist screening', 
      sourceSystem: 'SCREENING_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per screening',
      estimatedRows: 50000000,
      estimatedSize: '200GB'
    },
    { 
      name: 'bronze.negative_news_screening', 
      description: 'Adverse media and negative news screening', 
      sourceSystem: 'NEWS_SCREENING', 
      loadType: 'BATCH', 
      grain: 'One row per news item',
      estimatedRows: 1000000,
      estimatedSize: '5GB'
    },
    { 
      name: 'bronze.regulatory_exams', 
      description: 'Regulatory examination findings', 
      sourceSystem: 'EXAM_TRACKING', 
      loadType: 'BATCH', 
      grain: 'One row per finding',
      estimatedRows: 5000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.compliance_training', 
      description: 'Staff compliance training records', 
      sourceSystem: 'LMS_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per training completion',
      estimatedRows: 1000000,
      estimatedSize: '4GB'
    },
    { 
      name: 'bronze.aml_audit_logs', 
      description: 'AML system audit trails', 
      sourceSystem: 'AML_PLATFORM', 
      loadType: 'STREAMING', 
      grain: 'One row per audit event',
      estimatedRows: 100000000,
      estimatedSize: '400GB'
    },
    { 
      name: 'bronze.wire_transfer_screening', 
      description: 'Wire transfer OFAC screening', 
      sourceSystem: 'WIRE_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per wire screening',
      estimatedRows: 20000000,
      estimatedSize: '80GB'
    },
    { 
      name: 'bronze.trade_finance_screening', 
      description: 'Trade finance sanctions screening', 
      sourceSystem: 'TRADE_SYSTEM', 
      loadType: 'STREAMING', 
      grain: 'One row per trade screening',
      estimatedRows: 500000,
      estimatedSize: '2GB'
    },
    { 
      name: 'bronze.correspondent_bank_screening', 
      description: 'Correspondent banking due diligence', 
      sourceSystem: 'CORRESPONDENT_DD', 
      loadType: 'BATCH', 
      grain: 'One row per correspondent bank',
      estimatedRows: 5000,
      estimatedSize: '50MB'
    },
    { 
      name: 'bronze.shell_bank_checks', 
      description: 'Shell bank certification checks', 
      sourceSystem: 'CORRESPONDENT_DD', 
      loadType: 'BATCH', 
      grain: 'One row per check',
      estimatedRows: 5000,
      estimatedSize: '25MB'
    },
    { 
      name: 'bronze.sanctions_lists', 
      description: 'OFAC, UN, EU sanctions list updates', 
      sourceSystem: 'SANCTIONS_FEED', 
      loadType: 'STREAMING', 
      grain: 'One row per list entry',
      estimatedRows: 100000,
      estimatedSize: '500MB'
    },
    { 
      name: 'bronze.regulatory_reporting_submissions', 
      description: 'FinCEN and regulatory report submissions', 
      sourceSystem: 'REGULATORY_REPORTING', 
      loadType: 'BATCH', 
      grain: 'One row per submission',
      estimatedRows: 1000000,
      estimatedSize: '5GB'
    },
    { 
      name: 'bronze.compliance_attestations', 
      description: 'Officer compliance attestations', 
      sourceSystem: 'COMPLIANCE_SYSTEM', 
      loadType: 'BATCH', 
      grain: 'One row per attestation',
      estimatedRows: 10000,
      estimatedSize: '50MB'
    }
  ],
  totalTables: 26
};

// SILVER LAYER - 18 tables
export const complianceCommercialSilverLayer = {
  description: 'Silver layer for commercial compliance domain - cleansed and aggregated compliance data',
  layer: 'SILVER',
  tables: [
    { name: 'silver.kyb_verifications_cleansed', description: 'Cleansed KYB verification records', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.cdd_assessments_cleansed', description: 'Cleansed CDD assessments', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.beneficial_ownership_cleansed', description: 'Cleansed beneficial ownership records', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.ofac_screening_cleansed', description: 'Cleansed OFAC screening results', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.transaction_monitoring_alerts_cleansed', description: 'Cleansed TM alerts', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.sar_filings_cleansed', description: 'Cleansed SAR filings', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.ctr_filings_cleansed', description: 'Cleansed CTR filings', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_1' },
    { name: 'silver.risk_ratings_cleansed', description: 'Cleansed customer risk ratings', transformationType: 'CLEANSING', scdType: 'SCD_TYPE_2' },
    { name: 'silver.sanctions_alerts_agg', description: 'Aggregated sanctions alerts and hit rates', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.tm_alert_disposition_agg', description: 'Aggregated TM alert outcomes', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.sar_metrics_agg', description: 'Aggregated SAR filing metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.ctr_metrics_agg', description: 'Aggregated CTR filing metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.customer_risk_profile_agg', description: 'Aggregated customer risk profiles', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.screening_efficiency_agg', description: 'Aggregated screening performance metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.compliance_coverage_agg', description: 'Aggregated KYB/CDD coverage metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.regulatory_reporting_agg', description: 'Aggregated regulatory reporting metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.pep_exposure_agg', description: 'Aggregated PEP exposure metrics', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' },
    { name: 'silver.correspondent_banking_risk_agg', description: 'Aggregated correspondent banking risk', transformationType: 'AGGREGATION', scdType: 'SCD_TYPE_1' }
  ],
  totalTables: 18
};

// GOLD LAYER - 14 dimensions + 10 facts
export const complianceCommercialGoldLayer = {
  description: 'Gold layer for commercial compliance domain - dimensional compliance analytics',
  layer: 'GOLD',
  dimensions: [
    { name: 'gold.dim_risk_rating', description: 'AML risk rating dimension (Low, Medium, High, Prohibit)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_kyb_status', description: 'KYB verification status dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_cdd_type', description: 'CDD/EDD type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_alert_type', description: 'Alert type dimension (TM, Sanctions, PEP)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_alert_disposition', description: 'Alert disposition dimension (Cleared, Escalated, SAR)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_sanctions_list', description: 'Sanctions list dimension (OFAC, UN, EU)', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_regulatory_report_type', description: 'Report type dimension (CTR, SAR, FBAR)', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_monitoring_scenario', description: 'AML scenario dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_beneficial_owner_type', description: 'Beneficial owner type dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_pep_category', description: 'PEP category dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_industry_risk', description: 'Industry risk category dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_geographic_risk', description: 'Geographic risk jurisdiction dimension', scdType: 'SCD_TYPE_2' },
    { name: 'gold.dim_product_risk', description: 'Product risk category dimension', scdType: 'SCD_TYPE_1' },
    { name: 'gold.dim_investigator', description: 'Compliance investigator dimension', scdType: 'SCD_TYPE_2' }
  ],
  facts: [
    { name: 'gold.fact_kyb_compliance', description: 'KYB verification metrics', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_cdd_coverage', description: 'CDD/EDD coverage metrics', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_sanctions_screening', description: 'Sanctions screening volumes and hit rates', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_transaction_monitoring', description: 'TM alert volumes and dispositions', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_sar_filings', description: 'SAR filing metrics', factType: 'TRANSACTION' },
    { name: 'gold.fact_ctr_filings', description: 'CTR filing metrics', factType: 'TRANSACTION' },
    { name: 'gold.fact_customer_risk_ratings', description: 'Customer risk rating distribution', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_alert_investigation', description: 'Alert investigation performance', factType: 'PERIODIC_SNAPSHOT' },
    { name: 'gold.fact_regulatory_exams', description: 'Regulatory examination findings', factType: 'TRANSACTION' },
    { name: 'gold.fact_compliance_coverage', description: 'Overall compliance program coverage', factType: 'PERIODIC_SNAPSHOT' }
  ],
  totalDimensions: 14,
  totalFacts: 10
};

export default {
  complianceCommercialBronzeLayer,
  complianceCommercialSilverLayer,
  complianceCommercialGoldLayer
};
