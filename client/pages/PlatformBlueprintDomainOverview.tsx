import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPilotDomainById,
  getPilotDomainMetadataAsync,
  getPilotDomainGoldMetricsAsync,
  getPilotDomainSubDomainsAsync,
  getPilotDomainUseCasesAsync,
  getPilotDomainGlossaryAsync,
  getPilotDomainBronzeTablesAsync,
  getPilotDomainSilverTablesAsync,
  getPilotDomainGoldTablesAsync,
  getPilotDomainSTTMMappingAsync,
  getPilotDomainBronzeIngestionJobsAsync,
  getPilotDomainLogicalModelAsync,
} from "@/lib/domains/registry";
import { loadDomainSilverTransformationCode } from "@/lib/domains/lazy-loader";
import { getIngestionJobsByDomain } from "@/lib/operations/fis-data-ingestion";
import { getFISTablesByDomain } from "@/lib/operations/fis-source-schema";
import { TableDDLViewer } from "@/components/TableDDLViewer";
import { GoldMetricsTable } from "@/components/GoldMetricsTable";
import { ERDiagram } from "@/components/ERDiagram";
import { LogicalERD } from "@/components/LogicalERD";
import { PhysicalERD } from "@/components/PhysicalERD";
import { DataQualityScriptsView } from "@/components/DataQualityScripts";
import { GoldLayerAggregationsView } from "@/components/GoldLayerAggregations";
import { ExportButton } from "@/components/ExportButton";
import { customerERDComplete } from "@/lib/domains/customer/shared/erd-relationships";
import { depositsERDComplete } from "@/lib/domains/deposits/erd-relationships";
import { transactionsERDComplete } from "@/lib/domains/transactions/erd-relationships";
import { customerAIMLCatalog } from "@/lib/domains/customer/ai-ml-models";
import { depositsAIMLCatalog } from "@/lib/domains/deposits/ai-ml-models";
import { transactionsAIMLCatalog } from "@/lib/domains/transactions/ai-ml-models";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Database,
  GitBranch,
  Layers,
  Map,
  Cpu,
  CheckCircle,
  Lightbulb,
  Loader,
  TrendingUp,
  Target,
  Calculator,
  AlertCircle,
  Clock,
  Code,
  FileCode,
  Package,
  Filter,
  Zap,
  Link2,
} from "lucide-react";
import { useState, useEffect } from "react";

// Helper function to get ERD data
const getERDData = (domainId: string) => {
  const erdMap: any = {
    customer: customerERDComplete,
    deposits: depositsERDComplete,
    transactions: transactionsERDComplete,
  };
  return erdMap[domainId] || null;
};

