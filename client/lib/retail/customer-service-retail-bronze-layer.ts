/**
 * CUSTOMER-SERVICE-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * Domain: Customer Service Retail
 * Area: Retail Banking
 * Purpose: Contact center, customer support, service requests, complaints
 * 
 * All 18 bronze tables for retail customer service domain
 * Industry-accurate, comprehensive, enterprise-ready
 */

export const customerServiceRetailBronzeTables = [
  // Table 1: Service Requests
  {
    name: 'bronze.retail_service_requests',
    description: 'Customer service request transactions',
    sourceSystem: 'CRM_SYSTEM',
    sourceTable: 'SERVICE_REQUESTS',
    loadType: 'CDC',
    
    grain: 'One row per service request',
    primaryKey: ['request_id', 'source_system'],
    
    estimatedRows: 100000000,
    avgRowSize: 2048,
    estimatedSize: '200GB',
    
    schema: {
      // PRIMARY KEYS
      request_id: "BIGINT PRIMARY KEY COMMENT 'Unique service request identifier'",
      source_system: "STRING PRIMARY KEY",
      
      // NATURAL KEYS
      request_number: "STRING UNIQUE COMMENT 'User-facing request number'",
      request_uuid: "STRING UNIQUE",
      
      // CUSTOMER
      customer_id: "BIGINT COMMENT 'FK to customer'",
      account_id: "BIGINT COMMENT 'Related account'",
      
      // REQUEST DETAILS
      request_date: "DATE",
      request_timestamp: "TIMESTAMP",
      
      request_type: "STRING COMMENT 'Account Issue|Transaction Dispute|Card Issue|Loan Inquiry|Fee Dispute|General Inquiry'",
      request_category: "STRING COMMENT 'Account|Card|Loan|Deposit|Payment|Technical|Other'",
      request_subcategory: "STRING",
      
      request_channel: "STRING COMMENT 'Phone|Email|Chat|Branch|Mobile App|Web|Social Media'",
      
      request_subject: "STRING COMMENT 'Brief subject/title'",
      request_description: "STRING COMMENT 'Detailed description'",
      
      // PRIORITY & SEVERITY
      priority: "STRING COMMENT 'Low|Medium|High|Critical'",
      severity: "STRING COMMENT 'Minor|Moderate|Major|Critical'",
      
      // ASSIGNMENT
      assigned_to_agent_id: "BIGINT COMMENT 'Service agent assigned'",
      assigned_to_team: "STRING COMMENT 'Support team name'",
      assigned_to_queue: "STRING COMMENT 'Service queue'",
      
      assignment_timestamp: "TIMESTAMP",
      
      // STATUS & LIFECYCLE
      request_status: "STRING COMMENT 'New|Assigned|In Progress|Pending Customer|Resolved|Closed|Cancelled'",
      status_change_timestamp: "TIMESTAMP",
      
      opened_timestamp: "TIMESTAMP COMMENT 'When request was opened'",
      first_response_timestamp: "TIMESTAMP COMMENT 'When agent first responded'",
      resolved_timestamp: "TIMESTAMP COMMENT 'When issue was resolved'",
      closed_timestamp: "TIMESTAMP COMMENT 'When request was closed'",
      
      // SLA
      sla_target_response_hours: "INTEGER COMMENT 'Target first response time'",
      sla_target_resolution_hours: "INTEGER COMMENT 'Target resolution time'",
      
      sla_first_response_met: "BOOLEAN",
      sla_resolution_met: "BOOLEAN",
      
      // RESOLUTION
      resolution_code: "STRING",
      resolution_description: "STRING",
      resolution_type: "STRING COMMENT 'Resolved|Workaround|Duplicate|Cannot Reproduce|No Action Required'",
      
      root_cause: "STRING COMMENT 'Identified root cause'",
      
      // ESCALATION
      is_escalated: "BOOLEAN",
      escalation_level: "INTEGER COMMENT '0=Not escalated, 1=Level 1, 2=Level 2, etc.'",
      escalated_to_agent_id: "BIGINT",
      escalation_timestamp: "TIMESTAMP",
      escalation_reason: "STRING",
      
      // RELATED CASES
      parent_request_id: "BIGINT COMMENT 'Parent request if this is a follow-up'",
      is_follow_up: "BOOLEAN",
      related_request_ids: "STRING COMMENT 'JSON array of related request IDs'",
      
      // CUSTOMER EFFORT
      customer_contact_count: "INTEGER COMMENT 'Number of times customer contacted us'",
      channel_switches: "INTEGER COMMENT 'Number of times customer switched channels'",
      
      // PRODUCT/SERVICE INVOLVED
      product_type: "STRING COMMENT 'Checking|Savings|Credit Card|Loan|etc.'",
      product_id: "STRING",
      
      transaction_id: "BIGINT COMMENT 'Related transaction if applicable'",
      transaction_amount: "DECIMAL(18,2)",
      
      // FINANCIAL IMPACT
      refund_amount: "DECIMAL(18,2) COMMENT 'Refund issued'",
      credit_amount: "DECIMAL(18,2) COMMENT 'Credit applied'",
      fee_waived_amount: "DECIMAL(18,2) COMMENT 'Fees waived'",
      
      // SENTIMENT & SATISFACTION
      customer_sentiment: "STRING COMMENT 'Positive|Neutral|Negative|Angry'",
      sentiment_score: "DECIMAL(5,2) COMMENT '-1 to 1'",
      
      // COMPLIANCE
      is_complaint: "BOOLEAN COMMENT 'Formal complaint flag'",
      is_regulatory_reportable: "BOOLEAN COMMENT 'Must be reported to regulators'",
      regulatory_category: "STRING COMMENT 'CFPB category if reportable'",
      
      // TAGS & CLASSIFICATION
      tags: "STRING COMMENT 'JSON array of tags'",
      auto_classification_confidence: "DECIMAL(5,4) COMMENT 'ML classification confidence'",
      
      // AUDIT TRAIL (REQUIRED)
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Call Center Calls
  {
    name: 'bronze.retail_call_center_calls',
    description: 'Call center interaction records',
    sourceSystem: 'CALL_CENTER_SYSTEM',
    sourceTable: 'CALL_RECORDS',
    loadType: 'STREAMING',
    
    grain: 'One row per phone call',
    primaryKey: ['call_id', 'source_system'],
    
    estimatedRows: 500000000,
    avgRowSize: 1024,
    estimatedSize: '500GB',
    
    schema: {
      call_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // CUSTOMER
      customer_id: "BIGINT COMMENT 'Identified customer'",
      phone_number: "STRING COMMENT 'Calling phone number'",
      ani: "STRING COMMENT 'Automatic Number Identification'",
      
      // CALL DETAILS
      call_start_timestamp: "TIMESTAMP",
      call_end_timestamp: "TIMESTAMP",
      call_duration_seconds: "INTEGER",
      
      call_direction: "STRING COMMENT 'Inbound|Outbound|Transfer'",
      call_type: "STRING COMMENT 'Service|Sales|Collection|Retention|Fraud Alert'",
      
      // IVR
      ivr_entry_point: "STRING COMMENT 'Which IVR menu customer entered from'",
      ivr_path: "STRING COMMENT 'IVR menu options selected'",
      ivr_duration_seconds: "INTEGER",
      ivr_self_service_attempted: "BOOLEAN",
      ivr_self_service_completed: "BOOLEAN",
      
      // QUEUE
      queue_name: "STRING",
      queue_timestamp: "TIMESTAMP COMMENT 'When call entered queue'",
      queue_duration_seconds: "INTEGER COMMENT 'Time spent in queue'",
      
      // AGENT
      agent_id: "BIGINT COMMENT 'Service agent who handled call'",
      agent_team: "STRING",
      agent_location: "STRING COMMENT 'Call center location'",
      
      agent_answer_timestamp: "TIMESTAMP",
      agent_talk_duration_seconds: "INTEGER",
      agent_hold_duration_seconds: "INTEGER",
      hold_count: "INTEGER COMMENT 'Number of times customer was put on hold'",
      
      agent_wrap_duration_seconds: "INTEGER COMMENT 'After-call work time'",
      
      // CALL OUTCOME
      call_outcome: "STRING COMMENT 'Resolved|Escalated|Transferred|Abandoned|Dropped'",
      
      transfer_count: "INTEGER",
      transferred_to_agent_id: "BIGINT",
      transferred_to_queue: "STRING",
      
      is_abandoned: "BOOLEAN COMMENT 'Customer hung up before agent answered'",
      abandoned_in_queue: "BOOLEAN",
      
      // ISSUE RESOLUTION
      issue_resolved: "BOOLEAN COMMENT 'Issue resolved on this call'",
      first_call_resolution: "BOOLEAN COMMENT 'FCR - Resolved on first call'",
      
      request_id: "BIGINT COMMENT 'FK to service request if created'",
      
      // CALL QUALITY
      call_recording_id: "STRING COMMENT 'Call recording file ID'",
      call_quality_score: "INTEGER COMMENT '0-100 from QA review'",
      
      monitored_flag: "BOOLEAN COMMENT 'Call was monitored for quality'",
      
      // CUSTOMER EXPERIENCE
      customer_satisfaction_score: "INTEGER COMMENT '1-5 from post-call survey'",
      nps_score: "INTEGER COMMENT '-100 to 100'",
      
      // SALES & CROSS-SELL
      cross_sell_attempted: "BOOLEAN",
      cross_sell_product: "STRING",
      cross_sell_successful: "BOOLEAN",
      
      // TELEPHONY
      dnis: "STRING COMMENT 'Dialed Number Identification Service'",
      trunk_group: "STRING",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Chat Sessions
  {
    name: 'bronze.retail_chat_sessions',
    description: 'Digital chat and messaging sessions',
    sourceSystem: 'CHAT_SYSTEM',
    sourceTable: 'CHAT_SESSIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per chat session',
    primaryKey: ['chat_session_id', 'source_system'],
    
    estimatedRows: 80000000,
    avgRowSize: 1536,
    estimatedSize: '120GB',
    
    schema: {
      chat_session_id: "STRING PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      
      // SESSION DETAILS
      session_start_timestamp: "TIMESTAMP",
      session_end_timestamp: "TIMESTAMP",
      session_duration_seconds: "INTEGER",
      
      chat_channel: "STRING COMMENT 'Web Chat|Mobile App Chat|SMS|WhatsApp|Facebook Messenger'",
      
      // QUEUE
      queue_name: "STRING",
      queue_duration_seconds: "INTEGER",
      
      // AGENT
      agent_id: "BIGINT COMMENT 'NULL if bot-only session'",
      agent_join_timestamp: "TIMESTAMP",
      
      is_bot_session: "BOOLEAN COMMENT 'Handled entirely by chatbot'",
      bot_to_agent_handoff: "BOOLEAN COMMENT 'Bot transferred to human agent'",
      handoff_timestamp: "TIMESTAMP",
      handoff_reason: "STRING",
      
      // CHAT METRICS
      message_count: "INTEGER COMMENT 'Total messages in session'",
      customer_message_count: "INTEGER",
      agent_message_count: "INTEGER",
      bot_message_count: "INTEGER",
      
      avg_response_time_seconds: "INTEGER COMMENT 'Average time for agent to respond'",
      
      // SESSION OUTCOME
      session_outcome: "STRING COMMENT 'Resolved|Escalated|Abandoned|Bot Resolved'",
      
      issue_resolved: "BOOLEAN",
      first_contact_resolution: "BOOLEAN",
      
      request_id: "BIGINT COMMENT 'FK to service request if created'",
      
      // CUSTOMER EXPERIENCE
      customer_satisfaction_score: "INTEGER COMMENT '1-5 from post-chat survey'",
      
      // SENTIMENT
      overall_sentiment: "STRING COMMENT 'Positive|Neutral|Negative'",
      sentiment_trend: "STRING COMMENT 'Improving|Stable|Declining'",
      
      // CHAT CONTENT
      chat_transcript_id: "STRING COMMENT 'Full chat transcript file ID'",
      
      topics_discussed: "STRING COMMENT 'JSON array of topics'",
      intents_detected: "STRING COMMENT 'JSON array of detected customer intents'",
      
      // DEVICE
      device_type: "STRING COMMENT 'Desktop|Mobile|Tablet'",
      browser: "STRING",
      operating_system: "STRING",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 4: Email Cases
  {
    name: 'bronze.retail_email_cases',
    description: 'Email-based customer service cases',
    sourceSystem: 'EMAIL_CASE_SYSTEM',
    sourceTable: 'EMAIL_CASES',
    loadType: 'CDC',
    
    grain: 'One row per email case',
    primaryKey: ['email_case_id', 'source_system'],
    
    estimatedRows: 50000000,
    avgRowSize: 2048,
    estimatedSize: '100GB',
    
    schema: {
      email_case_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      customer_email_address: "STRING",
      
      // EMAIL DETAILS
      received_timestamp: "TIMESTAMP",
      email_subject: "STRING",
      email_body: "STRING",
      email_attachments_count: "INTEGER",
      
      // CLASSIFICATION
      case_type: "STRING",
      case_category: "STRING",
      auto_classification_confidence: "DECIMAL(5,4)",
      
      // ASSIGNMENT
      assigned_to_agent_id: "BIGINT",
      assigned_to_queue: "STRING",
      assignment_timestamp: "TIMESTAMP",
      
      // STATUS
      case_status: "STRING",
      opened_timestamp: "TIMESTAMP",
      first_response_timestamp: "TIMESTAMP",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // RESPONSES
      agent_response_count: "INTEGER COMMENT 'Number of agent email responses'",
      customer_response_count: "INTEGER COMMENT 'Number of customer email replies'",
      
      // SLA
      sla_response_met: "BOOLEAN",
      sla_resolution_met: "BOOLEAN",
      
      // RESOLUTION
      resolution_code: "STRING",
      resolution_description: "STRING",
      
      request_id: "BIGINT COMMENT 'FK to service request'",
      
      // SENTIMENT
      sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 5: Service Agents
  {
    name: 'bronze.retail_service_agents',
    description: 'Customer service agent master data',
    sourceSystem: 'HR_SYSTEM',
    sourceTable: 'SERVICE_AGENTS',
    loadType: 'DAILY',
    
    grain: 'One row per agent per day',
    primaryKey: ['agent_id', 'snapshot_date', 'source_system'],
    
    schema: {
      agent_id: "BIGINT PRIMARY KEY",
      snapshot_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      employee_id: "BIGINT COMMENT 'FK to employee master'",
      
      agent_name: "STRING",
      agent_email: "STRING",
      
      // ROLE & TEAM
      agent_role: "STRING COMMENT 'CSR|Senior CSR|Specialist|Supervisor|Manager'",
      agent_level: "STRING COMMENT 'Junior|Mid|Senior|Lead'",
      
      team_name: "STRING",
      team_id: "STRING",
      
      supervisor_agent_id: "BIGINT",
      
      // LOCATION
      location: "STRING COMMENT 'Call center location'",
      location_type: "STRING COMMENT 'Onshore|Offshore|Remote'",
      
      timezone: "STRING",
      
      // STATUS
      agent_status: "STRING COMMENT 'Active|On Leave|Terminated'",
      
      hire_date: "DATE",
      termination_date: "DATE",
      
      // SKILLS
      skill_tags: "STRING COMMENT 'JSON array of skills'",
      language_skills: "STRING COMMENT 'JSON array of languages'",
      
      product_certifications: "STRING COMMENT 'JSON array'",
      
      // PERFORMANCE
      quality_score: "INTEGER COMMENT '0-100'",
      performance_tier: "STRING COMMENT 'Top|Above Average|Average|Below Average'",
      
      // CHANNELS
      supports_phone: "BOOLEAN",
      supports_chat: "BOOLEAN",
      supports_email: "BOOLEAN",
      supports_social: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 6: Customer Feedback Surveys
  {
    name: 'bronze.retail_customer_feedback_surveys',
    description: 'Customer satisfaction survey responses',
    sourceSystem: 'SURVEY_SYSTEM',
    sourceTable: 'SURVEY_RESPONSES',
    loadType: 'BATCH',
    
    grain: 'One row per survey response',
    primaryKey: ['survey_response_id', 'source_system'],
    
    schema: {
      survey_response_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      
      // SURVEY
      survey_id: "STRING",
      survey_name: "STRING",
      survey_type: "STRING COMMENT 'Post-Call|Post-Chat|Post-Transaction|Relationship|NPS'",
      
      survey_sent_timestamp: "TIMESTAMP",
      survey_completed_timestamp: "TIMESTAMP",
      
      // RELATED INTERACTION
      request_id: "BIGINT COMMENT 'Related service request'",
      call_id: "BIGINT COMMENT 'Related call'",
      chat_session_id: "STRING COMMENT 'Related chat session'",
      
      // SCORES
      overall_satisfaction_score: "INTEGER COMMENT '1-5 or 1-10 scale'",
      
      nps_score: "INTEGER COMMENT '-100 to 100 (Promoter 9-10, Passive 7-8, Detractor 0-6)'",
      nps_category: "STRING COMMENT 'Promoter|Passive|Detractor'",
      
      csat_score: "INTEGER COMMENT 'Customer Satisfaction Score'",
      ces_score: "INTEGER COMMENT 'Customer Effort Score 1-7'",
      
      // SPECIFIC RATINGS
      agent_knowledge_rating: "INTEGER",
      agent_courtesy_rating: "INTEGER",
      issue_resolution_rating: "INTEGER",
      wait_time_rating: "INTEGER",
      ease_of_contact_rating: "INTEGER",
      
      // FREE TEXT
      comments: "STRING COMMENT 'Customer feedback comments'",
      suggestions: "STRING COMMENT 'Customer suggestions'",
      
      // SENTIMENT
      sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 7: Knowledge Base Articles
  {
    name: 'bronze.retail_knowledge_base_articles',
    description: 'Self-service knowledge base articles',
    sourceSystem: 'KB_SYSTEM',
    sourceTable: 'KB_ARTICLES',
    loadType: 'DAILY',
    
    grain: 'One row per article per day',
    primaryKey: ['article_id', 'snapshot_date', 'source_system'],
    
    schema: {
      article_id: "STRING PRIMARY KEY",
      snapshot_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      article_title: "STRING",
      article_category: "STRING",
      article_subcategory: "STRING",
      
      article_content: "STRING",
      
      article_type: "STRING COMMENT 'FAQ|How-To|Troubleshooting|Policy'",
      
      // STATUS
      article_status: "STRING COMMENT 'Published|Draft|Archived'",
      
      published_date: "DATE",
      last_updated_date: "DATE",
      
      // METADATA
      author_agent_id: "BIGINT",
      reviewer_agent_id: "BIGINT",
      
      tags: "STRING COMMENT 'JSON array'",
      
      // USAGE
      view_count: "INTEGER",
      helpful_count: "INTEGER COMMENT 'Upvotes'",
      not_helpful_count: "INTEGER COMMENT 'Downvotes'",
      
      helpfulness_score: "DECIMAL(5,2) COMMENT 'Calculated from votes'",
      
      // SEARCH
      search_keywords: "STRING COMMENT 'Keywords for search'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 8: Escalations
  {
    name: 'bronze.retail_case_escalations',
    description: 'Service request escalation events',
    sourceSystem: 'CRM_SYSTEM',
    sourceTable: 'ESCALATIONS',
    loadType: 'CDC',
    
    grain: 'One row per escalation event',
    primaryKey: ['escalation_id', 'source_system'],
    
    schema: {
      escalation_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      request_id: "BIGINT COMMENT 'FK to service request'",
      customer_id: "BIGINT",
      
      // ESCALATION DETAILS
      escalation_timestamp: "TIMESTAMP",
      
      escalation_level: "INTEGER COMMENT '1=Level 1, 2=Level 2, etc.'",
      
      escalated_from_agent_id: "BIGINT",
      escalated_to_agent_id: "BIGINT",
      
      escalated_from_team: "STRING",
      escalated_to_team: "STRING",
      
      // REASON
      escalation_reason: "STRING COMMENT 'SLA Breach|Customer Request|Complex Issue|Manager Required|Regulatory'",
      escalation_reason_detail: "STRING",
      
      // OUTCOME
      escalation_resolved: "BOOLEAN",
      resolution_timestamp: "TIMESTAMP",
      
      resolution_at_level: "INTEGER COMMENT 'Which escalation level resolved it'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 9: Complaints
  {
    name: 'bronze.retail_formal_complaints',
    description: 'Formal customer complaints (regulatory)',
    sourceSystem: 'COMPLAINT_SYSTEM',
    sourceTable: 'FORMAL_COMPLAINTS',
    loadType: 'CDC',
    
    grain: 'One row per formal complaint',
    primaryKey: ['complaint_id', 'source_system'],
    
    schema: {
      complaint_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      complaint_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      
      // COMPLAINT DETAILS
      complaint_date: "DATE",
      complaint_timestamp: "TIMESTAMP",
      
      complaint_type: "STRING COMMENT 'Service|Product|Fee|Disclosure|Discrimination|Privacy'",
      complaint_category: "STRING COMMENT 'CFPB category'",
      
      complaint_channel: "STRING",
      
      complaint_description: "STRING",
      
      // REGULATORY
      is_regulatory_complaint: "BOOLEAN COMMENT 'Must be reported to CFPB'",
      cfpb_product_type: "STRING",
      cfpb_issue_type: "STRING",
      cfpb_subissue_type: "STRING",
      
      // ASSIGNMENT
      assigned_to_agent_id: "BIGINT",
      assigned_to_compliance_officer: "BIGINT",
      
      // STATUS
      complaint_status: "STRING COMMENT 'Received|Under Review|Investigating|Resolved|Closed'",
      
      opened_timestamp: "TIMESTAMP",
      acknowledged_timestamp: "TIMESTAMP COMMENT 'Acknowledgement sent to customer'",
      resolved_timestamp: "TIMESTAMP",
      closed_timestamp: "TIMESTAMP",
      
      // RESOLUTION
      resolution_code: "STRING",
      resolution_description: "STRING",
      
      root_cause: "STRING",
      corrective_action: "STRING",
      
      // FINANCIAL REMEDY
      refund_amount: "DECIMAL(18,2)",
      compensation_amount: "DECIMAL(18,2)",
      
      // CUSTOMER RESPONSE
      customer_satisfied_with_resolution: "BOOLEAN",
      customer_response_date: "DATE",
      
      // REPORTING
      reported_to_cfpb: "BOOLEAN",
      cfpb_report_date: "DATE",
      cfpb_complaint_id: "STRING",
      
      reported_to_occ: "BOOLEAN",
      occ_report_date: "DATE",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 10: Social Media Mentions
  {
    name: 'bronze.retail_social_media_mentions',
    description: 'Social media customer mentions and service requests',
    sourceSystem: 'SOCIAL_MONITORING',
    sourceTable: 'SOCIAL_MENTIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per social media mention',
    primaryKey: ['mention_id', 'source_system'],
    
    schema: {
      mention_id: "STRING PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT COMMENT 'If customer can be identified'",
      
      // PLATFORM
      platform: "STRING COMMENT 'Twitter|Facebook|Instagram|LinkedIn|TikTok'",
      
      // POST DETAILS
      post_timestamp: "TIMESTAMP",
      post_content: "STRING",
      post_url: "STRING",
      
      // AUTHOR
      author_username: "STRING",
      author_display_name: "STRING",
      author_follower_count: "INTEGER",
      author_verified: "BOOLEAN",
      
      // ENGAGEMENT
      like_count: "INTEGER",
      share_count: "INTEGER",
      comment_count: "INTEGER",
      retweet_count: "INTEGER",
      
      // MENTION TYPE
      mention_type: "STRING COMMENT 'Direct Mention|Brand Mention|Hashtag|Comment'",
      
      is_direct_message: "BOOLEAN",
      
      // SENTIMENT
      sentiment: "STRING",
      sentiment_score: "DECIMAL(5,2)",
      
      // ISSUE
      requires_response: "BOOLEAN",
      requires_escalation: "BOOLEAN",
      
      issue_category: "STRING",
      
      // RESPONSE
      responded: "BOOLEAN",
      response_timestamp: "TIMESTAMP",
      response_by_agent_id: "BIGINT",
      response_text: "STRING",
      
      request_id: "BIGINT COMMENT 'FK to service request if created'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 11: IVR Sessions
  {
    name: 'bronze.retail_ivr_sessions',
    description: 'Interactive Voice Response (IVR) session data',
    sourceSystem: 'IVR_SYSTEM',
    sourceTable: 'IVR_SESSIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per IVR session',
    primaryKey: ['ivr_session_id', 'source_system'],
    
    schema: {
      ivr_session_id: "STRING PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT COMMENT 'If customer authenticated'",
      phone_number: "STRING",
      
      // SESSION
      session_start_timestamp: "TIMESTAMP",
      session_end_timestamp: "TIMESTAMP",
      session_duration_seconds: "INTEGER",
      
      // ENTRY POINT
      entry_point: "STRING COMMENT 'Phone number customer dialed'",
      
      // IVR PATH
      menu_path: "STRING COMMENT 'Sequence of menu selections'",
      menu_selections_count: "INTEGER",
      
      // AUTHENTICATION
      authentication_attempted: "BOOLEAN",
      authentication_successful: "BOOLEAN",
      authentication_method: "STRING COMMENT 'PIN|SSN Last 4|Account Number|Voice Biometric'",
      
      // SELF-SERVICE
      self_service_task_attempted: "STRING COMMENT 'Balance Inquiry|Transaction History|Payment|Transfer'",
      self_service_successful: "BOOLEAN",
      
      // OUTCOME
      session_outcome: "STRING COMMENT 'Self-Service Complete|Transferred to Agent|Abandoned|Error'",
      
      transferred_to_queue: "STRING",
      transfer_timestamp: "TIMESTAMP",
      
      is_abandoned: "BOOLEAN",
      
      // CONTAINMENT
      ivr_contained: "BOOLEAN COMMENT 'Issue resolved without agent'",
      
      // ERRORS
      error_count: "INTEGER COMMENT 'Number of errors during session'",
      error_types: "STRING COMMENT 'JSON array of error types'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 12: Service Queue Statistics
  {
    name: 'bronze.retail_service_queue_stats',
    description: 'Real-time service queue statistics',
    sourceSystem: 'CALL_CENTER_SYSTEM',
    sourceTable: 'QUEUE_STATS',
    loadType: 'STREAMING',
    
    grain: 'One row per queue per 5-minute interval',
    primaryKey: ['queue_name', 'interval_timestamp', 'source_system'],
    
    schema: {
      queue_name: "STRING PRIMARY KEY",
      interval_timestamp: "TIMESTAMP PRIMARY KEY COMMENT '5-minute intervals'",
      source_system: "STRING PRIMARY KEY",
      
      // QUEUE DEPTH
      calls_in_queue: "INTEGER COMMENT 'Current calls waiting'",
      max_calls_in_queue: "INTEGER COMMENT 'Peak during interval'",
      
      // AGENTS
      agents_available: "INTEGER",
      agents_on_call: "INTEGER",
      agents_in_after_call_work: "INTEGER",
      agents_on_break: "INTEGER",
      agents_offline: "INTEGER",
      
      // ARRIVALS & DEPARTURES
      calls_offered: "INTEGER COMMENT 'Calls arriving in interval'",
      calls_answered: "INTEGER",
      calls_abandoned: "INTEGER",
      
      // TIMINGS
      avg_wait_time_seconds: "INTEGER",
      max_wait_time_seconds: "INTEGER",
      
      avg_handle_time_seconds: "INTEGER",
      
      // SERVICE LEVEL
      service_level_target_seconds: "INTEGER COMMENT 'e.g., 80% in 30 seconds'",
      service_level_achieved_pct: "DECIMAL(5,2)",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 13: SLA Tracking
  {
    name: 'bronze.retail_sla_metrics',
    description: 'Service Level Agreement tracking data',
    sourceSystem: 'CRM_SYSTEM',
    sourceTable: 'SLA_TRACKING',
    loadType: 'BATCH',
    
    grain: 'One row per request per SLA metric',
    primaryKey: ['sla_tracking_id', 'source_system'],
    
    schema: {
      sla_tracking_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      request_id: "BIGINT",
      
      // SLA TYPE
      sla_type: "STRING COMMENT 'First Response|Resolution|Escalation Response'",
      
      // TARGETS
      target_hours: "INTEGER",
      target_timestamp: "TIMESTAMP COMMENT 'When SLA is due'",
      
      // ACTUALS
      actual_hours: "INTEGER",
      actual_timestamp: "TIMESTAMP COMMENT 'When completed'",
      
      // PERFORMANCE
      sla_met: "BOOLEAN",
      variance_hours: "INTEGER COMMENT 'Negative if late'",
      
      // ESCALATION
      escalated_due_to_sla_breach: "BOOLEAN",
      
      // BUSINESS HOURS
      calculated_in_business_hours: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 14: Agent Schedules
  {
    name: 'bronze.retail_agent_schedules',
    description: 'Agent scheduling and workforce management data',
    sourceSystem: 'WFM_SYSTEM',
    sourceTable: 'AGENT_SCHEDULES',
    loadType: 'DAILY',
    
    grain: 'One row per agent per day per shift',
    primaryKey: ['schedule_id', 'source_system'],
    
    schema: {
      schedule_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      agent_id: "BIGINT",
      
      schedule_date: "DATE",
      
      // SHIFT
      shift_start_time: "TIME",
      shift_end_time: "TIME",
      shift_duration_hours: "DECIMAL(5,2)",
      
      shift_type: "STRING COMMENT 'Regular|Overtime|On-Call|Training'",
      
      // BREAKS
      break_count: "INTEGER",
      total_break_duration_minutes: "INTEGER",
      
      // ACTUALS
      actual_start_time: "TIME",
      actual_end_time: "TIME",
      actual_hours_worked: "DECIMAL(5,2)",
      
      // STATUS
      adherence_status: "STRING COMMENT 'Adherent|Non-Adherent'",
      adherence_percentage: "DECIMAL(5,2)",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 15: Callback Requests
  {
    name: 'bronze.retail_callback_requests',
    description: 'Customer callback request tracking',
    sourceSystem: 'CALL_CENTER_SYSTEM',
    sourceTable: 'CALLBACK_REQUESTS',
    loadType: 'STREAMING',
    
    grain: 'One row per callback request',
    primaryKey: ['callback_request_id', 'source_system'],
    
    schema: {
      callback_request_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      phone_number: "STRING",
      
      // REQUEST
      request_timestamp: "TIMESTAMP",
      requested_callback_time: "TIMESTAMP COMMENT 'Preferred time'",
      
      reason_for_callback: "STRING",
      
      // ASSIGNMENT
      assigned_to_agent_id: "BIGINT",
      assigned_to_queue: "STRING",
      
      // CALLBACK
      callback_attempt_count: "INTEGER",
      callback_timestamp: "TIMESTAMP COMMENT 'Actual callback time'",
      callback_successful: "BOOLEAN",
      
      call_id: "BIGINT COMMENT 'FK to call record if callback completed'",
      
      // STATUS
      callback_status: "STRING COMMENT 'Pending|Completed|Cancelled|No Answer'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 16: Voice of Customer
  {
    name: 'bronze.retail_voice_of_customer',
    description: 'Aggregated customer feedback and sentiment analysis',
    sourceSystem: 'VOC_SYSTEM',
    sourceTable: 'VOC_ANALYTICS',
    loadType: 'DAILY',
    
    grain: 'One row per customer per day',
    primaryKey: ['customer_id', 'analysis_date', 'source_system'],
    
    schema: {
      customer_id: "BIGINT PRIMARY KEY",
      analysis_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // SENTIMENT
      overall_sentiment: "STRING",
      overall_sentiment_score: "DECIMAL(5,2)",
      
      sentiment_trend: "STRING COMMENT 'Improving|Stable|Declining'",
      
      // TOPICS
      top_topics: "STRING COMMENT 'JSON array of topics discussed'",
      issue_categories: "STRING COMMENT 'JSON array'",
      
      // SCORES
      avg_nps_score: "INTEGER",
      avg_csat_score: "INTEGER",
      avg_ces_score: "INTEGER",
      
      // INTERACTION COUNTS
      total_interactions: "INTEGER",
      call_count: "INTEGER",
      chat_count: "INTEGER",
      email_count: "INTEGER",
      social_mention_count: "INTEGER",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 17: First Contact Resolution
  {
    name: 'bronze.retail_first_contact_resolution',
    description: 'First Contact Resolution (FCR) tracking',
    sourceSystem: 'CRM_SYSTEM',
    sourceTable: 'FCR_TRACKING',
    loadType: 'BATCH',
    
    grain: 'One row per service request',
    primaryKey: ['request_id', 'source_system'],
    
    schema: {
      request_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      
      // FCR DETERMINATION
      fcr_achieved: "BOOLEAN COMMENT 'Resolved on first contact'",
      fcr_calculation_method: "STRING COMMENT 'Customer Survey|System Tracking|Agent Disposition'",
      
      // TRACKING
      total_contacts_required: "INTEGER",
      
      first_contact_date: "DATE",
      final_contact_date: "DATE",
      
      days_to_resolution: "INTEGER",
      
      // REASONS FOR MULTI-CONTACT
      multi_contact_reason: "STRING COMMENT 'Escalation Required|Additional Info Needed|Follow-Up Required'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 18: Service Channel Usage
  {
    name: 'bronze.retail_service_channel_usage',
    description: 'Customer service channel usage statistics',
    sourceSystem: 'CRM_SYSTEM',
    sourceTable: 'CHANNEL_USAGE',
    loadType: 'DAILY',
    
    grain: 'One row per channel per day',
    primaryKey: ['channel', 'usage_date', 'source_system'],
    
    schema: {
      channel: "STRING PRIMARY KEY COMMENT 'Phone|Chat|Email|Branch|Mobile App|Social'",
      usage_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // VOLUME
      total_interactions: "INTEGER",
      unique_customers: "INTEGER",
      
      // RESOLUTION
      issues_resolved: "INTEGER",
      fcr_count: "INTEGER",
      fcr_rate: "DECIMAL(5,2)",
      
      // SATISFACTION
      avg_csat_score: "DECIMAL(5,2)",
      avg_nps_score: "INTEGER",
      
      // EFFICIENCY
      avg_handle_time_seconds: "INTEGER",
      avg_wait_time_seconds: "INTEGER",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
];

export const customerServiceRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail customer service domain',
  layer: 'BRONZE',
  tables: customerServiceRetailBronzeTables,
  totalTables: 18,
  estimatedSize: '1.1TB',
  refreshFrequency: 'Real-time streaming for interactions, Daily for master data',
  retention: '7 years',
  
  keyFeatures: [
    'Multi-channel customer service (phone, chat, email, social)',
    'Service request lifecycle tracking',
    'SLA and quality management',
    'Agent performance tracking',
    'Customer satisfaction measurement (CSAT, NPS, CES)',
    'First Contact Resolution (FCR) tracking',
    'Complaint management and regulatory reporting',
    'Voice of Customer analytics',
    'IVR and self-service containment',
    'Workforce management integration',
  ],
};
