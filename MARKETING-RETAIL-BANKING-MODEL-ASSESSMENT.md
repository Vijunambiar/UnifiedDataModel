# Marketing-Retail Banking Model Assessment & Enhancement

## Executive Summary

**Assessment Date**: January 2025  
**Domain**: Marketing-Retail  
**Current Status**: Enhanced from platform-centric to banking-centric model  
**Version**: 2.0 (Banking-Specific)

## Assessment Findings

### Original Model (v1.0) - Strengths
✅ **Technical Excellence**: Fivetran-based schemas with realistic platform attributes  
✅ **Multi-Platform Coverage**: 17 data sources (Google Ads, Facebook, HubSpot, SFMC, GA4, etc.)  
✅ **Comprehensive Metrics**: 400 marketing KPIs  
✅ **Industry Standards**: Followed Fivetran documentation accurately

### Original Model (v1.0) - Gaps for Banking
❌ **Generic Marketing Focus**: Not specific to banking products (checking, savings, loans, cards)  
❌ **Missing Banking Context**: No product SKUs, offer redemption, account funding tracking  
❌ **Compliance Gaps**: Limited TCPA, CAN-SPAM, CFPB, ECOA compliance tracking  
❌ **Attribution Limitations**: Missing branch attribution, call center integration  
❌ **ROI Blind Spots**: No product-specific ROI (interest income, fee revenue, cost of funds)  
❌ **Lead Management**: Generic lead scoring without banking-specific qualification  
❌ **Consent Management**: Basic opt-in/out without regulatory depth  

## Banking Use Cases (Not Solved by Original Model)

### 1. Checking Account Acquisition Campaign
**Business Need**: $200 cash bonus for new checking with $500 initial deposit + 3 months direct deposits  
**Original Model Gap**: No offer redemption tracking, no deposit tracking, no bonus payout compliance  

### 2. Credit Card Cross-Sell to Existing Customers
**Business Need**: Target checking customers for rewards credit card with 50K points bonus  
**Original Model Gap**: No customer-to-product relationship, no credit qualification, no interchange revenue

### 3. Personal Loan Lead Nurturing
**Business Need**: Multi-channel drip campaign for personal loan leads with income/credit qualification  
**Original Model Gap**: No loan-specific fields (amount, term, purpose), no income/credit tracking

### 4. Branch Marketing for Local Markets
**Business Need**: Drive branch traffic with geo-targeted campaigns and in-branch conversion  
**Original Model Gap**: No branch touchpoint tracking, no branch attribution model

### 5. Compliance-Aware Marketing
**Business Need**: Track TCPA consent for phone/SMS, CAN-SPAM for email, CFPB disclosures  
**Original Model Gap**: Basic consent only, no audit trail, no regulatory detail

### 6. Product-Specific Marketing ROI
**Business Need**: Calculate ROI including interest income, fee revenue, cost of funds, expected losses  
**Original Model Gap**: Generic revenue tracking, no banking P&L components

---

## Enhanced Banking Model (v2.0)

### Logical Model - Banking-Specific Entities

#### 1. Banking Product Campaign
**Purpose**: Marketing campaigns for specific banking products  
**Real Example**: "Q1 2024 Premium Checking Account Acquisition Campaign"

**Key Attributes** (vs generic campaigns):
- `product_line`: Deposits|Cards|Loans|Investments|Mortgage
- `product_sku`: Specific product (e.g., PREMIUM_CHECKING_001)
- `target_credit_tier`: Excellent|Good|Fair|Poor (for credit products)
- `target_income_range`: Income bracket targeting
- `compliance_approved_by`: Compliance officer approval
- `tcpa_compliant`, `can_spam_compliant`, `cfpb_reviewed`: Regulatory flags
- `target_accounts_opened`, `target_funded_accounts`, `target_total_deposits`: Banking KPIs

**Business Rules**:
- All customer communication must be TCPA and CAN-SPAM compliant
- Credit card/loan campaigns must be CFPB reviewed
- Offers cannot discriminate (ECOA compliance)

#### 2. Banking Product Offer
**Purpose**: Promotional offers with T&Cs and redemption tracking  
**Real Example**: "$200 bonus for $500 opening deposit + 3 months of $500 direct deposits"

**Key Attributes**:
- `offer_type`: Cash_Bonus|APR_Discount|Fee_Waiver|Points_Bonus|Rate_Boost
- `cash_bonus_amount`: $50, $200, $500, etc.
- `min_opening_deposit`, `min_direct_deposit_amount`: Qualification requirements
- `min_credit_score`, `min_age`, `employment_requirement`: Eligibility criteria
- `form_1099_required`: Tax reporting flag (bonuses >$600/year)
- `compliance_disclosure`, `tila_disclosure`: Required disclosures

**Business Rules**:
- Cash bonuses require IRS 1099-INT reporting if >$600/year
- APR disclosures must comply with Truth in Lending Act (TILA)
- Eligibility cannot discriminate based on protected classes (ECOA)

