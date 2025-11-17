import type { Domain } from '../schema-types';
import { personalizationRetailBronzeLayerComplete } from './personalization-retail-bronze-layer';

// Export layers with required naming convention for domain-evaluation.ts
export const personalizationRetailBronzeLayer = personalizationRetailBronzeLayerComplete;

/**
 * PERSONALIZATION-RETAIL DOMAIN - COMPREHENSIVE DEFINITION
 * Machine Learning, Feature Store, and A/B Testing
 */

export const personalizationRetailComprehensive: Domain = {
  id: 'personalization-retail',
  name: 'Personalization-Retail',
  displayName: 'Personalization & ML',
  icon: '🎯',
  
  description: 'ML model outputs, feature store, A/B testing, and real-time personalization engine',
  
  category: 'Analytics & AI',
  priority: 'P0',
  complexity: 'Very High',
  businessValue: 'Critical',
  
  subDomains: [
    'ML Model Predictions',
    'Feature Store',
    'A/B Testing',
    'Personalization Engine',
    'Model Registry',
    'Experimentation',
  ],
  
  keyEntities: [
    'Model Prediction',
    'Feature',
    'A/B Test Variant',
    'Experiment',
    'Personalization Event',
    'ML Model',
  ],
  
  dataSources: [
    {
      name: 'AWS SageMaker / Azure ML',
      type: 'ML Platform',
      refreshFrequency: 'Real-time',
      volumePerDay: '100M predictions',
      integration: 'API + Streaming',
      criticality: 'Mission Critical',
    },
    {
      name: 'Feature Store (Feast/Tecton)',
      type: 'Feature Platform',
      refreshFrequency: 'Real-time + Batch',
      volumePerDay: '500M features',
      integration: 'API',
      criticality: 'Mission Critical',
    },
    {
      name: 'Optimizely / LaunchDarkly',
      type: 'Experimentation Platform',
      refreshFrequency: 'Real-time',
      volumePerDay: '50M assignments',
      integration: 'SDK + API',
      criticality: 'High',
    },
  ],
  
  useCases: [
    'Churn prediction and retention',
    'Customer lifetime value forecasting',
    'Product recommendation engine',
    'Next-best-action decisioning',
    'Real-time personalization',
    'A/B test analysis and optimization',
    'Model performance monitoring',
    'Feature drift detection',
  ],
  
  implementationStatus: 'Complete',
  dataQualityGrade: 'A',
  completenessScore: 100,
  lastUpdated: '2025-01-08',
  
  owner: 'Data Science Team',
  steward: 'ML Engineering Team',
  technicalContact: 'ML Platform Team',
};
