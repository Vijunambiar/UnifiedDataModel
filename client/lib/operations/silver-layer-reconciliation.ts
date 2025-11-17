/**
 * SILVER LAYER RECONCILIATION & DATA VALIDATION ORCHESTRATION
 * 
 * Comprehensive reconciliation between Bronze and Silver layers
 * Data validation orchestration and exception handling
 * 
 * Features:
 * - Record count reconciliation
 * - Amount totals reconciliation
 * - Column-level validation
 * - Data quality scoring
 * - Exception management
 * - Manual review workflows
 * - Audit trail
 */

export interface ReconciliationResult {
  reconciliationId: string;
  domain: string;
  sourceTable: string;
  targetTable: string;
  reconciliationType: "COUNT" | "AMOUNT" | "HASH" | "DETAIL";
  startTime: Date;
  endTime: Date;
  status: "PASSED" | "FAILED" | "WARNING" | "MANUAL_REVIEW";
  sourceCount?: number;
  targetCount?: number;
  countVariance?: number;
  countVariancePercent?: number;
  sourceAmount?: number;
  targetAmount?: number;
  amountVariance?: number;
  sourceHash?: string;
  targetHash?: string;
  matchedRecords?: number;
  unmatchedSourceRecords?: number;
  unmatchedTargetRecords?: number;
  exceptions: Exception[];
  threshold: {
    countTolerance: number;
    amountTolerance: number;
  };
  notes?: string;
}

export interface DataValidationResult {
  validationId: string;
  table: string;
  validatedAt: Date;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  validityScore: number;
  ruleResults: Array<{
    ruleId: string;
    ruleName: string;
    status: "PASSED" | "FAILED";
    failureCount: number;
    failureRate: number;
  }>;
  criticalIssues: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface Exception {
  exceptionId: string;
  domain: string;
  table: string;
  exceptionType: "MISSING_RECORD" | "EXTRA_RECORD" | "MISMATCH" | "DATA_QUALITY" | "DUPLICATE";
  severity: "CRITICAL" | "ERROR" | "WARNING";
  sourceRecord?: Record<string, unknown>;
  targetRecord?: Record<string, unknown>;
  details: string;
  createdAt: Date;
  status: "NEW" | "ASSIGNED" | "IN_REVIEW" | "RESOLVED" | "WAIVED";
  assignedTo?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    actor: string;
    notes?: string;
  }>;
}

export interface ValidationIssue {
  issueId: string;
  issueType: "NULL_VALUE" | "INVALID_FORMAT" | "OUT_OF_RANGE" | "INVALID_REFERENCE";
  column: string;
  recordId?: string;
  value?: unknown;
  expectedFormat?: string;
  message: string;
  severity: "CRITICAL" | "ERROR" | "WARNING";
}

/**
 * ReconciliationEngine
 * Performs reconciliation between Bronze and Silver layers
 */
export class ReconciliationEngine {
  private reconciliationResults: Map<string, ReconciliationResult> = new Map();
  private exceptions: Map<string, Exception> = new Map();

  /**
   * Reconcile customer domain
   */
  async reconcileCustomerDomain(): Promise<ReconciliationResult[]> {
    const results: ReconciliationResult[] = [];

    console.log("[Reconciliation] Starting Customer Domain reconciliation...");

    // Reconcile customer master
    results.push(await this.reconcileTable("Customer", "bronze.customer_master", "silver.customer_master_golden"));

    // Reconcile customer relationships
    results.push(
      await this.reconcileTable(
        "Customer",
        "bronze.customer_account_relationships",
        "silver.customer_relationships"
      )
    );

    // Reconcile contact history
    results.push(
      await this.reconcileTable(
        "Customer",
        "bronze.customer_email",
        "silver.customer_contact_history"
      )
    );

    return results;
  }

  /**
   * Reconcile deposits domain
   */
  async reconcileDepositsDomain(): Promise<ReconciliationResult[]> {
    const results: ReconciliationResult[] = [];

    console.log("[Reconciliation] Starting Deposits Domain reconciliation...");

    // Reconcile account master
    results.push(
      await this.reconcileTable("Deposits", "bronze.deposit_account_master", "silver.deposit_account_master_golden")
    );

    // Reconcile daily balances
    results.push(
      await this.reconcileTable(
        "Deposits",
        "bronze.deposit_account_balances_daily",
        "silver.deposit_account_daily_balances"
      )
    );

    // Reconcile transactions
    results.push(
      await this.reconcileTable("Deposits", "bronze.money_transaction", "silver.deposit_transaction_detail")
    );

    return results;
  }

