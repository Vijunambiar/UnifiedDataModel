/**
 * CUSTOMER-SERVICE-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 9 Dimensions
 * - 6 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema for customer service analytics
 */

export const customerServiceRetailGoldDimensions = [
  // Dimension 1: Service Request Type
  {
    name: 'gold.dim_service_request_type',
    description: 'Service request type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per request type',
    
    primaryKey: 'request_type_key',
    naturalKey: 'request_type_code',
    
    schema: {
      request_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      request_type_code: "STRING UNIQUE",
      request_type_name: "STRING",
      request_type_description: "STRING",
      
      request_category: "STRING COMMENT 'Account|Card|Loan|Deposit|Payment|Technical|Other'",
      request_subcategory: "STRING",
      
      typical_priority: "STRING COMMENT 'Default priority for this type'",
      typical_severity: "STRING",
      
      requires_specialist: "BOOLEAN",
      requires_manager_approval: "BOOLEAN",
      
      average_resolution_hours: "INTEGER COMMENT 'Historical average'",
      complexity_level: "STRING COMMENT 'Simple|Standard|Complex'",
      
      // SLA TARGETS
      sla_first_response_target_hours: "INTEGER",
      sla_resolution_target_hours: "INTEGER",
      
      is_active: "BOOLEAN",
      created_date: "DATE",
    },
  },
  
  // Dimension 2: Service Agent
  {
    name: 'gold.dim_service_agent',
    description: 'Service agent dimension',
    type: 'SCD Type 2',
    grain: 'One row per agent per effective period',
    
    primaryKey: 'agent_key',
    naturalKey: 'agent_id',
    
    schema: {
      agent_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      agent_id: "BIGINT",
      employee_id: "BIGINT",
      
      agent_name: "STRING",
      
      // ROLE
      agent_role: "STRING COMMENT 'CSR|Senior CSR|Specialist|Supervisor|Manager'",
      agent_level: "STRING COMMENT 'Junior|Mid|Senior|Lead'",
      
      team_name: "STRING",
      team_id: "STRING",
      
      supervisor_agent_key: "BIGINT COMMENT 'FK to dim_service_agent'",
      
      // LOCATION
      location: "STRING",
      location_type: "STRING COMMENT 'Onshore|Offshore|Remote'",
      location_city: "STRING",
      location_state: "STRING",
      location_country: "STRING",
      
      timezone: "STRING",
      
      // STATUS
      agent_status: "STRING",
      is_active: "BOOLEAN",
      
      hire_date: "DATE",
      termination_date: "DATE",
      
      tenure_band: "STRING COMMENT '<1yr|1-2yr|2-5yr|5-10yr|10+yr'",
      
      // SKILLS
      has_phone_skill: "BOOLEAN",
      has_chat_skill: "BOOLEAN",
      has_email_skill: "BOOLEAN",
      has_social_skill: "BOOLEAN",
      
      skill_count: "INTEGER",
      
      languages_supported: "STRING COMMENT 'English|Spanish|English+Spanish'",
      
      // CERTIFICATIONS
      is_product_certified: "BOOLEAN",
      certification_count: "INTEGER",
      
      // PERFORMANCE
      performance_tier: "STRING COMMENT 'Top Performer|Above Average|Average|Below Average'",
      quality_score_band: "STRING COMMENT 'Excellent (90+)|Good (75-89)|Fair (60-74)|Poor (<60)'",
      
      // SCD2
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
    
    hierarchies: [
      {
        name: 'Organizational Hierarchy',
        levels: [
          { level: 1, attribute: 'team_name', description: 'Team' },
          { level: 2, attribute: 'supervisor_agent_key', description: 'Supervisor' },
          { level: 3, attribute: 'agent_key', description: 'Agent' },
        ],
      },
      {
        name: 'Geographic Hierarchy',
        levels: [
          { level: 1, attribute: 'location_country', description: 'Country' },
          { level: 2, attribute: 'location_state', description: 'State' },
          { level: 3, attribute: 'location_city', description: 'City' },
          { level: 4, attribute: 'location', description: 'Call Center' },
        ],
      },
    ],
  },
  
  // Dimension 3: Service Channel
  {
    name: 'gold.dim_service_channel',
    description: 'Customer service channel dimension',
    type: 'SCD Type 1',
    grain: 'One row per channel',
    
    primaryKey: 'channel_key',
    naturalKey: 'channel_code',
    
    schema: {
      channel_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      channel_code: "STRING UNIQUE",
      channel_name: "STRING COMMENT 'Phone|Chat|Email|Branch|Mobile App|Social Media|Web Self-Service'",
      channel_description: "STRING",
      
      channel_category: "STRING COMMENT 'Assisted|Self-Service|Mixed'",
      channel_type: "STRING COMMENT 'Synchronous|Asynchronous'",
      
      is_digital: "BOOLEAN",
      is_real_time: "BOOLEAN",
      is_automated: "BOOLEAN COMMENT 'Bot/IVR capable'",
      
      requires_agent: "BOOLEAN",
      
      supports_screen_sharing: "BOOLEAN",
      supports_file_transfer: "BOOLEAN",
      supports_video: "BOOLEAN",
      
      typical_handle_time_minutes: "INTEGER COMMENT 'Average handle time'",
      cost_per_interaction: "DECIMAL(10,2) COMMENT 'Estimated cost'",
      
      channel_priority: "INTEGER COMMENT '1=Highest priority'",
      
      is_active: "BOOLEAN",
      created_date: "DATE",
    },
  },
  
  // Dimension 4: Priority Level
  {
    name: 'gold.dim_priority_level',
    description: 'Request priority level dimension',
    type: 'SCD Type 1',
    grain: 'One row per priority level',
    
    primaryKey: 'priority_key',
    naturalKey: 'priority_code',
    
    schema: {
      priority_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      priority_code: "STRING UNIQUE",
      priority_name: "STRING COMMENT 'Critical|High|Medium|Low'",
      priority_description: "STRING",
      
      priority_rank: "INTEGER COMMENT '1=Critical, 4=Low'",
      
      target_response_hours: "INTEGER",
      target_resolution_hours: "INTEGER",
      
      requires_immediate_escalation: "BOOLEAN",
      
      color_code: "STRING COMMENT 'For UI display'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 5: Resolution Type
  {
    name: 'gold.dim_resolution_type',
    description: 'Request resolution type dimension',
    type: 'SCD Type 1',
    grain: 'One row per resolution type',
    
    primaryKey: 'resolution_type_key',
    naturalKey: 'resolution_type_code',
    
    schema: {
      resolution_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      resolution_type_code: "STRING UNIQUE",
      resolution_type_name: "STRING COMMENT 'Resolved|Workaround|Duplicate|Cannot Reproduce|No Action Required'",
      resolution_type_description: "STRING",
      
      is_favorable_outcome: "BOOLEAN COMMENT 'Positive resolution'",
      is_permanent_fix: "BOOLEAN COMMENT 'vs. workaround'",
      
      requires_follow_up: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 6: Escalation Reason
  {
    name: 'gold.dim_escalation_reason',
    description: 'Escalation reason taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per escalation reason',
    
    primaryKey: 'escalation_reason_key',
    naturalKey: 'escalation_reason_code',
    
    schema: {
      escalation_reason_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      escalation_reason_code: "STRING UNIQUE",
      escalation_reason_name: "STRING COMMENT 'SLA Breach|Customer Request|Complex Issue|Manager Required|Regulatory'",
      escalation_reason_description: "STRING",
      
      escalation_category: "STRING COMMENT 'SLA|Complexity|Authority|Customer Requested'",
      
      is_preventable: "BOOLEAN COMMENT 'Could have been avoided'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 7: Complaint Type
  {
    name: 'gold.dim_complaint_type',
    description: 'Formal complaint type dimension',
    type: 'SCD Type 1',
    grain: 'One row per complaint type',
    
    primaryKey: 'complaint_type_key',
    naturalKey: 'complaint_type_code',
    
    schema: {
      complaint_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      complaint_type_code: "STRING UNIQUE",
      complaint_type_name: "STRING COMMENT 'Service|Product|Fee|Disclosure|Discrimination|Privacy'",
      complaint_type_description: "STRING",
      
      complaint_category: "STRING",
      complaint_severity: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      is_regulatory_reportable: "BOOLEAN",
      regulatory_category: "STRING COMMENT 'CFPB category'",
      
      cfpb_product_type: "STRING",
      cfpb_issue_type: "STRING",
      
      requires_compliance_review: "BOOLEAN",
      requires_legal_review: "BOOLEAN",
      
      typical_resolution_days: "INTEGER",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 8: Service Queue
  {
    name: 'gold.dim_service_queue',
    description: 'Service queue dimension',
    type: 'SCD Type 2',
    grain: 'One row per queue per effective period',
    
    primaryKey: 'queue_key',
    naturalKey: 'queue_name',
    
    schema: {
      queue_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      queue_name: "STRING",
      queue_description: "STRING",
      
      queue_type: "STRING COMMENT 'General|Product-Specific|VIP|Escalation|Technical'",
      
      channel: "STRING COMMENT 'Phone|Chat|Email'",
      
      is_specialized: "BOOLEAN",
      specialization: "STRING COMMENT 'Cards|Loans|Deposits|Technical|Escalation'",
      
      is_vip_queue: "BOOLEAN",
      
      // SERVICE LEVEL
      service_level_target_seconds: "INTEGER COMMENT 'e.g., 80% in 30 seconds'",
      service_level_target_percentage: "INTEGER COMMENT 'e.g., 80'",
      
      // STAFFING
      typical_agent_count: "INTEGER",
      max_agent_count: "INTEGER",
      
      // SCD2
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 9: Sentiment Category
  {
    name: 'gold.dim_sentiment_category',
    description: 'Customer sentiment categorization',
    type: 'SCD Type 1',
    grain: 'One row per sentiment category',
    
    primaryKey: 'sentiment_key',
    naturalKey: 'sentiment_code',
    
    schema: {
      sentiment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      sentiment_code: "STRING UNIQUE",
      sentiment_name: "STRING COMMENT 'Very Positive|Positive|Neutral|Negative|Very Negative'",
      sentiment_description: "STRING",
      
      sentiment_score_min: "DECIMAL(5,2) COMMENT 'e.g., -1.00'",
      sentiment_score_max: "DECIMAL(5,2) COMMENT 'e.g., -0.51'",
      
      is_positive: "BOOLEAN",
      is_neutral: "BOOLEAN",
      is_negative: "BOOLEAN",
      
      color_code: "STRING COMMENT 'For visualization'",
      
      created_date: "DATE",
    },
  },
];

export const customerServiceRetailGoldFacts = [
  // Fact 1: Service Requests
  {
    name: 'gold.fact_service_requests',
    description: 'Customer service request fact table',
    factType: 'Transaction',
    grain: 'One row per service request',
    
    dimensions: [
      'request_type_key',
      'customer_key',
      'account_key',
      'agent_key (assigned)',
      'channel_key',
      'priority_key',
      'resolution_type_key',
      'request_date_key',
      'resolved_date_key',
      'closed_date_key',
    ],
    
    schema: {
      service_request_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      request_type_key: "BIGINT",
      customer_key: "BIGINT",
      account_key: "BIGINT",
      agent_key: "BIGINT COMMENT 'Assigned agent'",
      channel_key: "BIGINT",
      priority_key: "BIGINT",
      resolution_type_key: "BIGINT",
      
      request_date_key: "INTEGER COMMENT 'YYYYMMDD'",
      opened_date_key: "INTEGER",
      first_response_date_key: "INTEGER",
      resolved_date_key: "INTEGER",
      closed_date_key: "INTEGER",
      
      // DEGENERATE DIMENSIONS
      request_id: "BIGINT UNIQUE",
      request_number: "STRING UNIQUE",
      request_status: "STRING",
      
      // TIMESTAMPS
      request_timestamp: "TIMESTAMP",
      opened_timestamp: "TIMESTAMP",
      first_response_timestamp: "TIMESTAMP",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // MEASURES - COUNTS
      request_count: "INTEGER DEFAULT 1",
      
      customer_contact_count: "INTEGER",
      channel_switch_count: "INTEGER",
      escalation_count: "INTEGER",
      
      // MEASURES - TIME
      time_to_first_response_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      total_handle_time_hours: "DECIMAL(10,2)",
      
      time_in_queue_hours: "DECIMAL(10,2)",
      time_with_agent_hours: "DECIMAL(10,2)",
      
      // MEASURES - SLA
      sla_first_response_variance_hours: "DECIMAL(10,2) COMMENT 'Negative if late'",
      sla_resolution_variance_hours: "DECIMAL(10,2)",
      
      // MEASURES - FINANCIAL
      refund_amount: "DECIMAL(18,2)",
      credit_amount: "DECIMAL(18,2)",
      fee_waived_amount: "DECIMAL(18,2)",
      total_financial_impact: "DECIMAL(18,2)",
      
      // FLAGS
      is_escalated: "BOOLEAN",
      is_complaint: "BOOLEAN",
      is_regulatory_reportable: "BOOLEAN",
      
      is_sla_first_response_met: "BOOLEAN",
      is_sla_resolution_met: "BOOLEAN",
      
      is_resolved: "BOOLEAN",
      is_closed: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 100000000,
    estimatedSize: '20GB',
  },
  
  // Fact 2: Call Center Interactions
  {
    name: 'gold.fact_call_center_interactions',
    description: 'Call center interaction fact table',
    factType: 'Transaction',
    grain: 'One row per call',
    
    dimensions: [
      'customer_key',
      'agent_key',
      'channel_key',
      'queue_key',
      'call_date_key',
      'call_time_key',
    ],
    
    schema: {
      call_interaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      customer_key: "BIGINT",
      agent_key: "BIGINT",
      channel_key: "BIGINT",
      queue_key: "BIGINT",
      
      call_date_key: "INTEGER",
      call_time_key: "INTEGER COMMENT 'HHMM'",
      
      // DEGENERATE DIMENSIONS
      call_id: "BIGINT UNIQUE",
      call_direction: "STRING COMMENT 'Inbound|Outbound'",
      call_type: "STRING",
      call_outcome: "STRING",
      
      service_request_key: "BIGINT COMMENT 'FK to fact_service_requests if applicable'",
      
      // TIMESTAMPS
      call_start_timestamp: "TIMESTAMP",
      call_end_timestamp: "TIMESTAMP",
      
      // MEASURES - COUNTS
      call_count: "INTEGER DEFAULT 1",
      
      hold_count: "INTEGER",
      transfer_count: "INTEGER",
      
      // MEASURES - TIME (all in seconds)
      call_duration_seconds: "INTEGER",
      
      ivr_duration_seconds: "INTEGER",
      queue_duration_seconds: "INTEGER",
      agent_talk_duration_seconds: "INTEGER",
      agent_hold_duration_seconds: "INTEGER",
      agent_wrap_duration_seconds: "INTEGER",
      
      total_handle_time_seconds: "INTEGER COMMENT 'Talk + Hold + Wrap'",
      customer_wait_time_seconds: "INTEGER COMMENT 'IVR + Queue'",
      
      // FLAGS
      is_ivr_self_service_attempted: "BOOLEAN",
      is_ivr_self_service_completed: "BOOLEAN",
      
      is_transferred: "BOOLEAN",
      is_abandoned: "BOOLEAN",
      is_abandoned_in_queue: "BOOLEAN",
      
      is_issue_resolved: "BOOLEAN",
      is_first_call_resolution: "BOOLEAN",
      
      is_cross_sell_attempted: "BOOLEAN",
      is_cross_sell_successful: "BOOLEAN",
      
      is_monitored: "BOOLEAN",
      
      // MEASURES - QUALITY
      call_quality_score: "INTEGER COMMENT '0-100'",
      customer_satisfaction_score: "INTEGER COMMENT '1-5'",
      nps_score: "INTEGER COMMENT '-100 to 100'",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 500000000,
    estimatedSize: '80GB',
  },
  
  // Fact 3: Agent Performance Daily Snapshot
  {
    name: 'gold.fact_agent_performance_daily',
    description: 'Daily agent performance snapshot',
    factType: 'Periodic Snapshot',
    grain: 'One row per agent per day',
    
    dimensions: [
      'agent_key',
      'date_key',
    ],
    
    schema: {
      agent_key: "BIGINT",
      date_key: "INTEGER",
      
      snapshot_date: "DATE",
      
      // VOLUME
      total_interactions: "INTEGER",
      calls_handled: "INTEGER",
      chats_handled: "INTEGER",
      emails_handled: "INTEGER",
      requests_handled: "INTEGER",
      
      // HANDLE TIME
      avg_call_handle_time_seconds: "INTEGER",
      avg_chat_handle_time_seconds: "INTEGER",
      avg_email_handle_time_hours: "DECIMAL(10,2)",
      
      total_talk_time_seconds: "INTEGER",
      total_wrap_time_seconds: "INTEGER",
      
      // QUALITY METRICS
      first_call_resolution_count: "INTEGER",
      total_resolvable_interactions: "INTEGER",
      fcr_rate: "DECIMAL(5,2)",
      
      avg_quality_score: "DECIMAL(5,2)",
      quality_evaluations_count: "INTEGER",
      
      // CUSTOMER SATISFACTION
      avg_csat_score: "DECIMAL(5,2)",
      avg_nps_score: "DECIMAL(5,2)",
      avg_ces_score: "DECIMAL(5,2)",
      
      survey_responses_count: "INTEGER",
      
      // SLA COMPLIANCE
      sla_compliant_count: "INTEGER",
      total_sla_cases: "INTEGER",
      sla_compliance_rate: "DECIMAL(5,2)",
      
      // ESCALATIONS
      escalations_received: "INTEGER",
      escalations_sent: "INTEGER",
      
      // SALES
      cross_sell_attempts: "INTEGER",
      cross_sell_success_count: "INTEGER",
      cross_sell_conversion_rate: "DECIMAL(5,2)",
      
      // ATTENDANCE
      scheduled_hours: "DECIMAL(5,2)",
      actual_hours_worked: "DECIMAL(5,2)",
      adherence_percentage: "DECIMAL(5,2)",
      
      break_time_hours: "DECIMAL(5,2)",
      available_time_hours: "DECIMAL(5,2)",
      
      // PRODUCTIVITY
      utilization_rate: "DECIMAL(5,2) COMMENT 'Active time / Available time'",
      occupancy_rate: "DECIMAL(5,2) COMMENT 'Handle time / Available time'",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 3650000,
    estimatedSize: '8GB',
  },
  
  // Fact 4: Service Quality Metrics
  {
    name: 'gold.fact_service_quality_daily',
    description: 'Daily service quality metrics by channel',
    factType: 'Periodic Snapshot',
    grain: 'One row per channel per day',
    
    dimensions: [
      'channel_key',
      'date_key',
    ],
    
    schema: {
      channel_key: "BIGINT",
      date_key: "INTEGER",
      
      snapshot_date: "DATE",
      
      // VOLUME
      total_interactions: "INTEGER",
      unique_customers: "INTEGER",
      
      // WAIT TIME (seconds)
      avg_wait_time_seconds: "INTEGER",
      median_wait_time_seconds: "INTEGER",
      max_wait_time_seconds: "INTEGER",
      p95_wait_time_seconds: "INTEGER COMMENT '95th percentile'",
      
      // HANDLE TIME (seconds)
      avg_handle_time_seconds: "INTEGER",
      median_handle_time_seconds: "INTEGER",
      
      // ABANDONMENT
      abandoned_count: "INTEGER",
      total_offered_count: "INTEGER",
      abandonment_rate: "DECIMAL(5,2)",
      
      // RESOLUTION
      resolved_count: "INTEGER",
      resolution_rate: "DECIMAL(5,2)",
      
      fcr_count: "INTEGER",
      fcr_rate: "DECIMAL(5,2)",
      
      // CUSTOMER SATISFACTION
      avg_csat_score: "DECIMAL(5,2)",
      avg_nps_score: "DECIMAL(5,2)",
      avg_ces_score: "DECIMAL(5,2)",
      
      total_survey_responses: "INTEGER",
      
      promoters_count: "INTEGER",
      passives_count: "INTEGER",
      detractors_count: "INTEGER",
      
      // SLA
      sla_met_count: "INTEGER",
      total_sla_cases: "INTEGER",
      sla_compliance_rate: "DECIMAL(5,2)",
      
      // ESCALATIONS
      escalation_count: "INTEGER",
      escalation_rate: "DECIMAL(5,2)",
      
      // COMPLAINTS
      complaint_count: "INTEGER",
      complaint_rate: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 50000,
    estimatedSize: '2GB',
  },
  
  // Fact 5: Customer Feedback Survey Responses
  {
    name: 'gold.fact_customer_feedback_surveys',
    description: 'Customer satisfaction survey responses',
    factType: 'Transaction',
    grain: 'One row per survey response',
    
    dimensions: [
      'customer_key',
      'agent_key',
      'channel_key',
      'survey_date_key',
    ],
    
    schema: {
      survey_response_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      customer_key: "BIGINT",
      agent_key: "BIGINT COMMENT 'Agent being rated'",
      channel_key: "BIGINT",
      
      survey_date_key: "INTEGER",
      
      // DEGENERATE DIMENSIONS
      survey_response_id: "BIGINT UNIQUE",
      survey_type: "STRING COMMENT 'Post-Call|Post-Chat|Post-Transaction|Relationship|NPS'",
      
      service_request_key: "BIGINT COMMENT 'FK to fact_service_requests'",
      call_interaction_key: "BIGINT COMMENT 'FK to fact_call_center_interactions'",
      
      // TIMESTAMPS
      survey_sent_timestamp: "TIMESTAMP",
      survey_completed_timestamp: "TIMESTAMP",
      
      // MEASURES - COUNTS
      survey_response_count: "INTEGER DEFAULT 1",
      
      // MEASURES - SCORES
      overall_satisfaction_score: "INTEGER COMMENT '1-5 or 1-10'",
      
      nps_score: "INTEGER COMMENT '-100 to 100'",
      csat_score: "INTEGER",
      ces_score: "INTEGER COMMENT '1-7'",
      
      agent_knowledge_rating: "INTEGER",
      agent_courtesy_rating: "INTEGER",
      issue_resolution_rating: "INTEGER",
      wait_time_rating: "INTEGER",
      ease_of_contact_rating: "INTEGER",
      
      avg_attribute_rating: "DECIMAL(5,2)",
      
      // MEASURES - TIME
      response_time_hours: "DECIMAL(10,2) COMMENT 'Time to complete survey'",
      
      // SENTIMENT
      sentiment_score: "DECIMAL(5,2) COMMENT '-1 to 1'",
      
      // FLAGS
      is_promoter: "BOOLEAN COMMENT 'NPS 9-10'",
      is_passive: "BOOLEAN COMMENT 'NPS 7-8'",
      is_detractor: "BOOLEAN COMMENT 'NPS 0-6'",
      
      is_satisfied: "BOOLEAN COMMENT 'CSAT 4-5'",
      is_dissatisfied: "BOOLEAN COMMENT 'CSAT 1-2'",
      
      is_low_effort: "BOOLEAN COMMENT 'CES 1-3'",
      is_high_effort: "BOOLEAN COMMENT 'CES 5-7'",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 30000000,
    estimatedSize: '6GB',
  },
  
  // Fact 6: Formal Complaints
  {
    name: 'gold.fact_formal_complaints',
    description: 'Formal customer complaints',
    factType: 'Accumulating Snapshot',
    grain: 'One row per formal complaint',
    
    dimensions: [
      'customer_key',
      'account_key',
      'complaint_type_key',
      'agent_key (assigned)',
      'complaint_date_key',
      'resolved_date_key',
      'closed_date_key',
    ],
    
    schema: {
      complaint_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      customer_key: "BIGINT",
      account_key: "BIGINT",
      complaint_type_key: "BIGINT",
      agent_key: "BIGINT",
      channel_key: "BIGINT",
      
      complaint_date_key: "INTEGER",
      opened_date_key: "INTEGER",
      acknowledged_date_key: "INTEGER",
      resolved_date_key: "INTEGER",
      closed_date_key: "INTEGER",
      
      // DEGENERATE DIMENSIONS
      complaint_id: "BIGINT UNIQUE",
      complaint_number: "STRING UNIQUE",
      complaint_status: "STRING",
      
      // TIMESTAMPS
      complaint_timestamp: "TIMESTAMP",
      opened_timestamp: "TIMESTAMP",
      acknowledged_timestamp: "TIMESTAMP",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // MEASURES - COUNTS
      complaint_count: "INTEGER DEFAULT 1",
      
      // MEASURES - TIME
      time_to_acknowledge_hours: "DECIMAL(10,2)",
      time_to_resolve_hours: "DECIMAL(10,2)",
      total_lifecycle_hours: "DECIMAL(10,2)",
      
      // MEASURES - FINANCIAL
      refund_amount: "DECIMAL(18,2)",
      compensation_amount: "DECIMAL(18,2)",
      total_financial_remedy: "DECIMAL(18,2)",
      
      // FLAGS
      is_regulatory_complaint: "BOOLEAN",
      is_reported_to_cfpb: "BOOLEAN",
      is_reported_to_occ: "BOOLEAN",
      
      is_customer_satisfied: "BOOLEAN",
      
      is_resolved: "BOOLEAN",
      is_closed: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP COMMENT 'Updated as complaint progresses'",
    },
    
    estimatedRows: 5000000,
    estimatedSize: '2GB',
  },
];

export const customerServiceRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail customer service domain with dimensional model',
  layer: 'GOLD',
  dimensions: customerServiceRetailGoldDimensions,
  facts: customerServiceRetailGoldFacts,
  totalDimensions: 9,
  totalFacts: 6,
  estimatedSize: '118GB',
  refreshFrequency: 'Daily for snapshots, Real-time/Near-real-time for transactions',
  methodology: 'Kimball Dimensional Modeling',
  
  keyFeatures: [
    'Service request lifecycle tracking with SLA compliance',
    'Multi-channel interaction analysis (phone, chat, email, social)',
    'Agent performance measurement and comparison',
    'Customer satisfaction tracking (CSAT, NPS, CES)',
    'First Call Resolution (FCR) analysis',
    'Service quality metrics by channel',
    'Complaint tracking and regulatory reporting',
    'Escalation analysis and root cause identification',
    'Voice of Customer sentiment analysis',
    'Workforce management integration',
  ],
  
  analyticsCapabilities: [
    'Customer service cost analysis',
    'Agent productivity and quality benchmarking',
    'Channel efficiency comparison',
    'SLA compliance trending',
    'Customer satisfaction drivers',
    'Root cause analysis for escalations',
    'Complaint trend analysis',
    'Self-service adoption and containment',
    'Sentiment trend analysis',
    'Peak hour identification for staffing optimization',
  ],
};
