import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable, { type ColumnDef } from "@/components/DataTable";
import CodeBlock from "@/components/CodeBlock";
import {
  bronzeDepositsTables,
  bronzeAccountMasterFields,
  bronzeAccountTransactionsFields,
  bronzeAccountMasterDDL,
  bronzeSampleAccountMaster,
  silverDepositsTables,
  silverAccountMasterSourceToTarget,
  silverSCD2SQL,
  silverSampleAccountMaster,
  goldDepositsTables,
  goldDimDepositAccountColumns,
  goldFactDepositPositionsColumns,
  goldStarSchemaDDL,
  goldSampleDepositPositions,
  semanticDepositsLayer,
  keyMetricSQL,
  depositsUnifiedModelStats,
} from "@/lib/deposits-unified-model";
import {
  bronzeLayerPrinciples,
  bronzeAccountMaster,
  bronzeAccountTransactions,
  bronzeAccountBalances,
  bronzeInterestRates,
  bronzeCDMaster,
  allBronzeTables,
  bronzeLayerCatalog,
} from "@/lib/bronze-layer-comprehensive";
import {
  silverLayerPrinciples,
  silverAccountMasterGolden,
  silverTransactionMaster,
  silverDailyBalances,
  goldLayerPrinciples,
  goldDimensions,
  goldFactTransactions,
  goldFactDailyPositions,
  goldFactMonthlyAccountSummary,
  goldFactCustomerDeposits,
  goldFactProductPerformance,
  goldFactCohortAnalysis,
  goldFactRegulatoryReporting,
  goldFactMLFeatures,
  allGoldFactTables,
  silverGoldLayerCatalog,
} from "@/lib/silver-gold-enterprise";
import { exportToCSV, exportToXLSX } from "@/lib/export";
import {
  ArrowLeft,
  Database,
  GitBranch,
  Layers,
  TrendingUp,
  FileCode,
  Download,
} from "lucide-react";

