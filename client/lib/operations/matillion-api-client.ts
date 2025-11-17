/**
 * MATILLION API CLIENT & INTEGRATION LAYER
 * 
 * Comprehensive TypeScript client for integrating with Matillion ETL platform
 * Handles job execution, monitoring, error handling, and metrics collection
 * 
 * Features:
 * - Job triggering and execution
 * - Real-time job monitoring and status tracking
 * - Error handling with exponential backoff retry
 * - Metrics collection and reporting
 * - Integration with logging and alerting systems
 */

export interface MatillionConfig {
  baseUrl: string;
  apiVersion: string;
  username: string;
  password: string;
  environment: "production" | "staging" | "development";
  timeout: number;
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

export interface MatillionJobExecution {
  executionId: string;
  jobId: string;
  jobName: string;
  domain: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED" | "HELD";
  recordsProcessed?: number;
  recordsLoaded?: number;
  errorMessage?: string;
  errorCode?: string;
  retryAttempt?: number;
  maxRetries?: number;
}

export interface MatillionJobStatus {
  jobId: string;
  jobName: string;
  isRunning: boolean;
  lastRunTime?: Date;
  lastRunStatus?: string;
  nextScheduledRun?: Date;
  successCount?: number;
  failureCount?: number;
  averageDuration?: number;
}

export interface JobExecutionMetrics {
  executionId: string;
  jobId: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  successRate: number;
  throughput: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  errorDetails?: Array<{
    recordId?: string;
    errorMessage: string;
    errorCode: string;
    timestamp: Date;
  }>;
}

/**
 * MatillionAPIClient
 * Main client for interacting with Matillion REST API
 */
export class MatillionAPIClient {
  private config: MatillionConfig;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private executionLog: Map<string, MatillionJobExecution> = new Map();
  private metricsCollector: MatillionMetricsCollector;

  constructor(config: MatillionConfig) {
    this.config = config;
    this.metricsCollector = new MatillionMetricsCollector();
    this.validateConfig();
  }

  /**
   * Initialize and authenticate with Matillion API
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[Matillion] Initializing client for ${this.config.environment} environment`);
      await this.authenticate();
      console.log("[Matillion] Authentication successful");
    } catch (error) {
      console.error("[Matillion] Initialization failed:", error);
      throw new MatillionInitializationError("Failed to initialize Matillion client", error);
    }
  }

  /**
   * Authenticate with Matillion API
   */
  private async authenticate(): Promise<void> {
    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/auth/authenticate`;
    const body = {
      username: this.config.username,
      password: this.config.password,
    };

    const response = await this.makeRequest("POST", url, body);

    if (response.accessToken) {
      this.authToken = response.accessToken;
      this.tokenExpiry = new Date(Date.now() + response.expiresIn * 1000);
      console.log("[Matillion] Authentication token obtained, expires at:", this.tokenExpiry);
    } else {
      throw new Error("No access token in authentication response");
    }
  }

  /**
   * Ensure authentication token is valid
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.authToken || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      console.log("[Matillion] Token expired or missing, re-authenticating...");
      await this.authenticate();
    }
  }

  /**
   * Trigger a Matillion job execution
   */
  async triggerJob(jobId: string, jobName: string, domain: string, parameters?: Record<string, unknown>): Promise<MatillionJobExecution> {
    await this.ensureAuthenticated();

    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/jobs/${jobId}/execute`;
    const body = {
      parameters: parameters || {},
      notifications: {
        onSuccess: true,
        onFailure: true,
      },
    };

    console.log(`[Matillion] Triggering job ${jobName} (${jobId})`);

    const response = await this.makeRequest("POST", url, body);

    const execution: MatillionJobExecution = {
      executionId: response.executionId,
      jobId: jobId,
      jobName: jobName,
      domain: domain,
      startTime: new Date(),
      status: "PENDING",
    };

    this.executionLog.set(execution.executionId, execution);
    console.log(`[Matillion] Job triggered, execution ID: ${execution.executionId}`);

    return execution;
  }

  /**
   * Monitor job execution with polling
   */
  async monitorJobExecution(
    executionId: string,
    maxDurationMinutes: number = 180,
    pollIntervalSeconds: number = 30
  ): Promise<MatillionJobExecution> {
    const startTime = Date.now();
    const maxDurationMs = maxDurationMinutes * 60 * 1000;

    console.log(
      `[Matillion] Monitoring execution ${executionId} (timeout: ${maxDurationMinutes} minutes)`
    );

    while (true) {
      const elapsed = Date.now() - startTime;

      if (elapsed > maxDurationMs) {
        console.error(`[Matillion] Execution ${executionId} exceeded max duration`);
        throw new MatillionExecutionTimeout(
          `Job execution exceeded ${maxDurationMinutes} minutes`,
          executionId
        );
      }

      const execution = await this.getExecutionStatus(executionId);

      if (
        execution.status === "SUCCESS" ||
        execution.status === "FAILED" ||
        execution.status === "CANCELLED"
      ) {
        console.log(
          `[Matillion] Execution ${executionId} completed with status: ${execution.status}`
        );
        return execution;
      }

      console.log(
        `[Matillion] Execution ${executionId} still running... (elapsed: ${Math.round(elapsed / 1000)}s)`
      );

      await this.delay(pollIntervalSeconds * 1000);
    }
  }

