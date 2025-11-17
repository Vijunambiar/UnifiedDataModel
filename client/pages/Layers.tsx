import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable, { type ColumnDef } from "@/components/DataTable";
import CodeBlock from "@/components/CodeBlock";
import {
  bronzeDDL_SQL,
  bronzeRetailTransactionsFields,
  eclSQL,
  goldFactDailyPositionColumns,
  goldStarSchema_SQL,
  goldDimCustomerColumns,
  sampleBronzeTransactions,
  sampleDimCustomerConformed,
  sampleFactDailyPosition,
  semanticDictionary,
  semanticFriendlyNames,
  silverCustomerSourceToTarget,
  silverSCD2_SQL,
  sampleGoldenCustomersSCD2,
  goldMetricsCatalog,
  type RetailTransactionRaw,
  type DimCustomerConformed,
  type FactDailyPosition,
  type MetricDef,
} from "@/lib/blueprint";
import { silverTablesCatalog, silverTablesGrouped, silverTableNames } from "@/lib/silver-tables";
import { exportToCSV, exportToXLSX } from "@/lib/export";

function ConsolidatedMetrics() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<string>("all");
  const domains = useMemo(() => Array.from(new Set(goldMetricsCatalog.map(m => m.domain))).sort(), []);
  const filtered = useMemo(() => goldMetricsCatalog.filter(m => {
    const okDomain = domain === "all" || m.domain === domain;
    const s = q.trim().toLowerCase();
    const okSearch = !s || m.name.toLowerCase().includes(s) || m.technical_name.toLowerCase().includes(s) || m.definition.toLowerCase().includes(s);
    return okDomain && okSearch;
  }), [q, domain]);
  const rows = filtered;
  const cols: ColumnDef<MetricDef>[] = [
    { header: "Domain", accessor: r => r.domain },
    { header: "Subdomain", accessor: r => r.subdomain },
    { header: "Metric", accessor: r => r.name },
    { header: "Type", accessor: r => r.metric_type },
    { header: "Technical", accessor: r => r.technical_name },
    { header: "Data Type", accessor: r => r.data_type },
    { header: "Grain", accessor: r => r.grain },
    { header: "Agg", accessor: r => r.aggregation },
    { header: "Silver Table", accessor: r => r.source_silver_table },
    { header: "Silver Column", accessor: r => r.source_silver_column },
    { header: "Gold Table", accessor: r => r.source_gold_table },
    { header: "Gold Column", accessor: r => r.source_gold_column },
    { header: "Definition", accessor: r => r.definition },
  ];
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">{rows.length} metrics across {domains.length}+ domains</div>
        <div className="flex gap-2 w-full md:w-auto">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search metrics..." className="w-full md:w-64 h-10 px-3 rounded-md border bg-background" />
          <select value={domain} onChange={e => setDomain(e.target.value)} className="h-10 px-3 rounded-md border bg-background">
            <option value="all">All domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button onClick={() => exportToXLSX("gold_metrics_catalog.xlsx", [{ name: "Metrics", data: rows }])}>Export XLSX</Button>
          <Button variant="outline" onClick={() => exportToCSV("gold_metrics_catalog.csv", rows)}>Export CSV</Button>
        </div>
      </div>
      <div className="border rounded-md overflow-hidden">
        <DataTable columns={cols} data={rows} />
      </div>
    </div>
  );
}

