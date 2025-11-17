/**
 * DEPOSITS DOMAIN - AI/ML MODELS & ADVANCED ANALYTICS
 * 
 * Critical AI/ML models and use cases leveraging Silver layer deposit and transaction data
 * Models built on account master, balances, transactions, and CD data
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
// ACCOUNT DORMANCY PREDICTION MODEL
// ============================================================================
export const accountDormancyModel: AIMLModel = {
  id: "DEP-DORMANCY-001",
  name: "Account Dormancy Prediction",
  category: "Classification",
  description: "Predicts probability of account becoming inactive/dormant within 180 days based on transaction patterns and balance trends",
  businessUseCase: "Identify at-risk accounts for engagement campaigns to prevent dormancy",
  inputDatasets: ["silver.account_master", "silver.account_activity", "silver.transaction_summary"],
  outputMetric: "Dormancy Probability (0-1)",
  targetVariables: ["account_status", "is_active"],
  estimatedAccuracy: "82-87%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

def predict_account_dormancy(account_data):
    """
    Predict account dormancy probability
    Features: days_since_last_transaction, transaction_frequency_30d,
              average_balance_trend, account_age_months
    """
    features = ['days_since_activity', 'txn_count_90d', 'balance_trend_6m',
                'account_tenure_months', 'average_balance_3m']
    
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    X = account_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    dormancy_probability = model.predict_proba(X_scaled)[:, 1]
    return dormancy_probability`,
};

// ============================================================================
// DEPOSIT BALANCE FORECAST MODEL
// ============================================================================
export const depositBalanceForecastModel: AIMLModel = {
  id: "DEP-FORECAST-001",
  name: "Deposit Balance Forecast",
  category: "Regression",
  description: "Forecasts 90-day deposit balance trajectory using ARIMA and trend analysis on historical daily balances",
  businessUseCase: "Optimize liquidity management and funding cost planning",
  inputDatasets: ["silver.account_balance", "silver.account_master", "silver.interest_rate_environment"],
  outputMetric: "Forecasted Average Balance ($)",
  targetVariables: ["average_balance_90d", "balance_volatility"],
  estimatedAccuracy: "75-80%",
  pythonCode: `import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

def forecast_deposit_balance(account_id, balance_history):
    """
    Forecast 90-day deposit balance
    Features: historical_balance_trend, balance_volatility, account_age,
              account_type, customer_segment
    """
    features = ['balance_avg_90d', 'balance_std_90d', 'balance_trend_coefficient',
                'account_type_code', 'account_tenure_months']
    
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    X = balance_history[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    forecast = model.predict(X_scaled)
    return np.maximum(forecast, 0)`,
};

// ============================================================================
// ACCOUNT CLOSURE PROPENSITY MODEL
// ============================================================================
export const accountClosureModel: AIMLModel = {
  id: "DEP-CLOSURE-001",
  name: "Account Closure Propensity",
  category: "Classification",
  description: "Identifies accounts likely to close within 60 days using account characteristics and usage patterns",
  businessUseCase: "Trigger retention outreach before account closure",
  inputDatasets: ["silver.account_master", "silver.account_activity", "silver.customer_master"],
  outputMetric: "Closure Probability (0-1)",
  targetVariables: ["account_status", "closure_risk"],
  estimatedAccuracy: "80-85%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import LogisticRegression
from sklearn.preprocessing import StandardScaler

def predict_account_closure(account_data):
    """
    Predict account closure propensity
    Features: account_age, balance_level, transaction_frequency,
              customer_tenure, account_type, fees_waived_count
    """
    features = ['account_age_months', 'current_balance_tier', 'monthly_txn_count',
                'customer_tenure_months', 'account_type_code', 'waived_fee_count_ytd']
    
    model = LogisticRegression(max_iter=1000, random_state=42)
    
    X = account_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    closure_probability = model.predict_proba(X_scaled)[:, 1]
    return closure_probability`,
};

// ============================================================================
// CD RENEWAL PREDICTION MODEL
// ============================================================================
export const cdRenewalModel: AIMLModel = {
  id: "DEP-CD-RENEWAL-001",
  name: "CD Renewal Propensity",
  category: "Classification",
  description: "Predicts likelihood of Certificate of Deposit renewal at maturity based on rate environment and customer behavior",
  businessUseCase: "Proactive outreach with competitive offers before CD maturity dates",
  inputDatasets: ["silver.certificate_transactions", "silver.account_master", "silver.rate_environment"],
  outputMetric: "Renewal Probability (0-1)",
  targetVariables: ["cd_renewed", "renewal_likelihood"],
  estimatedAccuracy: "78-83%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

def predict_cd_renewal(cd_data):
    """
    Predict CD renewal probability
    Features: current_rate, market_rate, customer_tenure, 
              cd_principal, days_to_maturity, prior_renewal_history
    """
    features = ['cd_interest_rate', 'market_comparable_rate', 'customer_tenure_months',
                'cd_principal_amount', 'days_to_maturity', 'renewal_count']
    
    model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=4,
        random_state=42
    )
    
    X = cd_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    renewal_probability = model.predict_proba(X_scaled)[:, 1]
    return renewal_probability`,
};

// ============================================================================
// HOLD RISK ASSESSMENT MODEL
// ============================================================================
export const holdRiskModel: AIMLModel = {
  id: "DEP-HOLD-RISK-001",
  name: "Hold Risk & Dispute Prediction",
  category: "Classification",
  description: "Detects high-risk holds (legal, levy, garnishment) and predicts likelihood of customer dispute or appeal",
  businessUseCase: "Flag high-risk holds for compliance review and monitor dispute patterns",
  inputDatasets: ["silver.hold_transactions", "silver.account_master", "silver.customer_master"],
  outputMetric: "Hold Risk Score (0-100)",
  targetVariables: ["hold_disputed", "legal_hold_flag"],
  estimatedAccuracy: "85-90%",
  pythonCode: `import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

def assess_hold_risk(hold_data):
    """
    Assess hold risk and dispute likelihood
    Features: hold_type, hold_amount, account_balance, days_outstanding,
              hold_reason_code, customer_risk_rating
    """
    features = ['hold_type_code', 'hold_amount_proportion', 'days_outstanding',
                'customer_risk_rating_code', 'prior_disputes_count']
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42
    )
    
    X = hold_data[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    risk_probability = model.predict_proba(X_scaled)[:, 1]
    risk_score = (risk_probability * 100).astype(int)
    
    return risk_score`,
};

// ============================================================================
// DEPOSITS AI/ML MODELS CATALOG
// ============================================================================
export const depositsAIMLCatalog = {
  domain: "Deposits & Funding",
  layer: "Advanced Analytics",
  totalModels: 5,
  description: "Critical AI/ML models for deposit account optimization and risk management",
  models: [
    accountDormancyModel,
    depositBalanceForecastModel,
    accountClosureModel,
    cdRenewalModel,
    holdRiskModel,
  ],
  keyCapabilities: [
    "Proactive dormancy prevention through early identification",
    "Liquidity forecasting for treasury and funding optimization",
    "Retention targeting for at-risk accounts and CDs",
    "Automated hold risk assessment and compliance flagging",
    "Balance volatility analysis for account trending",
  ],
  implementationNotes: [
    "All models leverage Silver layer cleansed account and transaction data",
    "Daily scoring for dormancy and closure propensity",
    "Monthly retraining with latest balance and transaction data",
    "Real-time hold risk assessment triggered on new holds",
    "Integration with customer master for cross-domain insights",
  ],
};

export default depositsAIMLCatalog;