  /**
   * Get job execution status
   */
  async getExecutionStatus(executionId: string): Promise<MatillionJobExecution> {
    await this.ensureAuthenticated();

    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/executions/${executionId}`;
    const response = await this.makeRequest("GET", url);

    const execution: MatillionJobExecution = {
      executionId: executionId,
      jobId: response.jobId,
      jobName: response.jobName,
      domain: response.domain || "Unknown",
      startTime: new Date(response.startTime),
      endTime: response.endTime ? new Date(response.endTime) : undefined,
      status: response.status,
      recordsProcessed: response.recordsProcessed,
      recordsLoaded: response.recordsLoaded,
      errorMessage: response.errorMessage,
      errorCode: response.errorCode,
    };

    if (execution.endTime && execution.startTime) {
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    }

    this.executionLog.set(executionId, execution);
    return execution;
  }

  /**
   * Get job status and schedule info
   */
  async getJobStatus(jobId: string): Promise<MatillionJobStatus> {
    await this.ensureAuthenticated();

    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/jobs/${jobId}`;
    const response = await this.makeRequest("GET", url);

    return {
      jobId: jobId,
      jobName: response.jobName,
      isRunning: response.isRunning,
      lastRunTime: response.lastRunTime ? new Date(response.lastRunTime) : undefined,
      lastRunStatus: response.lastRunStatus,
      nextScheduledRun: response.nextScheduledRun ? new Date(response.nextScheduledRun) : undefined,
      successCount: response.successCount,
      failureCount: response.failureCount,
      averageDuration: response.averageDuration,
    };
  }

  /**
   * Cancel a running job execution
   */
  async cancelJobExecution(executionId: string): Promise<void> {
    await this.ensureAuthenticated();

    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/executions/${executionId}/cancel`;

    console.log(`[Matillion] Cancelling execution ${executionId}`);
    await this.makeRequest("POST", url, {});
    console.log(`[Matillion] Execution ${executionId} cancelled`);
  }

  /**
   * Get job execution history
   */
  async getExecutionHistory(
    jobId: string,
    limit: number = 50
  ): Promise<MatillionJobExecution[]> {
    await this.ensureAuthenticated();

    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/jobs/${jobId}/executions?limit=${limit}&sort=startTime:desc`;
    const response = await this.makeRequest("GET", url);

    return response.executions.map((exec: any) => ({
      executionId: exec.executionId,
      jobId: exec.jobId,
      jobName: exec.jobName,
      domain: exec.domain,
      startTime: new Date(exec.startTime),
      endTime: exec.endTime ? new Date(exec.endTime) : undefined,
      status: exec.status,
      recordsProcessed: exec.recordsProcessed,
      recordsLoaded: exec.recordsLoaded,
    }));
  }

  /**
   * Get job execution metrics
   */
  async getExecutionMetrics(executionId: string): Promise<JobExecutionMetrics> {
    await this.ensureAuthenticated();

    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/executions/${executionId}/metrics`;
    const response = await this.makeRequest("GET", url);

    return {
      executionId: executionId,
      jobId: response.jobId,
      totalRecords: response.totalRecords,
      processedRecords: response.processedRecords,
      failedRecords: response.failedRecords,
      successRate: response.successRate,
      throughput: response.throughput,
      startTime: new Date(response.startTime),
      endTime: new Date(response.endTime),
      duration: response.duration,
      errorDetails: response.errorDetails?.map((err: any) => ({
        recordId: err.recordId,
        errorMessage: err.message,
        errorCode: err.code,
        timestamp: new Date(err.timestamp),
      })),
    };
  }

  /**
   * Execute job with automatic retry on failure
   */
  async executeJobWithRetry(
    jobId: string,
    jobName: string,
    domain: string,
    parameters?: Record<string, unknown>,
    maxRetries: number = 3
  ): Promise<MatillionJobExecution> {
    let lastError: Error | null = null;
    let execution: MatillionJobExecution | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[Matillion] Executing job ${jobName} (${jobId}) - Attempt ${attempt}/${maxRetries}`
        );

