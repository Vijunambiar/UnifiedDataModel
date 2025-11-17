# 🎯 SALES, MARKETING & CUSTOMER EXPERIENCE ENHANCEMENT ROADMAP

**Date:** January 8, 2025  
**Scope:** Retail Banking - Sales, Marketing, and Customer Experience Data Model Gaps  
**Objective:** Achieve comprehensive sales enablement, marketing attribution, and customer experience optimization capabilities

---

## 📊 EXECUTIVE SUMMARY

### Current State Assessment

**✅ EXISTING STRENGTHS:**
- ✅ **Customer 360:** Comprehensive customer profile with demographics, segments, behavioral scores (customer-retail)
- ✅ **Customer Journey Tracking:** Journey events and multi-touch attribution in marketing domain
- ✅ **Customer Experience Metrics:** NPS, CSAT, CES, sentiment analysis in customer gold layer
- ✅ **Marketing Campaigns:** Campaign management, lead tracking, and attribution (marketing-retail)
- ✅ **Digital Engagement:** App/web sessions, device analytics, digital adoption scores (digital-retail)
- ✅ **Customer Service:** Call records, chat sessions, case management, feedback (customer-service-retail)
- ✅ **Product Catalog:** Product dimensions and offers in gold layer

**❌ CRITICAL GAPS:**
- ❌ **NO dedicated Sales domain** - Missing SFDC/CRM opportunity, pipeline, quota, commission tracking
- ❌ **NO Personalization/Feature Store** - Missing ML model outputs, real-time features, A/B test results
- ❌ **NO Recommendation Engine** - Missing product recommendations, next-best-action, propensity scores
- ❌ **SCATTERED Sentiment Analysis** - Sentiment fields exist but no centralized NLP pipeline
- ❌ **INCOMPLETE Customer Lifetime Value (CLV)** - Basic metrics exist but no predictive CLV model outputs
- ❌ **LIMITED Real-Time Orchestration** - No real-time decisioning or event-driven personalization layer

---

## 🎯 PRIORITY ROADMAP (P0 → P2)

### **P0: Critical for Sales/Marketing/CX Operations** 🔴

#### 1. **Sales Domain** (NEW DOMAIN)
**Why Critical:** No visibility into sales pipeline, opportunity conversion, or salesperson performance  
**Impact:** Enable sales analytics, quota tracking, commission calculations, opportunity forecasting

**Files to Create:**
```
client/lib/retail/sales-retail-bronze-layer.ts
client/lib/retail/sales-retail-silver-layer.ts
client/lib/retail/sales-retail-gold-layer.ts
client/lib/retail/sales-retail-metrics.ts
client/lib/retail/sales-retail-erd.ts
client/lib/retail/sales-retail-comprehensive.ts
```

**Key Entities & Tables:**

**Bronze Layer (8 tables):**
1. `bronze.retail_sales_opportunities` - SFDC Opportunity integration
   - opportunity_id, account_id, lead_id, owner_id
   - stage (Prospecting, Qualification, Proposal, Negotiation, Closed Won/Lost)
   - amount, probability, expected_close_date
   - product_interest (checking, savings, loan, card, investment)
   - lead_source, campaign_id
   - competitive_threat, loss_reason

2. `bronze.retail_sales_leads` - Lead capture and scoring
   - lead_id, source (Web Form, Branch, Call Center, Referral, Event)
   - lead_score, lead_grade (A/B/C/D)
   - qualification_status, disqualification_reason
   - assigned_sales_rep, assignment_date

3. `bronze.retail_sales_activities` - Sales interactions
   - activity_id, opportunity_id, lead_id, account_id
   - activity_type (Call, Email, Meeting, Demo, Proposal Sent)
   - activity_outcome, notes
   - completed_by, completed_date

4. `bronze.retail_sales_quotes` - Product quotes/proposals
   - quote_id, opportunity_id
   - product_id, quoted_amount, quoted_rate
   - quote_status (Draft, Sent, Accepted, Rejected)
   - expiration_date, terms

5. `bronze.retail_sales_reps` - Salesperson master
   - sales_rep_id, employee_id
   - sales_territory, sales_team
   - quota_amount, commission_rate
   - active_flag, hire_date

6. `bronze.retail_sales_territories` - Geographic territories
   - territory_id, territory_name
   - zip_codes, branch_ids
   - assigned_sales_rep_id