#### 3. Banking Lead
**Purpose**: Prospective customer interest in banking products  
**Real Example**: "Customer fills out mortgage pre-qualification form"

**Key Attributes** (vs generic leads):
- `lead_type`: New_Customer|Existing_Customer_Cross_Sell
- `product_interest`: Checking|Savings|CD|CreditCard|PersonalLoan|AutoLoan|Mortgage
- `loan_amount_requested`, `loan_term_requested_months`: Loan-specific
- `submitted_credit_score`, `submitted_income`, `employment_status`: Financial profile
- `contact_consent_email`, `contact_consent_phone`, `contact_consent_sms`: TCPA consent
- `consent_timestamp`, `consent_ip_address`: Compliance audit trail
- `days_to_application`, `days_to_funding`: Conversion timing

**Business Rules**:
- Cannot contact without proper TCPA consent
- Must honor opt-out requests within 10 days
- Lead scoring cannot use protected class attributes
- Must maintain consent documentation for 3+ years

#### 4. Customer Banking Journey
**Purpose**: Track journey from awareness to account funding  
**Real Example**: "Credit card journey: paid search ad → email → branch visit → approval → activation"

**Key Attributes**:
- `journey_type`: Acquisition|Cross_Sell|Up_Sell|Retention
- `product_line`: Product being pursued
- `total_touchpoints`, `touchpoint_channels`: Journey complexity
- `branch_visit_count`, `call_center_contact_count`: Offline touchpoints
- `conversion_value`: Deposit amount, loan amount, credit limit
- `abandonment_stage`, `abandonment_reason`: Drop-off analysis

**Business Rules**:
- Journey starts at first attributable marketing touchpoint
- Journey ends at conversion or 90 days of inactivity
- Must integrate branch and call center interactions

#### 5. Multi-Touch Attribution
**Purpose**: Attribute revenue across marketing touchpoints  
**Real Example**: "Credit card: 40% paid search, 30% email, 30% branch visit"

**Key Attributes**:
- `attribution_model`: First_Touch|Last_Touch|Linear|Time_Decay|U_Shaped|W_Shaped|Custom_Banking
- `attribution_window_days`: 30 (deposits), 60 (cards), 90 (loans)
- `branch_attribution_credit`, `branch_attribution_revenue`: Branch channel credit
- Channel-specific attribution for each major channel

**Business Rules**:
- Sum of all attribution credits must equal 1.0
- Attribution window varies by product
- Branch touchpoints receive minimum 20% credit in W-shaped model

#### 6. Compliance Consent Management
**Purpose**: Track marketing consent per TCPA, CAN-SPAM, GDPR, CCPA  
**Real Example**: "Customer opts in to email and SMS but opts out of phone calls"

**Key Attributes**:
- `consent_type`: Email|SMS|Phone_Call|Push|Direct_Mail
- `tcpa_consent`, `can_spam_consent`, `gdpr_consent`, `ccpa_do_not_sell`: Regulatory flags
- `consent_timestamp`, `consent_ip_address`, `consent_geolocation`: Audit trail
- `consent_text_shown`: Exact consent language
- `product_category_preferences`: Granular preferences by product
- `global_suppression_flag`, `suppression_reason`: Suppression tracking

**Business Rules**:
- Must honor opt-out within 10 days
- Cannot contact via channel without valid consent
- Consent records retained for 3-7 years
- SMS requires explicit opt-in (TCPA)
- Must provide easy opt-out in every communication

#### 7. Marketing ROI by Product
**Purpose**: Calculate banking-specific marketing ROI  
**Real Example**: "Credit card: $500K spend, 2,000 accounts, $10M credit, $2M revenue/24mo = 400% ROI"

**Key Attributes**:
- `total_marketing_spend`: Media + creative + technology + agency
- `accounts_opened`, `accounts_funded`: Acquisition metrics
- `total_deposits_acquired`, `total_loans_funded`, `total_credit_extended`: Product-specific
- `revenue_interest_income`, `revenue_fee_income`: Banking revenue components
- `cost_of_funds`, `expected_credit_losses`, `operational_costs`: Banking costs
- `ltv_to_cac_ratio`: Customer LTV / CAC (target 3:1)
- `payback_period_months`: Time to recoup marketing spend

**Business Rules**:
- ROI must include all costs (media, creative, technology, agency)
- Revenue projections use conservative assumptions
- Must account for expected credit losses on loan/card products
- LTV calculations typically use 24-36 month horizon
- Incremental analysis required to avoid counting organic growth

---

### Physical Model - Bronze Layer (Banking-Specific Tables)

#### 1. `bronze.mktg_banking_product_campaigns`
**Source**: Salesforce Marketing Cloud  
**Rows**: ~50,000 campaigns

**Key Fields for Banking**:
- `product_line`, `product_category`, `product_sku`: Product targeting
- `target_credit_tier`, `target_income_range`, `target_age_range`: Audience segmentation
- `offer_id`, `cash_bonus_amount`, `promo_apr_rate`: Offer association
- `compliance_reviewed_by`, `legal_approved_by`: Approval tracking
- `tcpa_compliant`, `can_spam_compliant`, `cfpb_reviewed`, `ecoa_compliant`: Compliance flags
- `target_accounts_opened`, `target_funded_accounts`, `target_total_deposits`: Banking KPIs
- `budget_by_channel`: Channel budget allocation

