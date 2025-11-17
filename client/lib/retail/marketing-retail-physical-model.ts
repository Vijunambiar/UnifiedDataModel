/**
 * MARKETING-RETAIL PHYSICAL DATA MODEL
 * Banking-Specific Implementation Model (Bronze → Silver → Gold)
 * 
 * Purpose: Solve real retail banking marketing use cases with production-ready schemas
 * 
 * Key Banking Use Cases Supported:
 * 1. Product-specific campaign performance (checking, savings, cards, loans)
 * 2. Compliance-aware consent management (TCPA, CAN-SPAM, CFPB)
 * 3. Banking product lead scoring and conversion tracking
 * 4. Multi-touch attribution with branch integration
 * 5. Customer lifecycle marketing across product journey
 * 6. Marketing ROI by product line with revenue attribution
 * 7. Offer redemption tracking with T&C compliance
 * 8. Regulatory reporting (marketing spend, conversion rates, demographics)
 */

export const marketingRetailPhysicalModel = {
  name: 'Marketing-Retail Physical Model',
  description: 'Production-ready implementation for retail banking marketing',
  version: '2.0',
  
  // ========================================
  // BRONZE LAYER - RAW DATA FROM SOURCE SYSTEMS
  // ========================================
  bronzeLayer: {
    description: 'Raw data from marketing platforms, CRM, core banking, and compliance systems',
    tables: [
      // BANKING PRODUCT CAMPAIGNS (from Marketing Automation)
      {
        name: 'bronze.mktg_banking_product_campaigns',
        description: 'Banking product marketing campaigns from Salesforce Marketing Cloud',
        sourceSystem: 'SFMC',
        loadFrequency: 'Daily',
        estimatedRows: 50000,
        schema: {
          // Campaign IDs
          campaign_id: 'STRING PRIMARY KEY',
          external_campaign_id: 'STRING COMMENT SFMC campaign ID',
          campaign_name: 'STRING',
          campaign_code: 'STRING COMMENT Internal campaign code',
          
          // Banking Product Context
          product_line: 'STRING COMMENT Deposits|Cards|Loans|Investments|Mortgages',
          product_category: 'STRING COMMENT Checking|Savings|CD|CreditCard|PersonalLoan|AutoLoan|HELOC|Mortgage',
          product_sku: 'STRING COMMENT Specific product SKU (e.g., PREMIUM_CHECKING_001)',
          product_name: 'STRING COMMENT Marketing name',
          
          // Campaign Strategy
          campaign_type: 'STRING COMMENT Acquisition|Cross_Sell|Up_Sell|Retention|Win_Back|Reactivation',
          campaign_objective: 'STRING COMMENT New_Accounts|Deposits|Loan_Volume|Card_Activation|Fee_Revenue',
          target_audience: 'STRING COMMENT Prospects|Existing_Checking|Existing_Loan|Dormant|Closed',
          target_segment: 'STRING COMMENT Mass|Mass_Affluent|Affluent|Student|Senior|Small_Business',
          target_age_range: 'STRING COMMENT Age brackets',
          target_income_range: 'STRING COMMENT Income brackets',
          target_credit_tier: 'STRING COMMENT Excellent|Good|Fair|Poor|None',
          geographic_scope: 'STRING COMMENT National|Regional|State|DMA|Branch_Market',
          target_states: 'STRING COMMENT Comma-separated state codes',
          target_dma_codes: 'STRING COMMENT Designated Market Areas',
          
          // Channel Strategy
          channel_strategy: 'STRING COMMENT Single_Channel|Multi_Channel|Omni_Channel',
          primary_channel: 'STRING COMMENT Email|SMS|Push|Paid_Search|Paid_Social|Display|Direct_Mail|Branch',
          secondary_channels: 'STRING COMMENT Comma-separated',
          channel_sequence: 'STRING COMMENT Orchestration sequence',
          
          // Offer Association
          offer_id: 'STRING FK to offers',
          offer_code: 'STRING COMMENT Promotional code',
          has_cash_bonus: 'BOOLEAN',
          cash_bonus_amount: 'DECIMAL(10,2)',
          has_apr_promo: 'BOOLEAN',
          promo_apr_rate: 'DECIMAL(10,6)',
          has_fee_waiver: 'BOOLEAN',
          
          // Budget & Goals
          budget_total: 'DECIMAL(18,2)',
          budget_media: 'DECIMAL(18,2)',
          budget_creative: 'DECIMAL(18,2)',
          budget_technology: 'DECIMAL(18,2)',
          budget_by_channel: 'JSON COMMENT {email: 10000, paid_search: 50000}',
          target_leads: 'INTEGER',
          target_applications: 'INTEGER',
          target_accounts_opened: 'INTEGER',
          target_funded_accounts: 'INTEGER',
          target_total_deposits: 'DECIMAL(18,2) COMMENT For deposit products',
          target_total_loans: 'DECIMAL(18,2) COMMENT For loan products',
          target_total_credit: 'DECIMAL(18,2) COMMENT For card products',
          
          // Compliance & Approvals
          compliance_review_required: 'BOOLEAN',
          compliance_reviewed_by: 'STRING',
          compliance_approved_date: 'DATE',
          legal_review_required: 'BOOLEAN',
          legal_approved_by: 'STRING',
          legal_approved_date: 'DATE',
          tcpa_compliant: 'BOOLEAN COMMENT Telephone Consumer Protection Act',
          can_spam_compliant: 'BOOLEAN COMMENT CAN-SPAM Act',
          cfpb_reviewed: 'BOOLEAN COMMENT Consumer Financial Protection Bureau',
          ecoa_compliant: 'BOOLEAN COMMENT Equal Credit Opportunity Act',
          tila_disclosures_required: 'BOOLEAN COMMENT Truth in Lending Act',
          regulatory_disclosures: 'JSON COMMENT Required disclosures',
          
          // Timing
          campaign_status: 'STRING COMMENT Draft|Compliance_Review|Approved|Active|Paused|Completed|Cancelled',
          start_date: 'DATE',
          end_date: 'DATE',
          created_timestamp: 'TIMESTAMP',
          created_by: 'STRING',
          last_modified_timestamp: 'TIMESTAMP',
          last_modified_by: 'STRING',
          
          // UTM Tracking
          utm_source: 'STRING',
          utm_medium: 'STRING',
          utm_campaign: 'STRING',
          utm_content: 'STRING',
          utm_term: 'STRING',
          
          // Audit
          _fivetran_synced: 'TIMESTAMP',
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Campaigns are bank product-focused with regulatory compliance built-in',
        dataQuality: [
          'Must have valid product_line and product_category',
          'Compliance flags must be TRUE before campaign can go Active',
          'Budget must be > 0 for Active campaigns',
        ],
      },
      
      // BANKING PRODUCT OFFERS (from Offer Management System)
      {
        name: 'bronze.mktg_banking_product_offers',
        description: 'Promotional offers for banking products',
        sourceSystem: 'OFFER_MANAGEMENT_SYSTEM',
        loadFrequency: 'Daily',
        estimatedRows: 10000,
        schema: {
          offer_id: 'STRING PRIMARY KEY',
          offer_code: 'STRING UNIQUE',
          offer_name: 'STRING',
          offer_description: 'STRING',
          
          // Product Association
          product_line: 'STRING',
          product_category: 'STRING',
          product_sku: 'STRING',
          eligible_products: 'STRING COMMENT Comma-separated SKUs',
          
          // Offer Structure
          offer_type: 'STRING COMMENT Cash_Bonus|APR_Discount|Fee_Waiver|Points_Bonus|Rate_Boost|Hybrid',
          cash_bonus_amount: 'DECIMAL(10,2) COMMENT Cash bonus ($50, $200, $500)',
          cash_bonus_currency: 'STRING COMMENT USD',
          apr_discount_rate: 'DECIMAL(10,6) COMMENT Promotional APR for loans/cards',
          apr_discount_duration_months: 'INTEGER COMMENT 0% APR for X months',
          regular_apr_after_promo: 'DECIMAL(10,6)',
          fee_waiver_type: 'STRING COMMENT Monthly_Maintenance|Annual|Overdraft|Foreign_Transaction|ATM',
          fee_waiver_duration_months: 'INTEGER COMMENT 12 months free, 24 months free',
          fee_regular_amount: 'DECIMAL(10,2) COMMENT Regular fee amount',
          rewards_points_bonus: 'INTEGER COMMENT Bonus points (20000, 50000, 100000)',
          interest_rate_boost_bps: 'INTEGER COMMENT Basis points boost on savings/CD (50 bps = 0.50%)',
          
          // Eligibility Criteria
          eligibility_type: 'STRING COMMENT New_Customers_Only|Existing_Customers|All_Customers',
          min_opening_deposit: 'DECIMAL(10,2) COMMENT Minimum initial deposit',
          min_balance_requirement: 'DECIMAL(10,2) COMMENT Minimum balance to maintain',
          min_direct_deposit_amount: 'DECIMAL(10,2) COMMENT Required monthly direct deposit',
          direct_deposit_duration_months: 'INTEGER COMMENT Number of months required',
          min_debit_transactions: 'INTEGER COMMENT Minimum monthly debit card transactions',
          min_credit_score: 'INTEGER COMMENT Minimum FICO score',
          max_credit_score: 'INTEGER COMMENT Maximum FICO (for secured products)',
          min_age: 'INTEGER COMMENT Minimum age',
          max_age: 'INTEGER COMMENT Maximum age (null = no max)',
          eligible_states: 'STRING COMMENT Comma-separated state codes',
          excluded_states: 'STRING COMMENT States where offer not valid',
          employment_requirement: 'STRING COMMENT Employed|Any',
          residency_requirement: 'STRING COMMENT US_Citizen|Permanent_Resident|Any',
          existing_account_exclusion: 'BOOLEAN COMMENT Exclude if customer already has this product',
          
          // Terms & Conditions
          terms_and_conditions: 'STRING COMMENT Legal T&Cs',
          terms_url: 'STRING COMMENT Link to full terms',
          offer_disclosure: 'STRING COMMENT Required disclosures (APR, fees, etc.)',
          tila_disclosure: 'STRING COMMENT Truth in Lending disclosures',
          schumer_box: 'JSON COMMENT Credit card pricing table',
          
          // Redemption Rules
          redemption_trigger: 'STRING COMMENT Account_Open|First_Deposit|Direct_Deposit|Spending_Threshold',
          redemption_threshold_amount: 'DECIMAL(10,2)',
          redemption_period_days: 'INTEGER COMMENT Days to meet requirements',
          payout_timing: 'STRING COMMENT Immediate|30_Days|60_Days|90_Days',
          max_redemptions_total: 'INTEGER COMMENT Total redemption limit',
          max_redemptions_per_customer: 'INTEGER COMMENT 1 per customer, 2 per household',
          max_redemptions_per_household: 'INTEGER',
          current_redemptions: 'INTEGER COMMENT Current count',
          
          // Tax & Reporting
          taxable_bonus: 'BOOLEAN COMMENT Is cash bonus taxable income',
          form_1099_required: 'BOOLEAN COMMENT 1099-INT for bonuses >$600/year',
          
          // Validity
          offer_status: 'STRING COMMENT Active|Paused|Expired|Depleted|Cancelled',
          start_date: 'DATE',
          end_date: 'DATE',
          early_termination_date: 'DATE COMMENT If ended early',
          
          // Risk & Compliance
          fraud_risk_rating: 'STRING COMMENT Low|Medium|High',
          abuse_monitoring_flag: 'BOOLEAN COMMENT Monitor for offer abuse',
          compliance_approved: 'BOOLEAN',
          compliance_approved_by: 'STRING',
          compliance_approved_date: 'DATE',
          
          // Audit
          created_timestamp: 'TIMESTAMP',
          created_by: 'STRING',
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Banking offers require strict compliance and eligibility validation',
      },
      
      // BANKING LEADS (from Lead Management / CRM)
      {
        name: 'bronze.mktg_banking_product_leads',
        description: 'Leads for banking products from all sources',
        sourceSystem: 'SALESFORCE_CRM',
        loadFrequency: 'Streaming (15-minute micro-batches)',
        estimatedRows: 10000000,
        schema: {
          lead_id: 'STRING PRIMARY KEY',
          customer_id: 'STRING FK to customer COMMENT NULL for prospects',
          
          // Lead Classification
          lead_type: 'STRING COMMENT New_Customer|Existing_Customer_Cross_Sell|Existing_Customer_Up_Sell',
          lead_source: 'STRING COMMENT Website|Mobile_App|Branch|Call_Center|Referral|Paid_Search|Paid_Social|Email|SMS|Event|Partner',
          lead_source_detail: 'STRING COMMENT Specific form, page, event',
          lead_status: 'STRING COMMENT New|Contacted|Qualified|Application_Started|Application_Submitted|Approved|Funded|Disqualified|Lost|Duplicate',
          lead_substatus: 'STRING COMMENT Detailed status',
          
          // Product Interest
          product_interest: 'STRING COMMENT Checking|Savings|CD|MoneyMarket|CreditCard|PersonalLoan|AutoLoan|HELOC|Mortgage|Investment',
          product_sku_interest: 'STRING COMMENT Specific product variant',
          secondary_product_interest: 'STRING COMMENT Additional products',
          
          // Campaign Attribution
          campaign_id: 'STRING FK to campaign',
          offer_id: 'STRING FK to offer',
          offer_code: 'STRING COMMENT Offer code used',
          utm_source: 'STRING',
          utm_medium: 'STRING',
          utm_campaign: 'STRING',
          utm_content: 'STRING',
          utm_term: 'STRING',
          referrer_url: 'STRING',
          landing_page_url: 'STRING',
          form_id: 'STRING',
          
          // Lead Information (Self-Reported)
          first_name: 'STRING',
          last_name: 'STRING',
          email: 'STRING',
          phone: 'STRING COMMENT E.164 format',
          phone_type: 'STRING COMMENT Mobile|Home|Work',
          address_line1: 'STRING',
          address_line2: 'STRING',
          city: 'STRING',
          state: 'STRING',
          zip_code: 'STRING',
          country: 'STRING',
          date_of_birth: 'DATE',
          ssn_last_4: 'STRING COMMENT Last 4 of SSN',
          
          // Financial Profile (Self-Reported)
          employment_status: 'STRING COMMENT Employed|Self_Employed|Unemployed|Retired|Student',
          employer_name: 'STRING',
          job_title: 'STRING',
          years_at_employer: 'DECIMAL(5,2)',
          annual_income: 'DECIMAL(18,2)',
          monthly_income: 'DECIMAL(18,2)',
          income_verified: 'BOOLEAN COMMENT Has income been verified',
          housing_status: 'STRING COMMENT Own|Rent|Live_With_Parents',
          monthly_rent_mortgage: 'DECIMAL(10,2)',
          credit_score_range: 'STRING COMMENT Self-reported: Excellent|Good|Fair|Poor|Dont_Know',
          existing_bank_customer: 'BOOLEAN',
          existing_account_types: 'STRING COMMENT Checking|Savings|Loan|Card',
          
          // Loan-Specific Fields
          loan_amount_requested: 'DECIMAL(18,2)',
          loan_purpose: 'STRING COMMENT Debt_Consolidation|Home_Improvement|Auto_Purchase|Major_Purchase|Other',
          loan_term_requested_months: 'INTEGER',
          vehicle_year: 'INTEGER COMMENT For auto loans',
          vehicle_make: 'STRING',
          vehicle_model: 'STRING',
          vehicle_mileage: 'INTEGER',
          home_value: 'DECIMAL(18,2) COMMENT For HELOC/Home Equity',
          mortgage_balance: 'DECIMAL(18,2)',
          
          // Card-Specific Fields
          card_usage_intent: 'STRING COMMENT Rewards|Cashback|Travel|Balance_Transfer|Build_Credit',
          balance_transfer_amount: 'DECIMAL(18,2)',
          
          // Lead Scoring
          lead_score: 'INTEGER COMMENT 0-100 predictive score',
          lead_grade: 'STRING COMMENT A|B|C|D|F',
          lead_score_factors: 'JSON COMMENT {income: 20, employment: 15, credit: 30}',
          qualification_status: 'STRING COMMENT Pre_Qualified|Qualified|Not_Qualified|Pending_Review',
          disqualification_reason: 'STRING COMMENT Credit_Score|Income|Existing_Account|Location|Age|Employment',
          
          // Consent & Compliance
          marketing_consent_email: 'BOOLEAN COMMENT TCPA consent',
          marketing_consent_phone: 'BOOLEAN',
          marketing_consent_sms: 'BOOLEAN',
          consent_timestamp: 'TIMESTAMP',
          consent_ip_address: 'STRING COMMENT For compliance audit',
          consent_method: 'STRING COMMENT Web_Form|Mobile_App|Verbal|Written',
          consent_language: 'STRING COMMENT Language of consent',
          tcpa_consent_text: 'STRING COMMENT Exact consent language',
          
          // Assignment & Routing
          assigned_to_branch_id: 'STRING',
          assigned_to_banker_id: 'STRING',
          assigned_to_team: 'STRING COMMENT Sales|Underwriting|Retention',
          assignment_timestamp: 'TIMESTAMP',
          
          // Lifecycle Tracking
          submission_timestamp: 'TIMESTAMP COMMENT When lead was created',
          first_contact_timestamp: 'TIMESTAMP',
          first_contact_method: 'STRING COMMENT Email|Phone|SMS|Branch_Visit',
          qualified_timestamp: 'TIMESTAMP',
          application_started_timestamp: 'TIMESTAMP',
          application_submitted_timestamp: 'TIMESTAMP',
          decision_timestamp: 'TIMESTAMP',
          decision_outcome: 'STRING COMMENT Approved|Denied|More_Info_Needed',
          denial_reason: 'STRING',
          account_opened_timestamp: 'TIMESTAMP',
          account_funded_timestamp: 'TIMESTAMP COMMENT First deposit >$0',
          account_id: 'STRING COMMENT Account opened from this lead',
          
          // Calculated Durations
          days_to_first_contact: 'INTEGER',
          days_to_qualification: 'INTEGER',
          days_to_application: 'INTEGER',
          days_to_decision: 'INTEGER',
          days_to_funding: 'INTEGER',
          
          // Additional Context
          device_type: 'STRING COMMENT Desktop|Mobile|Tablet|Branch_Terminal',
          operating_system: 'STRING',
          browser: 'STRING',
          app_version: 'STRING COMMENT Mobile app version',
          session_id: 'STRING',
          
          // Audit
          _fivetran_synced: 'TIMESTAMP',
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Banking leads require consent tracking and credit/income qualification',
      },
      
      // OFFER REDEMPTIONS (from Offer Management + Core Banking)
      {
        name: 'bronze.mktg_offer_redemptions',
        description: 'Tracking of promotional offer redemptions',
        sourceSystem: 'OFFER_MANAGEMENT + CORE_BANKING',
        loadFrequency: 'Daily',
        estimatedRows: 5000000,
        schema: {
          redemption_id: 'STRING PRIMARY KEY',
          offer_id: 'STRING FK to offers',
          offer_code: 'STRING',
          customer_id: 'STRING FK to customer',
          account_id: 'STRING FK to account',
          
          // Redemption Event
          redemption_timestamp: 'TIMESTAMP',
          redemption_date: 'DATE',
          redemption_channel: 'STRING COMMENT Web|Mobile|Branch|Call_Center',
          redemption_trigger: 'STRING COMMENT Account_Open|Deposit_Made|Direct_Deposit|Spending_Met',
          
          // Account Details
          account_type: 'STRING COMMENT Checking|Savings|CD|CreditCard|PersonalLoan',
          account_open_date: 'DATE',
          initial_deposit_amount: 'DECIMAL(18,2)',
          initial_deposit_date: 'DATE',
          
          // Qualification Tracking
          qualification_status: 'STRING COMMENT Pending|Qualified|Disqualified|Paid',
          qualification_date: 'DATE',
          disqualification_reason: 'STRING',
          requirements_met: 'JSON COMMENT {min_deposit: true, direct_deposit: false}',
          
          // Bonus Payout (if cash bonus)
          bonus_amount: 'DECIMAL(10,2)',
          bonus_currency: 'STRING',
          bonus_payout_date: 'DATE',
          bonus_payout_method: 'STRING COMMENT Account_Credit|Check|Points',
          bonus_taxable: 'BOOLEAN',
          form_1099_issued: 'BOOLEAN',
          tax_year: 'INTEGER',
          
          // Attribution
          campaign_id: 'STRING FK to campaign',
          lead_id: 'STRING FK to lead',
          attributed_channel: 'STRING COMMENT Channel that gets credit',
          
          // Financial Impact
          account_balance_30d: 'DECIMAL(18,2) COMMENT Balance after 30 days',
          account_balance_60d: 'DECIMAL(18,2)',
          account_balance_90d: 'DECIMAL(18,2)',
          account_balance_180d: 'DECIMAL(18,2)',
          account_still_open: 'BOOLEAN',
          account_close_date: 'DATE',
          account_close_reason: 'STRING',
          
          // Fraud Indicators
          fraud_score: 'INTEGER COMMENT 0-100',
          fraud_flag: 'BOOLEAN',
          fraud_reason: 'STRING COMMENT Velocity|Synthetic_Identity|Bust_Out',
          
          // Audit
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Track offer redemption lifecycle and bonus payout compliance',
      },
      
      // CUSTOMER CONSENT MANAGEMENT (from Preference Center / CDP)
      {
        name: 'bronze.mktg_customer_consent',
        description: 'Marketing communication consent and preferences (TCPA, CAN-SPAM, GDPR, CCPA)',
        sourceSystem: 'CUSTOMER_DATA_PLATFORM',
        loadFrequency: 'Streaming (event-driven)',
        estimatedRows: 50000000,
        scdType: 'SCD_TYPE_2',
        schema: {
          consent_record_id: 'STRING PRIMARY KEY',
          customer_id: 'STRING FK to customer',
          
          // Consent Type
          consent_type: 'STRING COMMENT Email|SMS|Phone_Call|Push|Direct_Mail|Third_Party_Sharing',
          consent_status: 'BOOLEAN COMMENT TRUE=Opted In, FALSE=Opted Out',
          consent_timestamp: 'TIMESTAMP',
          consent_effective_date: 'DATE',
          consent_expiration_date: 'DATE COMMENT Some jurisdictions require re-consent',
          
          // Consent Collection Method
          consent_method: 'STRING COMMENT Web_Form|Mobile_App|Branch|Call_Center|Email_Click|SMS_Reply|Paper_Form|Pre_Checked|Explicit_Opt_In',
          consent_source_detail: 'STRING COMMENT Specific form, page, conversation',
          consent_ip_address: 'STRING COMMENT For compliance audit',
          consent_device_id: 'STRING',
          consent_geolocation: 'STRING COMMENT {city, state, country}',
          consent_user_agent: 'STRING',
          
          // Consent Language & Compliance
          consent_language: 'STRING COMMENT Language of consent form (en, es, zh)',
          consent_text_shown: 'STRING COMMENT Exact consent language presented',
          consent_version: 'STRING COMMENT Version of T&Cs',
          
          // Regulatory Compliance Flags
          tcpa_consent: 'BOOLEAN COMMENT Telephone Consumer Protection Act (phone/SMS)',
          can_spam_consent: 'BOOLEAN COMMENT CAN-SPAM Act (email)',
          gdpr_consent: 'BOOLEAN COMMENT GDPR (EU customers)',
          gdpr_lawful_basis: 'STRING COMMENT Consent|Legitimate_Interest|Contract',
          ccpa_do_not_sell: 'BOOLEAN COMMENT CCPA Do Not Sell (CA customers)',
          caloppa_consent: 'BOOLEAN COMMENT California Online Privacy Protection Act',
          
          // Granular Preferences
          product_category_prefs: 'JSON COMMENT {deposits: true, loans: false, cards: true, investments: false}',
          communication_frequency: 'STRING COMMENT Daily|Weekly|BiWeekly|Monthly|Quarterly|Ad_Hoc',
          preferred_time_of_day: 'STRING COMMENT Morning|Afternoon|Evening',
          preferred_day_of_week: 'STRING COMMENT Monday-Sunday',
          
          // Suppression
          global_suppression_flag: 'BOOLEAN COMMENT Suppress from all marketing',
          suppression_reason: 'STRING COMMENT Customer_Request|Compliance|Regulatory|Fraud|Litigation|Deceased|Bankruptcy|UDAAP_Violation',
          suppression_start_date: 'DATE',
          suppression_end_date: 'DATE COMMENT NULL = permanent',
          
          // Change History (SCD Type 2)
          record_effective_timestamp: 'TIMESTAMP',
          record_expiration_timestamp: 'TIMESTAMP COMMENT NULL = current record',
          is_current: 'BOOLEAN',
          change_reason: 'STRING COMMENT User_Update|Regulatory|Data_Correction',
          changed_by: 'STRING COMMENT User or system',
          
          // Audit Trail
          consent_history: 'JSON COMMENT Full change history',
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Critical for TCPA compliance - cannot contact without valid consent',
      },
      
      // CUSTOMER JOURNEY TRACKING (from CDP / Attribution Platform)
      {
        name: 'bronze.mktg_customer_journey_events',
        description: 'Customer journey touchpoint events across all channels',
        sourceSystem: 'CDP + ATTRIBUTION_PLATFORM',
        loadFrequency: 'Streaming (real-time)',
        estimatedRows: 500000000,
        schema: {
          event_id: 'STRING PRIMARY KEY',
          customer_id: 'STRING FK to customer',
          session_id: 'STRING',
          journey_id: 'STRING COMMENT Aggregated journey identifier',
          
          // Event Classification
          event_timestamp: 'TIMESTAMP',
          event_date: 'DATE',
          event_type: 'STRING COMMENT Impression|Click|View|Engagement|Lead|Application|Conversion',
          event_subtype: 'STRING COMMENT Ad_Impression|Email_Open|Branch_Visit|Form_Submit',
          
          // Channel & Campaign
          channel: 'STRING COMMENT Email|SMS|Push|Paid_Search|Paid_Social|Organic_Social|Display|Direct_Mail|Branch|Call_Center|Website|Mobile_App',
          channel_detail: 'STRING COMMENT Google_Search|Facebook|Branch_123|Email_Campaign_ABC',
          campaign_id: 'STRING FK to campaign',
          content_id: 'STRING COMMENT Ad creative, email template, landing page',
          
          // Product Context
          product_line: 'STRING COMMENT Product being marketed',
          product_category: 'STRING',
          offer_id: 'STRING',
          
          // Attribution Tracking
          utm_source: 'STRING',
          utm_medium: 'STRING',
          utm_campaign: 'STRING',
          utm_content: 'STRING',
          utm_term: 'STRING',
          referrer_url: 'STRING',
          landing_page_url: 'STRING',
          
          // Touchpoint Position
          touchpoint_sequence_number: 'INTEGER COMMENT Position in journey (1, 2, 3...)',
          is_first_touch: 'BOOLEAN',
          is_last_touch: 'BOOLEAN',
          time_since_previous_touch_minutes: 'INTEGER',
          time_to_next_touch_minutes: 'INTEGER',
          
          // Conversion Tracking
          is_conversion_event: 'BOOLEAN',
          conversion_type: 'STRING COMMENT Lead|Application|Account_Open|Funding',
          conversion_value: 'DECIMAL(18,2) COMMENT Deposit amount, loan amount, credit limit',
          
          // Device & Location
          device_type: 'STRING COMMENT Desktop|Mobile|Tablet|Branch_Terminal|ATM',
          operating_system: 'STRING',
          browser: 'STRING',
          app_version: 'STRING',
          ip_address: 'STRING',
          city: 'STRING',
          state: 'STRING',
          country: 'STRING',
          dma_code: 'STRING COMMENT Designated Market Area',
          branch_id: 'STRING COMMENT If branch touchpoint',
          
          // Engagement Metrics
          time_on_page_seconds: 'INTEGER',
          scroll_depth_percentage: 'INTEGER',
          cta_clicked: 'BOOLEAN COMMENT Call-to-action clicked',
          form_started: 'BOOLEAN',
          form_completed: 'BOOLEAN',
          form_abandonment_field: 'STRING COMMENT Last field before abandon',
          
          // Audit
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Foundation for multi-touch attribution and journey analytics',
      },
      
      // MARKETING ROI TRACKING (from Finance + Marketing Systems)
      {
        name: 'bronze.mktg_campaign_costs',
        description: 'Detailed marketing costs by campaign and channel',
        sourceSystem: 'FINANCE_SYSTEM + AD_PLATFORMS',
        loadFrequency: 'Daily',
        estimatedRows: 1000000,
        schema: {
          cost_record_id: 'STRING PRIMARY KEY',
          date: 'DATE',
          campaign_id: 'STRING FK to campaign',
          channel: 'STRING',
          
          // Cost Categories
          cost_type: 'STRING COMMENT Media_Spend|Creative_Production|Technology|Agency_Fees|Data_Costs|Incentive_Payouts',
          vendor_name: 'STRING',
          vendor_invoice_number: 'STRING',
          
          // Amounts
          cost_amount: 'DECIMAL(18,2)',
          currency: 'STRING COMMENT USD',
          cost_amount_usd: 'DECIMAL(18,2) COMMENT Converted to USD',
          
          // Media Spend Detail
          impressions: 'BIGINT',
          clicks: 'BIGINT',
          cpm: 'DECIMAL(10,2) COMMENT Cost per thousand impressions',
          cpc: 'DECIMAL(10,2) COMMENT Cost per click',
          
          // Accounting
          cost_center: 'STRING',
          gl_account: 'STRING COMMENT General ledger account',
          purchase_order: 'STRING',
          payment_status: 'STRING COMMENT Pending|Paid|Disputed',
          payment_date: 'DATE',
          approved_by: 'STRING',
          
          // Audit
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
      },
      
      // CORE BANKING ACCOUNT EVENTS (from Core Banking System)
      {
        name: 'bronze.core_banking_account_events',
        description: 'Key account events from core banking for marketing attribution',
        sourceSystem: 'CORE_BANKING_SYSTEM (FIS/Temenos)',
        loadFrequency: 'Daily',
        estimatedRows: 100000000,
        schema: {
          event_id: 'STRING PRIMARY KEY',
          account_id: 'STRING FK to account',
          customer_id: 'STRING FK to customer',
          
          // Event Type
          event_type: 'STRING COMMENT Account_Opened|First_Deposit|Account_Funded|Direct_Deposit_Setup|Debit_Card_Activated|Bill_Pay_Setup|Mobile_App_Enrolled',
          event_timestamp: 'TIMESTAMP',
          event_date: 'DATE',
          
          // Account Details
          product_type: 'STRING COMMENT Checking|Savings|CD|MoneyMarket',
          product_sku: 'STRING',
          account_open_date: 'DATE',
          account_status: 'STRING',
          
          // Financial Details
          opening_deposit_amount: 'DECIMAL(18,2)',
          current_balance: 'DECIMAL(18,2)',
          available_balance: 'DECIMAL(18,2)',
          average_balance_30d: 'DECIMAL(18,2)',
          
          // Offer Tracking
          offer_code_used: 'STRING',
          promo_code_used: 'STRING',
          bonus_eligible: 'BOOLEAN',
          
          // Channel
          opening_channel: 'STRING COMMENT Branch|Online|Mobile|Call_Center',
          opening_branch_id: 'STRING',
          
          // Audit
          _bronze_loaded_timestamp: 'TIMESTAMP',
        },
        businessContext: 'Link marketing activity to actual account opening and funding',
      },
    ],
  },
  
  // ========================================
  // SILVER LAYER - CLEANSED & INTEGRATED DATA
  // ========================================
  silverLayer: {
    description: 'Cleansed, deduplicated, and integrated data ready for analytics',
    tables: [
      {
        name: 'silver.mktg_campaigns_enriched',
        description: 'Cleansed campaign data with performance metrics',
        transformations: [
          'Standardize product_line and product_category values',
          'Validate compliance flags (all must be TRUE for Active status)',
          'Enrich with product master data (product names, features)',
          'Calculate campaign duration, budget per day',
          'Flag campaigns missing required fields',
        ],
        dataQuality: [
          'All Active campaigns must have compliance_approved = TRUE',
          'Budget_total must equal sum of channel budgets',
          'Start_date must be <= end_date',
        ],
      },
      {
        name: 'silver.mktg_leads_enriched',
        description: 'Enriched lead data with customer match and scoring',
        transformations: [
          'Match leads to existing customers using email, phone, SSN',
          'Deduplicate leads (same customer, same product, within 30 days)',
          'Enrich with customer demographic and financial data',
          'Calculate lead age (days since submission)',
          'Flag high-value leads (score >= 80)',
          'Validate consent flags against consent management system',
        ],
        scdType: 'SCD_TYPE_1',
      },
      {
        name: 'silver.mktg_customer_journeys',
        description: 'Aggregated customer journeys from touchpoint events',
        transformations: [
          'Group touchpoint events into journeys by customer + product + 90-day window',
          'Assign touchpoint sequence numbers within journey',
          'Identify first touch, last touch, and assisted touches',
          'Calculate journey duration and time between touches',
          'Determine journey outcome (Converted, Abandoned, In Progress)',
          'Integrate branch visits and call center interactions',
        ],
        grain: 'One row per customer journey',
      },
      {
        name: 'silver.mktg_multi_touch_attribution',
        description: 'Multi-touch attribution with multiple models',
        transformations: [
          'Apply First-Touch attribution model',
          'Apply Last-Touch attribution model',
          'Apply Linear attribution model (equal credit)',
          'Apply Time-Decay attribution model',
          'Apply U-Shaped attribution model (40% first, 40% last, 20% middle)',
          'Apply W-Shaped attribution model (30% first, 30% last, 30% lead creation, 10% middle)',
          'Apply Custom Banking Model (30% branch, 70% digital)',
          'Calculate attributed revenue by channel and campaign',
        ],
        grain: 'One row per journey per attribution model',
      },
      {
        name: 'silver.mktg_campaign_performance_daily',
        description: 'Daily campaign performance aggregation',
        transformations: [
          'Aggregate leads by campaign and date',
          'Aggregate applications by campaign and date',
          'Aggregate accounts opened by campaign and date',
          'Aggregate funded accounts by campaign and date',
          'Calculate conversion rates (lead-to-app, app-to-open, open-to-fund)',
          'Calculate cumulative costs',
          'Calculate CAC (Customer Acquisition Cost)',
        ],
        grain: 'One row per campaign per date',
      },
      {
        name: 'silver.mktg_offer_performance',
        description: 'Offer performance with redemption tracking',
        transformations: [
          'Calculate offer redemption rate',
          'Calculate bonus payout rate (qualified / redeemed)',
          'Track average account balance for redeemed offers',
          'Calculate incremental revenue (vs non-offer accounts)',
          'Flag offers with high early closure rate',
          'Calculate ROI per offer',
        ],
        grain: 'One row per offer',
      },
      {
        name: 'silver.mktg_consent_current',
        description: 'Current consent status per customer (SCD Type 2 → Type 1 view)',
        transformations: [
          'Filter to current records only (is_current = TRUE)',
          'Pivot consent types to columns',
          'Calculate days since last consent update',
          'Flag expired consents (if jurisdiction requires re-consent)',
          'Identify customers with inconsistent consent across channels',
        ],
        scdType: 'SCD_TYPE_1 (current state view)',
      },
      {
        name: 'silver.mktg_product_line_performance',
        description: 'Performance aggregated by product line',
        transformations: [
          'Aggregate metrics by product_line (Deposits, Cards, Loans)',
          'Calculate product-specific KPIs (total deposits, loan volume, credit extended)',
          'Calculate product-specific revenue (interest income, fee income)',
          'Calculate product-specific costs (cost of funds, expected losses)',
          'Calculate product-specific ROI',
        ],
        grain: 'One row per product_line per month',
      },
    ],
  },
  
  // ========================================
  // GOLD LAYER - DIMENSIONAL MODEL
  // ========================================
  goldLayer: {
    description: 'Analytics-optimized dimensional model for reporting and BI',
    dimensions: [
      {
        name: 'gold.dim_banking_product',
        description: 'Banking product dimension',
        scdType: 'SCD_TYPE_2',
        businessKey: 'product_sku',
        attributes: [
          'product_key (surrogate)',
          'product_sku (natural key)',
          'product_name',
          'product_line (Deposits|Cards|Loans|Investments|Mortgages)',
          'product_category (Checking|Savings|CD|CreditCard|PersonalLoan|etc.)',
          'product_type (Consumer|Small_Business|Commercial)',
          'interest_bearing',
          'minimum_opening_deposit',
          'monthly_maintenance_fee',
          'apr_range_low',
          'apr_range_high',
          'rewards_program',
          'credit_score_required',
          'effective_date',
          'expiration_date',
          'is_current',
        ],
      },
      {
        name: 'gold.dim_marketing_campaign',
        description: 'Marketing campaign dimension',
        scdType: 'SCD_TYPE_2',
        businessKey: 'campaign_id',
        attributes: [
          'campaign_key (surrogate)',
          'campaign_id (natural key)',
          'campaign_name',
          'campaign_type (Acquisition|Cross_Sell|Up_Sell|Retention|Win_Back)',
          'campaign_objective',
          'product_key (FK to dim_banking_product)',
          'target_segment',
          'channel_strategy',
          'has_cash_bonus',
          'cash_bonus_tier (None|Small_<$100|Medium_$100-$300|Large_>$300)',
          'compliance_approved',
          'start_date',
          'end_date',
          'campaign_duration_days',
          'effective_date',
          'expiration_date',
          'is_current',
        ],
      },
      {
        name: 'gold.dim_marketing_channel',
        description: 'Marketing channel dimension',
        scdType: 'SCD_TYPE_1',
        attributes: [
          'channel_key (surrogate)',
          'channel_name (Email|SMS|Paid_Search|Paid_Social|Branch|etc.)',
          'channel_type (Digital|Physical|Hybrid)',
          'channel_category (Paid|Owned|Earned)',
          'is_digital',
          'is_trackable',
          'typical_attribution_window_days',
          'cost_model (CPC|CPM|CPA|Fixed|Variable)',
        ],
      },
      {
        name: 'gold.dim_customer_segment',
        description: 'Customer segment dimension',
        scdType: 'SCD_TYPE_2',
        attributes: [
          'segment_key (surrogate)',
          'segment_id (natural key)',
          'segment_name',
          'segment_type (Demographic|Behavioral|Lifecycle|Value|Predictive)',
          'segment_category (Mass|Mass_Affluent|Affluent|Student|Senior)',
          'income_tier',
          'age_range',
          'credit_tier',
          'lifecycle_stage',
          'clv_tier',
          'products_owned',
          'tenure_tier',
          'effective_date',
          'expiration_date',
          'is_current',
        ],
      },
      {
        name: 'gold.dim_offer',
        description: 'Marketing offer dimension',
        scdType: 'SCD_TYPE_2',
        businessKey: 'offer_id',
        attributes: [
          'offer_key (surrogate)',
          'offer_id (natural key)',
          'offer_code',
          'offer_name',
          'offer_type',
          'product_key (FK)',
          'cash_bonus_amount',
          'apr_promo_rate',
          'fee_waiver_type',
          'min_opening_deposit',
          'min_credit_score',
          'redemption_difficulty (Easy|Medium|Hard)',
          'fraud_risk_rating',
          'start_date',
          'end_date',
          'effective_date',
          'expiration_date',
          'is_current',
        ],
      },
      {
        name: 'gold.dim_attribution_model',
        description: 'Attribution model dimension',
        scdType: 'SCD_TYPE_1',
        attributes: [
          'attribution_model_key (surrogate)',
          'model_name (First_Touch|Last_Touch|Linear|Time_Decay|U_Shaped|W_Shaped|Custom_Banking)',
          'model_description',
          'lookback_window_days',
          'first_touch_credit_pct',
          'last_touch_credit_pct',
          'middle_touch_credit_pct',
          'is_default_model',
        ],
      },
      {
        name: 'gold.dim_branch',
        description: 'Branch location dimension (for branch marketing attribution)',
        scdType: 'SCD_TYPE_2',
        attributes: [
          'branch_key (surrogate)',
          'branch_id (natural key)',
          'branch_name',
          'branch_code',
          'street_address',
          'city',
          'state',
          'zip_code',
          'county',
          'dma_code',
          'latitude',
          'longitude',
          'branch_tier (Flagship|Full_Service|Express|ATM_Only)',
          'deposit_size_tier',
          'loan_volume_tier',
          'open_date',
          'close_date',
          'is_open',
          'effective_date',
          'expiration_date',
          'is_current',
        ],
      },
    ],
    facts: [
      {
        name: 'gold.fact_campaign_performance',
        description: 'Daily campaign performance metrics',
        factType: 'PERIODIC_SNAPSHOT',
        grain: 'One row per campaign per date',
        measures: [
          'impressions',
          'clicks',
          'website_visits',
          'leads_generated',
          'leads_qualified',
          'applications_started',
          'applications_submitted',
          'applications_approved',
          'accounts_opened',
          'accounts_funded',
          'total_deposits_acquired',
          'total_loans_funded',
          'total_credit_extended',
          'total_cost',
          'media_cost',
          'creative_cost',
          'technology_cost',
          'ctr (click-through rate)',
          'conversion_rate_lead',
          'conversion_rate_application',
          'conversion_rate_funding',
          'cac (customer acquisition cost)',
          'cost_per_funded_account',
          'revenue_30d',
          'revenue_90d',
          'revenue_180d',
          'roi_30d',
          'roi_90d',
          'roi_180d',
        ],
        dimensions: [
          'date_key',
          'campaign_key',
          'product_key',
          'channel_key',
          'segment_key',
          'offer_key',
          'branch_key (for branch campaigns)',
        ],
      },
      {
        name: 'gold.fact_lead_conversion',
        description: 'Lead lifecycle from creation to conversion',
        factType: 'ACCUMULATING_SNAPSHOT',
        grain: 'One row per lead',
        measures: [
          'lead_score',
          'lead_grade_numeric (A=5, B=4, C=3, D=2, F=1)',
          'days_to_first_contact',
          'days_to_qualification',
          'days_to_application',
          'days_to_decision',
          'days_to_account_open',
          'days_to_funding',
          'total_touches',
          'email_touches',
          'sms_touches',
          'phone_touches',
          'branch_touches',
          'web_sessions',
          'mobile_app_sessions',
          'conversion_flag',
          'conversion_value',
          'opening_deposit_amount',
          'current_account_balance',
          'is_still_open',
          'days_account_open',
        ],
        dimensions: [
          'lead_creation_date_key',
          'first_contact_date_key',
          'application_date_key',
          'decision_date_key',
          'account_open_date_key',
          'funding_date_key',
          'campaign_key',
          'product_key',
          'channel_key (first touch)',
          'segment_key',
          'offer_key',
          'branch_key (if branch lead)',
        ],
      },
      {
        name: 'gold.fact_multi_touch_attribution',
        description: 'Attribution credit by touchpoint',
        factType: 'TRANSACTION',
        grain: 'One row per touchpoint per attribution model',
        measures: [
          'attribution_credit (0.0 to 1.0)',
          'attributed_revenue',
          'attributed_conversions',
          'touchpoint_position',
          'time_since_prev_touch_minutes',
          'time_to_next_touch_minutes',
        ],
        dimensions: [
          'touchpoint_date_key',
          'conversion_date_key',
          'customer_key',
          'journey_key',
          'campaign_key',
          'channel_key',
          'product_key',
          'attribution_model_key',
        ],
      },
      {
        name: 'gold.fact_offer_redemption',
        description: 'Offer redemption and performance',
        factType: 'TRANSACTION',
        grain: 'One row per redemption',
        measures: [
          'redemption_count (1)',
          'bonus_amount_paid',
          'account_balance_30d',
          'account_balance_60d',
          'account_balance_90d',
          'account_balance_180d',
          'account_still_open_flag',
          'days_account_remained_open',
          'revenue_30d',
          'revenue_90d',
          'revenue_180d',
          'incremental_revenue_flag',
          'fraud_score',
        ],
        dimensions: [
          'redemption_date_key',
          'account_open_date_key',
          'offer_key',
          'product_key',
          'customer_key',
          'campaign_key',
          'channel_key (attributed channel)',
        ],
      },
      {
        name: 'gold.fact_marketing_roi',
        description: 'Marketing ROI by product line and campaign',
        factType: 'PERIODIC_SNAPSHOT',
        grain: 'One row per campaign per month',
        measures: [
          'total_marketing_spend',
          'media_spend',
          'creative_production_cost',
          'technology_cost',
          'agency_fees',
          'incentive_payouts',
          'accounts_opened',
          'accounts_funded',
          'total_balances_acquired',
          'revenue_interest_income',
          'revenue_fee_income',
          'revenue_interchange',
          'revenue_total',
          'cost_of_funds',
          'expected_credit_losses',
          'operational_costs',
          'net_revenue',
          'roi_percentage',
          'roas (return on ad spend)',
          'cac (customer acquisition cost)',
          'ltv (customer lifetime value)',
          'ltv_to_cac_ratio',
          'payback_period_months',
        ],
        dimensions: [
          'month_key',
          'campaign_key',
          'product_key',
          'segment_key',
          'attribution_model_key',
        ],
      },
    ],
  },
};

export default marketingRetailPhysicalModel;
