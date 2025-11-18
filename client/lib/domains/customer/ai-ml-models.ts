/**
 * CUSTOMER DOMAIN - AI/ML MODELS & ADVANCED ANALYTICS
 * 
 * Production-grade AI/ML models with comprehensive end-to-end implementations
 * Built on cleansed, deduplicated Silver layer customer data
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
  pythonCode: string;
}

// ============================================================================
// CUSTOMER CHURN PREDICTION MODEL
// ============================================================================
export const customerChurnModel: AIMLModel = {
  id: "CUST-CHURN-001",
  name: "Customer Churn Prediction",
  category: "Classification",
  description: "Production-grade churn prediction using comprehensive behavioral, transactional, account, and demographic features with risk segmentation and actionable intervention recommendations",
  businessUseCase: "Identify at-risk customers for targeted retention campaigns, proactive outreach, and service tier adjustments to maximize lifetime value",
  inputDatasets: ["silver.customer_master", "silver.customer_account_relationships", "silver.transaction_aggregate", "silver.account_summary", "silver.interaction_history"],
  outputMetric: "Churn Probability (0-1) with Risk Segment & Intervention Strategy",
  targetVariables: ["is_active", "account_status", "days_to_churn"],
  pythonCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
from sklearn.utils import class_weight
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomerChurnPredictor:
    """
    Production-grade Customer Churn Prediction model for retail banking.

    Incorporates:
    - Comprehensive behavioral and transactional features
    - RFM (Recency, Frequency, Monetary) analysis
    - Account activity and product mix indicators
    - Relationship health metrics
    - Class imbalance handling via class weights
    - Cross-validation for robust evaluation
    - Feature importance tracking for explainability
    - Multiple risk segments with intervention strategies
    """

    FEATURE_GROUPS = {
        'Tenure & Relationship': ['tenure_months', 'is_newer_customer', 'account_count', 'product_count', 'product_diversity'],
        'Activity & Engagement': ['days_since_last_transaction', 'transaction_frequency_90d', 'transaction_frequency_12m', 'digital_channel_usage', 'branch_visits_90d'],
        'Financial Behavior': ['avg_transaction_amount', 'total_deposits_12m', 'total_withdrawals_12m', 'net_cash_flow_12m', 'deposit_volatility'],
        'Account Health': ['average_balance', 'balance_trend', 'recent_fee_charges', 'fee_reversal_frequency', 'overdraft_incidents'],
        'Risk & Credit': ['credit_score', 'payment_history_score', 'late_payment_count_12m', 'dispute_count', 'fraud_flag'],
        'Demographics': ['age', 'customer_segment', 'annual_income', 'employment_status', 'region_code'],
        'Relationship Quality': ['relationship_manager_assigned', 'complaint_count_12m', 'nps_score', 'contact_preference_match', 'recent_service_issues']
    }

    RISK_SEGMENT_THRESHOLDS = {
        'Low': (0.0, 0.2),
        'Moderate': (0.2, 0.5),
        'High': (0.5, 0.75),
        'Critical': (0.75, 1.0)
    }

    INTERVENTION_STRATEGIES = {
        'Low': {'action': 'Monitor', 'frequency': 'Quarterly', 'cost': 'Low'},
        'Moderate': {'action': 'Proactive Engagement', 'frequency': 'Monthly', 'cost': 'Medium'},
        'High': {'action': 'Dedicated Retention', 'frequency': 'Weekly', 'cost': 'High'},
        'Critical': {'action': 'Executive Outreach', 'frequency': 'Immediate', 'cost': 'Very High'}
    }

    def __init__(self, prediction_window_days=90, cv_folds=5):
        """
        Initialize churn prediction model.

        Args:
            prediction_window_days: Days ahead to predict churn (default 90)
            cv_folds: Cross-validation folds for evaluation
        """
        self.prediction_window_days = prediction_window_days
        self.cv_folds = cv_folds

        self.model = GradientBoostingClassifier(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=7,
            min_samples_split=20,
            min_samples_leaf=10,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            validation_fraction=0.1,
            n_iter_no_change=20,
            tol=1e-4
        )

        self.scaler = StandardScaler()
        self.feature_names = None
        self.feature_importance = None
        self.model_metrics = None
        self.class_weights = None

    def validate_input_data(self, customer_data):
        """Validate and clean input data"""
        required_cols = ['customer_id', 'customer_since_date', 'annual_income', 'age']
        missing = [col for col in required_cols if col not in customer_data.columns]

        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        logger.info(f"Input validation passed for {len(customer_data)} customers")
        return customer_data

    def engineer_features(self, customer_data, transaction_data=None, account_data=None):
        """
        Comprehensive feature engineering for churn prediction.

        Includes tenure, activity, financial behavior, account health, and relationship metrics.
        """
        df = customer_data.copy()
        today = datetime.now()

        # ===== TENURE & RELATIONSHIP FEATURES =====
        df['customer_since_date'] = pd.to_datetime(df['customer_since_date'])
        df['tenure_months'] = (today - df['customer_since_date']).dt.days / 30.0
        df['is_newer_customer'] = (df['tenure_months'] < 12).astype(int)
        df['account_count'] = df.groupby('customer_id')['account_id'].transform('count') if 'account_id' in df.columns else 1
        df['product_count'] = df.get('product_count', 1)
        df['product_diversity'] = df.get('product_diversity', 0.5)

        # ===== ACTIVITY & ENGAGEMENT FEATURES =====
        df['last_transaction_date'] = pd.to_datetime(df.get('last_transaction_date', today))
        df['days_since_last_transaction'] = (today - df['last_transaction_date']).dt.days
        df['transaction_frequency_90d'] = df.get('transactions_90d', 0)
        df['transaction_frequency_12m'] = df.get('transactions_12m', 0)
        df['digital_channel_usage'] = df.get('digital_txn_count', 0) / (df['transaction_frequency_12m'] + 1)
        df['branch_visits_90d'] = df.get('branch_visits_90d', 0)

        # ===== FINANCIAL BEHAVIOR FEATURES =====
        df['avg_transaction_amount'] = df.get('avg_txn_amt', 0)
        df['total_deposits_12m'] = df.get('deposits_12m', 0)
        df['total_withdrawals_12m'] = df.get('withdrawals_12m', 0)
        df['net_cash_flow_12m'] = df['total_deposits_12m'] - df['total_withdrawals_12m']
        df['deposit_volatility'] = df.get('deposit_std_dev', 0) / (df['total_deposits_12m'] + 1)

        # ===== ACCOUNT HEALTH FEATURES =====
        df['average_balance'] = df.get('avg_balance', 0)
        df['balance_trend'] = df.get('balance_trend_coef', 0)
        df['recent_fee_charges'] = df.get('fees_last_90d', 0)
        df['fee_reversal_frequency'] = df.get('fee_reversals_count', 0)
        df['overdraft_incidents'] = df.get('overdraft_count_12m', 0)

        # ===== RISK & CREDIT FEATURES =====
        df['credit_score'] = df.get('credit_score', 650)
        df['payment_history_score'] = df.get('payment_score', 100)
        df['late_payment_count_12m'] = df.get('late_payments_12m', 0)
        df['dispute_count'] = df.get('disputes_12m', 0)
        df['fraud_flag'] = df.get('fraud_indicator', 0).astype(int)

        # ===== DEMOGRAPHIC FEATURES =====
        df['age'] = df.get('age', 45)
        df['customer_segment'] = df.get('segment', 'Standard')
        df['annual_income'] = df.get('annual_income', 50000)
        df['employment_status'] = df.get('employment_status', 'Employed')
        df['region_code'] = df.get('region_code', 'USA')

        # Encode categorical features
        segment_map = {'Premium': 3, 'Standard': 2, 'Value': 1}
        df['customer_segment'] = df['customer_segment'].map(segment_map).fillna(2).astype(int)

        employment_map = {'Employed': 3, 'Self-Employed': 2, 'Retired': 1, 'Unemployed': 0}
        df['employment_status'] = df['employment_status'].map(employment_map).fillna(1).astype(int)

        # ===== RELATIONSHIP QUALITY FEATURES =====
        df['relationship_manager_assigned'] = df.get('has_rm', 0).astype(int)
        df['complaint_count_12m'] = df.get('complaints_12m', 0)
        df['nps_score'] = df.get('nps_score', 0)
        df['contact_preference_match'] = df.get('pref_match', 0)
        df['recent_service_issues'] = df.get('service_incidents_90d', 0)

        # ===== DERIVED BEHAVIORAL FEATURES =====
        # RFM Analysis (Recency, Frequency, Monetary)
        df['recency_score'] = (365 - df['days_since_last_transaction'].clip(0, 365)) / 365
        df['frequency_score'] = df['transaction_frequency_12m'] / (df['transaction_frequency_12m'].max() + 1)
        df['monetary_score'] = df['average_balance'] / (df['average_balance'].max() + 1)
        df['rfm_score'] = (df['recency_score'] + df['frequency_score'] + df['monetary_score']) / 3

        # Activity decline indicator
        recent_activity = df['transaction_frequency_90d'] / (df['transaction_frequency_12m'] + 1)
        df['activity_decline'] = (recent_activity < 0.25).astype(int)

        # Balance depletion risk
        df['balance_declining'] = (df['balance_trend'] < -0.01).astype(int)

        # Fee burden index
        df['fee_burden_index'] = df['recent_fee_charges'] / (df['average_balance'] + 1)

        # Feature list for model
        feature_cols = [
            'tenure_months', 'is_newer_customer', 'account_count', 'product_count', 'product_diversity',
            'days_since_last_transaction', 'transaction_frequency_90d', 'transaction_frequency_12m',
            'digital_channel_usage', 'branch_visits_90d',
            'avg_transaction_amount', 'total_deposits_12m', 'total_withdrawals_12m',
            'net_cash_flow_12m', 'deposit_volatility',
            'average_balance', 'balance_trend', 'recent_fee_charges',
            'fee_reversal_frequency', 'overdraft_incidents',
            'credit_score', 'payment_history_score', 'late_payment_count_12m',
            'dispute_count', 'fraud_flag',
            'age', 'customer_segment', 'annual_income', 'employment_status',
            'relationship_manager_assigned', 'complaint_count_12m', 'nps_score',
            'contact_preference_match', 'recent_service_issues',
            'recency_score', 'frequency_score', 'monetary_score', 'rfm_score',
            'activity_decline', 'balance_declining', 'fee_burden_index'
        ]

        X = df[feature_cols].fillna(0)
        X = X.clip(lower=-np.inf, upper=np.inf)
        X = X.replace([np.inf, -np.inf], 0)

        self.feature_names = feature_cols
        logger.info(f"Features engineered: {len(feature_cols)} features for {len(X)} records")

        return X, feature_cols

    def fit(self, customer_data, target_data, transaction_data=None, account_data=None):
        """
        Train churn prediction model with cross-validation.

        Args:
            customer_data: Customer demographic and profile data
            target_data: Target variable with 'churned' column
            transaction_data: Optional transaction history
            account_data: Optional account-level data
        """
        customer_data = self.validate_input_data(customer_data)
        X, self.feature_names = self.engineer_features(customer_data, transaction_data, account_data)

        y = target_data['churned'].values

        # Handle class imbalance
        class_counts = np.bincount(y)
        self.class_weights = dict(enumerate(class_weight.compute_class_weight(
            'balanced', classes=np.unique(y), y=y
        )))

        # Train-test split with stratification
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train model with class weights
        self.model.fit(
            X_train_scaled, y_train,
            sample_weight=np.array([self.class_weights[label] for label in y_train])
        )

        # Cross-validation evaluation
        cv = StratifiedKFold(n_splits=self.cv_folds, shuffle=True, random_state=42)
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=cv, scoring='roc_auc')

        # Test set evaluation
        y_pred_prob = self.model.predict_proba(X_test_scaled)[:, 1]
        y_pred = self.model.predict(X_test_scaled)

        self.model_metrics = {
            'cv_auc_mean': cv_scores.mean(),
            'cv_auc_std': cv_scores.std(),
            'test_auc': roc_auc_score(y_test, y_pred_prob),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1': f1_score(y_test, y_pred, zero_division=0),
            'class_distribution': f"Churn: {class_counts[1]}, Non-Churn: {class_counts[0]}"
        }

        # Feature importance
        self.feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        logger.info(f"Model training complete. CV AUC: {self.model_metrics['cv_auc_mean']:.4f}, Test AUC: {self.model_metrics['test_auc']:.4f}")
        logger.info(f"Precision: {self.model_metrics['precision']:.4f}, Recall: {self.model_metrics['recall']:.4f}, F1: {self.model_metrics['f1']:.4f}")

        return self

    def predict(self, customer_data, transaction_data=None, account_data=None):
        """
        Predict churn probability and assign risk segments with recommendations.

        Returns DataFrame with predictions, risk segments, and intervention strategies.
        """
        if self.feature_names is None:
            raise ValueError("Model must be trained before prediction")

        X, _ = self.engineer_features(customer_data, transaction_data, account_data)
        X_scaled = self.scaler.transform(X)

        churn_probs = self.model.predict_proba(X_scaled)[:, 1]

        # Create prediction results
        results = pd.DataFrame({
            'customer_id': customer_data['customer_id'],
            'churn_probability': churn_probs,
            'churn_percentage': (churn_probs * 100).round(2)
        })

        # Assign risk segments
        results['risk_segment'] = pd.cut(
            results['churn_probability'],
            bins=[0, 0.2, 0.5, 0.75, 1.0],
            labels=['Low', 'Moderate', 'High', 'Critical'],
            include_lowest=True
        )

        # Add intervention strategies
        results['intervention_action'] = results['risk_segment'].map(
            lambda x: self.INTERVENTION_STRATEGIES.get(x, {}).get('action', 'Monitor')
        )
        results['intervention_frequency'] = results['risk_segment'].map(
            lambda x: self.INTERVENTION_STRATEGIES.get(x, {}).get('frequency', 'Quarterly')
        )

        # Confidence in prediction based on feature quality
        results['prediction_confidence'] = 'High' if X.notna().sum(axis=1).mean() > 0.9 else 'Medium'

        logger.info(f"Predictions generated for {len(results)} customers")
        logger.info(f"High/Critical risk: {len(results[results['risk_segment'].isin(['High', 'Critical'])])}")

        return results

    def get_feature_importance(self, top_n=15):
        """Get top features driving churn predictions"""
        if self.feature_importance is None:
            logger.warning("No feature importance available. Train model first.")
            return None
        return self.feature_importance.head(top_n)

    def get_model_metrics(self):
        """Get model performance metrics"""
        return self.model_metrics if self.model_metrics else "Model not yet trained"

# Example usage:
# predictor = CustomerChurnPredictor(prediction_window_days=90, cv_folds=5)
# predictor.fit(customer_df, target_df, transaction_df, account_df)
# predictions = predictor.predict(new_customers_df)
# print(predictions[['customer_id', 'churn_probability', 'risk_segment', 'intervention_action']])
# print(predictor.get_feature_importance(top_n=10))
# print(predictor.get_model_metrics())`,
};

// ============================================================================
// CUSTOMER LIFETIME VALUE (CLTV) MODEL
// ============================================================================
export const customerLTVModel: AIMLModel = {
  id: "CUST-LTV-001",
  name: "Customer Lifetime Value (CLTV)",
  category: "Regression",
  description: "End-to-end CLTV calculation incorporating interest income, fees, costs, retention probability, and cross-product value across all customer accounts with comprehensive banking economics",
  businessUseCase: "Segment customers by lifetime value for VIP programs, service tier assignment, targeted acquisition/retention spend allocation, and strategic portfolio management",
  inputDatasets: ["silver.customer_master", "silver.account_summary", "silver.transaction_aggregate", "silver.interest_rates", "silver.customer_products"],
  outputMetric: "Predicted Lifetime Value ($) with Component Breakdown",
  targetVariables: ["total_customer_value", "projected_net_income", "annual_profit_contribution"],
  pythonCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AccountType(Enum):
    """Account type classification for revenue/cost calculations"""
    DDA = "DDA"
    SAVINGS = "SAV"
    MMA = "MMA"
    CD = "CD"
    AUTO_LOAN = "AUTO"
    PERSONAL_LOAN = "PERSONAL"
    HELOC = "HELOC"
    MORTGAGE = "MORTGAGE"
    CREDIT_CARD = "CC"
    INVESTMENT = "INV"

class CLTVCalculator:
    """
    Production-grade Customer Lifetime Value (CLTV) calculator for retail banking.
    
    Incorporates full banking economics:
    - Net Interest Income (loans + deposits - cost of funds)
    - Fee Income (monthly fees + transaction fees - waivers)
    - Credit Loss Provisions (expected credit loss based on PD/LGD)
    - Operational Costs (account servicing + technology + customer service)
    - Cross-sell Revenue (propensity-based future product revenue)
    - Regulatory Capital Charge (Basel III risk-weighted assets)
    - Churn-adjusted retention probability
    - Discounted cash flow (NPV) methodology
    """

    # Cost of Funds by product type
    COF_RATES = {'DDA': 0.015, 'SAV': 0.025, 'MMA': 0.035, 'CD': 0.045}
    
    # Expected credit loss rates by loan type (Probability of Default * Loss Given Default)
    CREDIT_LOSS_RATES = {'AUTO': 0.002, 'PERSONAL': 0.025, 'HELOC': 0.015, 'MORTGAGE': 0.001}
    
    # Annual operational cost per account
    ANNUAL_ACCOUNT_COST = 60.0
    
    # Regulatory capital requirement
    REGULATORY_CAPITAL_RATE = 0.08

    # Cross-sell propensity matrix (product A → product B likelihood)
    CROSS_SELL_PROPENSITY = {
        'DDA': {'SAV': 0.15, 'CD': 0.08, 'CC': 0.25, 'PERSONAL': 0.12},
        'SAV': {'DDA': 0.10, 'CD': 0.20, 'CC': 0.18, 'AUTO': 0.08},
        'CC': {'PERSONAL': 0.25, 'AUTO': 0.15, 'HELOC': 0.10}
    }

    # Net interest margin by product
    PRODUCT_MARGINS = {
        'DDA': 0.018, 'SAV': 0.020, 'MMA': 0.025, 'CD': 0.030,
        'AUTO': 0.035, 'PERSONAL': 0.055, 'HELOC': 0.028,
        'MORTGAGE': 0.015, 'CC': 0.025, 'INV': 0.012
    }

    def __init__(self, years=5, discount_rate=0.10, base_churn_rate=0.12):
        """
        Initialize CLTV calculator.
        
        Args:
            years: Forecast horizon (default 5 years)
            discount_rate: WACC or hurdle rate for NPV calculation (default 10%)
            base_churn_rate: Baseline annual churn probability (default 12%)
        """
        if years <= 0 or discount_rate < 0 or not (0 <= base_churn_rate <= 1):
            raise ValueError("Invalid parameters: years must be > 0, discount_rate >= 0, churn_rate in [0,1]")
        
        self.years = years
        self.discount_rate = discount_rate
        self.base_churn_rate = base_churn_rate

    def validate_customer_data(self, customer_data):
        """Validate input data quality and completeness"""
        issues = []
        if 'customer_id' not in customer_data:
            raise ValueError("Missing required field: customer_id")
        if 'accounts' not in customer_data:
            customer_data['accounts'] = pd.DataFrame()
        if 'tenure_months' not in customer_data:
            customer_data['tenure_months'] = 0
        if 'credit_score' not in customer_data:
            customer_data['credit_score'] = 650
        return {'valid': len(issues) == 0, 'warnings': issues}

    def adjust_churn_rate(self, base_churn, tenure_months, credit_score, account_count, recent_activity):
        """
        Adjust churn probability based on customer-specific characteristics.
        
        Factors considered:
        - Tenure: longer tenure = lower churn
        - Credit quality: higher score = lower churn
        - Product depth: more accounts = lower churn (relationship stickiness)
        - Activity: recent engagement = lower churn
        """
        churn = base_churn

        # Tenure impact (seasoned customers are more loyal)
        if tenure_months > 60:
            churn *= 0.60
        elif tenure_months > 24:
            churn *= 0.75
        elif tenure_months > 12:
            churn *= 0.85

        # Credit score impact (higher creditworthiness correlates with loyalty)
        if credit_score >= 750:
            churn *= 0.85
        elif credit_score >= 700:
            churn *= 0.90
        elif credit_score < 600:
            churn *= 1.25

        # Account count impact (relationship depth reduces churn)
        account_factor = 1.0 - (min(account_count - 1, 4) * 0.08)
        churn *= max(0.50, account_factor)

        # Activity recency impact (dormant customers are flight risks)
        if recent_activity > 180:
            churn *= 1.30
        elif recent_activity > 90:
            churn *= 1.15

        return min(0.50, max(0.02, churn))

    def calc_interest_income(self, accounts_df):
        """
        Calculate net interest income from both deposits and loans.
        
        Components:
        - Interest income from loan balances * rates
        - Interest expense from deposit balances * rates
        - Cost of funds (bank's borrowing cost to fund loans)
        """
        if accounts_df.empty:
            return {'deposit_interest': 0, 'loan_interest': 0, 'cof_expense': 0, 'net_interest': 0}

        deposit_types = ['DDA', 'SAV', 'MMA', 'CD']
        loan_types = ['AUTO', 'PERSONAL', 'HELOC', 'MORTGAGE']

        # Calculate deposit interest expense and cost of funds
        deposit_accounts = accounts_df[accounts_df['type'].isin(deposit_types)]
        deposit_interest = 0
        cof_expense = 0

        if not deposit_accounts.empty:
            for _, acc in deposit_accounts.iterrows():
                balance = acc.get('balance', 0) or 0
                rate = acc.get('rate', 0) or 0
                deposit_interest += balance * rate
                
                # Cost of funds (what the bank pays to fund these deposits)
                cof = self.COF_RATES.get(acc['type'], 0.025) * balance
                cof_expense += cof

        # Calculate loan interest income
        loan_accounts = accounts_df[accounts_df['type'].isin(loan_types)]
        loan_interest = 0

        if not loan_accounts.empty:
            for _, acc in loan_accounts.iterrows():
                balance = acc.get('balance', 0) or 0
                rate = acc.get('rate', 0) or 0
                loan_interest += balance * rate

        return {
            'deposit_interest': deposit_interest,
            'loan_interest': loan_interest,
            'cof_expense': -cof_expense,
            'net_interest': deposit_interest + loan_interest - cof_expense
        }

    def calc_fees(self, accounts_df, transactions_df=None):
        """
        Calculate fee income from monthly maintenance fees and transaction fees.
        
        Includes:
        - Monthly account fees (annualized)
        - Transaction-based fees (ATM, wire, overdraft, etc.)
        - Fee waivers (relationship-based discounts)
        """
        if accounts_df.empty:
            return {'monthly_fees': 0, 'transaction_fees': 0, 'waived_fees': 0, 'total_fees': 0}

        # Monthly maintenance fees
        monthly_fees = 0
        for _, acc in accounts_df.iterrows():
            if 'monthly_fee' in acc.index:
                monthly_fees += (acc['monthly_fee'] or 0) * 12

        # Transaction fees (from actual transactions or estimated from activity)
        transaction_fees = 0
        if transactions_df is not None and not transactions_df.empty:
            transaction_fees = (transactions_df.get('fee', 0) or 0).sum()
        else:
            # Estimate transaction fees as 15% of monthly fees if data unavailable
            transaction_fees = monthly_fees * 0.15

        # Fee waivers (loyalty/VIP discounts)
        waived_fees = 0
        for _, acc in accounts_df.iterrows():
            if 'waived_fees' in acc.index:
                waived_fees += (acc['waived_fees'] or 0)

        total_fees = monthly_fees + transaction_fees - waived_fees

        return {
            'monthly_fees': monthly_fees,
            'transaction_fees': transaction_fees,
            'waived_fees': -waived_fees,
            'total_fees': total_fees
        }

    def calc_credit_loss(self, accounts_df):
        """
        Calculate expected credit loss provisions and regulatory capital charge.
        
        Uses Basel III framework:
        - Expected Credit Loss = Outstanding Balance * PD * LGD
        - Capital Charge = Risk-Weighted Assets * Capital Rate * Cost of Capital
        """
        if accounts_df.empty:
            return {'credit_loss_provision': 0, 'capital_charge': 0, 'total_credit_cost': 0}

        loan_types = ['AUTO', 'PERSONAL', 'HELOC', 'MORTGAGE']
        loan_accounts = accounts_df[accounts_df['type'].isin(loan_types)]

        credit_loss = 0
        risk_weighted_assets = 0

        if not loan_accounts.empty:
            for _, acc in loan_accounts.iterrows():
                balance = acc.get('balance', 0) or 0
                loan_type = acc['type']

                # Expected credit loss calculation
                pd = self.CREDIT_LOSS_RATES.get(loan_type, 0.01)  # Probability of default
                lgd = 0.45 if loan_type == 'MORTGAGE' else 0.60   # Loss given default
                credit_loss += balance * pd * lgd

                # Risk-weighted assets calculation (Basel III weights)
                rw = {'AUTO': 0.25, 'PERSONAL': 0.75, 'HELOC': 0.35, 'MORTGAGE': 0.35}
                risk_weighted_assets += balance * rw.get(loan_type, 0.50)

        # Capital charge (cost of holding regulatory capital)
        capital_charge = risk_weighted_assets * self.REGULATORY_CAPITAL_RATE * self.discount_rate

        return {
            'credit_loss_provision': -credit_loss,
            'capital_charge': -capital_charge,
            'total_credit_cost': -(credit_loss + capital_charge)
        }

    def calc_operational_costs(self, accounts_df, customer_segment='Standard'):
        """
        Calculate operational costs including account servicing, technology, and customer support.
        
        Costs vary by customer segment (Premium customers get higher service levels).
        """
        account_count = len(accounts_df) if not accounts_df.empty else 0

        # Base cost per account (adjusted for segment)
        cost_per_account = self.ANNUAL_ACCOUNT_COST
        segment_multiplier = {'Premium': 0.70, 'Standard': 1.00, 'Value': 1.30}
        cost_per_account *= segment_multiplier.get(customer_segment, 1.00)

        account_costs = account_count * cost_per_account
        
        # Technology costs (digital platform allocation)
        tech_cost = 150.0 if customer_segment == 'Premium' else 100.0
        
        # Customer service costs
        service_cost = account_count * 30.0
        
        total_operations = account_costs + tech_cost + service_cost

        return {
            'account_servicing': -account_costs,
            'technology': -tech_cost,
            'customer_service': -service_cost,
            'total_operations': -total_operations
        }

    def calc_cross_sell_potential(self, current_products, customer_value, churn_rate):
        """
        Estimate future cross-sell revenue based on propensity models.
        
        Uses product affinity matrix to predict probability of additional product adoption.
        """
        cross_sell_revenue = 0

        for current_product, propensities in self.CROSS_SELL_PROPENSITY.items():
            if current_product not in current_products:
                continue

            for target_product, propensity in propensities.items():
                if target_product in current_products:
                    continue  # Already owns this product

                # Estimate balance for new product
                estimated_balance = customer_value * 0.20
                
                # Expected margin from target product
                margin = self.PRODUCT_MARGINS.get(target_product, 0.02)
                
                # Probability-weighted revenue (adjusted for retention)
                survival = (1 - churn_rate)
                
                cross_sell_revenue += estimated_balance * margin * propensity * survival

        return {'cross_sell_revenue': max(0, cross_sell_revenue)}

    def calc_annual_value(self, customer_data, accounts_df, transactions_df=None):
        """
        Calculate total annual profitability contribution for a customer.
        
        Aggregates all revenue and cost components.
        """
        interest = self.calc_interest_income(accounts_df)
        fees = self.calc_fees(accounts_df, transactions_df)
        credit_loss = self.calc_credit_loss(accounts_df)
        operations = self.calc_operational_costs(accounts_df, customer_data.get('segment', 'Standard'))

        total_annual = (
            interest['net_interest'] + fees['total_fees'] +
            credit_loss['total_credit_cost'] + operations['total_operations']
        )

        return {
            'interest_income': interest['net_interest'],
            'fee_income': fees['total_fees'],
            'credit_costs': credit_loss['total_credit_cost'],
            'operational_costs': operations['total_operations'],
            'annual_total': total_annual,
            'components': {'interest': interest, 'fees': fees, 'credit': credit_loss, 'operations': operations}
        }

    def calculate_cltv(self, customer_data, accounts_df, transactions_df=None):
        """
        Calculate complete Customer Lifetime Value using discounted cash flow (DCF) method.
        
        Formula:
        CLTV = Σ(t=1 to T) [Annual Value(t) * Retention(t) * Growth(t)] / (1 + r)^t
        
        Where:
        - Annual Value = Net profit contribution per year
        - Retention = Probability customer is still active in year t
        - Growth = Expected organic revenue growth
        - r = Discount rate (WACC)
        
        Returns:
            Dictionary with CLTV value and detailed breakdown
        """
        try:
            # Validate inputs
            validation = self.validate_customer_data(customer_data)
            if not validation['valid']:
                logger.warning("Validation warnings detected")

            # Extract customer attributes
            customer_id = customer_data['customer_id']
            tenure_months = customer_data.get('tenure_months', 0)
            credit_score = customer_data.get('credit_score', 650)
            account_count = len(accounts_df) if not accounts_df.empty else 0
            recent_activity_days = customer_data.get('days_since_last_txn', 365)

            # Calculate customer-specific churn rate
            adjusted_churn = self.adjust_churn_rate(
                self.base_churn_rate, tenure_months, credit_score,
                account_count, recent_activity_days
            )

            # Calculate current annual profitability
            annual_value = self.calc_annual_value(customer_data, accounts_df, transactions_df)
            current_annual_profit = annual_value['annual_total']

            # Estimate cross-sell potential
            current_products = accounts_df['type'].unique().tolist() if not accounts_df.empty else []
            total_balance = accounts_df['balance'].sum() if not accounts_df.empty else 0
            cross_sell = self.calc_cross_sell_potential(current_products, total_balance, adjusted_churn)
            cross_sell_revenue = cross_sell['cross_sell_revenue']

            # DCF calculation over forecast horizon
            total_cltv = 0
            annual_cash_flows = []

            for year in range(1, self.years + 1):
                # Retention probability (compound survival rate)
                retention_probability = (1 - adjusted_churn) ** year
                
                # Growth factor (organic growth if retained, decay if churning)
                growth_factor = (1.02 ** year) if retention_probability > 0.5 else 0.95 ** year
                
                # Projected annual profit (base + cross-sell, adjusted for growth and retention)
                projected_annual = (current_annual_profit + cross_sell_revenue) * growth_factor * retention_probability

                # Discount to present value
                discount_factor = 1 / ((1 + self.discount_rate) ** year)
                discounted_cf = projected_annual * discount_factor

                total_cltv += discounted_cf
                
                annual_cash_flows.append({
                    'year': year,
                    'retention_prob': retention_probability,
                    'projected_profit': projected_annual,
                    'discount_factor': discount_factor,
                    'pv': discounted_cf
                })

            final_cltv = max(0, total_cltv)
            logger.info("CLTV calculation completed for customer " + str(customer_id))

            return {
                'customer_id': customer_id,
                'cltv': final_cltv,
                'annual_value': current_annual_profit,
                'adjusted_churn_rate': adjusted_churn,
                'account_count': account_count,
                'total_balance': total_balance,
                'cross_sell_potential': cross_sell_revenue,
                'cash_flows': annual_cash_flows,
                'components': annual_value['components'],
                'confidence': 'High' if account_count >= 2 and tenure_months > 12 else 'Medium' if account_count >= 1 else 'Low',
                'calculation_date': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"CLTV calculation error for customer {customer_data.get('customer_id', 'UNKNOWN')}: {str(e)}")
            raise

# Example usage:
# calculator = CLTVCalculator(years=5, discount_rate=0.10, base_churn_rate=0.12)
# result = calculator.calculate_cltv(customer_data, accounts_df, transactions_df)
# cltv_value = result.get('cltv')
# annual_contribution = result.get('annual_value')
# print("Customer CLTV: $" + "{:,.2f}".format(cltv_value))
# print("Annual Profit: $" + "{:,.2f}".format(annual_contribution))
# print("Confidence: " + str(result.get('confidence')))`,
};

// ============================================================================
// PRODUCT PROPENSITY MODEL
// ============================================================================
export const productPropensityModel: AIMLModel = {
  id: "CUST-PROP-001",
  name: "Product Adoption Propensity",
  category: "Classification",
  description: "Comprehensive propensity scoring model predicting likelihood of customer adoption for each product based on demographic profile, financial behavior, current product mix, life stage indicators, and behavioral triggers",
  businessUseCase: "Prioritize cross-sell and upsell opportunities with personalized product recommendations, optimize marketing campaigns by targeting highest-propensity customers, and increase product penetration rates",
  inputDatasets: ["silver.customer_master", "silver.customer_products", "silver.transaction_aggregate", "silver.account_summary", "silver.customer_interactions", "silver.life_events"],
  outputMetric: "Product Propensity Score by Product (0-1) with Ranked Recommendations",
  targetVariables: ["product_adopted", "propensity_score", "expected_revenue"],
  pythonCode: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductPropensityModel:
    """
    Production-grade Product Propensity Model for cross-sell and upsell optimization.
    
    Predicts customer likelihood to adopt specific banking products using:
    - Demographic and life stage indicators
    - Current product holdings and wallet share
    - Transaction patterns and financial behaviors
    - Life events and trigger moments
    - Channel preferences and engagement levels
    - Lookalike customer segments
    
    Generates ranked product recommendations with revenue potential and timing.
    """

    PRODUCT_CATALOG = {
        'SAVINGS': {'min_balance': 100, 'avg_apy': 0.04, 'avg_revenue': 120},
        'CD_12M': {'min_balance': 1000, 'avg_apy': 0.05, 'avg_revenue': 450},
        'MMA': {'min_balance': 2500, 'avg_apy': 0.045, 'avg_revenue': 380},
        'REWARDS_CC': {'annual_fee': 95, 'avg_cashback': 0.015, 'avg_revenue': 240},
        'PREMIUM_CC': {'annual_fee': 495, 'avg_cashback': 0.02, 'avg_revenue': 680},
        'PERSONAL_LOAN': {'min_amount': 5000, 'max_amount': 50000, 'avg_revenue': 890},
        'AUTO_LOAN': {'min_amount': 10000, 'max_amount': 75000, 'avg_revenue': 1250},
        'HELOC': {'min_amount': 25000, 'max_amount': 250000, 'avg_revenue': 1850},
        'MORTGAGE': {'min_amount': 100000, 'max_amount': 750000, 'avg_revenue': 2400},
        'INVESTMENT_ACCT': {'min_balance': 5000, 'avg_fee_rate': 0.012, 'avg_revenue': 520}
    }

    # Product affinity rules (products that frequently co-occur)
    AFFINITY_MATRIX = {
        'DDA': {'SAVINGS': 0.45, 'REWARDS_CC': 0.38, 'PERSONAL_LOAN': 0.22, 'AUTO_LOAN': 0.18},
        'SAVINGS': {'CD_12M': 0.42, 'MMA': 0.35, 'INVESTMENT_ACCT': 0.28, 'REWARDS_CC': 0.25},
        'REWARDS_CC': {'PREMIUM_CC': 0.15, 'PERSONAL_LOAN': 0.32, 'AUTO_LOAN': 0.25},
        'CD_12M': {'MMA': 0.38, 'INVESTMENT_ACCT': 0.40},
        'PERSONAL_LOAN': {'AUTO_LOAN': 0.20, 'HELOC': 0.12},
        'AUTO_LOAN': {'PERSONAL_LOAN': 0.18, 'INSURANCE': 0.35}
    }

    # Life stage → product mapping
    LIFE_STAGE_PRODUCTS = {
        'Young Professional': ['SAVINGS', 'REWARDS_CC', 'PERSONAL_LOAN', 'AUTO_LOAN'],
        'Growing Family': ['MMA', 'AUTO_LOAN', 'MORTGAGE', 'CD_12M'],
        'Established': ['INVESTMENT_ACCT', 'HELOC', 'PREMIUM_CC', 'MMA'],
        'Pre-Retirement': ['CD_12M', 'MMA', 'INVESTMENT_ACCT'],
        'Retired': ['CD_12M', 'MMA', 'SAVINGS']
    }

    def __init__(self, cv_folds=5):
        """Initialize propensity model with separate classifiers per product"""
        self.cv_folds = cv_folds
        self.models = {}  # One model per product
        self.scalers = {}
        self.feature_names = None

    def determine_life_stage(self, customer):
        """Infer customer life stage from age, income, and life events"""
        age = customer.get('age', 0)
        income = customer.get('annual_income', 0)
        has_mortgage = customer.get('has_mortgage', False)
        has_children = customer.get('has_dependents', False)

        if age < 30:
            return 'Young Professional'
        elif age < 45 and has_children:
            return 'Growing Family'
        elif age < 55 and income > 100000:
            return 'Established'
        elif age < 65:
            return 'Pre-Retirement'
        else:
            return 'Retired'

    def engineer_features(self, customer_data, transaction_data=None, interaction_data=None):
        """
        Comprehensive feature engineering for propensity modeling.
        
        Feature categories:
        1. Demographics (age, income, employment, marital status)
        2. Current products (wallet share, product depth, tenure)
        3. Financial behavior (balances, transaction patterns, spending)
        4. Engagement (channel usage, service interactions, digital adoption)
        5. Life events (recent changes triggering product needs)
        6. Risk indicators (credit score, payment history)
        """
        df = customer_data.copy()
        today = datetime.now()

        # ===== DEMOGRAPHIC FEATURES =====
        df['age'] = df.get('age', 45)
        df['annual_income'] = df.get('annual_income', 60000)
        df['employment_status'] = df.get('employment_status', 'Employed')
        df['is_employed'] = (df['employment_status'] == 'Employed').astype(int)
        df['marital_status'] = df.get('marital_status', 'Single')
        df['is_married'] = (df['marital_status'] == 'Married').astype(int)
        df['has_dependents'] = df.get('dependents', 0) > 0
        df['homeowner'] = df.get('homeowner', False).astype(int)

        # ===== LIFE STAGE =====
        df['life_stage'] = df.apply(lambda x: self.determine_life_stage(x), axis=1)
        
        # Encode life stage
        life_stage_map = {
            'Young Professional': 0, 'Growing Family': 1, 'Established': 2,
            'Pre-Retirement': 3, 'Retired': 4
        }
        df['life_stage_encoded'] = df['life_stage'].map(life_stage_map).fillna(1)

        # ===== CURRENT PRODUCT HOLDINGS =====
        df['product_count'] = df.get('product_count', 1)
        df['has_dda'] = df.get('has_dda', False).astype(int)
        df['has_savings'] = df.get('has_savings', False).astype(int)
        df['has_credit_card'] = df.get('has_credit_card', False).astype(int)
        df['has_loan'] = df.get('has_loan', False).astype(int)
        df['has_investment'] = df.get('has_investment', False).astype(int)
        
        df['wallet_share'] = df.get('deposit_share', 0.5)  # Share of total banking deposits
        df['tenure_months'] = df.get('tenure_months', 12)

        # ===== FINANCIAL BEHAVIOR =====
        df['total_balance'] = df.get('total_balance', 0)
        df['avg_monthly_balance'] = df.get('avg_balance', 0)
        df['balance_growth_3m'] = df.get('balance_growth', 0)
        
        df['monthly_deposits'] = df.get('monthly_deposits', 0)
        df['monthly_withdrawals'] = df.get('monthly_withdrawals', 0)
        df['savings_rate'] = (df['monthly_deposits'] - df['monthly_withdrawals']) / (df['annual_income'] / 12 + 1)
        
        df['avg_transaction_amount'] = df.get('avg_txn_amt', 0)
        df['transaction_frequency'] = df.get('txn_count_90d', 0)

        # ===== ENGAGEMENT & DIGITAL ADOPTION =====
        df['digital_transactions_pct'] = df.get('digital_txn_pct', 0)
        df['mobile_app_user'] = df.get('mobile_active', False).astype(int)
        df['online_banking_user'] = df.get('online_active', False).astype(int)
        df['days_since_last_login'] = df.get('days_since_login', 365)
        
        df['service_calls_90d'] = df.get('service_interactions', 0)
        df['branch_visits_90d'] = df.get('branch_visits', 0)

        # ===== LIFE EVENTS & TRIGGERS =====
        df['recent_address_change'] = df.get('address_changed_180d', False).astype(int)
        df['recent_job_change'] = df.get('employment_changed_180d', False).astype(int)
        df['recent_marriage'] = df.get('marital_change_365d', False).astype(int)
        df['recent_home_purchase'] = df.get('home_purchase_365d', False).astype(int)
        
        df['life_event_score'] = (
            df['recent_address_change'] + df['recent_job_change'] +
            df['recent_marriage'] + df['recent_home_purchase']
        )

        # ===== CREDIT & RISK =====
        df['credit_score'] = df.get('credit_score', 680)
        df['credit_tier'] = pd.cut(df['credit_score'], bins=[0, 650, 700, 750, 850],
                                    labels=[0, 1, 2, 3]).astype(int)
        df['debt_to_income'] = df.get('dti_ratio', 0.3)
        df['payment_delinquencies'] = df.get('late_payments_12m', 0)

        # ===== ENGAGEMENT RECENCY =====
        df['days_since_last_transaction'] = df.get('days_since_txn', 30)
        df['recently_active'] = (df['days_since_last_transaction'] < 30).astype(int)

        # ===== INCOME TIER =====
        df['income_tier'] = pd.cut(df['annual_income'], 
                                    bins=[0, 40000, 75000, 125000, 250000, float('inf')],
                                    labels=[0, 1, 2, 3, 4]).astype(int)

        # Feature list
        feature_cols = [
            'age', 'annual_income', 'is_employed', 'is_married', 'has_dependents', 'homeowner',
            'life_stage_encoded', 'product_count', 'has_dda', 'has_savings', 'has_credit_card',
            'has_loan', 'has_investment', 'wallet_share', 'tenure_months',
            'total_balance', 'avg_monthly_balance', 'balance_growth_3m',
            'monthly_deposits', 'monthly_withdrawals', 'savings_rate',
            'avg_transaction_amount', 'transaction_frequency',
            'digital_transactions_pct', 'mobile_app_user', 'online_banking_user',
            'days_since_last_login', 'service_calls_90d', 'branch_visits_90d',
            'recent_address_change', 'recent_job_change', 'recent_marriage',
            'recent_home_purchase', 'life_event_score',
            'credit_score', 'credit_tier', 'debt_to_income', 'payment_delinquencies',
            'days_since_last_transaction', 'recently_active', 'income_tier'
        ]

        X = df[feature_cols].fillna(0)
        X = X.replace([np.inf, -np.inf], 0)
        
        self.feature_names = feature_cols
        logger.info(f"Features engineered: {len(feature_cols)} features for {len(X)} customers")

        return X, feature_cols

    def fit(self, customer_data, product_adoptions, transaction_data=None, interaction_data=None):
        """
        Train separate propensity models for each product.
        
        Args:
            customer_data: Customer profile and demographics
            product_adoptions: Dict of {product_name: binary adoption labels}
            transaction_data: Optional transaction history
            interaction_data: Optional customer service interactions
        """
        X, self.feature_names = self.engineer_features(customer_data, transaction_data, interaction_data)

        for product_name, y in product_adoptions.items():
            logger.info(f"Training model for {product_name}")

            # Initialize model and scaler for this product
            self.models[product_name] = RandomForestClassifier(
                n_estimators=200,
                max_depth=12,
                min_samples_split=20,
                min_samples_leaf=10,
                random_state=42,
                class_weight='balanced'
            )
            self.scalers[product_name] = StandardScaler()

            # Scale features
            X_scaled = self.scalers[product_name].fit_transform(X)

            # Train model
            self.models[product_name].fit(X_scaled, y)

            # Cross-validation
            cv_scores = cross_val_score(self.models[product_name], X_scaled, y, 
                                       cv=self.cv_folds, scoring='roc_auc')
            logger.info(f"{product_name} - CV AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

        return self

    def predict_propensity(self, customer_data, transaction_data=None, interaction_data=None, top_n=5):
        """
        Generate product propensity scores and ranked recommendations.
        
        Returns DataFrame with:
        - Propensity score for each product (0-1)
        - Expected revenue from product adoption
        - Product rank by propensity
        - Recommended offer timing
        """
        if not self.models:
            raise ValueError("Models not trained. Call fit() first.")

        X, _ = self.engineer_features(customer_data, transaction_data, interaction_data)
        
        results = []
        
        for customer_idx, customer_row in customer_data.iterrows():
            customer_id = customer_row['customer_id']
            current_products = customer_row.get('current_products', [])
            life_stage = self.determine_life_stage(customer_row)
            
            product_scores = []
            
            for product_name, model in self.models.items():
                # Skip if customer already has this product
                if product_name in current_products:
                    continue

                # Get propensity score
                X_customer = X.iloc[[customer_idx]]
                X_scaled = self.scalers[product_name].transform(X_customer)
                propensity = model.predict_proba(X_scaled)[0, 1]

                # Adjust for product affinity
                affinity_boost = 0
                for owned_product in current_products:
                    if owned_product in self.AFFINITY_MATRIX:
                        affinity_boost += self.AFFINITY_MATRIX[owned_product].get(product_name, 0)
                
                adjusted_propensity = min(1.0, propensity + (affinity_boost * 0.1))

                # Adjust for life stage fit
                life_stage_fit = 1.0
                if life_stage in self.LIFE_STAGE_PRODUCTS:
                    if product_name in self.LIFE_STAGE_PRODUCTS[life_stage]:
                        life_stage_fit = 1.2
                    else:
                        life_stage_fit = 0.8
                
                final_propensity = min(1.0, adjusted_propensity * life_stage_fit)

                # Expected revenue
                expected_revenue = self.PRODUCT_CATALOG.get(product_name, {}).get('avg_revenue', 0) * final_propensity

                product_scores.append({
                    'product': product_name,
                    'propensity': final_propensity,
                    'expected_revenue': expected_revenue,
                    'affinity_boost': affinity_boost,
                    'life_stage_fit': life_stage_fit
                })

            # Rank products by propensity
            product_scores = sorted(product_scores, key=lambda x: x['propensity'], reverse=True)
            
            # Take top N recommendations
            for rank, rec in enumerate(product_scores[:top_n], 1):
                results.append({
                    'customer_id': customer_id,
                    'product': rec['product'],
                    'propensity_score': round(rec['propensity'], 4),
                    'expected_revenue': round(rec['expected_revenue'], 2),
                    'rank': rank,
                    'offer_timing': 'Immediate' if rec['propensity'] > 0.7 else 'Next 30 Days' if rec['propensity'] > 0.5 else 'Next 90 Days',
                    'channel_recommendation': 'Mobile App' if customer_row.get('mobile_active', False) else 'Email',
                    'life_stage': life_stage
                })

        recommendations_df = pd.DataFrame(results)
        logger.info(f"Generated {len(recommendations_df)} product recommendations for {len(customer_data)} customers")

        return recommendations_df

# Example usage:
# model = ProductPropensityModel(cv_folds=5)
# product_adoptions = {
#     'SAVINGS': savings_labels,
#     'REWARDS_CC': cc_labels,
#     'PERSONAL_LOAN': loan_labels
# }
# model.fit(customer_df, product_adoptions, transaction_df, interaction_df)
# recommendations = model.predict_propensity(new_customers_df, top_n=3)
# print(recommendations[['customer_id', 'product', 'propensity_score', 'expected_revenue', 'rank']])`,
};

// ============================================================================
// AI/ML MODELS CATALOG
// ============================================================================
export const customerAIMLCatalog = {
  domain: "Customer Core",
  layer: "Advanced Analytics",
  totalModels: 3,
  description: "Production-grade AI/ML models for comprehensive customer analytics, retention, and value optimization",
  models: [
    customerChurnModel,
    customerLTVModel,
    productPropensityModel,
  ],
  keyCapabilities: [
    "Real-time churn prediction with risk segmentation and actionable intervention strategies",
    "Comprehensive CLTV incorporating full banking economics (NII, fees, credit costs, operations, cross-sell)",
    "Product propensity scoring with life stage modeling and affinity-based recommendations",
    "End-to-end feature engineering with behavioral, transactional, and demographic signals",
    "Cross-validation and performance monitoring for model accuracy",
  ],
  implementationNotes: [
    "All models trained on Silver layer cleansed and deduplicated customer data",
    "Churn model uses gradient boosting with class imbalance handling and stratified CV",
    "CLTV calculator implements DCF methodology with customer-specific churn adjustment",
    "Propensity model trains separate classifiers per product with affinity matrix boosting",
    "Production logging and error handling built into all model classes",
    "Models designed for both batch scoring and real-time prediction APIs",
  ],
};

export default customerAIMLCatalog;
