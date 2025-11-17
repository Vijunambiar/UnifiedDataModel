/**
 * INSURANCE-RETAIL ERD DEFINITIONS
 * 
 * Logical and Physical ERD definitions for retail insurance products
 * Sources: Insurance platforms, Policy management systems, Claims systems
 */

// LOGICAL ERD
export const insuranceRetailLogicalERD = {
  entities: [
    {
      name: 'Insurance Policy',
      type: 'core',
      description: 'Insurance policies sold to retail customers',
      attributes: [
        { name: 'policy_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'policy_number', type: 'STRING' },
        { name: 'policy_type', type: 'STRING', description: 'Life|Auto|Home|Health|Travel|Pet' },
        { name: 'policy_status', type: 'STRING', description: 'Active|Lapsed|Cancelled|Expired' },
        { name: 'effective_date', type: 'DATE' },
        { name: 'expiration_date', type: 'DATE' },
        { name: 'premium_amount', type: 'DECIMAL(18,2)' },
        { name: 'premium_frequency', type: 'STRING', description: 'Monthly|Quarterly|Annual' },
        { name: 'coverage_amount', type: 'DECIMAL(18,2)' },
        { name: 'deductible', type: 'DECIMAL(18,2)' },
      ],
    },
    {
      name: 'Premium Payment',
      type: 'event',
      description: 'Insurance premium payments',
      attributes: [
        { name: 'payment_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'policy_id', type: 'BIGINT', isForeignKey: true },
        { name: 'payment_date', type: 'DATE' },
        { name: 'payment_amount', type: 'DECIMAL(18,2)' },
        { name: 'payment_method', type: 'STRING', description: 'ACH|Card|Check' },
        { name: 'payment_status', type: 'STRING', description: 'Paid|Failed|Pending' },
      ],
    },
    {
      name: 'Claim',
      type: 'event',
      description: 'Insurance claims filed',
      attributes: [
        { name: 'claim_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'policy_id', type: 'BIGINT', isForeignKey: true },
        { name: 'claim_number', type: 'STRING' },
        { name: 'claim_date', type: 'DATE' },
        { name: 'claim_type', type: 'STRING' },
        { name: 'claim_amount', type: 'DECIMAL(18,2)' },
        { name: 'claim_status', type: 'STRING', description: 'Filed|Under Review|Approved|Denied|Paid' },
        { name: 'approved_amount', type: 'DECIMAL(18,2)' },
        { name: 'payment_date', type: 'DATE' },
      ],
    },
    {
      name: 'Beneficiary',
      type: 'core',
      description: 'Policy beneficiaries',
      attributes: [
        { name: 'beneficiary_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'policy_id', type: 'BIGINT', isForeignKey: true },
        { name: 'beneficiary_name', type: 'STRING' },
        { name: 'relationship', type: 'STRING' },
        { name: 'benefit_percentage', type: 'DECIMAL(5,2)' },
      ],
    },
  ],
  
  relationships: [
    {
      from: 'Premium Payment',
      to: 'Insurance Policy',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'policy_id',
      description: 'Payments for policy',
    },
    {
      from: 'Claim',
      to: 'Insurance Policy',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'policy_id',
      description: 'Claims on policy',
    },
    {
      from: 'Beneficiary',
      to: 'Insurance Policy',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'policy_id',
      description: 'Beneficiaries of policy',
    },
  ],
};

// PHYSICAL ERD
export const insuranceRetailPhysicalERD = {
  tables: [
    {
      name: 'bronze.retail_insurance_policies',
      description: 'Insurance policy data',
      source: 'Insurance Platform',
      updateFrequency: 'Daily',
      recordCount: '~3M policies',
      attributes: [
        { name: 'policy_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT' },
        { name: 'policy_number', type: 'VARCHAR(50)' },
        { name: 'policy_type', type: 'VARCHAR(50)' },
        { name: 'policy_status', type: 'VARCHAR(50)' },
        { name: 'effective_date', type: 'DATE' },
        { name: 'expiration_date', type: 'DATE' },
        { name: 'premium_amount', type: 'DECIMAL(18,2)' },
        { name: 'premium_frequency', type: 'VARCHAR(50)' },
        { name: 'coverage_amount', type: 'DECIMAL(18,2)' },
        { name: 'deductible', type: 'DECIMAL(18,2)' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_insurance_premium_payments',
      description: 'Premium payment records',
      source: 'Payment System',
      updateFrequency: 'Real-time',
      recordCount: '~10M payments/year',
      attributes: [
        { name: 'payment_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'policy_id', type: 'BIGINT' },
        { name: 'payment_date', type: 'DATE' },
        { name: 'payment_amount', type: 'DECIMAL(18,2)' },
        { name: 'payment_method', type: 'VARCHAR(50)' },
        { name: 'payment_status', type: 'VARCHAR(50)' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_insurance_claims',
      description: 'Insurance claims data',
      source: 'Claims System',
      updateFrequency: 'Real-time',
      recordCount: '~500K claims/year',
      attributes: [
        { name: 'claim_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'policy_id', type: 'BIGINT' },
        { name: 'claim_number', type: 'VARCHAR(50)' },
        { name: 'claim_date', type: 'DATE' },
        { name: 'claim_type', type: 'VARCHAR(100)' },
        { name: 'claim_amount', type: 'DECIMAL(18,2)' },
        { name: 'claim_status', type: 'VARCHAR(50)' },
        { name: 'approved_amount', type: 'DECIMAL(18,2)' },
        { name: 'payment_date', type: 'DATE' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
    {
      name: 'bronze.retail_insurance_beneficiaries',
      description: 'Policy beneficiary data',
      source: 'Insurance Platform',
      updateFrequency: 'Daily',
      recordCount: '~5M beneficiaries',
      attributes: [
        { name: 'beneficiary_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'policy_id', type: 'BIGINT' },
        { name: 'beneficiary_name', type: 'VARCHAR(200)' },
        { name: 'relationship', type: 'VARCHAR(100)' },
        { name: 'benefit_percentage', type: 'DECIMAL(5,2)' },
        { name: 'created_timestamp', type: 'TIMESTAMP' },
        { name: 'source_system', type: 'VARCHAR(50)' },
      ],
    },
  ],
  
  relationships: [
    {
      from: 'bronze.retail_insurance_premium_payments',
      to: 'bronze.retail_insurance_policies',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'policy_id',
      description: 'Payments for policies',
    },
    {
      from: 'bronze.retail_insurance_claims',
      to: 'bronze.retail_insurance_policies',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'policy_id',
      description: 'Claims on policies',
    },
    {
      from: 'bronze.retail_insurance_beneficiaries',
      to: 'bronze.retail_insurance_policies',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'policy_id',
      description: 'Beneficiaries of policies',
    },
  ],
};

export default {
  insuranceRetailLogicalERD,
  insuranceRetailPhysicalERD,
};
