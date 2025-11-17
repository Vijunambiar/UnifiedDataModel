/**
 * CUSTOMER DOMAIN - AI/ML MODELS & ADVANCED ANALYTICS
 * 
 * Critical AI/ML models and use cases leveraging Silver layer customer data
 * Models are built on cleansed, deduplicated customer master and relationship data
 */

export interface AIMLModel {
  id: string;
  name: string;
  category: "Classification" | "Regression" | "Clustering" | "Recommendation";
  description: string;
  businessUseCase: string;
  inputDatasets: string[];
  outputMetric: string;
  targetVariables: string[];
  estimatedAccuracy?: string;
  pythonCode: string;
}

// ============================================================================
// CUSTOMER CHURN PREDICTION MODEL
// ============================================================================
export const customerChurnModel: AIMLModel = {
  id: "CUST-CHURN-001",
  name: "Customer Churn Prediction",
  category: "Classification",
  description: "Predicts probability of customer account closure within 90 days using account activity, demographics, and tenure",
  businessUseCase: "Identify at-risk customers for retention campaigns",
  inputDatasets: ["silver.customer_master", "silver.customer_account_relationships", "silver.account_activity"],
  outputMetric: "Churn Probability (0-1)",
  targetVariables: ["is_active", "account_status"],
  estimatedAccuracy: "85-90%",
  pythonCode: `import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

def predict_customer_churn(customer_data):
    """
    Predict customer churn probability
    Features: customer_since_date, last_contact_date, account_count, 
              customer_status, marital_status, annual_income
    """
    features = ['days_as_customer', 'days_since_contact', 'account_count', 
                'income_bin', 'relationship_status_code']
    
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    X = customer_data[features].fillna(customer_data[features].median())
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    churn_probability = model.predict_proba(X_scaled)[:, 1]
    return churn_probability`,
};

// ============================================================================
// CUSTOMER LIFETIME VALUE (CLTV) MODEL
// ============================================================================
export const customerLTVModel: AIMLModel = {
  id: "CUST-LTV-001",
  name: "Customer Lifetime Value (CLTV)",
  category: "Regression",
  description: "Estimates total profit expected from customer relationship over lifetime using transaction history and account tenure",
  businessUseCase: "Segment customers by value for personalized service and cross-sell targeting",
  inputDatasets: ["silver.customer_master", "silver.transaction_aggregate", "silver.account_summary"],
  outputMetric: "Predicted Lifetime Value ($)",
  targetVariables: ["annual_revenue", "customer_profitability"],
  estimatedAccuracy: "80-85%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

def calculate_customer_ltv(customer_data):
    """
    Calculate Customer Lifetime Value using:
    - Historical transaction volumes
    - Account tenure (years_as_customer)
    - Product count and mix
    - Interaction frequency
    """
    features = ['days_as_customer', 'account_count', 'avg_monthly_activity',
                'product_diversity_score', 'transaction_frequency']
    
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    X = customer_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    ltv_prediction = model.predict(X_scaled)
    return np.maximum(ltv_prediction, 0)  # LTV cannot be negative`,
};

// ============================================================================
// NEXT BEST OFFER (NBO) MODEL
// ============================================================================
export const nextBestOfferModel: AIMLModel = {
  id: "CUST-NBO-001",
  name: "Next Best Offer Recommendation",
  category: "Recommendation",
  description: "Recommends personalized products/services based on customer profile, product holding, and behavior patterns",
  businessUseCase: "Increase cross-sell and upsell conversion through targeted product recommendations",
  inputDatasets: ["silver.customer_master", "silver.customer_products", "silver.customer_preferences"],
  outputMetric: "Recommended Product List (Ranked by Propensity)",
  targetVariables: ["product_accepted", "cross_sell_opportunity"],
  estimatedAccuracy: "70-75%",
  pythonCode: `import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

def recommend_next_best_offer(customer_id, customer_data):
    """
    Recommend products using collaborative filtering
    Features: customer_demographics, current_products, behavior_score, 
              income_tier, life_stage
    """
    features = ['age_group', 'income_bin', 'product_count', 
                'account_tenure_bin', 'behavior_score']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(customer_data[features].fillna(0))
    
    model = NearestNeighbors(n_neighbors=50, metric='euclidean')
    model.fit(X_scaled)
    
    customer_vector = X_scaled[[customer_data['customer_id'] == customer_id]]
    distances, indices = model.kneighbors(customer_vector)
    
    similar_customers = customer_data.iloc[indices[0]]
    product_recommendations = similar_customers['owned_products'].value_counts().head(5)
    
    return product_recommendations`,
};