**Validation Rules**:
- Active campaigns must have `compliance_approved = TRUE`
- `budget_total` must equal sum of channel budgets
- Credit/loan campaigns require `cfpb_reviewed = TRUE`

#### 2. `bronze.mktg_banking_product_offers`
**Source**: Offer Management System  
**Rows**: ~10,000 offers

**Key Fields for Banking**:
- `cash_bonus_amount`, `apr_discount_rate`, `fee_waiver_type`, `rewards_points_bonus`: Offer structure
- `min_opening_deposit`, `min_direct_deposit_amount`, `min_debit_transactions`: Qualification requirements
- `min_credit_score`, `min_age`, `employment_requirement`, `residency_requirement`: Eligibility
- `terms_and_conditions`, `tila_disclosure`, `schumer_box`: Compliance disclosures
- `form_1099_required`, `taxable_bonus`: Tax implications
- `redemption_trigger`, `payout_timing`, `max_redemptions_per_customer`: Redemption rules

**Validation Rules**:
- Bonuses >$600/year require `form_1099_required = TRUE`
- Credit products require `tila_disclosure` populated
- Eligibility criteria cannot discriminate (ECOA)

#### 3. `bronze.mktg_banking_product_leads`
**Source**: Salesforce CRM  
**Rows**: ~10M leads  
**Load**: Streaming (15-min micro-batches)

**Key Fields for Banking**:
- `lead_type`: New_Customer|Existing_Customer_Cross_Sell
- `product_interest`, `product_sku_interest`: Product targeting
- `annual_income`, `employment_status`, `credit_score_range`: Financial profile
- `loan_amount_requested`, `loan_term_requested_months`, `loan_purpose`: Loan-specific
- `vehicle_year`, `vehicle_make`, `vehicle_model`: Auto loan-specific
- `home_value`, `mortgage_balance`: HELOC-specific
- `marketing_consent_email`, `marketing_consent_phone`, `marketing_consent_sms`: TCPA consent
- `consent_timestamp`, `consent_ip_address`, `tcpa_consent_text`: Compliance audit
- `days_to_application`, `days_to_funding`: Conversion tracking

**Validation Rules**:
- Cannot contact without appropriate consent = TRUE
- Consent must have `consent_timestamp` and `consent_ip_address`
- Lead score must be 0-100

#### 4. `bronze.mktg_offer_redemptions`
**Source**: Offer Management + Core Banking  
**Rows**: ~5M redemptions

**Key Fields for Banking**:
- `account_open_date`, `initial_deposit_amount`: Account creation
- `qualification_status`, `qualification_date`, `requirements_met`: Redemption tracking
- `bonus_amount`, `bonus_payout_date`, `bonus_payout_method`: Bonus payout
- `form_1099_issued`, `tax_year`: Tax compliance
- `account_balance_30d`, `account_balance_60d`, `account_balance_90d`: Retention tracking
- `account_still_open`, `account_close_date`, `account_close_reason`: Closure tracking
- `fraud_score`, `fraud_flag`, `fraud_reason`: Fraud monitoring

**Business Value**:
- Track offer effectiveness (redemption rate, bonus payout rate)
- Identify high early-closure offers (offer abuse)
- Calculate incremental revenue vs non-offer accounts

#### 5. `bronze.mktg_customer_consent`
**Source**: Customer Data Platform  
**Rows**: ~50M consent records  
**SCD Type**: Type 2 (historical tracking)

**Key Fields for Banking**:
- `consent_type`, `consent_status`: Opt-in/out by channel
- `tcpa_consent`, `can_spam_consent`, `gdpr_consent`, `ccpa_do_not_sell`: Regulatory compliance
- `consent_timestamp`, `consent_ip_address`, `consent_geolocation`: Audit trail
- `consent_text_shown`: Exact consent language presented
- `product_category_preferences`: Granular consent by product (deposits, loans, cards)
- `global_suppression_flag`, `suppression_reason`: Suppression tracking
- `record_effective_timestamp`, `record_expiration_timestamp`, `is_current`: SCD Type 2

**Critical for Compliance**:
- TCPA: Cannot call/text without valid consent
- CAN-SPAM: Must honor email opt-out within 10 days
- GDPR: Requires lawful basis (consent, legitimate interest, contract)
- CCPA: Must honor "Do Not Sell" requests

#### 6. `bronze.mktg_customer_journey_events`
**Source**: CDP + Attribution Platform  
**Rows**: ~500M touchpoint events  
**Load**: Streaming (real-time)

