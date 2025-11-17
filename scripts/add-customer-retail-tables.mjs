import { readFileSync, writeFileSync } from 'fs';

// Read the metrics file
const filePath = 'client/lib/retail/customer-retail-metrics.ts';
const content = readFileSync(filePath, 'utf8');

// Define table mappings by category
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

// Process the file line by line
const lines = content.split('\n');
const result = [];
let currentCategory = null;
let inMetricObject = false;
let braceDepth = 0;
let lineBuffer = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  lineBuffer.push(line);
  
  // Detect category
  const categoryMatch = line.match(/category:\s*'([^']+)'/);
  if (categoryMatch) {
    currentCategory = categoryMatch[1];
  }
  
  // Track brace depth
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  braceDepth += openBraces - closeBraces;
  
  // Detect metric object closing
  if (line.trim() === '},') {
    // Check if this is a metric object (has an id property in buffer)
    const bufferText = lineBuffer.join('\n');
    const hasId = bufferText.match(/id:\s*'CRM-/);
    const hasTables = bufferText.includes('silverTable:');
    
    if (hasId && !hasTables && currentCategory && tableMappings[currentCategory]) {
      // Insert table properties before the closing brace
      const mapping = tableMappings[currentCategory];
      lineBuffer.splice(lineBuffer.length - 1, 0,
        `          silverTable: '${mapping.silver}',`,
        `          goldTable: '${mapping.gold}',`
      );
    }
    
    // Add buffered lines to result
    result.push(...lineBuffer);
    lineBuffer = [];
  } else if (braceDepth === 0 && lineBuffer.length === 1) {
    // Not in an object, flush immediately
    result.push(...lineBuffer);
    lineBuffer = [];
  }
}

// Add any remaining buffered lines
if (lineBuffer.length > 0) {
  result.push(...lineBuffer);
}

// Write the result
const output = result.join('\n');
writeFileSync(filePath, output);

console.log('✅ Successfully added table mappings to all Customer-Retail metrics');

// Verify
const verification = readFileSync(filePath, 'utf8');
const silverCount = (verification.match(/silverTable:/g) || []).length;
const goldCount = (verification.match(/goldTable:/g) || []).length;
console.log(`   Added silverTable to ${silverCount} metrics`);
console.log(`   Added goldTable to ${goldCount} metrics`);