7. `bronze.retail_sales_commissions` - Commission calculations
   - commission_id, sales_rep_id, opportunity_id
   - commission_amount, commission_period
   - commission_type (New Account, Cross-Sell, Referral)
   - paid_flag, payment_date

8. `bronze.retail_sales_referrals` - Customer referrals
   - referral_id, referrer_customer_id, referred_customer_id
   - referral_status, referral_reward_amount
   - referral_date, conversion_date

**Silver Layer (5 tables):**
1. `silver.retail_sales_opportunity_golden` - MDM opportunity record
2. `silver.retail_sales_lead_golden` - MDM lead record with deduplication
3. `silver.retail_sales_pipeline_snapshot` - Daily pipeline snapshots
4. `silver.retail_sales_activity_enriched` - Activity attribution
5. `silver.retail_sales_commission_reconciled` - Validated commissions

**Gold Layer (8 dimensions + 5 facts):**

**Dimensions:**
1. `gold.dim_sales_rep` - Salesperson dimension
2. `gold.dim_sales_territory` - Territory hierarchy
3. `gold.dim_lead_source` - Lead source taxonomy
4. `gold.dim_sales_stage` - Opportunity stage progression

**Facts:**
1. `gold.fact_sales_opportunities` - Opportunity grain
2. `gold.fact_sales_pipeline_daily` - Daily pipeline snapshot
3. `gold.fact_sales_activities` - Sales interaction grain
4. `gold.fact_sales_conversions` - Lead → Opportunity → Customer
5. `gold.fact_sales_commissions` - Commission calculations

**Key Metrics:**
- Sales pipeline value by stage
- Opportunity win rate by rep, product, source
- Average sales cycle length
- Lead conversion rate
- Quota attainment %
- Commission per rep
- Customer acquisition cost (CAC)

---

#### 2. **Personalization & ML Outputs Domain** (NEW DOMAIN)
**Why Critical:** No infrastructure for ML model outputs, A/B testing, or real-time personalization  
**Impact:** Enable next-best-offer, real-time personalization, model monitoring

**Files to Create:**
```
client/lib/retail/personalization-retail-bronze-layer.ts
client/lib/retail/personalization-retail-silver-layer.ts
client/lib/retail/personalization-retail-gold-layer.ts
client/lib/retail/personalization-retail-metrics.ts
client/lib/retail/personalization-retail-erd.ts
client/lib/retail/personalization-retail-comprehensive.ts
```

**Key Entities & Tables:**

**Bronze Layer (6 tables):**
1. `bronze.retail_ml_model_predictions` - Model output storage
   - prediction_id, customer_id, model_id, model_version
   - prediction_type (Churn, Cross-Sell, CLV, Product Affinity, Next Best Action)
   - predicted_value, confidence_score
   - feature_values (JSON), prediction_timestamp
   - model_runtime_ms

2. `bronze.retail_ml_features` - Feature store (real-time + batch)
   - feature_id, customer_id, feature_name, feature_value
   - feature_timestamp, feature_version
   - feature_type (Real-Time, Batch, Derived)
   - data_source, calculation_logic

3. `bronze.retail_ab_test_variants` - A/B test assignment
   - experiment_id, customer_id, variant_id
   - assignment_date, exposure_count
   - conversion_flag, conversion_date

4. `bronze.retail_ab_test_experiments` - Experiment metadata
   - experiment_id, experiment_name, experiment_type
   - start_date, end_date, status
   - hypothesis, success_metric
   - control_variant_id, treatment_variant_ids

5. `bronze.retail_personalization_events` - Personalization serving log
   - event_id, customer_id, session_id
   - recommendation_id, offer_id
   - served_timestamp, displayed_flag, clicked_flag
   - conversion_flag, conversion_amount

6. `bronze.retail_ml_model_registry` - Model catalog
   - model_id, model_name, model_type
   - model_version, deployment_date
   - training_dataset_id, model_metrics (JSON)
   - active_flag, deprecation_date

**Silver Layer (4 tables):**
1. `silver.retail_customer_features_aggregated` - Feature store aggregations
2. `silver.retail_ab_test_results` - Experiment outcomes
3. `silver.retail_model_performance_metrics` - Model monitoring
4. `silver.retail_personalization_effectiveness` - Conversion attribution

