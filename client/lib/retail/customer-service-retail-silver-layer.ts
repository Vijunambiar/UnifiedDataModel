/**
 * CUSTOMER-SERVICE-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Customer Service Retail
 * Area: Retail Banking
 * Purpose: Cleansed, deduplicated, and enriched customer service data
 * 
 * All 14 silver tables for retail customer service domain
 * MDM, SCD Type 2, data quality standards applied
 */

export const customerServiceRetailSilverTables = [
  // Table 1: Service Requests Golden
  {
    name: 'silver.retail_service_requests_golden',
    description: 'Golden record for customer service requests with MDM',
    grain: 'One current row per service request',
    scdType: 'Type 2',
    
    primaryKey: ['request_sk'],
    naturalKey: ['request_id'],
    
    sourceTables: ['bronze.retail_service_requests'],
    
    transformations: [
      'Deduplicate service requests from multiple systems',
      'Standardize request types and categories',
      'Calculate SLA compliance metrics',
      'Enrich with customer master data',
      'Calculate handle time, response time, resolution time',
      'Assign data quality scores',
    ],
    
    schema: {
      request_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key'",
      
      request_id: "BIGINT",
      request_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      // REQUEST DETAILS
      request_date: "DATE",
      request_timestamp: "TIMESTAMP",
      
      request_type_standardized: "STRING COMMENT 'Standardized type'",
      request_category_standardized: "STRING",
      request_subcategory_standardized: "STRING",
      
      request_channel: "STRING",
      request_subject: "STRING",
      request_description: "STRING",
      
      // PRIORITY & SEVERITY
      priority: "STRING",
      severity: "STRING",
      
      // ASSIGNMENT
      assigned_to_agent_id: "BIGINT",
      assigned_to_team: "STRING",
      assignment_timestamp: "TIMESTAMP",
      
      // STATUS
      request_status: "STRING",
      
      // LIFECYCLE TIMESTAMPS
      opened_timestamp: "TIMESTAMP",
      first_response_timestamp: "TIMESTAMP",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // CALCULATED METRICS
      time_to_first_response_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      handle_time_hours: "DECIMAL(10,2)",
      
      // SLA
      sla_first_response_target_hours: "INTEGER",
      sla_resolution_target_hours: "INTEGER",
      
      sla_first_response_met: "BOOLEAN",
      sla_resolution_met: "BOOLEAN",
      
      sla_first_response_variance_hours: "DECIMAL(10,2) COMMENT 'Negative if late'",
      sla_resolution_variance_hours: "DECIMAL(10,2)",
      
      // RESOLUTION
      resolution_code: "STRING",
      resolution_description: "STRING",
      resolution_type: "STRING",
      root_cause: "STRING",
      
      // ESCALATION
      is_escalated: "BOOLEAN",
      escalation_level: "INTEGER",
      escalation_count: "INTEGER",
      
      // CUSTOMER EFFORT
      customer_contact_count: "INTEGER",
      channel_switches: "INTEGER",
      
      // FINANCIAL IMPACT
      total_refund_amount: "DECIMAL(18,2)",
      total_credit_amount: "DECIMAL(18,2)",
      total_fee_waived_amount: "DECIMAL(18,2)",
      total_financial_impact: "DECIMAL(18,2)",
      
      // SENTIMENT
      customer_sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // COMPLIANCE
      is_complaint: "BOOLEAN",
      is_regulatory_reportable: "BOOLEAN",
      regulatory_category: "STRING",
      
      // DATA QUALITY
      data_quality_score: "INTEGER COMMENT '0-100'",
      completeness_score: "INTEGER",
      
      is_complete: "BOOLEAN COMMENT 'All required fields populated'",
      is_valid: "BOOLEAN",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      record_hash: "STRING",
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 2: Call Center Calls Golden
  {
    name: 'silver.retail_call_center_calls_golden',
    description: 'Golden record for call center interactions',
    grain: 'One row per call',
    scdType: 'Type 1',
    
    primaryKey: ['call_sk'],
    naturalKey: ['call_id'],
    
    sourceTables: ['bronze.retail_call_center_calls'],
    
    transformations: [
      'Standardize phone numbers',
      'Calculate call metrics (handle time, hold time, talk time)',
      'Classify call types and outcomes',
      'Link calls to service requests',
      'Enrich with customer and agent data',
    ],
    
    schema: {
      call_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      call_id: "BIGINT UNIQUE",
      
      customer_id: "BIGINT",
      phone_number_standardized: "STRING",
      
      // CALL TIMING
      call_start_timestamp: "TIMESTAMP",
      call_end_timestamp: "TIMESTAMP",
      call_duration_seconds: "INTEGER",
      
      call_direction: "STRING",
      call_type_standardized: "STRING",
      
      // IVR
      ivr_duration_seconds: "INTEGER",
      ivr_self_service_attempted: "BOOLEAN",
      ivr_self_service_completed: "BOOLEAN",
      
      // QUEUE
      queue_name: "STRING",
      queue_duration_seconds: "INTEGER",
      
      // AGENT
      agent_id: "BIGINT",
      agent_team: "STRING",
      agent_location: "STRING",
      
      agent_talk_duration_seconds: "INTEGER",
      agent_hold_duration_seconds: "INTEGER",
      hold_count: "INTEGER",
      agent_wrap_duration_seconds: "INTEGER",
      
      // CALCULATED METRICS
      total_handle_time_seconds: "INTEGER COMMENT 'Talk + Hold + Wrap'",
      customer_wait_time_seconds: "INTEGER COMMENT 'IVR + Queue'",
      
      // OUTCOME
      call_outcome: "STRING",
      
      transfer_count: "INTEGER",
      is_transferred: "BOOLEAN",
      
      is_abandoned: "BOOLEAN",
      abandoned_in_queue: "BOOLEAN",
      
      // RESOLUTION
      issue_resolved: "BOOLEAN",
      first_call_resolution: "BOOLEAN",
      
      request_id: "BIGINT",
      
      // QUALITY
      call_quality_score: "INTEGER",
      monitored_flag: "BOOLEAN",
      
      // CUSTOMER EXPERIENCE
      customer_satisfaction_score: "INTEGER",
      nps_score: "INTEGER",
      
      // SALES
      cross_sell_attempted: "BOOLEAN",
      cross_sell_successful: "BOOLEAN",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 3: Chat Sessions Golden
  {
    name: 'silver.retail_chat_sessions_golden',
    description: 'Golden record for digital chat sessions',
    grain: 'One row per chat session',
    scdType: 'Type 1',
    
    primaryKey: ['chat_session_sk'],
    naturalKey: ['chat_session_id'],
    
    sourceTables: ['bronze.retail_chat_sessions'],
    
    schema: {
      chat_session_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      chat_session_id: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      
      // SESSION TIMING
      session_start_timestamp: "TIMESTAMP",
      session_end_timestamp: "TIMESTAMP",
      session_duration_seconds: "INTEGER",
      
      chat_channel: "STRING",
      
      // QUEUE
      queue_duration_seconds: "INTEGER",
      
      // AGENT
      agent_id: "BIGINT",
      
      is_bot_session: "BOOLEAN",
      bot_to_agent_handoff: "BOOLEAN",
      handoff_timestamp: "TIMESTAMP",
      
      // METRICS
      message_count: "INTEGER",
      customer_message_count: "INTEGER",
      agent_message_count: "INTEGER",
      bot_message_count: "INTEGER",
      
      avg_response_time_seconds: "INTEGER",
      
      // OUTCOME
      session_outcome: "STRING",
      issue_resolved: "BOOLEAN",
      first_contact_resolution: "BOOLEAN",
      
      request_id: "BIGINT",
      
      // EXPERIENCE
      customer_satisfaction_score: "INTEGER",
      
      // SENTIMENT
      overall_sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // TOPICS
      topics_discussed: "STRING COMMENT 'JSON array'",
      intents_detected: "STRING COMMENT 'JSON array'",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 4: Email Cases Golden
  {
    name: 'silver.retail_email_cases_golden',
    description: 'Golden record for email-based service cases',
    grain: 'One row per email case',
    scdType: 'Type 1',
    
    primaryKey: ['email_case_sk'],
    naturalKey: ['email_case_id'],
    
    sourceTables: ['bronze.retail_email_cases'],
    
    schema: {
      email_case_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      email_case_id: "BIGINT UNIQUE",
      
      customer_id: "BIGINT",
      customer_email_address: "STRING",
      
      // TIMING
      received_timestamp: "TIMESTAMP",
      email_subject: "STRING",
      
      // CLASSIFICATION
      case_type: "STRING",
      case_category: "STRING",
      
      // ASSIGNMENT
      assigned_to_agent_id: "BIGINT",
      assignment_timestamp: "TIMESTAMP",
      
      // LIFECYCLE
      opened_timestamp: "TIMESTAMP",
      first_response_timestamp: "TIMESTAMP",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // METRICS
      time_to_first_response_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      
      agent_response_count: "INTEGER",
      customer_response_count: "INTEGER",
      
      // SLA
      sla_response_met: "BOOLEAN",
      sla_resolution_met: "BOOLEAN",
      
      // RESOLUTION
      resolution_code: "STRING",
      
      request_id: "BIGINT",
      
      // SENTIMENT
      sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 5: Service Agents Golden
  {
    name: 'silver.retail_service_agents_golden',
    description: 'Golden record for customer service agents',
    grain: 'One current row per agent',
    scdType: 'Type 2',
    
    primaryKey: ['agent_sk'],
    naturalKey: ['agent_id'],
    
    sourceTables: ['bronze.retail_service_agents'],
    
    schema: {
      agent_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      agent_id: "BIGINT",
      employee_id: "BIGINT",
      
      agent_name: "STRING",
      agent_email: "STRING",
      
      // ROLE
      agent_role: "STRING",
      agent_level: "STRING",
      
      team_name: "STRING",
      supervisor_agent_id: "BIGINT",
      
      // LOCATION
      location: "STRING",
      location_type: "STRING",
      timezone: "STRING",
      
      // STATUS
      agent_status: "STRING",
      is_active: "BOOLEAN",
      
      hire_date: "DATE",
      termination_date: "DATE",
      tenure_years: "DECIMAL(5,2)",
      
      // SKILLS
      skill_tags: "STRING",
      language_skills: "STRING",
      product_certifications: "STRING",
      
      // PERFORMANCE
      quality_score: "INTEGER",
      performance_tier: "STRING",
      
      // CHANNELS
      supports_phone: "BOOLEAN",
      supports_chat: "BOOLEAN",
      supports_email: "BOOLEAN",
      supports_social: "BOOLEAN",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 6: Customer Feedback Aggregated
  {
    name: 'silver.retail_customer_feedback_aggregated',
    description: 'Aggregated customer satisfaction survey results',
    grain: 'One row per survey response',
    scdType: 'Type 1',
    
    primaryKey: ['survey_response_sk'],
    naturalKey: ['survey_response_id'],
    
    sourceTables: ['bronze.retail_customer_feedback_surveys'],
    
    schema: {
      survey_response_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      survey_response_id: "BIGINT UNIQUE",
      
      customer_id: "BIGINT",
      
      // SURVEY
      survey_type: "STRING",
      survey_sent_timestamp: "TIMESTAMP",
      survey_completed_timestamp: "TIMESTAMP",
      
      response_time_hours: "DECIMAL(10,2) COMMENT 'Time to complete survey'",
      
      // RELATED INTERACTION
      request_id: "BIGINT",
      call_id: "BIGINT",
      chat_session_id: "STRING",
      
      // SCORES
      overall_satisfaction_score: "INTEGER",
      
      nps_score: "INTEGER",
      nps_category: "STRING",
      
      csat_score: "INTEGER",
      csat_category: "STRING COMMENT 'Satisfied (4-5)|Neutral (3)|Dissatisfied (1-2)'",
      
      ces_score: "INTEGER",
      ces_category: "STRING COMMENT 'Low Effort (1-3)|High Effort (4-7)'",
      
      // SPECIFIC RATINGS
      agent_knowledge_rating: "INTEGER",
      agent_courtesy_rating: "INTEGER",
      issue_resolution_rating: "INTEGER",
      wait_time_rating: "INTEGER",
      ease_of_contact_rating: "INTEGER",
      
      avg_attribute_rating: "DECIMAL(5,2)",
      
      // TEXT ANALYSIS
      comments: "STRING",
      sentiment_from_comments: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      key_themes: "STRING COMMENT 'JSON array of themes'",
      
      // FLAGS
      is_promoter: "BOOLEAN COMMENT 'NPS 9-10'",
      is_passive: "BOOLEAN COMMENT 'NPS 7-8'",
      is_detractor: "BOOLEAN COMMENT 'NPS 0-6'",
      
      is_satisfied: "BOOLEAN COMMENT 'CSAT 4-5'",
      is_dissatisfied: "BOOLEAN COMMENT 'CSAT 1-2'",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 7: Knowledge Base Articles Enriched
  {
    name: 'silver.retail_knowledge_base_articles_enriched',
    description: 'Enriched knowledge base articles with usage metrics',
    grain: 'One current row per article',
    scdType: 'Type 2',
    
    primaryKey: ['article_sk'],
    naturalKey: ['article_id'],
    
    sourceTables: ['bronze.retail_knowledge_base_articles'],
    
    schema: {
      article_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      article_id: "STRING",
      
      article_title: "STRING",
      article_category: "STRING",
      article_subcategory: "STRING",
      
      article_type: "STRING",
      
      // STATUS
      article_status: "STRING",
      is_published: "BOOLEAN",
      
      published_date: "DATE",
      last_updated_date: "DATE",
      article_age_days: "INTEGER",
      
      // USAGE
      view_count: "INTEGER",
      helpful_count: "INTEGER",
      not_helpful_count: "INTEGER",
      
      total_votes: "INTEGER",
      helpfulness_score: "DECIMAL(5,2)",
      helpfulness_percentage: "DECIMAL(5,2) COMMENT 'Helpful / Total Votes'",
      
      // ENGAGEMENT
      avg_time_on_page_seconds: "INTEGER COMMENT 'From web analytics'",
      bounce_rate: "DECIMAL(5,2) COMMENT 'Users who left immediately'",
      
      // EFFECTIVENESS
      deflection_rate: "DECIMAL(5,2) COMMENT 'Users who did not contact support after viewing'",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 8: Escalations Aggregated
  {
    name: 'silver.retail_case_escalations_aggregated',
    description: 'Aggregated escalation events',
    grain: 'One row per escalation event',
    scdType: 'Type 1',
    
    primaryKey: ['escalation_sk'],
    naturalKey: ['escalation_id'],
    
    sourceTables: ['bronze.retail_case_escalations'],
    
    schema: {
      escalation_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      escalation_id: "BIGINT UNIQUE",
      
      request_id: "BIGINT",
      customer_id: "BIGINT",
      
      // ESCALATION
      escalation_timestamp: "TIMESTAMP",
      escalation_level: "INTEGER",
      
      escalated_from_agent_id: "BIGINT",
      escalated_to_agent_id: "BIGINT",
      
      escalation_reason_standardized: "STRING",
      
      // RESOLUTION
      escalation_resolved: "BOOLEAN",
      resolution_timestamp: "TIMESTAMP",
      
      time_to_resolution_hours: "DECIMAL(10,2)",
      
      resolution_at_level: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 9: Complaints Aggregated
  {
    name: 'silver.retail_formal_complaints_aggregated',
    description: 'Aggregated formal complaint data',
    grain: 'One row per formal complaint',
    scdType: 'Type 1',
    
    primaryKey: ['complaint_sk'],
    naturalKey: ['complaint_id'],
    
    sourceTables: ['bronze.retail_formal_complaints'],
    
    schema: {
      complaint_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      complaint_id: "BIGINT UNIQUE",
      complaint_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      
      // COMPLAINT
      complaint_date: "DATE",
      complaint_timestamp: "TIMESTAMP",
      
      complaint_type_standardized: "STRING",
      complaint_category_standardized: "STRING",
      
      complaint_channel: "STRING",
      
      // REGULATORY
      is_regulatory_complaint: "BOOLEAN",
      cfpb_product_type: "STRING",
      cfpb_issue_type: "STRING",
      
      // LIFECYCLE
      complaint_status: "STRING",
      
      opened_timestamp: "TIMESTAMP",
      acknowledged_timestamp: "TIMESTAMP",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // METRICS
      time_to_acknowledge_hours: "DECIMAL(10,2)",
      time_to_resolve_hours: "DECIMAL(10,2)",
      total_lifecycle_hours: "DECIMAL(10,2)",
      
      // RESOLUTION
      resolution_code: "STRING",
      root_cause_standardized: "STRING",
      
      // FINANCIAL REMEDY
      refund_amount: "DECIMAL(18,2)",
      compensation_amount: "DECIMAL(18,2)",
      total_financial_remedy: "DECIMAL(18,2)",
      
      // CUSTOMER RESPONSE
      customer_satisfied_with_resolution: "BOOLEAN",
      
      // REPORTING
      reported_to_cfpb: "BOOLEAN",
      reported_to_occ: "BOOLEAN",
      
      cfpb_report_date: "DATE",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 10: Social Media Mentions Aggregated
  {
    name: 'silver.retail_social_media_mentions_aggregated',
    description: 'Aggregated social media customer mentions',
    grain: 'One row per mention',
    scdType: 'Type 1',
    
    primaryKey: ['mention_sk'],
    naturalKey: ['mention_id'],
    
    sourceTables: ['bronze.retail_social_media_mentions'],
    
    schema: {
      mention_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      mention_id: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      
      // PLATFORM
      platform: "STRING",
      post_timestamp: "TIMESTAMP",
      
      // AUTHOR
      author_username: "STRING",
      author_follower_count: "INTEGER",
      author_influence_tier: "STRING COMMENT 'Micro|Mid|Macro|Celebrity'",
      
      // ENGAGEMENT
      total_engagement: "INTEGER COMMENT 'Likes + Shares + Comments'",
      engagement_rate: "DECIMAL(5,4) COMMENT 'Engagement / Followers'",
      
      // MENTION
      mention_type: "STRING",
      is_direct_message: "BOOLEAN",
      
      // SENTIMENT
      sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // ISSUE
      requires_response: "BOOLEAN",
      issue_category: "STRING",
      
      // RESPONSE
      responded: "BOOLEAN",
      response_timestamp: "TIMESTAMP",
      
      time_to_response_minutes: "INTEGER",
      
      request_id: "BIGINT",
      
      // DATA QUALITY
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 11: Agent Performance Aggregated
  {
    name: 'silver.retail_agent_performance_aggregated',
    description: 'Daily agent performance metrics',
    grain: 'One row per agent per day',
    
    primaryKey: ['agent_id', 'performance_date'],
    
    sourceTables: [
      'bronze.retail_call_center_calls',
      'bronze.retail_chat_sessions',
      'bronze.retail_email_cases',
      'bronze.retail_service_requests',
    ],
    
    schema: {
      agent_id: "BIGINT PRIMARY KEY",
      performance_date: "DATE PRIMARY KEY",
      
      // VOLUME
      total_interactions: "INTEGER",
      calls_handled: "INTEGER",
      chats_handled: "INTEGER",
      emails_handled: "INTEGER",
      
      // HANDLE TIME
      avg_call_handle_time_seconds: "INTEGER",
      avg_chat_handle_time_seconds: "INTEGER",
      avg_email_handle_time_hours: "DECIMAL(10,2)",
      
      // QUALITY
      first_call_resolution_count: "INTEGER",
      fcr_rate: "DECIMAL(5,2)",
      
      avg_quality_score: "DECIMAL(5,2)",
      
      // CUSTOMER SATISFACTION
      avg_csat_score: "DECIMAL(5,2)",
      avg_nps_score: "DECIMAL(5,2)",
      
      surveys_received: "INTEGER",
      
      // SLA
      sla_compliance_count: "INTEGER",
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
      
      created_date: "DATE",
    },
  },
  
  // Table 12: Service Quality Metrics
  {
    name: 'silver.retail_service_quality_metrics',
    description: 'Aggregated service quality metrics by channel and day',
    grain: 'One row per channel per day',
    
    primaryKey: ['channel', 'metric_date'],
    
    sourceTables: [
      'bronze.retail_call_center_calls',
      'bronze.retail_chat_sessions',
      'bronze.retail_email_cases',
    ],
    
    schema: {
      channel: "STRING PRIMARY KEY COMMENT 'Phone|Chat|Email|Branch|Social'",
      metric_date: "DATE PRIMARY KEY",
      
      // VOLUME
      total_interactions: "INTEGER",
      unique_customers: "INTEGER",
      
      // WAIT TIME
      avg_wait_time_seconds: "INTEGER",
      max_wait_time_seconds: "INTEGER",
      
      // HANDLE TIME
      avg_handle_time_seconds: "INTEGER",
      
      // ABANDONMENT
      abandoned_count: "INTEGER",
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
      
      // SLA
      sla_met_count: "INTEGER",
      sla_compliance_rate: "DECIMAL(5,2)",
      
      // ESCALATIONS
      escalation_count: "INTEGER",
      escalation_rate: "DECIMAL(5,2)",
      
      created_date: "DATE",
    },
  },
  
  // Table 13: IVR Containment Metrics
  {
    name: 'silver.retail_ivr_containment_metrics',
    description: 'IVR self-service containment metrics',
    grain: 'One row per day',
    
    primaryKey: ['metric_date'],
    
    sourceTables: ['bronze.retail_ivr_sessions', 'bronze.retail_call_center_calls'],
    
    schema: {
      metric_date: "DATE PRIMARY KEY",
      
      // VOLUME
      total_ivr_sessions: "INTEGER",
      
      // AUTHENTICATION
      authentication_attempts: "INTEGER",
      authentication_success_count: "INTEGER",
      authentication_success_rate: "DECIMAL(5,2)",
      
      // SELF-SERVICE
      self_service_attempts: "INTEGER",
      self_service_success_count: "INTEGER",
      self_service_success_rate: "DECIMAL(5,2)",
      
      // CONTAINMENT
      ivr_contained_count: "INTEGER COMMENT 'Resolved without agent'",
      ivr_containment_rate: "DECIMAL(5,2)",
      
      transferred_to_agent_count: "INTEGER",
      transfer_rate: "DECIMAL(5,2)",
      
      // ABANDONMENT
      ivr_abandoned_count: "INTEGER",
      ivr_abandonment_rate: "DECIMAL(5,2)",
      
      // MENU NAVIGATION
      avg_menu_selections: "DECIMAL(5,2)",
      avg_ivr_duration_seconds: "INTEGER",
      
      // ERROR HANDLING
      total_errors: "INTEGER",
      avg_errors_per_session: "DECIMAL(5,2)",
      
      created_date: "DATE",
    },
  },
  
  // Table 14: VOC Insights Aggregated
  {
    name: 'silver.retail_voc_insights_aggregated',
    description: 'Voice of Customer aggregated insights',
    grain: 'One row per date',
    
    primaryKey: ['insight_date'],
    
    sourceTables: [
      'bronze.retail_voice_of_customer',
      'bronze.retail_customer_feedback_surveys',
      'bronze.retail_social_media_mentions',
    ],
    
    schema: {
      insight_date: "DATE PRIMARY KEY",
      
      // SENTIMENT
      overall_sentiment: "STRING COMMENT 'Positive|Neutral|Negative'",
      avg_sentiment_score: "DECIMAL(5,2)",
      
      sentiment_distribution_positive_pct: "DECIMAL(5,2)",
      sentiment_distribution_neutral_pct: "DECIMAL(5,2)",
      sentiment_distribution_negative_pct: "DECIMAL(5,2)",
      
      // TOP TOPICS
      top_topic_1: "STRING",
      top_topic_2: "STRING",
      top_topic_3: "STRING",
      top_topic_4: "STRING",
      top_topic_5: "STRING",
      
      // ISSUE CATEGORIES
      top_issue_category_1: "STRING",
      top_issue_category_2: "STRING",
      top_issue_category_3: "STRING",
      
      // SATISFACTION SCORES
      avg_nps_score: "DECIMAL(5,2)",
      avg_csat_score: "DECIMAL(5,2)",
      avg_ces_score: "DECIMAL(5,2)",
      
      // NPS DISTRIBUTION
      promoters_count: "INTEGER",
      passives_count: "INTEGER",
      detractors_count: "INTEGER",
      
      promoters_pct: "DECIMAL(5,2)",
      detractors_pct: "DECIMAL(5,2)",
      
      // TRENDS
      sentiment_trend: "STRING COMMENT 'Improving|Stable|Declining'",
      nps_trend: "STRING",
      csat_trend: "STRING",
      
      created_date: "DATE",
    },
  },
];

export const customerServiceRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail customer service domain',
  layer: 'SILVER',
  tables: customerServiceRetailSilverTables,
  totalTables: 14,
  estimatedSize: '650GB',
  refreshFrequency: 'Daily batch processing with SCD2 tracking',
  retention: '7 years',
  
  keyFeatures: [
    'Master Data Management (MDM) for service requests and agents',
    'SCD Type 2 for agent and article history tracking',
    'Data quality scoring and validation',
    'Standardization of request types, categories, and outcomes',
    'SLA calculation and compliance tracking',
    'Customer satisfaction metric aggregation (CSAT, NPS, CES)',
    'Agent performance aggregation',
    'Channel-specific quality metrics',
    'IVR containment and self-service metrics',
    'Voice of Customer sentiment analysis',
  ],
};
