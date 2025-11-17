export const digitalRetailGoldDimensions = [
  // Dimension 1: Digital Channel
  {
    name: 'gold.dim_digital_channel',
    description: 'Digital banking channel dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per channel',
    primaryKey: ['channel_key'],
    schema: {
      channel_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      channel_code: "STRING NOT NULL COMMENT 'Business key - WEB, MOBILE_IOS, MOBILE_ANDROID, API'",
      channel_name: "STRING NOT NULL",
      channel_type: "STRING COMMENT 'WEB, MOBILE, API'",
      platform: "STRING COMMENT 'Browser-based, Native App, REST API'",
      is_active: "BOOLEAN DEFAULT TRUE",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 2: Digital Device
  {
    name: 'gold.dim_digital_device',
    description: 'Digital device dimension for tracking customer devices',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per device per validity period',
    primaryKey: ['device_key'],
    schema: {
      device_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      device_fingerprint: "STRING NOT NULL COMMENT 'Business key'",
      device_type: "STRING COMMENT 'Desktop, Mobile, Tablet'",
      operating_system: "STRING",
      os_version: "STRING",
      browser_name: "STRING",
      browser_version: "STRING",
      device_manufacturer: "STRING",
      device_model: "STRING",
      is_mobile: "BOOLEAN",
      is_trusted: "BOOLEAN",
      first_seen_date: "DATE",
      last_seen_date: "DATE",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 3: Digital Session
  {
    name: 'gold.dim_digital_session',
    description: 'Digital session dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per session',
    primaryKey: ['session_key'],
    schema: {
      session_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      session_id: "STRING NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      channel_key: "BIGINT COMMENT 'FK to dim_digital_channel'",
      device_key: "BIGINT COMMENT 'FK to dim_digital_device'",
      session_start_timestamp: "TIMESTAMP NOT NULL",
      session_end_timestamp: "TIMESTAMP",
      session_duration_seconds: "INT",
      authentication_method: "STRING COMMENT 'PASSWORD, BIOMETRIC, OTP, SSO'",
      session_status: "STRING COMMENT 'ACTIVE, EXPIRED, LOGGED_OUT, TIMED_OUT'",
      pages_viewed: "INT",
      transactions_initiated: "INT",
      is_suspicious: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 4: Authentication Method
  {
    name: 'gold.dim_authentication_method',
    description: 'Authentication method dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per authentication method',
    primaryKey: ['auth_method_key'],
    schema: {
      auth_method_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      auth_method_code: "STRING NOT NULL COMMENT 'Business key - PASSWORD, BIOMETRIC, OTP, SSO, TOKEN'",
      auth_method_name: "STRING NOT NULL",
      auth_category: "STRING COMMENT 'SINGLE_FACTOR, MULTI_FACTOR'",
      security_level: "STRING COMMENT 'LOW, MEDIUM, HIGH'",
      requires_device_enrollment: "BOOLEAN",
      is_passwordless: "BOOLEAN",
      is_active: "BOOLEAN DEFAULT TRUE",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 5: Digital Service
  {
    name: 'gold.dim_digital_service',
    description: 'Digital banking service dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per service per validity period',
    primaryKey: ['service_key'],
    schema: {
      service_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      service_code: "STRING NOT NULL COMMENT 'Business key'",
      service_name: "STRING NOT NULL",
      service_category: "STRING COMMENT 'TRANSACTIONAL, INFORMATIONAL, ADMINISTRATIVE'",
      service_type: "STRING COMMENT 'BILL_PAY, MOBILE_DEPOSIT, P2P, ALERTS, TRANSFERS'",
      requires_enrollment: "BOOLEAN",
      has_fees: "BOOLEAN",
      is_real_time: "BOOLEAN",
      service_tier: "STRING COMMENT 'BASIC, PREMIUM, ENTERPRISE'",
      launch_date: "DATE",
      retirement_date: "DATE",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 6: Digital Transaction Type
  {
    name: 'gold.dim_digital_transaction_type',
    description: 'Digital transaction type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per transaction type',
    primaryKey: ['transaction_type_key'],
    schema: {
      transaction_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      transaction_type_code: "STRING NOT NULL COMMENT 'Business key'",
      transaction_type_name: "STRING NOT NULL",
      transaction_category: "STRING COMMENT 'TRANSFER, PAYMENT, DEPOSIT, WITHDRAWAL, INQUIRY'",
      is_monetary: "BOOLEAN",
      requires_authentication: "BOOLEAN",
      requires_approval: "BOOLEAN",
      risk_level: "STRING COMMENT 'LOW, MEDIUM, HIGH'",
      is_reversible: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 7: Security Event Type
  {
    name: 'gold.dim_security_event_type',
    description: 'Security event type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per security event type',
    primaryKey: ['security_event_type_key'],
    schema: {
      security_event_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      event_type_code: "STRING NOT NULL COMMENT 'Business key'",
      event_type_name: "STRING NOT NULL",
      event_category: "STRING COMMENT 'AUTHENTICATION, AUTHORIZATION, FRAUD, COMPLIANCE'",
      default_severity: "STRING COMMENT 'LOW, MEDIUM, HIGH, CRITICAL'",
      requires_investigation: "BOOLEAN",
      requires_customer_notification: "BOOLEAN",
      auto_block_threshold: "INT COMMENT 'Number of events before auto-block'",
      is_active: "BOOLEAN DEFAULT TRUE",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 8: Digital Biller
  {
    name: 'gold.dim_digital_biller',
    description: 'Biller dimension for bill payment services',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per biller per validity period',
    primaryKey: ['biller_key'],
    schema: {
      biller_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      biller_id: "BIGINT NOT NULL COMMENT 'Business key'",
      biller_name: "STRING NOT NULL",
      biller_category: "STRING COMMENT 'UTILITY, TELECOM, CREDIT_CARD, INSURANCE'",
      biller_industry: "STRING",
      supports_ebill: "BOOLEAN",
      supports_auto_pay: "BOOLEAN",
      payment_processing_days: "INT",
      is_popular_biller: "BOOLEAN",
      enrollment_date: "DATE",
      is_active: "BOOLEAN",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 9: Alert Type
  {
    name: 'gold.dim_alert_type',
    description: 'Alert type dimension for account notifications',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per alert type',
    primaryKey: ['alert_type_key'],
    schema: {
      alert_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      alert_type_code: "STRING NOT NULL COMMENT 'Business key'",
      alert_type_name: "STRING NOT NULL",
      alert_category: "STRING COMMENT 'BALANCE, TRANSACTION, SECURITY, SERVICE'",
      default_channel: "STRING COMMENT 'EMAIL, SMS, PUSH_NOTIFICATION, IN_APP'",
      is_critical: "BOOLEAN",
      is_customizable: "BOOLEAN",
      requires_opt_in: "BOOLEAN",
      priority_level: "INT",
      is_active: "BOOLEAN DEFAULT TRUE",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 10: API Endpoint
  {
    name: 'gold.dim_api_endpoint',
    description: 'API endpoint dimension for tracking API usage',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per API endpoint per validity period',
    primaryKey: ['api_endpoint_key'],
    schema: {
      api_endpoint_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      endpoint_path: "STRING NOT NULL COMMENT 'Business key - /api/v1/accounts'",
      endpoint_name: "STRING NOT NULL",
      api_version: "STRING",
      http_method: "STRING COMMENT 'GET, POST, PUT, DELETE'",
      endpoint_category: "STRING COMMENT 'ACCOUNT, TRANSACTION, CUSTOMER, ADMIN'",
      is_public: "BOOLEAN",
      requires_authentication: "BOOLEAN",
      rate_limit_per_minute: "INT",
      average_response_time_ms: "INT",
      is_deprecated: "BOOLEAN",
      deprecation_date: "DATE",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  }
];

export const digitalRetailGoldFacts = [
  // Fact 1: Digital Session Activity
  {
    name: 'gold.fact_digital_session_activity',
    description: 'Digital session activity fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per session',
    primaryKey: ['session_activity_key'],
    foreignKeys: [
      { column: 'session_key', references: 'gold.dim_digital_session' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'channel_key', references: 'gold.dim_digital_channel' },
      { column: 'device_key', references: 'gold.dim_digital_device' },
      { column: 'auth_method_key', references: 'gold.dim_authentication_method' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'session_duration_seconds',
      'pages_viewed',
      'transactions_initiated',
      'api_calls_made',
      'data_transferred_mb'
    ],
    schema: {
      session_activity_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      session_key: "BIGINT NOT NULL COMMENT 'FK to dim_digital_session'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      channel_key: "BIGINT COMMENT 'FK to dim_digital_channel'",
      device_key: "BIGINT COMMENT 'FK to dim_digital_device'",
      auth_method_key: "BIGINT COMMENT 'FK to dim_authentication_method'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      session_start_timestamp: "TIMESTAMP NOT NULL",
      session_end_timestamp: "TIMESTAMP",
      session_duration_seconds: "INT",
      pages_viewed: "INT",
      transactions_initiated: "INT",
      transactions_completed: "INT",
      api_calls_made: "INT",
      data_transferred_mb: "DECIMAL(18,2)",
      login_attempt_count: "INT",
      successful_login_flag: "BOOLEAN",
      mfa_required_flag: "BOOLEAN",
      mfa_success_flag: "BOOLEAN",
      is_suspicious_flag: "BOOLEAN",
      risk_score: "DECIMAL(5,2)",
      geolocation_country: "STRING",
      geolocation_city: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 2: Digital Transactions
  {
    name: 'gold.fact_digital_transactions',
    description: 'Digital banking transactions fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per digital transaction',
    primaryKey: ['digital_transaction_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'transaction_type_key', references: 'gold.dim_digital_transaction_type' },
      { column: 'channel_key', references: 'gold.dim_digital_channel' },
      { column: 'device_key', references: 'gold.dim_digital_device' },
      { column: 'source_account_key', references: 'gold.dim_account' },
      { column: 'destination_account_key', references: 'gold.dim_account' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'transaction_amount',
      'transaction_fee',
      'processing_time_ms'
    ],
    schema: {
      digital_transaction_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      transaction_id: "STRING NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      transaction_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_digital_transaction_type'",
      channel_key: "BIGINT COMMENT 'FK to dim_digital_channel'",
      device_key: "BIGINT COMMENT 'FK to dim_digital_device'",
      source_account_key: "BIGINT COMMENT 'FK to dim_account'",
      destination_account_key: "BIGINT COMMENT 'FK to dim_account'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      transaction_timestamp: "TIMESTAMP NOT NULL",
      transaction_amount: "DECIMAL(18,2) NOT NULL",
      transaction_currency: "STRING NOT NULL",
      transaction_fee: "DECIMAL(18,2)",
      transaction_status: "STRING COMMENT 'PENDING, COMPLETED, FAILED, CANCELLED'",
      processing_time_ms: "INT",
      authentication_method: "STRING",
      beneficiary_name: "STRING",
      is_international: "BOOLEAN",
      is_recurring: "BOOLEAN",
      error_code: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 3: Digital Service Usage
  {
    name: 'gold.fact_digital_service_usage',
    description: 'Digital service usage fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per customer per service per day',
    primaryKey: ['service_usage_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'service_key', references: 'gold.dim_digital_service' },
      { column: 'channel_key', references: 'gold.dim_digital_channel' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'usage_count',
      'total_usage_amount',
      'average_transaction_amount',
      'total_fees'
    ],
    schema: {
      service_usage_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      service_key: "BIGINT NOT NULL COMMENT 'FK to dim_digital_service'",
      channel_key: "BIGINT COMMENT 'FK to dim_digital_channel'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      usage_count: "INT",
      total_usage_amount: "DECIMAL(18,2)",
      average_transaction_amount: "DECIMAL(18,2)",
      total_fees: "DECIMAL(18,2)",
      unique_sessions: "INT",
      total_errors: "INT",
      error_rate: "DECIMAL(5,2)",
      first_usage_timestamp: "TIMESTAMP",
      last_usage_timestamp: "TIMESTAMP",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 4: Security Events
  {
    name: 'gold.fact_security_events',
    description: 'Security events fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per security event',
    primaryKey: ['security_event_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'security_event_type_key', references: 'gold.dim_security_event_type' },
      { column: 'channel_key', references: 'gold.dim_digital_channel' },
      { column: 'device_key', references: 'gold.dim_digital_device' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'risk_score',
      'investigation_time_hours'
    ],
    schema: {
      security_event_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      event_id: "STRING NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT COMMENT 'FK to dim_customer'",
      security_event_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_security_event_type'",
      channel_key: "BIGINT COMMENT 'FK to dim_digital_channel'",
      device_key: "BIGINT COMMENT 'FK to dim_digital_device'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      event_timestamp: "TIMESTAMP NOT NULL",
      severity_level: "STRING COMMENT 'LOW, MEDIUM, HIGH, CRITICAL'",
      risk_score: "DECIMAL(5,2)",
      action_taken: "STRING COMMENT 'BLOCKED, FLAGGED, ALERT_SENT, MFA_REQUIRED'",
      investigated_flag: "BOOLEAN",
      investigation_time_hours: "DECIMAL(10,2)",
      resolution_status: "STRING COMMENT 'OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE'",
      resolution_timestamp: "TIMESTAMP",
      geolocation_country: "STRING",
      is_false_positive: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 5: Bill Payments
  {
    name: 'gold.fact_bill_payments',
    description: 'Bill payment transactions fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per bill payment',
    primaryKey: ['bill_payment_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'biller_key', references: 'gold.dim_digital_biller' },
      { column: 'channel_key', references: 'gold.dim_digital_channel' },
      { column: 'source_account_key', references: 'gold.dim_account' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'payment_amount',
      'processing_days'
    ],
    schema: {
      bill_payment_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      payment_id: "STRING NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      biller_key: "BIGINT NOT NULL COMMENT 'FK to dim_digital_biller'",
      channel_key: "BIGINT COMMENT 'FK to dim_digital_channel'",
      source_account_key: "BIGINT COMMENT 'FK to dim_account'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      payment_timestamp: "TIMESTAMP NOT NULL",
      scheduled_payment_date: "DATE",
      payment_amount: "DECIMAL(18,2) NOT NULL",
      payment_currency: "STRING NOT NULL",
      payment_status: "STRING COMMENT 'SCHEDULED, PROCESSING, COMPLETED, FAILED'",
      payment_method: "STRING COMMENT 'ONE_TIME, RECURRING, AUTO_PAY'",
      is_recurring: "BOOLEAN",
      is_auto_pay: "BOOLEAN",
      processing_days: "INT",
      confirmation_number: "STRING",
      error_code: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 6: API Request Performance
  {
    name: 'gold.fact_api_request_performance',
    description: 'API request performance fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per API request',
    primaryKey: ['api_request_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'api_endpoint_key', references: 'gold.dim_api_endpoint' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'response_time_ms',
      'request_size_bytes',
      'response_size_bytes'
    ],
    schema: {
      api_request_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      request_id: "STRING NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT COMMENT 'FK to dim_customer'",
      api_endpoint_key: "BIGINT NOT NULL COMMENT 'FK to dim_api_endpoint'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      request_timestamp: "TIMESTAMP NOT NULL",
      response_timestamp: "TIMESTAMP",
      response_time_ms: "INT",
      response_status_code: "INT NOT NULL",
      request_size_bytes: "BIGINT",
      response_size_bytes: "BIGINT",
      authentication_type: "STRING",
      is_successful: "BOOLEAN",
      error_code: "STRING",
      rate_limit_remaining: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const digitalRetailGoldLayerComplete = {
  description: 'Gold layer for retail digital banking domain - dimensional model',
  layer: 'GOLD',
  dimensions: digitalRetailGoldDimensions,
  facts: digitalRetailGoldFacts,
  totalDimensions: digitalRetailGoldDimensions.length,
  totalFacts: digitalRetailGoldFacts.length
};

export default digitalRetailGoldLayerComplete;