**Gold Layer (5 dimensions + 4 facts):**

**Dimensions:**
1. `gold.dim_ml_model` - Model catalog dimension
2. `gold.dim_ab_experiment` - Experiment dimension
3. `gold.dim_personalization_strategy` - Strategy taxonomy

**Facts:**
1. `gold.fact_ml_model_predictions` - Prediction grain
2. `gold.fact_ab_test_assignments` - Experiment assignment grain
3. `gold.fact_personalization_serving` - Offer/recommendation serving
4. `gold.fact_model_performance` - Model accuracy over time

**Key Metrics:**
- Model accuracy, precision, recall, F1
- A/B test lift, statistical significance
- Personalization conversion rate
- Feature drift detection
- Model inference latency

---

#### 3. **Product Recommendation Engine** (NEW DOMAIN)
**Why Critical:** No tracking of product recommendations or next-best-action decisioning  
**Impact:** Enable product cross-sell, upsell optimization, recommendation ROI measurement

**Files to Create:**
```
client/lib/retail/recommendations-retail-bronze-layer.ts
client/lib/retail/recommendations-retail-silver-layer.ts
client/lib/retail/recommendations-retail-gold-layer.ts
client/lib/retail/recommendations-retail-metrics.ts
client/lib/retail/recommendations-retail-erd.ts
client/lib/retail/recommendations-retail-comprehensive.ts
```

**Key Entities & Tables:**

**Bronze Layer (5 tables):**
1. `bronze.retail_product_recommendations` - Recommendation outputs
   - recommendation_id, customer_id, session_id
   - recommended_product_id, recommendation_rank
   - recommendation_score, recommendation_algorithm
   - recommendation_context (Homepage, Account Dashboard, Mobile App, Email, Branch)
   - recommendation_timestamp

2. `bronze.retail_recommendation_feedback` - Implicit/explicit feedback
   - feedback_id, recommendation_id, customer_id
   - displayed_flag, clicked_flag, dismissed_flag
   - conversion_flag, conversion_amount
   - dwell_time_seconds, feedback_timestamp

3. `bronze.retail_product_affinity_scores` - Affinity matrix
   - customer_id, product_id
   - affinity_score, last_purchased_date
   - purchase_frequency, average_purchase_amount
   - propensity_score

4. `bronze.retail_next_best_action` - NBA decisioning
   - action_id, customer_id, action_type
   - action_recommendation (Open Savings Account, Apply for Credit Card, etc.)
   - action_priority, action_expiry_date
   - action_trigger (Lifecycle Event, Threshold, Churn Risk)

5. `bronze.retail_collaborative_filtering_data` - User-item interactions
   - customer_id, product_id, interaction_type
   - interaction_timestamp, interaction_value
   - implicit_rating (view, click, add to cart, purchase)

**Silver Layer (3 tables):**
1. `silver.retail_recommendations_enriched` - Recommendations with customer/product context
2. `silver.retail_recommendation_performance` - Conversion analysis
3. `silver.retail_product_similarity_matrix` - Product-to-product similarity

**Gold Layer (4 dimensions + 3 facts):**

**Dimensions:**
1. `gold.dim_recommendation_algorithm` - Algorithm taxonomy (Collaborative, Content-Based, Hybrid)

**Facts:**
1. `gold.fact_product_recommendations` - Recommendation grain
2. `gold.fact_recommendation_conversions` - Conversion attribution
3. `gold.fact_next_best_action_performance` - NBA effectiveness

**Key Metrics:**
- Recommendation click-through rate (CTR)
- Recommendation conversion rate
- Average order value (AOV) from recommendations
- Recommendation diversity (catalog coverage)
- Algorithm performance comparison
- Next-best-action acceptance rate

---

### **P1: High-Value Enhancements** 🟡

#### 4. **Unified Sentiment Analysis Domain** (NEW DOMAIN)
**Current State:** Sentiment fields scattered across customer, digital, marketing domains  
**Gap:** No centralized NLP pipeline, call transcript sentiment missing, cross-channel normalization incomplete

**Files to Create:**
```
client/lib/retail/sentiment-retail-bronze-layer.ts
client/lib/retail/sentiment-retail-silver-layer.ts
client/lib/retail/sentiment-retail-gold-layer.ts
client/lib/retail/sentiment-retail-metrics.ts
client/lib/retail/sentiment-retail-comprehensive.ts
```