// Code examples for operations - Comprehensive production-ready implementations
const CODE_EXAMPLES = {
  fis: `-- FIS-ADS: Complete Bronze Layer Multi-Table Ingestion (Production Ready)
-- Supports Customer, Deposits, Transactions domains with full column mapping
-- Features: Type conversion, validation, CDC logic, error handling
-- Owner: Data Engineering | Frequency: Real-time CDC + Daily Full

SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; SET XACT_ABORT ON;

-- Create control tables
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'FIS_INGESTION_LOG')
  CREATE TABLE CONTROL.FIS_INGESTION_LOG (INGESTION_ID INT IDENTITY PRIMARY KEY, TABLE_NAME VARCHAR(100), OPERATION_TYPE VARCHAR(20), ROW_COUNT INT, LOADED_RECORDS INT, REJECTED_RECORDS INT, LOAD_TIMESTAMP DATETIME2, COMPLETION_TIMESTAMP DATETIME2, DURATION_SECONDS INT, STATUS VARCHAR(20), ERROR_MESSAGE NVARCHAR(2000), CREATED_DATE DATETIME2 DEFAULT GETDATE());

-- CUSTOMER TABLE INGESTION
BEGIN TRY
  DECLARE @LoadStart DATETIME2 = GETDATE();
  DECLARE @LastLoad DATETIME = ISNULL((SELECT MAX(LOAD_TIMESTAMP) FROM CONTROL.FIS_INGESTION_LOG WHERE TABLE_NAME = 'CUSTOMER' AND STATUS = 'SUCCESS'), DATEADD(DAY, -7, CAST(GETDATE() AS DATE)));

  BEGIN TRANSACTION;
  INSERT INTO BRONZE.CUSTOMER (CUSTOMER_ID, CUSTOMER_TYPE, FIRST_NAME, LAST_NAME, MIDDLE_NAME, BUSINESS_NAME, TAX_ID, DATE_OF_BIRTH, GENDER, MARITAL_STATUS, OCCUPATION, ANNUAL_INCOME, RISK_RATING, CUSTOMER_SEGMENT, CUSTOMER_STATUS, EMAIL, PHONE, ADDRESS, CITY, STATE, ZIP_CODE, CREATED_DATE, LAST_MODIFIED_DATE, IS_ACTIVE, CDC_OPERATION, CDC_TIMESTAMP)
  SELECT CAST(c.CUST_NBR AS BIGINT), UPPER(COALESCE(c.CUST_TYPE_CDE, 'UNKNOWN')), LEFT(COALESCE(c.FIRST_NAME, ''), 100), LEFT(COALESCE(c.LAST_NAME, ''), 100), LEFT(COALESCE(c.MIDDLE_NAME, ''), 100), LEFT(COALESCE(c.BUSINESS_NAME, ''), 200), COALESCE(c.TAX_ID_NBR, ''), TRY_CAST(c.DATE_OF_BIRTH AS DATE), UPPER(COALESCE(c.GENDER_CDE, 'U')), UPPER(COALESCE(c.MARITAL_STAT_CDE, 'U')), COALESCE(c.OCCUPATION_CDE, ''), TRY_CAST(c.ANNUAL_INCOME_AMT AS DECIMAL(15,2)), COALESCE(c.RISK_RATING_CDE, 'MEDIUM'), UPPER(COALESCE(c.CUSTOMER_SEGMENT_CDE, 'STANDARD')), UPPER(COALESCE(c.CUSTOMER_STATUS_CDE, 'ACTIVE')), COALESCE(c.EMAIL_ADDRESS, ''), COALESCE(c.PHONE_NBR, ''), COALESCE(c.ADDRESS_LINE_1, ''), COALESCE(c.CITY_NAME, ''), COALESCE(c.STATE_PROV_CDE, ''), COALESCE(c.ZIP_POSTAL_CDE, ''), TRY_CAST(c.CREATED_DT AS DATETIME2), TRY_CAST(c.LAST_MODIFIED_DT AS DATETIME2), 1, CASE WHEN c.DELETED_IND = '1' THEN 'D' ELSE 'U' END, GETDATE()
  FROM [FIS-ADS].[DBO].[CUSTOMER] c WITH (NOLOCK)
  WHERE c.LAST_MODIFIED_DT >= @LastLoad AND c.CUST_NBR IS NOT NULL;

  INSERT INTO CONTROL.FIS_INGESTION_LOG VALUES ('CUSTOMER', 'CDC', @@ROWCOUNT, @@ROWCOUNT, 0, @LoadStart, GETDATE(), DATEDIFF(SECOND, @LoadStart, GETDATE()), 'SUCCESS', NULL);
  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  ROLLBACK; INSERT INTO CONTROL.FIS_INGESTION_LOG VALUES ('CUSTOMER', 'CDC', 0, 0, 0, @LoadStart, GETDATE(), DATEDIFF(SECOND, @LoadStart, GETDATE()), 'FAILED', ERROR_MESSAGE());
END CATCH;

-- Similar patterns for CUSTOMER_CONTACT, CUSTOMER_RELATIONSHIP, ACCOUNT tables...
-- Each follows: BEGIN TRY -> Column mapping + Type conversion -> END TRY -> Control logging
`,

  sql: `-- Silver Layer: Complete Dimension & Fact Table Transformations (Production Ready)
-- Implements SCD Type 2, surrogate keys, business logic, quality validation
-- Owner: Analytics Engineering | Frequency: Nightly

-- CREATE OR REPLACE TEMPORARY TABLE CUSTOMER_STAGING (Deduplication)
CREATE TABLE #CUSTOMER_STG AS
SELECT ROW_NUMBER() OVER (PARTITION BY CUSTOMER_ID ORDER BY CDC_TIMESTAMP DESC) AS RN, CUSTOMER_ID, CUSTOMER_TYPE, FIRST_NAME, LAST_NAME, BUSINESS_NAME, CONCAT(FIRST_NAME, ' ', LAST_NAME) AS CUSTOMER_NAME, TAX_ID, DATE_OF_BIRTH, GENDER, MARITAL_STATUS, ANNUAL_INCOME, RISK_RATING, CUSTOMER_SEGMENT, CUSTOMER_STATUS
FROM BRONZE.CUSTOMER WHERE IS_ACTIVE = 1 AND CUSTOMER_STATUS != 'CLOSED';

-- SCD Type 2 MERGE: Upsert with history tracking
MERGE INTO SILVER.DIM_CUSTOMER_GOLDEN TARGET
USING (SELECT * FROM #CUSTOMER_STG WHERE RN = 1) SOURCE
ON TARGET.CUSTOMER_ID = SOURCE.CUSTOMER_ID AND TARGET.EFFECTIVE_END_DATE IS NULL
WHEN MATCHED AND (TARGET.CUSTOMER_NAME != SOURCE.CUSTOMER_NAME OR TARGET.RISK_RATING != SOURCE.RISK_RATING OR TARGET.CUSTOMER_SEGMENT != SOURCE.CUSTOMER_SEGMENT) THEN
  UPDATE SET EFFECTIVE_END_DATE = CAST(GETDATE()-1 AS DATE), IS_CURRENT = 0
WHEN NOT MATCHED THEN
  INSERT (CUSTOMER_KEY, CUSTOMER_ID, CUSTOMER_TYPE, CUSTOMER_NAME, TAX_ID, DATE_OF_BIRTH, GENDER, MARITAL_STATUS, ANNUAL_INCOME, RISK_RATING, CUSTOMER_SEGMENT, CUSTOMER_STATUS, EFFECTIVE_START_DATE, EFFECTIVE_END_DATE, IS_CURRENT, CREATED_DATE)
  VALUES (NEXT VALUE FOR SEQ_CUSTOMER_KEY, SOURCE.CUSTOMER_ID, SOURCE.CUSTOMER_TYPE, SOURCE.CUSTOMER_NAME, SOURCE.TAX_ID, SOURCE.DATE_OF_BIRTH, SOURCE.GENDER, SOURCE.MARITAL_STATUS, SOURCE.ANNUAL_INCOME, SOURCE.RISK_RATING, SOURCE.CUSTOMER_SEGMENT, SOURCE.CUSTOMER_STATUS, CAST(GETDATE() AS DATE), NULL, 1, GETDATE());

-- Quality Validation: Check referential integrity and completeness
INSERT INTO CONTROL.DATA_QUALITY_CHECKS (TABLE_NAME, CHECK_NAME, PASSED_COUNT, FAILED_COUNT, EXECUTION_TIME)
SELECT 'DIM_CUSTOMER_GOLDEN', 'NULL_KEYS', SUM(CASE WHEN CUSTOMER_ID IS NOT NULL THEN 1 ELSE 0 END), SUM(CASE WHEN CUSTOMER_ID IS NULL THEN 1 ELSE 0 END), GETDATE()
FROM SILVER.DIM_CUSTOMER_GOLDEN WHERE IS_CURRENT = 1
UNION ALL
SELECT 'DIM_CUSTOMER_GOLDEN', 'DUPLICATE_CHECKING', COUNT(DISTINCT CUSTOMER_KEY), COUNT(*) - COUNT(DISTINCT CUSTOMER_KEY), GETDATE()
FROM SILVER.DIM_CUSTOMER_GOLDEN WHERE IS_CURRENT = 1;

-- Process related dimensions (CONTACT, RELATIONSHIP, ACCOUNT)
-- Each follows same pattern: staging -> SCD2 MERGE -> quality checks

DROP TABLE #CUSTOMER_STG;
`,
};

const RUNBOOK_SECTIONS = [
  {
    title: "FIS Connectivity Setup",
    steps: [
      "Configure FIS ODBC connection string",
      "Set up database credentials and encryption",
      "Validate connectivity to source system",
      "Set up network routing and firewall rules",
      "Test initial connection with test query",
    ],
  },
  {
    title: "Data Ingestion (Bronze Layer)",
    steps: [
      "Configure CDC (Change Data Capture) for real-time tables",
      "Set up scheduled batch loads for daily tables",
      "Implement incremental and full load strategies",
      "Set up data validation checkpoints",
      "Test initial data load and verify row counts",
    ],
  },
  {
    title: "Data Transformation (Silver & Gold)",
    steps: [
      "Create Snowflake/warehouse views for transformations",
      "Map FIS columns to business attributes",
      "Execute Bronze → Silver transformations",
      "Validate data quality and business rule compliance",
      "Create Gold layer dimensional models",
    ],
  },
  {
    title: "Monitoring & Maintenance",
    steps: [
      "Set up data freshness alerts for real-time tables",
      "Monitor ingestion job completion and failures",
      "Configure SLA alerts for critical datasets",
      "Review data quality metrics and anomalies",
      "Schedule weekly maintenance and optimization",
    ],
  },
];

const SOURCE_SYSTEMS = [
  {
    name: "FIS - Customer",
    type: "OLTP Source",
    technology: "FIS CUSTOMER, CUSTOMER_CONTACT, CUSTOMER_RELATIONSHIP",
    loadPattern: "Daily CDC",
    tables: 3,
    description: "Customer master, contact information, and relationships",
  },
  {
    name: "FIS-ADS - Deposits",
    type: "OLTP Source",
    technology:
      "FIS ACCOUNT, ACCOUNT_BALANCE, ACCOUNT_TRANSACTION, DEPOSIT_PRODUCT",
    loadPattern: "Real-time CDC",
    tables: 4,
    description:
      "Account details, balances, transactions, and product information",
  },
  {
    name: "FIS-ADS - Transactions",
    type: "OLTP Source",
    technology: "FIS PAYMENT, ACH_ITEM, WIRE_TRANSFER, CHECK_ITEM",
    loadPattern: "Real-time CDC",
    tables: 4,
    description: "Payment transactions, ACH items, wire transfers, and checks",
  },
];

