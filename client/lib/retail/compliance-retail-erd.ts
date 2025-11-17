/**
 * COMPLIANCE-RETAIL ERD DEFINITIONS
 * 
 * Logical and Physical ERD definitions for regulatory compliance
 * Sources: Compliance platforms, KYC systems, Regulatory reporting systems
 */

// LOGICAL ERD
export const complianceRetailLogicalERD = {
  entities: [
    {
      name: 'KYC Record',
      type: 'core',
      description: 'Know Your Customer compliance records',
      attributes: [
        { name: 'kyc_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'kyc_status', type: 'STRING', description: 'Pending|Verified|Failed|Expired' },
        { name: 'kyc_date', type: 'DATE' },
        { name: 'expiration_date', type: 'DATE' },
        { name: 'verification_method', type: 'STRING', description: 'ID Scan|Manual|Third Party' },
        { name: 'id_type', type: 'STRING', description: 'Drivers License|Passport|SSN' },
        { name: 'id_number', type: 'STRING' },
        { name: 'id_expiration_date', type: 'DATE' },
        { name: 'verified_by', type: 'STRING' },
      ],
    },
    {
      name: 'AML Screening',
      type: 'event',
      description: 'Anti-Money Laundering screening',
      attributes: [
        { name: 'screening_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'screening_date', type: 'DATE' },
        { name: 'screening_type', type: 'STRING', description: 'OFAC|PEP|Sanctions|Adverse Media' },
        { name: 'screening_result', type: 'STRING', description: 'Clear|Match|Potential Match' },
        { name: 'risk_rating', type: 'STRING', description: 'Low|Medium|High' },
        { name: 'match_details', type: 'TEXT' },
      ],
    },
    {
      name: 'CTR Report',
      type: 'regulatory',
      description: 'Currency Transaction Reports',
      attributes: [
        { name: 'ctr_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transaction_id', type: 'BIGINT', isForeignKey: true },
        { name: 'ctr_number', type: 'STRING' },
        { name: 'filing_date', type: 'DATE' },
        { name: 'transaction_date', type: 'DATE' },
        { name: 'transaction_amount', type: 'DECIMAL(18,2)' },
        { name: 'filing_status', type: 'STRING', description: 'Filed|Pending|Rejected' },
      ],
    },
    {
      name: 'Regulatory Report',
      type: 'regulatory',
      description: 'Regulatory compliance reports',
      attributes: [
        { name: 'report_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'report_type', type: 'STRING', description: 'Call Report|HMDA|CRA|Dodd-Frank' },
        { name: 'report_period', type: 'STRING' },
        { name: 'filing_date', type: 'DATE' },
        { name: 'status', type: 'STRING', description: 'Draft|Filed|Accepted|Rejected' },
        { name: 'filed_by', type: 'STRING' },
      ],
    },
    {
      name: 'Consent Record',
      type: 'core',
      description: 'Customer consent and opt-in records',
      attributes: [
        { name: 'consent_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'consent_type', type: 'STRING', description: 'Marketing|Data Sharing|Credit Pull' },
        { name: 'consent_given', type: 'BOOLEAN' },
        { name: 'consent_date', type: 'TIMESTAMP' },
        { name: 'consent_method', type: 'STRING', description: 'Electronic|Written|Verbal' },
        { name: 'revocation_date', type: 'TIMESTAMP' },
      ],
    },
  ],
  
  relationships: [
    {
      from: 'AML Screening',
      to: 'KYC Record',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'customer_id',
      description: 'Screenings for KYC records',
    },
  ],
};

// PHYSICAL ERD
export const complianceRetailPhysicalERD = {
  tables: [
    {
      name: 'bronze.retail_kyc_records',
      description: 'KYC verification data',
      source: 'KYC System',
      updateFrequency: 'Real-time',
      recordCount: '~10M records',
      attributes: [
        { name: 'kyc_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT' },
        { name: 'kyc_status', type: 'VARCHAR(50)' },
        { name: 'kyc_date', type: 'DATE' },
        { name: 'expiration_date', type: 'DATE' },
        { name: 'verification_method', type: 'VARCHAR(100)' },
        { name: 'id_type', type: 'VARCHAR(50)' },
        { name: 'id_number', type: 'VARCHAR(100)' },
        { name: 'id_expiration_date', type: 'DATE' },
        { name: 'verified_by', type: 'VARCHAR(200)' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_aml_screenings',
      description: 'AML screening results',
      source: 'AML System',
      updateFrequency: 'Daily',
      recordCount: '~5M screenings/year',
      attributes: [
        { name: 'screening_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT' },
        { name: 'screening_date', type: 'DATE' },
        { name: 'screening_type', type: 'VARCHAR(100)' },
        { name: 'screening_result', type: 'VARCHAR(50)' },
        { name: 'risk_rating', type: 'VARCHAR(50)' },
        { name: 'match_details', type: 'TEXT' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_ctr_reports',
      description: 'Currency Transaction Reports',
      source: 'BSA System',
      updateFrequency: 'Daily',
      recordCount: '~100K CTRs/year',
      attributes: [
        { name: 'ctr_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT' },
        { name: 'transaction_id', type: 'BIGINT' },
        { name: 'ctr_number', type: 'VARCHAR(50)' },
        { name: 'filing_date', type: 'DATE' },
        { name: 'transaction_date', type: 'DATE' },
        { name: 'transaction_amount', type: 'DECIMAL(18,2)' },
        { name: 'filing_status', type: 'VARCHAR(50)' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_regulatory_reports',
      description: 'Regulatory filing data',
      source: 'Compliance Reporting System',
      updateFrequency: 'Quarterly',
      recordCount: '~200 reports/year',
      attributes: [
        { name: 'report_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'report_type', type: 'VARCHAR(100)' },
        { name: 'report_period', type: 'VARCHAR(50)' },
        { name: 'filing_date', type: 'DATE' },
        { name: 'status', type: 'VARCHAR(50)' },
        { name: 'filed_by', type: 'VARCHAR(200)' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_customer_consents',
      description: 'Customer consent records',
      source: 'Consent Management Platform',
      updateFrequency: 'Real-time',
      recordCount: '~50M consents',
      attributes: [
        { name: 'consent_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT' },
        { name: 'consent_type', type: 'VARCHAR(100)' },
        { name: 'consent_given', type: 'BOOLEAN' },
        { name: 'consent_date', type: 'TIMESTAMP' },
        { name: 'consent_method', type: 'VARCHAR(50)' },
        { name: 'revocation_date', type: 'TIMESTAMP' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
  ],
  
  relationships: [
    {
      from: 'bronze.retail_aml_screenings',
      to: 'bronze.retail_kyc_records',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'customer_id',
      description: 'Screenings for KYC records',
    },
  ],
};

export default {
  complianceRetailLogicalERD,
  complianceRetailPhysicalERD,
};
