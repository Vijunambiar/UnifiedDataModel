/**
 * Domain Validation Script
 * 
 * Validates that a banking domain implementation meets all quality standards
 * for enterprise-grade data models.
 * 
 * Usage:
 *   npx tsx scripts/validate-domain.ts <domain-file-path>
 * 
 * Example:
 *   npx tsx scripts/validate-domain.ts client/lib/retail/customer-retail-comprehensive.ts
 */

interface ValidationResult {
  category: string;
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface DomainValidation {
  domainId: string;
  domainName: string;
  area: string;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  grade: string;
  completeness: number;
  results: ValidationResult[];
}

/**
 * Validates domain metadata section
 */
function validateMetadata(domain: any): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Check if metadata exists
  if (!domain || !domain.id) {
    results.push({
      category: 'Metadata',
      rule: 'Domain ID exists',
      status: 'FAIL',
      message: 'Domain must have an ID',
      severity: 'CRITICAL',
    });
    return results;
  }
  
  // Required metadata fields
  const requiredFields = [
    'id', 'name', 'area', 'description', 'businessOwner', 
    'technicalOwner', 'version', 'lastUpdated', 'status'
  ];
  
  for (const field of requiredFields) {
    if (!domain[field]) {
      results.push({
        category: 'Metadata',
        rule: `Required field: ${field}`,
        status: 'FAIL',
        message: `Metadata missing required field: ${field}`,
        severity: 'HIGH',
      });
    } else {
      results.push({
        category: 'Metadata',
        rule: `Required field: ${field}`,
        status: 'PASS',
        message: `Field ${field} present`,
        severity: 'LOW',
      });
    }
  }
  
  // Validate area value
  const validAreas = ['retail', 'commercial', 'wealth', 'mortgage', 'corporate', 'operations', 'risk-compliance', 'open-banking'];
  if (domain.area && !validAreas.includes(domain.area)) {
    results.push({
      category: 'Metadata',
      rule: 'Valid banking area',
      status: 'FAIL',
      message: `Invalid area: ${domain.area}. Must be one of: ${validAreas.join(', ')}`,
      severity: 'HIGH',
    });
  } else if (domain.area) {
    results.push({
      category: 'Metadata',
      rule: 'Valid banking area',
      status: 'PASS',
      message: `Valid area: ${domain.area}`,
      severity: 'LOW',
    });
  }
  
  return results;
}

/**
 * Validates Bronze Layer implementation
 */