export default function Index() {
  const bronzeCols: ColumnDef<RetailTransactionRaw>[] = useMemo(
    () => [
      { header: "transaction_id", accessor: (r) => r.transaction_id },
      { header: "account_id", accessor: (r) => r.account_id },
      { header: "customer_id", accessor: (r) => r.customer_id },
      { header: "amount", accessor: (r) => r.amount },
      { header: "currency", accessor: (r) => r.currency },
      { header: "type", accessor: (r) => r.transaction_type },
      { header: "merchant", accessor: (r) => r.merchant_name },
      { header: "mcc", accessor: (r) => r.merchant_category_code },
      { header: "txn_ts", accessor: (r) => r.transaction_timestamp },
      { header: "source_system_id", accessor: (r) => r.source_system_id },
      { header: "ingestion_ts", accessor: (r) => r.ingestion_timestamp },
      { header: "record_hash", accessor: (r) => r.record_hash },
    ],
    [],
  );

  const dimCustomerCols: ColumnDef<DimCustomerConformed>[] = [
    { header: "customer_sk", accessor: (r) => r.customer_sk },
    { header: "customer_ger_key", accessor: (r) => r.customer_ger_key },
    { header: "full_name", accessor: (r) => r.full_name },
    { header: "birth_year", accessor: (r) => r.birth_year },
    { header: "country", accessor: (r) => r.country },
    { header: "kyc_status", accessor: (r) => r.kyc_status },
    { header: "current_flag", accessor: (r) => r.current_flag },
  ];

  const factCols: ColumnDef<FactDailyPosition>[] = [
    { header: "as_of_date", accessor: (r) => r.as_of_date },
    { header: "account_id", accessor: (r) => r.account_id },
    { header: "product_type", accessor: (r) => r.product_type },
    { header: "customer_ger_key", accessor: (r) => r.customer_ger_key },
    { header: "eod_balance", accessor: (r) => r.eod_balance },
    { header: "currency", accessor: (r) => r.currency },
    { header: "pd", accessor: (r) => r.pd },
    { header: "lgd", accessor: (r) => r.lgd },
    { header: "ecl", accessor: (r) => r.ecl },
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-400/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gradient-to-br from-gray-300/10 to-slate-500/10 blur-3xl" />
        <div className="relative">
          <Badge className="bg-amber-500 text-black">Banking Platform Blueprint</Badge>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
            Bronze → Silver → Gold → Semantic Layer Architecture
          </h1>
          <p className="mt-4 max-w-3xl text-slate-200">
            A complete, end-to-end blueprint for a modern banking data platform: raw landing, conformance with SCD2, dimensional modeling, metrics, and a semantic layer. Includes source-to-target mappings, metric definitions, SQL, and exportable sample data.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge className="bg-amber-600 text-black">Bronze</Badge>
            <Badge className="bg-zinc-300 text-black">Silver</Badge>
            <Badge className="bg-yellow-500 text-black">Gold</Badge>
            <Badge variant="secondary" className="bg-teal-400 text-black">Semantic</Badge>
          </div>
        </div>
      </section>

      <section id="layers">
        <Tabs defaultValue="bronze" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="bronze">Bronze</TabsTrigger>
            <TabsTrigger value="silver">Silver</TabsTrigger>
            <TabsTrigger value="gold">Gold</TabsTrigger>
            <TabsTrigger value="semantic">Semantic</TabsTrigger>
          </TabsList>

          <TabsContent value="bronze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bronze Layer — Raw & Immutable</CardTitle>
                <CardDescription>Function: Raw landing zone capturing initial schema and technical metadata. Mandatory fields: source_system_id, ingestion_timestamp, record_hash.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">Ingestion Fields — Retail Transactions</h3>
                  <DataTable
                    columns={[
                      { header: "Field", accessor: (r: any) => r.field },
                      { header: "Datatype", accessor: (r: any) => r.datatype },
                      { header: "Description", accessor: (r: any) => r.description },
                    ]}
                    data={bronzeRetailTransactionsFields as any}
                  />
                  <div className="mt-3 flex gap-2" id="exports">
                    <Button onClick={() => exportToCSV("bronze_retail_transactions_fields.csv", bronzeRetailTransactionsFields)}>Export CSV</Button>
                    <Button variant="outline" onClick={() => exportToXLSX("bronze_retail_transactions_fields.xlsx", [{ name: "Fields", data: bronzeRetailTransactionsFields }])}>Export XLSX</Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-2 font-semibold">Sample Data — bronze.retail_transactions</h3>
                    <DataTable columns={bronzeCols} data={sampleBronzeTransactions} />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("bronze_retail_transactions_sample.csv", sampleBronzeTransactions)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("bronze_retail_transactions_sample.xlsx", sampleBronzeTransactions)}>Export XLSX</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">SQL — Bronze DDL</h3>
                    <CodeBlock code={bronzeDDL_SQL} language="sql" filename="bronze_ddl.sql" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="silver" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Silver Layer — Cleaned & Conformed</CardTitle>
                <CardDescription>Function: Validation, standardization, entity resolution. Golden Customer with SCD Type 2 for address history. Mandatory: KYC status and Global Entity Resolution keys.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-2 font-semibold">Source → Target Mapping — Customer</h3>
                    <DataTable
                      columns={[
                        { header: "Source", accessor: (r: any) => r.source_field },
                        { header: "Target", accessor: (r: any) => r.target_field },
                        { header: "Rule", accessor: (r: any) => r.rule },
                      ]}
                      data={silverCustomerSourceToTarget as any}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("silver_customer_source_to_target.csv", silverCustomerSourceToTarget as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("silver_customer_source_to_target.xlsx", [{ name: "Mapping", data: silverCustomerSourceToTarget as any }])}>Export XLSX</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">SQL — SCD Type 2 Merge</h3>
                    <CodeBlock code={silverSCD2_SQL} language="sql" filename="silver_scd2.sql" />
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Golden Customer (SCD2) — Sample</h3>
                  <DataTable
                    columns={[
                      { header: "customer_ger_key", accessor: (r: any) => r.customer_ger_key },
                      { header: "source_customer_id", accessor: (r: any) => r.source_customer_id },
                      { header: "full_name", accessor: (r: any) => r.full_name },
                      { header: "kyc_status", accessor: (r: any) => r.kyc_status },
                      { header: "address_line1", accessor: (r: any) => r.address_line1 },
                      { header: "city", accessor: (r: any) => r.city },
                      { header: "state", accessor: (r: any) => r.state },
                      { header: "effective_start_ts", accessor: (r: any) => r.effective_start_ts },
                      { header: "effective_end_ts", accessor: (r: any) => r.effective_end_ts },
                      { header: "is_current", accessor: (r: any) => r.is_current },
                    ]}
                    data={sampleGoldenCustomersSCD2 as any}
                  />
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => exportToCSV("silver_golden_customer_sample.csv", sampleGoldenCustomersSCD2 as any)}>Export CSV</Button>
                    <Button variant="outline" onClick={() => exportToXLSX("silver_golden_customer_sample.xlsx", sampleGoldenCustomersSCD2 as any)}>Export XLSX</Button>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-2 font-semibold">Silver Layer Table Catalog</h3>
                  <p className="text-sm text-muted-foreground mb-4">{silverTableNames.length} tables with complete column definitions, source mappings, and transformation logic</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {silverTableNames.map(tableName => (
                      <Badge key={tableName} variant="secondary" className="text-xs">{tableName}</Badge>
                    ))}
                  </div>
                  <DataTable
                    columns={[
                      { header: "Table", accessor: (r: any) => r.table_name },
                      { header: "Column", accessor: (r: any) => r.column_name },
                      { header: "Data Type", accessor: (r: any) => r.data_type },
                      { header: "Description", accessor: (r: any) => r.description },
                      { header: "Source Bronze Table", accessor: (r: any) => r.source_bronze_table },
                      { header: "Source Bronze Column", accessor: (r: any) => r.source_bronze_column },
                      { header: "Transformation Logic", accessor: (r: any) => r.transformation_logic },
                    ]}
                    data={silverTablesCatalog}
                  />
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => exportToCSV("silver_tables_catalog.csv", silverTablesCatalog)}>Export All Tables CSV</Button>
                    <Button variant="outline" onClick={() => {
                      const sheets = silverTableNames.map(tableName => ({
                        name: tableName.replace("silver.", ""),
                        data: silverTablesGrouped[tableName]
                      }));
                      exportToXLSX("silver_tables_catalog.xlsx", sheets);
                    }}>Export All Tables XLSX (Multi-Sheet)</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gold" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gold Layer — Dimensional Modeling & Metrics</CardTitle>
                <CardDescription>Function: Curated star schema optimized for analytics. Includes Dim_Customer_Conformed and Fact_Daily_Position with ECL metric.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-2 font-semibold">Dim_Customer_Conformed — Columns</h3>
                    <DataTable
                      columns={[
                        { header: "Column", accessor: (r: any) => r.column },
                        { header: "Datatype", accessor: (r: any) => r.datatype },
                        { header: "Description", accessor: (r: any) => r.description },
                      ]}
                      data={goldDimCustomerColumns as any}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("gold_dim_customer_columns.csv", goldDimCustomerColumns as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("gold_dim_customer_columns.xlsx", [{ name: "Columns", data: goldDimCustomerColumns as any }])}>Export XLSX</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Fact_Daily_Position — Columns</h3>
                    <DataTable
                      columns={[
                        { header: "Column", accessor: (r: any) => r.column },
                        { header: "Datatype", accessor: (r: any) => r.datatype },
                        { header: "Description", accessor: (r: any) => r.description },
                      ]}
                      data={goldFactDailyPositionColumns as any}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("gold_fact_daily_position_columns.csv", goldFactDailyPositionColumns as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("gold_fact_daily_position_columns.xlsx", [{ name: "Columns", data: goldFactDailyPositionColumns as any }])}>Export XLSX</Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-2 font-semibold">Sample — Dim_Customer_Conformed</h3>
                    <DataTable columns={dimCustomerCols} data={sampleDimCustomerConformed} />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("gold_dim_customer_sample.csv", sampleDimCustomerConformed as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("gold_dim_customer_sample.xlsx", sampleDimCustomerConformed as any)}>Export XLSX</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Sample — Fact_Daily_Position</h3>
                    <DataTable columns={factCols} data={sampleFactDailyPosition} />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("gold_fact_daily_position_sample.csv", sampleFactDailyPosition as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("gold_fact_daily_position_sample.xlsx", sampleFactDailyPosition as any)}>Export XLSX</Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-2 font-semibold">SQL — Star Schema DDL</h3>
                    <CodeBlock code={goldStarSchema_SQL} language="sql" filename="gold_star_schema.sql" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">SQL — Expected Credit Loss (ECL)</h3>
                    <CodeBlock code={eclSQL} language="sql" filename="metric_ecl.sql" />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-2 font-semibold">Consolidated Metrics Catalog</h3>
                  <ConsolidatedMetrics />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semantic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Layer — Business Access</CardTitle>
                <CardDescription>Function: Abstraction for BI tools with business-friendly measures and attributes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-2 font-semibold">Measures</h3>
                    <DataTable
                      columns={[
                        { header: "Business Name", accessor: (r: any) => r.name },
                        { header: "Field", accessor: (r: any) => r.technical_name },
                        { header: "Aggregation", accessor: (r: any) => r.aggregation },
                        { header: "Format", accessor: (r: any) => r.format },
                        { header: "Description", accessor: (r: any) => r.description },
                      ]}
                      data={semanticDictionary.measures as any}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("semantic_measures.csv", semanticDictionary.measures as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("semantic_measures.xlsx", [{ name: "Measures", data: semanticDictionary.measures as any }])}>Export XLSX</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Attributes</h3>
                    <DataTable
                      columns={[
                        { header: "Business Name", accessor: (r: any) => r.name ?? r.business_name },
                        { header: "Field", accessor: (r: any) => r.technical_name ?? r.field },
                        { header: "Description", accessor: (r: any) => r.description ?? r.notes },
                      ]}
                      data={semanticDictionary.attributes as any}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => exportToCSV("semantic_attributes.csv", semanticDictionary.attributes as any)}>Export CSV</Button>
                      <Button variant="outline" onClick={() => exportToXLSX("semantic_attributes.xlsx", [{ name: "Attributes", data: semanticDictionary.attributes as any }])}>Export XLSX</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Friendly Names Mapping</h3>
                  <DataTable
                    columns={[
                      { header: "Business Name", accessor: (r: any) => r.business_name },
                      { header: "Dataset", accessor: (r: any) => r.dataset },
                      { header: "Field", accessor: (r: any) => r.field },
                      { header: "Notes", accessor: (r: any) => r.notes },
                    ]}
                    data={semanticFriendlyNames as any}
                  />
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => exportToCSV("semantic_friendly_names.csv", semanticFriendlyNames as any)}>Export CSV</Button>
                    <Button variant="outline" onClick={() => exportToXLSX("semantic_friendly_names.xlsx", [{ name: "Friendly Names", data: semanticFriendlyNames as any }])}>Export XLSX</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
