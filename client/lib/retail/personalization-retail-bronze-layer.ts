import type { Table } from '../schema-types';

/**
 * PERSONALIZATION-RETAIL DOMAIN - BRONZE LAYER
 * 
 * Machine learning model outputs, feature store, and A/B testing infrastructure
 * Enables real-time personalization, next-best-offer, and experimentation
 * 
 * Supports:
 * - ML model prediction storage and monitoring
 * - Feature store (real-time + batch features)
 * - A/B testing and experimentation
 * - Model registry and versioning
 * - Personalization event tracking
 */

export const personalizationRetailBronzeTables: Table[] = [
  // Table 1: ML Model Predictions
  {
    name: 'bronze.retail_ml_model_predictions',
    description: 'Machine learning model prediction outputs for churn, CLV, product affinity, etc.',
    sourceSystem: 'ML_PLATFORM',
    sourceTable: 'MODEL_PREDICTIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per customer per model per prediction timestamp',
    primaryKey: ['prediction_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'prediction_timestamp',
      ranges: ['Daily partitions'],
    },
    
    estimatedRows: 100000000,
    avgRowSize: 1024,
    estimatedSize: '100GB',
    
    schema: {
      // PRIMARY KEYS
      prediction_id: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique prediction identifier'",
      source_system: "STRING PRIMARY KEY COMMENT 'ML platform (SageMaker, DataRobot, etc.)'",
      
      // CUSTOMER
      customer_id: "BIGINT COMMENT 'FK to customer'",
      customer_segment: "STRING COMMENT 'Customer segment at prediction time'",
      
      // MODEL IDENTIFICATION
      model_id: "BIGINT COMMENT 'FK to ml_model_registry'",
      model_name: "STRING COMMENT 'Model name (churn_model_v3, clv_predictor, etc.)'",
      model_version: "STRING COMMENT 'Model version (1.2.3)'",
      model_type: "STRING COMMENT 'Classification|Regression|Ranking|Clustering'",
      
      // PREDICTION TYPE
      prediction_type: "STRING COMMENT 'Churn|CLV|Product Affinity|Cross-Sell|Upsell|Next Best Action|Risk Score'",
      prediction_use_case: "STRING COMMENT 'Marketing|Sales|Risk|Customer Service'",
      
      // PREDICTION OUTPUT
      predicted_value: "STRING COMMENT 'Primary prediction output (class label or numeric value)'",
      predicted_class: "STRING COMMENT 'Predicted class for classification (Churn|No Churn, High|Medium|Low)'",
      predicted_score: "DECIMAL(10,6) COMMENT 'Numeric prediction score (0-1 for probability, any range for regression)'",
      
      // PROBABILITY / CONFIDENCE
      prediction_probability: "DECIMAL(10,6) COMMENT 'Probability of predicted class (0-1)'",
      confidence_score: "DECIMAL(10,6) COMMENT 'Model confidence in prediction (0-1)'",
      confidence_level: "STRING COMMENT 'High|Medium|Low confidence'",
      
      // MULTI-CLASS PROBABILITIES (for classification)
      class_probabilities: "STRING COMMENT 'JSON map of all class probabilities {\"Churn\": 0.75, \"No Churn\": 0.25}'",
      
      // RANKING (for recommendation/ranking models)
      rank: "INTEGER COMMENT 'Rank if this is a ranking prediction (1, 2, 3, ...)'",
      rank_score: "DECIMAL(10,6) COMMENT 'Score used for ranking'",
      
      // FEATURE IMPORTANCE
      top_features: "STRING COMMENT 'JSON array of top influential features [{\"feature\": \"recency\", \"importance\": 0.45}, ...]'",
      feature_values: "STRING COMMENT 'JSON map of all feature values used in prediction'",
      
      // SHAP / EXPLAINABILITY
      shap_values: "STRING COMMENT 'JSON map of SHAP values for explainability'",
      prediction_explanation: "STRING COMMENT 'Human-readable explanation of prediction'",
      
      // TIMING
      prediction_timestamp: "TIMESTAMP COMMENT 'When prediction was made'",
      prediction_date: "DATE COMMENT 'Business date of prediction'",
      
      feature_extraction_timestamp: "TIMESTAMP COMMENT 'When features were extracted'",
      model_inference_timestamp: "TIMESTAMP COMMENT 'When model ran inference'",
      
      // PERFORMANCE METRICS
      model_runtime_ms: "INTEGER COMMENT 'Model inference time in milliseconds'",
      feature_extraction_time_ms: "INTEGER COMMENT 'Time to extract features'",
      total_prediction_time_ms: "INTEGER COMMENT 'Total end-to-end time'",
      
      // PREDICTION CONTEXT
      prediction_context: "STRING COMMENT 'Context where prediction was requested (Homepage|Email|Mobile App|Branch)'",
      session_id: "STRING COMMENT 'User session identifier'",
      request_id: "STRING COMMENT 'API request identifier'",
      
      // BATCH VS REAL-TIME
      prediction_mode: "STRING COMMENT 'Real-Time|Batch|Scheduled'",
      batch_run_id: "BIGINT COMMENT 'Batch run ID if batch prediction'",
      
      // ACTUALS (for model monitoring)
      actual_outcome: "STRING COMMENT 'Actual outcome if known (for model performance tracking)'",
      actual_outcome_date: "DATE COMMENT 'Date actual outcome was observed'",
      
      prediction_correct: "BOOLEAN COMMENT 'Whether prediction was correct (for classification)'",
      prediction_error: "DECIMAL(10,6) COMMENT 'Absolute error (for regression)'",
      
      // DECISION MADE
      action_taken: "STRING COMMENT 'Action taken based on prediction (Offer Sent|Retention Call|No Action)'",
      action_timestamp: "TIMESTAMP",
      
      // MODEL DRIFT DETECTION
      data_drift_score: "DECIMAL(10,6) COMMENT 'Data drift score vs training data'",
      concept_drift_flag: "BOOLEAN COMMENT 'Concept drift detected'",
      
      // BUSINESS IMPACT
      predicted_revenue_impact: "DECIMAL(18,2) COMMENT 'Estimated revenue impact of prediction'",
      predicted_cost_savings: "DECIMAL(18,2) COMMENT 'Estimated cost savings'",
      
      // FLAGS
      is_production: "BOOLEAN COMMENT 'Production prediction vs test/staging'",
      is_override: "BOOLEAN COMMENT 'Prediction was manually overridden'",
      override_reason: "STRING",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 2: ML Features (Feature Store)
  {
    name: 'bronze.retail_ml_features',
    description: 'Feature store for ML model inputs - real-time and batch features',
    sourceSystem: 'FEATURE_STORE',
    sourceTable: 'FEATURES',
    loadType: 'STREAMING',
    
    grain: 'One row per customer per feature per timestamp',
    primaryKey: ['feature_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'feature_timestamp',
      ranges: ['Daily partitions'],
    },
    
    estimatedRows: 500000000,
    avgRowSize: 512,
    estimatedSize: '250GB',
    
    schema: {
      // PRIMARY KEYS
      feature_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      // ENTITY (typically customer)
      customer_id: "BIGINT COMMENT 'Primary entity for features'",
      account_id: "BIGINT COMMENT 'Account-level features'",
      
      // FEATURE IDENTIFICATION
      feature_name: "STRING COMMENT 'Feature name (e.g., avg_balance_30d, login_frequency_7d)'",
      feature_group: "STRING COMMENT 'Feature group/namespace (customer_behavior, transaction_patterns, etc.)'",
      feature_category: "STRING COMMENT 'Demographic|Behavioral|Transactional|Derived'",
      
      // FEATURE VALUE
      feature_value: "STRING COMMENT 'Feature value (stored as string, cast to appropriate type)'",
      feature_value_numeric: "DECIMAL(18,6) COMMENT 'Numeric feature value'",
      feature_value_categorical: "STRING COMMENT 'Categorical feature value'",
      feature_value_boolean: "BOOLEAN COMMENT 'Boolean feature value'",
      
      feature_data_type: "STRING COMMENT 'INTEGER|DECIMAL|STRING|BOOLEAN|ARRAY|JSON'",
      
      // FEATURE METADATA
      feature_version: "STRING COMMENT 'Feature calculation version'",
      feature_timestamp: "TIMESTAMP COMMENT 'When feature was calculated/updated'",
      feature_date: "DATE COMMENT 'Business date of feature'",
      
      // FEATURE TYPE
      feature_type: "STRING COMMENT 'Real-Time|Batch|Streaming|Derived'",
      
      is_real_time: "BOOLEAN COMMENT 'Real-time feature (low latency)'",
      is_batch: "BOOLEAN COMMENT 'Batch feature (daily/hourly)'",
      is_derived: "BOOLEAN COMMENT 'Derived from other features'",
      
      // TIME WINDOW
      time_window: "STRING COMMENT 'Time window for aggregation (7d, 30d, 90d, all-time)'",
      aggregation_function: "STRING COMMENT 'AVG|SUM|COUNT|MIN|MAX|LAST|FIRST'",
      
      // DATA SOURCE
      data_source: "STRING COMMENT 'Source table/system for this feature'",
      calculation_logic: "STRING COMMENT 'SQL/code for feature calculation'",
      
      // FEATURE DEPENDENCIES
      parent_features: "STRING COMMENT 'JSON array of parent features if derived'",
      
      // FEATURE QUALITY
      is_null: "BOOLEAN COMMENT 'Feature value is null'",
      is_default: "BOOLEAN COMMENT 'Using default value (feature unavailable)'",
      
      confidence: "DECIMAL(5,2) COMMENT 'Confidence in feature value (0-100)'",
      data_quality_flag: "BOOLEAN COMMENT 'Data quality issue detected'",
      
      // FRESHNESS
      data_freshness_seconds: "INTEGER COMMENT 'Seconds since underlying data was updated'",
      is_stale: "BOOLEAN COMMENT 'Feature is stale (older than threshold)'",
      
      // USAGE
      used_by_models: "STRING COMMENT 'JSON array of models using this feature'",
      feature_importance_avg: "DECIMAL(10,6) COMMENT 'Average feature importance across models'",
      
      // MONITORING
      min_allowed_value: "DECIMAL(18,6) COMMENT 'Min expected value for anomaly detection'",
      max_allowed_value: "DECIMAL(18,6) COMMENT 'Max expected value'",
      
      is_outlier: "BOOLEAN COMMENT 'Value is an outlier'",
      outlier_score: "DECIMAL(10,6) COMMENT 'Outlier score'",
      
      // SERVING
      served_from_cache: "BOOLEAN COMMENT 'Feature served from cache vs computed'",
      cache_hit_rate: "DECIMAL(5,2) COMMENT 'Cache hit rate for this feature'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 3: A/B Test Variants (Experiment Assignments)
  {
    name: 'bronze.retail_ab_test_variants',
    description: 'A/B test variant assignments - which customers are in which experiment variant',
    sourceSystem: 'EXPERIMENTATION_PLATFORM',
    sourceTable: 'VARIANT_ASSIGNMENTS',
    loadType: 'STREAMING',
    
    grain: 'One row per customer per experiment',
    primaryKey: ['assignment_id', 'source_system'],
    
    estimatedRows: 50000000,
    avgRowSize: 256,
    estimatedSize: '12GB',
    
    schema: {
      // PRIMARY KEYS
      assignment_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      // EXPERIMENT
      experiment_id: "BIGINT COMMENT 'FK to ab_test_experiments'",
      experiment_name: "STRING",
      
      // CUSTOMER
      customer_id: "BIGINT COMMENT 'FK to customer'",
      
      // VARIANT
      variant_id: "STRING COMMENT 'Variant identifier (control, variant_a, variant_b, etc.)'",
      variant_name: "STRING COMMENT 'Human-readable variant name'",
      
      is_control: "BOOLEAN COMMENT 'This is the control variant'",
      is_treatment: "BOOLEAN COMMENT 'This is a treatment variant'",
      
      // ASSIGNMENT
      assignment_date: "DATE COMMENT 'Date customer was assigned to variant'",
      assignment_timestamp: "TIMESTAMP",
      
      assignment_method: "STRING COMMENT 'Random|Stratified|Targeted'",
      assignment_algorithm: "STRING COMMENT 'Hash-based|Manual|ML-based'",
      
      // EXPOSURE
      exposure_count: "INTEGER COMMENT 'Number of times customer was exposed to variant'",
      first_exposure_timestamp: "TIMESTAMP COMMENT 'First time customer saw variant'",
      last_exposure_timestamp: "TIMESTAMP COMMENT 'Most recent exposure'",
      
      // INTERACTION
      interaction_count: "INTEGER COMMENT 'Number of interactions with variant'",
      clicked_flag: "BOOLEAN COMMENT 'Customer clicked/interacted'",
      first_click_timestamp: "TIMESTAMP",
      
      // CONVERSION
      conversion_flag: "BOOLEAN COMMENT 'Customer converted (primary success metric)'",
      conversion_timestamp: "TIMESTAMP",
      conversion_value: "DECIMAL(18,2) COMMENT 'Revenue/value from conversion'",
      
      days_to_conversion: "INTEGER COMMENT 'Days from assignment to conversion'",
      
      // SECONDARY METRICS
      secondary_conversions: "STRING COMMENT 'JSON map of secondary conversion events'",
      
      // CUSTOMER ATTRIBUTES (at assignment time)
      customer_segment: "STRING COMMENT 'Segment at assignment'",
      customer_value_tier: "STRING COMMENT 'High|Medium|Low value'",
      
      // EXCLUSIONS
      is_excluded: "BOOLEAN COMMENT 'Customer excluded from experiment'",
      exclusion_reason: "STRING COMMENT 'Why customer was excluded'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: A/B Test Experiments (Experiment Metadata)
  {
    name: 'bronze.retail_ab_test_experiments',
    description: 'A/B test experiment definitions and configurations',
    sourceSystem: 'EXPERIMENTATION_PLATFORM',
    sourceTable: 'EXPERIMENTS',
    loadType: 'DAILY',
    
    grain: 'One row per experiment',
    primaryKey: ['experiment_id', 'source_system'],
    
    estimatedRows: 500,
    avgRowSize: 2048,
    estimatedSize: '1MB',
    
    schema: {
      // PRIMARY KEYS
      experiment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // EXPERIMENT IDENTIFICATION
      experiment_name: "STRING COMMENT 'Experiment name'",
      experiment_key: "STRING COMMENT 'Unique experiment key'",
      
      // EXPERIMENT TYPE
      experiment_type: "STRING COMMENT 'A/B Test|Multivariate|Bandit|Personalization'",
      
      // HYPOTHESIS
      hypothesis: "STRING COMMENT 'Experiment hypothesis statement'",
      
      // VARIANTS
      variant_count: "INTEGER COMMENT 'Number of variants (including control)'",
      variant_definitions: "STRING COMMENT 'JSON array of variant configurations'",
      
      control_variant_id: "STRING COMMENT 'Identifier of control variant'",
      treatment_variant_ids: "STRING COMMENT 'JSON array of treatment variant IDs'",
      
      // TRAFFIC ALLOCATION
      traffic_allocation_pct: "DECIMAL(5,2) COMMENT 'Percentage of users included in experiment'",
      variant_split: "STRING COMMENT 'JSON map of variant traffic splits {\"control\": 50, \"variant_a\": 50}'",
      
      // SUCCESS METRICS
      primary_metric: "STRING COMMENT 'Primary success metric (e.g., conversion_rate, revenue_per_user)'",
      primary_metric_goal: "STRING COMMENT 'Increase|Decrease|Maximize|Minimize'",
      
      secondary_metrics: "STRING COMMENT 'JSON array of secondary metrics'",
      
      // TARGET AUDIENCE
      target_audience: "STRING COMMENT 'All Customers|Segment-Specific|Geographic|etc.'",
      targeting_rules: "STRING COMMENT 'JSON of targeting criteria'",
      
      inclusion_criteria: "STRING COMMENT 'Who can be included'",
      exclusion_criteria: "STRING COMMENT 'Who must be excluded'",
      
      // DATES
      start_date: "DATE COMMENT 'Experiment start date'",
      end_date: "DATE COMMENT 'Experiment end date (planned)'",
      actual_end_date: "DATE COMMENT 'Actual end date'",
      
      // STATUS
      status: "STRING COMMENT 'Draft|Running|Paused|Completed|Cancelled'",
      
      is_running: "BOOLEAN",
      is_completed: "BOOLEAN",
      
      // STATISTICAL PARAMETERS
      minimum_sample_size: "INTEGER COMMENT 'Minimum sample size per variant'",
      statistical_significance_threshold: "DECIMAL(5,2) COMMENT 'P-value threshold (e.g., 0.05)'",
      confidence_level: "DECIMAL(5,2) COMMENT 'Confidence level (e.g., 95%)'",
      
      minimum_detectable_effect: "DECIMAL(5,2) COMMENT 'MDE - smallest effect size to detect'",
      expected_effect_size: "DECIMAL(5,2) COMMENT 'Expected lift'",
      
      // RESULTS (updated as experiment runs)
      current_sample_size: "INTEGER COMMENT 'Current total participants'",
      current_runtime_days: "INTEGER COMMENT 'Days experiment has been running'",
      
      statistical_significance_achieved: "BOOLEAN COMMENT 'Stat sig achieved for primary metric'",
      p_value: "DECIMAL(10,6) COMMENT 'P-value for primary metric'",
      
      winning_variant_id: "STRING COMMENT 'Variant with best performance'",
      winning_variant_lift: "DECIMAL(10,6) COMMENT 'Lift of winning variant over control'",
      
      // DECISION
      decision: "STRING COMMENT 'Ship Winner|Ship Control|Iterate|Inconclusive'",
      decision_date: "DATE",
      decision_rationale: "STRING",
      
      rollout_plan: "STRING COMMENT 'Plan for rolling out winner'",
      
      // OWNER
      owner: "STRING COMMENT 'Product manager/team owning experiment'",
      stakeholders: "STRING COMMENT 'JSON array of stakeholders'",
      
      // DOCUMENTATION
      description: "STRING COMMENT 'Experiment description'",
      documentation_url: "STRING COMMENT 'Link to detailed documentation'",
      
      // AUDIT
      created_by: "STRING",
      created_date: "DATE",
      last_modified_by: "STRING",
      last_modified_date: "DATE",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 5: Personalization Events
  {
    name: 'bronze.retail_personalization_events',
    description: 'Personalization serving events - what was shown to whom and what happened',
    sourceSystem: 'PERSONALIZATION_ENGINE',
    sourceTable: 'SERVING_EVENTS',
    loadType: 'STREAMING',
    
    grain: 'One row per personalization event',
    primaryKey: ['event_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'event_timestamp',
      ranges: ['Hourly partitions'],
    },
    
    estimatedRows: 1000000000,
    avgRowSize: 512,
    estimatedSize: '500GB',
    
    schema: {
      // PRIMARY KEYS
      event_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",
      
      // CUSTOMER & SESSION
      customer_id: "BIGINT",
      session_id: "STRING",
      device_id: "STRING",
      
      // EVENT DETAILS
      event_type: "STRING COMMENT 'Recommendation Served|Offer Displayed|Content Shown|NBA Suggested'",
      event_timestamp: "TIMESTAMP",
      event_date: "DATE",
      
      // PERSONALIZATION CONTEXT
      context: "STRING COMMENT 'Homepage|Account Dashboard|Mobile App|Email|Branch Tablet'",
      page_url: "STRING",
      placement: "STRING COMMENT 'Hero Banner|Sidebar|Inline|Modal'",
      
      // RECOMMENDATION/OFFER
      recommendation_id: "BIGINT COMMENT 'Unique identifier for this recommendation'",
      recommendation_type: "STRING COMMENT 'Product Recommendation|Content|Offer|Next Best Action'",
      
      recommended_item_id: "BIGINT COMMENT 'Product/offer/content ID'",
      recommended_item_type: "STRING COMMENT 'Product|Offer|Article|Video'",
      recommended_item_name: "STRING",
      
      recommendation_rank: "INTEGER COMMENT 'Rank if multiple items shown (1, 2, 3, ...)'",
      recommendation_score: "DECIMAL(10,6) COMMENT 'Score/confidence for recommendation'",
      
      // PERSONALIZATION ALGORITHM
      algorithm: "STRING COMMENT 'Collaborative Filtering|Content-Based|Hybrid|Rule-Based|ML Model'",
      model_id: "BIGINT COMMENT 'FK to ml_model_registry if ML-based'",
      model_version: "STRING",
      
      // REASONS
      recommendation_reasons: "STRING COMMENT 'JSON array of reasons (Popular|Trending|Similar to X|Based on your activity)'",
      
      // USER INTERACTION
      displayed_flag: "BOOLEAN COMMENT 'Item was actually displayed to user'",
      displayed_timestamp: "TIMESTAMP",
      
      viewed_flag: "BOOLEAN COMMENT 'User viewed the item'",
      viewed_timestamp: "TIMESTAMP",
      view_duration_seconds: "INTEGER",
      
      clicked_flag: "BOOLEAN COMMENT 'User clicked on recommendation'",
      clicked_timestamp: "TIMESTAMP",
      
      dismissed_flag: "BOOLEAN COMMENT 'User explicitly dismissed recommendation'",
      dismissed_timestamp: "TIMESTAMP",
      dismiss_reason: "STRING",
      
      // CONVERSION
      conversion_flag: "BOOLEAN COMMENT 'User took desired action (purchase, apply, etc.)'",
      conversion_timestamp: "TIMESTAMP",
      conversion_value: "DECIMAL(18,2) COMMENT 'Revenue from conversion'",
      
      time_to_conversion_seconds: "INTEGER COMMENT 'Seconds from display to conversion'",
      
      // ENGAGEMENT METRICS
      dwell_time_seconds: "INTEGER COMMENT 'Time spent on recommended item'",
      scroll_depth_pct: "DECIMAL(5,2) COMMENT 'Scroll depth if content'",
      
      // A/B TEST
      experiment_id: "BIGINT COMMENT 'FK to ab_test_experiments if part of test'",
      variant_id: "STRING COMMENT 'Experiment variant'",
      
      // CUSTOMER ATTRIBUTES (at event time)
      customer_segment: "STRING",
      customer_value_tier: "STRING",
      customer_tenure_days: "INTEGER",
      
      // DEVICE & LOCATION
      device_type: "STRING COMMENT 'Desktop|Mobile|Tablet'",
      operating_system: "STRING",
      browser: "STRING",
      
      ip_address: "STRING COMMENT 'IP address (for geo-targeting)'",
      city: "STRING",
      state: "STRING",
      
      // REAL-TIME CONTEXT
      time_of_day: "STRING COMMENT 'Morning|Afternoon|Evening|Night'",
      day_of_week: "STRING",
      is_weekend: "BOOLEAN",
      
      // PERFORMANCE
      recommendation_latency_ms: "INTEGER COMMENT 'Time to generate recommendation'",
      rendering_latency_ms: "INTEGER COMMENT 'Time to render on page'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
    },
  },

  // Table 6: ML Model Registry
  {
    name: 'bronze.retail_ml_model_registry',
    description: 'Machine learning model catalog and metadata registry',
    sourceSystem: 'ML_PLATFORM',
    sourceTable: 'MODEL_REGISTRY',
    loadType: 'DAILY',
    
    grain: 'One row per model version',
    primaryKey: ['model_id', 'source_system'],
    
    estimatedRows: 500,
    avgRowSize: 4096,
    estimatedSize: '2MB',
    
    schema: {
      // PRIMARY KEYS
      model_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // MODEL IDENTIFICATION
      model_name: "STRING COMMENT 'Model name (churn_predictor, clv_model, etc.)'",
      model_key: "STRING COMMENT 'Unique model key'",
      
      model_version: "STRING COMMENT 'Semantic version (1.2.3)'",
      model_version_alias: "STRING COMMENT 'champion|challenger|staging'",
      
      // MODEL TYPE
      model_type: "STRING COMMENT 'Classification|Regression|Ranking|Clustering|Recommendation'",
      algorithm: "STRING COMMENT 'XGBoost|Random Forest|Neural Network|Linear Regression|etc.'",
      
      // USE CASE
      use_case: "STRING COMMENT 'Churn Prediction|CLV|Product Affinity|Next Best Action|Risk Scoring'",
      business_domain: "STRING COMMENT 'Marketing|Sales|Risk|Operations'",
      
      // PREDICTION TARGET
      target_variable: "STRING COMMENT 'What the model predicts'",
      prediction_output_type: "STRING COMMENT 'Binary|Multi-Class|Numeric|Ranking'",
      
      // TRAINING
      training_dataset_id: "STRING COMMENT 'Training dataset identifier'",
      training_start_date: "DATE",
      training_end_date: "DATE",
      training_record_count: "INTEGER COMMENT 'Number of training samples'",
      
      training_framework: "STRING COMMENT 'Scikit-learn|XGBoost|TensorFlow|PyTorch|H2O'",
      training_infrastructure: "STRING COMMENT 'AWS SageMaker|Azure ML|Local|Databricks'",
      
      // FEATURES
      feature_count: "INTEGER COMMENT 'Number of input features'",
      feature_names: "STRING COMMENT 'JSON array of feature names'",
      feature_importance: "STRING COMMENT 'JSON map of feature importance scores'",
      
      // MODEL PERFORMANCE
      performance_metrics: "STRING COMMENT 'JSON map of model metrics {\"auc\": 0.85, \"accuracy\": 0.82, etc.}'",
      
      // Classification metrics
      accuracy: "DECIMAL(5,2) COMMENT 'Accuracy %'",
      precision: "DECIMAL(5,2) COMMENT 'Precision %'",
      recall: "DECIMAL(5,2) COMMENT 'Recall %'",
      f1_score: "DECIMAL(5,2) COMMENT 'F1 score'",
      auc_roc: "DECIMAL(5,2) COMMENT 'Area under ROC curve'",
      
      // Regression metrics
      rmse: "DECIMAL(18,6) COMMENT 'Root mean squared error'",
      mae: "DECIMAL(18,6) COMMENT 'Mean absolute error'",
      r_squared: "DECIMAL(5,2) COMMENT 'R-squared'",
      
      // VALIDATION
      validation_method: "STRING COMMENT 'Cross-Validation|Holdout|Time Series Split'",
      validation_fold_count: "INTEGER",
      
      test_dataset_id: "STRING",
      test_performance_metrics: "STRING COMMENT 'JSON of test set performance'",
      
      // DEPLOYMENT
      deployment_status: "STRING COMMENT 'Production|Staging|Development|Archived'",
      deployment_date: "DATE COMMENT 'Date deployed to production'",
      deployment_environment: "STRING COMMENT 'Prod|Staging|Dev'",
      
      model_endpoint_url: "STRING COMMENT 'API endpoint for serving'",
      model_artifact_path: "STRING COMMENT 'Path to model binary/artifacts'",
      
      // SERVING
      serving_mode: "STRING COMMENT 'Batch|Real-Time|Streaming'",
      avg_inference_latency_ms: "INTEGER COMMENT 'Average inference time'",
      p95_inference_latency_ms: "INTEGER COMMENT '95th percentile latency'",
      
      max_requests_per_second: "INTEGER COMMENT 'Max throughput'",
      
      // MONITORING
      is_monitored: "BOOLEAN COMMENT 'Model performance is actively monitored'",
      monitoring_dashboard_url: "STRING",
      
      last_monitored_date: "DATE",
      last_monitored_performance: "STRING COMMENT 'JSON of latest monitoring metrics'",
      
      performance_degradation_flag: "BOOLEAN COMMENT 'Model performance has degraded'",
      retraining_recommended: "BOOLEAN COMMENT 'Model should be retrained'",
      
      // VERSIONS
      parent_model_id: "BIGINT COMMENT 'Previous version of this model'",
      is_latest_version: "BOOLEAN COMMENT 'This is the latest version'",
      is_champion: "BOOLEAN COMMENT 'This is the current champion model'",
      
      replaced_by_model_id: "BIGINT COMMENT 'Model that replaced this one'",
      deprecated_date: "DATE COMMENT 'Date model was deprecated'",
      
      // GOVERNANCE
      model_owner: "STRING COMMENT 'Data scientist/team who owns model'",
      approver: "STRING COMMENT 'Who approved model for production'",
      approval_date: "DATE",
      
      model_risk_tier: "STRING COMMENT 'Low|Medium|High risk'",
      regulatory_approval_required: "BOOLEAN",
      
      // DOCUMENTATION
      description: "STRING COMMENT 'Model description'",
      documentation_url: "STRING COMMENT 'Link to detailed documentation'",
      model_card_url: "STRING COMMENT 'Link to model card (fairness, bias, etc.)'",
      
      // HYPERPARAMETERS
      hyperparameters: "STRING COMMENT 'JSON map of model hyperparameters'",
      
      // REPRODUCIBILITY
      random_seed: "INTEGER COMMENT 'Random seed for reproducibility'",
      code_repository_url: "STRING COMMENT 'Git repo for training code'",
      code_commit_hash: "STRING COMMENT 'Git commit hash'",
      
      // AUDIT
      created_by: "STRING",
      created_date: "DATE",
      last_modified_date: "DATE",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
];

export const personalizationRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for personalization domain with ML outputs and feature store',
  layer: 'BRONZE',
  tables: personalizationRetailBronzeTables,
  totalTables: 6,
  estimatedSize: '863GB',
  refreshFrequency: 'Real-time streaming for predictions, events, features; Daily for model registry',
  retention: '2 years (predictions), 90 days (events), Forever (model registry)',
  
  sourceIntegrations: [
    'AWS SageMaker / Azure ML (model predictions)',
    'Feature Store (Feast, Tecton, or custom)',
    'Experimentation Platform (Optimizely, LaunchDarkly, VWO)',
    'Personalization Engine (AWS Personalize, custom)',
    'ML Model Registry (MLflow, SageMaker Model Registry)',
  ],
  
  keyCapabilities: [
    'ML model prediction tracking and monitoring',
    'Feature store for real-time and batch features',
    'A/B testing and experimentation',
    'Personalization event tracking',
    'Model performance monitoring',
    'Model registry and versioning',
    'Feature drift detection',
    'Explainability and SHAP values',
  ],
  
  machineLearningPatterns: [
    'Real-time model serving (<100ms latency)',
    'Batch prediction scoring (daily/hourly)',
    'Online feature store (low-latency feature retrieval)',
    'Offline feature store (batch training)',
    'A/B test variant assignment via hashing',
    'Multi-armed bandit optimization',
    'Model champion/challenger framework',
  ],
};
