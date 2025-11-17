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
import { getPilotDomainById } from "@/lib/domains/registry";
import { getIngestionJobsByDomain } from "@/lib/operations/fis-data-ingestion";
import { getFISTablesByDomain } from "@/lib/operations/fis-source-schema";
import {
  ArrowLeft,
  Code,
  FileCode,
  BookOpen,
  Zap,
  CheckCircle,
  Database,
} from "lucide-react";

const CODE_EXAMPLES = {
  fis: `-- FIS Source Table: Customer Master
-- Direct ingestion from Fiserv core banking system
-- Real-time CDC with daily batch backup

SELECT
  CUSTOMER_ID,
  CUSTOMER_TYPE,
  FIRST_NAME,
  LAST_NAME,
  EMAIL_ADDRESS,
  CUSTOMER_STATUS,
  CUSTOMER_SEGMENT,
  CREATED_DATE,
  LAST_MODIFIED_DATE
FROM DBO.CUSTOMER
WHERE LAST_MODIFIED_DATE >= DATEADD(DAY, -1, CAST(GETDATE() AS DATE))
ORDER BY CUSTOMER_ID
`,

  sql: `-- Transform Bronze to Silver: Customer Profile
-- Combine customer master, contact, and relationship data

CREATE OR REPLACE VIEW SILVER.CUSTOMER_PROFILE AS
SELECT
  c.CUSTOMER_ID,
  c.CUSTOMER_TYPE,
  CONCAT(c.FIRST_NAME, ' ', c.LAST_NAME) AS CUSTOMER_NAME,
  cc.EMAIL_ADDRESS,
  cc.PHONE_NUMBER,
  c.CUSTOMER_SEGMENT,
  c.RISK_RATING,
  cr.LIFETIME_VALUE_USD,
  c.CREATED_DATE,
  c.LAST_MODIFIED_DATE
FROM bronze.customer c
LEFT JOIN bronze.customer_contact cc ON c.CUSTOMER_ID = cc.CUSTOMER_ID
LEFT JOIN bronze.customer_relationship cr ON c.CUSTOMER_ID = cr.CUSTOMER_ID
WHERE c.CUSTOMER_STATUS != 'CLOSED'
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

export default function PlatformBlueprintDomainOperations() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const domain = getPilotDomainById(domainId || "");
  const jobs = getIngestionJobsByDomain(domainId || "");
  const tables = getFISTablesByDomain(domainId || "");
  const realTimeJobs = jobs.filter((j) => j.schedule.frequency === "Real-time");

  if (!domain) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-4">
          Domain not found
        </p>
        <Button onClick={() => navigate("/platform-blueprint/domains")}>
          Back to Domains
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/platform-blueprint/domain/${domainId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Operations</h1>
          <p className="text-muted-foreground mt-1">
            FIS data ingestion, mappings, and operational guides for {domain.displayName}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              FIS Source Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tables.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Core source tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Ingestion Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jobs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{realTimeJobs.length} real-time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tables.reduce((sum, t) => sum + t.columns.length, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Mapped source attributes</p>
          </CardContent>
        </Card>
      </div>

      {/* Code Generation & Documentation */}
      <Tabs defaultValue="fis" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fis" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">FIS Source</span>
          </TabsTrigger>
          <TabsTrigger value="sql" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">SQL</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Setup</span>
          </TabsTrigger>
        </TabsList>

        {/* FIS Source Tab */}
        <TabsContent value="fis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FIS Source Tables</CardTitle>
              <CardDescription>
                Real FIS core banking system tables for {domain.displayName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {tables.map((table) => (
                  <div key={table.tableName} className="border rounded-lg p-3">
                    <p className="font-semibold text-sm">{table.tableName}</p>
                    <p className="text-xs text-muted-foreground mb-2">{table.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Records:</span> {table.recordEstimate}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Refresh:</span> {table.refreshFrequency}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Key:</span> {table.businessKey}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Columns:</span> {table.columns.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FIS Data Extraction Query</CardTitle>
              <CardDescription>
                Sample CDC/incremental load query from FIS source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed">
                <pre>{CODE_EXAMPLES.fis}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingestion Job Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div key={job.jobId} className="border rounded p-2 text-sm">
                    <p className="font-semibold">{job.jobName}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.sourceTable} → {job.targetSchema} | {job.schedule.frequency}
                      {job.schedule.time ? ` at ${job.schedule.time}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQL Tab */}
        <TabsContent value="sql" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Silver Layer Transformation</CardTitle>
              <CardDescription>
                Transform FIS raw data to business-ready format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed">
                <pre>{CODE_EXAMPLES.sql}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Transformation Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Bronze to Silver Mappings</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cleanse and standardize FIS column names</li>
                  <li>• Map FIS codes to business-friendly values</li>
                  <li>• Add audit columns (_load_timestamp, _source_system)</li>
                  <li>• Implement slowly changing dimensions (SCD2)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Guide Tab */}
        <TabsContent value="guide" className="space-y-4">
          {RUNBOOK_SECTIONS.map((section, idx) => (
            <Card key={`section-${idx}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {idx + 1}
                  </span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {section.steps.map((step, stepIdx) => (
                    <li key={`step-${idx}-${stepIdx}`} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common operational tasks and commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="font-semibold text-sm mb-2">Validate FIS Connection</p>
              <code className="block bg-gray-50 p-2 rounded text-xs font-mono">
                SELECT COUNT(*) FROM DBO.CUSTOMER
              </code>
            </div>
            <div className="border rounded-lg p-4">
              <p className="font-semibold text-sm mb-2">Check Ingestion Status</p>
              <code className="block bg-gray-50 p-2 rounded text-xs font-mono">
                SELECT * FROM control.fis_ingestion_log
              </code>
            </div>
            <div className="border rounded-lg p-4">
              <p className="font-semibold text-sm mb-2">Run Full Refresh</p>
              <code className="block bg-gray-50 p-2 rounded text-xs font-mono">
                EXECUTE FIS_INGEST_DOMAIN @domainId='customer'
              </code>
            </div>
            <div className="border rounded-lg p-4">
              <p className="font-semibold text-sm mb-2">Monitor Data Quality</p>
              <code className="block bg-gray-50 p-2 rounded text-xs font-mono">
                SELECT * FROM quality.data_validation_results
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