// ============================================================================
// CUSTOMER SEGMENTATION MODEL
// ============================================================================
export const customerSegmentationModel: AIMLModel = {
  id: "CUST-SEG-001",
  name: "Customer Segmentation Clustering",
  category: "Clustering",
  description: "Groups customers into behavioral segments using k-means clustering on demographic and behavioral attributes",
  businessUseCase: "Create customer personas for targeted marketing and service strategies",
  inputDatasets: ["silver.customer_master", "silver.customer_account_relationships", "silver.transaction_aggregate"],
  outputMetric: "Customer Segment (1-5)",
  targetVariables: ["segment_id", "segment_characteristics"],
  estimatedAccuracy: "N/A (Unsupervised)",
  pythonCode: `import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def segment_customers(customer_data):
    """
    Segment customers using k-means clustering
    Features: age, income, account_tenure, product_count, 
              transaction_frequency, marital_status
    """
    features = ['age', 'annual_income', 'years_as_customer', 
                'account_count', 'monthly_transaction_count', 'education_code']
    
    X = customer_data[features].fillna(customer_data[features].median())
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    segments = kmeans.fit_predict(X_scaled)
    
    return segments`,
};

// ============================================================================
// CREDIT RISK SCORING MODEL
// ============================================================================
export const creditRiskModel: AIMLModel = {
  id: "CUST-CREDIT-001",
  name: "Credit Risk Scoring",
  category: "Classification",
  description: "Assesses credit risk probability based on customer demographics, account behavior, and payment history",
  businessUseCase: "Price credit products and determine lending eligibility and limits",
  inputDatasets: ["silver.customer_master", "silver.credit_attributes", "silver.payment_behavior"],
  outputMetric: "Credit Risk Score (0-100)",
  targetVariables: ["credit_risk_rating", "default_probability"],
  estimatedAccuracy: "88-92%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

def calculate_credit_risk_score(customer_data):
    """
    Calculate credit risk using gradient boosting
    Features: age, income, employment_status, account_tenure, 
              days_delinquent, debt_to_income_ratio
    """
    features = ['age', 'annual_income', 'employment_status_code',
                'account_tenure_months', 'max_days_delinquent', 'dti_ratio']
    
    model = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.05,
        max_depth=6,
        random_state=42
    )
    
    X = customer_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    risk_probability = model.predict_proba(X_scaled)[:, 1]
    risk_score = (risk_probability * 100).astype(int)
    
    return risk_score`,
};

// ============================================================================
// AI/ML MODELS CATALOG
// ============================================================================
export const customerAIMLCatalog = {
  domain: "Customer Core",
  layer: "Advanced Analytics",
  totalModels: 5,
  description: "Critical AI/ML models for customer analytics and engagement",
  models: [
    customerChurnModel,
    customerLTVModel,
    nextBestOfferModel,
    customerSegmentationModel,
    creditRiskModel,
  ],
  keyCapabilities: [
    "Real-time churn prediction for proactive retention",
    "Customer value segmentation for prioritized engagement",
    "Personalized product recommendations for cross-sell",
    "Behavioral clustering for targeted campaigns",
    "Credit risk assessment for lending decisions",
  ],
  implementationNotes: [
    "All models use Silver layer cleansed data as input",
    "Models are trained monthly with full historical data",
    "Real-time scoring capability through batch nightly runs",
    "Feature engineering leverages customer master and relationship data",
    "Model performance tracked via business KPIs and fairness metrics",
  ],
};

export default customerAIMLCatalog;