  /**
   * Reconcile transactions domain
   */
  async reconcileTransactionsDomain(): Promise<ReconciliationResult[]> {
    const results: ReconciliationResult[] = [];

    console.log("[Reconciliation] Starting Transactions Domain reconciliation...");

    // Reconcile transaction detail
    results.push(
      await this.reconcileTable(
        "Transactions",
        "bronze.money_transaction + ACH + Wire",
        "silver.transaction_detail_enriched"
      )
    );

    // Reconcile daily aggregates (SUM validation)
    results.push(await this.reconcileAggregates("Transactions", "silver.transaction_daily_aggregates"));

    return results;
  }

  /**
   * Reconcile two tables
   */
  private async reconcileTable(
    domain: string,
    sourceTable: string,
    targetTable: string
  ): Promise<ReconciliationResult> {
    const reconciliationId = `RECON_${domain}_${Date.now()}`;

    const startTime = new Date();

    try {
      // Get source counts (mock data)
      const sourceCount = this.getMockSourceCount(sourceTable);

      // Get target counts (mock data)
      const targetCount = this.getMockTargetCount(targetTable);

      // Calculate variance
      const countVariance = targetCount - sourceCount;
      const countVariancePercent = (countVariance / sourceCount) * 100;

      // Determine tolerance (typically ±5% for reconciliation)
      const countTolerance = 5;

      const passed = Math.abs(countVariancePercent) <= countTolerance;

      const exceptions: Exception[] = [];

      if (!passed) {
        // Log exceptions
        const exception: Exception = {
          exceptionId: `EXC_${reconciliationId}`,
          domain: domain,
          table: sourceTable,
          exceptionType: "MISSING_RECORD",
          severity: countVariancePercent < -10 ? "CRITICAL" : "ERROR",
          details: `Record count variance: ${countVariancePercent.toFixed(2)}% (Source: ${sourceCount}, Target: ${targetCount})`,
          createdAt: new Date(),
          status: "NEW",
          auditTrail: [
            {
              timestamp: new Date(),
              action: "CREATED",
              actor: "ReconciliationEngine",
              notes: "Auto-created from reconciliation mismatch",
            },
          ],
        };

        exceptions.push(exception);
        this.exceptions.set(exception.exceptionId, exception);
      }

      const result: ReconciliationResult = {
        reconciliationId: reconciliationId,
        domain: domain,
        sourceTable: sourceTable,
        targetTable: targetTable,
        reconciliationType: "COUNT",
        startTime: startTime,
        endTime: new Date(),
        status: passed ? "PASSED" : countVariancePercent > 0 ? "WARNING" : "FAILED",
        sourceCount: sourceCount,
        targetCount: targetCount,
        countVariance: countVariance,
        countVariancePercent: countVariancePercent,
        exceptions: exceptions,
        threshold: {
          countTolerance: countTolerance,
          amountTolerance: 0.01,
        },
      };

      this.reconciliationResults.set(reconciliationId, result);

      console.log(
        `[Reconciliation] ${sourceTable} vs ${targetTable}: ${result.status} (Variance: ${countVariancePercent.toFixed(2)}%)`
      );

      return result;
    } catch (error) {
      console.error(`[Reconciliation] Error reconciling ${sourceTable}:`, error);

      return {
        reconciliationId: reconciliationId,
        domain: domain,
        sourceTable: sourceTable,
        targetTable: targetTable,
        reconciliationType: "COUNT",
        startTime: startTime,
        endTime: new Date(),
        status: "FAILED",
        exceptions: [
          {
            exceptionId: `EXC_${reconciliationId}`,
            domain: domain,
            table: sourceTable,
            exceptionType: "DATA_QUALITY",
            severity: "CRITICAL",
            details: `Reconciliation failed: ${(error as Error).message}`,
            createdAt: new Date(),
            status: "NEW",
            auditTrail: [
              {
                timestamp: new Date(),
                action: "ERROR",
                actor: "ReconciliationEngine",
                notes: `Error: ${(error as Error).message}`,
              },
            ],
          },
        ],
        threshold: {
          countTolerance: 5,
          amountTolerance: 0.01,
        },
      };
    }
  }