**Key Entities & Tables:**

**Bronze Layer (6 tables):**
1. `bronze.retail_call_transcripts` - Call center transcripts
   - transcript_id, call_id, customer_id
   - transcript_text, speaker (Agent, Customer)
   - transcript_timestamp, duration_seconds

2. `bronze.retail_sentiment_analysis_results` - NLP outputs
   - sentiment_id, source_id, source_type (Call, Chat, Email, Survey, Social)
   - sentiment_score (-1 to 1), sentiment_label (Positive, Neutral, Negative)
   - sentiment_magnitude (0 to 1), confidence
   - keywords_extracted (JSON), topics_detected (JSON)
   - language, nlp_model_version

3. `bronze.retail_social_media_mentions` - Social listening
   - mention_id, customer_id, platform (Twitter, Facebook, Instagram)
   - mention_text, mention_timestamp
   - engagement_count (likes, shares, comments)
   - brand_mention_flag

4. `bronze.retail_email_sentiment` - Email communication sentiment
   - email_id, customer_id, direction (Inbound, Outbound)
   - email_subject, email_body
   - sentiment_score, urgency_flag

5. `bronze.retail_survey_verbatim` - Open-ended survey responses
   - survey_response_id, customer_id, survey_id
   - question_text, response_text
   - sentiment_score

6. `bronze.retail_chat_sentiment` - Chat session sentiment
   - chat_id, customer_id, message_text
   - sentiment_score, escalation_flag

**Silver Layer (3 tables):**
1. `silver.retail_sentiment_unified` - Cross-channel sentiment normalization
2. `silver.retail_sentiment_trends` - Temporal sentiment aggregations
3. `silver.retail_topic_analysis` - Topic modeling outputs

**Gold Layer (3 dimensions + 2 facts):**

**Dimensions:**
1. `gold.dim_sentiment_source` - Source taxonomy

**Facts:**
1. `gold.fact_customer_sentiment` - Customer sentiment over time
2. `gold.fact_sentiment_drivers` - Topic/keyword attribution

**Key Metrics:**
- Overall customer sentiment score
- Sentiment trend (improving, declining)
- Sentiment by channel, product, issue category
- Sentiment-to-churn correlation
- Agent sentiment impact (did agent improve/worsen sentiment)

---

#### 5. **Customer Lifetime Value (CLV) Predictive Models** (ENHANCEMENT)
**Current State:** Basic CLV metrics exist in customer gold layer  
**Gap:** No predictive CLV models, no CLV segmentation, missing profit margin data

**Enhancements to Existing Domains:**

**Customer-Retail Gold Layer:**
Add to `gold.fact_customer_value`:
- `predicted_clv_12mo` - Predicted CLV next 12 months
- `predicted_clv_36mo` - Predicted CLV 36 months
- `predicted_clv_lifetime` - Lifetime CLV
- `clv_model_version` - Model identifier
- `clv_prediction_date` - When prediction was made
- `clv_decile` - CLV segmentation (1-10)
- `profit_margin_ytd` - Actual profit from customer
- `revenue_ytd` - Revenue from customer
- `cost_to_serve_ytd` - Cost to service customer

**New Bronze Table:**
`bronze.retail_customer_profitability`
- customer_id, as_of_date
- revenue_amount, cost_amount, profit_amount
- revenue_breakdown (deposits, loans, cards, fees, wealth) - JSON
- cost_breakdown (acquisition, servicing, fraud, charge-offs) - JSON

**Key Metrics:**
- Predicted CLV by segment
- CLV accuracy (predicted vs. actual)
- High-value customer retention rate
- Customer profitability ranking

---

#### 6. **Customer Journey Orchestration** (ENHANCEMENT)
**Current State:** Journey events exist in marketing domain  
**Gap:** No real-time journey state, no orchestration engine tracking, missing journey abandonment

**Enhancements to Marketing-Retail:**

**New Bronze Tables:**
1. `bronze.retail_journey_state_real_time` - Real-time journey state
   - customer_id, journey_id, current_stage
   - stage_entry_timestamp, time_in_stage_seconds
   - next_best_action, action_expiry_timestamp

2. `bronze.retail_journey_orchestration_rules` - Journey logic
   - rule_id, journey_type, trigger_condition
   - action_to_execute, priority
   - active_flag

