/**
 * Script to add 'type' field to all metrics based on category mapping
 * 
 * Run with: node scripts/add-metric-types.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category to Type Mapping
const CATEGORY_TO_TYPE = {
  // KPI Categories
  'Acquisition': 'kpi',
  'Retention': 'kpi',
  'Satisfaction': 'kpi',
  'NPS': 'kpi',
  'CLV': 'kpi',
  'Churn': 'kpi',
  
  // Operational Categories
  'Volume': 'operational',
  'Transaction': 'operational',
  'Portfolio': 'operational',
  'Activity': 'operational',
  'Traffic': 'operational',
  'Origination': 'operational',
  'Servicing': 'operational',
  
  // Financial Categories
  'Profitability': 'financial',
  'Revenue': 'financial',
  'Cost': 'financial',
  'Fees': 'financial',
  'Interest': 'financial',
  'Yield': 'financial',
  'Margin': 'financial',
  'ROI': 'financial',
  'ROA': 'financial',
  
  // Risk Categories
  'Risk': 'risk',
  'Compliance': 'risk',
  'Fraud': 'risk',
  'Delinquency': 'risk',
  'Default': 'risk',
  'Credit Risk': 'risk',
  'AML': 'risk',
  'Regulatory': 'risk',
  
  // Behavioral Categories
  'Behavior': 'behavioral',
  'Engagement': 'behavioral',
  'Usage': 'behavioral',
  'Adoption': 'behavioral',
  'Digital': 'behavioral',
  
  // Diagnostic Categories (ratios, rates, percentages)
  'Efficiency': 'diagnostic',
  'Quality': 'diagnostic',
  'Performance': 'diagnostic',
  'Conversion': 'diagnostic',
  'Penetration': 'diagnostic',
  'Mix': 'diagnostic',
};

// Subcategory fallback mapping for more specific classification
const SUBCATEGORY_TO_TYPE = {
  'ROI': 'kpi',
  'Growth': 'kpi',
  'Churn': 'kpi',
  'Loyalty': 'kpi',
  
  'Volume': 'operational',
  'Count': 'operational',
  'Balances': 'operational',
  
  'Fees': 'financial',
  'Revenue': 'financial',
  'Cost': 'financial',
  'Interest': 'financial',
  
  'Fraud': 'risk',
  'Delinquency': 'risk',
  'Default': 'risk',
  'Regulatory': 'risk',
  
  'Adoption': 'behavioral',
  'Usage': 'behavioral',
  'Engagement': 'behavioral',
  
  'Ratio': 'diagnostic',
  'Rate': 'diagnostic',
  'Percentage': 'diagnostic',
  'Efficiency': 'diagnostic',
};

// Metric name keywords for intelligent classification
const NAME_KEYWORDS_TO_TYPE = {
  'kpi': ['CAC', 'NPS', 'CLV', 'LTV', 'Retention Rate', 'Churn Rate', 'Growth Rate'],
  'financial': ['Revenue', 'Fee', 'Cost', 'Profit', 'Margin', 'Yield', 'Interest', 'ROI', 'ROA', 'ROE'],
  'risk': ['Fraud', 'Delinquent', 'Default', 'Loss', 'Write-off', 'Charge-off', 'OFAC', 'CTR', 'SAR', 'AML'],
  'behavioral': ['Adoption', 'Engagement', 'Active', 'Login', 'Session', 'Visit', 'Usage'],
  'operational': ['Count', 'Total', 'Volume', 'Balance', 'Number of', 'Accounts', 'Transactions'],
  'diagnostic': ['Rate', 'Ratio', 'Percentage', 'Average', 'Mean', 'Utilization', 'Penetration'],
};

function getMetricType(metric) {
  // Priority 1: Check category
  if (metric.category && CATEGORY_TO_TYPE[metric.category]) {
    return CATEGORY_TO_TYPE[metric.category];
  }
  
  // Priority 2: Check subcategory
  if (metric.subcategory && SUBCATEGORY_TO_TYPE[metric.subcategory]) {
    return SUBCATEGORY_TO_TYPE[metric.subcategory];
  }
  
  // Priority 3: Check metric name for keywords
  if (metric.name) {
    for (const [type, keywords] of Object.entries(NAME_KEYWORDS_TO_TYPE)) {
      if (keywords.some(keyword => metric.name.includes(keyword))) {
        return type;
      }
    }
  }
  
  // Default fallback based on common patterns
  if (metric.category === 'Volume' || metric.category === 'Transaction' || metric.category === 'Portfolio') {
    return 'operational';
  }
  
  return 'diagnostic'; // Safe default
}

function addTypeToMetrics(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let metricsCount = 0;
  
  // Find all metric objects and add type if missing
  // Pattern: metric object with id, name, description, category
  const metricPattern = /{\s*id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,\s*description:\s*['"]([^'"]+)['"]\s*,\s*category:\s*['"]([^'"]+)['"]/g;
  
  // First pass: collect all metrics to analyze
  const metrics = [];
  let match;
  while ((match = metricPattern.exec(content)) !== null) {
    metrics.push({
      id: match[1],
      name: match[2],
      description: match[3],
      category: match[4],
      startIndex: match.index
    });
  }
  
  // Process metrics in reverse order to maintain indices
  for (let i = metrics.length - 1; i >= 0; i--) {
    const metric = metrics[i];
    const type = getMetricType(metric);
    
    // Find the position after category to insert type
    const categoryPos = content.indexOf(`category: '${metric.category}'`, metric.startIndex);
    if (categoryPos === -1) continue;
    
    const categoryLineEnd = content.indexOf(',', categoryPos);
    if (categoryLineEnd === -1) continue;
    
    // Check if type already exists
    const nextLine = content.substring(categoryLineEnd, categoryLineEnd + 100);
    if (nextLine.includes('type:') || nextLine.includes('metricType:')) {
      continue; // Already has type
    }
    
    // Insert type after category
    const insertion = `\n          type: '${type}',`;
    content = content.substring(0, categoryLineEnd + 1) + insertion + content.substring(categoryLineEnd + 1);
    modified = true;
    metricsCount++;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${metricsCount} metrics with type field`);
  } else {
    console.log(`ℹ️  No changes needed (types already present)`);
  }
  
  return metricsCount;
}

// Main execution
const metricsDir = path.join(__dirname, '..', 'client', 'lib', 'retail');
const metricsFiles = [
  'customer-retail-metrics.ts',
  'deposits-retail-metrics.ts',
  'loans-retail-metrics.ts',
  'cards-retail-metrics.ts',
  'payments-retail-metrics.ts',
  'branch-retail-metrics.ts',
  'marketing-retail-metrics.ts',
  'sales-retail-metrics.ts',
  'collections-retail-metrics-catalog.ts',
  'compliance-retail-metrics-catalog.ts',
  'customer-service-retail-metrics-catalog.ts',
  'digital-retail-metrics-catalog.ts',
  'fraud-retail-metrics-catalog.ts',
  'insurance-retail-metrics-catalog.ts',
  'investment-retail-metrics-catalog.ts',
  'open-banking-retail-metrics-catalog.ts',
];

console.log('🚀 Starting metric type classification...\n');
console.log('Metric Type Taxonomy:');
console.log('  • kpi - Key Performance Indicators');
console.log('  • operational - Volumes, counts, transactions');
console.log('  • financial - Revenue, costs, profitability');
console.log('  • risk - Fraud, compliance, credit risk');
console.log('  • behavioral - Engagement, adoption, usage');
console.log('  • diagnostic - Ratios, rates, percentages\n');

let totalMetrics = 0;

for (const file of metricsFiles) {
  const filePath = path.join(metricsDir, file);
  if (fs.existsSync(filePath)) {
    const count = addTypeToMetrics(filePath);
    totalMetrics += count;
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
}

console.log(`\n✨ Complete! Updated ${totalMetrics} metrics across ${metricsFiles.length} files.`);
console.log('\n📋 Summary:');
console.log(`   Total files processed: ${metricsFiles.length}`);
console.log(`   Total metrics updated: ${totalMetrics}`);
console.log('\n🎯 Next steps:');
console.log('   1. Review the changes in git diff');
console.log('   2. Verify metric types are correct');
console.log('   3. Refresh the app to see varied metric types in the UI');