        execution = await this.triggerJob(jobId, jobName, domain, parameters);
        const result = await this.monitorJobExecution(execution.executionId);

        if (result.status === "SUCCESS") {
          console.log(`[Matillion] Job ${jobName} completed successfully`);
          return result;
        } else if (result.status === "FAILED") {
          lastError = new MatillionJobExecutionError(
            `Job execution failed: ${result.errorMessage}`,
            result.errorCode,
            execution.executionId
          );

          if (attempt < maxRetries) {
            const backoffMs =
              this.config.retryConfig.initialDelayMs *
              Math.pow(this.config.retryConfig.backoffMultiplier, attempt - 1);
            console.log(
              `[Matillion] Job failed, retrying after ${backoffMs}ms (Attempt ${attempt + 1}/${maxRetries})`
            );
            await this.delay(backoffMs);
          }
        } else {
          lastError = new Error(`Job cancelled or held: ${result.status}`);
          break;
        }
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const backoffMs =
            this.config.retryConfig.initialDelayMs *
            Math.pow(this.config.retryConfig.backoffMultiplier, attempt - 1);
          console.log(
            `[Matillion] Error executing job, retrying after ${backoffMs}ms: ${error}`
          );
          await this.delay(backoffMs);
        }
      }
    }

    throw (
      lastError ||
      new MatillionJobExecutionError(
        `Job execution failed after ${maxRetries} attempts`,
        "MAX_RETRIES_EXCEEDED",
        execution?.executionId || "unknown"
      )
    );
  }

  /**
   * Make HTTP request to Matillion API
   */
  private async makeRequest(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    body?: unknown
  ): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const options: RequestInit = {
      method: method,
      headers: headers,
      timeout: this.config.timeout,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await response.json();
        throw new MatillionAPIError(
          `API request failed: ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`[Matillion] API request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.baseUrl || !this.config.username || !this.config.password) {
      throw new Error("Invalid Matillion configuration: missing required fields");
    }
    console.log(`[Matillion] Configuration validated for ${this.config.environment}`);
  }

  /**
   * Get execution log
   */
  getExecutionLog(): Map<string, MatillionJobExecution> {
    return this.executionLog;
  }

  /**
   * Get metrics collector
   */
  getMetricsCollector(): MatillionMetricsCollector {
    return this.metricsCollector;
  }
}

/**
 * MatillionMetricsCollector
 * Collects and aggregates execution metrics
 */
export class MatillionMetricsCollector {
  private metrics: Map<string, JobExecutionMetrics> = new Map();

  /**
   * Record execution metrics
   */
  recordMetrics(metrics: JobExecutionMetrics): void {
    this.metrics.set(metrics.executionId, metrics);
  }

  /**
   * Get metrics for execution
   */
  getMetrics(executionId: string): JobExecutionMetrics | undefined {
    return this.metrics.get(executionId);
  }

  /**
   * Get average execution time for job
   */
  getAverageExecutionTime(jobId: string): number {
    const jobMetrics = Array.from(this.metrics.values()).filter(m => m.jobId === jobId);

    if (jobMetrics.length === 0) {
      return 0;
    }

    const totalDuration = jobMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / jobMetrics.length;
  }

  /**
   * Get success rate for job
   */
  getSuccessRate(jobId: string): number {
    const jobMetrics = Array.from(this.metrics.values()).filter(m => m.jobId === jobId);

    if (jobMetrics.length === 0) {
      return 0;
    }

    const successCount = jobMetrics.filter(m => m.successRate === 100).length;
    return (successCount / jobMetrics.length) * 100;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): JobExecutionMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics summary
   */
  getSummary(jobId?: string): {
    totalExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    recentMetrics: JobExecutionMetrics[];
  } {
    const allMetrics = jobId
      ? Array.from(this.metrics.values()).filter(m => m.jobId === jobId)
      : Array.from(this.metrics.values());

    const recentMetrics = allMetrics.sort((a, b) => b.endTime.getTime() - a.endTime.getTime()).slice(0, 10);

    const totalDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = allMetrics.length > 0 ? totalDuration / allMetrics.length : 0;

    const successCount = allMetrics.filter(m => m.successRate === 100).length;
    const successRate = allMetrics.length > 0 ? (successCount / allMetrics.length) * 100 : 0;

    return {
      totalExecutions: allMetrics.length,
      averageExecutionTime: averageDuration,
      successRate: successRate,
      recentMetrics: recentMetrics,
    };
  }
}

/**
 * Custom Error Classes
 */
export class MatillionAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public apiResponse: unknown
  ) {
    super(message);
    this.name = "MatillionAPIError";
  }
}

export class MatillionJobExecutionError extends Error {
  constructor(
    message: string,
    public errorCode: string,
    public executionId: string
  ) {
    super(message);
    this.name = "MatillionJobExecutionError";
  }
}