function validateBronzeLayer(bronzeLayer: any): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!bronzeLayer) {
    results.push({
      category: 'Bronze Layer',
      rule: 'Bronze layer exists',
      status: 'FAIL',
      message: 'Bronze layer is required',
      severity: 'CRITICAL',
    });
    return results;
  }
  
  // Check table count (minimum 15 for Grade A)
  const tableCount = bronzeLayer.tables?.length || 0;
  if (tableCount < 15) {
    results.push({
      category: 'Bronze Layer',
      rule: 'Minimum 15 tables',
      status: 'FAIL',
      message: `Bronze layer has ${tableCount} tables, minimum 15 required for Grade A`,
      severity: 'HIGH',
    });
  } else if (tableCount < 25) {
    results.push({
      category: 'Bronze Layer',
      rule: 'Minimum 15 tables',
      status: 'PASS',
      message: `Bronze layer has ${tableCount} tables (target: 15-25)`,
      severity: 'LOW',
    });
  } else {
    results.push({
      category: 'Bronze Layer',
      rule: 'Minimum 15 tables',
      status: 'PASS',
      message: `Bronze layer has ${tableCount} tables (excellent)`,
      severity: 'LOW',
    });
  }
  
  // Validate each table
  if (bronzeLayer.tables) {
    for (const table of bronzeLayer.tables) {
      // Required audit columns
      const requiredAuditColumns = [
        'source_system',
        'source_record_id',
        'source_file_name',
        'load_timestamp',
        'cdc_operation',
        'record_hash',
        'created_timestamp',
        'updated_timestamp',
      ];
      
      const schema = table.schema || {};
      const missingAuditColumns = requiredAuditColumns.filter(col => !schema[col]);
      
      if (missingAuditColumns.length > 0) {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Required audit columns`,
          status: 'FAIL',
          message: `Missing audit columns: ${missingAuditColumns.join(', ')}`,
          severity: 'CRITICAL',
        });
      } else {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Required audit columns`,
          status: 'PASS',
          message: 'All audit columns present',
          severity: 'LOW',
        });
      }
      
      // Check for primary key definition
      if (!table.primaryKey || table.primaryKey.length === 0) {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Primary key`,
          status: 'FAIL',
          message: 'Primary key not defined',
          severity: 'HIGH',
        });
      } else {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Primary key`,
          status: 'PASS',
          message: `Primary key: ${table.primaryKey.join(', ')}`,
          severity: 'LOW',
        });
      }
      
      // Check for partitioning strategy
      if (!table.partitioning) {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Partitioning`,
          status: 'WARNING',
          message: 'Partitioning strategy not defined',
          severity: 'MEDIUM',
        });
      } else {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Partitioning`,
          status: 'PASS',
          message: `Partitioning: ${table.partitioning.type}`,
          severity: 'LOW',
        });
      }
      
      // Check column count (should have detailed schema)
      const columnCount = Object.keys(schema).length;
      if (columnCount < 20) {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Column count`,
          status: 'WARNING',
          message: `Only ${columnCount} columns defined, expected 30-80 for comprehensive model`,
          severity: 'MEDIUM',
        });
      } else {
        results.push({
          category: 'Bronze Layer',
          rule: `Table ${table.name} - Column count`,
          status: 'PASS',
          message: `${columnCount} columns defined`,
          severity: 'LOW',
        });
      }
    }
  }
  
  return results;
}

/**
 * Validates Silver Layer implementation
 */
function validateSilverLayer(silverLayer: any): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!silverLayer) {
    results.push({
      category: 'Silver Layer',
      rule: 'Silver layer exists',
      status: 'FAIL',
      message: 'Silver layer is required',
      severity: 'CRITICAL',
    });
    return results;
  }
  
  // Check table count (minimum 10 for Grade A)
  const tableCount = silverLayer.tables?.length || 0;
  if (tableCount < 10) {
    results.push({
      category: 'Silver Layer',
      rule: 'Minimum 10 tables',
      status: 'FAIL',
      message: `Silver layer has ${tableCount} tables, minimum 10 required for Grade A`,
      severity: 'HIGH',
    });
  } else {
    results.push({
      category: 'Silver Layer',
      rule: 'Minimum 10 tables',
      status: 'PASS',
      message: `Silver layer has ${tableCount} tables`,
      severity: 'LOW',
    });
  }
  
  // Validate each table for SCD2 requirements
  if (silverLayer.tables) {
    for (const table of silverLayer.tables) {
      const requiredSCD2Columns = [
        'effective_date',
        'expiration_date',
        'is_current',
        'record_version',
      ];
      
      const schema = table.schema || {};
      const missingSCD2Columns = requiredSCD2Columns.filter(col => !schema[col]);
      
      if (missingSCD2Columns.length > 0) {
        results.push({
          category: 'Silver Layer',
          rule: `Table ${table.name} - SCD2 columns`,
          status: 'FAIL',
          message: `Missing SCD2 columns: ${missingSCD2Columns.join(', ')}`,
          severity: 'CRITICAL',
        });
      } else {
        results.push({
          category: 'Silver Layer',
          rule: `Table ${table.name} - SCD2 columns`,
          status: 'PASS',
          message: 'All SCD2 columns present',
          severity: 'LOW',
        });
      }
      
      // Check for data quality columns
      const requiredDQColumns = [
        'data_quality_score',
        'source_system_of_record',
      ];
      
      const missingDQColumns = requiredDQColumns.filter(col => !schema[col]);
      
      if (missingDQColumns.length > 0) {
        results.push({
          category: 'Silver Layer',
          rule: `Table ${table.name} - Data quality columns`,
          status: 'FAIL',
          message: `Missing data quality columns: ${missingDQColumns.join(', ')}`,
          severity: 'HIGH',
        });
      } else {
        results.push({
          category: 'Silver Layer',
          rule: `Table ${table.name} - Data quality columns`,
          status: 'PASS',
          message: 'Data quality columns present',
          severity: 'LOW',
        });
      }
    }
  }
  
  return results;
}

/**
 * Validates Gold Layer implementation
 */
function validateGoldLayer(goldLayer: any): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!goldLayer) {
    results.push({
      category: 'Gold Layer',
      rule: 'Gold layer exists',
      status: 'FAIL',
      message: 'Gold layer is required',
      severity: 'CRITICAL',
    });
    return results;
  }
  
  // Check dimension count (minimum 8 for Grade A)
  const dimensionCount = goldLayer.dimensions?.length || 0;
  if (dimensionCount < 8) {
    results.push({
      category: 'Gold Layer',
      rule: 'Minimum 8 dimensions',
      status: 'FAIL',
      message: `Gold layer has ${dimensionCount} dimensions, minimum 8 required for Grade A`,
      severity: 'HIGH',
    });
  } else {
    results.push({
      category: 'Gold Layer',
      rule: 'Minimum 8 dimensions',
      status: 'PASS',
      message: `Gold layer has ${dimensionCount} dimensions`,
      severity: 'LOW',
    });
  }
  
  // Check fact count (minimum 5 for Grade A)
  const factCount = goldLayer.facts?.length || 0;
  if (factCount < 5) {
    results.push({
      category: 'Gold Layer',
      rule: 'Minimum 5 facts',
      status: 'FAIL',
      message: `Gold layer has ${factCount} facts, minimum 5 required for Grade A`,
      severity: 'HIGH',
    });
  } else {
    results.push({
      category: 'Gold Layer',
      rule: 'Minimum 5 facts',
      status: 'PASS',
      message: `Gold layer has ${factCount} facts`,
      severity: 'LOW',
    });
  }
  
  // Validate dimension structure
  if (goldLayer.dimensions) {
    for (const dim of goldLayer.dimensions) {
      // Check naming convention
      if (!dim.name.startsWith('gold.dim_')) {
        results.push({
          category: 'Gold Layer',
          rule: `Dimension ${dim.name} - Naming convention`,
          status: 'FAIL',
          message: 'Dimension names must start with "gold.dim_"',
          severity: 'MEDIUM',
        });
      } else {
        results.push({
          category: 'Gold Layer',
          rule: `Dimension ${dim.name} - Naming convention`,
          status: 'PASS',
          message: 'Naming convention followed',
          severity: 'LOW',
        });
      }
      
      // Check for surrogate key
      const schema = dim.schema || {};
      const surrogateKeyPattern = /_key$/;
      const hasSurrogateKey = Object.keys(schema).some(col => surrogateKeyPattern.test(col));
      
      if (!hasSurrogateKey) {
        results.push({
          category: 'Gold Layer',
          rule: `Dimension ${dim.name} - Surrogate key`,
          status: 'FAIL',
          message: 'Dimension must have surrogate key ending in "_key"',
          severity: 'HIGH',
        });
      } else {
        results.push({
          category: 'Gold Layer',
          rule: `Dimension ${dim.name} - Surrogate key`,
          status: 'PASS',
          message: 'Surrogate key present',
          severity: 'LOW',
        });
      }
    }
  }
  
  // Validate fact structure
  if (goldLayer.facts) {
    for (const fact of goldLayer.facts) {
      // Check naming convention
      if (!fact.name.startsWith('gold.fact_')) {
        results.push({
          category: 'Gold Layer',
          rule: `Fact ${fact.name} - Naming convention`,
          status: 'FAIL',
          message: 'Fact names must start with "gold.fact_"',
          severity: 'MEDIUM',
        });
      } else {
        results.push({
          category: 'Gold Layer',
          rule: `Fact ${fact.name} - Naming convention`,
          status: 'PASS',
          message: 'Naming convention followed',
          severity: 'LOW',
        });
      }
      
      // Check for measures
      if (!fact.measures || fact.measures.length === 0) {
        results.push({
          category: 'Gold Layer',
          rule: `Fact ${fact.name} - Measures`,
          status: 'FAIL',
          message: 'Fact table must define measures',
          severity: 'HIGH',
        });
      } else {
        results.push({
          category: 'Gold Layer',
          rule: `Fact ${fact.name} - Measures`,
          status: 'PASS',
          message: `${fact.measures.length} measures defined`,
          severity: 'LOW',
        });
      }
    }
  }
  
  return results;
}

/**
 * Validates Metrics Catalog
 */
function validateMetricsCatalog(metricsCatalog: any): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!metricsCatalog) {
    results.push({
      category: 'Metrics',
      rule: 'Metrics catalog exists',
      status: 'FAIL',
      message: 'Metrics catalog is required',
      severity: 'CRITICAL',
    });
    return results;
  }
  
  // Count total metrics
  let totalMetrics = 0;
  if (metricsCatalog.categories) {
    for (const category of metricsCatalog.categories) {
      totalMetrics += category.metrics?.length || 0;
    }
  }
  
  // Check metric count (minimum 300 for Grade A)
  if (totalMetrics < 300) {
    results.push({
      category: 'Metrics',
      rule: 'Minimum 300 metrics',
      status: 'FAIL',
      message: `Metrics catalog has ${totalMetrics} metrics, minimum 300 required for Grade A`,
      severity: 'HIGH',
    });
  } else {
    results.push({
      category: 'Metrics',
      rule: 'Minimum 300 metrics',
      status: 'PASS',
      message: `Metrics catalog has ${totalMetrics} metrics`,
      severity: 'LOW',
    });
  }
  
  // Validate metric structure
  if (metricsCatalog.categories) {
    for (const category of metricsCatalog.categories) {
      if (category.metrics) {
        for (const metric of category.metrics) {
          const requiredFields = ['id', 'name', 'description', 'formula', 'unit', 'aggregation'];
          const missingFields = requiredFields.filter(field => !metric[field]);
          
          if (missingFields.length > 0) {
            results.push({
              category: 'Metrics',
              rule: `Metric ${metric.id || 'unnamed'} - Required fields`,
              status: 'FAIL',
              message: `Missing fields: ${missingFields.join(', ')}`,
              severity: 'MEDIUM',
            });
          }
        }
      }
    }
  }
  
  return results;
}

/**
 * Calculate domain grade based on validation results
 */
function calculateGrade(validation: DomainValidation): string {
  const passRate = (validation.passed / validation.totalChecks) * 100;
  
  if (passRate >= 95) return 'A';
  if (passRate >= 85) return 'B';
  if (passRate >= 75) return 'C';
  return 'D';
}

/**
 * Main validation function
 */
export function validateDomain(domain: any, bronzeLayer: any, silverLayer: any, goldLayer: any, metricsCatalog: any): DomainValidation {
  const results: ValidationResult[] = [];
  
  // Run all validations
  results.push(...validateMetadata(domain));
  results.push(...validateBronzeLayer(bronzeLayer));
  results.push(...validateSilverLayer(silverLayer));
  results.push(...validateGoldLayer(goldLayer));
  results.push(...validateMetricsCatalog(metricsCatalog));
  
  // Calculate statistics
  const totalChecks = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  const completeness = (passed / totalChecks) * 100;
  
  const validation: DomainValidation = {
    domainId: domain?.id || 'unknown',
    domainName: domain?.name || 'Unknown Domain',
    area: domain?.area || 'unknown',
    totalChecks,
    passed,
    failed,
    warnings,
    grade: '',
    completeness,
    results,
  };
  
  validation.grade = calculateGrade(validation);
  
  return validation;
}

/**
 * Print validation report to console
 */
export function printValidationReport(validation: DomainValidation): void {
  console.log('\n' + '='.repeat(80));
  console.log(`DOMAIN VALIDATION REPORT`);
  console.log('='.repeat(80));
  console.log(`Domain: ${validation.domainName} (${validation.domainId})`);
  console.log(`Area: ${validation.area}`);
  console.log(`Grade: ${validation.grade}`);
  console.log(`Completeness: ${validation.completeness.toFixed(1)}%`);
  console.log(`Total Checks: ${validation.totalChecks}`);
  console.log(`  ✓ Passed: ${validation.passed}`);
  console.log(`  ✗ Failed: ${validation.failed}`);
  console.log(`  ⚠ Warnings: ${validation.warnings}`);
  console.log('='.repeat(80));
  
  // Group results by category
  const categories = [...new Set(validation.results.map(r => r.category))];
  
  for (const category of categories) {
    const categoryResults = validation.results.filter(r => r.category === category);
    const categoryFailed = categoryResults.filter(r => r.status === 'FAIL').length;
    const categoryWarnings = categoryResults.filter(r => r.status === 'WARNING').length;
    
    console.log(`\n${category}:`);
    
    // Show failures first
    for (const result of categoryResults.filter(r => r.status === 'FAIL')) {
      console.log(`  ✗ ${result.rule}: ${result.message}`);
    }
    
    // Then warnings
    for (const result of categoryResults.filter(r => r.status === 'WARNING')) {
      console.log(`  ⚠ ${result.rule}: ${result.message}`);
    }
    
    // Summary for category
    const categoryPassed = categoryResults.length - categoryFailed - categoryWarnings;
    console.log(`  Summary: ${categoryPassed} passed, ${categoryFailed} failed, ${categoryWarnings} warnings`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (validation.grade === 'A') {
    console.log('✓ EXCELLENT! Domain meets Grade A standards.');
  } else if (validation.grade === 'B') {
    console.log('⚠ GOOD. Domain meets Grade B standards. Address failures to reach Grade A.');
  } else if (validation.grade === 'C') {
    console.log('⚠ ACCEPTABLE. Domain meets Grade C standards. Significant improvements needed.');
  } else {
    console.log('✗ INSUFFICIENT. Domain does not meet minimum standards. Major work required.');
  }
  
  console.log('='.repeat(80) + '\n');
}

// Export for use in other scripts
export { ValidationResult, DomainValidation };
