/**
 * TRANSACTIONS DOMAIN - AI/ML MODELS & ADVANCED ANALYTICS
 * 
 * AI/ML models for transaction safety, optimization, and customer experience
 * Built on transaction detail, fraud scores, channels, and merchant data
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

export const fraudDetectionModel: AIMLModel = {
  id: "TXN-FRAUD-001",
  name: "Real-time Fraud Detection",
  category: "Classification",
  description: "Real-time fraud detection using neural networks and behavioral anomaly analysis on transaction attributes",
  businessUseCase: "Block fraudulent transactions and protect customer accounts from unauthorized use",
  inputDatasets: ["silver.transaction_detail", "silver.merchant_category", "silver.customer_behavior"],
  outputMetric: "Fraud Probability (0-1)",
  targetVariables: ["is_fraudulent", "dispute_indicator"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const transactionPropensityModel: AIMLModel = {
  id: "TXN-PROPENSITY-001",
  name: "Transaction Volume Propensity",
  category: "Regression",
  description: "Forecasts expected transaction volumes and spending amounts for upcoming periods using historical patterns and seasonality",
  businessUseCase: "Forecast liquidity needs and identify unusual trading behavior deviations",
  inputDatasets: ["silver.transaction_aggregate", "silver.customer_master", "silver.account_activity"],
  outputMetric: "Predicted Transaction Volume & Amount",
  targetVariables: ["monthly_transaction_count", "monthly_transaction_amount"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const merchantPreferenceModel: AIMLModel = {
  id: "TXN-MERCHANT-001",
  name: "Merchant Category Affinity",
  category: "Recommendation",
  description: "Identifies preferred merchant categories for each customer and predicts spending patterns by category",
  businessUseCase: "Personalize rewards programs and targeted offers based on merchant preferences",
  inputDatasets: ["silver.transaction_detail", "silver.merchant_category", "silver.customer_preferences"],
  outputMetric: "Top Merchant Categories (Ranked)",
  targetVariables: ["spending_by_category", "category_affinity_score"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const channelPreferenceModel: AIMLModel = {
  id: "TXN-CHANNEL-001",
  name: "Channel Usage Prediction",
  category: "Classification",
  description: "Predicts preferred transaction channels (mobile, web, branch, ATM) for each customer based on historical behavior",
  businessUseCase: "Optimize channel investments and digital adoption campaigns",
  inputDatasets: ["silver.transaction_detail", "silver.customer_master", "silver.channel_activity"],
  outputMetric: "Primary & Secondary Channels",
  targetVariables: ["preferred_channel", "channel_score"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const disputePredictionModel: AIMLModel = {
  id: "TXN-DISPUTE-001",
  name: "Transaction Dispute Propensity",
  category: "Classification",
  description: "Predicts likelihood of transaction dispute based on amount, merchant, and customer characteristics",
  businessUseCase: "Flag high-risk transactions and optimize dispute prevention strategies",
  inputDatasets: ["silver.transaction_detail", "silver.disputed_transactions", "silver.merchant_category"],
  outputMetric: "Dispute Probability (0-1)",
  targetVariables: ["is_disputed", "dispute_likelihood"],
  pythonCode: `# Python implementation not included - refer to Customer Core domain for comprehensive AI/ML examples`,
};

export const transactionsAIMLCatalog = {
  domain: "Transactions & Payments",
  layer: "Advanced Analytics",
  totalModels: 5,
  description: "AI/ML models for transaction safety, optimization, and customer experience",
  models: [
    fraudDetectionModel,
    transactionPropensityModel,
    merchantPreferenceModel,
    channelPreferenceModel,
    disputePredictionModel,
  ],
  keyCapabilities: [
    "Real-time fraud detection and prevention",
    "Transaction volume forecasting for liquidity planning",
    "Personalized merchant and channel recommendations",
    "Dispute prevention through behavioral analysis",
    "Anomaly detection for unusual spending patterns",
  ],
  implementationNotes: [
    "All models use Silver layer cleansed transaction data",
    "Fraud model deployed for real-time scoring",
    "Daily retraining with latest transaction and dispute data",
    "Integration with fraud management system for automated blocking",
    "Channel preference models retrained monthly based on behavioral shifts",
  ],
};

export default transactionsAIMLCatalog;