**Key Fields for Banking**:
- `event_type`: Impression|Click|View|Engagement|Lead|Application|Conversion
- `channel`: Email|SMS|Paid_Search|Paid_Social|Branch|Call_Center|Website|Mobile_App
- `product_line`, `product_category`: Product context
- `touchpoint_sequence_number`, `is_first_touch`, `is_last_touch`: Journey position
- `is_conversion_event`, `conversion_type`, `conversion_value`: Conversion tracking
- `branch_id`: Branch touchpoint (critical for attribution)
- `time_on_page_seconds`, `scroll_depth_percentage`: Engagement metrics

**Business Value**:
- Foundation for multi-touch attribution
- Identify high-performing journey paths
- Optimize channel mix and sequencing
- Integrate offline touchpoints (branch, call center)

#### 7. `bronze.mktg_campaign_costs`
**Source**: Finance System + Ad Platforms  
**Rows**: ~1M cost records

**Key Fields for Banking**:
- `cost_type`: Media_Spend|Creative_Production|Technology|Agency_Fees|Data_Costs|Incentive_Payouts
- `vendor_name`, `vendor_invoice_number`: Vendor tracking
- `cost_amount`, `currency`, `cost_amount_usd`: Cost amounts
- `cost_center`, `gl_account`, `purchase_order`: Accounting integration
- `payment_status`, `payment_date`, `approved_by`: Payment tracking

**Business Value**:
- Accurate ROI calculation (all-in costs)
- Track incentive payouts (cash bonuses) separately
- Budget vs actual tracking

#### 8. `bronze.core_banking_account_events`
**Source**: Core Banking System (FIS/Temenos)  
**Rows**: ~100M account events

**Key Fields for Banking**:
- `event_type`: Account_Opened|First_Deposit|Account_Funded|Direct_Deposit_Setup|Debit_Card_Activated
- `product_type`, `product_sku`: Account product
- `opening_deposit_amount`, `current_balance`, `average_balance_30d`: Financial tracking
- `offer_code_used`, `promo_code_used`, `bonus_eligible`: Offer tracking
- `opening_channel`, `opening_branch_id`: Acquisition channel

**Critical Integration**:
- Links marketing activity to actual account opening
- Tracks offer redemption triggers
- Measures account funding (not just opening)
- Enables lifetime value calculation

---

### Physical Model - Silver Layer (Banking Transformations)

#### 1. `silver.mktg_leads_enriched`
**Transformations**:
- Match leads to existing customers (email, phone, SSN)
- Deduplicate (same customer + product + 30 days)
- Enrich with customer demographic and financial data
- Calculate lead age, conversion durations
- Flag high-value leads (score >= 80)
- Validate consent against consent management system

**Data Quality**:
- All contact attempts must have valid consent
- Lead score 0-100
- Email/phone format validation

#### 2. `silver.mktg_customer_journeys`
**Transformations**:
- Group touchpoint events into journeys (customer + product + 90-day window)
- Assign touchpoint sequence numbers
- Identify first touch, last touch, assisted touches
- Calculate journey duration and inter-touch times
- Determine outcome (Converted, Abandoned, In Progress)
- Integrate branch visits and call center interactions

**Business Value**:
- Understand customer decision journey
- Identify drop-off points
- Optimize journey orchestration
- Integrate online and offline touchpoints

#### 3. `silver.mktg_multi_touch_attribution`
**Transformations**:
- Apply 7 attribution models:
  1. First-Touch
  2. Last-Touch
  3. Linear (equal credit)
  4. Time-Decay
  5. U-Shaped (40% first, 40% last, 20% middle)
  6. W-Shaped (30% first, 30% last, 30% lead, 10% middle)
  7. Custom Banking (30% branch, 70% digital)
- Calculate attributed revenue by channel and campaign
- Account for product-specific attribution windows

**Banking-Specific Rules**:
- Branch always gets minimum 20% credit in W-shaped
- Attribution windows vary by product (30d deposits, 60d cards, 90d loans)
- Revenue attribution includes interest income, fee income, interchange

#### 4. `silver.mktg_campaign_performance_daily`
**Aggregations**:
- Daily metrics: leads, applications, accounts opened, funded accounts
- Conversion rates: lead-to-app, app-to-open, open-to-fund
- Cumulative costs and revenue
- CAC (Customer Acquisition Cost)
- Product-specific metrics (deposits acquired, loans funded, credit extended)

**Business Value**:
- Daily campaign performance monitoring
- Early detection of underperforming campaigns
- Budget pacing and optimization

#### 5. `silver.mktg_offer_performance`
**Aggregations**:
- Offer redemption rate
- Bonus payout rate (qualified / redeemed)
- Average account balance for redeemed offers
- Early closure rate (offers with high early closures)
- Incremental revenue (vs non-offer accounts)
- ROI per offer

**Business Value**:
- Identify high-performing offers
- Detect offer abuse (high redemption, quick closure)
- Optimize offer structure and eligibility

#### 6. `silver.mktg_consent_current`
**Transformations**:
- Filter to current records (is_current = TRUE)
- Pivot consent types to columns
- Calculate days since last consent update
- Flag expired consents (if jurisdiction requires re-consent)
- Identify inconsistent consent across channels

**Critical for Compliance**:
- Real-time consent status for suppression lists
- Audit trail for regulatory inquiries
- Consent expiration alerting