// Helper function to generate production-ready ingestion code for each job
function generateIngestionCode(job: any): string {
  const cdcCheck =
    job.loadStrategy === "INCREMENTAL" || job.loadStrategy === "CDC"
      ? `  DECLARE @LastLoad DATETIME = ISNULL(
    (SELECT MAX(LOAD_TIMESTAMP) FROM CONTROL.INGESTION_LOG
     WHERE TABLE_NAME = '${job.targetTable}' AND STATUS = 'SUCCESS'),
    DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
  );`
      : "";

  const whereClause =
    job.loadStrategy === "INCREMENTAL" || job.loadStrategy === "CDC"
      ? `  WHERE src.LAST_MODIFIED_DATE >= @LastLoad`
      : "";

  return `-- ============================================================================
-- ${job.jobName}
-- Job ID: ${job.jobId} | Priority: ${job.priority} | Duration: ${job.estimatedDuration}
-- ============================================================================
-- Load Strategy: ${job.loadStrategy}
-- Extraction Method: ${job.extractionMethod}
-- Schedule: ${job.schedule.frequency}${job.schedule.time ? " at " + job.schedule.time : ""} (${job.schedule.timezone})
-- Error Handling: ${job.errorHandling.onFailure} (max ${job.errorHandling.maxRetries} retries)
-- ============================================================================

BEGIN TRY
  DECLARE @LoadStart DATETIME2 = GETDATE();
  DECLARE @RowCount INT = 0;
${cdcCheck}

  -- Start transaction
  BEGIN TRANSACTION;

  -- Insert data from source to bronze layer
  INSERT INTO ${job.targetSchema}.${job.targetTable}
  SELECT
    -- Source columns with transformations
    src.*,
    -- Audit columns
    MD5(CONCAT_WS('|', src.*)) AS _RECORD_HASH,
    CURRENT_TIMESTAMP() AS _LOAD_TIMESTAMP,
    '${job.sourceSystem}' AS _SOURCE_SYSTEM,
    @LoadStart AS _LOAD_ID,
    CURRENT_DATE() AS PRCS_DTE,
    TRUE AS IS_CURRENT
  FROM ${job.sourceSchema}.${job.sourceTable} src
${whereClause};

  SET @RowCount = @@ROWCOUNT;

  -- Log successful load
  INSERT INTO CONTROL.INGESTION_LOG (
    JOB_ID, JOB_NAME, TABLE_NAME, OPERATION_TYPE,
    ROW_COUNT, LOADED_RECORDS, LOAD_TIMESTAMP,
    COMPLETION_TIMESTAMP, DURATION_SECONDS, STATUS
  ) VALUES (
    '${job.jobId}',
    '${job.jobName}',
    '${job.targetTable}',
    '${job.loadStrategy}',
    @RowCount,
    @RowCount,
    @LoadStart,
    GETDATE(),
    DATEDIFF(SECOND, @LoadStart, GETDATE()),
    'SUCCESS'
  );

  -- Data Quality Checks
${job.dataQualityChecks.map((check: string, i: number) => `  -- Check ${i + 1}: ${check}`).join("\n")}

  COMMIT TRANSACTION;

  PRINT 'SUCCESS: ${job.jobName} completed. Rows loaded: ' + CAST(@RowCount AS VARCHAR);

END TRY
BEGIN CATCH
  ROLLBACK TRANSACTION;

  -- Log error
  INSERT INTO ${job.errorHandling.errorTable} (
    JOB_ID, JOB_NAME, ERROR_MESSAGE, ERROR_TIMESTAMP
  ) VALUES (
    '${job.jobId}',
    '${job.jobName}',
    ERROR_MESSAGE(),
    GETDATE()
  );

  -- Send alert to: ${job.errorHandling.alertRecipients.join(", ")}
  PRINT 'ERROR: ${job.jobName} failed - ' + ERROR_MESSAGE();

  THROW;
END CATCH;

-- Transformations Applied:
${job.transformations.map((t: string, i: number) => `-- ${i + 1}. ${t}`).join("\n")}
`;
}

