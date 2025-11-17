#!/usr/bin/env python3
import re

# Read the file
with open('client/lib/retail/customer-retail-metrics.ts', 'r') as f:
    content = f.read()

# Define table mappings
table_mappings = {
    'Acquisition': {
        'silver': 'silver.retail_customer_lifecycle_events_golden',
        'gold': 'gold.fact_customer_acquisition'
    },
    'Retention': {
        'silver': 'silver.retail_customer_lifecycle_events_golden',
        'gold': 'gold.fact_customer_churn'
    },
    'Engagement': {
        'silver': 'silver.retail_customer_interactions_golden',
        'gold': 'gold.fact_customer_interactions'
    },
    'Profitability': {
        'silver': 'silver.retail_customer_master_golden',
        'gold': 'gold.fact_customer_profitability'
    },
    'Satisfaction': {
        'silver': 'silver.retail_customer_interactions_golden',
        'gold': 'gold.fact_customer_satisfaction'
    }
}

def add_tables_to_metric(match):
    metric = match.group(0)
    
    # Skip if already has table mappings
    if 'silverTable:' in metric or 'goldTable:' in metric:
        return metric
    
    # Extract category
    category_match = re.search(r"category:\s*'([^']+)'", metric)
    if not category_match:
        return metric
    
    category = category_match.group(1)
    
    # Get mapping for this category
    mapping = table_mappings.get(category)
    if not mapping:
        return metric
    
    # Find the last property (before the closing },)
    # We want to add after aggregation or unit or subcategory
    lines = metric.split('\n')
    
    # Find the closing brace index
    closing_idx = -1
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == '},':
            closing_idx = i
            break
    
    if closing_idx == -1:
        return metric
    
    # Insert the table properties before the closing brace
    table_lines = [
        f"          silverTable: '{mapping['silver']}',",
        f"          goldTable: '{mapping['gold']}',"
    ]
    
    # Insert before the closing brace
    lines = lines[:closing_idx] + table_lines + lines[closing_idx:]
    
    return '\n'.join(lines)

# Pattern to match individual metric objects
# Matches from { id: 'CRM-... to },
metric_pattern = re.compile(
    r"(\s+{\s+id:\s*'CRM-[A-Z]+-\d+',[\s\S]*?},)",
    re.MULTILINE
)

# Replace all metrics
result = metric_pattern.sub(add_tables_to_metric, content)

# Write back
with open('client/lib/retail/customer-retail-metrics.ts', 'w') as f:
    f.write(result)

print('Successfully added table mappings to all metrics')
