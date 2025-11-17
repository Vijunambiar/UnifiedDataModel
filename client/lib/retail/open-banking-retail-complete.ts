/**
 * OPEN-BANKING-RETAIL COMPLETE DOMAIN
 * 
 * Domain: Open Banking & API Connectivity Retail
 * Coverage: PSD2, Open Banking APIs, third-party apps, data sharing
 * 
 * COMPLETE: Bronze (12) + Silver (9) + Gold (6+4) + Metrics (280)
 */

export const openBankingRetailComplete = {
  domainId: 'open-banking-retail',
  domainName: 'Open-Banking-Retail',
  status: 'completed',
  completionDate: '2025-01-08',
  
  bronze: {
    totalTables: 12,
    estimatedSize: '600GB',
    tables: [
      'bronze.retail_open_banking_consents',
      'bronze.retail_third_party_providers',
      'bronze.retail_api_access_tokens',
      'bronze.retail_api_requests_log',
      'bronze.retail_api_responses_log',
      'bronze.retail_account_information_requests',
      'bronze.retail_payment_initiation_requests',
      'bronze.retail_data_sharing_agreements',
      'bronze.retail_revoked_consents',
      'bronze.retail_api_security_events',
      'bronze.retail_tpp_certifications',
      'bronze.retail_regulatory_reporting',
    ],
  },
  
  silver: {
    totalTables: 9,
    estimatedSize: '350GB',
  },
  
  gold: {
    dimensions: {
      count: 6,
      list: ['dim_third_party_provider', 'dim_api_endpoint', 'dim_consent_type', 'dim_data_category', 'dim_api_version', 'dim_regulatory_framework'],
    },
    facts: {
      count: 4,
      list: ['fact_retail_api_request', 'fact_retail_open_banking_consent', 'fact_retail_data_access', 'fact_retail_payment_initiation'],
    },
    totalTables: 10,
    estimatedSize: '450GB',
  },
  
  metrics: {
    totalMetrics: 280,
    totalCategories: 6,
    categories: [
      { name: 'API Volume Metrics', count: 50 },
      { name: 'Consent Management Metrics', count: 45 },
      { name: 'Third-Party Provider Metrics', count: 45 },
      { name: 'Data Sharing Metrics', count: 50 },
      { name: 'API Performance Metrics', count: 45 },
      { name: 'Security & Compliance Metrics', count: 45 },
    ],
  },
  
  regulatoryCompliance: ['PSD2 (EU)', 'Open Banking Standard (UK)', 'Consumer Data Right (Australia)', 'CFPB 1033 (US)', 'GDPR Data Portability'],
};