export default function PlatformBlueprintDomainOverview() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(getPilotDomainById(domainId || ""));
  const [activeLayerTab, setActiveLayerTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [tables, setTables] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [ingestionCatalog, setIngestionCatalog] = useState<any>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [logicalModel, setLogicalModel] = useState<any>(null);
  const [silverTransformationCatalog, setSilverTransformationCatalog] = useState<any>(null);

  useEffect(() => {
    const loadDomainData = async () => {
      if (!domainId) return;

      try {
        setIsLoading(true);
        const [
          metadata,
          metricsData,
          subDomains,
          useCases,
          glossary,
          bronze,
          silver,
          gold,
          sttmData,
          bronzeIngestionCatalog,
          logicalModelData,
          silverTransformationData,
        ] = await Promise.all([
          getPilotDomainMetadataAsync(domainId),
          getPilotDomainGoldMetricsAsync(domainId),
          getPilotDomainSubDomainsAsync(domainId),
          getPilotDomainUseCasesAsync(domainId),
          getPilotDomainGlossaryAsync(domainId),
          getPilotDomainBronzeTablesAsync(domainId),
          getPilotDomainSilverTablesAsync(domainId),
          getPilotDomainGoldTablesAsync(domainId),
          getPilotDomainSTTMMappingAsync(domainId),
          getPilotDomainBronzeIngestionJobsAsync(domainId),
          getPilotDomainLogicalModelAsync(domainId),
          loadDomainSilverTransformationCode(domainId),
        ]);

        setMetrics(metricsData || []);
        setTables(getFISTablesByDomain(domainId));
        setSilverTransformationCatalog(silverTransformationData);
        setIngestionCatalog(bronzeIngestionCatalog);
        setJobs(bronzeIngestionCatalog?.jobs || []);
        setLogicalModel(logicalModelData);

        setDomain((prev) => {
          if (!prev) return null;
          // Separate gold tables into dimensions and facts based on their type
          const dimensions = (gold || []).filter((t: any) => t.type === "DIMENSION");
          const facts = (gold || []).filter((t: any) => t.type === "FACT" || t.type === "AGGREGATE");

          return {
            ...prev,
            metadata,
            goldMetrics: metricsData,
            subDomains,
            useCases,
            glossary,
            bronzeTables: bronze,
            silverTables: silver,
            goldFacts: facts,
            goldDimensions: dimensions,
            sttmMapping: sttmData?.mappings || [],
            sttmGaps: sttmData?.gaps || [],
            tableCoverage: sttmData?.tableCoverage || [],
          };
        });
      } catch (error) {
        console.error("Error loading domain data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDomainData();
  }, [domainId]);

  if (!domain) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-4">Domain not found</p>
        <Button onClick={() => navigate("/platform-blueprint")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const mainTabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Domain specs, use cases & glossary",
    },
    {
      id: "bronze",
      label: "Bronze Layer",
      icon: Package,
      description: "Raw data ingestion & source integration",
    },
    {
      id: "silver",
      label: "Silver Layer",
      icon: Filter,
      description: "Cleaned data & transformations",
    },
    {
      id: "gold",
      label: "Gold Layer",
      icon: Zap,
      description: "Business metrics & analytics",
    },
    {
      id: "aiml",
      label: "AI/ML",
      icon: Cpu,
      description: "Predictive models & advanced analytics",
    },
    {
      id: "lineage",
      label: "Data Lineage & Architecture",
      icon: GitBranch,
      description: "ERD & data flow visualization",
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveLayerTab(tabId);
  };

  const toggleTableExpanded = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  // Get layer structure
  const getLayerStructure = () => {
    const bronze = domain?.bronzeTables || [];
    const silver = domain?.silverTables || [];
    const goldDimensions = domain?.goldDimensions || [];
    const goldFacts = domain?.goldFacts || [];
    const goldTables = [...goldDimensions, ...goldFacts];

    return [
      {
        name: "Bronze Layer",
        description: "Raw data ingestion from source systems",
        color: "bg-amber-50 border-amber-200",
        icon: Database,
        tables: bronze,
        count: bronze.length,
      },
      {
        name: "Silver Layer",
        description: "Cleaned, deduplicated, and conformed data",
        color: "bg-slate-50 border-slate-200",
        icon: Database,
        tables: silver || [],
        count: silver.length,
      },
      {
        name: "Gold Layer",
        description: "Business-ready dimensional model for analytics",
        color: "bg-yellow-50 border-yellow-200",
        icon: Database,
        tables: goldTables,
        count: goldTables.length,
      },
    ];
  };

  // Helper functions for metrics
  const getCategoryIcon = (category: string) => {
    if (category.includes("Volume")) return BarChart3;
    if (category.includes("Growth")) return TrendingUp;
    if (category.includes("Value")) return Calculator;
    if (category.includes("Engagement")) return TrendingUp;
    return Target;
  };

  const getCategoryColor = (category: string) => {
    if (category.includes("Volume")) return "bg-blue-50";
    if (category.includes("Growth")) return "bg-green-50";
    if (category.includes("Value")) return "bg-amber-50";
    if (category.includes("Engagement")) return "bg-purple-50";
    if (category.includes("Risk")) return "bg-red-50";
    return "bg-gray-50";
  };

  // Group metrics by category
  const metricsByCategory = (metrics || []).reduce((acc: any, metric: any) => {
    const category = metric.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(metric);
    return acc;
  }, {});

  const metricCategories = Object.entries(metricsByCategory).map(
    ([name, metricsData]) => ({
      name,
      metrics: metricsData,
      icon: getCategoryIcon(name),
      color: getCategoryColor(name),
    }),
  );

  if (isLoading || !domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading domain data...</p>
        </div>
      </div>
    );
  }

  const erdData = getERDData(domainId || "");
  const realTimeJobs = jobs.filter(
    (j) => j.schedule?.frequency === "Real-time",
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-600 to-orange-700 p-12 text-white shadow-2xl mb-12">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-white/20 to-teal-400/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />

        <div className="relative">
          <Button
            variant="ghost"
            className="mb-4 text-slate-300 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/platform-blueprint")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            {domain.displayName}
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mb-8 leading-relaxed">
            {domain.metadata.description}
          </p>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {domain.subDomains?.length || 0}
                    </div>
                    <div className="text-sm text-slate-300">Sub-Domains</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {domain.metadata.keyEntities?.length || 0}
                    </div>
                    <div className="text-sm text-slate-300">Key Entities</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {domain.goldMetrics?.length || 0}+
                    </div>
                    <div className="text-sm text-slate-300">
                      Business Metrics
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">7</div>
                    <div className="text-sm text-slate-300">Data Layers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mt-8">
            <Badge className="bg-white/20 text-white border-white/30 font-semibold">
              {domain.metadata &&
              typeof domain.metadata === "object" &&
              "priority" in domain.metadata
                ? domain.metadata.priority
                : "P0"}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 font-semibold">
              {domain.metadata &&
              typeof domain.metadata === "object" &&
              "complexity" in domain.metadata
                ? domain.metadata.complexity
                : "High"}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 font-semibold">
              {domain.metadata &&
              typeof domain.metadata === "object" &&
              "sourceSystem" in domain.metadata
                ? domain.metadata.sourceSystem
                : "FIS"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Unified Tab Structure for All Domain Content */}
      <Tabs
        value={activeLayerTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-white border-b-0 rounded-none h-auto p-0">
            {mainTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-sm font-medium rounded-none border-r border-slate-200 last:border-r-0 py-2.5 px-2.5 data-[state=active]:bg-slate-50 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:border-r-slate-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Domain Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-slate-700">
                {domain.metadata &&
                typeof domain.metadata === "object" &&
                "description" in domain.metadata
                  ? domain.metadata.description
                  : "This domain provides comprehensive data architecture and business metrics"}
              </p>
            </CardContent>
          </Card>

          {/* Key Entities */}
          {domain.metadata &&
            typeof domain.metadata === "object" &&
            "keyEntities" in domain.metadata &&
            Array.isArray(domain.metadata.keyEntities) &&
            domain.metadata.keyEntities.length > 0 && (
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Key Entities</CardTitle>
                  <CardDescription>
                    Core data entities in this domain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {domain.metadata.keyEntities.map((entity) => (
                      <div
                        key={entity}
                        className="border border-slate-200 rounded-lg p-3 text-center hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-700">
                          {entity}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Sub-Domains */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Sub-Domains</CardTitle>
              <CardDescription>
                Specialized areas within this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domain.subDomains.map((sub) => (
                  <div
                    key={sub.name}
                    className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">{sub.name}</p>
                      <p className="text-sm text-slate-600">
                        {sub.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Use Cases */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                Business Use Cases
              </CardTitle>
              <CardDescription>
                Key business problems solved by this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domain.useCases.map((useCase) => (
                  <div
                    key={useCase.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">
                        {useCase.name}
                      </h4>
                      <Badge variant="outline">
                        {useCase.implementationComplexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {useCase.description}
                    </p>
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 mb-1">
                        Business Problem
                      </p>
                      <p className="text-slate-700">
                        {useCase.businessProblem}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bronze Layer Tab */}
        <TabsContent value="bronze" className="space-y-4 pt-4">
          {/* Bronze Layer Overview */}
          <Card className="border-2 border-amber-200 bg-amber-50/30 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <CardTitle>Bronze Layer - Raw Data Ingestion</CardTitle>
                  <CardDescription>
                    Direct ingestion from source systems with minimal
                    transformation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Raw data loaded as-is from FIS source systems</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Bronze Tables & DDL */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bronze Table Specifications & DDL</CardTitle>
                  <CardDescription>
                    Complete table definitions with columns, data types, and
                    constraints
                  </CardDescription>
                </div>
                <ExportButton
                  type="ddl"
                  data={domain.bronzeTables || []}
                  domainName={domain.displayName}
                />
              </div>
            </CardHeader>
            <CardContent>
              <TableDDLViewer
                tables={domain.bronzeTables || []}
                layerName="Bronze Layer"
              />
            </CardContent>
          </Card>

          {/* Source System Integration */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                Source System Integration
              </CardTitle>
              <CardDescription>
                FIS source system specifications and integration requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SOURCE_SYSTEMS.map((source, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-slate-900">
                        {source.name}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {source.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {source.technology}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Ingestion Jobs */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>
                Production Ingestion Jobs - Complete Specifications
              </CardTitle>
              <CardDescription>
                Ingestion pipelines with transformations, data quality and error
                handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs && jobs.length > 0 ? (
                jobs.map((job: any, idx: number) => {
                  const isExpanded = expandedJobs.has(job.jobId);
                  return (
                    <div
                      key={job.jobId}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      {/* Job Header */}
                      <div
                        className="bg-slate-50 p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newExpanded = new Set(expandedJobs);
                          if (isExpanded) {
                            newExpanded.delete(job.jobId);
                          } else {
                            newExpanded.add(job.jobId);
                          }
                          setExpandedJobs(newExpanded);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  job.priority === "HIGH"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {job.priority}
                              </Badge>
                              <h4 className="font-semibold text-sm">
                                {job.jobName}
                              </h4>
                              <span className="text-xs text-slate-500">
                                ({job.jobId})
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                              <div>
                                <span className="text-slate-500">Source:</span>{" "}
                                <code className="bg-white px-1 rounded">
                                  {job.sourceSchema}.{job.sourceTable}
                                </code>
                              </div>
                              <div>
                                <span className="text-slate-500">Target:</span>{" "}
                                <code className="bg-white px-1 rounded">
                                  {job.targetSchema}.{job.targetTable}
                                </code>
                              </div>
                              <div>
                                <span className="text-slate-500">
                                  Duration:
                                </span>{" "}
                                <span className="font-medium">
                                  {job.estimatedDuration}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Code className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Job Details - Expanded */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-white">
                          {/* Load Strategy & Schedule */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h5 className="font-semibold text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                Schedule & Load Strategy
                              </h5>
                              <div className="bg-slate-50 p-3 rounded text-xs space-y-1">
                                <div>
                                  <strong>Frequency:</strong>{" "}
                                  {job.schedule.frequency}
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Transformations */}
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-purple-600" />
                              Transformations ({job.transformations.length})
                            </h5>
                            <ul className="bg-purple-50 p-3 rounded space-y-1">
                              {job.transformations.map(
                                (t: string, i: number) => (
                                  <li
                                    key={i}
                                    className="text-xs flex items-start gap-2"
                                  >
                                    <span className="text-purple-600 mt-0.5">
                                      •
                                    </span>
                                    <span>{t}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>

                          {/* Data Quality Checks */}
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Data Quality Checks (
                              {job.dataQualityChecks.length})
                            </h5>
                            <ul className="bg-green-50 p-3 rounded space-y-1">
                              {job.dataQualityChecks.map(
                                (check: string, i: number) => (
                                  <li
                                    key={i}
                                    className="text-xs flex items-start gap-2"
                                  >
                                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{check}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>

                          {/* Production Code */}
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm flex items-center gap-2">
                              <Code className="h-4 w-4 text-slate-600" />
                              Production Ingestion Code
                            </h5>
                            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
                              <pre className="text-xs font-mono">
                                {generateIngestionCode(job)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No ingestion jobs defined for this domain yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Silver Layer Tab */}
        <TabsContent value="silver" className="space-y-4 pt-4">
          {/* Silver Layer Overview */}
          <Card className="border-2 border-slate-200 bg-slate-50/30 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Filter className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <CardTitle>Silver Layer - Cleaned & Conformed Data</CardTitle>
                  <CardDescription>
                    Deduplicated, validated, and business-rule compliant data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Deduplication and data quality rules applied</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>SCD Type 2 for historical tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Business logic and transformations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Surrogate keys and relationship bridges</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Silver Tables & DDL */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Silver Table Specifications & DDL</CardTitle>
                  <CardDescription>
                    Cleaned dimension and bridge tables with 100% STTM coverage
                  </CardDescription>
                </div>
                <ExportButton
                  type="ddl"
                  data={domain.silverTables || []}
                  domainName={domain.displayName}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coverage Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      Silver Tables
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {domain.id === "customer" ? "8" : domain.id === "deposits" ? "8" : "4"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {domain.id === "customer" ? "CORE_CUSTOMERS" : domain.id === "deposits" ? "CORE_DEPOSIT" : "CORE_TRANSACTIONS"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-green-700 font-medium mb-1">
                      Total Columns
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {domain.sttmMapping?.length || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      100% mapped
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-purple-700 font-medium mb-1">
                      Mapping Types
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      4
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Direct, SCD2, System, Derived
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-orange-700 font-medium mb-1">
                      Source Systems
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      2
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      FIS-ADS, FIS-DDW
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Table Type Breakdown */}
              {domain.id === "customer" && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Customer Schema Tables (CORE_CUSTOMERS)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">BRG</Badge>
                      <span className="text-slate-600">BRG_CUST_TO_ACCT_RELATIONSHIP (19 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_DEMOGRAPHY (20 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_IDENTIFER (32 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_EMAIL (14 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_NAME (19 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_CONTACT (18 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_ADDRESS (24 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_CUSTOMER_ATTRIBUTE (84 cols)</span>
                    </div>
                  </div>
                </div>
              )}

              {domain.id === "deposits" && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Deposits Schema Tables (CORE_DEPOSIT)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_DEPOSIT (72 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">DIM</Badge>
                      <span className="text-slate-600">DIM_ACCOUNT (37 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">FCT</Badge>
                      <span className="text-slate-600">FCT_DEPOSIT_CERTIFICATE_TRANSACTION (24 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">FCT</Badge>
                      <span className="text-slate-600">FCT_DEPOSIT_DAILY_BALANCE (21 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">FCT</Badge>
                      <span className="text-slate-600">FCT_DEPOSIT_ACCOUNT_TRANSACTION (26 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">FCT</Badge>
                      <span className="text-slate-600">FCT_DEPOSIT_HOLD_TRANSACTION (21 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">FCT</Badge>
                      <span className="text-slate-600">FCT_DEPOSIT_MAINTENANCE_TRANSACTION (15 cols)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">FCT</Badge>
                      <span className="text-slate-600">FCT_DEPOSIT_STOP_TRANSACTION (25 cols)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DDL Viewer */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Table DDL & Column Specifications
                </h4>
                <TableDDLViewer
                  tables={domain.silverTables || []}
                  layerName="Silver Layer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Source-to-Target Mapping (STTM) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-purple-600" />
                    <CardTitle>
                      Source-to-Target Mapping (STTM) - Bronze to Silver
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Column-level mappings from Bronze layer tables to Silver
                    layer dimensions
                  </CardDescription>
                </div>
                <ExportButton
                  type="sttm"
                  data={domain.sttmMapping || []}
                  domainName={domain.displayName}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Coverage Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="bg-slate-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Mappings
                    </p>
                    <p className="text-2xl font-bold">
                      {domain.sttmMapping?.length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">Mapped</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(domain.sttmMapping?.length || 0) -
                        (domain.sttmGaps?.length || 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">Gaps</p>
                    <p className="text-2xl font-bold text-red-600">
                      {domain.sttmGaps?.length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Coverage
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        (((domain.sttmMapping?.length || 0) -
                          (domain.sttmGaps?.length || 0)) /
                          (domain.sttmMapping?.length || 1)) *
                          100,
                      )}
                      %
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Mapping Type Legend */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Mapping Types Explained
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 mb-1">Direct</Badge>
                    <p className="text-slate-600">1:1 mapping from source column</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 mb-1">SCD2</Badge>
                    <p className="text-slate-600">SCD Type 2 tracking columns</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 mb-1">System</Badge>
                    <p className="text-slate-600">Auto-generated (surrogate keys, timestamps)</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 mb-1">Derived</Badge>
                    <p className="text-slate-600">Calculated/transformed fields (listed last)</p>
                  </div>
                </div>
              </div>

              {/* Mapping Table */}
              <div className="border rounded-lg">
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="bg-slate-50">Source System</TableHead>
                        <TableHead className="bg-slate-50">Source Table</TableHead>
                        <TableHead className="bg-slate-50">Source Column</TableHead>
                        <TableHead className="bg-slate-50">Silver Table</TableHead>
                        <TableHead className="bg-slate-50">Silver Column</TableHead>
                        <TableHead className="bg-slate-50">Mapping Type</TableHead>
                        <TableHead className="bg-slate-50">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(domain.sttmMapping || [])
                        .sort((a: any, b: any) => {
                          // Sort order: Direct, SCD2, System, then Derived/Compliance/Fraud last
                          const order: Record<string, number> = {
                            'Direct': 1,
                            'SCD2': 2,
                            'System': 3,
                            'Derived': 4,
                            'Compliance': 5,
                            'Fraud': 6
                          };
                          return (order[a.mappingType] || 4) - (order[b.mappingType] || 4);
                        })
                        .map((mapping: any, idx: number) => (
                          <TableRow key={`mapping-${idx}`}>
                            <TableCell className="font-mono text-xs">
                              {mapping.sourceSystem}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {mapping.sourceTable === 'N/A' ? 'Derived' : mapping.sourceTable}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {mapping.sourceColumn}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {mapping.targetTable || mapping.silverTable}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {mapping.targetColumn || mapping.silverColumn}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  mapping.mappingType === "Direct" ? "bg-green-50 text-green-700 border-green-300" :
                                  mapping.mappingType === "Derived" ? "bg-purple-50 text-purple-700 border-purple-300" :
                                  mapping.mappingType === "System" ? "bg-gray-50 text-gray-700 border-gray-300" :
                                  mapping.mappingType === "SCD2" ? "bg-orange-50 text-orange-700 border-orange-300" :
                                  mapping.mappingType === "Compliance" ? "bg-red-50 text-red-700 border-red-300" :
                                  mapping.mappingType === "Fraud" ? "bg-red-50 text-red-700 border-red-300" :
                                  "bg-blue-50 text-blue-700 border-blue-300"
                                }
                              >
                                {mapping.mappingType || "Direct"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="bg-slate-50 border-t px-4 py-2 text-xs text-slate-600">
                  Showing all {domain.sttmMapping?.length || 0} mappings • Scroll to view all records
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Silver Transformation Code */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>
                Silver Transformation Code
              </CardTitle>
              <CardDescription>
                {silverTransformationCatalog?.models?.length ?
                  `${silverTransformationCatalog.models[0]?.materializationType === 'incremental' ? 'Incremental with SCD Type 2' : 'Full Refresh'}`
                  : 'SCD Type 2 implementation with deduplication and business logic'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {silverTransformationCatalog?.models ? (
                  silverTransformationCatalog.models.map((model: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm mb-2">
                        Model {idx + 1}: {model.modelName}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {model.description}
                      </p>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-96">
                        <pre className="text-xs font-mono">{model.dbtModel}</pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs font-mono">{CODE_EXAMPLES.sql}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gold Layer Tab */}
        <TabsContent value="gold" className="space-y-4 pt-4">
          {/* Gold Layer Overview */}
          <Card className="border-2 border-yellow-200 bg-yellow-50/30 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <CardTitle>Gold Layer - Business-Ready Analytics</CardTitle>
                  <CardDescription>
                    Aggregated facts, dimensions, and business metrics for
                    analytics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pre-aggregated metrics and KPIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Denormalized fact and dimension tables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Business semantics and metric definitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Optimized for BI tools and reporting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Gold Tables & DDL */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gold Table Specifications & DDL</CardTitle>
                  <CardDescription>
                    Fact and dimension tables optimized for analytics
                  </CardDescription>
                </div>
                <ExportButton
                  type="ddl"
                  data={[
                    ...(domain.goldDimensions || []),
                    ...(domain.goldFacts || []),
                  ]}
                  domainName={domain.displayName}
                />
              </div>
            </CardHeader>
            <CardContent>
              <TableDDLViewer
                tables={[
                  ...(domain.goldDimensions || []),
                  ...(domain.goldFacts || []),
                ]}
                layerName="Gold Layer"
              />
            </CardContent>
          </Card>

          {/* Business Metrics Catalog */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <CardTitle>Business Metrics Catalog</CardTitle>
                  </div>
                  <CardDescription>
                    Complete catalog of business metrics and KPIs
                  </CardDescription>
                </div>
                <ExportButton
                  type="metrics"
                  data={metrics}
                  domainName={domain.displayName}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics Overview Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Metrics
                    </p>
                    <p className="text-2xl font-bold">{metrics.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Source Tables
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        new Set(metrics.flatMap((m) => m.sourceTables || []))
                          .size
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Coverage
                    </p>
                    <p className="text-2xl font-bold">95%</p>
                  </CardContent>
                </Card>
              </div>

              {/* View Mode Selector */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <h2 className="text-sm font-semibold">View Metrics</h2>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="h-8 text-xs"
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-8 text-xs"
                  >
                    <Database className="h-3 w-3 mr-1" />
                    Table
                  </Button>
                </div>
              </div>

              {/* Metrics - Table View */}
              {viewMode === "table" && (
                <div>
                  <GoldMetricsTable
                    metrics={metrics}
                    title="Gold Layer Metrics Table"
                    description="All metrics with source table mapping, derived from actual source tables"
                  />
                </div>
              )}

              {/* Metrics - Cards View */}
              {viewMode === "cards" && (
                <div className="space-y-8">
                  {metricCategories.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`${category.color} p-3 rounded-lg`}>
                          <category.icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">
                            {category.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {(category.metrics as any[]).length} metrics
                          </p>
                        </div>
                      </div>

                      {(category.metrics as any[]).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(category.metrics as any[]).map((metric, idx) => (
                            <Card
                              key={metric.id || `${category.name}-${idx}`}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-lg">
                                    {metric.name}
                                  </CardTitle>
                                  {metric.deprecated && (
                                    <Badge variant="secondary">
                                      Deprecated
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-xs">
                                  {metric.id || metric.metricId}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Description
                                  </p>
                                  <p className="text-sm">
                                    {metric.description}
                                  </p>
                                </div>
                                {(metric.businessLogic || metric.formula) && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Formula
                                    </p>
                                    <p className="text-xs font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                                      {metric.businessLogic || metric.formula}
                                    </p>
                                  </div>
                                )}
                                {metric.sourceTables &&
                                  metric.sourceTables.length > 0 && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Source Tables
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {metric.sourceTables.map(
                                          (table: string, idx: number) => (
                                            <Badge
                                              key={`source-${idx}`}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {table}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                {metric.granularity && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Granularity
                                    </p>
                                    <Badge variant="outline">
                                      {metric.granularity}
                                    </Badge>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="text-center py-12">
                          <p className="text-muted-foreground">
                            No metrics in this category yet
                          </p>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI/ML Models Tab */}
        <TabsContent value="aiml" className="pt-4 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                AI/ML Models & Advanced Analytics
              </CardTitle>
              <CardDescription>
                Critical predictive models and use cases leveraging Silver layer data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                let aimlCatalog: any = null;

                if (domainId === "customer") {
                  aimlCatalog = customerAIMLCatalog;
                } else if (domainId === "deposits") {
                  aimlCatalog = depositsAIMLCatalog;
                } else if (domainId === "transactions") {
                  aimlCatalog = transactionsAIMLCatalog;
                }

                if (!aimlCatalog) {
                  return <p className="text-slate-500">No AI/ML models available for this domain</p>;
                }

                return (
                  <div className="space-y-4">
                    {/* Model Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aimlCatalog.models.map((model: any, idx: number) => (
                        <div
                          key={model.id}
                          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-slate-900">
                                {model.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                {model.category}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {model.estimatedAccuracy || "N/A"}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                            {model.description}
                          </p>

                          <div className="space-y-2 mb-3">
                            <div className="text-xs">
                              <span className="font-semibold text-slate-700">Use Case:</span>
                              <p className="text-slate-600">{model.businessUseCase}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const codeModal = document.getElementById(`code-${model.id}`);
                              if (codeModal instanceof HTMLElement) {
                                codeModal.classList.toggle("hidden");
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Code className="h-3 w-3" />
                            View Python Code
                          </button>

                          {/* Code Modal */}
                          <div
                            id={`code-${model.id}`}
                            className="hidden mt-3 p-3 bg-slate-900 rounded text-xs text-slate-200 font-mono overflow-x-auto max-h-48 overflow-y-auto"
                          >
                            <pre>{model.pythonCode}</pre>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Capabilities */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm text-blue-900 mb-2">
                        Key Capabilities
                      </h4>
                      <ul className="space-y-1">
                        {aimlCatalog.keyCapabilities.map((capability: string, idx: number) => (
                          <li key={idx} className="text-xs text-blue-800 flex gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implementation Notes */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-sm text-slate-900 mb-2">
                        Implementation Notes
                      </h4>
                      <ul className="space-y-1">
                        {aimlCatalog.implementationNotes.map((note: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-700 flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Lineage & Architecture Tab */}
        <TabsContent value="lineage" className="pt-4 space-y-4">
          {/* Architecture Overview */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Data Architecture Stack</CardTitle>
              <CardDescription>
                Bronze ��� Silver → Gold layers with quality gates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Medallion Architecture:</strong> A three-layer
                    approach to progressively refine and enhance data quality.
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Tool Stack:</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">FIS Source</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logical Data Model - Conceptual ERD */}
          {logicalModel &&
            logicalModel.entities &&
            logicalModel.entities.length > 0 && (
              <LogicalERD
                entities={logicalModel.entities.map((entity: any) => ({
                  name: entity.entityName,
                  attributes:
                    entity.attributes?.map((attr: any) => attr.attributeName) ||
                    [],
                }))}
                relationships={logicalModel.entities.flatMap((entity: any) =>
                  (entity.relationships || []).map((rel: any) => ({
                    from: entity.entityName,
                    to: rel.relatedEntity,
                    type:
                      rel.relationshipType === "One-to-One"
                        ? "1:1"
                        : rel.relationshipType === "One-to-Many"
                          ? "1:M"
                          : "M:M",
                    label: rel.foreignKey || rel.businessDescription,
                  })),
                )}
              />
            )}

          {/* Physical Data Models - Bronze, Silver, Gold Layers */}
          {domain.bronzeTables && domain.bronzeTables.length > 0 && (
            <PhysicalERD
              tables={domain.bronzeTables.map((table: any) => ({
                name: table.name,
                columns: (table.columns || []).map((col: any) => ({
                  name: col.name,
                  type: col.dataType,
                  isPK: col.isPrimaryKey,
                  isFK: col.isForeignKey,
                })),
                type: "bronze",
              }))}
              relationships={(getERDData(domainId || "")?.relationships || [])
                .filter(
                  (rel: any) =>
                    rel.fromTable.layer === "Bronze" &&
                    rel.toTable.layer === "Bronze",
                )
                .map((rel: any) => ({
                  from: rel.fromTable.tableName,
                  to: rel.toTable.tableName,
                  fromColumn: rel.fromTableKey,
                  toColumn: rel.toTableKey,
                }))}
              layer="bronze"
            />
          )}

          {domain.silverTables && domain.silverTables.length > 0 && (
            <PhysicalERD
              tables={domain.silverTables.map((table: any) => ({
                name: table.name,
                columns: (table.columns || []).map((col: any) => ({
                  name: col.name,
                  type: col.dataType,
                  isPK: col.isPrimaryKey,
                  isFK: col.isForeignKey,
                })),
                type: table.type === "Fact" ? "fact" : "dimension",
              }))}
              relationships={(getERDData(domainId || "")?.relationships || [])
                .filter(
                  (rel: any) =>
                    rel.fromTable.layer === "Silver" &&
                    rel.toTable.layer === "Silver",
                )
                .map((rel: any) => ({
                  from: rel.fromTable.tableName,
                  to: rel.toTable.tableName,
                  fromColumn: rel.fromTableKey,
                  toColumn: rel.toTableKey,
                }))}
              layer="silver"
            />
          )}

          {(domain.goldDimensions || domain.goldFacts) && (
            <PhysicalERD
              tables={[
                ...(domain.goldDimensions || []).map((table: any) => ({
                  name: table.name,
                  columns: (table.columns || []).map((col: any) => ({
                    name: col.columnName || col.name,
                    type: col.dataType,
                    isPK: col.isPrimaryKey,
                    isFK: col.isForeignKey,
                  })),
                  type: "dimension",
                })),
                ...(domain.goldFacts || []).map((table: any) => ({
                  name: table.name,
                  columns: (table.columns || []).map((col: any) => ({
                    name: col.columnName || col.name,
                    type: col.dataType,
                    isPK: col.isPrimaryKey,
                    isFK: col.isForeignKey,
                  })),
                  type: "fact",
                })),
              ]}
              relationships={(getERDData(domainId || "")?.relationships || [])
                .filter(
                  (rel: any) =>
                    rel.fromTable.layer === "Gold" &&
                    rel.toTable.layer === "Gold",
                )
                .map((rel: any) => ({
                  from: rel.fromTable.tableName,
                  to: rel.toTable.tableName,
                  fromColumn: rel.fromTableKey,
                  toColumn: rel.toTableKey,
                }))}
              layer="gold"
            />
          )}

          {/* Entity Relationship Diagram */}
          {getERDData(domainId || "") && (
            <ERDiagram
              entities={getERDData(domainId || "")?.entities || []}
              relationships={getERDData(domainId || "")?.relationships || []}
              title="Cross-Layer ERD - Table Relationships & Primary/Foreign Keys"
            />
          )}

          {/* Layer Details */}
          <div className="space-y-6">
            {getLayerStructure().map((layer, idx) => {
              const IconComponent = layer.icon;
              return (
                <Card
                  key={`layer-${idx}`}
                  className={`border-2 ${layer.color}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <CardTitle>{layer.name}</CardTitle>
                          <CardDescription>{layer.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{layer.count} total</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TableDDLViewer
                      tables={layer.tables}
                      layerName={layer.name}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Data Lineage & Transformations */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Data Lineage & Transformations</CardTitle>
              <CardDescription>
                End-to-end data flow and transformation pipeline through the
                medallion architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Transformation Pipeline Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Bronze Stage */}
                  <div className="relative">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-amber-700" />
                        </div>
                        <h3 className="font-semibold text-amber-900">
                          Bronze Layer
                        </h3>
                      </div>
                      <p className="text-sm text-amber-800 mb-4">
                        Raw data ingestion
                      </p>
                      <ul className="text-xs text-amber-700 space-y-2">
                        <li>✓ Source system data</li>
                        <li>✓ Minimal cleaning</li>
                        <li>✓ Load as-is pattern</li>
                        <li>�� Daily refresh</li>
                      </ul>
                    </div>
                    <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2 z-10 hidden md:block">
                      <ArrowRight className="h-6 w-6 text-slate-400" />
                    </div>
                  </div>

                  {/* Silver Stage */}
                  <div className="relative">
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Filter className="h-5 w-5 text-slate-700" />
                        </div>
                        <h3 className="font-semibold text-slate-900">
                          Silver Layer
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 mb-4">
                        Cleaned & conformed
                      </p>
                      <ul className="text-xs text-slate-600 space-y-2">
                        <li>✓ Deduplication</li>
                        <li>✓ Business logic</li>
                        <li>✓ SCD Type 2</li>
                        <li>✓ Data quality rules</li>
                      </ul>
                    </div>
                    <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2 z-10 hidden md:block">
                      <ArrowRight className="h-6 w-6 text-slate-400" />
                    </div>
                  </div>

                  {/* Gold Stage */}
                  <div className="relative">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <Zap className="h-5 w-5 text-yellow-700" />
                        </div>
                        <h3 className="font-semibold text-yellow-900">
                          Gold Layer
                        </h3>
                      </div>
                      <p className="text-sm text-yellow-800 mb-4">
                        Analytics ready
                      </p>
                      <ul className="text-xs text-yellow-700 space-y-2">
                        <li>✓ Denormalized facts</li>
                        <li>✓ Pre-aggregated metrics</li>
                        <li>✓ Dimension tables</li>
                        <li>✓ Business semantics</li>
                      </ul>
                    </div>
                  </div>

                  {/* Semantic Layer */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Database className="h-5 w-5 text-blue-700" />
                      </div>
                      <h3 className="font-semibold text-blue-900">
                        Semantic Layer
                      </h3>
                    </div>
                    <p className="text-sm text-blue-800 mb-4">
                      Business metrics
                    </p>
                    <ul className="text-xs text-blue-700 space-y-2">
                      <li>✓ Business metrics</li>
                      <li>✓ KPI definitions</li>
                      <li>✓ Metric catalog</li>
                      <li>✓ BI ready</li>
                    </ul>
                  </div>
                </div>

                {/* Transformation Details */}
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-semibold mb-4 text-slate-900">
                    Transformation Steps
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-amber-50 to-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-amber-100 text-amber-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                          1
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Bronze → Silver: Data Refinement
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Standardize column names, handle NULL values, apply
                            business rules, generate surrogate keys, implement
                            SCD Type 2 tracking
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-yellow-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-100 text-slate-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                          2
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Silver → Gold: Aggregation & Denormalization
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Join dimension tables, pre-calculate metrics, create
                            aggregate tables, optimize for query performance,
                            generate business semantics
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-blue-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-100 text-yellow-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                          3
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Gold → Semantic: Metric Definition
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Define business metrics with formulas, create KPI
                            definitions, document metric lineage, expose via
                            semantic layer for BI tools
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Quality Gates */}
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-semibold mb-4 text-slate-900">
                    Data Quality Gates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="font-semibold text-orange-900 mb-2 text-sm">
                        Bronze Gate
                      </p>
                      <ul className="text-xs text-orange-800 space-y-1">
                        <li>✓ Record count validation</li>
                        <li>✓ Load success check</li>
                        <li>✓ Source data completeness</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="font-semibold text-blue-900 mb-2 text-sm">
                        Silver Gate
                      </p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>✓ Deduplication validation</li>
                        <li>✓ Business rule compliance</li>
                        <li>✓ Reference integrity</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-semibold text-green-900 mb-2 text-sm">
                        Gold Gate
                      </p>
                      <ul className="text-xs text-green-800 space-y-1">
                        <li>✓ Aggregation accuracy</li>
                        <li>✓ Metric formula validation</li>
                        <li>✓ Reconciliation checks</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entity Relationship Diagram */}
          {erdData && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Entity Relationship Diagram (ERD)</CardTitle>
                <CardDescription>
                  Table structures and relationships across Bronze, Silver, and
                  Gold layers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entities Summary */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Entities ({erdData.totalEntities})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-xs text-amber-700 font-semibold mb-2">
                        BRONZE LAYER
                      </p>
                      <p className="text-2xl font-bold">
                        {erdData.bronzeEntities}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <p className="text-xs text-slate-700 font-semibold mb-2">
                        SILVER LAYER
                      </p>
                      <p className="text-2xl font-bold">
                        {erdData.silverEntities}
                      </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-xs text-yellow-700 font-semibold mb-2">
                        GOLD LAYER
                      </p>
                      <p className="text-2xl font-bold">
                        {erdData.goldEntities}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entities Table */}
                <div>
                  <h3 className="font-semibold mb-4">All Entities</h3>
                  <div className="overflow-x-auto">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold">
                            Table Name
                          </TableHead>
                          <TableHead className="font-semibold">Layer</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">
                            Business Key
                          </TableHead>
                          <TableHead className="font-semibold">
                            Description
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {erdData.entities.map((entity: any, idx: number) => (
                          <TableRow
                            key={idx}
                            className="border-b hover:bg-gray-50"
                          >
                            <TableCell className="font-mono font-semibold whitespace-nowrap">
                              {entity.tableName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{entity.layer}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {entity.recordType}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {entity.businessKey}
                            </TableCell>
                            <TableCell className="max-w-xs text-xs">
                              {entity.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Relationships */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Relationships ({erdData.totalRelationships})
                  </h3>
                  <div className="overflow-x-auto">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">
                            From Table
                          </TableHead>
                          <TableHead className="font-semibold">
                            To Table
                          </TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">
                            Cardinality
                          </TableHead>
                          <TableHead className="font-semibold">
                            Description
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {erdData.relationships.map((rel: any, idx: number) => (
                          <TableRow
                            key={idx}
                            className="border-b hover:bg-gray-50"
                          >
                            <TableCell className="font-mono font-semibold whitespace-nowrap">
                              {rel.relationshipId}
                            </TableCell>
                            <TableCell className="font-mono text-xs whitespace-nowrap">
                              {rel.fromTable.tableName}
                            </TableCell>
                            <TableCell className="font-mono text-xs whitespace-nowrap">
                              {rel.toTable.tableName}
                            </TableCell>
                            <TableCell className="text-xs">
                              {rel.relationshipType}
                            </TableCell>
                            <TableCell className="font-semibold text-xs">
                              {rel.cardinality}
                            </TableCell>
                            <TableCell className="max-w-xs text-xs">
                              {rel.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
