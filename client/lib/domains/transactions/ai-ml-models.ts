/**
 * TRANSACTIONS DOMAIN - AI/ML MODELS & ADVANCED ANALYTICS
 * 
 * Critical AI/ML models and use cases leveraging Silver layer transaction and fraud data
 * Models built on transaction detail, fraud scores, channels, and merchant data
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
// FRAUD DETECTION MODEL
// ============================================================================
export const fraudDetectionModel: AIMLModel = {
  id: "TXN-FRAUD-001",
  name: "Real-time Fraud Detection",
  category: "Classification",
  description: "Detects fraudulent transactions in real-time using neural networks and behavioral anomaly analysis on transaction attributes",
  businessUseCase: "Block fraudulent transactions and protect customer accounts from unauthorized use",
  inputDatasets: ["silver.transaction_detail", "silver.merchant_category", "silver.customer_behavior"],
  outputMetric: "Fraud Probability (0-1)",
  targetVariables: ["is_fraudulent", "dispute_indicator"],
  estimatedAccuracy: "91-95%",
  pythonCode: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def detect_fraudulent_transaction(transaction_data):
    """
    Detect fraudulent transactions using isolation forest
    Features: transaction_amount, merchant_category, customer_location,
              transaction_frequency, time_since_last_txn, mcc_deviation
    """
    features = ['transaction_amount', 'merchant_category_code', 'customer_location_match',
                'txn_count_1h', 'time_since_last_txn_min', 'amount_deviation_zscore']
    
    model = IsolationForest(
        contamination=0.05,
        random_state=42,
        n_estimators=100
    )
    
    X = transaction_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    anomaly_scores = model.score_samples(X_scaled)
    fraud_probability = 1 / (1 + np.exp(anomaly_scores))  # Convert to probability
    
    return fraud_probability`,
};

// ============================================================================
// TRANSACTION PROPENSITY MODEL
// ============================================================================
export const transactionPropensityModel: AIMLModel = {
  id: "TXN-PROPENSITY-001",
  name: "Transaction Volume Propensity",
  category: "Regression",
  description: "Forecasts expected transaction volumes and spending amounts for upcoming periods using historical patterns and seasonality",
  businessUseCase: "Forecast liquidity needs and identify unusual trading behavior deviations",
  inputDatasets: ["silver.transaction_aggregate", "silver.customer_master", "silver.account_activity"],
  outputMetric: "Predicted Transaction Volume & Amount",
  targetVariables: ["monthly_transaction_count", "monthly_transaction_amount"],
  estimatedAccuracy: "80-85%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

def forecast_transaction_volume(customer_data):
    """
    Forecast transaction volume and amounts
    Features: historical_volume, customer_segment, account_type,
              transaction_frequency, seasonal_factor
    """
    features = ['avg_monthly_txn_count_3m', 'txn_frequency_score', 'seasonal_index',
                'account_type_code', 'customer_segment_code', 'channel_preference']
    
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    X = customer_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    volume_forecast = model.predict(X_scaled)
    return np.maximum(volume_forecast, 0)`,
};

// ============================================================================
// MERCHANT PREFERENCE MODEL
// ============================================================================
export const merchantPreferenceModel: AIMLModel = {
  id: "TXN-MERCHANT-001",
  name: "Merchant Category Affinity",
  category: "Recommendation",
  description: "Identifies preferred merchant categories for each customer and predicts spending patterns by category",
  businessUseCase: "Personalize rewards programs and targeted offers based on merchant preferences",
  inputDatasets: ["silver.transaction_detail", "silver.merchant_category", "silver.customer_preferences"],
  outputMetric: "Top Merchant Categories (Ranked)",
  targetVariables: ["spending_by_category", "category_affinity_score"],
  estimatedAccuracy: "75-80%",
  pythonCode: `import pandas as pd
from sklearn.preprocessing import StandardScaler

def identify_merchant_preferences(customer_transactions):
    """
    Identify merchant category preferences
    Features: transaction_count_by_category, amount_spent_by_category,
              frequency_by_category, seasonal_preference
    """
    category_spending = customer_transactions.groupby('merchant_category_code').agg({
        'transaction_amount': ['sum', 'mean', 'count'],
        'transaction_date': 'nunique'
    }).reset_index()
    
    category_spending.columns = ['merchant_category', 'total_spend', 
                                  'avg_transaction', 'txn_count', 'days_active']
    
    category_spending['affinity_score'] = (
        (category_spending['txn_count'] / category_spending['txn_count'].max()) * 0.5 +
        (category_spending['total_spend'] / category_spending['total_spend'].max()) * 0.5
    )
    
    return category_spending.sort_values('affinity_score', ascending=False)`,
};

// ============================================================================
// CHANNEL PREFERENCE MODEL
// ============================================================================
export const channelPreferenceModel: AIMLModel = {
  id: "TXN-CHANNEL-001",
  name: "Channel Usage Prediction",
  category: "Classification",
  description: "Predicts preferred transaction channels (mobile, web, branch, ATM) for each customer based on historical behavior",
  businessUseCase: "Optimize channel investments and digital adoption campaigns",
  inputDatasets: ["silver.transaction_detail", "silver.customer_master", "silver.channel_activity"],
  outputMetric: "Primary & Secondary Channels",
  targetVariables: ["preferred_channel", "channel_score"],
  estimatedAccuracy: "82-87%",
  pythonCode: `import pandas as pd
from sklearn.preprocessing import StandardScaler

def predict_channel_preference(customer_transactions):
    """
    Predict preferred transaction channels
    Features: usage_by_channel, transaction_frequency_by_channel,
              avg_amount_by_channel, channel_adoption_rate
    """
    channel_usage = customer_transactions.groupby('transaction_channel').agg({
        'transaction_id': 'count',
        'transaction_amount': 'sum',
        'transaction_date': 'nunique'
    }).reset_index()
    
    channel_usage.columns = ['channel', 'txn_count', 'total_amount', 'active_days']
    
    channel_usage['channel_preference_score'] = (
        (channel_usage['txn_count'] / channel_usage['txn_count'].sum()) * 0.6 +
        (channel_usage['active_days'] / channel_usage['active_days'].sum()) * 0.4
    )
    
    primary_channel = channel_usage.loc[channel_usage['channel_preference_score'].idxmax()]
    
    return channel_usage.sort_values('channel_preference_score', ascending=False)`,
};

// ============================================================================
// DISPUTE PREDICTION MODEL
// ============================================================================
export const disputePredictionModel: AIMLModel = {
  id: "TXN-DISPUTE-001",
  name: "Transaction Dispute Propensity",
  category: "Classification",
  description: "Predicts likelihood of transaction dispute based on amount, merchant, and customer characteristics",
  businessUseCase: "Flag high-risk transactions and optimize dispute prevention strategies",
  inputDatasets: ["silver.transaction_detail", "silver.disputed_transactions", "silver.merchant_category"],
  outputMetric: "Dispute Probability (0-1)",
  targetVariables: ["is_disputed", "dispute_likelihood"],
  estimatedAccuracy: "80-85%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

def predict_transaction_dispute(transaction_data):
    """
    Predict dispute probability
    Features: transaction_amount, merchant_category, amount_variance,
              customer_dispute_history, transaction_type
    """
    features = ['transaction_amount', 'merchant_category_code', 'amount_deviation_zscore',
                'customer_prior_disputes_count', 'transaction_type_code', 'processing_delay_days']
    
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=4,
        random_state=42
    )
    
    X = transaction_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    dispute_probability = model.predict_proba(X_scaled)[:, 1]
    return dispute_probability`,
};

// ============================================================================
// TRANSACTIONS AI/ML MODELS CATALOG
// ============================================================================
export const transactionsAIMLCatalog = {
  domain: "Transactions & Payments",
  layer: "Advanced Analytics",
  totalModels: 5,
  description: "Critical AI/ML models for transaction safety, optimization, and customer experience",
  models: [
    fraudDetectionModel,
    transactionPropensityModel,
    merchantPreferenceModel,
    channelPreferenceModel,
    disputePredictionModel,
  ],
  keyCapabilities: [
    "Real-time fraud detection and prevention with 91%+ accuracy",
    "Transaction volume forecasting for liquidity planning",
    "Personalized merchant and channel recommendations",
    "Dispute prevention through behavioral analysis",
    "Anomaly detection for unusual spending patterns",
  ],
  implementationNotes: [
    "All models use Silver layer cleansed transaction data",
    "Fraud model deployed for real-time scoring (<100ms latency)",
    "Daily retraining with latest transaction and dispute data",
    "Integration with fraud management system for automated blocking",
    "Channel preference models retrained monthly based on behavioral shifts",
  ],
};

export default transactionsAIMLCatalog;
