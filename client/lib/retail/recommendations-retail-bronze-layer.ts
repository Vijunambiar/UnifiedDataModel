import type { Table } from '../schema-types';

/**
 * RECOMMENDATIONS-RETAIL DOMAIN - BRONZE LAYER
 * 
 * Product recommendation outputs, next-best-action, and collaborative filtering data
 * Enables cross-sell, upsell, and personalized product suggestions
 */

export const recommendationsRetailBronzeTables: Table[] = [
  // Table 1: Product Recommendations
  {
    name: 'bronze.retail_product_recommendations',
    description: 'Product recommendation outputs served to customers',
    sourceSystem: 'RECOMMENDATION_ENGINE',
    sourceTable: 'RECOMMENDATIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per recommendation',
    primaryKey: ['recommendation_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'recommendation_timestamp',
      ranges: ['Daily partitions'],
    },
    
    estimatedRows: 200000000,
    avgRowSize: 512,
    estimatedSize: '100GB',
    
    schema: {
      recommendation_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      session_id: "STRING",
      
      recommended_product_id: "BIGINT",
      recommended_product_name: "STRING",
      recommended_product_category: "STRING",
      
      recommendation_rank: "INTEGER COMMENT '1, 2, 3, ... rank in list'",
      recommendation_score: "DECIMAL(10,6) COMMENT 'Confidence/relevance score'",
      
      recommendation_algorithm: "STRING COMMENT 'Collaborative|Content-Based|Hybrid|Popular|Trending'",
      recommendation_context: "STRING COMMENT 'Homepage|Product Page|Cart|Email|Mobile App'",
      
      recommendation_reasons: "STRING COMMENT 'JSON array of reasons'",
      
      recommendation_timestamp: "TIMESTAMP",
      recommendation_date: "DATE",
      
      displayed_flag: "BOOLEAN",
      clicked_flag: "BOOLEAN",
      added_to_cart_flag: "BOOLEAN",
      purchased_flag: "BOOLEAN",
      
      conversion_value: "DECIMAL(18,2)",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Table 2: Recommendation Feedback
  {
    name: 'bronze.retail_recommendation_feedback',
    description: 'Customer feedback and interactions with recommendations',
    sourceSystem: 'RECOMMENDATION_ENGINE',
    sourceTable: 'FEEDBACK',
    loadType: 'STREAMING',
    
    grain: 'One row per feedback event',
    primaryKey: ['feedback_id', 'source_system'],
    
    estimatedRows: 500000000,
    avgRowSize: 256,
    estimatedSize: '125GB',
    
    schema: {
      feedback_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      recommendation_id: "BIGINT",
      customer_id: "BIGINT",
      
      feedback_type: "STRING COMMENT 'Implicit|Explicit'",
      feedback_action: "STRING COMMENT 'View|Click|Dismiss|Purchase|Like|Dislike'",
      
      displayed_flag: "BOOLEAN",
      displayed_timestamp: "TIMESTAMP",
      
      clicked_flag: "BOOLEAN",
      clicked_timestamp: "TIMESTAMP",
      
      dismissed_flag: "BOOLEAN",
      dismissed_timestamp: "TIMESTAMP",
      dismiss_reason: "STRING",
      
      conversion_flag: "BOOLEAN",
      conversion_timestamp: "TIMESTAMP",
      conversion_amount: "DECIMAL(18,2)",
      
      dwell_time_seconds: "INTEGER",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Table 3: Product Affinity Scores
  {
    name: 'bronze.retail_product_affinity_scores',
    description: 'Customer-product affinity matrix for personalized recommendations',
    sourceSystem: 'AFFINITY_MODEL',
    sourceTable: 'AFFINITY_SCORES',
    loadType: 'DAILY',
    
    grain: 'One row per customer per product',
    primaryKey: ['customer_id', 'product_id', 'as_of_date'],
    
    estimatedRows: 50000000,
    avgRowSize: 128,
    estimatedSize: '6GB',
    
    schema: {
      customer_id: "BIGINT",
      product_id: "BIGINT",
      as_of_date: "DATE",
      
      affinity_score: "DECIMAL(10,6) COMMENT 'Likelihood score (0-1)'",
      affinity_rank: "INTEGER COMMENT 'Rank among all products for this customer'",
      
      last_purchased_date: "DATE",
      purchase_frequency: "INTEGER",
      average_purchase_amount: "DECIMAL(18,2)",
      
      propensity_score: "DECIMAL(10,6)",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: Next Best Action
  {
    name: 'bronze.retail_next_best_action',
    description: 'Next-best-action recommendations for customers',
    sourceSystem: 'NBA_ENGINE',
    sourceTable: 'NEXT_BEST_ACTIONS',
    loadType: 'DAILY',
    
    grain: 'One row per customer per recommended action',
    primaryKey: ['action_id', 'source_system'],
    
    estimatedRows: 10000000,
    avgRowSize: 512,
    estimatedSize: '5GB',
    
    schema: {
      action_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      
      action_type: "STRING COMMENT 'Open Savings|Apply for Credit Card|Increase Direct Deposit|etc.'",
      action_recommendation: "STRING",
      action_priority: "INTEGER COMMENT '1=highest priority'",
      
      action_score: "DECIMAL(10,6)",
      expected_value: "DECIMAL(18,2) COMMENT 'Expected revenue from action'",
      
      action_trigger: "STRING COMMENT 'Lifecycle Event|Threshold|Churn Risk|Opportunity'",
      action_expiry_date: "DATE",
      
      action_status: "STRING COMMENT 'Pending|Presented|Accepted|Declined|Expired'",
      
      presented_timestamp: "TIMESTAMP",
      accepted_timestamp: "TIMESTAMP",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Collaborative Filtering Data
  {
    name: 'bronze.retail_collaborative_filtering_data',
    description: 'User-item interaction matrix for collaborative filtering algorithms',
    sourceSystem: 'CLICKSTREAM',
    sourceTable: 'USER_ITEM_INTERACTIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per user-product interaction',
    primaryKey: ['interaction_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'interaction_timestamp',
      ranges: ['Daily partitions'],
    },
    
    estimatedRows: 1000000000,
    avgRowSize: 128,
    estimatedSize: '125GB',
    
    schema: {
      interaction_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      product_id: "BIGINT",
      
      interaction_type: "STRING COMMENT 'View|Click|Add to Cart|Purchase|Search|Like'",
      interaction_timestamp: "TIMESTAMP",
      interaction_date: "DATE",
      
      interaction_value: "DECIMAL(18,2) COMMENT 'Purchase amount if purchase'",
      
      implicit_rating: "DECIMAL(5,2) COMMENT 'Derived rating 1-5'",
      
      session_id: "STRING",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
    },
  },
];

export const recommendationsRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for recommendations domain',
  layer: 'BRONZE',
  tables: recommendationsRetailBronzeTables,
  totalTables: 5,
  estimatedSize: '361GB',
  refreshFrequency: 'Real-time streaming (recommendations, feedback, interactions) + Daily (affinity, NBA)',
  retention: '2 years',
  
  keyCapabilities: [
    'Product recommendation tracking',
    'Recommendation feedback loop',
    'Product affinity modeling',
    'Next-best-action decisioning',
    'Collaborative filtering',
    'Conversion attribution',
  ],
};