#### 7. `silver.mktg_product_line_performance`
**Aggregations by Product Line**:
- Deposits: Total deposits acquired, average balance, fee revenue
- Cards: Cards issued, credit extended, interchange revenue, interest income
- Loans: Loans funded, interest income, expected losses
- By product line: Leads, applications, accounts opened, revenue, costs, ROI

**Business Value**:
- Product line profitability
- Budget allocation by product
- Product mix optimization

---

### Physical Model - Gold Layer (Banking Dimensional Model)

#### Dimensions

##### 1. `gold.dim_banking_product`
**Purpose**: Banking product catalog  
**SCD Type**: Type 2 (track product changes)

**Attributes**:
- Product identification: SKU, name, line, category
- Product features: Interest bearing, rewards program, credit score required
- Pricing: Minimum deposit, monthly fee, APR range
- History: Effective date, expiration date, is_current

**Business Value**: Enable product performance analysis and comparisons

##### 2. `gold.dim_marketing_campaign`
**Purpose**: Marketing campaign dimension  
**SCD Type**: Type 2

**Attributes**:
- Campaign identification and classification
- Product association (FK to dim_banking_product)
- Targeting: Segment, channel strategy
- Offer details: Cash bonus tier, compliance flags
- Duration: Start, end, duration

**Business Value**: Campaign performance analysis and benchmarking

##### 3. `gold.dim_customer_segment`
**Purpose**: Customer segmentation  
**SCD Type**: Type 2

**Attributes**:
- Segment classification: Mass, Mass Affluent, Affluent
- Demographics: Income tier, age range, credit tier
- Behavioral: Lifecycle stage, CLV tier, products owned
- History tracking

**Business Value**: Segment targeting and performance analysis

##### 4. `gold.dim_offer`
**Purpose**: Marketing offer catalog  
**SCD Type**: Type 2

**Attributes**:
- Offer structure: Type, amount, requirements
- Eligibility: Minimum deposit, credit score, age
- Risk: Fraud risk rating, redemption difficulty
- History: Effective dates, version tracking

**Business Value**: Offer performance and optimization

##### 5. `gold.dim_attribution_model`
**Purpose**: Attribution model definitions  
**SCD Type**: Type 1

**Attributes**:
- Model name and description
- Credit percentages by touch position
- Lookback window
- Default flag

**Business Value**: Compare attribution models, select optimal model

##### 6. `gold.dim_branch`
**Purpose**: Branch location for attribution  
**SCD Type**: Type 2

**Attributes**:
- Branch identification and location
- Geography: City, state, zip, county, DMA, lat/long
- Classification: Branch tier, deposit size, loan volume
- Status: Open date, close date, is_open

**Business Value**: Branch marketing effectiveness, local market analysis

#### Facts

##### 1. `gold.fact_campaign_performance`
**Type**: Periodic Snapshot  
**Grain**: Campaign × Date

**Measures**:
- Volume metrics: Impressions, clicks, leads, applications, accounts opened/funded
- Financial metrics: Deposits acquired, loans funded, credit extended
- Cost metrics: Total cost, media cost, creative cost
- Efficiency metrics: CTR, conversion rates, CAC, cost per funded account
- Revenue metrics: Revenue 30d/90d/180d, ROI 30d/90d/180d

**Dimensions**: Date, Campaign, Product, Channel, Segment, Offer, Branch

**Business Questions**:
- Which campaigns drive the most account openings?
- What's the CAC by product line?
- Which channels have the best conversion rates?
- Are we hitting our account funding targets?

##### 2. `gold.fact_lead_conversion`
**Type**: Accumulating Snapshot  
**Grain**: One row per lead

**Measures**:
- Lead attributes: Score, grade
- Conversion timing: Days to contact, qualification, application, funding
- Touchpoint counts: Total touches, touches by channel
- Financial outcomes: Conversion value, opening deposit, current balance
- Account status: Is still open, days account open

**Dimensions**: Multiple date dimensions (creation, contact, application, decision, open, funding), Campaign, Product, Channel, Segment, Offer, Branch

**Business Questions**:
- What's our lead-to-application conversion rate?
- How long does it take to fund an account?
- Which channels generate the highest quality leads?
- What's the typical customer journey for credit cards vs checking?

##### 3. `gold.fact_multi_touch_attribution`
**Type**: Transaction  
**Grain**: Touchpoint × Attribution Model

**Measures**:
- Attribution credit (0.0 to 1.0)
- Attributed revenue and conversions
- Touchpoint position and timing

**Dimensions**: Touchpoint Date, Conversion Date, Customer, Journey, Campaign, Channel, Product, Attribution Model

**Business Questions**:
- What's the true contribution of each channel?
- How does branch attribution compare to digital?
- Which attribution model is most appropriate for our business?
- What's the typical number of touches before conversion?

##### 4. `gold.fact_offer_redemption`
**Type**: Transaction  
**Grain**: One row per redemption