3. `bronze.retail_journey_abandonment` - Incomplete journeys
   - journey_id, customer_id, journey_type
   - abandonment_stage, abandonment_timestamp
   - abandonment_reason, recovery_attempt_count

**Key Metrics:**
- Journey completion rate by journey type
- Average time to complete journey
- Journey abandonment rate by stage
- Real-time journey engagement rate

---

### **P2: Future Enhancements** 🟢

#### 7. **Voice of Customer (VoC) Analytics**
- Centralized feedback repository across all touchpoints
- Topic modeling and theme extraction
- Competitive intelligence from customer feedback
- Issue escalation and resolution tracking

#### 8. **Customer Effort Score (CES) Deep Dive**
- Effort tracking per interaction type
- Friction point identification
- Process improvement tracking

#### 9. **Omnichannel Attribution**
- Cross-channel customer journey mapping
- Attribution modeling (first-touch, last-touch, linear, time-decay, algorithmic)
- Channel ROI calculation
- Marketing mix modeling (MMM)

#### 10. **Social Media Engagement**
- Social media campaign tracking
- Influencer partnership ROI
- Community engagement metrics
- Social commerce integration

---

## 🏗️ IMPLEMENTATION SEQUENCE

### **Phase 1: Sales Foundation** (Weeks 1-4)
1. Create sales domain bronze layer (SFDC integration)
2. Build sales golden records in silver
3. Implement sales fact tables in gold
4. Deploy sales dashboards

### **Phase 2: Personalization Infrastructure** (Weeks 5-8)
1. Design feature store schema
2. Implement ML model output tables
3. Build A/B test tracking
4. Deploy model monitoring

### **Phase 3: Recommendations** (Weeks 9-12)
1. Create recommendation engine tables
2. Implement product affinity scoring
3. Build next-best-action logic
4. Deploy recommendation dashboards

### **Phase 4: Sentiment & CLV** (Weeks 13-16)
1. Centralize sentiment analysis
2. Implement NLP pipeline for transcripts
3. Build predictive CLV models
4. Deploy customer value segmentation

---

## 📊 EXPECTED BUSINESS IMPACT

| **Initiative** | **Business Impact** | **Key Metric** | **Target Improvement** |
|----------------|---------------------|----------------|------------------------|
| **Sales Domain** | Improve sales productivity | Quota attainment | +15% |
| **Personalization** | Increase conversion | Personalized offer CVR | +25% |
| **Recommendations** | Drive cross-sell | Product attach rate | +20% |
| **Sentiment** | Reduce churn | Early warning detection | -10% churn |
| **Predictive CLV** | Optimize marketing spend | CAC:CLV ratio | 1:4 → 1:5 |

---

## 🎯 SUCCESS METRICS

### Sales Domain
- ✅ 100% SFDC opportunity data integrated
- ✅ Sales pipeline visibility in real-time
- ✅ Automated commission calculations
- ✅ Lead scoring accuracy >80%

### Personalization & Recommendations
- ✅ Model prediction latency <100ms
- ✅ A/B test statistical significance achieved
- ✅ Recommendation CTR >5%
- ✅ Feature drift detection enabled

### Sentiment & CX
- ✅ Sentiment analyzed across all channels
- ✅ Sentiment-to-churn correlation established
- ✅ Real-time sentiment alerts for at-risk customers
- ✅ VoC insights driving product roadmap

---

## 📋 NEXT STEPS

1. **Prioritize P0 domains** based on business need:
   - If sales analytics is critical → Start with **Sales Domain**
   - If personalization is priority → Start with **Personalization/ML Outputs**
   - If product growth is key → Start with **Recommendations**

2. **Validate with stakeholders:**
   - Sales leadership (for sales domain requirements)
   - Marketing (for personalization & attribution)
   - Data Science (for ML feature store design)
   - Customer Experience (for sentiment & VoC)

3. **Design integration points:**
   - SFDC/CRM API integration
   - ML model serving infrastructure
   - Real-time event streaming (Kafka, Kinesis)
   - A/B testing platform (Optimizely, LaunchDarkly)

**Ready to start implementation? Pick a P0 domain and I can generate the full schema definitions!** 🚀

---

**Prepared By:** AI Data Architecture Consultant  
**Date:** January 8, 2025  
**Version:** 1.0
