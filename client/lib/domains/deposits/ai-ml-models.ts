/**
 * DEPOSITS DOMAIN - AI/ML MODELS & ADVANCED ANALYTICS
 * 
 * AI/ML models for deposit account optimization and risk management
 * Built on account master, balances, transactions, and CD data
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

export const accountDormancyModel: AIMLModel = {
  id: "DEP-DORMANCY-001",
  name: "Account Dormancy Prediction",
  category: "Classification",
  description: "Predicts probability of account becoming inactive/dormant within 180 days based on transaction patterns and balance trends",
  businessUseCase: "Identify at-risk accounts for engagement campaigns to prevent dormancy and revenue loss",
  inputDatasets: ["silver.account_master", "silver.account_activity", "silver.transaction_summary"],
  outputMetric: "Dormancy Probability (0-1)",
  targetVariables: ["account_status", "is_active"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const depositBalanceForecastModel: AIMLModel = {
  id: "DEP-FORECAST-001",
  name: "Deposit Balance Forecast",
  category: "Regression",
  description: "Forecasts 90-day deposit balance trajectory using trend analysis, seasonality, and account characteristics",
  businessUseCase: "Optimize liquidity management, funding cost planning, and reserve requirements",
  inputDatasets: ["silver.account_balance", "silver.account_master", "silver.interest_rate_environment"],
  outputMetric: "Forecasted Average Balance ($)",
  targetVariables: ["average_balance_90d", "balance_volatility"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const accountClosureModel: AIMLModel = {
  id: "DEP-CLOSURE-001",
  name: "Account Closure Propensity",
  category: "Classification",
  description: "Identifies accounts likely to close within 60 days using account characteristics, usage patterns, and relationship quality",
  businessUseCase: "Trigger retention outreach before account closure to reduce churn",
  inputDatasets: ["silver.account_master", "silver.account_activity", "silver.customer_master"],
  outputMetric: "Closure Probability (0-1)",
  targetVariables: ["account_status", "closure_risk"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const cdRenewalModel: AIMLModel = {
  id: "DEP-CD-RENEWAL-001",
  name: "CD Renewal Propensity",
  category: "Classification",
  description: "Predicts likelihood of Certificate of Deposit renewal at maturity based on rate environment and customer behavior",
  businessUseCase: "Proactive outreach with competitive offers before CD maturity dates to retain funding",
  inputDatasets: ["silver.certificate_transactions", "silver.account_master", "silver.rate_environment"],
  outputMetric: "Renewal Probability (0-1)",
  targetVariables: ["cd_renewed", "renewal_likelihood"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const holdRiskModel: AIMLModel = {
  id: "DEP-HOLD-RISK-001",
  name: "Hold Risk & Dispute Prediction",
  category: "Classification",
  description: "Detects high-risk holds (legal, levy, garnishment) and predicts likelihood of customer dispute or appeal",
  businessUseCase: "Flag high-risk holds for compliance review and monitor dispute patterns to mitigate legal exposure",
  inputDatasets: ["silver.hold_transactions", "silver.account_master", "silver.customer_master"],
  outputMetric: "Hold Risk Score (0-100)",
  targetVariables: ["hold_disputed", "legal_hold_flag"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const depositsAIMLCatalog = {
  domain: "Deposits & Funding",
  layer: "Advanced Analytics",
  totalModels: 5,
  description: "AI/ML models for deposit account optimization and risk management",
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