**Measures**:
- Redemption count
- Bonus amount paid
- Account balances over time (30d, 60d, 90d, 180d)
- Account retention (still open, days open)
- Revenue by time period
- Incremental revenue flag
- Fraud score

**Dimensions**: Redemption Date, Account Open Date, Offer, Product, Customer, Campaign, Channel

**Business Questions**:
- Which offers have the best redemption rates?
- Are customers keeping accounts open after bonus payout?
- What's the incremental revenue from offers?
- Which offers have high fraud risk?

##### 5. `gold.fact_marketing_roi`
**Type**: Periodic Snapshot  
**Grain**: Campaign × Month

**Measures**:
- **Cost breakdown**: Total spend, media, creative, technology, agency, incentives
- **Volume metrics**: Accounts opened, accounts funded, total balances acquired
- **Revenue components**: Interest income, fee income, interchange, total revenue
- **Cost components**: Cost of funds, expected credit losses, operational costs
- **Profitability**: Net revenue, ROI %, ROAS
- **Efficiency**: CAC, LTV, LTV:CAC ratio, payback period months

**Dimensions**: Month, Campaign, Product, Segment, Attribution Model

**Business Questions**:
- What's the true ROI including all costs and banking-specific revenue?
- Which product lines have the best marketing ROI?
- Are we acquiring profitable customers (LTV:CAC > 3:1)?
- What's our payback period by product?

---

## Business Use Cases - Fully Solved

### 1. Checking Account Acquisition
**Campaign**: "$200 bonus for new checking + $500 initial deposit + 3 months $500 DD"

**Data Flow**:
1. **Campaign Setup** → `mktg_banking_product_campaigns`
   - Product: PREMIUM_CHECKING_001
   - Offer: CHECKING_Q1_2024_200
   - Compliance: TCPA/CAN-SPAM/CFPB approved
   
2. **Lead Generation** → `mktg_banking_product_leads`
   - Capture: Name, email, phone, income, employment
   - Consent: TCPA consent for phone/SMS
   - Scoring: Income + employment + age → lead score
   
3. **Account Opening** → `core_banking_account_events`
   - Event: Account_Opened
   - Opening deposit: $500
   - Offer code: CHECKING_Q1_2024_200
   
4. **Offer Redemption** → `mktg_offer_redemptions`
   - Track: 3 months of $500 DD
   - Qualification: After 3rd DD
   - Payout: $200 bonus, 1099-INT issued
   
5. **Attribution** → `mktg_multi_touch_attribution`
   - Journey: Paid search → email → branch visit
   - Model: W-shaped (30% search, 30% branch, 30% email, 10% other)
   
6. **ROI** → `fact_marketing_roi`
   - Costs: $50K media + $200/account bonuses
   - Revenue: $12 monthly fees × 500 accounts × 24 months
   - Net: Positive ROI at 18 months

### 2. Credit Card Cross-Sell
**Campaign**: Target checking customers for rewards card with 50K points bonus

**Data Flow**:
1. **Segmentation** → `mktg_customer_segments`
   - Target: Existing checking customers, FICO > 700, income > $75K
   - Exclusion: Already have credit card
   
2. **Consent Check** → `mktg_customer_consent`
   - Verify: Email opt-in, card product category consent
   - Suppress: Customers who opted out
   
3. **Campaign** → Email drip campaign
   - Track: Opens, clicks, application starts
   
4. **Application** → `mktg_banking_product_leads`
   - Capture: Credit application data
   - Underwriting: FICO pull, income verification
   
5. **Approval & Activation** → `core_banking_account_events`
   - Event: Card_Issued, Card_Activated
   - Credit limit: $10,000
   
6. **Revenue Tracking** → `fact_marketing_roi`
   - Revenue: Interchange ($200/year) + interest ($400/year)
   - Costs: $100 acquisition + $500 bonus
   - Payback: 12 months

### 3. Personal Loan Lead Nurturing
**Campaign**: Multi-channel drip for personal loan leads

**Data Flow**:
1. **Lead Capture** → `mktg_banking_product_leads`
   - Form: Loan amount, purpose, income, credit score range
   - Consent: TCPA consent for phone follow-up
   
2. **Lead Scoring** → `silver.mktg_leads_enriched`
   - Score components: Income (30%), credit (40%), employment (20%), existing customer (10%)
   - Grade: A, B, C, D, F
   
3. **Nurture Campaign** → `mktg_customer_journey_events`
   - Day 1: Welcome email
   - Day 3: SMS with rate information
   - Day 7: Phone call from banker
   - Day 14: Branch visit invitation
   
4. **Conversion Tracking** → `fact_lead_conversion`
   - Metrics: Days to application, days to funding
   - Journey: Email → Phone → Branch → Funded
   
5. **Attribution** → Custom banking model (30% branch, 70% digital)

### 4. Branch Marketing
**Campaign**: Geo-targeted campaigns to drive branch traffic

**Data Flow**:
1. **Targeting** → `mktg_banking_product_campaigns`
   - Geographic scope: Branch market (5-mile radius)
   - DMA: Local designated market area
   - Channels: Direct mail + local search + local Facebook
   