  /**
   * Reconcile aggregated data
   */
  private async reconcileAggregates(domain: string, aggregateTable: string): Promise<ReconciliationResult> {
    const reconciliationId = `RECON_AGG_${domain}_${Date.now()}`;

    const startTime = new Date();

    try {
      // For aggregates, validate that SUM of detail = aggregate values
      // Mock: In production, would sum daily aggregates and compare to monthly

      const aggregateTotal = 1000000; // Mock
      const detailSum = 1000050; // Mock - slightly different due to rounding
      const amountVariance = detailSum - aggregateTotal;
      const amountVariancePercent = (amountVariance / aggregateTotal) * 100;

      const amountTolerance = 0.1; // 0.1% tolerance
      const passed = Math.abs(amountVariancePercent) <= amountTolerance;

      const result: ReconciliationResult = {
        reconciliationId: reconciliationId,
        domain: domain,
        sourceTable: "Detail records",
        targetTable: aggregateTable,
        reconciliationType: "AMOUNT",
        startTime: startTime,
        endTime: new Date(),
        status: passed ? "PASSED" : "WARNING",
        sourceAmount: detailSum,
        targetAmount: aggregateTotal,
        amountVariance: amountVariance,
        exceptions: [],
        threshold: {
          countTolerance: 5,
          amountTolerance: amountTolerance,
        },
      };

      this.reconciliationResults.set(reconciliationId, result);

      console.log(
        `[Reconciliation] Aggregate reconciliation for ${aggregateTable}: ${result.status}`
      );

      return result;
    } catch (error) {
      return {
        reconciliationId: reconciliationId,
        domain: domain,
        sourceTable: "Detail records",
        targetTable: aggregateTable,
        reconciliationType: "AMOUNT",
        startTime: startTime,
        endTime: new Date(),
        status: "FAILED",
        exceptions: [],
        threshold: {
          countTolerance: 5,
          amountTolerance: 0.1,
        },
      };
    }
  }

  /**
   * Mock source count (in production, queries bronze table)
   */
  private getMockSourceCount(table: string): number {
    const counts: Record<string, number> = {
      "bronze.customer_master": 9800000,
      "bronze.customer_account_relationships": 4900000,
      "bronze.customer_email": 10000000,
      "bronze.deposit_account_master": 25000000,
      "bronze.deposit_account_balances_daily": 25000000,
      "bronze.money_transaction": 500000000,
    };

    return counts[table] || 1000000;
  }

  /**
   * Mock target count (in production, queries silver table)
   */
  private getMockTargetCount(table: string): number {
    const counts: Record<string, number> = {
      "silver.customer_master_golden": 9800100,
      "silver.customer_relationships": 4900000,
      "silver.customer_contact_history": 10050000,
      "silver.deposit_account_master_golden": 24950000,
      "silver.deposit_account_daily_balances": 25000000,
      "silver.deposit_transaction_detail": 499950000,
    };

    return counts[table] || 1000000;
  }

  /**
   * Get reconciliation results
   */
  getReconciliationResults(): ReconciliationResult[] {
    return Array.from(this.reconciliationResults.values());
  }

  /**
   * Get reconciliation summary
   */
  getReconciliationSummary(): {
    totalReconciliations: number;
    passedReconciliations: number;
    failedReconciliations: number;
    passRate: number;
  } {
    const results = Array.from(this.reconciliationResults.values());
    const passed = results.filter(r => r.status === "PASSED").length;

    return {
      totalReconciliations: results.length,
      passedReconciliations: passed,
      failedReconciliations: results.length - passed,
      passRate: results.length > 0 ? (passed / results.length) * 100 : 0,
    };
  }
}

/**
 * DataValidationOrchestrator
 * Orchestrates data validation across all tables
 */
export class DataValidationOrchestrator {
  private validationResults: Map<string, DataValidationResult> = new Map();

  /**
   * Validate customer domain
   */
  async validateCustomerDomain(): Promise<DataValidationResult[]> {
    const results: DataValidationResult[] = [];

    console.log("[Validation] Starting Customer Domain validation...");

    results.push(await this.validateTable("silver.customer_master_golden"));
    results.push(await this.validateTable("silver.customer_relationships"));
    results.push(await this.validateTable("silver.customer_contact_history"));

    return results;
  }

  /**
   * Validate deposits domain
   */
  async validateDepositsDomain(): Promise<DataValidationResult[]> {
    const results: DataValidationResult[] = [];

    console.log("[Validation] Starting Deposits Domain validation...");

    results.push(await this.validateTable("silver.deposit_account_master_golden"));
    results.push(await this.validateTable("silver.deposit_account_daily_balances"));
    results.push(await this.validateTable("silver.deposit_transaction_detail"));

    return results;
  }

