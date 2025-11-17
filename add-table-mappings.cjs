const fs = require('fs');

const content = fs.readFileSync('client/lib/retail/customer-retail-metrics.ts', 'utf8');

// Define table mappings by category
const categoryMappings = {
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

// Function to add table mappings after the last existing property
function addTableProperties(metricBlock, category) {
  const mapping = categoryMappings[category];
  if (!mapping) return metricBlock;
  
  // Skip if already has table mappings
  if (metricBlock.includes('silverTable:') || metricBlock.includes('goldTable:')) {
    return metricBlock;
  }
  
  // Find the position before the closing brace
  // Look for the last comma before the closing brace
  const closingBraceIndex = metricBlock.lastIndexOf('},');
  if (closingBraceIndex === -1) return metricBlock;
  
  // Find the last property line
  const beforeClosing = metricBlock.substring(0, closingBraceIndex);
  const lastCommaIndex = beforeClosing.lastIndexOf(',');
  
  if (lastCommaIndex === -1) return metricBlock;
  
  // Insert the table properties
  const before = metricBlock.substring(0, lastCommaIndex + 1);
  const after = metricBlock.substring(lastCommaIndex + 1);
  
  const tableProps = `\n          silverTable: '${mapping.silver}',\n          goldTable: '${mapping.gold}',`;
  
  return before + tableProps + after;
}

// Process the content
let result = content;

// Match each metric object and its category
const lines = content.split('\n');
let currentMetric = [];
let currentCategory = null;
let inMetric = false;
let braceCount = 0;
const processedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of metric (id: 'CRM-)
  if (line.trim().match(/^id:\s*'CRM-/)) {
    inMetric = true;
    currentMetric = [line];
    braceCount = 0;
    continue;
  }
  
  if (inMetric) {
    currentMetric.push(line);
    
    // Track braces
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
    
    // Capture category
    const catMatch = line.match(/category:\s*'([^']+)'/);
    if (catMatch) {
      currentCategory = catMatch[1];
    }
    
    // End of metric object
    if (line.trim() === '},' && braceCount === 0) {
      inMetric = false;
      
      // Process this metric
      const metricText = currentMetric.join('\n');
      const mapping = categoryMappings[currentCategory];
      
      if (mapping && !metricText.includes('silverTable:')) {
        // Add table properties before the closing },
        const lastLineIndex = currentMetric.length - 1;
        currentMetric.splice(lastLineIndex, 0,
          `          silverTable: '${mapping.silver}',`,
          `          goldTable: '${mapping.gold}',`
        );
      }
      
      processedLines.push(...currentMetric);
      currentMetric = [];
      currentCategory = null;
      continue;
    }
  }
  
  if (!inMetric) {
    processedLines.push(line);
  }
}

result = processedLines.join('\n');

fs.writeFileSync('client/lib/retail/customer-retail-metrics.ts', result);
console.log('Successfully added table mappings to all metrics');