2. **Attribution** → `mktg_customer_journey_events`
   - Track: Branch visits (branch_id populated)
   - Match: Journey events to branch conversions
   
3. **Performance** → `fact_campaign_performance`
   - Dimension: Branch (dim_branch)
   - Metrics: Branch visits, accounts opened at branch
   - Attribution: Branch gets 30% credit in custom model

### 5. Compliance-Aware Marketing
**Campaign**: Ensure all marketing complies with TCPA, CAN-SPAM, CFPB

**Data Flow**:
1. **Consent Management** → `mktg_customer_consent`
   - Track: TCPA consent for phone/SMS
   - Audit: Consent timestamp, IP address, exact language
   - Expiration: Flag consents requiring re-confirmation
   
2. **Suppression Lists** → `silver.mktg_consent_current`
   - Real-time: Current opt-out status
   - Suppression: Global suppression for regulatory/fraud/deceased
   
3. **Campaign Validation** → `mktg_banking_product_campaigns`
   - Check: TCPA, CAN-SPAM, CFPB, ECOA compliance flags
   - Approval: Cannot activate without compliance approval
   
4. **Regulatory Reporting** → Ad hoc queries
   - Report: Consent rates, opt-out rates, suppression reasons
   - Audit: Full consent change history

### 6. Product-Specific Marketing ROI
**Campaign**: Calculate true ROI including banking P&L components

**Data Flow**:
1. **Costs** → `mktg_campaign_costs`
   - Track: Media, creative, technology, agency, data, incentive payouts
   - Allocate: By campaign and channel
   
2. **Accounts** → `core_banking_account_events`
   - Track: Accounts opened, funded, balances
   - Link: Offer codes to campaigns
   
3. **Revenue** → Banking systems + `fact_marketing_roi`
   - **Deposits**: Interest spread (deposit rate vs loan yield)
   - **Cards**: Interchange ($200/card/year) + interest income + fees
   - **Loans**: Interest income - cost of funds - expected losses
   
4. **ROI Calculation** → `fact_marketing_roi`
   - Formula: (Net Revenue - Marketing Spend) / Marketing Spend
   - Components: All-in costs, product-specific revenue, banking costs
   - Timeline: ROI at 30d, 90d, 180d, 12mo, 24mo

---

## Industry Standards Alignment

### Compliance Standards
✅ **TCPA** (Telephone Consumer Protection Act): Explicit consent tracking for phone/SMS  
✅ **CAN-SPAM Act**: Email opt-out honored within 10 days  
✅ **CFPB** (Consumer Financial Protection Bureau): Marketing disclosures and fair lending  
✅ **ECOA** (Equal Credit Opportunity Act): Non-discriminatory eligibility criteria  
✅ **TILA** (Truth in Lending Act): APR and fee disclosures for credit products  
✅ **GDPR**: Consent management and lawful basis (EU customers)  
✅ **CCPA**: Do Not Sell tracking (California customers)  
✅ **Gramm-Leach-Bliley Act**: Privacy notice requirements  

### Banking Technology Standards
✅ **Core Banking Integration**: FIS, Temenos, Jack Henry account events  
✅ **Fivetran Schemas**: Google Ads, Facebook, HubSpot, SFMC, GA4, Segment  
✅ **Marketing Automation**: Salesforce Marketing Cloud, Adobe Campaign  
✅ **Customer Data Platform**: Segment, mParticle, Tealium  
✅ **Attribution**: Google Analytics 4, Adobe Analytics, custom attribution  

### Data Architecture Standards
✅ **Medallion Architecture**: Bronze (raw) → Silver (cleansed) → Gold (dimensional)  
✅ **Slowly Changing Dimensions**: SCD Type 1 and Type 2 where appropriate  
✅ **Fact Table Types**: Transaction, Periodic Snapshot, Accumulating Snapshot  
✅ **Surrogate Keys**: All dimensions use surrogate keys  
✅ **Audit Fields**: Load timestamps, source system tracking  

### Banking KPI Standards
✅ **Customer Acquisition Cost (CAC)**: Marketing spend / accounts opened  
✅ **Cost per Funded Account**: Marketing spend / accounts funded (>$0)  
✅ **Lead-to-Application Rate**: Applications / leads  
✅ **Application-to-Funding Rate**: Funded accounts / applications  
✅ **Customer Lifetime Value (LTV)**: 24-36 month revenue projection  
✅ **LTV:CAC Ratio**: Target 3:1 or better  
✅ **Payback Period**: Months to recoup marketing spend  
✅ **Return on Ad Spend (ROAS)**: Revenue / marketing spend  
✅ **Marketing ROI**: (Net revenue - marketing spend) / marketing spend  

---

## Implementation Roadmap

### Phase 1: Core Tables (Weeks 1-4)
- [ ] `bronze.mktg_banking_product_campaigns`
- [ ] `bronze.mktg_banking_product_offers`
- [ ] `bronze.mktg_banking_product_leads`
- [ ] `bronze.mktg_customer_consent`
- [ ] `silver.mktg_campaigns_enriched`
- [ ] `silver.mktg_leads_enriched`
- [ ] `silver.mktg_consent_current`
- [ ] `gold.dim_banking_product`
- [ ] `gold.dim_marketing_campaign`
- [ ] `gold.fact_campaign_performance`