  /**
   * Validate transactions domain
   */
  async validateTransactionsDomain(): Promise<DataValidationResult[]> {
    const results: DataValidationResult[] = [];

    console.log("[Validation] Starting Transactions Domain validation...");

    results.push(await this.validateTable("silver.transaction_detail_enriched"));
    results.push(await this.validateTable("silver.transaction_daily_aggregates"));
    results.push(await this.validateTable("silver.transaction_counterparty_summary"));

    return results;
  }

  /**
   * Validate a table against data quality rules
   */
  private async validateTable(table: string): Promise<DataValidationResult> {
    const validationId = `VAL_${table}_${Date.now()}`;

    try {
      // Mock validation: In production, would execute all DQ rules against table
      const totalRecords = this.getMockRecordCount(table);
      const invalidRecords = Math.floor(totalRecords * 0.02); // 2% invalid
      const validRecords = totalRecords - invalidRecords;
      const validityScore = (validRecords / totalRecords) * 100;

      const ruleResults = [
        {
          ruleId: "RULE_NOT_NULL",
          ruleName: "Null Value Check",
          status: validityScore >= 99 ? "PASSED" : "FAILED",
          failureCount: 0,
          failureRate: 0,
        },
        {
          ruleId: "RULE_FORMAT",
          ruleName: "Format Validation",
          status: validityScore >= 98 ? "PASSED" : "FAILED",
          failureCount: Math.floor(totalRecords * 0.01),
          failureRate: 1,
        },
        {
          ruleId: "RULE_RANGE",
          ruleName: "Range Validation",
          status: "PASSED",
          failureCount: 0,
          failureRate: 0,
        },
      ];

      const criticalIssues: ValidationIssue[] = [];
      const warnings: ValidationIssue[] = [];

      if (validityScore < 95) {
        criticalIssues.push({
          issueId: `ISSUE_${validationId}_1`,
          issueType: "NULL_VALUE",
          column: "unknown",
          message: "High rate of validation failures detected",
          severity: "CRITICAL",
        });
      }

      const result: DataValidationResult = {
        validationId: validationId,
        table: table,
        validatedAt: new Date(),
        totalRecords: totalRecords,
        validRecords: validRecords,
        invalidRecords: invalidRecords,
        validityScore: validityScore,
        ruleResults: ruleResults,
        criticalIssues: criticalIssues,
        warnings: warnings,
      };

      this.validationResults.set(validationId, result);

      console.log(
        `[Validation] ${table}: ${validityScore.toFixed(2)}% valid (${validRecords}/${totalRecords})`
      );

      return result;
    } catch (error) {
      console.error(`[Validation] Error validating ${table}:`, error);

      return {
        validationId: validationId,
        table: table,
        validatedAt: new Date(),
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        validityScore: 0,
        ruleResults: [],
        criticalIssues: [
          {
            issueId: `ISSUE_${validationId}_ERROR`,
            issueType: "INVALID_FORMAT",
            message: `Validation failed: ${(error as Error).message}`,
            severity: "CRITICAL",
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Mock record count
   */
  private getMockRecordCount(table: string): number {
    const counts: Record<string, number> = {
      "silver.customer_master_golden": 9800000,
      "silver.customer_relationships": 4900000,
      "silver.customer_contact_history": 10000000,
      "silver.deposit_account_master_golden": 25000000,
      "silver.deposit_account_daily_balances": 25000000,
      "silver.deposit_transaction_detail": 500000000,
      "silver.transaction_detail_enriched": 500000000,
      "silver.transaction_daily_aggregates": 25000,
      "silver.transaction_counterparty_summary": 50000,
    };

    return counts[table] || 1000000;
  }

  /**
   * Get validation results
   */
  getValidationResults(): DataValidationResult[] {
    return Array.from(this.validationResults.values());
  }

  /**
   * Get validation summary
   */
  getValidationSummary(): {
    totalTablesValidated: number;
    averageValidityScore: number;
    tablesWithIssues: number;
    criticalIssueCount: number;
  } {
    const results = Array.from(this.validationResults.values());

    const totalValidity = results.reduce((sum, r) => sum + r.validityScore, 0);
    const averageValidityScore = results.length > 0 ? totalValidity / results.length : 0;

    const tablesWithIssues = results.filter(r => r.criticalIssues.length > 0).length;

    const criticalIssueCount = results.reduce((sum, r) => sum + r.criticalIssues.length, 0);

    return {
      totalTablesValidated: results.length,
      averageValidityScore: averageValidityScore,
      tablesWithIssues: tablesWithIssues,
      criticalIssueCount: criticalIssueCount,
    };
  }
}

/**
 * ExceptionManager
 * Manages data quality exceptions and manual review workflow
 */
export class ExceptionManager {
  private exceptions: Map<string, Exception> = new Map();

  /**
   * Create exception
   */
  createException(
    domain: string,
    table: string,
    exceptionType: string,
    severity: "CRITICAL" | "ERROR" | "WARNING",
    details: string
  ): Exception {
    const exceptionId = `EXC_${Date.now()}`;

    const exception: Exception = {
      exceptionId: exceptionId,
      domain: domain,
      table: table,
      exceptionType: exceptionType as any,
      severity: severity,
      details: details,
      createdAt: new Date(),
      status: "NEW",
      auditTrail: [
        {
          timestamp: new Date(),
          action: "CREATED",
          actor: "ExceptionManager",
        },
      ],
    };

    this.exceptions.set(exceptionId, exception);

    console.log(`[ExceptionManager] Exception created: ${exceptionId} (${severity})`);

    return exception;
  }

  /**
   * Assign exception
   */
  assignException(exceptionId: string, assignedTo: string): void {
    const exception = this.exceptions.get(exceptionId);
    if (exception) {
      exception.status = "ASSIGNED";
      exception.assignedTo = assignedTo;
      exception.auditTrail.push({
        timestamp: new Date(),
        action: "ASSIGNED",
        actor: "ExceptionManager",
        notes: `Assigned to ${assignedTo}`,
      });

      console.log(`[ExceptionManager] Exception ${exceptionId} assigned to ${assignedTo}`);
    }
  }

  /**
   * Resolve exception
   */
  resolveException(exceptionId: string, resolvedBy: string, resolutionNotes: string): void {
    const exception = this.exceptions.get(exceptionId);
    if (exception) {
      exception.status = "RESOLVED";
      exception.resolvedBy = resolvedBy;
      exception.resolutionNotes = resolutionNotes;
      exception.auditTrail.push({
        timestamp: new Date(),
        action: "RESOLVED",
        actor: resolvedBy,
        notes: resolutionNotes,
      });

      console.log(`[ExceptionManager] Exception ${exceptionId} resolved by ${resolvedBy}`);
    }
  }

  /**
   * Waive exception
   */
  waiveException(exceptionId: string, waivedBy: string, reason: string): void {
    const exception = this.exceptions.get(exceptionId);
    if (exception) {
      exception.status = "WAIVED";
      exception.auditTrail.push({
        timestamp: new Date(),
        action: "WAIVED",
        actor: waivedBy,
        notes: `Waived reason: ${reason}`,
      });

      console.log(`[ExceptionManager] Exception ${exceptionId} waived by ${waivedBy}`);
    }
  }

  /**
   * Get open exceptions
   */
  getOpenExceptions(): Exception[] {
    return Array.from(this.exceptions.values()).filter(
      e => e.status === "NEW" || e.status === "ASSIGNED" || e.status === "IN_REVIEW"
    );
  }

  /**
   * Get exceptions by severity
   */
  getExceptionsBySeverity(severity: "CRITICAL" | "ERROR" | "WARNING"): Exception[] {
    return Array.from(this.exceptions.values()).filter(e => e.severity === severity);
  }

  /**
   * Get exception summary
   */
  getExceptionSummary(): {
    totalExceptions: number;
    openExceptions: number;
    criticalExceptions: number;
    byDomain: Record<string, number>;
  } {
    const exceptions = Array.from(this.exceptions.values());
    const openCount = exceptions.filter(e => e.status === "NEW" || e.status === "ASSIGNED").length;
    const criticalCount = exceptions.filter(e => e.severity === "CRITICAL").length;

    const byDomain: Record<string, number> = {};
    exceptions.forEach(e => {
      byDomain[e.domain] = (byDomain[e.domain] || 0) + 1;
    });

    return {
      totalExceptions: exceptions.length,
      openExceptions: openCount,
      criticalExceptions: criticalCount,
      byDomain: byDomain,
    };
  }
}

export default {
  ReconciliationEngine,
  DataValidationOrchestrator,
  ExceptionManager,
};
