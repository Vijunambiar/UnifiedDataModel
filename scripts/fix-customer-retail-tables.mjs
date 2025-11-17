import { readFileSync, writeFileSync } from 'fs';

const filePath = 'client/lib/retail/customer-retail-metrics.ts';
let content = readFileSync(filePath, 'utf8');

// Define table mappings
const tableMappings = {
  'Acquisition': {
    silver: 'silver.retail_customer_lifecycle_events_golden',
    gold: 'gold.fact_customer_acquisition'
  },
  'Retention': {
    silver: 'silver.retail_customer_lifecycle_events_golden',
    gold: 'gold.fact_customer_churn'
  },
  'Engagement': {
    silver: 'silver.retail_customer_interactions_golden',
    gold: 'gold.fact_customer_interactions'
  },
  'Profitability': {
    silver: 'silver.retail_customer_master_golden',
    gold: 'gold.fact_customer_profitability'
  },
  'Satisfaction': {
    silver: 'silver.retail_customer_interactions_golden',
    gold: 'gold.fact_customer_satisfaction'
  }
};

// For each category, find and replace metric objects
Object.entries(tableMappings).forEach(([category, mapping]) => {
  // Pattern to match metric objects with this category that don't already have tables
  // Matches from { to }, capturing everything inside
  const metricPattern = new RegExp(
    `(\\{[\\s\\S]*?id:\\s*'CRM-[A-Z]+-\\d+',[\\s\\S]*?category:\\s*'${category}',[\\s\\S]*?)(?!\\s*silverTable:)(\\s*\\},)`,
    'g'
  );
  
  content = content.replace(metricPattern, (match, before, closing) => {
    // Add table properties before the closing brace
    return before + 
      `\n          silverTable: '${mapping.silver}',` +
      `\n          goldTable: '${mapping.gold}',` +
      closing;
  });
});

// Write the result
writeFileSync(filePath, content);

// Verify
const verification = readFileSync(filePath, 'utf8');
const silverCount = (verification.match(/silverTable:/g) || []).length;
const goldCount = (verification.match(/goldTable:/g) || []).length;

console.log('✅ Successfully added table mappings to Customer-Retail metrics');
console.log(`   Total metrics with silverTable: ${silverCount}`);
console.log(`   Total metrics with goldTable: ${goldCount}`);

// Verify each category
Object.keys(tableMappings).forEach(category => {
  const categoryPattern = new RegExp(`category:\\s*'${category}'[\\s\\S]*?silverTable:`, 'g');
  const count = (verification.match(categoryPattern) || []).length;
  console.log(`   ${category} metrics with tables: ${count}`);
});