export default function DepositsUnifiedModel() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<string>("architecture");

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() => navigate("/domain/deposits")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deposits Domain
        </Button>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-12 text-white">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-300/10 to-blue-500/10 blur-3xl" />

          <div className="relative">
            <Badge className="bg-blue-500 text-white font-semibold mb-4">
              Unified Data Model
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-white mb-6">
              Deposits & Funding
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mb-8 leading-relaxed">
              Enterprise-grade data model spanning{" "}
              <span className="text-cyan-300 font-bold">
                {depositsUnifiedModelStats.totalTables} tables
              </span>{" "}
              across Bronze, Silver, Gold, and Semantic layers with
              comprehensive DDL, sample data, and metric definitions.
            </p>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                <div className="text-3xl font-bold">
                  {bronzeLayerCatalog.totalTables}
                </div>
                <div className="text-sm text-blue-200">Bronze Tables</div>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                <div className="text-3xl font-bold">
                  {silverGoldLayerCatalog.silverTables}
                </div>
                <div className="text-sm text-blue-200">Silver Tables</div>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                <div className="text-3xl font-bold">
                  {silverGoldLayerCatalog.goldFactTables +
                    silverGoldLayerCatalog.goldDimensions}
                </div>
                <div className="text-sm text-blue-200">Gold Tables</div>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/20">
                <div className="text-3xl font-bold">
                  {depositsUnifiedModelStats.semanticMeasures}
                </div>
                <div className="text-sm text-blue-200">Semantic Measures</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Layers className="h-6 w-6" />
            Data Architecture Flow
          </CardTitle>
          <CardDescription>
            Bronze → Silver → Gold → Semantic layer transformation pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-6 bg-white rounded-lg border-2 border-amber-300 shadow-md">
              <Badge className="bg-amber-600 text-white mb-3">Bronze</Badge>
              <div className="text-2xl font-bold text-amber-900 mb-2">
                {bronzeLayerCatalog.totalTables}
              </div>
              <div className="text-sm text-amber-700 mb-3">
                Raw, Immutable Tables
              </div>
              <div className="text-xs text-muted-foreground">
                {bronzeLayerCatalog.totalColumns} columns |{" "}
                {bronzeLayerCatalog.averageDailyVolume} daily
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border-2 border-zinc-400 shadow-md">
              <Badge className="bg-zinc-500 text-white mb-3">Silver</Badge>
              <div className="text-2xl font-bold text-zinc-900 mb-2">
                {silverGoldLayerCatalog.silverTables}
              </div>
              <div className="text-sm text-zinc-700 mb-3">
                Cleaned, Conformed
              </div>
              <div className="text-xs text-muted-foreground">
                {silverGoldLayerCatalog.silverColumns} columns | SCD2 entity
                resolution
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border-2 border-yellow-400 shadow-md">
              <Badge className="bg-yellow-500 text-black mb-3">Gold</Badge>
              <div className="text-2xl font-bold text-yellow-900 mb-2">
                {silverGoldLayerCatalog.goldFactTables +
                  silverGoldLayerCatalog.goldDimensions}
              </div>
              <div className="text-sm text-yellow-700 mb-3">
                Dimensional Model
              </div>
              <div className="text-xs text-muted-foreground">
                {silverGoldLayerCatalog.goldDimensions} dims |{" "}
                {silverGoldLayerCatalog.goldFactTables} facts |{" "}
                {silverGoldLayerCatalog.aggregationLevels.length} grain levels
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border-2 border-teal-400 shadow-md">
              <Badge className="bg-teal-500 text-white mb-3">Semantic</Badge>
              <div className="text-2xl font-bold text-teal-900 mb-2">
                {depositsUnifiedModelStats.semanticMeasures}
              </div>
              <div className="text-sm text-teal-700 mb-3">Business Layer</div>
              <div className="text-xs text-muted-foreground">
                BI-friendly measures and attributes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeLayer}
        onValueChange={setActiveLayer}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bronze">
            <Database className="h-4 w-4 mr-2" />
            Bronze Layer
          </TabsTrigger>
          <TabsTrigger value="silver">
            <GitBranch className="h-4 w-4 mr-2" />
            Silver Layer
          </TabsTrigger>
          <TabsTrigger value="gold">
            <TrendingUp className="h-4 w-4 mr-2" />
            Gold Layer
          </TabsTrigger>
          <TabsTrigger value="semantic">
            <FileCode className="h-4 w-4 mr-2" />
            Semantic Layer
          </TabsTrigger>
        </TabsList>

        {/* Bronze Layer Tab */}
        <TabsContent value="bronze" className="space-y-6 mt-6">
          {/* Bronze Layer Principles */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">
                Bronze Layer Architecture Principles
              </CardTitle>
              <CardDescription>
                Enterprise-grade design principles for raw data landing zone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(bronzeLayerPrinciples).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 bg-white rounded-lg border border-amber-200"
                  >
                    <div className="font-semibold text-amber-900 capitalize mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-sm text-gray-700">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bronze Catalog Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comprehensive Bronze Layer Catalog</CardTitle>
                  <CardDescription>
                    {bronzeLayerCatalog.totalTables} tables |{" "}
                    {bronzeLayerCatalog.totalColumns} total columns |{" "}
                    {bronzeLayerCatalog.averageDailyVolume} daily ingestion
                  </CardDescription>
                </div>
                <Button
                  onClick={() =>
                    exportToCSV("bronze_catalog_overview.csv", allBronzeTables)
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Catalog
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-amber-900">
                      {bronzeLayerCatalog.totalTables}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Tables
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-900">
                      {bronzeLayerCatalog.coreTransactionalTables}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transactional Tables
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-900">
                      {bronzeLayerCatalog.totalColumns}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Columns
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-900">
                      {bronzeLayerCatalog.retentionPeriod}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Retention Period
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Table Name",
                    accessor: (r: any) => (
                      <code className="text-xs bg-amber-100 px-2 py-1 rounded font-semibold">
                        {r.table_name}
                      </code>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                  {
                    header: "Source System",
                    accessor: (r: any) => (
                      <Badge variant="outline">{r.source_system}</Badge>
                    ),
                  },
                  {
                    header: "Ingestion",
                    accessor: (r: any) => (
                      <Badge variant="secondary" className="text-xs">
                        {r.ingestion_method}
                      </Badge>
                    ),
                  },
                  {
                    header: "Refresh",
                    accessor: (r: any) => (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {r.refresh_frequency}
                      </Badge>
                    ),
                  },
                  {
                    header: "Daily Volume",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.average_volume_daily}</span>
                    ),
                  },
                  {
                    header: "Columns",
                    accessor: (r: any) => r.schema?.length || "-",
                  },
                ]}
                data={allBronzeTables}
              />
            </CardContent>
          </Card>

          {/* Detailed Table Schemas */}
          <Card>
            <CardHeader>
              <CardTitle>Table 1: bronze.deposit_account_master_raw</CardTitle>
              <CardDescription>
                Comprehensive account master schema |{" "}
                {bronzeAccountMaster.schema.length} columns | CDC ingestion |{" "}
                {bronzeAccountMaster.average_volume_daily} daily updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">
                  Source: {bronzeAccountMaster.source_system}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {bronzeAccountMaster.ingestion_method}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {bronzeAccountMaster.refresh_frequency}
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {bronzeAccountMaster.partition_strategy}
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">
                  Data Quality Rules:
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {bronzeAccountMaster.data_quality_rules?.map((rule, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 bg-blue-50 rounded border border-blue-200"
                    >
                      • {rule}
                    </div>
                  ))}
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <div>
                        <code className="text-xs font-semibold">{r.field}</code>
                        {r.pii && (
                          <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                            PII
                          </Badge>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                        {r.length ? `(${r.length})` : ""}
                      </Badge>
                    ),
                  },
                  {
                    header: "Nullable",
                    accessor: (r: any) =>
                      !r.nullable ? (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          NOT NULL
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          nullable
                        </span>
                      ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={bronzeAccountMaster.schema}
              />
            </CardContent>
          </Card>

          {/* Account Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Table 2: bronze.deposit_transactions_raw</CardTitle>
              <CardDescription>
                All transaction activity |{" "}
                {bronzeAccountTransactions.schema.length} columns | Real-time
                streaming | {bronzeAccountTransactions.average_volume_daily}{" "}
                daily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">
                  Kafka Streaming
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {bronzeAccountTransactions.refresh_frequency}
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {bronzeAccountTransactions.partition_strategy}
                </Badge>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Required",
                    accessor: (r: any) =>
                      !r.nullable ? (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          NOT NULL
                        </Badge>
                      ) : (
                        <span className="text-xs">optional</span>
                      ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={bronzeAccountTransactions.schema}
              />
            </CardContent>
          </Card>

          {/* Daily Balances Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Table 3: bronze.deposit_account_balances_daily_raw
              </CardTitle>
              <CardDescription>
                End-of-day balance snapshots |{" "}
                {bronzeAccountBalances.schema.length} columns | Batch EOD |{" "}
                {bronzeAccountBalances.average_volume_daily} daily snapshots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Required",
                    accessor: (r: any) =>
                      !r.nullable ? (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          NOT NULL
                        </Badge>
                      ) : (
                        <span className="text-xs">optional</span>
                      ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={bronzeAccountBalances.schema}
              />
            </CardContent>
          </Card>

          {/* Interest Rates and CD Master in grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Table 4: Interest Rates
                </CardTitle>
                <CardDescription className="text-xs">
                  {bronzeInterestRates.schema.length} columns | Event-driven
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Type",
                      accessor: (r: any) => (
                        <Badge variant="outline" className="text-xs">
                          {r.datatype}
                        </Badge>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={bronzeInterestRates.schema}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Table 5: CD Master</CardTitle>
                <CardDescription className="text-xs">
                  {bronzeCDMaster.schema.length} columns | CDC Real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Type",
                      accessor: (r: any) => (
                        <Badge variant="outline" className="text-xs">
                          {r.datatype}
                        </Badge>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={bronzeCDMaster.schema}
                />
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive DDL */}
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive DDL: Account Master</CardTitle>
              <CardDescription>
                Production-ready CREATE TABLE with Delta Lake optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={bronzeAccountMaster.ddl}
                language="sql"
                filename="bronze_account_master_ddl.sql"
              />
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card>
            <CardHeader>
              <CardTitle>
                Sample Data: bronze.deposit_account_master_raw
              </CardTitle>
              <CardDescription>
                Representative production-like records with all mandatory fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "account_id",
                    accessor: (r: any) => (
                      <code className="text-xs">{r.account_id}</code>
                    ),
                  },
                  {
                    header: "account_number",
                    accessor: (r: any) => r.account_number,
                  },
                  {
                    header: "product",
                    accessor: (r: any) => <Badge>{r.product_code}</Badge>,
                  },
                  {
                    header: "status",
                    accessor: (r: any) => (
                      <Badge className="bg-green-100 text-green-800">
                        {r.account_status}
                      </Badge>
                    ),
                  },
                  {
                    header: "interest_rate",
                    accessor: (r: any) => `${r.current_interest_rate}%`,
                  },
                  {
                    header: "LCR Class",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.lcr_classification}
                      </Badge>
                    ),
                  },
                  {
                    header: "NSFR ASF",
                    accessor: (r: any) => r.nsfr_asf_factor,
                  },
                  { header: "channel", accessor: (r: any) => r.channel_opened },
                  {
                    header: "ingestion_ts",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.ingestion_timestamp}</span>
                    ),
                  },
                ]}
                data={bronzeAccountMaster.sample_data}
              />
            </CardContent>
          </Card>

          {/* Data Quality Framework */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Data Quality Framework
              </CardTitle>
              <CardDescription>
                Enterprise-grade data quality checks and validation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(bronzeLayerCatalog.dataQualityFramework).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="p-4 bg-white rounded-lg border border-blue-200"
                    >
                      <div className="font-semibold text-blue-900 capitalize mb-2">
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div className="text-sm text-gray-700">{value}</div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monitoring & Alerting */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">
                Monitoring & Alerting Framework
              </CardTitle>
              <CardDescription>
                Production monitoring and SLA management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(bronzeLayerCatalog.monitoringAndAlerting).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="p-4 bg-white rounded-lg border border-green-200"
                    >
                      <div className="font-semibold text-green-900 capitalize mb-2">
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div className="text-sm text-gray-700">{value}</div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ingestion Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Ingestion Patterns by Table Type</CardTitle>
              <CardDescription>
                Optimized ingestion strategies for different data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(bronzeLayerCatalog.ingestionPatterns).map(
                  ([pattern, tables]) => (
                    <div key={pattern} className="p-4 border rounded-lg">
                      <div className="font-semibold mb-3 capitalize flex items-center gap-2">
                        <Badge
                          className={
                            pattern === "realTimeCDC"
                              ? "bg-red-100 text-red-800"
                              : pattern === "batchEOD"
                                ? "bg-blue-100 text-blue-800"
                                : pattern === "eventDriven"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                          }
                        >
                          {pattern.replace(/([A-Z])/g, " $1")}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {tables.map((table: string) => (
                          <div key={table} className="text-sm text-gray-700">
                            • {table}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Silver Layer Tab */}
        <TabsContent value="silver" className="space-y-6 mt-6">
          {/* Silver Principles */}
          <Card className="bg-gradient-to-br from-zinc-50 to-slate-50 border-zinc-300">
            <CardHeader>
              <CardTitle className="text-zinc-900">
                Silver Layer Principles
              </CardTitle>
              <CardDescription>
                Enterprise data quality and entity resolution framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(silverLayerPrinciples).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 bg-white rounded-lg border border-zinc-300"
                  >
                    <div className="font-semibold text-zinc-900 capitalize mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-sm text-gray-700">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Silver Catalog */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Silver Layer Catalog</CardTitle>
                  <CardDescription>
                    {silverGoldLayerCatalog.silverTables} tables |{" "}
                    {silverGoldLayerCatalog.silverColumns} columns | Complete
                    transformation lineage
                  </CardDescription>
                </div>
                <Button
                  onClick={() =>
                    exportToCSV(
                      "silver_transformations.csv",
                      silverGoldLayerCatalog.silverTransformations.map(
                        (t, i) => ({ step: i + 1, transformation: t }),
                      ),
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Transformations
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-zinc-900">
                      {silverGoldLayerCatalog.silverTables}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Silver Tables
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-900">
                      {silverGoldLayerCatalog.silverColumns}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Columns
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-900">
                      {silverGoldLayerCatalog.silverTransformations.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transformation Types
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="font-semibold">Transformation Pipeline:</h4>
                {silverGoldLayerCatalog.silverTransformations.map(
                  (transform, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border"
                    >
                      <Badge className="bg-zinc-600 text-white">
                        {idx + 1}
                      </Badge>
                      <span className="text-sm">{transform}</span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Silver Table 1: Account Master Golden */}
          <Card>
            <CardHeader>
              <CardTitle>
                Table 1: silver.account_master_golden (SCD Type 2)
              </CardTitle>
              <CardDescription>
                Golden account record with comprehensive attributes |{" "}
                {silverAccountMasterGolden.schema.length} columns | Real-time
                CDC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-purple-100 text-purple-800">
                  SCD Type 2
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Entity Resolution
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Data Quality Score
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {silverAccountMasterGolden.update_frequency}
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">
                  Data Quality Rules (
                  {silverAccountMasterGolden.data_quality_rules.length}):
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {silverAccountMasterGolden.data_quality_rules.map(
                    (rule, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-green-50 rounded border border-green-200"
                      >
                        ✓ {rule}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <div>
                        <code className="text-xs font-semibold">{r.field}</code>
                        {r.primary_key && (
                          <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                            PK
                          </Badge>
                        )}
                        {r.business_key && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                            BK
                          </Badge>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={silverAccountMasterGolden.schema.slice(0, 30)}
              />

              <div className="mt-4 text-sm text-muted-foreground">
                Showing first 30 of {silverAccountMasterGolden.schema.length}{" "}
                columns. Full schema includes SCD2 versioning, regulatory
                classifications, and behavioral metrics.
              </div>
            </CardContent>
          </Card>

          {/* Silver Table 2: Transaction Master */}
          <Card>
            <CardHeader>
              <CardTitle>Table 2: silver.transaction_master</CardTitle>
              <CardDescription>
                Cleansed transactions with enrichments |{" "}
                {silverTransactionMaster.schema.length} columns | Fraud scoring
                & merchant categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={silverTransactionMaster.schema}
              />
            </CardContent>
          </Card>

          {/* Silver Table 3: Daily Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Table 3: silver.daily_balance_snapshots</CardTitle>
              <CardDescription>
                Enriched daily positions | {silverDailyBalances.schema.length}{" "}
                columns | Derived metrics & tier classifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={silverDailyBalances.schema}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SCD Type 2 Implementation SQL</CardTitle>
              <CardDescription>
                Slowly Changing Dimension logic for attribute history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={silverSCD2SQL}
                language="sql"
                filename="silver_scd2_merge.sql"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Sample Data: silver.account_master_conformed
              </CardTitle>
              <CardDescription>
                Cleansed and conformed account records with SCD2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: "account_id", accessor: (r: any) => r.account_id },
                  {
                    header: "customer_ger_key",
                    accessor: (r: any) => (
                      <code className="text-xs">{r.customer_ger_key}</code>
                    ),
                  },
                  {
                    header: "product_type",
                    accessor: (r: any) => <Badge>{r.product_type}</Badge>,
                  },
                  {
                    header: "status",
                    accessor: (r: any) => (
                      <Badge className="bg-green-100 text-green-800">
                        {r.account_status_code}
                      </Badge>
                    ),
                  },
                  {
                    header: "effective_start",
                    accessor: (r: any) => r.effective_start_timestamp,
                  },
                  {
                    header: "effective_end",
                    accessor: (r: any) => r.effective_end_timestamp,
                  },
                  {
                    header: "is_current",
                    accessor: (r: any) =>
                      r.is_current ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          Current
                        </Badge>
                      ) : (
                        <Badge variant="outline">Historical</Badge>
                      ),
                  },
                ]}
                data={silverSampleAccountMaster}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gold Layer Tab */}
        <TabsContent value="gold" className="space-y-6 mt-6">
          {/* Gold Principles */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300">
            <CardHeader>
              <CardTitle className="text-yellow-900">
                Gold Layer Principles
              </CardTitle>
              <CardDescription>
                Multi-grain dimensional modeling for analytics, reporting, and
                data science
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(goldLayerPrinciples).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 bg-white rounded-lg border border-yellow-300"
                  >
                    <div className="font-semibold text-yellow-900 capitalize mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-sm text-gray-700">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gold Catalog Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Gold Layer Dimensional Model</CardTitle>
              <CardDescription>
                {silverGoldLayerCatalog.goldDimensions} dimensions |{" "}
                {silverGoldLayerCatalog.goldFactTables} fact tables |{" "}
                {silverGoldLayerCatalog.aggregationLevels.length} grain levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-900">
                      {silverGoldLayerCatalog.goldDimensions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dimensions
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-900">
                      {silverGoldLayerCatalog.goldFactTables}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fact Tables
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-900">
                      {silverGoldLayerCatalog.factColumns}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fact Columns
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-900">
                      {silverGoldLayerCatalog.aggregationLevels.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Grain Levels
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fact Table Types */}
              <div>
                <h4 className="font-semibold mb-3">Fact Table Types:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(silverGoldLayerCatalog.factTypes).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold capitalize">
                            {type.replace(/([A-Z])/g, " $1")}
                          </span>
                          <Badge className="bg-green-600 text-white">
                            {count} tables
                          </Badge>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Aggregation Levels */}
              <div>
                <h4 className="font-semibold mb-3">
                  Supported Aggregation Grains:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {silverGoldLayerCatalog.aggregationLevels.map((level) => (
                    <Badge
                      key={level}
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h4 className="font-semibold mb-3">Supported Use Cases:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(silverGoldLayerCatalog.useCases).map(
                    ([useCase, description]) => (
                      <div
                        key={useCase}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="font-semibold text-sm text-blue-900 mb-1 capitalize">
                          {useCase.replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="text-xs text-gray-700">
                          {description}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions Catalog */}
          <Card>
            <CardHeader>
              <CardTitle>
                Conformed Dimensions ({goldDimensions.length})
              </CardTitle>
              <CardDescription>
                Type 2 SCD dimensions with hierarchies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "Table Name",
                    accessor: (r: any) => (
                      <code className="text-xs bg-blue-100 px-2 py-1 rounded font-semibold">
                        {r.table_name}
                      </code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge className="bg-blue-100 text-blue-800">
                        {r.type}
                      </Badge>
                    ),
                  },
                  {
                    header: "Grain",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.grain}</span>
                    ),
                  },
                  { header: "Row Count", accessor: (r: any) => r.row_count },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={goldDimensions}
              />
            </CardContent>
          </Card>

          {/* Fact Table 1: Transaction Grain */}
          <Card>
            <CardHeader>
              <CardTitle>
                Fact Table 1: gold.fact_deposit_transactions (Atomic Grain)
              </CardTitle>
              <CardDescription>
                Transaction-level facts | {goldFactTransactions.schema.length}{" "}
                columns | {goldFactTransactions.daily_volume} daily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-green-100 text-green-800">
                  Transaction Fact
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {goldFactTransactions.fact_type}
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {goldFactTransactions.daily_volume} rows/day
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">
                  Key Measures ({goldFactTransactions.measures.length}):
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {goldFactTransactions.measures.map((measure) => (
                    <div
                      key={measure.measure}
                      className="text-xs p-2 bg-green-50 rounded border border-green-200"
                    >
                      <strong>{measure.measure}</strong> ({measure.aggregation})
                      - {measure.description}
                    </div>
                  ))}
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={goldFactTransactions.schema}
              />
            </CardContent>
          </Card>

          {/* Fact Table 2: Daily Positions */}
          <Card>
            <CardHeader>
              <CardTitle>
                Fact Table 2: gold.fact_daily_account_positions (Daily Snapshot)
              </CardTitle>
              <CardDescription>
                Daily account positions | {goldFactDailyPositions.schema.length}{" "}
                columns | Rolling 7D/30D/90D metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-purple-100 text-purple-800">
                  Periodic Snapshot
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {goldFactDailyPositions.fact_type}
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {goldFactDailyPositions.daily_volume} rows/day
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">
                  Measure Categories:
                </h4>
                <div className="grid md:grid-cols-3 gap-2">
                  <div className="p-2 bg-blue-50 rounded border">
                    <div className="font-semibold text-xs">Balance Metrics</div>
                    <div className="text-xs text-gray-600">
                      EOD, Available, Ledger, Collected, Float
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 rounded border">
                    <div className="font-semibold text-xs">
                      Activity Metrics
                    </div>
                    <div className="text-xs text-gray-600">
                      Daily deposits, withdrawals, transactions
                    </div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded border">
                    <div className="font-semibold text-xs">
                      Rolling Averages
                    </div>
                    <div className="text-xs text-gray-600">
                      7D, 30D, 90D, MTD, QTD, YTD ADB
                    </div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded border">
                    <div className="font-semibold text-xs">
                      Interest Metrics
                    </div>
                    <div className="text-xs text-gray-600">
                      Daily accrual, MTD, YTD interest
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded border">
                    <div className="font-semibold text-xs">
                      Behavioral Metrics
                    </div>
                    <div className="text-xs text-gray-600">
                      Volatility, trends, percentiles
                    </div>
                  </div>
                  <div className="p-2 bg-red-50 rounded border">
                    <div className="font-semibold text-xs">
                      Regulatory Metrics
                    </div>
                    <div className="text-xs text-gray-600">
                      FDIC, LCR, NSFR classifications
                    </div>
                  </div>
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={goldFactDailyPositions.schema.slice(0, 35)}
              />

              <div className="mt-4 text-sm text-muted-foreground">
                Showing first 35 of {goldFactDailyPositions.schema.length}{" "}
                columns. Includes comprehensive balance, activity, interest, and
                regulatory metrics.
              </div>
            </CardContent>
          </Card>

          {/* Fact Table 3: Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                Fact Table 3: gold.fact_monthly_account_summary (Pre-Aggregated)
              </CardTitle>
              <CardDescription>
                Monthly aggregations |{" "}
                {goldFactMonthlyAccountSummary.schema.length} columns |
                Performance-optimized for dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">
                  Monthly Snapshot
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Pre-Aggregated
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  Dashboard Optimized
                </Badge>
              </div>

              <DataTable
                columns={[
                  {
                    header: "Field",
                    accessor: (r: any) => (
                      <code className="text-xs font-semibold">{r.field}</code>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (r: any) => (
                      <Badge variant="outline" className="text-xs">
                        {r.datatype}
                      </Badge>
                    ),
                  },
                  {
                    header: "Description",
                    accessor: (r: any) => (
                      <span className="text-xs">{r.description}</span>
                    ),
                  },
                ]}
                data={goldFactMonthlyAccountSummary.schema}
              />
            </CardContent>
          </Card>

          {/* Remaining fact tables in grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fact Table 4: Customer Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Fact Table 4: Customer Deposits
                </CardTitle>
                <CardDescription className="text-xs">
                  Customer-level aggregation |{" "}
                  {goldFactCustomerDeposits.schema.length} columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1">
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    Customer Grain
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Portfolio metrics, product mix, revenue, profitability,
                    engagement
                  </div>
                </div>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={goldFactCustomerDeposits.schema.slice(0, 15)}
                />
              </CardContent>
            </Card>

            {/* Fact Table 5: Product Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Fact Table 5: Product Performance
                </CardTitle>
                <CardDescription className="text-xs">
                  Product-level KPIs |{" "}
                  {goldFactProductPerformance.schema.length} columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Product Grain
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Growth, profitability, NPS, churn, revenue per account
                  </div>
                </div>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={goldFactProductPerformance.schema.slice(0, 15)}
                />
              </CardContent>
            </Card>

            {/* Fact Table 6: Cohort Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Fact Table 6: Cohort Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  Vintage analysis | {goldFactCohortAnalysis.schema.length}{" "}
                  columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1">
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    Cohort Grain
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Retention curves, balance growth, LTV by opening cohort
                  </div>
                </div>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={goldFactCohortAnalysis.schema}
                />
              </CardContent>
            </Card>

            {/* Fact Table 7: Regulatory Reporting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Fact Table 7: Regulatory Reporting
                </CardTitle>
                <CardDescription className="text-xs">
                  LCR, NSFR, FDIC | {goldFactRegulatoryReporting.schema.length}{" "}
                  columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1">
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Regulatory Grain
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Basel III LCR/NSFR, FDIC insurance, balance sheet
                    classification
                  </div>
                </div>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={goldFactRegulatoryReporting.schema.slice(0, 12)}
                />
              </CardContent>
            </Card>

            {/* Fact Table 8: ML Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Fact Table 8: ML Feature Store
                </CardTitle>
                <CardDescription className="text-xs">
                  Data Science features | {goldFactMLFeatures.schema.length}{" "}
                  columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-1">
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                    ML/DS Grain
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Engineered features for churn, cross-sell, balance
                    prediction
                  </div>
                </div>
                <DataTable
                  columns={[
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={goldFactMLFeatures.schema.slice(0, 15)}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gold Layer Star Schema DDL</CardTitle>
              <CardDescription>
                Dimensional model CREATE TABLE statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={goldStarSchemaDDL}
                language="sql"
                filename="gold_star_schema.sql"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data: gold.fact_deposit_positions</CardTitle>
              <CardDescription>Daily balance snapshots</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "position_key",
                    accessor: (r: any) => (
                      <code className="text-xs">{r.position_key}</code>
                    ),
                  },
                  { header: "as_of_date", accessor: (r: any) => r.as_of_date },
                  {
                    header: "account_key",
                    accessor: (r: any) => r.account_key,
                  },
                  {
                    header: "product_key",
                    accessor: (r: any) => (
                      <Badge variant="secondary">{r.product_key}</Badge>
                    ),
                  },
                  {
                    header: "eod_balance",
                    accessor: (r: any) => `$${r.eod_balance.toLocaleString()}`,
                  },
                  {
                    header: "interest_rate",
                    accessor: (r: any) => `${r.interest_rate}%`,
                  },
                  {
                    header: "daily_accrual",
                    accessor: (r: any) =>
                      `$${r.daily_interest_accrual.toFixed(2)}`,
                  },
                  {
                    header: "adb_mtd",
                    accessor: (r: any) => `$${r.adb_mtd.toLocaleString()}`,
                  },
                ]}
                data={goldSampleDepositPositions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semantic Layer Tab */}
        <TabsContent value="semantic" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Measures</CardTitle>
                    <CardDescription>
                      {semanticDepositsLayer.measures.length} BI-friendly
                      metrics
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() =>
                      exportToCSV(
                        "semantic_measures.csv",
                        semanticDepositsLayer.measures,
                      )
                    }
                  >
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    {
                      header: "Business Name",
                      accessor: (r: any) => <strong>{r.name}</strong>,
                    },
                    {
                      header: "Technical Name",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.technical_name}</code>
                      ),
                    },
                    {
                      header: "Aggregation",
                      accessor: (r: any) => (
                        <Badge variant="secondary">{r.aggregation}</Badge>
                      ),
                    },
                    {
                      header: "Format",
                      accessor: (r: any) => (
                        <Badge variant="outline">{r.format}</Badge>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={semanticDepositsLayer.measures}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Attributes</CardTitle>
                    <CardDescription>
                      {semanticDepositsLayer.attributes.length} dimension
                      attributes
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() =>
                      exportToCSV(
                        "semantic_attributes.csv",
                        semanticDepositsLayer.attributes,
                      )
                    }
                  >
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    {
                      header: "Business Name",
                      accessor: (r: any) => <strong>{r.name}</strong>,
                    },
                    {
                      header: "Technical Name",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.technical_name}</code>
                      ),
                    },
                    {
                      header: "Field",
                      accessor: (r: any) => (
                        <code className="text-xs">{r.field}</code>
                      ),
                    },
                    {
                      header: "Description",
                      accessor: (r: any) => (
                        <span className="text-xs">{r.description}</span>
                      ),
                    },
                  ]}
                  data={semanticDepositsLayer.attributes}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Metric Calculations</CardTitle>
              <CardDescription>
                Advanced analytical metric SQL definitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Cost of Funds (CoF)</h4>
                <CodeBlock
                  code={keyMetricSQL.costOfFunds}
                  language="sql"
                  filename="metric_cost_of_funds.sql"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Deposit Beta Coefficient</h4>
                <CodeBlock
                  code={keyMetricSQL.depositBeta}
                  language="sql"
                  filename="metric_deposit_beta.sql"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">LCR Operational Deposits</h4>
                <CodeBlock
                  code={keyMetricSQL.lcrOperationalDeposits}
                  language="sql"
                  filename="metric_lcr_operational.sql"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