### Phase 2: Journey & Attribution (Weeks 5-8)
- [ ] `bronze.mktg_customer_journey_events`
- [ ] `silver.mktg_customer_journeys`
- [ ] `silver.mktg_multi_touch_attribution`
- [ ] `gold.dim_attribution_model`
- [ ] `gold.fact_multi_touch_attribution`
- [ ] `gold.fact_lead_conversion`

### Phase 3: Offers & ROI (Weeks 9-12)
- [ ] `bronze.mktg_offer_redemptions`
- [ ] `bronze.mktg_campaign_costs`
- [ ] `bronze.core_banking_account_events`
- [ ] `silver.mktg_offer_performance`
- [ ] `silver.mktg_product_line_performance`
- [ ] `gold.dim_offer`
- [ ] `gold.dim_branch`
- [ ] `gold.fact_offer_redemption`
- [ ] `gold.fact_marketing_roi`

### Phase 4: Platform Integration (Weeks 13-16)
- [ ] Integrate Fivetran platform tables (Google Ads, Facebook, etc.)
- [ ] Map platform data to banking campaigns
- [ ] Reconcile platform spend with campaign costs
- [ ] Unified reporting across platforms and banking campaigns

### Phase 5: Reporting & Analytics (Weeks 17-20)
- [ ] Campaign performance dashboards
- [ ] Lead conversion funnel analysis
- [ ] Multi-touch attribution reports
- [ ] Marketing ROI by product line
- [ ] Compliance & consent reporting
- [ ] Executive KPI scorecards

---

## Success Metrics

### Model Quality
- ✅ All campaigns mapped to banking products
- ✅ All leads have consent tracking
- ✅ All offers have compliance disclosures
- ✅ Attribution models include branch touchpoints
- ✅ ROI includes banking-specific revenue and costs

### Business Impact
- 📊 Improve lead-to-application rate by 20%
- 📊 Reduce CAC by 15% through better targeting
- 📊 Increase LTV:CAC ratio from 2:1 to 3:1
- 📊 Reduce payback period from 18mo to 12mo
- 📊 Achieve 100% TCPA/CAN-SPAM compliance
- 📊 Identify top 3 highest-ROI channels per product

### Operational Efficiency
- ⚡ Real-time consent status for suppression
- ⚡ Automated compliance validation before campaign launch
- ⚡ Daily performance monitoring and alerting
- ⚡ Streamlined offer redemption tracking
- ⚡ Unified reporting across all marketing platforms

---

## Conclusion

The **Marketing-Retail v2.0 Banking Model** transforms a generic marketing data model into a **banking-specific, compliance-first, ROI-optimized framework** that solves real retail banking marketing challenges.

### Key Differentiators from Original Model

| Aspect | Original Model (v1.0) | Banking Model (v2.0) |
|--------|----------------------|---------------------|
| **Focus** | Generic marketing platforms | Banking products & use cases |
| **Products** | Generic "products" | Checking, savings, CDs, cards, loans |
| **Offers** | Basic promos | Cash bonuses, APR promos, fee waivers with T&Cs |
| **Leads** | Generic leads | Banking leads with income, credit, employment |
| **Compliance** | Basic opt-in/out | TCPA, CAN-SPAM, CFPB, ECOA, TILA, GDPR, CCPA |
| **Attribution** | Digital channels only | Digital + branch + call center |
| **ROI** | Generic revenue | Interest income, fee income, cost of funds, losses |
| **Consent** | Basic tracking | Full audit trail, regulatory compliance, SCD Type 2 |
| **Use Cases** | Generic marketing | 6 banking-specific scenarios fully solved |

### Strategic Value

This model enables retail banks to:
1. **Optimize Marketing Spend**: Know true ROI by product line, not just generic ROAS
2. **Ensure Compliance**: Built-in TCPA, CAN-SPAM, CFPB, ECOA compliance tracking
3. **Improve Customer Acquisition**: Track leads from interest → application → funding
4. **Attribute Correctly**: Include branch and call center in multi-touch attribution
5. **Maximize Offer Effectiveness**: Track redemption lifecycle and bonus payout compliance
6. **Respect Customer Preferences**: Comprehensive consent management with audit trail
7. **Make Data-Driven Decisions**: Link marketing activity to actual account opening and profitability

### Next Steps

1. **Review**: Stakeholder review of logical and physical models
2. **Prioritize**: Select Phase 1 tables for immediate implementation
3. **Implement**: Build bronze tables with banking integrations (core banking, CRM, consent)
4. **Validate**: Pilot with one product line (e.g., checking accounts)
5. **Scale**: Expand to cards, loans, and other product lines
6. **Optimize**: Refine attribution models, offer structures, and campaign strategies

**Status**: ✅ Ready for Implementation