export class MatillionExecutionTimeout extends Error {
  constructor(
    message: string,
    public executionId: string
  ) {
    super(message);
    this.name = "MatillionExecutionTimeout";
  }
}

export class MatillionInitializationError extends Error {
  constructor(
    message: string,
    public originalError: unknown
  ) {
    super(message);
    this.name = "MatillionInitializationError";
  }
}

/**
 * MatillionOrchestratorService
 * High-level service for orchestrating complex workflows
 */
export class MatillionOrchestratorService {
  constructor(private client: MatillionAPIClient) {}

  /**
   * Execute customer domain pipeline
   */
  async executeCustomerDomainPipeline(parameters?: Record<string, unknown>): Promise<{
    orchestratorId: string;
    status: string;
    startTime: Date;
    completionTime?: Date;
    jobResults: MatillionJobExecution[];
    errors: string[];
  }> {
    const orchestratorId = `CUST_ORCH_${Date.now()}`;
    const jobResults: MatillionJobExecution[] = [];
    const errors: string[] = [];
    const startTime = new Date();

    const customerJobs = [
      { jobId: "CUST_PII_ENC", jobName: "Customer Master - PII Encryption", domain: "Customer" },
      { jobId: "CUST_NAME_STD", jobName: "Customer Names - Standardization", domain: "Customer" },
      { jobId: "CUST_ID_TOK", jobName: "Customer Identifiers - Tokenization", domain: "Customer" },
      { jobId: "CUST_EMAIL_VAL", jobName: "Customer Email - Validation", domain: "Customer" },
      { jobId: "CUST_MDM_DEDUP", jobName: "Customer Master - Deduplication", domain: "Customer" },
      { jobId: "CUST_SCD2_FINAL", jobName: "Customer Master - SCD2", domain: "Customer" },
    ];

    for (const job of customerJobs) {
      try {
        console.log(`[Orchestrator] Executing ${job.jobName}...`);
        const result = await this.client.executeJobWithRetry(
          job.jobId,
          job.jobName,
          job.domain,
          parameters
        );
        jobResults.push(result);

        if (result.status !== "SUCCESS") {
          errors.push(`${job.jobName}: ${result.status} - ${result.errorMessage}`);
        }
      } catch (error) {
        errors.push(`${job.jobName}: ${(error as Error).message}`);
      }
    }

    const completionTime = new Date();

    return {
      orchestratorId: orchestratorId,
      status: errors.length === 0 ? "SUCCESS" : "FAILED",
      startTime: startTime,
      completionTime: completionTime,
      jobResults: jobResults,
      errors: errors,
    };
  }

  /**
   * Execute deposits domain pipeline
   */
  async executeDepositsDomainPipeline(parameters?: Record<string, unknown>): Promise<{
    orchestratorId: string;
    status: string;
    startTime: Date;
    completionTime?: Date;
    jobResults: MatillionJobExecution[];
    errors: string[];
  }> {
    const orchestratorId = `DEP_ORCH_${Date.now()}`;
    const jobResults: MatillionJobExecution[] = [];
    const errors: string[] = [];
    const startTime = new Date();

    const depositsJobs = [
      { jobId: "DEP_ACCT_STD", jobName: "Deposit Accounts - Standardization", domain: "Deposits" },
      { jobId: "DEP_ACCT_NORM", jobName: "Deposit Accounts - Normalization", domain: "Deposits" },
      { jobId: "DEP_BAL_DAILY", jobName: "Deposit Balances - Daily", domain: "Deposits" },
      { jobId: "DEP_TXN_ENRICH", jobName: "Deposit Transactions - Enrichment", domain: "Deposits" },
      { jobId: "DEP_SCD2_FINAL", jobName: "Deposit Account Master - SCD2", domain: "Deposits" },
    ];

    for (const job of depositsJobs) {
      try {
        console.log(`[Orchestrator] Executing ${job.jobName}...`);
        const result = await this.client.executeJobWithRetry(
          job.jobId,
          job.jobName,
          job.domain,
          parameters
        );
        jobResults.push(result);

        if (result.status !== "SUCCESS") {
          errors.push(`${job.jobName}: ${result.status} - ${result.errorMessage}`);
        }
      } catch (error) {
        errors.push(`${job.jobName}: ${(error as Error).message}`);
      }
    }

    const completionTime = new Date();

    return {
      orchestratorId: orchestratorId,
      status: errors.length === 0 ? "SUCCESS" : "FAILED",
      startTime: startTime,
      completionTime: completionTime,
      jobResults: jobResults,
      errors: errors,
    };
  }
}

export default MatillionAPIClient;
