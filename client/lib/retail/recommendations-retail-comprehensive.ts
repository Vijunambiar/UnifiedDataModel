import type { Domain } from '../schema-types';
import { recommendationsRetailBronzeLayerComplete } from './recommendations-retail-bronze-layer';

// Export layers with required naming convention for domain-evaluation.ts
export const recommendationsRetailBronzeLayer = recommendationsRetailBronzeLayerComplete;

/**
 * RECOMMENDATIONS-RETAIL DOMAIN - COMPREHENSIVE DEFINITION
 * Product Recommendations, Next-Best-Action, and Collaborative Filtering
 */

export const recommendationsRetailComprehensive: Domain = {
  id: 'recommendations-retail',
  name: 'Recommendations-Retail',
  displayName: 'Product Recommendations',
  icon: '💡',
  
  description: 'Product recommendation engine, next-best-action, collaborative filtering, and propensity modeling',
  
  category: 'Analytics & AI',
  priority: 'P0',
  complexity: 'High',
  businessValue: 'Critical',
  
  subDomains: [
    'Product Recommendations',
    'Next Best Action (NBA)',
    'Product Affinity',
    'Collaborative Filtering',
    'Recommendation Feedback',
  ],
  
  keyEntities: [
    'Product Recommendation',
    'Recommendation Feedback',
    'Product Affinity Score',
    'Next Best Action',
    'User-Item Interaction',
  ],
  
  dataSources: [
    {
      name: 'Recommendation Engine',
      type: 'ML Platform',
      refreshFrequency: 'Real-time',
      volumePerDay: '200M recommendations',
      integration: 'API + Streaming',
      criticality: 'Mission Critical',
    },
    {
      name: 'Clickstream Data',
      type: 'Event Stream',
      refreshFrequency: 'Real-time',
      volumePerDay: '500M events',
      integration: 'Kafka Streaming',
      criticality: 'High',
    },
  ],
  
  useCases: [
    'Product cross-sell recommendations',
    'Next-best-offer decisioning',
    'Collaborative filtering (similar users)',
    'Content-based filtering (similar products)',
    'Recommendation performance tracking',
    'A/B testing recommendation algorithms',
  ],
  
  implementationStatus: 'Complete',
  dataQualityGrade: 'A',
  completenessScore: 100,
  lastUpdated: '2025-01-08',
  
  owner: 'Product Team',
  steward: 'Data Science Team',
  technicalContact: 'ML Platform Team',
};
